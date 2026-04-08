import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { LucideHelpCircle, LucideMessageCircle, LucideFileText, LucidePhone } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'How can we assist you today? Find answers to common questions about Rihla Limo or get in touch with our support team.',
  openGraph: {
    url: '/help',
  },
}

export default async function HelpCenterPage() {
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Help Center</h1>
            <p className="text-xl text-gray-400 mb-8">
                How can we assist you today? Find answers to common questions or get in touch.
            </p>
            <div className="max-w-2xl mx-auto bg-white rounded-full p-2 flex items-center shadow-lg">
                <LucideHelpCircle className="text-gray-400 ml-4 mr-2" size={24} />
                <input 
                    type="text" 
                    placeholder="Search for answers..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-black px-2 py-2"
                />
                <button className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors">
                    Search
                </button>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              <Link href="/contact" className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <LucideMessageCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Contact Support</h3>
                  <p className="text-gray-600">
                      Reach out to our 24/7 support team for immediate assistance with your bookings.
                  </p>
              </Link>

              <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <LucideFileText size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Booking Guide</h3>
                  <p className="text-gray-600">
                      Learn how to manage, modify, or cancel your reservations easily.
                  </p>
              </div>

              <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <LucidePhone size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Chauffeur Support</h3>
                  <p className="text-gray-600">
                      Resources and help for our network of professional chauffeurs.
                  </p>
              </div>
          </div>

          <div>
             <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
             <div className="max-w-3xl mx-auto space-y-6">
                 <div className="border border-gray-200 rounded-xl p-6">
                     <h3 className="text-lg font-bold mb-2">What is your cancellation policy?</h3>
                     <p className="text-gray-600">
                         Cancellations made 24 hours prior to the scheduled pickup time are fully refundable. Cancellations within 24 hours may be subject to a fee.
                     </p>
                 </div>
                 <div className="border border-gray-200 rounded-xl p-6">
                     <h3 className="text-lg font-bold mb-2">How do I track my chauffeur?</h3>
                     <p className="text-gray-600">
                         Once your chauffeur is en route, you will receive an SMS and email with their contact details and a real-time tracking link.
                     </p>
                 </div>
                 <div className="border border-gray-200 rounded-xl p-6">
                     <h3 className="text-lg font-bold mb-2">Do you provide child seats?</h3>
                     <p className="text-gray-600">
                         Yes, child and infant seats can be requested during the booking process under &quot;Special Requests&quot; for no additional charge.
                     </p>
                 </div>
             </div>
          </div>
      </div>
      <Footer />
    </div>
  )
}