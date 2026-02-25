import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/email'
import { getEmailTemplate, formatBookingDetails } from './emailTemplates'

export async function sendAdminNewBookingEmail(bookingId: string) {
    const supabase = await createClient()
    const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
            *,
            vehicle_types (name),
            profiles (full_name, email, phone)
        `)
        .eq('id', bookingId)
        .single()

    if (error || !booking) {
        console.error('Error fetching booking for admin email:', error)
        return
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rihlalimo.com'
    const subject = `New Booking #${booking.id.slice(0, 8)}: ${booking.pickup_location_address.split(',')[0]}`

    const content = `
        <p>A new booking has been received through the portal.</p>
        ${formatBookingDetails(booking)}
        <p><strong>Customer:</strong> ${booking.profiles?.full_name} (${booking.profiles?.phone})</p>
        <p><strong>Amount:</strong> $${booking.total_price_calculated}</p>
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
    `

    const html = getEmailTemplate(
        'New Booking Received',
        content,
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin`,
        'View in Admin Dashboard'
    )

    await sendEmail({
        to: adminEmail,
        subject,
        html
    })
}

export async function sendAssignmentEmail(bookingId: string, driverId: string) {
    const supabase = await createClient()
    
    // Get Driver Email
    const { data: driver, error: driverError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', driverId)
        .single()

    if (driverError || !driver?.email) {
        console.error('Error fetching driver email:', driverError)
        return
    }

    // Get Booking Details
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
            *,
            vehicle_types (name),
            profiles (full_name, phone)
        `)
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking) {
        console.error('Error fetching booking for assignment email:', bookingError)
        return
    }

    const subject = `New Trip Assignment: ${booking.pickup_location_address.split(',')[0]}`

    const content = `
        <p>Hello ${driver.full_name},</p>
        <p>You have been assigned a new trip. Please review the details below and accept the trip in your dashboard.</p>
        ${formatBookingDetails(booking)}
        <p><strong>Passenger:</strong> ${booking.passenger_name || booking.profiles?.full_name}</p>
        <p><strong>Phone:</strong> <a href="tel:${booking.passenger_phone || booking.profiles?.phone}">${booking.passenger_phone || booking.profiles?.phone}</a></p>
    `

    const html = getEmailTemplate(
        'New Trip Assignment',
        content,
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/driver`,
        'Go to Driver Dashboard'
    )

    await sendEmail({
        to: driver.email,
        subject,
        html
    })
}

export async function sendCustomerBookingConfirmationEmail(bookingId: string) {
    const supabase = await createClient()

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
            *,
            vehicle_types (
                name
            ),
            profiles (
                email,
                full_name
            )
        `)
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking) {
        console.error('Error fetching booking for customer email:', bookingError)
        return { success: false, error: 'Booking not found' }
    }

    if (!booking.profiles?.email) {
        console.error('Customer email not found')
        return { success: false, error: 'Customer email not found' }
    }

    const subject = `Booking Confirmed: ${booking.pickup_location_address.split(',')[0]}`
    
    const content = `
        <p>Hello <strong>${booking.profiles.full_name || 'Valued Customer'}</strong>,</p>
        <p>Thank you for choosing Rihla Limo. Your booking has been received and confirmed. Our team is now assigning a chauffeur for your trip.</p>
        ${formatBookingDetails(booking)}
        <p>You will receive another update as soon as your chauffeur has been assigned.</p>
    `

    const html = getEmailTemplate(
        'Booking Confirmed',
        content,
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
        'View My Bookings'
    )

    const text = `
Booking Confirmed

Hello ${booking.profiles.full_name || 'Valued Customer'},

Thank you for choosing Rihla Limo. Your booking has been received and confirmed.

Pickup: ${booking.pickup_location_address}
Dropoff: ${booking.dropoff_location_address}
Vehicle: ${booking.vehicle_types?.name}

You can view your booking details by logging into your account.
    `.trim()

    return await sendEmail({
        to: booking.profiles.email,
        subject,
        html,
        text
    })
}

export async function sendCustomerBookingStatusUpdateEmail(bookingId: string) {
    const supabase = await createClient()

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
            *,
            vehicle_types (
                name
            ),
            profiles (
                email,
                full_name
            ),
            driver:driver_id (
                full_name,
                phone
            )
        `)
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking) {
        console.error('Error fetching booking for status update email:', bookingError)
        return { success: false, error: 'Booking not found' }
    }

    if (!booking.profiles?.email) {
        console.error('Customer email not found')
        return { success: false, error: 'Customer email not found' }
    }

    const status = booking.status
    let statusMessage = ''
    let statusSubject = ''

    switch (status) {
        case 'assigned':
            statusSubject = 'Chauffeur Assigned'
            statusMessage = `A professional chauffeur has been assigned to your trip. Your chauffeur is <strong>${booking.driver?.full_name || 'assigned'}</strong>.`
            if (booking.driver?.phone) {
                statusMessage += ` You can contact them at <a href="tel:${booking.driver.phone}">${booking.driver.phone}</a>.`
            }
            break
        case 'driver_accepted':
            statusSubject = 'Chauffeur En Route'
            statusMessage = `Your chauffeur <strong>${booking.driver?.full_name || 'assigned'}</strong> has accepted the trip and is now en route to your pickup location.`
            break
        case 'in_progress':
            statusSubject = 'Trip Started'
            statusMessage = `Your trip to <strong>${booking.dropoff_location_address}</strong> has officially started. Enjoy your ride with Rihla Limo.`
            break
        case 'completed':
            statusSubject = 'Trip Completed'
            statusMessage = 'Your trip has been marked as completed. We hope you had a pleasant experience with Rihla Limo. Thank you for choosing us.'
            break
        case 'cancelled':
            statusSubject = 'Booking Cancelled'
            statusMessage = 'Your booking with Rihla Limo has been cancelled. If you believe this is an error, please contact our support team.'
            break
        default:
            return { success: true, message: 'No email needed for this status' }
    }

    const subject = `${statusSubject}: ${booking.pickup_location_address.split(',')[0]}`
    
    const content = `
        <p>Hello <strong>${booking.profiles.full_name || 'Valued Customer'}</strong>,</p>
        <p>${statusMessage}</p>
        ${formatBookingDetails(booking)}
    `

    const html = getEmailTemplate(
        statusSubject,
        content,
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
        'View Trip Details'
    )

    const text = `
${statusSubject}

Hello ${booking.profiles.full_name || 'Valued Customer'},

${statusMessage.replace(/<[^>]*>/g, '')}

Pickup: ${booking.pickup_location_address}
Dropoff: ${booking.dropoff_location_address}
    `.trim()

    return await sendEmail({
        to: booking.profiles.email,
        subject,
        html,
        text
    })
}
