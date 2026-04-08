import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import { LucideLeaf, LucideZap, LucideRecycle } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sustainability',
  description: 'Rihla Limo is dedicated to driving the future of sustainable luxury transportation with electric fleets and carbon offsetting.',
  openGraph: {
    url: '/sustainability',
  },
}

export default async function SustainabilityPage() {
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
         <h1 className="text-4xl md:text-5xl font-bold mb-8">Sustainability</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
             <div>
                 <p className="text-xl leading-relaxed text-gray-700 mb-6">
                    Rihla Limo is dedicated to driving the future of sustainable luxury transportation. We recognize our responsibility to minimize our environmental impact.
                 </p>
                 <p className="text-gray-600 leading-relaxed mb-6">
                    We are actively transitioning our fleet to electric and hybrid vehicles, optimizing our routing algorithms to reduce emissions, and partnering with verified carbon offset programs to ensure every ride is a step towards a greener planet.
                 </p>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center">
                 <LucideLeaf size={120} className="text-gray-300" />
             </div>
         </div>

         <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Green Initiatives</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="mb-6 inline-block p-4 bg-white rounded-full shadow-sm">
                        <LucideZap size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Electric Fleet</h3>
                    <p className="text-gray-600">
                        We are rapidly expanding our zero-emission vehicle options, offering clients the choice of premium electric vehicles without compromising on luxury.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="mb-6 inline-block p-4 bg-white rounded-full shadow-sm">
                        <LucideRecycle size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Carbon Offsetting</h3>
                    <p className="text-gray-600">
                        For every journey taken in our traditional vehicles, we automatically invest in certified carbon reduction projects worldwide.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="mb-6 inline-block p-4 bg-white rounded-full shadow-sm">
                        <LucideLeaf size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Eco-Friendly Operations</h3>
                    <p className="text-gray-600">
                        From paperless billing to sustainable office practices and eco-conscious vehicle detailing products, we strive for sustainability in every aspect of our business.
                    </p>
                </div>
            </div>
         </div>
      </div>
      <Footer />
    </div>
  )
}
