'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendCustomerBookingStatusUpdateEmail } from '@/utils/notifications'

export async function acceptTrip(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Verify driver role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'driver') {
        return { error: 'Unauthorized' }
    }

    // Update booking status
    const { error } = await supabase
        .from('bookings')
        .update({ status: 'driver_accepted' }) 
        .eq('id', bookingId)
        .eq('driver_id', user.id) // Ensure the driver owns this booking

    if (error) {
        return { error: error.message }
    }

    // Send email to customer
    try {
        await sendCustomerBookingStatusUpdateEmail(bookingId)
    } catch (emailError) {
        console.error('Failed to send customer status update email:', emailError)
    }

    revalidatePath('/driver')
    return { success: true }
}

export async function startTrip(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('bookings')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', bookingId)
        .eq('driver_id', user.id)

    if (error) {
        return { error: error.message }
    }

    // Send email to customer
    try {
        await sendCustomerBookingStatusUpdateEmail(bookingId)
    } catch (emailError) {
        console.error('Failed to send customer status update email:', emailError)
    }

    revalidatePath('/driver')
    return { success: true }
}

export async function completeTrip(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', bookingId)
        .eq('driver_id', user.id)

    if (error) {
        return { error: error.message }
    }

    // Send email to customer
    try {
        await sendCustomerBookingStatusUpdateEmail(bookingId)
    } catch (emailError) {
        console.error('Failed to send customer status update email:', emailError)
    }

    revalidatePath('/driver')
    return { success: true }
}
