'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function approveDriver(driverId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient()

  // Update driver status
  const { error } = await supabaseAdmin
    .from('drivers')
    .update({ status: 'offline' }) // Approved drivers start as offline
    .eq('id', driverId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function rejectDriver(driverId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) {
      return { error: 'Not authenticated' }
    }
  
    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
  
    if (profile?.role !== 'admin') {
      return { error: 'Unauthorized' }
    }
  
    const supabaseAdmin = createAdminClient()
  
    // For now, we just delete the driver entry or set status to rejected
    // Let's assume we want to keep the record but mark as rejected
    // If 'rejected' status is not supported, we might need to delete or add it.
    // Based on previous code, status is text.
    
    const { error } = await supabaseAdmin
      .from('drivers')
      .update({ status: 'rejected' })
      .eq('id', driverId)
  
    if (error) {
      return { error: error.message }
    }
  
    revalidatePath('/admin')
    return { success: true }
  }