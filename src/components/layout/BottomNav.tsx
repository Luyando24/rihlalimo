'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Car, User, Grid, Calendar } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface BottomNavProps {
  user: SupabaseUser | null
  role?: string | null
}

export default function BottomNav({ user, role }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin'
    if (role === 'driver') return '/driver'
    return '/dashboard'
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home
    },
    {
      label: 'Book',
      href: '/book',
      icon: Car
    },
    {
      label: 'Services',
      href: '/services', // We might need to create this page or link to section
      icon: Grid
    },
    {
      label: user ? 'Account' : 'Log in',
      href: user ? getDashboardLink() : '/login',
      icon: User
    }
  ]

  // If user is logged in, maybe show "My Rides" instead of Services?
  // Or just keep it simple. Let's keep Services for now as it's a landing page feature.
  // Actually, for a logged in user, "My Rides" is more useful.
  
  if (user && role !== 'admin' && role !== 'driver') {
      // Replace Services with My Rides/History for regular users if we had a specific route
      // But dashboard covers it.
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 pb-6 z-50 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const active = isActive(item.href)
        const Icon = item.icon
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center gap-1 ${active ? 'text-black' : 'text-gray-400'}`}
          >
            <Icon className={`w-6 h-6 ${active ? 'stroke-2' : 'stroke-1'}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
