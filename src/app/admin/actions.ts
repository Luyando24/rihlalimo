'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendAssignmentEmail, sendCustomerBookingStatusUpdateEmail } from '@/utils/notifications'

export async function approveDriver(driverId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient()

  // Update driver status
  const { error } = await supabaseAdmin
    .from('drivers')
    .update({ status: 'offline' }) // Approved drivers start as offline
    .eq('id', driverId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
    return { success: true }
  }

export async function assignDriver(bookingId: string, driverId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ 
      driver_id: driverId,
      status: 'assigned'
    })
    .eq('id', bookingId)

  if (error) {
    return { error: error.message }
  }

  // Send email notification to driver
  try {
    await sendAssignmentEmail(bookingId, driverId)
  } catch (emailError) {
    console.error('Failed to send driver assignment email:', emailError)
  }

  // Send email notification to customer
  try {
    await sendCustomerBookingStatusUpdateEmail(bookingId)
  } catch (emailError) {
    console.error('Failed to send customer status update email:', emailError)
  }

  revalidatePath('/admin')
    return { success: true }
  }

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  if (error) {
    return { error: error.message }
  }

  // Send email notification to customer
  try {
    await sendCustomerBookingStatusUpdateEmail(bookingId)
  } catch (emailError) {
    console.error('Failed to send customer status update email:', emailError)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function completeBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
    })
    .eq('id', bookingId)

  if (error) {
    return { error: error.message }
  }

  // Send email notification to customer
  try {
    await sendCustomerBookingStatusUpdateEmail(bookingId)
  } catch (emailError) {
    console.error('Failed to send customer status update email:', emailError)
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function getSystemDistanceUnit() {
    const supabase = await createClient()
    const { data: rule } = await supabase
        .from('pricing_rules')
        .select('description')
        .eq('name', 'SYSTEM_DEFAULT_DISTANCE_UNIT')
        .single()
    
    return rule?.description || 'km'
}

export async function setSystemDistanceUnit(unit: 'km' | 'mile') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Verify admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Unauthorized' }
    }

    const supabaseAdmin = createAdminClient()

    // Check if rule exists
    const { data: existing } = await supabaseAdmin
        .from('pricing_rules')
        .select('id')
        .eq('name', 'SYSTEM_DEFAULT_DISTANCE_UNIT')
        .single()

    let error
    if (existing) {
        const result = await supabaseAdmin
            .from('pricing_rules')
            .update({ description: unit, is_active: true })
            .eq('id', existing.id)
        error = result.error
    } else {
        const result = await supabaseAdmin
            .from('pricing_rules')
            .insert({
                name: 'SYSTEM_DEFAULT_DISTANCE_UNIT',
                description: unit,
                multiplier: 1.0,
                is_active: true
            })
        error = result.error
    }

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Pricing Rules Actions
export async function addPricingRule(formData: {
    name: string
    description?: string
    multiplier: number
    is_active: boolean
    effective_start?: string
    effective_end?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.from('pricing_rules').insert([formData]).select()
    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true, rule: data[0] }
}

export async function deletePricingRule(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.from('pricing_rules').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}

// Hourly Rates Actions
export async function addHourlyRate(formData: {
    vehicle_type_id: string
    rate_per_hour: number
    min_hours: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.from('hourly_rates').insert([formData]).select()
    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true, rate: data[0] }
}

export async function deleteHourlyRate(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.from('hourly_rates').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}

// Airport Fees Actions
export async function addAirportFee(formData: {
    airport_code: string
    fee_type: string
    amount: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.from('airport_fees').insert([formData]).select()
    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true, fee: data[0] }
}

export async function deleteAirportFee(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.from('airport_fees').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}

// Time Multipliers Actions
export async function addTimeMultiplier(formData: {
    start_time: string
    end_time: string
    multiplier: number
    day_of_week?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.from('time_multipliers').insert([formData]).select()
    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true, multiplier: data[0] }
}

export async function deleteTimeMultiplier(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.from('time_multipliers').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin')
    return { success: true }
}

export async function addVehicleType(formData: {
  name: string
  description: string
  capacity_passengers: number
  capacity_luggage: number
  base_fare_usd: number
  price_per_distance_usd: number
  distance_unit: 'mile' | 'km'
  price_per_hour_usd: number
  min_hours_booking: number
  image_url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin.from('vehicle_types').insert([formData]).select()
  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true, vehicleType: data[0] }
}

export async function updateVehicleType(id: string, formData: {
  name?: string
  description?: string
  capacity_passengers?: number
  capacity_luggage?: number
  base_fare_usd?: number
  price_per_distance_usd?: number
  distance_unit?: 'mile' | 'km'
  price_per_hour_usd?: number
  min_hours_booking?: number
  image_url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin.from('vehicle_types').update(formData).eq('id', id).select()
  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true, vehicleType: data[0] }
}

export async function deleteVehicleType(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from('vehicle_types').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function addVehicle(formData: {
  make: string
  model: string
  year: number
  color: string
  license_plate: string
  vehicle_type_id: string
  status: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const supabaseAdmin = createAdminClient()

  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .insert([
      {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        license_plate: formData.license_plate,
        vehicle_type_id: formData.vehicle_type_id,
        status: formData.status || 'active',
      }
    ])
    .select()

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true, vehicle: data[0] }
}

export async function deleteVehicle(vehicleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Unauthorized' }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('vehicles')
    .delete()
    .eq('id', vehicleId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectDriver(driverId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) {
      return { error: 'Not authenticated' }
    }
  
    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
  
    if (profile?.role !== 'admin') {
      return { error: 'Unauthorized' }
    }
  
    const supabaseAdmin = createAdminClient()
  
    // For now, we just delete the driver entry or set status to rejected
    // Let's assume we want to keep the record but mark as rejected
    // If 'rejected' status is not supported, we might need to delete or add it.
    // Based on previous code, status is text.
    
    const { error } = await supabaseAdmin
      .from('drivers')
      .update({ status: 'rejected' })
      .eq('id', driverId)
  
    if (error) {
      return { error: error.message }
    }
  
    revalidatePath('/admin')
    return { success: true }
  }
