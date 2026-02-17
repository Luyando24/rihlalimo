import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/email'

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

    const html = `
        <h2>New Booking Received</h2>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Customer:</strong> ${booking.profiles?.full_name} (${booking.profiles?.phone})</p>
        <p><strong>Pickup:</strong> ${booking.pickup_location_address}</p>
        <p><strong>Dropoff:</strong> ${booking.dropoff_location_address}</p>
        <p><strong>Date:</strong> ${new Date(booking.pickup_time).toLocaleString()}</p>
        <p><strong>Vehicle:</strong> ${booking.vehicle_types?.name}</p>
        <p><strong>Price:</strong> $${booking.total_price_calculated}</p>
        <p><strong>Notes:</strong> ${booking.notes || 'None'}</p>
    `

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

    const html = `
        <h2>New Trip Assignment</h2>
        <p>Hello ${driver.full_name},</p>
        <p>You have been assigned a new trip.</p>
        <hr/>
        <p><strong>Pickup:</strong> ${booking.pickup_location_address}</p>
        <p><strong>Dropoff:</strong> ${booking.dropoff_location_address}</p>
        <p><strong>Date:</strong> ${new Date(booking.pickup_time).toLocaleString()}</p>
        <p><strong>Passenger:</strong> ${booking.passenger_name || booking.profiles?.full_name}</p>
        <p><strong>Phone:</strong> <a href="tel:${booking.passenger_phone || booking.profiles?.phone}">${booking.passenger_phone || booking.profiles?.phone}</a></p>
        <p><strong>Vehicle:</strong> ${booking.vehicle_types?.name}</p>
        ${booking.flight_number ? `<p><strong>Flight:</strong> ${booking.flight_number}</p>` : ''}
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        <hr/>
        <p>Please log in to your driver dashboard to accept and start the trip.</p>
    `

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
    
    // Format date nicely
    const pickupDate = new Date(booking.pickup_time)
    const formattedDate = pickupDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })
    const formattedTime = pickupDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    })

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Booking Confirmed</h2>
            <p>Hello <strong>${booking.profiles.full_name || 'Valued Customer'}</strong>,</p>
            <p>Thank you for booking with Rihla Limo. Your booking has been received and confirmed. We will assign a driver shortly.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Date:</strong></td>
                        <td style="padding: 8px 0;">${formattedDate} at ${formattedTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Pickup:</strong></td>
                        <td style="padding: 8px 0;">${booking.pickup_location_address}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Dropoff:</strong></td>
                        <td style="padding: 8px 0;">${booking.dropoff_location_address}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Vehicle:</strong></td>
                        <td style="padding: 8px 0;">${booking.vehicle_types?.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Passenger:</strong></td>
                        <td style="padding: 8px 0;">${booking.passenger_name} <br/><a href="tel:${booking.passenger_phone}" style="color: #000; text-decoration: none;">${booking.passenger_phone}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Total Price:</strong></td>
                        <td style="padding: 8px 0;">$${booking.total_price_calculated}</td>
                    </tr>
                    ${booking.flight_number ? `
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Flight:</strong></td>
                        <td style="padding: 8px 0;">${booking.flight_number}</td>
                    </tr>` : ''}
                    ${booking.notes ? `
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Notes:</strong></td>
                        <td style="padding: 8px 0; font-style: italic;">${booking.notes}</td>
                    </tr>` : ''}
                </table>
            </div>

            <p style="font-size: 14px; color: #666;">
                You can view your booking details and status at any time by logging into your account.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                <p>&copy; ${new Date().getFullYear()} Rihla Limo. All rights reserved.</p>
            </div>
        </div>
    `

    const text = `
Booking Confirmed

Hello ${booking.profiles.full_name || 'Valued Customer'},

Thank you for booking with Rihla Limo. Your booking has been received and confirmed.

Date: ${formattedDate} at ${formattedTime}
Pickup: ${booking.pickup_location_address}
Dropoff: ${booking.dropoff_location_address}
Vehicle: ${booking.vehicle_types?.name}
Passenger: ${booking.passenger_name} (${booking.passenger_phone})
Price: $${booking.total_price_calculated}
${booking.flight_number ? `Flight: ${booking.flight_number}` : ''}
${booking.notes ? `Notes: ${booking.notes}` : ''}

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
            statusSubject = 'Driver Assigned'
            statusMessage = `A driver has been assigned to your trip. Your driver is <strong>${booking.driver?.full_name || 'assigned'}</strong>.`
            if (booking.driver?.phone) {
                statusMessage += ` You can contact them at <a href="tel:${booking.driver.phone}">${booking.driver.phone}</a>.`
            }
            break
        case 'driver_accepted':
            statusSubject = 'Driver En Route'
            statusMessage = `Your driver <strong>${booking.driver?.full_name || 'assigned'}</strong> is on the way to the pickup location.`
            break
        case 'in_progress':
            statusSubject = 'Trip Started'
            statusMessage = `Your trip to <strong>${booking.dropoff_location_address}</strong> has started.`
            break
        case 'completed':
            statusSubject = 'Trip Completed'
            statusMessage = 'Your trip has been marked as completed. Thank you for riding with Rihla Limo.'
            break
        case 'cancelled':
            statusSubject = 'Booking Cancelled'
            statusMessage = 'Your booking has been cancelled.'
            break
        default:
            // For other statuses, we might not need to send an email, or just a generic update
            return { success: true, message: 'No email needed for this status' }
    }

    const subject = `${statusSubject}: ${booking.pickup_location_address.split(',')[0]}`
    
    // Format date nicely
    const pickupDate = new Date(booking.pickup_time)
    const formattedDate = pickupDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })
    const formattedTime = pickupDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    })

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">${statusSubject}</h2>
            <p>Hello <strong>${booking.profiles.full_name || 'Valued Customer'}</strong>,</p>
            <p>${statusMessage}</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Date:</strong></td>
                        <td style="padding: 8px 0;">${formattedDate} at ${formattedTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Pickup:</strong></td>
                        <td style="padding: 8px 0;">${booking.pickup_location_address}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Dropoff:</strong></td>
                        <td style="padding: 8px 0;">${booking.dropoff_location_address}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                <p>&copy; ${new Date().getFullYear()} Rihla Limo. All rights reserved.</p>
            </div>
        </div>
    `

    const text = `
${statusSubject}

Hello ${booking.profiles.full_name || 'Valued Customer'},

${statusMessage.replace(/<[^>]*>/g, '')}

Date: ${formattedDate} at ${formattedTime}
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
