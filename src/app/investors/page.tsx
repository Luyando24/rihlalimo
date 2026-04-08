import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'

export default async function InvestorsPage() {
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
         <h1 className="text-4xl md:text-5xl font-bold mb-8">Investors</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
             <div>
                 <p className="text-xl leading-relaxed text-gray-700 mb-6">
                    Rihla Limo is committed to creating long-term value for our investors through sustainable growth and innovation in the luxury transportation sector.
                 </p>
                 <p className="text-gray-600 leading-relaxed mb-6">
                    As a rapidly growing company in the premium transportation market, we continue to expand our footprint while maintaining our commitment to excellence and profitability.
                 </p>
             </div>
             <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center">
                 <span className="text-gray-400">Investors Image</span>
             </div>
         </div>

         <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Financial Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-gray-50 rounded-xl text-center">
                    <div className="text-4xl font-bold text-black mb-2">$50M</div>
                    <h3 className="text-lg font-semibold mb-2">Annual Revenue</h3>
                    <p className="text-gray-600">
                        Consistent year-over-year growth in premium transportation services.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl text-center">
                    <div className="text-4xl font-bold text-black mb-2">500+</div>
                    <h3 className="text-lg font-semibold mb-2">Fleet Vehicles</h3>
                    <p className="text-gray-600">
                        Expanding luxury fleet serving major metropolitan markets.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl text-center">
                    <div className="text-4xl font-bold text-black mb-2">25%</div>
                    <h3 className="text-lg font-semibold mb-2">Market Growth</h3>
                    <p className="text-gray-600">
                        Year-over-year expansion in key service territories.
                    </p>
                </div>
            </div>
         </div>

         <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Investment Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Market Leadership</h3>
                    <p className="text-gray-600">
                        Positioned as a premium brand in the growing luxury transportation market with strong brand recognition and customer loyalty.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Technology Innovation</h3>
                    <p className="text-gray-600">
                        Continuous investment in proprietary technology platforms for booking, dispatch, and customer experience management.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Sustainable Growth</h3>
                    <p className="text-gray-600">
                        Proven track record of profitable expansion with disciplined capital allocation and strong unit economics.
                    </p>
                </div>
                <div className="p-8 bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Experienced Team</h3>
                    <p className="text-gray-600">
                        Leadership team with extensive experience in transportation, technology, and hospitality industries.
                    </p>
                </div>
            </div>
         </div>
      </div>
      <Footer />
    </div>
  )
}