'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function driverSignup(formData: FormData): Promise<{ error?: string; message?: string; success?: boolean } | void> {
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
    // Update profile with phone number and role (bypassing RLS with Admin client)
    const adminClient = createAdminClient()
    await adminClient.from('profiles').update({ phone: phone, role: 'driver' }).eq('id', signUpData.user.id)

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
      return { success: true, message: 'Driver account created! We had trouble sending the verification email. Please try logging in to resend it.' }
    }

    const { getVerificationEmailTemplate } = await import('@/utils/emailTemplates')
    const { sendEmail } = await import('@/utils/email')

    const verificationUrl = linkData.properties.action_link
    const html = getVerificationEmailTemplate(fullName, verificationUrl)

    await sendEmail({
      to: email,
      subject: 'Verify Your Rihla Limo Driver Account',
      html
    })

    return { success: true, message: 'Signup successful! Please check your email to verify your driver account.' }
  }

  return { error: 'Something went wrong during driver registration.' }
}
