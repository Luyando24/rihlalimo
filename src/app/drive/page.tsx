import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { LucideDollarSign, LucideCalendar, LucideCar } from 'lucide-react'

export default async function DrivePage() {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Drive with Rihla Limo</h1>
            <p className="text-xl text-gray-400 mb-8">
                Join our elite network of professional chauffeurs and elevate your career.
            </p>
            <div className="flex justify-center gap-4">
                <Link href="/drive/register" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors">
                    Apply Now
                </Link>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-24">
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideDollarSign size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Competitive Earnings</h3>
                  <p className="text-gray-600">
                      Earn premium rates per trip, with clear and transparent payout structures.
                  </p>
              </div>
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideCalendar size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Flexible Schedule</h3>
                  <p className="text-gray-600">
                      Work when it suits you. Set your own availability and manage your time effectively.
                  </p>
              </div>
              <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideCar size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Premium Fleet</h3>
                  <p className="text-gray-600">
                      Drive the latest luxury vehicles and cater to a high-end, respectful clientele.
                  </p>
              </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-12 lg:p-20 text-center">
             <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
             <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                 We are always looking for dedicated, professional chauffeurs to join our network. If you value safety, punctuality, and excellence, we want you on our team.
             </p>
             <Link href="/drive/register" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                 Complete Your Application
             </Link>
          </div>
      </div>
      <Footer />
    </div>
  )
}
