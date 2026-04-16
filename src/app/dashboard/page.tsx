import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CustomerDashboard from '@/components/customer/CustomerDashboard'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (!profile) {
      // JIT Profile Creation: Handle edge case where user exists in Auth but not in Profiles
      console.log(`JIT Profile Creation for user: ${user.email}`)
      const { createAdminClient } = await import('@/utils/supabase/admin')
      const adminClient = createAdminClient()
      
      const { data: newProfile, error: insertError } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Valued Customer',
          role: 'customer'
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error in JIT Profile Creation:', insertError)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
                <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
                <p className="mb-6 text-gray-600">Please contact support.</p>
            </div>
        )
      }
      
      profile = newProfile
  }

  // Redirect role-based dashboards if accessed directly
  if (profile.role === 'admin') redirect('/admin')
  if (profile.role === 'driver') redirect('/driver')

  // Fetch Customer's Bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, vehicle_types(name)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate Stats
  const totalTrips = bookings?.length || 0
  const upcomingTrips = bookings?.filter(b => ['pending', 'confirmed', 'assigned', 'on_route', 'arrived', 'picked_up'].includes(b.status)).length || 0
  const totalSpent = bookings?.reduce((acc, b) => acc + (b.total_price_calculated || 0), 0) || 0

  const stats = {
      totalTrips,
      upcomingTrips,
      totalSpent
  }

  return (
    <CustomerDashboard 
        profile={profile}
        bookings={bookings || []}
        stats={stats}
    />
  )
}