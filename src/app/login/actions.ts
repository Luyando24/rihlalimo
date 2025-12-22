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
      redirect('/book') // Redirect customers to booking instead of home
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

  // 1. Create user with Admin API to skip email verification (auto-confirm)
  const { data: adminData, error: adminError } = await adminAuth.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  })

  if (adminError) {
    return { error: adminError.message }
  }

  // 2. Sign in the user immediately to establish a session
  if (adminData.user) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return { error: signInError.message }
    }

    revalidatePath('/', 'layout')
    redirect('/book')
  }
  
  return { error: 'Something went wrong during account creation.' }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
