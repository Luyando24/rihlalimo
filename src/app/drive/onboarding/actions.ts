'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData): Promise<{ error?: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const licenseNumber = formData.get('licenseNumber') as string
  const supabaseAdmin = createAdminClient()

  // Insert into drivers table using admin client to bypass RLS
  const { error } = await supabaseAdmin.from('drivers').insert({
    id: user.id,
    license_number: licenseNumber,
    status: 'offline' // default
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/driver')
}
