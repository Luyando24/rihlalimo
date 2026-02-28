export function getEmailTemplate(title: string, content: string, actionUrl?: string, actionText?: string) {
  const year = new Date().getFullYear();
  const primaryColor = '#000000';
  const backgroundColor = '#f4f4f4';
  const textColor = '#333333';
  const lightTextColor = '#666666';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${backgroundColor}; color: ${textColor}; line-height: 1.6;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <!-- Header -->
        <tr>
          <td style="padding: 40px 0; text-align: center; background-color: ${primaryColor}; color: #ffffff;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;">RIHLA LIMO</h1>
            <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 2px;">PREMIUM CHAUFFEUR SERVICE</p>
          </td>
        </tr>
        
        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px; font-size: 22px; color: ${primaryColor}; font-weight: 600;">${title}</h2>
            <div style="font-size: 16px; color: ${textColor};">
              ${content}
            </div>
            
            ${actionUrl && actionText ? `
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="${actionUrl}" style="display: inline-block; padding: 15px 35px; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                      ${actionText}
                    </a>
                  </td>
                </tr>
              </table>
            ` : ''}
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eeeeee; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: ${lightTextColor};">
              Questions? Contact us at <a href="mailto:support@rihlalimo.com" style="color: ${primaryColor}; text-decoration: none; font-weight: bold;">support@rihlalimo.com</a>
            </p>
            <div style="margin-top: 20px; font-size: 12px; color: #999999;">
              <p style="margin: 5px 0;">&copy; ${year} Rihla Limo. All rights reserved.</p>
              <p style="margin: 5px 0;">Premium Transportation Services</p>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}

export function getVerificationEmailTemplate(name: string, verificationUrl: string) {
  const title = "Verify Your Account";
  const content = `
    <p>Hello ${name},</p>
    <p>Thank you for choosing <strong>Rihla Limo</strong>. We're excited to have you on board!</p>
    <p>To complete your registration and start booking your premium chauffeur service, please verify your email address by clicking the button below:</p>
  `;

  return getEmailTemplate(title, content, verificationUrl, "Verify My Account");
}

export function formatBookingDetails(booking: any) {
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

  return `
    <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e0e0e0;">
      <h3 style="margin: 0 0 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Trip Details</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr>
              <td style="padding: 10px 0; color: #666; width: 120px; border-bottom: 1px solid #eee;"><strong>Date & Time</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${formattedDate} at ${formattedTime}</td>
          </tr>
          <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Pickup</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.pickup_location_address}</td>
          </tr>
          <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Dropoff</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.dropoff_location_address || 'As Directed'}</td>
          </tr>
          <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Vehicle</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.vehicle_types?.name || 'Premium Vehicle'}</td>
          </tr>
          ${booking.passenger_name ? `
          <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Passenger</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.passenger_name}</td>
          </tr>
          ` : ''}
          ${booking.flight_number ? `
          <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Flight</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.airline ? booking.airline + ' ' : ''}${booking.flight_number}</td>
          </tr>
          ` : ''}
      </table>
    </div>
  `.trim();
}
