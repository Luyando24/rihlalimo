'use client'

import { useState } from 'react'
import { completeOnboarding } from './actions'
import Link from 'next/link'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await completeOnboarding(formData)
    if (result?.error) {
        setError(result.error)
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
       <header className="bg-black text-white py-4 px-6 lg:px-16 flex justify-between items-center">
          <Link href="/" className="text-xl font-normal tracking-tight">
            RIHLA LIMO
          </Link>
       </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-left">
            One last step
          </h2>
          <p className="text-gray-600 mb-8">
            Please provide your driver's license details to verify your identity.
          </p>

          <form action={handleSubmit} className="space-y-4">
            <input
              name="licenseNumber"
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="Driver's License Number"
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg flex justify-center items-center mt-6"
            >
              {loading ? 'Submitting...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
