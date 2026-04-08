import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import { LucideShieldCheck, LucideCar, LucideUserCheck } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety Standards',
  description: 'Your safety is our absolute priority. Discover our rigorous chauffeur background checks, 24/7 monitoring, and immaculate fleet standards.',
  openGraph: {
    url: '/safety',
  },
}

export default async function SafetyPage() {
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
         <h1 className="text-4xl md:text-5xl font-bold mb-8">Safety at Rihla Limo</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
             <div>
                 <p className="text-xl leading-relaxed text-gray-700 mb-6">
                    Your safety is our absolute priority. We hold ourselves to the highest standards of care to ensure every journey is secure, comfortable, and reliable.
                 </p>
                 <p className="text-gray-600 leading-relaxed mb-6">
                    From rigorous chauffeur background checks to comprehensive vehicle maintenance protocols, we implement multiple layers of security to give you complete peace of mind when you travel with us.
                 </p>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center">
                 <LucideShieldCheck size={120} className="text-gray-300" />
             </div>
         </div>

         <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Safety Pillars</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="mb-6 inline-block p-4 bg-white rounded-full shadow-sm">
                        <LucideUserCheck size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Expert Chauffeurs</h3>
                    <p className="text-gray-600">
                        Every Rihla Limo chauffeur undergoes an exhaustive background check, continuous safety training, and regular driving record evaluations.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="mb-6 inline-block p-4 bg-white rounded-full shadow-sm">
                        <LucideCar size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Immaculate Fleet</h3>
                    <p className="text-gray-600">
                        Our premium vehicles are subjected to daily inspections and rigorous scheduled maintenance by certified mechanics to ensure peak performance.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="mb-6 inline-block p-4 bg-white rounded-full shadow-sm">
                        <LucideShieldCheck size={32} className="text-black" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">24/7 Monitoring</h3>
                    <p className="text-gray-600">
                        Our dispatch team monitors every ride in real-time, providing an extra layer of security and immediate assistance if needed.
                    </p>
                </div>
            </div>
         </div>
      </div>
      <Footer />
    </div>
  )
}
