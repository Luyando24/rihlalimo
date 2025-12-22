'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const licenseNumber = formData.get('licenseNumber') as string

  // Insert into drivers table
  const { error } = await supabase.from('drivers').insert({
    id: user.id,
    license_number: licenseNumber,
    status: 'offline' // default
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/driver')
}
