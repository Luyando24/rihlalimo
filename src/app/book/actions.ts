'use server'

import { calculateFare } from '@/utils/pricing'
import { stripe } from '@/utils/stripe/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Client, TravelMode, UnitSystem } from "@googlemaps/google-maps-services-js"
import { getSystemDistanceUnit } from '@/app/admin/actions'
import { validateDiscountCode } from '@/app/admin/discount-actions'

const googleMapsClient = new Client({});

export interface PriceQuote {
  price: number;
  distanceKm: number;
  displayDistance: number;
  distanceUnit: string;
  durationMinutes: number;
  currency: string;
  isSimulation?: boolean;
  simulationReason?: string;
}

export interface BookingFormData {
  serviceType: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoordinates?: { lat: number; lng: number } | null;
  dropoffCoordinates?: { lat: number; lng: number } | null;
  date: string;
  time: string;
  vehicleTypeId: string;
  passengers?: number;
  airline?: string;
  flightNumber?: string;
  meetAndGreet?: boolean;
  hours?: number;
  minutes?: number;
  passengerName?: string;
  passengerPhone?: string;
  passengerEmail?: string;
  notes?: string;
  promoCode?: string | null;
  discountId?: string | null;
  passengersCount?: number;
  checkedBagsCount?: number;
  carSeatsCount?: number;
  childAges?: string[];
}

export async function getVehicleTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('vehicle_types').select('*').order('base_fare_usd', { ascending: true })
  
  if (error) {
    console.error('Error fetching vehicle types:', error)
    return []
  }
  return data
}
export async function getQuoteAction(data: BookingFormData & {
  meetAndGreet?: boolean
  hours?: number
  carSeatsCount?: number
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
      carSeatsCount: data.carSeatsCount,
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

export async function initializePaymentAction(bookingData: BookingFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim()
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  const isStripeConfigured = Boolean(
    stripeSecretKey?.startsWith('sk_') &&
    !stripeSecretKey.includes('your-stripe') &&
    stripePublishableKey?.startsWith('pk_')
  )

  // Never turn a missing production payment configuration into a mock success.
  if (!isStripeConfigured) {
    console.error('Stripe payment initialization rejected: Stripe keys are not configured')
    return { success: false, error: 'Payments are temporarily unavailable. Please contact support.' }
  }

  // Always calculate the authoritative amount on the server.
  const quoteResult = await getQuoteAction(bookingData)

  if (!quoteResult.success || !quoteResult.quote) {
    return { success: false, error: 'Could not calculate price' }
  }

  try {
    let finalPrice = quoteResult.quote.price
    let appliedDiscountId: string | null = null
    let appliedPromoCode: string | null = null

    if (bookingData.promoCode) {
      const discountResult = await validateDiscountCode(bookingData.promoCode)
      if (discountResult.success && discountResult.discount) {
        const d = discountResult.discount
        appliedDiscountId = d.id
        appliedPromoCode = d.code
        if (d.type === 'percentage') {
          finalPrice = finalPrice * (1 - d.value / 100)
        } else {
          finalPrice = Math.max(0, finalPrice - d.value)
        }
      } else {
        return { success: false, error: discountResult.error || 'Invalid discount code' }
      }
    }

    const amountInCents = Math.round(finalPrice * 100)

    // Stripe cannot process a zero-dollar PaymentIntent, and silently treating it as
    // paid would reintroduce a server-side payment bypass.
    if (amountInCents < 50) {
      return { success: false, error: 'The final charge must be at least $0.50.' }
    }

    const supabaseAdmin = createAdminClient()

    // The booking exists before payment only as an operationally inert pending record.
    // Service-role insertion also supports guest checkout without granting clients the
    // ability to choose payment-controlled columns.
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        customer_id: user?.id || null,
        vehicle_type_id: bookingData.vehicleTypeId,
        service_type: bookingData.serviceType,
        pickup_location_address: bookingData.pickupLocation,
        pickup_location_lat: bookingData.pickupCoordinates?.lat ?? null,
        pickup_location_lng: bookingData.pickupCoordinates?.lng ?? null,
        dropoff_location_address: bookingData.dropoffLocation || null,
        dropoff_location_lat: bookingData.dropoffCoordinates?.lat ?? null,
        dropoff_location_lng: bookingData.dropoffCoordinates?.lng ?? null,
        pickup_time: new Date(`${bookingData.date}T${bookingData.time}`).toISOString(),
        distance_km_estimated: quoteResult.quote.distanceKm,
        duration_minutes_estimated: quoteResult.quote.durationMinutes,
        total_price_calculated: amountInCents / 100,
        status: 'pending',
        payment_status: 'unpaid',
        flight_number: bookingData.flightNumber || null,
        airline: bookingData.airline || null,
        meet_and_greet: bookingData.meetAndGreet || false,
        passenger_name: bookingData.passengerName || null,
        passenger_phone: bookingData.passengerPhone || null,
        passenger_email: bookingData.passengerEmail || null,
        notes: bookingData.notes || null,
        discount_id: appliedDiscountId,
        promo_code: appliedPromoCode,
        passengers_count: bookingData.passengersCount || 1,
        checked_bags_count: bookingData.checkedBagsCount || 0,
        car_seats_count: bookingData.carSeatsCount || 0,
        child_ages: bookingData.childAges || []
      })
      .select('id')
      .single()

    if (bookingError || !booking) {
      console.error('Pending booking creation failed:', bookingError)
      return { success: false, error: 'Failed to initialize booking.' }
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        receipt_email: bookingData.passengerEmail || user?.email || undefined,
        metadata: {
          booking_id: booking.id,
          customer_id: user?.id || 'guest',
          promo_code: appliedPromoCode || ''
        }
      }, {
        idempotencyKey: `booking-${booking.id}`
      })

      if (!paymentIntent.client_secret) {
        throw new Error('Stripe did not return a client secret')
      }

      const { error: linkError } = await supabaseAdmin
        .from('bookings')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', booking.id)

      if (linkError) {
        try {
          await stripe.paymentIntents.cancel(paymentIntent.id)
        } catch (cancelError) {
          console.error('Failed to cancel unlinked PaymentIntent:', cancelError)
        }
        throw new Error(`Failed to link payment to booking: ${linkError.message}`)
      }

      return {
        success: true,
        bookingId: booking.id,
        clientSecret: paymentIntent.client_secret,
        message: 'Payment initialized.',
        finalPrice: amountInCents / 100
      }
    } catch (paymentError) {
      // Do not leave a payment-less record looking like an actionable booking.
      const { error: cleanupError } = await supabaseAdmin
        .from('bookings')
        .delete()
        .eq('id', booking.id)

      if (cleanupError) {
        console.error('Failed to clean up pending booking:', cleanupError)
      }
      throw paymentError
    }
  } catch (error: unknown) {
    console.error('Payment initialization error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment initialization failed'
    }
  }
}
