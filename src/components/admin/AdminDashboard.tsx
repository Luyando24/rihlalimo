'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LucideLayoutDashboard, 
  LucideCalendar, 
  LucideUsers, 
  LucideCar, 
  LucideSettings, 
  LucideLogOut, 
  LucideBell, 
  LucideMenu, 
  LucideSearch,
  LucideFilter,
  LucideMoreHorizontal,
  LucideCheckCircle,
  LucideXCircle,
  LucideDollarSign,
  LucideTrendingUp,
  LucidePhone,
  LucideMail,
  LucideShieldCheck,
  LucideUser,
  LucideArrowLeft,
  LucideClock,
  LucidePlus,
  LucideTrash2,
  LucideEdit2,
  LucideX,
  LucideBriefcase,
  LucidePlane
} from 'lucide-react'
import Link from 'next/link'
import { signout } from '@/app/login/actions'
import { 
    approveDriver, 
    rejectDriver, 
    addVehicle, 
    deleteVehicle, 
    addVehicleType, 
    deleteVehicleType, 
    updateVehicleType,
    addPricingRule,
    deletePricingRule,
    addHourlyRate,
    deleteHourlyRate,
    addAirportFee,
    deleteAirportFee,
    addTimeMultiplier,
    deleteTimeMultiplier,
    assignDriver,
    setSystemDistanceUnit
} from '@/app/admin/actions'
import { getVehicleTypes } from '@/app/book/actions'

