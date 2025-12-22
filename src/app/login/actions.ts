'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
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
      redirect('/book') // Redirect customers to booking instead of home
    }
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  // Note: If "Confirm email" is disabled in Supabase, this signs in automatically.
  // If enabled, it sends an email and returns no session.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/book')
  }

  // If no session, it means email confirmation is required/enabled
  return { 
    success: true, 
    message: 'Account created! Please check your email to confirm your account.' 
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
