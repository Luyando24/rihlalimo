'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function driverSignup(formData: FormData): Promise<{ error?: string; message?: string; success?: boolean } | void> {
  const supabase = await createClient()
  const adminAuth = createAdminClient().auth

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string

  // 1. Create user with Admin API to skip email verification (auto-confirm)
  // Sign up with role = 'driver'
  const { data: adminData, error: adminError } = await adminAuth.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'driver'
    },
  })

  if (adminError) {
    return { error: adminError.message }
  }

  // 2. Sign in immediately
  if (adminData.user) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return { error: signInError.message }
    }

    // Update profile with phone number
    if (signInData.session) {
      await supabase.from('profiles').update({ phone }).eq('id', signInData.user?.id)
      redirect('/drive/onboarding')
    }
  }

  return { error: 'Something went wrong during driver registration.' }
}
