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

  // 1. Sign up the user (sends confirmation email if enabled in Supabase)
  // Sign up with role = 'driver'
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
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
    const { error: updateError } = await adminAuth.updateUserById(signUpData.user.id, {
      user_metadata: { phone: phone, role: 'driver' } // Ensuring metadata is there
    })

    // The trigger sets role to 'customer' by default, so we MUST override it to 'driver' here
    const adminClient = createAdminClient()
    await adminClient.from('profiles').update({ phone: phone, role: 'driver' }).eq('id', signUpData.user.id)

    // If confirmation is required, session will be null
    if (!signUpData.session) {
      return { success: true, message: 'Signup successful! Please check your email to verify your driver account.' }
    } else {
      revalidatePath('/', 'layout')
      redirect('/drive/onboarding')
    }
  }

  return { error: 'Something went wrong during driver registration.' }
}
