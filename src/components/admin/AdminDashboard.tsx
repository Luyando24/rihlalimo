'use client'

import { useState } from 'react'
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
  LucideClock
} from 'lucide-react'
import Link from 'next/link'
import { signout } from '@/app/login/actions'
import { approveDriver } from '@/app/admin/actions'

export default function AdminDashboard({ profile, bookings, drivers, customers, fleet, settings, stats }: any) {
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
                <BookingsView bookings={bookings} />
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
                <FleetView fleet={fleet} />
            )}
            {activeTab === 'settings' && (
                <SettingsView settings={settings} />
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

function BookingsView({ bookings }: any) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                                    <div className="max-w-[150px] truncate" title={booking.pickup_location_address}>{booking.pickup_location_address}</div>
                                    <div className="text-xs text-gray-400">to</div>
                                    <div className="max-w-[150px] truncate" title={booking.dropoff_location_address}>{booking.dropoff_location_address || 'As Directed'}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <div>{new Date(booking.pickup_time).toLocaleDateString()}</div>
                                    <div className="text-xs">{new Date(booking.pickup_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </td>
                                <td className="px-6 py-4 capitalize">{booking.service_type.replace('_', ' ')}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={booking.status} />
                                </td>
                                <td className="px-6 py-4 font-medium">${booking.total_price_calculated}</td>
                                <td className="px-6 py-4">
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                        <LucideMoreHorizontal size={16} className="text-gray-500" />
                                    </button>
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
                                        ${!['active', 'offline', 'pending_approval'].includes(driver.status) ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
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
                                            <button 
                                                onClick={() => handleApprove(driver.id)}
                                                className="px-3 py-1 bg-black text-white rounded text-xs font-medium hover:bg-gray-800"
                                            >
                                                Approve
                                            </button>
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

function FleetView({ fleet }: any) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg">Fleet Management</h3>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                        <LucideFilter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        Add Vehicle
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
                                    <button className="text-sm font-medium text-black hover:underline">Edit</button>
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
    )
}

function SettingsView({ settings }: any) {
    const [activeSection, setActiveSection] = useState('pricing')

    const tabs = [
        { id: 'pricing', label: 'Pricing Rules' },
        { id: 'rates', label: 'Hourly Rates' },
        { id: 'airport', label: 'Airport Fees' },
        { id: 'time', label: 'Time Multipliers' },
    ]

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
                        <button className="text-sm font-medium text-black hover:underline">+ Add Rule</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Rule Name</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Multiplier</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {settings?.pricingRules?.map((rule: any) => (
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
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:underline">Edit</button>
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
                        <button className="text-sm font-medium text-black hover:underline">+ Add Rate</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Vehicle Type</th>
                                    <th className="px-6 py-3">Rate / Hour</th>
                                    <th className="px-6 py-3">Min. Hours</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {settings?.hourlyRates?.map((rate: any) => (
                                    <tr key={rate.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{rate.vehicle_types?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">${rate.rate_per_hour}</td>
                                        <td className="px-6 py-4">{rate.min_hours}h</td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:underline">Edit</button>
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
                        <button className="text-sm font-medium text-black hover:underline">+ Add Fee</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Airport Code</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {settings?.airportFees?.map((fee: any) => (
                                    <tr key={fee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono font-bold">{fee.airport_code}</td>
                                        <td className="px-6 py-4 capitalize">{fee.fee_type}</td>
                                        <td className="px-6 py-4">${fee.amount}</td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:underline">Edit</button>
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
                        <button className="text-sm font-medium text-black hover:underline">+ Add Rule</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Start Time</th>
                                    <th className="px-6 py-3">End Time</th>
                                    <th className="px-6 py-3">Multiplier</th>
                                    <th className="px-6 py-3">Day of Week</th>
                                    <th className="px-6 py-3">Actions</th>
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
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:underline">Edit</button>
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
        completed: 'bg-green-50 text-green-700 border-green-200',
        cancelled: 'bg-red-50 text-red-700 border-red-200'
    }

    const icons: any = {
        pending: <LucideClock size={12} />,
        confirmed: <LucideCheckCircle size={12} />,
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
