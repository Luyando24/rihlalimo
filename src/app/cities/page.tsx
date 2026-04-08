import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { LucideGlobe, LucideMapPin, LucideStar } from 'lucide-react'

export default async function CitiesPage() {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Global Cities</h1>
            <p className="text-xl text-gray-400 mb-8">
                Experience consistent, premium chauffeur services in major cities worldwide.
            </p>
            <div className="flex justify-center">
                <Link href="/book" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors">
                    Book a Ride
                </Link>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
             <div>
                 <h2 className="text-3xl font-bold mb-6">Your local chauffeur, globally.</h2>
                 <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Whether you are traveling to New York, London, Dubai, or Tokyo, Rihla Limo provides a familiar standard of excellence. You can count on our vetted professional chauffeurs and luxury fleet anywhere you go.
                 </p>
                 <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    We maintain strict global standards so you receive the exact same level of service, safety, and reliability across our entire international network.
                 </p>
                 <Link href="/book" className="inline-block border border-black text-black px-8 py-3 rounded-full font-medium hover:bg-black hover:text-white transition-colors">
                    Explore Network
                 </Link>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center overflow-hidden">
                 <LucideGlobe size={120} className="text-gray-300" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideMapPin size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Local Expertise</h3>
                  <p className="text-gray-600">
                      Our chauffeurs are local experts who know the best routes and the unique rhythm of their city.
                  </p>
              </div>
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideStar size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Consistent Quality</h3>
                  <p className="text-gray-600">
                      Enjoy the same premium vehicles and five-star service standards regardless of your destination.
                  </p>
              </div>
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideGlobe size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Seamless Booking</h3>
                  <p className="text-gray-600">
                      Manage all your international travel from a single, unified booking platform.
                  </p>
              </div>
          </div>
      </div>
      <Footer />
    </div>
  )
}
