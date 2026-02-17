'use server'

import { calculateFare, getPricingRules } from '@/utils/pricing'
import { stripe } from '@/utils/stripe/server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Client, TravelMode, UnitSystem } from "@googlemaps/google-maps-services-js"
import { getSystemDistanceUnit } from '@/app/admin/actions'
import { sendAdminNewBookingEmail } from '@/utils/notifications'

const googleMapsClient = new Client({});

export async function getVehicleTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('vehicle_types').select('*').order('base_fare_usd', { ascending: true })
  
  if (error) {
    console.error('Error fetching vehicle types:', error)
    return []
  }
  return data
}

export async function getQuoteAction(data: {
  serviceType: string
  pickupLocation: string
  dropoffLocation: string
  pickupCoordinates?: { lat: number; lng: number } | null
  dropoffCoordinates?: { lat: number; lng: number } | null
  date: string
  time: string
  vehicleTypeId: string
  meetAndGreet?: boolean
  hours?: number
}) {
  console.log('--- Quote Request ---')
  console.log('Service:', data.serviceType)
  console.log('From:', data.pickupLocation)
  console.log('To:', data.dropoffLocation)
  if (data.pickupCoordinates) console.log('Pickup Coords:', data.pickupCoordinates)
  if (data.dropoffCoordinates) console.log('Dropoff Coords:', data.dropoffCoordinates)

  let distanceKm = 0
  let durationMinutes = 0

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (apiKey) {
    try {
      const origin = data.pickupCoordinates 
        ? `${data.pickupCoordinates.lat},${data.pickupCoordinates.lng}` 
        : data.pickupLocation;
      
      const destination = data.dropoffCoordinates 
        ? `${data.dropoffCoordinates.lat},${data.dropoffCoordinates.lng}` 
        : data.dropoffLocation;

      console.log('Calling Google Maps Distance Matrix API...')
      const response = await googleMapsClient.distancematrix({
        params: {
          origins: [origin],
          destinations: [destination],
          key: apiKey,
          units: UnitSystem.metric,
          mode: TravelMode.driving,
        },
      });

      const element = response.data.rows[0].elements[0];
      console.log('Google Maps Response Status:', element.status)

      if (element.status === 'OK') {
        // Convert meters to kilometers (1 meter = 0.001 km)
        distanceKm = element.distance.value / 1000;
        // Convert seconds to minutes
        durationMinutes = Math.ceil(element.duration.value / 60);
        console.log(`Success: ${distanceKm.toFixed(2)} km, ${durationMinutes} mins`)
      } else {
         console.warn(`Distance calculation failed with status: ${element.status}`);
         
         if (process.env.NODE_ENV === 'development') {
           console.log('DEVELOPMENT FALLBACK: Using 15 km (Simulation Mode)')
           distanceKm = 15.0;
           durationMinutes = 20;
           (data as any).isSimulation = true;
         } else {
           return { 
             success: false, 
             error: `Could not calculate distance (${element.status}). Please verify addresses.` 
           }
         }
      }
    } catch (error: any) {
      console.error('Google Maps API Error:', error.message || error);
      
      let errorMessage = 'Service temporarily unavailable.';
      if (error.message?.includes('403') || error.response?.data?.error_message?.includes('legacy')) {
        errorMessage = 'Google Maps Distance Matrix API is not enabled. Please enable it in Google Cloud Console.';
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('DEVELOPMENT FALLBACK (on error): Using 15 km (Simulation Mode)')
        distanceKm = 15.0;
        durationMinutes = 20;
        (data as any).isSimulation = true;
        (data as any).simulationReason = errorMessage;
      } else {
        return { 
          success: false, 
          error: errorMessage 
        }
      }
    }
  } else {
    console.warn('No Google Maps API Key found');
    if (process.env.NODE_ENV === 'development') {
      distanceKm = 15.0;
      durationMinutes = 20;
      (data as any).isSimulation = true;
      (data as any).simulationReason = 'No API Key found';
    } else {
      return { 
        success: false, 
        error: 'Pricing service configuration error.' 
      }
    }
  }

  // Determine system distance unit
  let distanceUnit = 'km'
  try {
    const unit = await getSystemDistanceUnit()
    if (unit) distanceUnit = unit
  } catch (e) {
    console.warn('Could not fetch system distance unit, defaulting to km', e)
  }

  let displayDistance = distanceKm
  if (distanceUnit === 'mile') {
    displayDistance = distanceKm * 0.621371
  }

  try {
    const price = await calculateFare({
      serviceType: data.serviceType,
      distanceKm,
      vehicleTypeId: data.vehicleTypeId,
      pickupTime: new Date(`${data.date}T${data.time}`),
      pickupLocation: data.pickupLocation,
      dropoffLocation: data.dropoffLocation,
      meetAndGreet: data.meetAndGreet,
      durationMinutes: data.serviceType === 'hourly' && data.hours ? data.hours * 60 : durationMinutes
    })

    return {
      success: true,
      quote: {
        price,
        distanceKm,
        displayDistance,
        distanceUnit,
        durationMinutes,
        currency: 'USD',
        isSimulation: (data as any).isSimulation,
        simulationReason: (data as any).simulationReason
      }
    }
  } catch (error: any) {
    console.error('Quote calculation error:', error)
    return { success: false, error: error.message || 'Failed to calculate quote. Please try again.' }
  }
}

