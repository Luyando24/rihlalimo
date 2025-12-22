import Link from 'next/link'
import { LucideClock } from 'lucide-react'

export default function WaitingForApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LucideClock size={32} />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Application Under Review</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Thanks for completing your profile. Our team is currently reviewing your application and documents. This usually takes 24-48 hours.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-8 text-sm text-gray-500 text-left">
          <p className="font-medium text-gray-900 mb-2">Next Steps:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We verify your driver's license</li>
            <li>We check your vehicle details</li>
            <li>You'll receive an email once approved</li>
          </ul>
        </div>

        <Link 
          href="/" 
          className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
