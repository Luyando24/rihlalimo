import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { LucideMapPin, LucideClock, LucideShieldCheck } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Point-to-Point Transfers',
  description: 'Seamless, direct transportation from door to door. Travel in luxury without the hassle with Rihla Limo.',
  openGraph: {
    url: '/point-to-point',
  },
}

export default async function PointToPointPage() {
  const supabase = await createClient()
  const { data: userResponse } = await supabase.auth.getUser()
  const user = userResponse?.user

  let role = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar user={user} role={role} />
      
      {/* Hero Section */}
      <div className="bg-black text-white pt-32 pb-24 px-6 lg:px-16">
         <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Point-to-Point Transfers</h1>
            <p className="text-xl text-gray-400 mb-8">
                Seamless, direct transportation from door to door. Travel in luxury without the hassle.
            </p>
            <div className="flex justify-center">
                <Link href="/book?service=point_to_point" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors">
                    Book a Ride
                </Link>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
             <div>
                 <h2 className="text-3xl font-bold mb-6">Direct, comfortable, and reliable.</h2>
                 <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Whether you are heading to a crucial business meeting, a dinner reservation, or a special event, our point-to-point service ensures you arrive in style and on time. 
                 </p>
                 <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Enjoy the privacy of your own chauffeured vehicle. Avoid the stress of navigating traffic, searching for parking, or waiting for ride-shares. We offer fixed pricing with no hidden fees, providing complete transparency before you step into the car.
                 </p>
                 <Link href="/book?service=point_to_point" className="inline-block border border-black text-black px-8 py-3 rounded-full font-medium hover:bg-black hover:text-white transition-colors">
                    Get an Estimate
                 </Link>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center overflow-hidden">
                 <img
                     src="/premium-sedan.png"
                     alt="Point-to-point transfer"
                     className="w-3/4 h-auto object-contain"
                 />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideClock size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Punctual Service</h3>
                  <p className="text-gray-600">
                      Our chauffeurs arrive early, ensuring you are never late for your commitments.
                  </p>
              </div>
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideMapPin size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Door-to-Door</h3>
                  <p className="text-gray-600">
                      Direct routing from your exact pickup location to your final destination.
                  </p>
              </div>
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Fixed Pricing</h3>
                  <p className="text-gray-600">
                      Know the cost upfront with our transparent, distance-based pricing model.
                  </p>
              </div>
          </div>
      </div>
      <Footer />
    </div>
  )
}
