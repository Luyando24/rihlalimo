import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'

export default async function PrivacyPage() {
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
      
      <div className="pt-32 pb-24 px-6 lg:px-16 container mx-auto max-w-4xl">
         <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
         <p className="text-gray-500 mb-12">Last Updated: April 6, 2026</p>
         
         <div className="space-y-8 text-gray-700 leading-relaxed">
             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">1. Information We Collect</h2>
                 <p className="mb-4">
                    We collect information to provide better services to all our users. The types of information we collect include:
                 </p>
                 <ul className="list-disc pl-6 space-y-2">
                     <li><strong>Personal Information:</strong> Name, email address, phone number, and billing information when you create an account or book a ride.</li>
                     <li><strong>Usage Data:</strong> Information about how you interact with our services, such as ride history, search queries, and preferences.</li>
                     <li><strong>Device Information:</strong> Device type, operating system, and IP address when accessing our website or mobile applications.</li>
                 </ul>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">2. How We Use Information</h2>
                 <p className="mb-4">
                    We use the information we collect for various purposes, including:
                 </p>
                 <ul className="list-disc pl-6 space-y-2">
                     <li>To facilitate and process your bookings and payments.</li>
                     <li>To communicate with you regarding your account or transactions.</li>
                     <li>To personalize and improve your experience on our platform.</li>
                     <li>To analyze usage trends and enhance our services and operations.</li>
                 </ul>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">3. Information Sharing and Disclosure</h2>
                 <p className="mb-4">
                    We do not sell your personal information to third parties. We may share your information in the following circumstances:
                 </p>
                 <ul className="list-disc pl-6 space-y-2">
                     <li><strong>Service Providers:</strong> We share necessary details (such as pickup location and name) with our independent chauffeurs to fulfill your booking.</li>
                     <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities.</li>
                 </ul>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">4. Data Security</h2>
                 <p>
                    We implement a variety of security measures to maintain the safety of your personal information. Your personal data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.
                 </p>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">5. Your Rights</h2>
                 <p>
                    Depending on your location, you may have the right to access, correct, or delete the personal information we hold about you. To exercise these rights, please contact our support team.
                 </p>
             </section>
         </div>
      </div>

      <Footer />
    </div>
  )
}
