import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/utils/supabase/server'
import { LucideBuilding, LucideFileText, LucideUsers } from 'lucide-react'

export default async function CorporatePage() {
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
      
      {/* Hero Section */}
      <div className="bg-black text-white pt-32 pb-24 px-6 lg:px-16">
         <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Corporate Solutions</h1>
            <p className="text-xl text-gray-400 mb-8">
                Streamline your business travel with our comprehensive corporate transportation management platform.
            </p>
            <div className="flex justify-center gap-4">
                <a href="/contact" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors">
                    Contact Sales
                </a>
                <a href="/login" className="border border-white px-8 py-3 rounded-full font-medium hover:bg-white hover:text-black transition-colors">
                    Corporate Login
                </a>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideBuilding size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Centralized Management</h3>
                  <p className="text-gray-600">
                      Manage all your company's transportation needs from a single dashboard. Add employees, set limits, and track usage.
                  </p>
              </div>
              <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideFileText size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Simplified Billing</h3>
                  <p className="text-gray-600">
                      Monthly invoicing, cost center coding, and detailed reporting make expense reconciliation effortless.
                  </p>
              </div>
              <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <LucideUsers size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Priority Service</h3>
                  <p className="text-gray-600">
                      Enjoy priority booking status, dedicated account managers, and 24/7 support for your team.
                  </p>
              </div>
          </div>
      </div>
    </div>
  )
}
