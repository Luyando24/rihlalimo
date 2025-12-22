import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DriverDashboard from '@/components/driver/DriverDashboard'
import Link from 'next/link'

export default async function DriverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()

  if (profile?.role !== 'driver') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="mb-6 text-gray-600">This area is restricted to authorized chauffeurs only.</p>
            <Link href="/" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800">
                Return Home
            </Link>
        </div>
    )
  }

  // Get assigned bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('driver_id', user.id)
    .order('pickup_time', { ascending: true })

  // Mock Earnings Data
  const stats = {
      todaysEarnings: 450.00,
      weeklyEarnings: 1850.00,
      rating: 4.95
  }

  return (
    <DriverDashboard 
        profile={profile}
        bookings={bookings}
        stats={stats}
    />
  )
}
