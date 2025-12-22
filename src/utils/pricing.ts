import { createClient } from '@/utils/supabase/server'

interface PricingParams {
  serviceType: string
  distanceMiles: number
  durationMinutes: number
  vehicleTypeId: string
  pickupTime: Date
}

export async function calculateFare(params: PricingParams): Promise<number> {
  const supabase = await createClient()

  // 1. Fetch vehicle pricing details
  // In a real app, query 'vehicle_types' table
  // const { data: vehicleType } = await supabase.from('vehicle_types').select('*').eq('id', params.vehicleTypeId).single()
  
  // Mock values based on "Premium" service
  const baseFare = 50.00
  const ratePerMile = 3.50
  const ratePerMinute = 0.80 // Time charge
  
  // 2. Calculate Base Cost
  let total = baseFare
  
  if (params.serviceType === 'point_to_point' || params.serviceType.includes('airport')) {
    total += (params.distanceMiles * ratePerMile)
    total += (params.durationMinutes * ratePerMinute)
  } else if (params.serviceType === 'hourly') {
    // Hourly logic
    const hours = Math.ceil(params.durationMinutes / 60)
    const hourlyRate = 120.00 // Mock
    total = Math.max(hours, 2) * hourlyRate // Min 2 hours
  }

  // 3. Apply Multipliers (Time of day, Traffic, etc.)
  // Query 'pricing_rules' and 'time_multipliers'
  
  // Example: Night time multiplier (10PM - 6AM)
  const hour = params.pickupTime.getHours()
  if (hour >= 22 || hour < 6) {
    total *= 1.15 // 15% surcharge
  }

  return parseFloat(total.toFixed(2))
}
