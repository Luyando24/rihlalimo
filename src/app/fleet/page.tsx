import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/utils/supabase/server'
import { LucideUsers, LucideBriefcase } from 'lucide-react'
import Link from 'next/link'

export default async function FleetPage() {
  const supabase = await createClient()
  const { data: userResponse } = await supabase.auth.getUser()
  const user = userResponse?.user

  let role = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role
  }

  const { data: vehicleTypes } = await supabase.from('vehicle_types').select('*')

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} role={role} />
      <div className="pt-24 pb-12 px-6 lg:px-16 container mx-auto">
        <h1 className="text-4xl font-bold mb-4">Our Fleet</h1>
        <p className="text-lg text-gray-600 mb-12">Experience luxury and comfort with our premium selection of vehicles.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicleTypes?.map((vehicle) => (
            <div key={vehicle.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
               <div className="h-64 bg-gray-100 relative">
                  {/* Placeholder for image if no URL */}
                  {vehicle.image_url ? (
                    <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        No Image Available
                    </div>
                  )}
               </div>
               <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">{vehicle.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-1">{vehicle.description}</p>
                  
                  <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                     <div className="flex items-center gap-2">
                        <LucideUsers size={16} />
                        <span>{vehicle.capacity_passengers} Passengers</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <LucideBriefcase size={16} />
                        <span>{vehicle.capacity_luggage} Luggage</span>
                     </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                     <div>
                        <span className="text-xs text-gray-500 uppercase font-medium">Starting at</span>
                        <div className="font-bold text-lg">${vehicle.base_fare_usd}</div>
                     </div>
                     <Link href="/book?service=point_to_point" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        Book Now
                     </Link>
                  </div>
               </div>
            </div>
          ))}
          
          {(!vehicleTypes || vehicleTypes.length === 0) && (
             <div className="col-span-full text-center py-12 text-gray-500">
                No vehicles found in the fleet at the moment.
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
