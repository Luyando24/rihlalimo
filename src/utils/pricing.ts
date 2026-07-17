import { createClient } from '@/utils/supabase/server'
import { calculateMeteredFare } from '@/utils/meteredPricing'

interface PricingParams {
  serviceType: string
  distanceKm: number
  durationMinutes: number
  vehicleTypeId: string
  pickupTime: Date
  pickupLocation?: string
  dropoffLocation?: string
  meetAndGreet?: boolean
  carSeatsCount?: number
  waitMinutes?: number
}

const MEET_AND_GREET_FEE = 25.00

export async function calculateFare(params: PricingParams): Promise<number> {
  try {
    const supabase = await createClient()

    // 1. Fetch vehicle pricing details
    const { data: vehicleType, error } = await supabase
      .from('vehicle_types')
      .select('*')
      .eq('id', params.vehicleTypeId)
      .single()
    
    if (error || !vehicleType) {
      console.error('Error fetching vehicle type or not found:', error)
      throw new Error('Vehicle type not found')
    }

    // 2. Fetch Active Pricing Rules (Global Multipliers)
    const { data: rules } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${rules?.length || 0} active global pricing rules`)
    }

    // 3. Fetch Time Multipliers
    const { data: timeMultipliers } = await supabase
      .from('time_multipliers')
      .select('*')
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${timeMultipliers?.length || 0} time multipliers`)
    }
    
    // 4. Fetch Hourly Rates (if applicable)
    let customHourlyRate = null
    if (params.serviceType === 'hourly') {
      const { data: hourlyRate } = await supabase
        .from('hourly_rates')
        .select('*')
        .eq('vehicle_type_id', params.vehicleTypeId)
        .single()
      customHourlyRate = hourlyRate
    }

    // 5. Fetch Airport Fees (if applicable)
    let airportFee = 0
    if (params.serviceType.includes('airport')) {
      try {
        const { data: fees } = await supabase
          .from('airport_fees')
          .select('*')
        
        if (fees && fees.length > 0) {
          const airportMatch = fees.find(f => {
            const pickup = params.pickupLocation?.toLowerCase() || ''
            const dropoff = params.dropoffLocation?.toLowerCase() || ''
            const code = f.airport_code?.toLowerCase() || ''
            
            return (code && (pickup.includes(code) || dropoff.includes(code)))
          })
          
          if (airportMatch) {
            airportFee = Number(airportMatch.amount)
          }
        }
      } catch (e) {
        console.error('Error matching airport fees:', e)
      }
    }

    // 5b. Meet & Greet Fee
    let meetAndGreetFee = 0
    if (params.meetAndGreet) {
      meetAndGreetFee = MEET_AND_GREET_FEE
    }

    // 5c. Car Seat Fee
    let carSeatFeeTotal = 0
    if (params.carSeatsCount && params.carSeatsCount > 0) {
      const pricePerSeat = Number(vehicleType.car_seat_price_usd) || 0
      carSeatFeeTotal = params.carSeatsCount * pricePerSeat
    }

    // Base calculation: Start with base fare
    let total = Number(vehicleType.base_fare_usd)
    let minimumMeteredTotal = 0
    
    if (params.serviceType === 'point_to_point' || params.serviceType.includes('airport')) {
      // Point-to-point and airport transfers use a metered base + miles + minutes
      // model. Hourly-service pricing remains independent below.
      const distanceRate = Number(vehicleType.price_per_distance_usd) || 0
      const perMinuteRate = Number(vehicleType.price_per_minute_usd) || (Number(vehicleType.price_per_hour_usd) / 60) || 0
      const minimumFare = Number(vehicleType.minimum_fare_usd) || 0
      const waitPerMinute = Number(vehicleType.wait_rate_per_minute_usd) || 0
      const complimentaryWaitMinutes = Number(vehicleType.complimentary_wait_minutes) || 0

      // The supplied rate cards are per mile. Convert both the measured distance
      // and any legacy per-kilometer rate to a common per-mile calculation.
      // The vehicle's unit describes the stored rate. The system-wide distance
      // preference is display-only and must not reinterpret a per-mile rate.
      const distanceUnit = vehicleType.distance_unit
      const distanceMiles = params.distanceKm * 0.621371
      const perMileRate = distanceUnit === 'mile'
        ? distanceRate
        : distanceRate / 0.621371

      const fare = calculateMeteredFare({
        distanceMiles,
        durationMinutes: params.durationMinutes,
        waitMinutes: params.waitMinutes,
        rule: {
          baseFare: Number(vehicleType.base_fare_usd) || 0,
          perMile: perMileRate,
          perMinute: perMinuteRate,
          minimumFare,
          waitPerMinute,
          complimentaryWaitMinutes
        }
      })

      const addOnTotal = airportFee + meetAndGreetFee + carSeatFeeTotal
      total = fare.total + addOnTotal
      // If a multiplier is below 1, it still cannot discount the metered ride
      // below its vehicle minimum or erase explicit add-ons/wait charges.
      minimumMeteredTotal = minimumFare + fare.waitCharge + addOnTotal
      
      // Log for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Fare Breakdown for ${params.serviceType}:`, {
          baseFare: fare.baseFare,
          distanceKm: params.distanceKm,
          distanceMiles,
          perMileRate,
          distanceCharge: fare.distanceCharge,
          duration: params.durationMinutes,
          perMinuteRate,
          timeCharge: fare.timeCharge,
          meteredFare: fare.meteredFare,
          minimumFare,
          rideFare: fare.rideFare,
          complimentaryWaitMinutes,
          billableWaitMinutes: fare.billableWaitMinutes,
          waitPerMinute,
          waitCharge: fare.waitCharge,
          airportFee,
          meetAndGreetFee,
          carSeatFeeTotal,
          totalBeforeMultipliers: total
        })
      }
    } else if (params.serviceType === 'hourly') {
      // Hourly logic
      const hours = Math.ceil(params.durationMinutes / 60)
      const ratePerHour = customHourlyRate ? Number(customHourlyRate.rate_per_hour) : Number(vehicleType.price_per_hour_usd)
      const minHours = customHourlyRate ? customHourlyRate.min_hours : (vehicleType.min_hours_booking || 2)
      
      // Ensure we charge at least the minimum hours, but if user requested more, charge that
      // params.durationMinutes comes from (hours * 60) in actions.ts, so it reflects user selection
      const billableHours = Math.max(hours, minHours)
      
      total = (billableHours * ratePerHour) + airportFee + meetAndGreetFee + carSeatFeeTotal
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Hourly Calculation: ${billableHours} hours @ $${ratePerHour}/hr`, {
           requestedHours: hours,
           minHours,
           ratePerHour
        })
      }
    }

    // 6. Apply Time Multipliers
    try {
      const pickupHour = params.pickupTime.getHours()
      const pickupMinute = params.pickupTime.getMinutes()
      const dayOfWeek = params.pickupTime.getDay() // 0-6 (Sun-Sat)
      const currentTimeStr = `${pickupHour.toString().padStart(2, '0')}:${pickupMinute.toString().padStart(2, '0')}:00`

      const activeTimeMultiplier = timeMultipliers?.find(m => {
        if (!m.start_time || !m.end_time) return false
        
        // Day of week check
        if (m.day_of_week !== null && m.day_of_week !== undefined && m.day_of_week !== dayOfWeek) {
          return false
        }
        
        // Ensure time strings are compared correctly (HH:mm:ss)
        const start = m.start_time.includes(':') ? m.start_time : `${m.start_time}:00`
        const end = m.end_time.includes(':') ? m.end_time : `${m.end_time}:00`

        if (start <= end) {
          return currentTimeStr >= start && currentTimeStr <= end
        } else {
          // Over-midnight range (e.g., 22:00 to 06:00)
          return currentTimeStr >= start || currentTimeStr <= end
        }
      })

      if (activeTimeMultiplier) {
        const oldTotal = total
        total *= Number(activeTimeMultiplier.multiplier)
        if (process.env.NODE_ENV === 'development') {
          console.log(`Time multiplier applied: ${activeTimeMultiplier.multiplier} (Start: ${activeTimeMultiplier.start_time}, End: ${activeTimeMultiplier.end_time}), total ${oldTotal} -> ${total}`)
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.log(`No active time multiplier found for ${currentTimeStr} on day ${dayOfWeek}`)
      }
    } catch (e) {
      console.error('Error applying time multipliers:', e)
    }

    // 7. Apply Global Pricing Rules
    if (rules && rules.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Applying ${rules.length} potential global rules for pickup time: ${params.pickupTime}`)
      }
      
      for (const rule of rules) {
        if (rule.name === 'SYSTEM_DEFAULT_DISTANCE_UNIT') continue; // Skip system config rule

        try {
          // Check effective dates if present
          const pickupTime = new Date(params.pickupTime)
          
          if (rule.effective_start && new Date(rule.effective_start) > pickupTime) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Rule ${rule.name} skipped: effective_start ${rule.effective_start} is after pickup ${pickupTime}`)
            }
            continue
          }
          
          if (rule.effective_end && new Date(rule.effective_end) < pickupTime) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Rule ${rule.name} skipped: effective_end ${rule.effective_end} is before pickup ${pickupTime}`)
            }
            continue
          }
          
          const oldTotal = total
          total *= Number(rule.multiplier)
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Rule ${rule.name} applied: multiplier ${rule.multiplier}, total ${oldTotal} -> ${total}`)
          }
        } catch (e) {
          console.error(`Error applying pricing rule ${rule.name}:`, e)
        }
      }
    }

    if (minimumMeteredTotal > 0) {
      total = Math.max(total, minimumMeteredTotal)
    }

    // Round to 2 decimals
    return Math.round(total * 100) / 100
  } catch (error) {
    console.error('CRITICAL: calculateFare failed:', error)
    // Return a basic fallback if everything else fails, 
    // or re-throw if we want the caller to handle it.
    // Given this is a quote, better to throw so the UI shows "unavailable"
    throw error
  }
}
