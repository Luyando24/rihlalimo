'use client'

import { LucideArrowRight, LucideMapPin, LucideClock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api'

const libraries: ('places')[] = ['places']

export default function Hero() {
  const router = useRouter()
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [errors, setErrors] = useState<{ pickup?: string; dropoff?: string }>({})
  const [autoOptions, setAutoOptions] = useState<google.maps.places.AutocompleteOptions>({})

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  const onPickupLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setPickupAutocomplete(autocomplete)
  }
  const formatAddress = (place: google.maps.places.PlaceResult) => {
    const formatted = place.formatted_address || '';
    const name = place.name || '';
    const components = place.address_components || [];

    // 1. Clean the formatted address of plus codes
    // Regex for plus codes (both long 8FVC9G8F+6X and short 9G8F+6X)
    let cleaned = formatted.replace(/^[A-Z0-9]{4,8}\+[A-Z0-9]{2,}(,\s*)?/, '').trim();

    // 2. If the 'name' is a specific place (not a plus code and not just a street number)
    // and it's not already at the start of the cleaned address
    const isPlusCode = (str: string) => /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,}$/.test(str);
    
    if (name && !isPlusCode(name) && !cleaned.startsWith(name)) {
      // Check if name is just a street number (common in some regions)
      if (!/^\d+$/.test(name)) {
        return `${name}, ${cleaned}`;
      }
    }

    // 3. If cleaned address is too short (e.g., just "City, Country"), try to inject more detail from components
    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount < 2) {
      const neighborhood = components.find(c => c.types.includes('neighborhood'))?.long_name;
      const sublocality = components.find(c => c.types.includes('sublocality'))?.long_name;
      const route = components.find(c => c.types.includes('route'))?.long_name;

      const extraParts = [];
      if (route && !cleaned.includes(route)) extraParts.push(route);
      if (neighborhood && !cleaned.includes(neighborhood)) extraParts.push(neighborhood);
      else if (sublocality && !cleaned.includes(sublocality)) extraParts.push(sublocality);

      if (extraParts.length > 0) {
        return `${extraParts.join(', ')}, ${cleaned}`;
      }
    }

    return cleaned || formatted;
  }

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete) {
      const place = pickupAutocomplete.getPlace()
      const formatted = formatAddress(place)
      if (formatted) {
        setPickup(formatted)
      }
    }
  }

  const onDropoffLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setDropoffAutocomplete(autocomplete)
  }
  const onDropoffPlaceChanged = () => {
    if (dropoffAutocomplete) {
      const place = dropoffAutocomplete.getPlace()
      const formatted = formatAddress(place)
      if (formatted) {
        setDropoff(formatted)
      }
    }
  }

  const handleSearch = () => {
    const newErrors: { pickup?: string; dropoff?: string } = {}
    if (!pickup.trim()) newErrors.pickup = 'Pickup location is required'
    if (!dropoff.trim()) newErrors.dropoff = 'Dropoff location is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    router.push(`/book?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`)
  }

  useEffect(() => {
    if (!isLoaded) return
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const center = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      const circle = new google.maps.Circle({ center, radius: 80000 })
      const bounds = circle.getBounds()
      const geocoder = new google.maps.Geocoder()
      let country: string | undefined = undefined
      try {
        const result = await geocoder.geocode({ location: center })
        const res = result.results?.[0]
        if (res) {
          const address = formatAddress(res)
          setPickup(prev => prev || address)
        }
      } catch {}
      setAutoOptions({
        bounds: bounds || undefined,
        strictBounds: false,
        componentRestrictions: country ? { country } : undefined
      })
    }, () => {}, { enableHighAccuracy: true, maximumAge: 0 })
  }, [isLoaded])

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
                    {isLoaded ? (
                      <Autocomplete options={autoOptions} onLoad={onPickupLoad} onPlaceChanged={onPickupPlaceChanged}>
                        <input 
                            type="text" 
                            placeholder="Pickup location"
                            className={`input-field pl-12 pr-4 ${errors.pickup ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                            value={pickup}
                            onChange={(e) => {
                              setPickup(e.target.value)
                              if (errors.pickup) setErrors(prev => ({ ...prev, pickup: undefined }))
                            }}
                        />
                      </Autocomplete>
                    ) : (
                      <input 
                          type="text" 
                          placeholder="Pickup location"
                          className={`input-field pl-12 pr-4 ${errors.pickup ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                          value={pickup}
                          onChange={(e) => {
                            setPickup(e.target.value)
                            if (errors.pickup) setErrors(prev => ({ ...prev, pickup: undefined }))
                          }}
                      />
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <LucideMapPin className="w-5 h-5" />
                    </div>
                    {errors.pickup && <p className="text-red-500 text-xs mt-1 ml-1">{errors.pickup}</p>}
                 </div>

                 {/* Dropoff */}
                 <div className="relative z-10 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black border-2 border-black rect-none" style={{borderRadius: 0}}></div>
                    {isLoaded ? (
                      <Autocomplete options={autoOptions} onLoad={onDropoffLoad} onPlaceChanged={onDropoffPlaceChanged}>
                        <input 
                            type="text" 
                            placeholder="Dropoff location"
                            className={`input-field pl-12 pr-4 ${errors.dropoff ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                            value={dropoff}
                            onChange={(e) => {
                              setDropoff(e.target.value)
                              if (errors.dropoff) setErrors(prev => ({ ...prev, dropoff: undefined }))
                            }}
                        />
                      </Autocomplete>
                    ) : (
                      <input 
                          type="text" 
                          placeholder="Dropoff location"
                          className={`input-field pl-12 pr-4 ${errors.dropoff ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                          value={dropoff}
                          onChange={(e) => {
                            setDropoff(e.target.value)
                            if (errors.dropoff) setErrors(prev => ({ ...prev, dropoff: undefined }))
                          }}
                      />
                    )}
                    {errors.dropoff && <p className="text-red-500 text-xs mt-1 ml-1">{errors.dropoff}</p>}
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
        <div className="w-full md:w-1/2 lg:w-7/12 relative h-[300px] md:h-auto md:absolute md:right-0 md:top-0 md:bottom-0 mt-8 md:mt-0">
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
