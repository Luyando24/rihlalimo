'use client'

import { useState } from 'react'
import { LucideMapPin, LucideCalendar, LucideCar, LucideCreditCard, LucideCheck } from 'lucide-react'

type ServiceType = 'point_to_point' | 'hourly' | 'airport_pickup' | 'airport_dropoff'

export default function BookingWizard() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    serviceType: 'point_to_point' as ServiceType,
    pickupLocation: '',
    dropoffLocation: '',
    date: '',
    time: '',
    vehicleType: '',
    passengers: 1,
  })
  const [priceQuote, setPriceQuote] = useState<number | null>(null)

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

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
                <label className="label">Pickup Location</label>
                <div className="relative">
                  <LucideMapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    className="input-field pl-10" 
                    placeholder="Enter pickup address"
                    value={formData.pickupLocation}
                    onChange={(e) => updateFormData('pickupLocation', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label">Drop-off Location</label>
                <div className="relative">
                  <LucideMapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    className="input-field pl-10" 
                    placeholder="Enter drop-off address"
                    value={formData.dropoffLocation}
                    onChange={(e) => updateFormData('dropoffLocation', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label">Date</label>
                <div className="relative">
                  <LucideCalendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="date" 
                    className="input-field pl-10"
                    value={formData.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label">Time</label>
                <input 
                  type="time" 
                  className="input-field"
                  value={formData.time}
                  onChange={(e) => updateFormData('time', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="btn-secondary">Back</button>
              <button onClick={nextStep} className="btn-primary">Next Step</button>
            </div>
          </div>
        )}

        {/* Steps 3 and 4 placeholders for now */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-light mb-6 text-black">Select Vehicle</h2>
            <p className="text-gray-600">Vehicle selection component goes here (will fetch from DB).</p>
            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="btn-secondary">Back</button>
              <button onClick={nextStep} className="btn-primary">Next Step</button>
            </div>
          </div>
        )}
         {step === 4 && (
          <div>
            <h2 className="text-2xl font-light mb-6 text-black">Payment</h2>
            <p className="text-gray-600">Stripe payment integration goes here.</p>
            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="btn-secondary">Back</button>
              <button className="btn-primary">Confirm & Pay</button>
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
