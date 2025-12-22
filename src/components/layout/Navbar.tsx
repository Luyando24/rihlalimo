import Link from 'next/link'

export default function Navbar() {
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
        <Link href="/login" className="flex items-center gap-2 hover:bg-gray-800 px-3 py-2 rounded-full transition-colors">
            Log in
        </Link>
        <Link href="/login" className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
            Sign up
        </Link>
      </div>
    </nav>
  )
}
