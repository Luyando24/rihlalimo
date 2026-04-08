import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'

export default async function NewsroomPage() {
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
         <h1 className="text-4xl md:text-5xl font-bold mb-8">Newsroom</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
             <div>
                 <p className="text-xl leading-relaxed text-gray-700 mb-6">
                    Stay updated with the latest news, announcements, and developments from Rihla Limo.
                 </p>
                 <p className="text-gray-600 leading-relaxed mb-6">
                    From new service launches to industry insights, our newsroom keeps you informed about our journey in redefining luxury transportation.
                 </p>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center">
                 <span className="text-gray-400">Newsroom Image</span>
             </div>
         </div>

         <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Latest Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-2">March 2024</div>
                    <h3 className="text-xl font-bold mb-4">Fleet Expansion</h3>
                    <p className="text-gray-600">
                        Rihla Limo announces the addition of 50 new luxury vehicles to serve growing demand in metropolitan areas.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-2">February 2024</div>
                    <h3 className="text-xl font-bold mb-4">Sustainability Initiative</h3>
                    <p className="text-gray-600">
                        Launch of our eco-friendly fleet program featuring hybrid and electric luxury vehicles.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-2">January 2024</div>
                    <h3 className="text-xl font-bold mb-4">Technology Upgrade</h3>
                    <p className="text-gray-600">
                        New AI-powered dispatch system improves response times by 30% across all service areas.
                    </p>
                </div>
            </div>
         </div>
      </div>
      <Footer />
    </div>
  )
}