import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/utils/supabase/server'

export default async function AboutPage() {
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
      
      <div className="pt-32 pb-20 px-6 lg:px-16 container mx-auto">
         <h1 className="text-4xl md:text-5xl font-bold mb-8">About Rihla Limo</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
             <div>
                 <p className="text-xl leading-relaxed text-gray-700 mb-6">
                    Rihla Limo is a premier chauffeur service dedicated to providing world-class transportation solutions for discerning clients.
                 </p>
                 <p className="text-gray-600 leading-relaxed mb-6">
                    Founded on the principles of reliability, safety, and exceptional service, we have established ourselves as the preferred choice for corporate executives, VIPs, and travelers who demand the best.
                 </p>
                 <p className="text-gray-600 leading-relaxed mb-6">
                    Our fleet consists of the latest luxury vehicles, meticulously maintained to ensure your comfort and safety. Our chauffeurs are professionally trained, vetted, and dedicated to delivering a superior experience.
                 </p>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center">
                 {/* Placeholder Image */}
                 <span className="text-gray-400">About Us Image</span>
             </div>
         </div>

         <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Safety First</h3>
                    <p className="text-gray-600">
                        Your safety is our top priority. We adhere to the strictest safety standards and protocols.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Punctuality</h3>
                    <p className="text-gray-600">
                        We respect your time. Count on us to be there when you need us, every time.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Excellence</h3>
                    <p className="text-gray-600">
                        We strive for perfection in every detail of your journey, from booking to drop-off.
                    </p>
                </div>
            </div>
         </div>
      </div>
    </div>
  )
}
