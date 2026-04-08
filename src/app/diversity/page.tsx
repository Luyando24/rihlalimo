import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import { LucideUsers, LucideHeart, LucideGlobe } from 'lucide-react'

export default async function DiversityPage() {
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
      
      <div className="pt-32 pb-20 px-6 lg:px-16 container mx-auto">
         <h1 className="text-4xl md:text-5xl font-bold mb-8">Diversity & Inclusion</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
             <div>
                 <p className="text-xl leading-relaxed text-gray-700 mb-6">
                    At Rihla Limo, we believe that diversity is our greatest strength. We are committed to fostering an inclusive environment where everyone feels valued, respected, and empowered.
                 </p>
                 <p className="text-gray-600 leading-relaxed mb-6">
                    Our dedication to diversity extends across our entire organization—from our executive leadership and dedicated staff to our network of professional chauffeurs and the diverse clientele we serve globally.
                 </p>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center">
                 <LucideUsers size={120} className="text-gray-300" />
             </div>
         </div>

         <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Commitment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="mb-6 inline-block p-4 bg-white rounded-full shadow-sm">
                        <LucideHeart size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">An Inclusive Workplace</h3>
                    <p className="text-gray-600">
                        We actively cultivate a culture of belonging, providing equal opportunities for growth and development regardless of race, gender, orientation, or background.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="mb-6 inline-block p-4 bg-white rounded-full shadow-sm">
                        <LucideGlobe size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Global Perspectives</h3>
                    <p className="text-gray-600">
                        Our workforce reflects the diverse global communities we operate in, allowing us to better understand and anticipate the unique needs of every client.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="mb-6 inline-block p-4 bg-white rounded-full shadow-sm">
                        <LucideUsers size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Supplier Diversity</h3>
                    <p className="text-gray-600">
                        We partner with diverse-owned businesses across our supply chain, promoting economic inclusion and supporting local communities.
                    </p>
                </div>
            </div>
         </div>
      </div>
      <Footer />
    </div>
  )
}
