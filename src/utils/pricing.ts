import { createClient } from '@/utils/supabase/server'
import { calculateMeteredFare, composeFare } from '@/utils/meteredPricing'

interface PricingParams {
  serviceType: string
  distanceKm: number
  durationMinutes: number
  vehicleTypeId: string
  pickupTime: Date
  pickupLocalDate?: string
  pickupLocalTime?: string
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

    // Vehicle fare and fixed charges are intentionally kept separate. Scheduled
    // and global multipliers apply to the ride itself, not airport, meet-and-greet,
    // car-seat, or wait charges.
    let rideFare = Number(vehicleType.base_fare_usd)
    let waitCharge = 0
    let minimumRideFare = 0
    let timeMultiplier = 1
    const globalMultipliers: number[] = []
    const fixedAddOnTotal = airportFee + meetAndGreetFee + carSeatFeeTotal
    
    if (params.serviceType === 'point_to_point' || params.serviceType.includes('airport')) {
      // Point-to-point and airport transfers use a metered base + miles + minutes
      // model. Hourly-service pricing remains independent below.
      const distanceRate = Number(vehicleType.price_per_distance_usd) || 0
      const perMinuteRate = vehicleType.price_per_minute_usd == null
        ? (Number(vehicleType.price_per_hour_usd) / 60) || 0
        : Number(vehicleType.price_per_minute_usd)
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

      rideFare = fare.rideFare
      waitCharge = fare.waitCharge
      minimumRideFare = minimumFare
      
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
          rideFareBeforeMultipliers: rideFare,
          fixedAddOnTotal,
          totalBeforeMultipliers: rideFare + waitCharge + fixedAddOnTotal
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
      
      rideFare = billableHours * ratePerHour
      
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
      let pickupHour = params.pickupTime.getHours()
      let pickupMinute = params.pickupTime.getMinutes()
      let dayOfWeek = params.pickupTime.getDay() // 0-6 (Sun-Sat)

      // Use the customer's entered pickup clock/date for scheduled multipliers.
      // Parsing a timezone-less Date on a cloud server can otherwise shift a
      // 06:00 pickup out of its intended local rush window.
      if (/^\d{2}:\d{2}/.test(params.pickupLocalTime || '')) {
        const [hour, minute] = params.pickupLocalTime!.split(':').map(Number)
        pickupHour = hour
        pickupMinute = minute
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(params.pickupLocalDate || '')) {
        const [year, month, day] = params.pickupLocalDate!.split('-').map(Number)
        dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
      }
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
        timeMultiplier = Number(activeTimeMultiplier.multiplier)
        if (process.env.NODE_ENV === 'development') {
          console.log(`Time multiplier selected: ${activeTimeMultiplier.multiplier} (Start: ${activeTimeMultiplier.start_time}, End: ${activeTimeMultiplier.end_time})`)
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
          
          globalMultipliers.push(Number(rule.multiplier))
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Global rule ${rule.name} selected: multiplier ${rule.multiplier}`)
          }
        } catch (e) {
          console.error(`Error applying pricing rule ${rule.name}:`, e)
        }
      }
    }

    // Time and global multipliers compound on the vehicle ride fare. Multipliers
    // may discount a ride, but never below its minimum; fixed charges and actual
    // post-grace waiting are then added exactly once.
    const composedFare = composeFare({
      rideFare,
      minimumRideFare,
      timeMultiplier,
      globalMultipliers,
      fixedAddOns: fixedAddOnTotal,
      waitCharge
    })

    // Round to 2 decimals
    return Math.round(composedFare.total * 100) / 100
  } catch (error) {
    console.error('CRITICAL: calculateFare failed:', error)
    // Return a basic fallback if everything else fails, 
    // or re-throw if we want the caller to handle it.
    // Given this is a quote, better to throw so the UI shows "unavailable"
    throw error
  }
}
