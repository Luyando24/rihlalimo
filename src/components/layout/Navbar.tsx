import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { signout } from '@/app/login/actions'
import { LucideUser, LucideLogOut } from 'lucide-react'

interface NavbarProps {
  user?: User | null
  role?: string | null
}

export default function Navbar({ user, role }: NavbarProps) {
  const getDashboardLink = () => {
    if (role === 'admin') return '/admin'
    if (role === 'driver') return '/driver'
    return '/dashboard'
  }

  return (
    <nav className="bg-black text-white h-16 flex items-center justify-between px-6 lg:px-16 fixed w-full z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-normal tracking-tight">
          RIHLA LIMO
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/book" className="hover:text-gray-300 transition-colors">Services</Link>
          <Link href="/fleet" className="hover:text-gray-300 transition-colors">Fleet</Link>
          <Link href="/corporate" className="hover:text-gray-300 transition-colors">Corporate</Link>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm font-medium">
        {user ? (
          <div className="flex items-center gap-4">
             <Link href={getDashboardLink()} className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                <LucideUser className="w-4 h-4" />
                <span>Dashboard</span>
             </Link>
             <form action={signout}>
                <button type="submit" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                    <LucideLogOut className="w-4 h-4" />
                    <span>Log out</span>
                </button>
             </form>
          </div>
        ) : (
          <>
            <Link href="/login" className="flex items-center gap-2 hover:bg-gray-800 px-3 py-2 rounded-full transition-colors">
                Log in
            </Link>
            <Link href="/login" className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
                Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
