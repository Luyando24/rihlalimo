'use client'

import { useState } from 'react'
import { 
  LucideLayoutDashboard, 
  LucideCar, 
  LucideWallet, 
  LucideStar, 
  LucideSettings, 
  LucideLogOut, 
  LucideBell, 
  LucideMenu, 
  LucideX,
  LucideMapPin,
  LucideNavigation,
  LucideDollarSign,
  LucideClock,
  LucideCheckCircle,
  LucidePlane
} from 'lucide-react'
import Link from 'next/link'
import { signout } from '@/app/login/actions'

export default function DriverDashboard({ profile, bookings, stats }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const toggleOnline = () => setIsOnline(!isOnline)

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
            <h1 className="text-2xl font-normal tracking-tight">RIHLA LIMO</h1>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Driver Partner</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem 
              icon={<LucideLayoutDashboard size={20} />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<LucideCar size={20} />} 
              label="Trips" 
              active={activeTab === 'trips'} 
              onClick={() => { setActiveTab('trips'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<LucideWallet size={20} />} 
              label="Earnings" 
              active={activeTab === 'earnings'} 
              onClick={() => { setActiveTab('earnings'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<LucideStar size={20} />} 
              label="Performance" 
              active={activeTab === 'performance'} 
              onClick={() => { setActiveTab('performance'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<LucideSettings size={20} />} 
              label="Settings" 
              active={activeTab === 'settings'} 
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            />
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    {profile.full_name?.charAt(0) || 'D'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{profile.full_name}</p>
                    <p className="text-xs text-gray-500">4.95 ★</p>
                </div>
             </div>
             <button 
                onClick={() => signout()}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
             >
                <LucideLogOut size={18} />
                Sign Out
             </button>
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
                    {activeTab === 'dashboard' ? 'Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Online Toggle */}
                <button 
                    onClick={toggleOnline}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors
                        ${isOnline ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}
                    `}
                >
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                </button>

                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
                    <LucideBell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            {activeTab === 'dashboard' && (
                <DashboardView bookings={bookings} stats={stats} isOnline={isOnline} />
            )}
            {activeTab === 'trips' && (
                <TripsView bookings={bookings} />
            )}
            {/* Other tabs can be placeholders for now */}
             {(activeTab !== 'dashboard' && activeTab !== 'trips') && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                    <LucideSettings size={48} className="mb-4 opacity-20" />
                    <p>This section is under development.</p>
                </div>
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

function DashboardView({ bookings, stats, isOnline }: any) {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Today's Earnings" value={`$${stats.todaysEarnings}`} icon={<LucideDollarSign size={18} />} />
                <StatCard label="Acceptance Rate" value="94%" icon={<LucideCheckCircle size={18} />} />
                <StatCard label="Driver Rating" value="4.95" icon={<LucideStar size={18} />} />
                <StatCard label="Total Trips" value="1,248" icon={<LucideCar size={18} />} />
            </div>

            {/* Map / Online Status Area */}
            <div className="bg-gray-900 rounded-xl overflow-hidden h-64 relative flex items-center justify-center">
                 {/* Placeholder for Map */}
                 <div className="absolute inset-0 bg-gray-800 opacity-50">
                    {/* Pattern or simple gradient */}
                    <div className="w-full h-full bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]"></div>
                 </div>
                 <div className="relative z-10 text-center text-white">
                    {isOnline ? (
                        <>
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <LucideMapPin size={32} className="text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold">You are Online</h3>
                            <p className="text-gray-400">Searching for nearby premium requests...</p>
                        </>
                    ) : (
                         <>
                            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LucideClock size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold">You are Offline</h3>
                            <p className="text-gray-400">Go online to start receiving trip requests.</p>
                        </>
                    )}
                 </div>
            </div>

            {/* Upcoming Trips */}
            <div>
                <h3 className="text-lg font-bold mb-4">Upcoming Schedule</h3>
                {bookings && bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((booking: any) => (
                            <TripCard key={booking.id} booking={booking} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                        No upcoming trips scheduled.
                    </div>
                )}
            </div>
        </div>
    )
}

function TripsView({ bookings }: any) {
    return (
        <div>
             <h3 className="text-lg font-bold mb-6">Your Trips</h3>
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

function StatCard({ label, value, icon }: any) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2 text-gray-500">
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    )
}


function TripCard({ booking }: any) {
    const isHourly = booking.service_type === 'hourly'
    const isAirport = booking.service_type === 'airport_pickup' || booking.service_type === 'airport_dropoff'

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                        {isAirport ? <LucidePlane size={24} className="text-black" /> : <LucideCar size={24} className="text-black" />}
                    </div>
                    <div>
                        <div className="font-bold text-lg">
                            {new Date(booking.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-gray-500 text-sm">
                            {new Date(booking.pickup_time).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 bg-gray-100 text-xs font-bold rounded-full uppercase">
                        {booking.service_type.replace(/_/g, ' ')}
                    </span>
                    {booking.meet_and_greet && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase">
                            Meet & Greet
                        </span>
                    )}
                 </div>
            </div>
            
            {(isAirport && booking.flight_number) && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-900 rounded-lg text-sm flex items-center gap-2">
                    <LucidePlane size={16} />
                    <span>Flight: <strong>{booking.airline} {booking.flight_number}</strong></span>
                </div>
            )}

            {isHourly && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-900 rounded-lg text-sm flex items-center gap-2">
                    <LucideClock size={16} />
                    <span>Duration: <strong>{Math.round(booking.duration_minutes_estimated / 60)} Hours</strong></span>
                </div>
            )}
            
            <div className="relative pl-4 border-l-2 border-gray-100 ml-4 space-y-6 my-4">
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

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="font-bold text-lg">
                    ${(booking.total_price_calculated * 0.7).toFixed(2)} <span className="text-gray-400 text-sm font-normal">est. earnings</span>
                </div>
                <button className="text-sm font-medium text-black underline hover:text-gray-600 transition-colors">Accept Trip</button>
            </div>
        </div>
    )
}
