import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/home/Hero'
import { LucideCar, LucideShieldCheck, LucideClock, LucideMapPin, LucideArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      <Navbar />
      <Hero />

      {/* Suggestions / Services Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-16">
          <h2 className="text-3xl font-bold mb-12">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard 
               title="Ride" 
               description="Seamless Point-to-Point Transfers. Luxury at your command."
               image="https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2036&auto=format&fit=crop"
               link="/book"
            />
             <ServiceCard 
               title="Hourly" 
               description="Hourly Charter. Your personal chauffeur for the day."
               image="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069&auto=format&fit=crop"
               link="/book"
            />
             <ServiceCard 
               title="Airport" 
               description="Airport Transfers. Stress-free arrivals and departures."
               image="https://images.unsplash.com/photo-1583267746897-2cf415887172?q=80&w=2070&auto=format&fit=crop"
               link="/book"
            />
          </div>
        </div>
      </section>

      {/* Feature Section with Image on Left */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-16 flex flex-col md:flex-row items-center gap-16">
           <div className="w-full md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop" 
                alt="Chauffeur opening door" 
                className="rounded-xl shadow-none w-full object-cover h-[400px]"
              />
           </div>
           <div className="w-full md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Manage Your Premium Bookings
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Track your rides, view booking history, and manage your profile with ease. Your luxury travel dashboard.
              </p>
              <div className="flex gap-4">
                 <Link href="/login" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                    Log in
                 </Link>
                 <Link href="/login" className="bg-gray-100 text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors">
                    Sign up
                 </Link>
              </div>
           </div>
        </div>
      </section>

       {/* Feature Section with Image on Right */}
       <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-16 flex flex-col md:flex-row-reverse items-center gap-16">
           <div className="w-full md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" 
                alt="Luxury Car Interior" 
                className="rounded-xl shadow-none w-full object-cover h-[400px]"
              />
           </div>
           <div className="w-full md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Join Our Elite Chauffeur Network
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Partner with Rihla Limo. Drive premium vehicles and serve a distinguished clientele. Competitive earnings and flexible schedules.
              </p>
              <Link href="/drive/register" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                 Get started
              </Link>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-20">
        <div className="container mx-auto px-6 lg:px-16">
           <div className="mb-16">
             <h2 className="text-2xl font-normal tracking-tight mb-8">RIHLA LIMO</h2>
             <Link href="/login" className="text-sm font-medium hover:text-gray-300">Visit Help Center</Link>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm mb-20">
              <div>
                 <h3 className="font-bold mb-4 text-gray-400">Company</h3>
                 <ul className="space-y-3">
                    <li><Link href="#" className="hover:text-gray-300">About us</Link></li>
                    <li><Link href="#" className="hover:text-gray-300">Our offerings</Link></li>
                    <li><Link href="#" className="hover:text-gray-300">Newsroom</Link></li>
                    <li><Link href="#" className="hover:text-gray-300">Investors</Link></li>
                 </ul>
              </div>
              <div>
                 <h3 className="font-bold mb-4 text-gray-400">Products</h3>
                 <ul className="space-y-3">
                    <li><Link href="#" className="hover:text-gray-300">Ride</Link></li>
                    <li><Link href="#" className="hover:text-gray-300">Drive</Link></li>
                    <li><Link href="#" className="hover:text-gray-300">Business</Link></li>
                 </ul>
              </div>
              <div>
                 <h3 className="font-bold mb-4 text-gray-400">Global citizenship</h3>
                 <ul className="space-y-3">
                    <li><Link href="#" className="hover:text-gray-300">Safety</Link></li>
                    <li><Link href="#" className="hover:text-gray-300">Diversity and Inclusion</Link></li>
                    <li><Link href="#" className="hover:text-gray-300">Sustainability</Link></li>
                 </ul>
              </div>
              <div>
                 <h3 className="font-bold mb-4 text-gray-400">Travel</h3>
                 <ul className="space-y-3">
                    <li><Link href="#" className="hover:text-gray-300">Airports</Link></li>
                    <li><Link href="#" className="hover:text-gray-300">Cities</Link></li>
                 </ul>
              </div>
           </div>
           
           <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 text-xs text-gray-400">
              <div className="flex gap-4 mb-4 md:mb-0">
                 <span>&copy; {new Date().getFullYear()} Rihla Limo Technologies Inc.</span>
              </div>
              <div className="flex gap-6">
                 <Link href="#" className="hover:text-white">Privacy</Link>
                 <Link href="#" className="hover:text-white">Accessibility</Link>
                 <Link href="#" className="hover:text-white">Terms</Link>
              </div>
           </div>
        </div>
      </footer>
    </div>
  )
}

function ServiceCard({ title, description, image, link }: any) {
    return (
        <div className="bg-gray-100 rounded-xl overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
            <div className="p-6 flex-1">
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-4">{description}</p>
                <Link href={link} className="inline-flex items-center text-sm font-medium hover:underline">
                    Details <LucideArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
            <div className="h-32 w-full overflow-hidden flex items-end justify-end">
                 <img src={image} alt={title} className="w-32 h-auto object-contain mr-4 mb-4" />
            </div>
        </div>
    )
}
