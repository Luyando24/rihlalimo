import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/utils/supabase/server'
import { LucidePlane, LucideMapPin, LucideClock, LucideCalendar } from 'lucide-react'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: userResponse } = await supabase.auth.getUser()
  const user = userResponse?.user

  let role = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} role={role} />
      
      {/* Header */}
      <div className="bg-gray-50 pt-32 pb-20 px-6 lg:px-16">
         <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
                Comprehensive luxury transportation solutions tailored to your specific needs.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 py-20 space-y-24">
         
         {/* Airport Transfers */}
         <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
                <div className="bg-gray-100 h-[400px] rounded-2xl flex items-center justify-center">
                    <LucidePlane size={64} className="text-gray-400" />
                </div>
            </div>
            <div className="w-full md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">Airport Transfers</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Start or end your journey with stress-free airport transportation. We monitor your flight status in real-time to ensure your chauffeur is there when you arrive, whether your flight is early or delayed.
                </p>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-gray-700">
                        <LucidePlane size={18} className="text-black" /> Flight Tracking
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                        <LucideClock size={18} className="text-black" /> 60 Minutes Complimentary Wait Time
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                        <LucideMapPin size={18} className="text-black" /> Meet & Greet Service
                    </li>
                </ul>
                <Link href="/book?service=airport_pickup" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 inline-block">
                    Book Airport Transfer
                </Link>
            </div>
         </div>

         {/* Point to Point */}
         <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="w-full md:w-1/2">
                <div className="bg-gray-100 h-[400px] rounded-2xl flex items-center justify-center">
                    <LucideMapPin size={64} className="text-gray-400" />
                </div>
            </div>
            <div className="w-full md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">Point-to-Point</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Seamless transportation from door to door. Whether it's a business meeting, a dinner reservation, or a special event, travel in comfort and style without the hassle of parking or navigation.
                </p>
                 <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-gray-700">
                        <LucideClock size={18} className="text-black" /> Punctual Service
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                        <LucideMapPin size={18} className="text-black" /> Fixed Pricing
                    </li>
                </ul>
                <Link href="/book?service=point_to_point" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 inline-block">
                    Book A Ride
                </Link>
            </div>
         </div>

          {/* Hourly Charter */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
                <div className="bg-gray-100 h-[400px] rounded-2xl flex items-center justify-center">
                    <LucideClock size={64} className="text-gray-400" />
                </div>
            </div>
            <div className="w-full md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">Hourly Charter</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Keep a chauffeur at your disposal for as long as you need. Perfect for days with multiple stops, shopping trips, or when your schedule is flexible and subject to change.
                </p>
                 <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-gray-700">
                        <LucideCalendar size={18} className="text-black" /> Flexible Itinerary
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                        <LucideClock size={18} className="text-black" /> Unlimited Stops
                    </li>
                </ul>
                <Link href="/book?service=hourly" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 inline-block">
                    Book Hourly
                </Link>
            </div>
         </div>

      </div>
    </div>
  )
}
