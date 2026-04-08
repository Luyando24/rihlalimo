import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { LucidePlane, LucideClock, LucideUserCheck } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Airport Transfers',
  description: 'Stress-free luxury airport transfers. Enjoy real-time flight tracking, personalized meet & greet, and complimentary wait time.',
  openGraph: {
    url: '/airports',
  },
}

export default async function AirportsPage() {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Airport Transfers</h1>
            <p className="text-xl text-gray-400 mb-8">
                Stress-free arrivals and departures at major global airports.
            </p>
            <div className="flex justify-center">
                <Link href="/book?service=airport_pickup" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors">
                    Book Airport Transfer
                </Link>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
             <div>
                 <h2 className="text-3xl font-bold mb-6">Your journey begins and ends in comfort.</h2>
                 <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Navigating busy airports can be stressful, but with Rihla Limo, your transportation is one less thing to worry about. We provide reliable, luxury transfers to and from the world&apos;s leading airports.
                 </p>
                 <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Our intelligent dispatch system tracks your flight in real-time, adjusting for early arrivals or delays so your chauffeur is always there exactly when you need them.
                 </p>
                 <Link href="/book?service=airport_pickup" className="inline-block border border-black text-black px-8 py-3 rounded-full font-medium hover:bg-black hover:text-white transition-colors">
                    View Rates
                 </Link>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center overflow-hidden">
                 <LucidePlane size={120} className="text-gray-300" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucidePlane size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Flight Tracking</h3>
                  <p className="text-gray-600">
                      We monitor your flight status automatically to ensure we are ready for you upon arrival.
                  </p>
              </div>
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideUserCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Meet & Greet</h3>
                  <p className="text-gray-600">
                      Your chauffeur will meet you inside the terminal with a personalized sign, ready to assist with luggage.
                  </p>
              </div>
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideClock size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Complimentary Wait Time</h3>
                  <p className="text-gray-600">
                      Take your time. We offer 60 minutes of complimentary wait time for all international and domestic arrivals.
                  </p>
              </div>
          </div>
      </div>
      <Footer />
    </div>
  )
}
