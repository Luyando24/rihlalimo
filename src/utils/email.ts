import nodemailer from 'nodemailer'
import { createClient } from '@/utils/supabase/server'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

async function getSmtpSettings() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'smtp_settings')
      .single()

    if (error || !data) {
      return null
    }

    return data.value as {
      host: string
      port: number
      secure: boolean
      user: string
      pass: string
      from_email: string
      from_name: string
    }
  } catch (err) {
    console.error('Error fetching SMTP settings:', err)
    return null
  }
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const dbSettings = await getSmtpSettings()
  
  const host = dbSettings?.host || process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = dbSettings?.port || parseInt(process.env.SMTP_PORT || '587')
  const secure = dbSettings?.secure !== undefined ? dbSettings.secure : (process.env.SMTP_SECURE === 'true')
  const user = dbSettings?.user || process.env.SMTP_USER
  const pass = dbSettings?.pass || process.env.SMTP_PASS
  const fromEmail = dbSettings?.from_email || process.env.SMTP_FROM_EMAIL || 'noreply@rihlalimo.com'
  const fromName = dbSettings?.from_name || process.env.SMTP_FROM_NAME || 'Rihla Limo'

  // In development, if no SMTP credentials are provided, log the email instead of sending
  if (!user || !pass) {
    console.log('--- MOCK EMAIL SEND (No Credentials) ---')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('HTML Body:', html)
    console.log('-----------------------')
    return { success: true, message: 'Email logged (Mock mode)' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    })

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
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
