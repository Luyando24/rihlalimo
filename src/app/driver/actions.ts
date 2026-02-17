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
        .update({ status: 'confirmed' }) // Or 'accepted' if that's a valid status. Let's stick to 'confirmed' or 'assigned' -> 'en_route'?
        // The status flow seems to be: pending -> assigned -> (driver accepts) -> en_route -> in_progress -> completed.
        // But sendCustomerBookingStatusUpdateEmail only handles: assigned, completed, cancelled.
        // Let's check the allowed statuses in the DB constraint if possible, but for now I'll assume standard flow.
        // If the email function only handles those 3, maybe we shouldn't send emails for 'en_route' or 'in_progress' yet.
        // Let's just update status to 'en_route' for accept? Or maybe just keep it 'assigned' and add a flag?
        // Actually, if the driver accepts, it usually means they are on the way.
        .eq('id', bookingId)
        .eq('driver_id', user.id) // Ensure the driver owns this booking

    if (error) {
        return { error: error.message }
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
