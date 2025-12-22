'use client'

import { LucideArrowRight, LucideMapPin, LucideClock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Hero() {
  const router = useRouter()
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')

  const handleSearch = () => {
    // In a real app, pass query params to the book page
    router.push(`/book?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`)
  }

  return (
    <section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden pt-16">
      <div className="container mx-auto px-6 lg:px-16 flex flex-col md:flex-row items-center">
        
        {/* Left Content - Booking Widget */}
        <div className="w-full md:w-1/2 lg:w-5/12 z-10 py-12">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8 text-black">
            Experience Premium Chauffeur Services
          </h1>

          <div className="bg-white p-0 md:p-6 rounded-xl md:shadow-lg md:border border-gray-100 max-w-md">
            <div className="space-y-4">
               {/* Inputs with connecting line */}
               <div className="relative space-y-3">
                 {/* Connecting Line */}
                 <div className="absolute left-[19px] top-12 bottom-12 w-0.5 bg-black z-0"></div>

                 {/* Pickup */}
                 <div className="relative z-10 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black rounded-full"></div>
                    <input 
                        type="text" 
                        placeholder="Pickup location"
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <LucideMapPin className="w-5 h-5" />
                    </div>
                 </div>

                 {/* Dropoff */}
                 <div className="relative z-10 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black border-2 border-black rect-none" style={{borderRadius: 0}}></div>
                    <input 
                        type="text" 
                        placeholder="Dropoff location"
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                    />
                 </div>
               </div>
               
               {/* Time Selection */}
               <div className="flex gap-2">
                   <div className="relative w-full">
                       <select 
                        className="w-full py-3 px-4 bg-gray-100 rounded-lg text-left font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black text-black"
                        defaultValue="now"
                       >
                           <option value="now">Pickup now</option>
                           <option value="later">Schedule for later</option>
                       </select>
                       <LucideClock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                   </div>
               </div>

               <button 
                onClick={handleSearch}
                className="w-full py-4 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-4"
               >
                   See prices
               </button>
            </div>
          </div>
        </div>

        {/* Right Content - Image */}
        <div className="w-full md:w-1/2 lg:w-7/12 relative h-[50vh] md:h-auto md:absolute md:right-0 md:top-0 md:bottom-0">
             {/* Using a placeholder that mimics the Uber style - clean, lifestyle or abstract car */}
             <div 
                className="w-full h-full bg-cover bg-center md:rounded-l-3xl"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')",
                    clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" 
                }}
             >
                {/* Mobile clip path reset, handled by CSS mostly but inline for quick win */}
             </div>
             {/* Fallback for mobile viewing if clip-path looks weird */}
             <style jsx>{`
                @media (max-width: 768px) {
                    div[style*="clipPath"] {
                        clip-path: none !important;
                        border-radius: 0 !important;
                    }
                }
             `}</style>
        </div>
      </div>
    </section>
  )
}
