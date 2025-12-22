'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setMessage(null)
    
    const action = isLogin ? login : signup
    const result = await action(formData)
    
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
       {/* Simplified Header */}
       <header className="bg-black text-white py-4 px-6 lg:px-16 flex justify-between items-center">
          <Link href="/" className="text-xl font-normal tracking-tight">
            RIHLA LIMO
          </Link>
       </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-left">
            {isLogin ? 'Log in' : 'Sign up'}
          </h2>

          <form action={handleSubmit} className="space-y-4">
            {!isLogin && (
               <input
                 name="fullName"
                 type="text"
                 required
                 className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                 placeholder="Full Name"
               />
            )}
            
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="Email address"
            />

            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="Password"
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
              {loading ? (
                  <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                  </span>
              ) : (
                  isLogin ? 'Log in' : 'Sign up'
              )}
            </button>

            {!isLogin && (
              <p className="text-xs text-gray-500 mt-4 text-center">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-black">
                  Terms of Service
                </Link>
                .
              </p>
            )}
          </form>

          <div className="mt-8 text-left">
            <p className="text-gray-600">
                {isLogin ? "New to Rihla?" : "Already use Rihla?"}{' '}
                <button
                    onClick={() => {
                        setIsLogin(!isLogin)
                        setError(null)
                        setMessage(null)
                    }}
                    className="text-black font-medium underline hover:text-gray-700 decoration-1 underline-offset-4"
                >
                    {isLogin ? 'Sign up' : 'Log in'}
                </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
