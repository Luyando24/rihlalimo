'use client'

import { useState } from 'react'
import { 
  LucideLayoutDashboard, 
  LucideCar, 
  LucideHistory, 
  LucideUser, 
  LucideLogOut, 
  LucideMenu, 
  LucidePlus,
  LucideMapPin,
  LucideClock,
  LucidePlane,
  LucideCheckCircle,
  LucideXCircle,
  LucideCalendar,
  LucideEdit2,
  LucideSave,
  LucideX
} from 'lucide-react'
import Link from 'next/link'
import { signout } from '@/app/login/actions'
import { updateProfile } from '@/app/dashboard/actions'

export default function CustomerDashboard({ profile, bookings, stats }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="min-h-screen bg-gray-50 flex text-black font-sans">
      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="text-2xl font-normal tracking-tight">RIHLA LIMO</Link>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Passenger Account</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem 
              icon={<LucideLayoutDashboard size={20} />} 
              label="Overview" 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<LucideCar size={20} />} 
              label="My Trips" 
              active={activeTab === 'trips'} 
              onClick={() => { setActiveTab('trips'); setIsSidebarOpen(false); }}
            />
            <Link href="/book" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                <LucidePlus size={20} />
                Book a Ride
            </Link>
            <NavItem 
              icon={<LucideUser size={20} />} 
              label="Profile" 
              active={activeTab === 'profile'} 
              onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            />
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    {profile.full_name?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{profile.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                </div>
             </div>
             <form action={signout}>
                <button 
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                    <LucideLogOut size={18} />
                    Sign Out
                </button>
             </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                    <LucideMenu size={24} />
                </button>
                <h2 className="text-lg font-bold hidden sm:block">
                    {activeTab === 'dashboard' ? 'Welcome back, ' + (profile.full_name?.split(' ')[0] || 'Guest') : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/book" className="hidden sm:flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                    <LucidePlus size={16} />
                    New Booking
                </Link>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            {activeTab === 'dashboard' && (
                <DashboardView bookings={bookings} stats={stats} onBookRide={() => {}} />
            )}
            {activeTab === 'trips' && (
                <TripsView bookings={bookings} />
            )}
            {activeTab === 'profile' && (
                <ProfileView profile={profile} />
            )}
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${active ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
        >
            {icon}
            {label}
        </button>
    )
}

function DashboardView({ bookings, stats }: any) {
    const upcomingBookings = bookings.filter((b: any) => ['pending', 'confirmed', 'assigned', 'on_route', 'arrived', 'picked_up'].includes(b.status))
    
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                    label="Total Trips" 
                    value={stats.totalTrips} 
                    icon={<LucideCar size={20} className="text-blue-600" />} 
                />
                <StatCard 
                    label="Upcoming" 
                    value={stats.upcomingTrips} 
                    icon={<LucideCalendar size={20} className="text-green-600" />} 
                />
                <StatCard 
                    label="Total Spent" 
                    value={`$${stats.totalSpent.toLocaleString()}`} 
                    icon={<LucideHistory size={20} className="text-purple-600" />} 
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Upcoming Trips */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Upcoming Trips</h3>
                        {upcomingBookings.length > 0 && (
                             <Link href="/book" className="text-sm font-medium text-black underline">Book Another</Link>
                        )}
                    </div>
                    
                    {upcomingBookings.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingBookings.map((booking: any) => (
                                <TripCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LucideCalendar size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No upcoming trips</h3>
                            <p className="text-gray-500 mb-6">Ready to travel? Book your next premium ride with us.</p>
                            <Link href="/book" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                                <LucidePlus size={18} />
                                Book a Ride
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Info */}
                <div className="space-y-6">
                    <div className="bg-black text-white rounded-xl p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Our support team is available 24/7 to assist you with your bookings.
                            </p>
                            <Link href="/contact" className="w-full bg-white text-black font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors block text-center">
                                Contact Support
                            </Link>
                        </div>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TripsView({ bookings }: any) {
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Your Trip History</h3>
            </div>
             <div className="space-y-4">
                {bookings && bookings.length > 0 ? (
                    bookings.map((booking: any) => (
                        <TripCard key={booking.id} booking={booking} />
                    ))
                ) : (
                     <div className="text-center py-12 text-gray-500">No trips found.</div>
                )}
             </div>
        </div>
    )
}

function ProfileView({ profile }: any) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        fullName: profile.full_name || '',
        phone: profile.phone || ''
    })

    const handleSave = async () => {
        setLoading(true)
        setError(null)
        setSuccess(null)

        const data = new FormData()
        data.append('fullName', formData.fullName)
        data.append('phone', formData.phone)

        try {
            const result = await updateProfile(data)
            if (result.error) {
                setError(result.error)
            } else {
                setSuccess(result.message || 'Profile updated successfully')
                setIsEditing(false)
                // Profile prop will be stale until page refresh, but that's okay for now or we can optimistically update
                // In a real app, we might use router.refresh() but the server action already does revalidatePath
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">My Profile</h3>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-sm font-medium text-black hover:text-gray-600 transition-colors"
                    >
                        <LucideEdit2 size={16} />
                        Edit Profile
                    </button>
                )}
            </div>
            
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                    <LucideXCircle size={16} />
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                    <LucideCheckCircle size={16} />
                    {success}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
                            {formData.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h4 className="text-xl font-bold">{isEditing ? 'Edit Profile' : (profile.full_name || 'User')}</h4>
                            <p className="text-gray-500">Customer Account</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                            {isEditing ? (
                                <input 
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 min-h-[48px] flex items-center">
                                    {profile.full_name}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 text-gray-500 cursor-not-allowed min-h-[48px] flex items-center">
                                {profile.email}
                                <span className="ml-2 text-xs text-gray-400">(Read-only)</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                            {isEditing ? (
                                <input 
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    placeholder="Enter your phone number"
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 min-h-[48px] flex items-center">
                                    {profile.phone || 'Not provided'}
                                </div>
                            )}
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Member Since</label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 min-h-[48px] flex items-center">
                                {new Date(profile.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
                
                {isEditing && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <button 
                            onClick={() => {
                                setIsEditing(false)
                                setFormData({
                                    fullName: profile.full_name || '',
                                    phone: profile.phone || ''
                                })
                                setError(null)
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                            disabled={loading}
                        >
                            <LucideX size={16} />
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium bg-black text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <LucideSave size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
                <div className="text-2xl font-bold mt-1">{value}</div>
            </div>
        </div>
    )
}

function TripCard({ booking }: any) {
    const isHourly = booking.service_type === 'hourly'
    const isAirport = booking.service_type === 'airport_pickup' || booking.service_type === 'airport_dropoff'
    
    // Status badges
    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase flex items-center gap-1"><LucideCheckCircle size={12} /> Completed</span>
            case 'cancelled': return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase flex items-center gap-1"><LucideXCircle size={12} /> Cancelled</span>
            case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase flex items-center gap-1"><LucideClock size={12} /> Pending</span>
            case 'confirmed': return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase flex items-center gap-1"><LucideCheckCircle size={12} /> Confirmed</span>
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase">{status}</span>
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                 <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-xl">
                        {isAirport ? <LucidePlane size={24} className="text-black" /> : <LucideCar size={24} className="text-black" />}
                    </div>
                    <div>
                        <div className="font-bold text-lg flex items-center gap-2">
                            {new Date(booking.pickup_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            <span className="text-gray-300">|</span>
                            {new Date(booking.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-gray-500 text-sm mt-1">
                            Booking #{booking.id.slice(0, 8)}
                        </div>
                    </div>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(booking.status)}
                    <span className="px-3 py-1 bg-gray-100 text-xs font-bold rounded-full uppercase">
                        {booking.service_type.replace(/_/g, ' ')}
                    </span>
                 </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="relative pl-4 border-l-2 border-gray-100 ml-2 space-y-6">
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-black rounded-full border-2 border-white ring-1 ring-gray-200"></div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">PICKUP</p>
                        <p className="font-medium text-gray-900">{booking.pickup_location_address}</p>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 bg-white border-2 border-black"></div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">DROP-OFF</p>
                        <p className="font-medium text-gray-900">{booking.dropoff_location_address || 'As Directed'}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Vehicle Type</span>
                        <span className="font-medium">{booking.vehicle_types?.name || 'Standard'}</span>
                    </div>
                    {isHourly && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Duration</span>
                            <span className="font-medium">{Math.round(booking.duration_minutes_estimated / 60)} Hours</span>
                        </div>
                    )}
                    {(isAirport && booking.flight_number) && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Flight</span>
                            <span className="font-medium">{booking.airline} {booking.flight_number}</span>
                        </div>
                    )}
                    {booking.meet_and_greet && (
                        <div className="flex justify-between text-purple-700">
                            <span className="font-medium">Meet & Greet Included</span>
                            <LucideCheckCircle size={16} />
                        </div>
                    )}
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center mt-2">
                        <span className="font-bold text-gray-900">Total Price</span>
                        <span className="font-bold text-lg">${booking.total_price_calculated}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}