export default function AdminDashboard({ profile, bookings, drivers, customers, fleet, vehicleTypes, settings, stats }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const handleViewCustomerHistory = (customer: any) => {
    setSelectedCustomer(customer)
    setActiveTab('customer_history')
  }

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
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Admin Console</p>
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
              icon={<LucideCalendar size={20} />} 
              label="Bookings" 
              active={activeTab === 'bookings'} 
              onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<LucideUsers size={20} />} 
              label="Drivers" 
              active={activeTab === 'drivers'} 
              onClick={() => { setActiveTab('drivers'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<LucideUsers size={20} />} 
              label="Customers" 
              active={activeTab === 'customers'} 
              onClick={() => { setActiveTab('customers'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<LucideCar size={20} />} 
              label="Fleet" 
              active={activeTab === 'fleet'} 
              onClick={() => { setActiveTab('fleet'); setIsSidebarOpen(false); }}
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
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    {profile.full_name?.charAt(0) || 'A'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{profile.full_name}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
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
                    {activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black w-64"
                    />
                </div>
                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
                    <LucideBell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            {activeTab === 'dashboard' && (
                <DashboardView bookings={bookings} stats={stats} />
            )}
            {activeTab === 'bookings' && (
                <BookingsView bookings={bookings} drivers={drivers} />
            )}
            {activeTab === 'drivers' && (
                <DriversView drivers={drivers} />
            )}
            {activeTab === 'customers' && (
                <CustomersView customers={customers} onViewHistory={handleViewCustomerHistory} />
            )}
            {activeTab === 'customer_history' && selectedCustomer && (
                <CustomerHistoryView customer={selectedCustomer} bookings={bookings} onBack={() => setActiveTab('customers')} />
            )}
            {activeTab === 'fleet' && (
                <FleetView fleet={fleet} vehicleTypes={vehicleTypes} />
            )}
            {activeTab === 'settings' && (
                <SettingsView settings={settings} vehicleTypes={vehicleTypes} />
            )}
             {(activeTab !== 'dashboard' && activeTab !== 'bookings' && activeTab !== 'drivers' && activeTab !== 'customers' && activeTab !== 'customer_history' && activeTab !== 'fleet' && activeTab !== 'settings') && (
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

function DashboardView({ bookings, stats }: any) {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label="Total Revenue" 
                    value={`$${stats.totalRevenue.toLocaleString()}`} 
                    change="+12.5%" 
                    isPositive={true}
                    icon={<LucideDollarSign size={20} className="text-green-600" />} 
                />
                <StatCard 
                    label="Active Bookings" 
                    value={stats.activeBookings} 
                    change="+4" 
                    isPositive={true}
                    icon={<LucideCalendar size={20} className="text-blue-600" />} 
                />
                <StatCard 
                    label="Active Drivers" 
                    value={stats.activeDrivers} 
                    change="0" 
                    isPositive={true}
                    icon={<LucideCar size={20} className="text-black" />} 
                />
                <StatCard 
                    label="Total Customers" 
                    value={stats.totalCustomers} 
                    change="+2.1%" 
                    isPositive={true}
                    icon={<LucideUsers size={20} className="text-purple-600" />} 
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Bookings Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Recent Bookings</h3>
                        <button className="text-sm font-medium text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Service</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings && bookings.slice(0, 5).map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">#{booking.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 font-medium">{booking.profiles?.full_name || 'Guest'}</td>
                                        <td className="px-6 py-4 capitalize">{booking.service_type.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(booking.pickup_time).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-6 py-4 font-medium">${booking.total_price_calculated}</td>
                                    </tr>
                                ))}
                                {(!bookings || bookings.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No recent bookings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Notifications */}
                <div className="space-y-6">
                    <div className="bg-black text-white rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-2">Driver Applications</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {stats.pendingDrivers > 0 
                                ? `${stats.pendingDrivers} new driver(s) waiting for approval.`
                                : "No new driver applications."
                            }
                        </p>
                        <button className="w-full bg-white text-black font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            Review Applications
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-lg mb-4">System Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Database
                                </span>
                                <span className="font-medium text-green-600">Operational</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Payment Gateway
                                </span>
                                <span className="font-medium text-green-600">Operational</span>
                            </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    Email Service
                                </span>
                                <span className="font-medium text-yellow-600">High Load</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BookingsView({ bookings, drivers }: any) {
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<any>(null)
    const [assigning, setAssigning] = useState(false)

    const handleAssignClick = (booking: any) => {
        setSelectedBooking(booking)
        setAssignModalOpen(true)
    }

    const handleAssignDriver = async (driverId: string) => {
        if (!selectedBooking) return
        setAssigning(true)
        const result = await assignDriver(selectedBooking.id, driverId)
        setAssigning(false)
        if (result.success) {
            setAssignModalOpen(false)
            setSelectedBooking(null)
        } else {
            alert(result.error)
        }
    }

    // Filter available drivers (e.g. active ones or offline ones that can take jobs)
    const availableDrivers = drivers?.filter((d: any) => d.status !== 'rejected' && d.status !== 'pending_approval') || []

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative">
             {/* Modal Overlay */}
             {assignModalOpen && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                     <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-lg">Assign Driver</h3>
                             <button onClick={() => setAssignModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                 <LucideX size={20} />
                             </button>
                         </div>
                         <p className="text-sm text-gray-500 mb-4">
                             Select a driver for Booking <span className="font-mono font-medium">#{selectedBooking?.id.slice(0, 8)}</span>
                         </p>
                         
                         <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                             {availableDrivers.map((driver: any) => (
                                 <button 
                                     key={driver.id}
                                     onClick={() => handleAssignDriver(driver.id)}
                                     disabled={assigning}
                                     className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors group"
                                 >
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                             {driver.profiles?.full_name?.charAt(0) || 'D'}
                                         </div>
                                         <div>
                                             <div className="font-medium text-sm">{driver.profiles?.full_name}</div>
                                             <div className="text-xs text-gray-500 capitalize">{driver.status}</div>
                                         </div>
                                     </div>
                                     {assigning && selectedBooking?.driver_id === driver.id && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>}
                                 </button>
                             ))}
                             {availableDrivers.length === 0 && (
                                 <p className="text-center text-gray-500 py-4">No available drivers found.</p>
                             )}
                         </div>
                         
                         <div className="flex justify-end">
                             <button onClick={() => setAssignModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                         </div>
                     </div>
                 </div>
             )}

             <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg">All Bookings</h3>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                        <LucideFilter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        Export CSV
                    </button>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Booking ID</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Service</th>
                            <th className="px-6 py-3">Route</th>
                            <th className="px-6 py-3">Date & Time</th>
                            <th className="px-6 py-3">Vehicle</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings && bookings.map((booking: any) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">#{booking.id.slice(0, 8)}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{booking.profiles?.full_name || 'Guest'}</div>
                                    <div className="text-xs text-gray-400">{booking.contact_email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="capitalize font-medium text-gray-900">{booking.service_type.replace(/_/g, ' ')}</div>
                                    {booking.service_type === 'hourly' && (
                                        <div className="text-xs text-blue-600 mt-1 font-medium">
                                            {Math.round((booking.duration_minutes_estimated || 0) / 60)} Hours
                                        </div>
                                    )}
                                    {(booking.service_type === 'airport_pickup' || booking.service_type === 'airport_dropoff') && booking.flight_number && (
                                        <div className="text-xs text-blue-600 mt-1 flex items-center gap-1 font-medium">
                                            <LucidePlane size={12} />
                                            {booking.airline} {booking.flight_number}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 max-w-[200px]">
                                        <div className="flex items-start gap-2 truncate" title={booking.pickup_location_address}>
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                            <span className="text-gray-600">{booking.pickup_location_address}</span>
                                        </div>
                                        <div className="flex items-start gap-2 truncate" title={booking.dropoff_location_address}>
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                            <span className="text-gray-600">{booking.dropoff_location_address || 'As Directed'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <div className="font-medium text-gray-900">{new Date(booking.pickup_time).toLocaleDateString()}</div>
                                    <div className="text-xs">{new Date(booking.pickup_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{booking.vehicle_types?.name || 'Vehicle'}</div>
                                    {booking.meet_and_greet && (
                                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                                            Meet & Greet
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={booking.status} />
                                </td>
                                <td className="px-6 py-4 font-medium">${booking.total_price_calculated}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {(!booking.driver_id && (booking.status === 'pending' || booking.status === 'confirmed')) ? (
                                            <button 
                                                onClick={() => handleAssignClick(booking)}
                                                className="px-3 py-1 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                                            >
                                                Assign
                                            </button>
                                        ) : booking.driver_id ? (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                <LucideUser size={12} />
                                                <span className="truncate max-w-[80px]">
                                                    {drivers?.find((d: any) => d.id === booking.driver_id)?.profiles?.full_name || 'Driver'}
                                                </span>
                                            </div>
                                        ) : null}
                                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                            <LucideMoreHorizontal size={16} className="text-gray-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <span className="text-sm text-gray-500">Showing {bookings?.length || 0} entries</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-white disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-white disabled:opacity-50" disabled>Next</button>
                </div>
            </div>
        </div>
    )
}

function DriversView({ drivers }: any) {
    const handleApprove = async (driverId: string) => {
        if (confirm('Are you sure you want to approve this driver?')) {
            const result = await approveDriver(driverId)
            if (result.error) {
                alert(result.error)
            }
        }
    }

    const handleReject = async (driverId: string) => {
        if (confirm('Are you sure you want to reject this driver?')) {
            const result = await rejectDriver(driverId)
            if (result.error) {
                alert(result.error)
            }
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg">Chauffeurs</h3>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                        <LucideFilter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        Add Driver
                    </button>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Contact</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">License</th>
                            <th className="px-6 py-3">Joined</th>
                            <th className="px-6 py-3">Rating</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {drivers && drivers.map((driver: any) => (
                            <tr key={driver.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                            {driver.profiles?.full_name?.charAt(0) || 'D'}
                                        </div>
                                        <div className="font-medium">{driver.profiles?.full_name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <LucideMail size={14} />
                                        <span>{driver.profiles?.email}</span>
                                    </div>
                                    {driver.profiles?.phone && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <LucidePhone size={14} />
                                            <span>{driver.profiles?.phone}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                        ${driver.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                        ${driver.status === 'offline' ? 'bg-gray-50 text-gray-600 border-gray-200' : ''}
                                        ${driver.status === 'pending_approval' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                                        ${driver.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                        ${!['active', 'offline', 'pending_approval', 'rejected'].includes(driver.status) ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                                    `}>
                                        {driver.status === 'active' && <LucideShieldCheck size={12} />}
                                        {driver.status === 'pending_approval' ? 'Pending' : driver.status?.charAt(0).toUpperCase() + driver.status?.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                    {driver.license_number}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {driver.created_at ? new Date(driver.created_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 font-medium">
                                        4.95 <span className="text-yellow-400">★</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {driver.status === 'pending_approval' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApprove(driver.id)}
                                                    className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(driver.id)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        <button className="text-sm font-medium text-black hover:underline">Manage</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {(!drivers || drivers.length === 0) && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No drivers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function CustomersView({ customers, onViewHistory }: any) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg">Customers</h3>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                        <LucideFilter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        Export CSV
                    </button>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Contact</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Joined</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers && customers.map((customer: any) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-600">
                                            {customer.full_name?.charAt(0) || 'C'}
                                        </div>
                                        <div className="font-medium">{customer.full_name || 'Guest User'}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <LucideMail size={14} />
                                        <span>{customer.email}</span>
                                    </div>
                                    {customer.phone && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <LucidePhone size={14} />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                        <LucideUser size={12} />
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => onViewHistory(customer)}
                                        className="text-sm font-medium text-black hover:underline"
                                    >
                                        View History
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {(!customers || customers.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No customers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function CustomerHistoryView({ customer, bookings, onBack }: any) {
    // Filter bookings for this customer
    const customerBookings = bookings?.filter((b: any) => b.customer_id === customer.id) || []

    return (
        <div className="space-y-6">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
            >
                <LucideArrowLeft size={16} /> Back to Customers
            </button>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-600 text-2xl">
                            {customer.full_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{customer.full_name}</h2>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <LucideMail size={14} /> {customer.email}
                                </span>
                                {customer.phone && (
                                    <span className="flex items-center gap-1">
                                        <LucidePhone size={14} /> {customer.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Total Spend</div>
                        <div className="text-2xl font-bold">
                             ${customerBookings.reduce((acc: number, b: any) => acc + (b.total_price_calculated || 0), 0).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-bold text-lg">Booking History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Booking ID</th>
                                <th className="px-6 py-3">Route</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Service</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customerBookings.map((booking: any) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{booking.id.slice(0, 8)}</td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-[150px] truncate" title={booking.pickup_location_address}>{booking.pickup_location_address}</div>
                                        <div className="text-xs text-gray-400">to</div>
                                        <div className="max-w-[150px] truncate" title={booking.dropoff_location_address}>{booking.dropoff_location_address || 'As Directed'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(booking.pickup_time).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 capitalize">{booking.service_type.replace('_', ' ')}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                    <td className="px-6 py-4 font-medium">${booking.total_price_calculated}</td>
                                </tr>
                            ))}
                            {customerBookings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No bookings found for this customer.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function FleetView({ fleet, vehicleTypes }: { fleet: any[], vehicleTypes: any[] }) {
    const router = useRouter()
    const [activeSubTab, setActiveSubTab] = useState<'vehicles' | 'types'>('vehicles')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false)
    const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false)
    const [editingType, setEditingType] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Vehicle Form
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        license_plate: '',
        vehicle_type_id: vehicleTypes[0]?.id || '',
        status: 'active'
    })

    // Vehicle Type Form
    const [typeFormData, setTypeFormData] = useState({
        name: '',
        description: '',
        capacity_passengers: 4,
        capacity_luggage: 2,
        base_fare_usd: 50,
        price_per_distance_usd: 3.5,
        distance_unit: 'km',
        price_per_hour_usd: 80,
        min_hours_booking: 2,
        image_url: ''
    })

    const handleEditType = (type: any) => {
        setEditingType(type)
        setTypeFormData({
            name: type.name,
            description: type.description || '',
            capacity_passengers: type.capacity_passengers,
            capacity_luggage: type.capacity_luggage,
            base_fare_usd: type.base_fare_usd,
            price_per_distance_usd: type.price_per_distance_usd,
            distance_unit: type.distance_unit || 'km',
            price_per_hour_usd: type.price_per_hour_usd,
            min_hours_booking: type.min_hours_booking || 2,
            image_url: type.image_url || ''
        })
        setIsEditTypeModalOpen(true)
    }

    const handleUpdateVehicleType = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingType) return
        setIsSubmitting(true)
        const result = await updateVehicleType(editingType.id, typeFormData)
        setIsSubmitting(false)
        if (result.success) {
            setIsEditTypeModalOpen(false)
            setEditingType(null)
            setTypeFormData({
                name: '',
                description: '',
                capacity_passengers: 4,
                capacity_luggage: 2,
                base_fare_usd: 50,
                price_per_distance_usd: 3.5,
                distance_unit: 'km',
                price_per_hour_usd: 80,
                min_hours_booking: 2,
                image_url: ''
            })
        } else {
            alert(result.error || 'Failed to update vehicle type')
        }
    }

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const result = await addVehicle(formData)
        setIsSubmitting(false)
        if (result.success) {
            setIsAddModalOpen(false)
            setFormData({
                make: '',
                model: '',
                year: new Date().getFullYear(),
                color: '',
                license_plate: '',
                vehicle_type_id: vehicleTypes[0]?.id || '',
                status: 'active'
            })
        } else {
            alert(result.error || 'Failed to add vehicle')
        }
    }

    const handleAddVehicleType = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const result = await addVehicleType(typeFormData)
        setIsSubmitting(false)
        if (result.success) {
            setIsAddTypeModalOpen(false)
            setTypeFormData({
                name: '',
                description: '',
                capacity_passengers: 4,
                capacity_luggage: 2,
                base_fare_usd: 50,
                price_per_distance_usd: 3.5,
                distance_unit: 'km',
                price_per_hour_usd: 80,
                min_hours_booking: 2,
                image_url: ''
            })
        } else {
            alert(result.error || 'Failed to add vehicle type')
        }
    }

    const handleDeleteVehicle = async (id: string) => {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            const result = await deleteVehicle(id)
            if (result.error) {
                alert(result.error)
            }
        }
    }

    const handleDeleteType = async (id: string) => {
        if (confirm('Are you sure you want to delete this vehicle type? This may affect existing vehicles and bookings.')) {
            const result = await deleteVehicleType(id)
            if (result.error) {
                alert(result.error)
            } else {
                router.refresh()
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveSubTab('vehicles')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'vehicles' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
                >
                    Vehicles
                </button>
                <button 
                    onClick={() => setActiveSubTab('types')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'types' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
                >
                    Vehicle Types
                </button>
            </div>

            {activeSubTab === 'vehicles' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="font-bold text-lg">Fleet Management</h3>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                                <LucideFilter size={16} /> Filter
                            </button>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                <LucidePlus size={16} /> Add Vehicle
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Vehicle</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">License Plate</th>
                                    <th className="px-6 py-3">Year</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {fleet && fleet.map((vehicle: any) => (
                                    <tr key={vehicle.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                                            <div className="text-xs text-gray-400 capitalize">{vehicle.color}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                {vehicle.vehicle_types?.name || 'Standard'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                            {vehicle.license_plate}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {vehicle.year}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                vehicle.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                vehicle.status === 'maintenance' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    vehicle.status === 'active' ? 'bg-green-500' : 
                                                    vehicle.status === 'maintenance' ? 'bg-yellow-500' : 
                                                    'bg-gray-500'
                                                }`}></div>
                                                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="p-1 text-gray-400 hover:text-black transition-colors">
                                                    <LucideEdit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <LucideTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!fleet || fleet.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No vehicles found in fleet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="font-bold text-lg">Vehicle Types</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsAddTypeModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                <LucidePlus size={16} /> Add Type
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Type Name</th>
                                    <th className="px-6 py-3">Capacity</th>
                                    <th className="px-6 py-3">Base Fare</th>
                                    <th className="px-6 py-3">Rates</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {vehicleTypes.map((type: any) => (
                                    <tr key={type.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{type.name}</div>
                                            <div className="text-xs text-gray-400 truncate max-w-xs">{type.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <LucideUsers size={14} /> {type.capacity_passengers}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <LucideBriefcase size={14} /> {type.capacity_luggage}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            ${type.base_fare_usd}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            <div>${type.price_per_distance_usd}/{type.distance_unit === 'km' ? 'km' : 'mi'}</div>
                                            <div>${type.price_per_hour_usd}/hr</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleEditType(type)}
                                                    className="p-1 text-gray-400 hover:text-black transition-colors"
                                                >
                                                    <LucideEdit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteType(type.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <LucideTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {vehicleTypes.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No vehicle types defined. Add one to start building your fleet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Vehicle Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Add New Vehicle</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                                <LucideX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Make</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        placeholder="e.g. Mercedes-Benz"
                                        value={formData.make}
                                        onChange={e => setFormData({...formData, make: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Model</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        placeholder="e.g. S-Class"
                                        value={formData.model}
                                        onChange={e => setFormData({...formData, model: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Year</label>
                                    <input 
                                        type="number" required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={formData.year}
                                        onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        placeholder="e.g. Black"
                                        value={formData.color}
                                        onChange={e => setFormData({...formData, color: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">License Plate</label>
                                <input 
                                    type="text" required
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all font-mono"
                                    placeholder="e.g. ABC-1234"
                                    value={formData.license_plate}
                                    onChange={e => setFormData({...formData, license_plate: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Vehicle Type</label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
                                        value={formData.vehicle_type_id}
                                        onChange={e => setFormData({...formData, vehicle_type_id: e.target.value})}
                                    >
                                        {vehicleTypes.length > 0 ? (
                                            vehicleTypes.map(type => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))
                                        ) : (
                                            <option disabled value="">No types available</option>
                                        )}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <LucideFilter size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Vehicle Type Modal */}
            {isAddTypeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Add New Vehicle Type</h3>
                            <button onClick={() => setIsAddTypeModalOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                                <LucideX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddVehicleType} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Type Name</label>
                                <input 
                                    type="text" required
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    placeholder="e.g. Business Class"
                                    value={typeFormData.name}
                                    onChange={e => setTypeFormData({...typeFormData, name: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea 
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    placeholder="e.g. Mercedes-Benz E-Class or similar"
                                    rows={2}
                                    value={typeFormData.description}
                                    onChange={e => setTypeFormData({...typeFormData, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Passengers</label>
                                    <input 
                                        type="number" required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.capacity_passengers}
                                        onChange={e => setTypeFormData({...typeFormData, capacity_passengers: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Luggage Bags</label>
                                    <input 
                                        type="number" required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.capacity_luggage}
                                        onChange={e => setTypeFormData({...typeFormData, capacity_luggage: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Base Fare ($)</label>
                                    <input 
                                        type="number" required step="0.01"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.base_fare_usd}
                                        onChange={e => setTypeFormData({...typeFormData, base_fare_usd: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Rate ($)</label>
                                    <input 
                                        type="number" required step="0.01"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.price_per_distance_usd}
                                        onChange={e => setTypeFormData({...typeFormData, price_per_distance_usd: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Unit</label>
                                    <select 
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.distance_unit}
                                        onChange={e => setTypeFormData({...typeFormData, distance_unit: e.target.value as 'mile' | 'km'})}
                                    >
                                        <option value="km">Per Kilometer</option>
                                        <option value="mile">Per Mile</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">$/Hour</label>
                                    <input 
                                        type="number" required step="0.01"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.price_per_hour_usd}
                                        onChange={e => setTypeFormData({...typeFormData, price_per_hour_usd: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Min. Hours Booking</label>
                                <input 
                                    type="number" required
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    value={typeFormData.min_hours_booking}
                                    onChange={e => setTypeFormData({...typeFormData, min_hours_booking: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Image URL (optional)</label>
                                <input 
                                    type="url"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    placeholder="https://images.unsplash.com/..."
                                    value={typeFormData.image_url}
                                    onChange={e => setTypeFormData({...typeFormData, image_url: e.target.value})}
                                />
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Vehicle Type'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Vehicle Type Modal */}
            {isEditTypeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Edit Vehicle Type</h3>
                            <button onClick={() => setIsEditTypeModalOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                                <LucideX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateVehicleType} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Type Name</label>
                                <input 
                                    type="text" required
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    placeholder="e.g. Black SUV"
                                    value={typeFormData.name}
                                    onChange={e => setTypeFormData({...typeFormData, name: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea 
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    placeholder="Enter type description..."
                                    rows={2}
                                    value={typeFormData.description}
                                    onChange={e => setTypeFormData({...typeFormData, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Passengers</label>
                                    <input 
                                        type="number" required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.capacity_passengers}
                                        onChange={e => setTypeFormData({...typeFormData, capacity_passengers: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Luggage</label>
                                    <input 
                                        type="number" required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.capacity_luggage}
                                        onChange={e => setTypeFormData({...typeFormData, capacity_luggage: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Base Fare ($)</label>
                                    <input 
                                        type="number" required step="0.01"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.base_fare_usd}
                                        onChange={e => setTypeFormData({...typeFormData, base_fare_usd: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Rate ($)</label>
                                    <input 
                                        type="number" required step="0.01"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.price_per_distance_usd}
                                        onChange={e => setTypeFormData({...typeFormData, price_per_distance_usd: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Unit</label>
                                    <select 
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.distance_unit}
                                        onChange={e => setTypeFormData({...typeFormData, distance_unit: e.target.value as 'mile' | 'km'})}
                                    >
                                        <option value="km">Per Kilometer</option>
                                        <option value="mile">Per Mile</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">$/Hour</label>
                                    <input 
                                        type="number" required step="0.01"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={typeFormData.price_per_hour_usd}
                                        onChange={e => setTypeFormData({...typeFormData, price_per_hour_usd: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Min. Hours Booking</label>
                                <input 
                                    type="number" required
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    value={typeFormData.min_hours_booking}
                                    onChange={e => setTypeFormData({...typeFormData, min_hours_booking: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Image URL (optional)</label>
                                <input 
                                    type="url"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    placeholder="https://images.unsplash.com/..."
                                    value={typeFormData.image_url}
                                    onChange={e => setTypeFormData({...typeFormData, image_url: e.target.value})}
                                />
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Vehicle Type'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}


function SettingsView({ settings, vehicleTypes }: { settings: any, vehicleTypes: any[] }) {
    const [activeSection, setActiveSection] = useState('pricing')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<any>({})

    const tabs = [
        { id: 'pricing', label: 'Pricing Rules' },
        { id: 'rates', label: 'Hourly Rates' },
        { id: 'airport', label: 'Airport Fees' },
        { id: 'time', label: 'Time Multipliers' },
        { id: 'system', label: 'System Configuration' },
    ]

    const systemDistanceUnit = settings?.pricingRules?.find((r: any) => r.name === 'SYSTEM_DEFAULT_DISTANCE_UNIT')?.description || 'km'

    const handleSystemDistanceUnitChange = async (unit: 'km' | 'mile') => {
        if (confirm(`Are you sure you want to change the default distance unit to ${unit === 'km' ? 'Kilometers' : 'Miles'}? This will affect how distances are calculated and displayed.`)) {
            setIsLoading(true)
            const result = await setSystemDistanceUnit(unit)
            setIsLoading(false)
            if (!result.success) {
                alert(result.error)
            }
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        let result: any
        
        try {
            if (activeSection === 'pricing') {
                result = await addPricingRule({
                    ...formData,
                    multiplier: parseFloat(formData.multiplier),
                    is_active: formData.is_active === 'true' || formData.is_active === true
                })
            } else if (activeSection === 'rates') {
                result = await addHourlyRate({
                    ...formData,
                    rate_per_hour: parseFloat(formData.rate_per_hour),
                    min_hours: parseInt(formData.min_hours)
                })
            } else if (activeSection === 'airport') {
                result = await addAirportFee({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            } else if (activeSection === 'time') {
                result = await addTimeMultiplier({
                    ...formData,
                    multiplier: parseFloat(formData.multiplier),
                    day_of_week: formData.day_of_week === '' ? undefined : parseInt(formData.day_of_week)
                })
            }

            if (result?.success) {
                setIsAddModalOpen(false)
                setFormData({})
                // Data will refresh via revalidatePath
            } else {
                alert(result?.error || 'Failed to add')
            }
        } catch (error) {
            console.error('Error adding setting:', error)
            alert('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this?')) return
        
        setIsLoading(true)
        let result: any
        
        try {
            if (activeSection === 'pricing') {
                result = await deletePricingRule(id)
            } else if (activeSection === 'rates') {
                result = await deleteHourlyRate(id)
            } else if (activeSection === 'airport') {
                result = await deleteAirportFee(id)
            } else if (activeSection === 'time') {
                result = await deleteTimeMultiplier(id)
            }

            if (!result?.success) {
                alert(result?.error || 'Failed to delete')
            }
        } catch (error) {
            console.error('Error deleting setting:', error)
            alert('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const openAddModal = () => {
        setFormData(
            activeSection === 'pricing' ? { multiplier: '1.0', is_active: true } :
            activeSection === 'rates' ? { vehicle_type_id: vehicleTypes[0]?.id || '', rate_per_hour: '0', min_hours: '2' } :
            activeSection === 'airport' ? { airport_code: '', fee_type: 'pickup', amount: '0' } :
            { start_time: '00:00', end_time: '23:59', multiplier: '1.0', day_of_week: '' }
        )
        setIsAddModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-1">
                <div className="flex space-x-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`
                                flex-1 py-2 text-sm font-medium rounded-lg transition-all
                                ${activeSection === tab.id 
                                    ? 'bg-black text-white shadow-sm' 
                                    : 'text-gray-500 hover:text-black hover:bg-gray-50'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeSection === 'pricing' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Global Pricing Rules</h3>
                        <button onClick={openAddModal} className="text-sm font-medium text-black hover:underline">+ Add Rule</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Rule Name</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Multiplier</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {settings?.pricingRules?.filter((r: any) => r.name !== 'SYSTEM_DEFAULT_DISTANCE_UNIT').map((rule: any) => (
                                    <tr key={rule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{rule.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{rule.description || '-'}</td>
                                        <td className="px-6 py-4 font-mono">{rule.multiplier}x</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                rule.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {rule.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(rule.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <LucideTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!settings?.pricingRules || settings.pricingRules.length === 0) && (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No pricing rules defined.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeSection === 'rates' && (
                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Hourly Service Rates</h3>
                        <button onClick={openAddModal} className="text-sm font-medium text-black hover:underline">+ Add Rate</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Vehicle Type</th>
                                    <th className="px-6 py-3">Rate / Hour</th>
                                    <th className="px-6 py-3">Min. Hours</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {settings?.hourlyRates?.map((rate: any) => (
                                    <tr key={rate.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{rate.vehicle_types?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">${rate.rate_per_hour}</td>
                                        <td className="px-6 py-4">{rate.min_hours}h</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(rate.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <LucideTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!settings?.hourlyRates || settings.hourlyRates.length === 0) && (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hourly rates configured.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeSection === 'airport' && (
                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Airport Fees</h3>
                        <button onClick={openAddModal} className="text-sm font-medium text-black hover:underline">+ Add Fee</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Airport Code</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {settings?.airportFees?.map((fee: any) => (
                                    <tr key={fee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono font-bold">{fee.airport_code}</td>
                                        <td className="px-6 py-4 capitalize">{fee.fee_type}</td>
                                        <td className="px-6 py-4">${fee.amount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(fee.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <LucideTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!settings?.airportFees || settings.airportFees.length === 0) && (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No airport fees configured.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeSection === 'time' && (
                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Time-Based Multipliers</h3>
                        <button onClick={openAddModal} className="text-sm font-medium text-black hover:underline">+ Add Rule</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Start Time</th>
                                    <th className="px-6 py-3">End Time</th>
                                    <th className="px-6 py-3">Multiplier</th>
                                    <th className="px-6 py-3">Day of Week</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {settings?.timeMultipliers?.map((tm: any) => (
                                    <tr key={tm.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono">{tm.start_time}</td>
                                        <td className="px-6 py-4 font-mono">{tm.end_time}</td>
                                        <td className="px-6 py-4 font-bold">{tm.multiplier}x</td>
                                        <td className="px-6 py-4">
                                            {tm.day_of_week === null ? 'Every Day' : 
                                             ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][tm.day_of_week]}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(tm.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <LucideTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!settings?.timeMultipliers || settings.timeMultipliers.length === 0) && (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No time multipliers configured.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeSection === 'system' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="font-bold text-lg">System Configuration</h3>
                        <p className="text-sm text-gray-500">Manage global system settings.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div>
                                <h4 className="font-medium">Default Distance Unit</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Set the unit used for distance calculations (Kilometers or Miles).
                                </p>
                            </div>
                            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                <button
                                    onClick={() => handleSystemDistanceUnitChange('km')}
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                        systemDistanceUnit === 'km' 
                                            ? 'bg-black text-white shadow-sm' 
                                            : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    Kilometers (km)
                                </button>
                                <button
                                    onClick={() => handleSystemDistanceUnitChange('mile')}
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                        systemDistanceUnit === 'mile' 
                                            ? 'bg-black text-white shadow-sm' 
                                            : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    Miles (mi)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-xl">Add {tabs.find(t => t.id === activeSection)?.label}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                                <LucideX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            {activeSection === 'pricing' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.name || ''} 
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
                                            placeholder="e.g. Holiday Surge"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier</label>
                                        <input 
                                            required
                                            type="number" 
                                            step="0.01"
                                            value={formData.multiplier || '1.0'} 
                                            onChange={e => setFormData({...formData, multiplier: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select 
                                            value={formData.is_active} 
                                            onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {activeSection === 'rates' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                        <select 
                                            required
                                            value={formData.vehicle_type_id || ''} 
                                            onChange={e => setFormData({...formData, vehicle_type_id: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            <option value="">Select Type</option>
                                            {vehicleTypes?.map((t: any) => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Hour ($)</label>
                                        <input 
                                            required
                                            type="number" 
                                            value={formData.rate_per_hour || '0'} 
                                            onChange={e => setFormData({...formData, rate_per_hour: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min. Hours</label>
                                        <input 
                                            required
                                            type="number" 
                                            value={formData.min_hours || '2'} 
                                            onChange={e => setFormData({...formData, min_hours: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
                                        />
                                    </div>
                                </>
                            )}

                            {activeSection === 'airport' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Airport Code</label>
                                        <input 
                                            required
                                            type="text" 
                                            maxLength={3}
                                            value={formData.airport_code || ''} 
                                            onChange={e => setFormData({...formData, airport_code: e.target.value.toUpperCase()})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
                                            placeholder="e.g. LAX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                                        <select 
                                            value={formData.fee_type} 
                                            onChange={e => setFormData({...formData, fee_type: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            <option value="pickup">Pickup</option>
                                            <option value="dropoff">Drop-off</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                                        <input 
                                            required
                                            type="number" 
                                            value={formData.amount || '0'} 
                                            onChange={e => setFormData({...formData, amount: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
                                        />
                                    </div>
                                </>
                            )}

                            {activeSection === 'time' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                            <input 
                                                required
                                                type="time" 
                                                value={formData.start_time || '00:00'} 
                                                onChange={e => setFormData({...formData, start_time: e.target.value})}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                            <input 
                                                required
                                                type="time" 
                                                value={formData.end_time || '23:59'} 
                                                onChange={e => setFormData({...formData, end_time: e.target.value})}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier</label>
                                        <input 
                                            required
                                            type="number" 
                                            step="0.01"
                                            value={formData.multiplier || '1.0'} 
                                            onChange={e => setFormData({...formData, multiplier: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                                        <select 
                                            value={formData.day_of_week} 
                                            onChange={e => setFormData({...formData, day_of_week: e.target.value})}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            <option value="">Every Day</option>
                                            <option value="0">Sunday</option>
                                            <option value="1">Monday</option>
                                            <option value="2">Tuesday</option>
                                            <option value="3">Wednesday</option>
                                            <option value="4">Thursday</option>
                                            <option value="5">Friday</option>
                                            <option value="6">Saturday</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Adding...' : 'Add Setting'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({ label, value, change, isPositive, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <div className="p-2 bg-gray-50 rounded-lg">
                    {icon}
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{value}</div>
                {change && (
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {change}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
        assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        completed: 'bg-green-50 text-green-700 border-green-200',
        cancelled: 'bg-red-50 text-red-700 border-red-200'
    }

    const icons: any = {
        pending: <LucideClock size={12} />,
        confirmed: <LucideCheckCircle size={12} />,
        assigned: <LucideCar size={12} />,
        completed: <LucideCheckCircle size={12} />,
        cancelled: <LucideXCircle size={12} />
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {icons[status]}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}
