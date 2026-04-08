import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white py-20">
      <div className="container mx-auto px-6 lg:px-16">
         <div className="mb-16">
            <h2 className="text-2xl font-normal tracking-tight mb-8">RIHLA LIMO</h2>
            <Link href="/help" className="text-sm font-medium hover:text-gray-300">Visit Help Center</Link>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm mb-20">
            <div>
               <h3 className="font-bold mb-4 text-gray-400">Company</h3>
               <ul className="space-y-3">
                  <li><Link href="/about" className="hover:text-gray-300">About us</Link></li>
                  <li><Link href="/services" className="hover:text-gray-300">Our offerings</Link></li>
                  <li><Link href="/newsroom" className="hover:text-gray-300">News</Link></li>
                  <li><Link href="/investors" className="hover:text-gray-300">Investors</Link></li>
               </ul>
            </div>
            <div>
               <h3 className="font-bold mb-4 text-gray-400">Products</h3>
               <ul className="space-y-3">
                  <li><Link href="/point-to-point" className="hover:text-gray-300">Point-to-Point Transfers</Link></li>
                  <li><Link href="/drive" className="hover:text-gray-300">Drive</Link></li>
                  <li><Link href="/corporate" className="hover:text-gray-300">Business</Link></li>
               </ul>
            </div>
            <div>
               <h3 className="font-bold mb-4 text-gray-400">Global citizenship</h3>
               <ul className="space-y-3">
                  <li><Link href="/safety" className="hover:text-gray-300">Safety</Link></li>
                  <li><Link href="/diversity" className="hover:text-gray-300">Diversity and Inclusion</Link></li>
                  <li><Link href="/sustainability" className="hover:text-gray-300">Sustainability</Link></li>
               </ul>
            </div>
            <div>
               <h3 className="font-bold mb-4 text-gray-400">Travel</h3>
               <ul className="space-y-3">
                  <li><Link href="/airports" className="hover:text-gray-300">Airports</Link></li>
                  <li><Link href="/cities" className="hover:text-gray-300">Cities</Link></li>
               </ul>
            </div>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 text-xs text-gray-400">
            <div className="flex gap-4 mb-4 md:mb-0">
               <span>&copy; {new Date().getFullYear()} Rihla Limo Technologies Inc.</span>
            </div>
            <div className="flex gap-6">
               <Link href="/privacy" className="hover:text-white">Privacy</Link>
               <Link href="/accessibility" className="hover:text-white">Accessibility</Link>
               <Link href="/terms" className="hover:text-white">Terms</Link>
            </div>
         </div>
      </div>
   </footer>
  )
}
