import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="mb-6 text-gray-600">You do not have permission to view this page.</p>
            <Link href="/" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800">
                Return Home
            </Link>
        </div>
    )
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, profiles(full_name, email), vehicle_types(name)')
    .order('created_at', { ascending: false })

  // Calculate real stats
  const { count: activeBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'confirmed'])
  
  const { count: totalDrivers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'driver')

  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')

  // Fetch Drivers with their status
  const { data: drivers } = await supabase
    .from('drivers')
    .select(`
      *,
      profiles (
        full_name,
        email,
        phone,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  // Calculate pending drivers
  const pendingDriversCount = drivers?.filter(d => d.status === 'pending_approval').length || 0

  // Fetch Customers
  const { data: customers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  // Fetch Fleet (Vehicles with Type info)
  const { data: fleet } = await supabase
    .from('vehicles')
    .select('*, vehicle_types(name)')
    .order('created_at', { ascending: false })

  // Fetch Settings Data
  const { data: pricingRules } = await supabase.from('pricing_rules').select('*').order('created_at', { ascending: false })
  const { data: hourlyRates } = await supabase.from('hourly_rates').select('*, vehicle_types(name)').order('created_at', { ascending: false })
  const { data: airportFees } = await supabase.from('airport_fees').select('*').order('created_at', { ascending: false })
  const { data: timeMultipliers } = await supabase.from('time_multipliers').select('*').order('created_at', { ascending: false })

  // Fetch Vehicle Types
  const { data: vehicleTypes } = await supabase.from('vehicle_types').select('*').order('name')

  // Fetch SMTP Settings
  const { data: smtpSettingsData } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'smtp_settings')
    .single()

  const settings = {
    pricingRules,
    hourlyRates,
    airportFees,
    timeMultipliers,
    smtp: smtpSettingsData?.value || {
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        from_email: '',
        from_name: ''
    }
  }

  // Calculate total revenue (simple sum of all bookings for now)
  // In a real app, this should be an aggregation query or a separate stats table
  const totalRevenue = bookings?.reduce((acc, booking) => acc + (booking.total_price_calculated || 0), 0) || 0

  const stats = {
      totalRevenue,
      activeBookings: activeBookings || 0,
      activeDrivers: totalDrivers || 0,
      totalCustomers: totalCustomers || 0,
      pendingDrivers: pendingDriversCount
  }

  return (
    <AdminDashboard 
        profile={profile}
        bookings={bookings || []}
        drivers={drivers || []}
        customers={customers || []}
        fleet={fleet || []}
        vehicleTypes={vehicleTypes || []}
        settings={settings}
        stats={stats}
    />
  )
}
