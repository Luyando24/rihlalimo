'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string

  try {
    // 1. Update Profile Table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName,
        phone: phone
      })
      .eq('id', user.id)

    if (profileError) throw profileError

    // 2. Update Auth Metadata (optional but keeps things in sync)
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone: phone }
    })

    if (authError) throw authError

    revalidatePath('/dashboard')
    return { success: true, message: 'Profile updated successfully' }
  } catch (error: any) {
    console.error('Update profile error:', error)
    return { error: error.message || 'Failed to update profile' }
  }
}
