'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function driverSignup(formData: FormData): Promise<{ error?: string; message?: string; success?: boolean } | void> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string

  // Sign up with role = 'driver'
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'driver'
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Update profile with phone number (since it's not in the trigger usually, or we can add it)
  // The trigger handles ID, Email, Full Name, Role.
  // We can update the phone number now if we have a session.
  if (data.session) {
    await supabase.from('profiles').update({ phone }).eq('id', data.user?.id)
    redirect('/drive/onboarding')
  }

  // If no session (email confirmation enabled)
  return { 
    success: true, 
    message: 'Application received! Please check your email to confirm your account.' 
  }
}
