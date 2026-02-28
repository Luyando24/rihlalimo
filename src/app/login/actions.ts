'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function login(formData: FormData): Promise<{ error?: string; message?: string } | void> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    revalidatePath('/', 'layout')

    if (profile?.role === 'admin') {
      redirect('/admin')
    } else if (profile?.role === 'driver') {
      redirect('/driver')
    } else {
      redirect('/dashboard')
    }
  }

  redirect('/')
}

export async function signup(formData: FormData): Promise<{ error?: string; message?: string; success?: boolean } | void> {
  const supabase = await createClient()
  const adminAuth = createAdminClient().auth.admin

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string

  // 1. Create user with standard Supabase client (sends email verification if enabled)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      }
    }
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  // 2. Handle successful signup
  if (signUpData.user) {
    // Update profile with phone number (bypassing RLS with Admin client because user might not be logged in yet if email confirmation is required)
    const { error: updateError } = await adminAuth.updateUserById(signUpData.user.id, {
      user_metadata: { phone: phone } // Ensuring metadata is there
    })

    // The trigger creates the profile, we just need to update phone.
    const adminClient = createAdminClient()
    await adminClient.from('profiles').update({ phone: phone }).eq('id', signUpData.user.id)

    // If confirmation is required, session will be null
    if (!signUpData.session) {
      return { success: true, message: 'Signup successful! Please check your email to verify your account.' }
    } else {
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }
  }

  return { error: 'Something went wrong during account creation.' }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard/profile`,
  })

  if (error) {
    return { error: error.message }
  }

  return { message: 'Password reset link sent! Please check your email.' }
}

export async function sendTestBrandedEmail(email: string) {
  const { getEmailTemplate } = await import('@/utils/emailTemplates')
  const { sendEmail } = await import('@/utils/email')

  const content = `
    <p>This is a demonstration of your new branded email template.</p>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
      <p style="margin: 0; font-weight: bold; color: #000;">Template Features:</p>
      <ul style="margin: 10px 0 0; padding-left: 20px; color: #666;">
        <li>Clean, minimalist design</li>
        <li>Custom header with brand typography</li>
        <li>Clear call-to-action buttons</li>
        <li>Professional footer with support details</li>
        <li>Responsive mobile-friendly layout</li>
      </ul>
    </div>
    <p>All system notifications (Bookings, Chauffeur Assignments, and Status Updates) will now use this professional look.</p>
  `

  const html = getEmailTemplate(
    'Branded Template Preview',
    content,
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
    'Visit Website'
  )

  return await sendEmail({
    to: email,
    subject: 'Rihla Limo - Branded Email Preview',
    html
  })
}
