'use client'

import { useState, useEffect, useRef } from 'react'
import { LucideMapPin, LucideCalendar, LucideCar, LucideCreditCard, LucideCheck, LucideUsers, LucideBriefcase, LucidePlane, LucideInfo } from 'lucide-react'
import { getVehicleTypes, getQuoteAction, createBookingAction } from '@/app/book/actions'
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api'
import { useSearchParams } from 'next/navigation'

const libraries: ("places")[] = ["places"];

type ServiceType = 'point_to_point' | 'hourly' | 'airport_pickup' | 'airport_dropoff'

export default function BookingWizard({ user, profile }: any) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })
  const searchParams = useSearchParams()
  const [autoOptions, setAutoOptions] = useState<google.maps.places.AutocompleteOptions>({
    fields: ['formatted_address', 'name', 'geometry', 'place_id'],
  })

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(() => {
    const now = new Date()
    // Format date as YYYY-MM-DD in local time
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    // Format time as HH:MM in local time
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const timeStr = `${hours}:${minutes}`

    return {
      serviceType: 'point_to_point' as ServiceType,
      pickupLocation: '',
      dropoffLocation: '',
      pickupCoordinates: null as { lat: number; lng: number } | null,
      dropoffCoordinates: null as { lat: number; lng: number } | null,
      date: dateStr,
      time: timeStr,
      vehicleTypeId: '',
      passengers: 1,
      airline: '',
      flightNumber: '',
      meetAndGreet: false,
      hours: 3,
      passengerName: profile?.full_name || user?.user_metadata?.full_name || '',
      passengerPhone: profile?.phone || user?.user_metadata?.phone || '',
      notes: ''
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [priceQuote, setPriceQuote] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [loadingBooking, setLoadingBooking] = useState(false)
  const [bookingResult, setBookingResult] = useState<any>(null)

  useEffect(() => {
    const initialPickup = searchParams.get('pickup') || ''
    const initialDropoff = searchParams.get('dropoff') || ''
    // Check both 'service' and 'type' parameters for compatibility
    const initialServiceParam = searchParams.get('service') || searchParams.get('type')
    const initialService = initialServiceParam as ServiceType | null

    if (initialPickup || initialDropoff || initialService) {
      setFormData(prev => ({
        ...prev,
        pickupLocation: initialPickup || prev.pickupLocation,
        dropoffLocation: initialDropoff || prev.dropoffLocation,
        serviceType: (initialService && ['point_to_point', 'hourly', 'airport_pickup', 'airport_dropoff'].includes(initialService))
          ? initialService
          : prev.serviceType
      }))

      // If service type is provided, auto-advance to step 2
      if (initialService) {
        setStep(2)
      }
    }
  }, [searchParams])

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

        // Find the best result (prioritize specific addresses over plus codes or generic areas)
        const bestResult = result.results.find(r =>
          r.types.includes('street_address') ||
          r.types.includes('premise') ||
          r.types.includes('subpremise') ||
          r.types.includes('establishment') ||
          r.types.includes('point_of_interest')
        ) || result.results[0]

        const components = bestResult?.address_components || []
        const countryComp = components.find(c => c.types.includes('country'))
        country = countryComp?.short_name

        if (bestResult) {
          // Keep bounds updated based on current location, but don't auto-fill pickup
          // const address = formatAddress(bestResult)
          // setFormData(prev => ({
          //   ...prev,
          //   pickupLocation: address,
          //   pickupCoordinates: {
          //     lat: bestResult.geometry.location.lat(),
          //     lng: bestResult.geometry.location.lng()
          //   }
          // }))
        }
      } catch { }

      setAutoOptions(prev => ({
        ...prev,
        bounds: bounds || undefined,
        componentRestrictions: country ? { country } : undefined
      }))
    }, () => { }, { enableHighAccuracy: true, maximumAge: 0 })
  }, [isLoaded])

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
    let cleaned = formatted.replace(/^[A-Z0-9]{4,8}\+[A-Z0-9]{2,}(,\s*)?/, '').trim();

    // 2. If the 'name' is a specific place (not a plus code and not just a street number)
    const isPlusCode = (str: string) => /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,}$/.test(str);

    if (name && !isPlusCode(name) && !cleaned.startsWith(name)) {
      if (!/^\d+$/.test(name)) {
        return `${name}, ${cleaned}`;
      }
    }

    // 3. Inject more detail if cleaned is too generic
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

      if (!place.geometry) return;

      const formatted = formatAddress(place)
      if (formatted) {
        setFormData(prev => ({
          ...prev,
          pickupLocation: formatted,
          pickupCoordinates: place.geometry?.location ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          } : null
        }))
        if (errors.pickupLocation) {
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.pickupLocation
            return newErrors
          })
        }
      }
    }
  }

  const onDropoffLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setDropoffAutocomplete(autocomplete)
  }

  const onDropoffPlaceChanged = () => {
    if (dropoffAutocomplete) {
      const place = dropoffAutocomplete.getPlace()

      if (!place.geometry) return;

      const formatted = formatAddress(place)
      if (formatted) {
        setFormData(prev => ({
          ...prev,
          dropoffLocation: formatted,
          dropoffCoordinates: place.geometry?.location ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          } : null
        }))
        if (errors.dropoffLocation) {
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.dropoffLocation
            return newErrors
          })
        }
      }
    }
  }

  const [isPickupNow, setIsPickupNow] = useState(true)

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => {
      const newState = { ...prev, [key]: value }
      // Clear coordinates if location text changes to prevent mismatch
      if (key === 'pickupLocation') newState.pickupCoordinates = null
      if (key === 'dropoffLocation') newState.dropoffCoordinates = null
      return newState
    })

    // If date or time is manually changed, disable "Pickup now"
    if (key === 'date' || key === 'time') {
      setIsPickupNow(false)
    }

    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const handlePickupNowToggle = () => {
    if (!isPickupNow) {
      // Switching back to Pickup Now - update to current time
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const timeStr = `${hours}:${minutes}`

      updateFormData('date', dateStr)
      updateFormData('time', timeStr)
      setIsPickupNow(true)
    } else {
      // Switching to Schedule Later - just toggle flag, keep current values as starting point
      setIsPickupNow(false)
    }
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.serviceType) newErrors.serviceType = 'Please select a service type'
    } else if (currentStep === 2) {
      if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required'
      if (formData.serviceType !== 'hourly' && !formData.dropoffLocation.trim()) newErrors.dropoffLocation = 'Drop-off location is required'
      if (!formData.date) newErrors.date = 'Date is required'
      if (!formData.time) newErrors.time = 'Time is required'

      // Basic date validation - must be today or in the future
      if (formData.date) {
        // Create date object in local timezone to avoid UTC shifts
        const [year, month, day] = formData.date.split('-').map(Number)
        const selectedDate = new Date(year, month - 1, day)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (selectedDate < today) {
          newErrors.date = 'Date cannot be in the past'
        }
      }

      // Airport specific validation
      if (formData.serviceType === 'airport_pickup') {
        if (!formData.airline.trim()) newErrors.airline = 'Airline is required for airport pickups'
        if (!formData.flightNumber.trim()) newErrors.flightNumber = 'Flight number is required for airport pickups'
      }

      if (formData.serviceType === 'hourly') {
        if (formData.hours < 2) newErrors.hours = 'Minimum 2 hours required'
      }
    } else if (currentStep === 3) {
      if (!formData.vehicleTypeId) newErrors.vehicleTypeId = 'Please select a vehicle'
    } else if (currentStep === 4) {
      if (!formData.passengerName.trim()) newErrors.passengerName = 'Passenger name is required'
      if (!formData.passengerPhone.trim()) newErrors.passengerPhone = 'Passenger phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    // If Pickup Now is selected, refresh time to current moment before validating
    if (step === 2 && isPickupNow) {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const timeStr = `${hours}:${minutes}`

      // Directly update state for immediate validation check
      formData.date = dateStr
      formData.time = timeStr
    }

    if (!validateStep(step)) return

    if (step === 2) {
      // Load vehicles before going to step 3
      loadVehicles()
    }
    setStep(prev => prev + 1)
  }
  const prevStep = () => setStep(prev => prev - 1)

  const loadVehicles = async () => {
    setLoadingVehicles(true)
    const data = await getVehicleTypes()

    // Proactively calculate quotes for all vehicles to show prices immediately
    const vehiclesWithQuotes = await Promise.all((data || []).map(async (v: any) => {
      const res = await getQuoteAction({
        serviceType: formData.serviceType,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupCoordinates: formData.pickupCoordinates,
        dropoffCoordinates: formData.dropoffCoordinates,
        date: formData.date,
        time: formData.time,
        vehicleTypeId: v.id,
        meetAndGreet: formData.meetAndGreet,
        hours: formData.hours,
      })
      return {
        ...v,
        quote: res.success ? res.quote : null,
        quoteError: res.success ? null : (res as any).error
      }
    }))

    setVehicles(vehiclesWithQuotes)
    setLoadingVehicles(false)
  }

  const handleVehicleSelect = async (vehicle: any) => {
    updateFormData('vehicleTypeId', vehicle.id)
    if (vehicle.quote) {
      setPriceQuote(vehicle.quote)
    } else {
      // Fallback if quote wasn't pre-calculated
      setLoadingQuote(true)
      const result = await getQuoteAction({
        serviceType: formData.serviceType,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupCoordinates: formData.pickupCoordinates,
        dropoffCoordinates: formData.dropoffCoordinates,
        date: formData.date,
        time: formData.time,
        vehicleTypeId: vehicle.id,
        meetAndGreet: formData.meetAndGreet,
        hours: formData.hours,
      })

      if (result.success) {
        setPriceQuote(result.quote)
      } else {
        alert(result.error || 'Failed to calculate price')
      }
      setLoadingQuote(false)
    }
  }

  const handleBooking = async () => {
    // Final validation check
    if (!validateStep(4)) {
      // If validation fails, just return, the errors state will be updated and show in UI
      return
    }

    if (!formData.pickupLocation || (!formData.dropoffLocation && formData.serviceType !== 'hourly') || !formData.date || !formData.time || !formData.vehicleTypeId) {
      alert('Please complete all ride details before booking.')
      setStep(2) // Send back to details step if something is missing
      return
    }

    setLoadingBooking(true)
    const result = await createBookingAction(formData)
    setLoadingBooking(false)

    if (result.success) {
      setBookingResult(result)
      setStep(5)
    } else {
      alert(result.error || 'Booking failed')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100 p-6">
        <div className="flex justify-between items-center text-sm font-medium text-gray-500">
          <div className={`flex items-center ${step >= 1 ? 'text-black' : ''}`}>
            <span className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mr-2 ${step >= 1 ? 'border-black bg-black text-white' : 'border-gray-300'}`}>1</span>
            Service
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-black' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-black' : ''}`}>
            <span className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mr-2 ${step >= 2 ? 'border-black bg-black text-white' : 'border-gray-300'}`}>2</span>
            Details
          </div>
          <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-black' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-black' : ''}`}>
            <span className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mr-2 ${step >= 3 ? 'border-black bg-black text-white' : 'border-gray-300'}`}>3</span>
            Vehicle
          </div>
          <div className={`w-12 h-0.5 ${step >= 4 ? 'bg-black' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 4 ? 'text-black' : ''}`}>
            <span className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mr-2 ${step >= 4 ? 'border-black bg-black text-white' : 'border-gray-300'}`}>4</span>
            Payment
          </div>
        </div>
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-light mb-6 text-black">Select Service Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServiceCard
                title="Point-to-Point"
                description="Direct transfer between two locations"
                selected={formData.serviceType === 'point_to_point'}
                onClick={() => updateFormData('serviceType', 'point_to_point')}
              />
              <ServiceCard
                title="Hourly Charter"
                description="Chauffeur at your disposal for a set time"
                selected={formData.serviceType === 'hourly'}
                onClick={() => updateFormData('serviceType', 'hourly')}
              />
              <ServiceCard
                title="Airport Pickup"
                description="Arrival transfer from LAX or other airports"
                selected={formData.serviceType === 'airport_pickup'}
                onClick={() => updateFormData('serviceType', 'airport_pickup')}
              />
              <ServiceCard
                title="Airport Drop-off"
                description="Departure transfer to the airport"
                selected={formData.serviceType === 'airport_dropoff'}
                onClick={() => updateFormData('serviceType', 'airport_dropoff')}
              />
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={nextStep} className="btn-primary">Next Step</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-light mb-6 text-black">Ride Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  {formData.serviceType === 'airport_pickup' ? 'Pickup Airport' : 'Pickup Location'}
                </label>
                <div className="relative">
                  <LucideMapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                  {isLoaded ? (
                    <Autocomplete
                      options={autoOptions}
                      onLoad={onPickupLoad}
                      onPlaceChanged={onPickupPlaceChanged}
                    >
                      <input
                        type="text"
                        className={`input-field pl-10 ${errors.pickupLocation ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                        placeholder="Enter pickup address"
                        value={formData.pickupLocation}
                        onChange={(e) => updateFormData('pickupLocation', e.target.value)}
                        autoComplete="off"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      className={`input-field pl-10 ${errors.pickupLocation ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                      placeholder="Enter pickup address"
                      value={formData.pickupLocation}
                      onChange={(e) => updateFormData('pickupLocation', e.target.value)}
                    />
                  )}
                </div>
                {errors.pickupLocation && <p className="text-red-500 text-xs mt-1">{errors.pickupLocation}</p>}
              </div>

              {formData.serviceType === 'hourly' ? (
                <div>
                  <label className="label">Duration (Hours)</label>
                  <div className="relative">
                    <LucideBriefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                    <select
                      className={`input-field pl-10 ${errors.hours ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                      value={formData.hours}
                      onChange={(e) => updateFormData('hours', parseInt(e.target.value))}
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24].map(h => (
                        <option key={h} value={h}>{h} Hours</option>
                      ))}
                    </select>
                  </div>
                  {errors.hours && <p className="text-red-500 text-xs mt-1">{errors.hours}</p>}
                </div>
              ) : (
                <div>
                  <label className="label">
                    {formData.serviceType === 'airport_dropoff' ? 'Drop-off Airport' : 'Drop-off Location'}
                  </label>
                  <div className="relative">
                    <LucideMapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                    {isLoaded ? (
                      <Autocomplete
                        options={autoOptions}
                        onLoad={onDropoffLoad}
                        onPlaceChanged={onDropoffPlaceChanged}
                      >
                        <input
                          type="text"
                          className={`input-field pl-10 ${errors.dropoffLocation ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                          placeholder="Enter drop-off address"
                          value={formData.dropoffLocation}
                          onChange={(e) => updateFormData('dropoffLocation', e.target.value)}
                          autoComplete="off"
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        className={`input-field pl-10 ${errors.dropoffLocation ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                        placeholder="Enter drop-off address"
                        value={formData.dropoffLocation}
                        onChange={(e) => updateFormData('dropoffLocation', e.target.value)}
                      />
                    )}
                  </div>
                  {errors.dropoffLocation && <p className="text-red-500 text-xs mt-1">{errors.dropoffLocation}</p>}
                </div>
              )}

              {(formData.serviceType === 'airport_pickup' || formData.serviceType === 'airport_dropoff') && (
                <>
                  <div>
                    <label className="label">Airline</label>
                    <div className="relative">
                      <LucidePlane className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                      <input
                        type="text"
                        className={`input-field pl-10 ${errors.airline ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                        placeholder="e.g. Emirates"
                        value={formData.airline}
                        onChange={(e) => updateFormData('airline', e.target.value)}
                      />
                    </div>
                    {errors.airline && <p className="text-red-500 text-xs mt-1">{errors.airline}</p>}
                  </div>
                  <div>
                    <label className="label">Flight Number</label>
                    <div className="relative">
                      <LucideInfo className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                      <input
                        type="text"
                        className={`input-field pl-10 ${errors.flightNumber ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                        placeholder="e.g. EK202"
                        value={formData.flightNumber}
                        onChange={(e) => updateFormData('flightNumber', e.target.value)}
                      />
                    </div>
                    {errors.flightNumber && <p className="text-red-500 text-xs mt-1">{errors.flightNumber}</p>}

                    {formData.serviceType === 'airport_pickup' && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="meetAndGreet"
                          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                          checked={formData.meetAndGreet}
                          onChange={(e) => updateFormData('meetAndGreet', e.target.checked)}
                        />
                        <label htmlFor="meetAndGreet" className="text-sm text-gray-700 select-none cursor-pointer">
                          Add Meet & Greet Service
                        </label>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="label">Pickup Time</label>
                {!isPickupNow ? (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date</label>
                        <div className="relative">
                          <LucideCalendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            className={`input-field pl-9 py-2 text-sm ${errors.date ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                            value={formData.date}
                            onChange={(e) => updateFormData('date', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Time</label>
                        <input
                          type="time"
                          className={`input-field py-2 text-sm ${errors.time ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                          value={formData.time}
                          onChange={(e) => updateFormData('time', e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handlePickupNowToggle()
                      }}
                      className="text-xs text-blue-600 font-medium hover:underline flex items-center"
                    >
                      Switch to Pickup Now
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsPickupNow(false)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                        <LucideCalendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-black">Pickup now</p>
                        <p className="text-xs text-gray-500">Driver will arrive ASAP</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-400">Schedule for later &rarr;</span>
                  </div>
                )}
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="btn-secondary">Back</button>
              <button onClick={nextStep} className="btn-primary">Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-light mb-6 text-black">Select Vehicle</h2>

            {loadingVehicles ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicles.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No vehicles available for your selection.</p>
                ) : (
                  vehicles.map((vehicle: any) => (
                    <div
                      key={vehicle.id}
                      onClick={() => handleVehicleSelect(vehicle)}
                      className={`flex flex-col md:flex-row items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.vehicleTypeId === vehicle.id ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}
                    >
                      <div className="w-full md:w-1/3 h-32 relative mb-4 md:mb-0">
                        {/* Placeholder for image if not available or use vehicle.image_url */}
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          {vehicle.image_url ? (
                            <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <LucideCar className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 md:px-6 w-full text-center md:text-left">
                        <h3 className="text-lg font-bold text-gray-900">{vehicle.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{vehicle.description}</p>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1"><LucideUsers size={16} /> {vehicle.capacity_passengers}</span>
                          <span className="flex items-center gap-1"><LucideBriefcase size={16} /> {vehicle.capacity_luggage}</span>
                        </div>
                      </div>
                      <div className="text-right w-full md:w-auto mt-4 md:mt-0">
                        <div className="text-xl font-bold text-black">
                          {vehicle.quote ? (
                            <div className="flex flex-col items-end">
                              <span>${Number(vehicle.quote.price).toFixed(2)}</span>
                              {vehicle.quote.distanceKm > 0 && (
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-normal">
                                  {(vehicle.quote.displayDistance || vehicle.quote.distanceKm).toFixed(1)} {vehicle.quote.distanceUnit || 'km'}
                                  {vehicle.quote.isSimulation && (
                                    <span className="ml-1 text-amber-500 normal-case" title={vehicle.quote.simulationReason}>
                                      (Simulated)
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          ) : (
                            loadingVehicles ? (
                              <span className="text-sm font-normal text-gray-500">Calculating...</span>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-normal text-red-500">Price unavailable</span>
                                {vehicle.quoteError && (
                                  <span className="text-[10px] text-red-400 max-w-[150px] leading-tight">
                                    {vehicle.quoteError}
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="btn-secondary">Back</button>
              <button
                onClick={nextStep}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.vehicleTypeId || !priceQuote}
              >
                Next Step
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-light mb-6 text-black">Booking Summary</h2>

            <div className="bg-gray-50 p-6 rounded-xl mb-6 space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <span className="text-gray-600">Service Type</span>
                <span className="font-medium capitalize text-black">{formData.serviceType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-medium text-black">{formData.date} at {formData.time}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <span className="text-gray-600">Pickup</span>
                <span className="font-medium text-right max-w-[60%] text-black">{formData.pickupLocation}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <span className="text-gray-600">Drop-off</span>
                <span className="font-medium text-right max-w-[60%] text-black">{formData.dropoffLocation}</span>
              </div>
              {priceQuote && priceQuote.distanceKm > 0 && (
                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <span className="text-gray-600">Estimated Distance</span>
                  <div className="text-right">
                    <span className="font-medium text-black">{(priceQuote.displayDistance || priceQuote.distanceKm).toFixed(1)} {priceQuote.distanceUnit || 'km'}</span>
                    {priceQuote.isSimulation && (
                      <div className="text-[10px] text-amber-600">
                        Simulated: {priceQuote.simulationReason || 'Distance API disabled'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {priceQuote && priceQuote.durationMinutes > 0 && (
                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <span className="text-gray-600">Estimated Duration</span>
                  <span className="font-medium text-black">{priceQuote.durationMinutes} mins</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-4 mt-4">
                <span className="text-lg font-bold text-gray-900">Total Price</span>
                <span className="text-2xl font-bold text-black">{priceQuote ? `$${Number(priceQuote.price).toFixed(2)}` : 'Calculating...'}</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-xl mb-6 space-y-4">
              <h3 className="font-bold text-lg mb-4">Passenger Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Passenger Name</label>
                  <div className="relative">
                    <LucideUsers className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                    <input
                      type="text"
                      className={`input-field pl-10 ${errors.passengerName ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                      placeholder="Full Name"
                      value={formData.passengerName}
                      onChange={(e) => updateFormData('passengerName', e.target.value)}
                    />
                  </div>
                  {errors.passengerName && <p className="text-red-500 text-xs mt-1">{errors.passengerName}</p>}
                </div>
                <div>
                  <label className="label">Passenger Phone</label>
                  <div className="relative">
                    <LucideBriefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" /> {/* Reuse Briefcase or use Phone icon if available */}
                    <input
                      type="tel"
                      className={`input-field pl-10 ${errors.passengerPhone ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
                      placeholder="Phone Number"
                      value={formData.passengerPhone}
                      onChange={(e) => updateFormData('passengerPhone', e.target.value)}
                    />
                  </div>
                  {errors.passengerPhone && <p className="text-red-500 text-xs mt-1">{errors.passengerPhone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="label">Notes for Driver (Optional)</label>
                  <textarea
                    className="input-field h-24 py-2"
                    placeholder="Any special requests or instructions..."
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="btn-secondary">Back</button>
              <button
                onClick={handleBooking}
                className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 min-w-[160px]"
                disabled={loadingBooking}
              >
                {loadingBooking ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <LucideCreditCard size={18} />
                    Confirm & Book
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <LucideCheck className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-light mb-4 text-black">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your booking has been successfully placed. <br />
              Booking ID: <span className="font-mono font-bold">{bookingResult?.bookingId}</span>
            </p>
            <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto mb-8 text-left">
              <p className="text-sm text-blue-800">
                {bookingResult?.message}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => window.location.href = '/dashboard'} className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
                Go to Dashboard
              </button>
              <button onClick={() => window.location.href = '/'} className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceCard({ title, description, selected, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`p-6 border rounded-lg cursor-pointer transition-all ${selected ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-black'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {selected && <LucideCheck className="w-5 h-5 text-black" />}
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

// Add these classes to global css or use tailwind-merge in a real setup
// .btn-primary { @apply px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors; }
// .btn-secondary { @apply px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors; }
// .input-field { @apply w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:outline-none; }
// .label { @apply block text-sm font-medium text-gray-700 mb-1; }