export async function createBookingAction(bookingData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  // 1. Re-calculate price server-side
  const quoteResult = await getQuoteAction(bookingData)
  
  if (!quoteResult.success || !quoteResult.quote) {
    return { success: false, error: 'Could not calculate price' }
  }

  const amountInCents = Math.round(quoteResult.quote.price * 100)

  try {
    // 2. Create Booking Record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        vehicle_type_id: bookingData.vehicleTypeId,
        service_type: bookingData.serviceType,
        pickup_location_address: bookingData.pickupLocation,
        dropoff_location_address: bookingData.dropoffLocation,
        pickup_time: new Date(`${bookingData.date}T${bookingData.time}`).toISOString(),
        distance_km_estimated: quoteResult.quote.distanceKm,
        duration_minutes_estimated: quoteResult.quote.durationMinutes,
        total_price_calculated: quoteResult.quote.price,
        status: 'pending',
        payment_status: 'unpaid',
        flight_number: bookingData.flightNumber || null,
        airline: bookingData.airline || null,
        meet_and_greet: bookingData.meetAndGreet || false,
        passenger_name: bookingData.passengerName,
        passenger_phone: bookingData.passengerPhone,
        notes: bookingData.notes
      })
      .select()
      .single()

    if (bookingError) {
        console.error('Booking creation failed:', bookingError)
        return { success: false, error: 'Failed to create booking record: ' + bookingError.message }
    }

    // Send email notification to admin
    try {
      await sendAdminNewBookingEmail(booking.id)
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
      // Continue execution - don't fail the booking just because email failed
    }

    // 3. Initialize Payment (Mock or Real)
    // Temporarily disabled Stripe as requested or if key is placeholder
    const isStripeEnabled = process.env.STRIPE_SECRET_KEY && 
                           !process.env.STRIPE_SECRET_KEY.includes('your-stripe') && 
                           process.env.STRIPE_SECRET_KEY.startsWith('sk_');

    if (isStripeEnabled) {
        const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
            booking_id: booking.id,
            customer_id: user.id
        }
        })

        return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        bookingId: booking.id,
        message: 'Booking created, proceed to payment.'
        }
    } else {
        // Mock success for development without Stripe
        return {
            success: true,
            bookingId: booking.id,
            message: 'Booking created successfully (Payment integration pending).'
        }
    }

  } catch (error: any) {
    console.error('Booking/Payment error:', error)
    return { success: false, error: error.message || 'Booking failed' }
  }
}
