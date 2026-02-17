import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // In development, if no SMTP credentials are provided, log the email instead of sending
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('--- MOCK EMAIL SEND ---')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('HTML Body:', html)
    console.log('-----------------------')
    return { success: true, message: 'Email logged (Mock mode)' }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Rihla Limo" <noreply@rihlalimo.com>',
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback plain text
      html,
    })

    console.log('Message sent: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}
