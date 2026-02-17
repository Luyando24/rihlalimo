import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/utils/email'

export async function sendAssignmentEmail(bookingId: string, driverId: string) {
    const supabase = await createClient()

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
            *,
            vehicle_types (
                name
            )
        `)
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking) {
        console.error('Error fetching booking for email:', bookingError)
        return { success: false, error: 'Booking not found' }
    }

    // Fetch driver details
    const { data: driverProfile, error: driverError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', driverId)
        .single()

    if (driverError || !driverProfile || !driverProfile.email) {
        console.error('Error fetching driver for email:', driverError)
        return { success: false, error: 'Driver not found or no email' }
    }

    const subject = `New Trip Assignment: ${booking.pickup_location_address.split(',')[0]}`
    
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
            <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">New Trip Assignment</h2>
            <p>Hello <strong>${driverProfile.full_name || 'Driver'}</strong>,</p>
            <p>You have been assigned a new trip. Here are the details:</p>
            
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
                Please log in to your driver dashboard to view full details, navigate to pickup, and manage the trip status.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                <p>&copy; ${new Date().getFullYear()} Rihla Limo. All rights reserved.</p>
            </div>
        </div>
    `

    const text = `
New Trip Assignment

Hello ${driverProfile.full_name || 'Driver'},

You have been assigned a new trip.

Date: ${formattedDate} at ${formattedTime}
Pickup: ${booking.pickup_location_address}
Dropoff: ${booking.dropoff_location_address}
Vehicle: ${booking.vehicle_types?.name}
Passenger: ${booking.passenger_name} (${booking.passenger_phone})
${booking.flight_number ? `Flight: ${booking.flight_number}` : ''}
${booking.notes ? `Notes: ${booking.notes}` : ''}

Please log in to your driver dashboard to view full details.
    `.trim()

    return await sendEmail({
        to: driverProfile.email,
        subject,
        html,
        text
    })
}

export async function sendAdminNewBookingEmail(bookingId: string) {
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
                full_name,
                phone
            )
        `)
        .eq('id', bookingId)
        .single()

    if (bookingError || !booking) {
        console.error('Error fetching booking for admin email:', bookingError)
        return { success: false, error: 'Booking not found' }
    }

    // Fetch admin emails
    const { data: admins, error: adminError } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin')

    if (adminError || !admins || admins.length === 0) {
        console.error('Error fetching admins for email:', adminError)
        return { success: false, error: 'No admins found' }
    }

    const adminEmails = admins.map(a => a.email).filter(Boolean).join(',')
    
    if (!adminEmails) {
        return { success: false, error: 'No valid admin emails found' }
    }

    const subject = `New Booking Received: ${booking.pickup_location_address.split(',')[0]}`
    
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
            <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">New Booking Received</h2>
            <p>Hello Admin,</p>
            <p>A new booking has been placed. Please review and assign a driver.</p>
            
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
                        <td style="padding: 8px 0; color: #666;"><strong>Customer:</strong></td>
                        <td style="padding: 8px 0;">${booking.profiles?.full_name} <br/><a href="tel:${booking.profiles?.phone}" style="color: #000; text-decoration: none;">${booking.profiles?.phone}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Passenger:</strong></td>
                        <td style="padding: 8px 0;">${booking.passenger_name} <br/><a href="tel:${booking.passenger_phone}" style="color: #000; text-decoration: none;">${booking.passenger_phone}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;"><strong>Price:</strong></td>
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Admin Dashboard</a>
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                <p>&copy; ${new Date().getFullYear()} Rihla Limo. All rights reserved.</p>
            </div>
        </div>
    `

    const text = `
New Booking Received

Hello Admin,

A new booking has been placed. Please review and assign a driver.

Date: ${formattedDate} at ${formattedTime}
Pickup: ${booking.pickup_location_address}
Dropoff: ${booking.dropoff_location_address}
Vehicle: ${booking.vehicle_types?.name}
Customer: ${booking.profiles?.full_name} (${booking.profiles?.phone})
Passenger: ${booking.passenger_name} (${booking.passenger_phone})
Price: $${booking.total_price_calculated}
${booking.flight_number ? `Flight: ${booking.flight_number}` : ''}
${booking.notes ? `Notes: ${booking.notes}` : ''}

Please log in to the admin dashboard to manage this booking.
    `.trim()

    return await sendEmail({
        to: adminEmails,
        subject,
        html,
        text
    })
}
