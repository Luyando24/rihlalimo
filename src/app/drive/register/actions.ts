'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function driverSignup(formData: FormData): Promise<{ error?: string; message?: string; success?: boolean; unconfirmed?: boolean } | void> {
  const supabase = await createClient()
  const adminAuth = createAdminClient().auth.admin

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string

  // 1. Sign up the user (this reserves the email)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        role: 'driver'
      }
    }
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  // 2. Handle successful signup
  if (signUpData.user) {
    // Upsert profile via Admin client to ensure it exists and role is set
    const adminClient = createAdminClient()
    await adminClient.from('profiles').upsert({ 
      id: signUpData.user.id,
      email: email,
      full_name: fullName,
      phone: phone,
      role: 'driver' 
    }, { onConflict: 'id' })

    // 3. Generate verification link and send via SMTP
    const { data: linkData, error: linkError } = await adminAuth.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/drive/onboarding`
      }
    })

    if (linkError) {
      console.error('Error generating verification link:', linkError)
      
      // Handle the case where the user already exists
      if (linkError.message.includes('already been registered') || (linkError as any).code === 'email_exists') {
        return { 
          error: 'An account with this email already exists. If you haven\'t verified it yet, you can resend the link from the login page.',
          unconfirmed: true 
        }
      }

      return { success: true, message: 'Driver account created! We had trouble sending the verification email. Please try logging in to your dashboard to resend it.' }
    }

    const { getVerificationEmailTemplate } = await import('@/utils/emailTemplates')
    const { sendEmail } = await import('@/utils/email')

    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=${linkData.properties.verification_type}&next=/drive/onboarding`
    const html = getVerificationEmailTemplate(fullName, verificationUrl)

    const emailResult = await sendEmail({
      to: email,
      subject: 'Verify Your Rihla Limo Driver Account',
      html
    })

    if (!emailResult.success) {
      console.error('Failed to send driver verification email:', emailResult.error)
      return { 
        success: true, 
        message: 'Driver account created! We had trouble sending the verification email. Please try logging in to your dashboard to resend it.' 
      }
    }

    if ((emailResult as any).mock) {
      return { 
        success: true, 
        message: 'Driver signup successful! [DEV MODE] Email was logged to console.' 
      }
    }

    return { success: true, message: 'Signup successful! Please check your email to verify your driver account.' }
  }

  return { error: 'Something went wrong during driver registration.' }
}
