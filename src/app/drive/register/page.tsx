'use client'

import { useState } from 'react'
import { driverSignup } from './actions'
import Link from 'next/link'

export default function DriverRegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setMessage(null)
    
    const result = await driverSignup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.message) {
      setMessage(result.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
       <header className="bg-black text-white py-4 px-6 lg:px-16 flex justify-between items-center">
          <Link href="/" className="text-xl font-normal tracking-tight">
            RIHLA LIMO
          </Link>
          <Link href="/login" className="text-sm font-medium hover:text-gray-300">
             Log in
          </Link>
       </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-left">
            Drive with Rihla
          </h2>
          <p className="text-gray-600 mb-8">
            Join our elite network of professional chauffeurs.
          </p>

          <form action={handleSubmit} className="space-y-4">
            <input
              name="fullName"
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="Full Name"
            />
            
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="Email address"
            />

            <input
              name="phone"
              type="tel"
              required
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="Phone Number"
            />

            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="Create Password"
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                 </svg>
                 {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg flex justify-center items-center mt-6"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated means, from Rihla and its affiliates to the number provided.
          </div>
        </div>
      </div>
    </div>
  )
}
