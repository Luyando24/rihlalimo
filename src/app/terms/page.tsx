import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'

export default async function TermsPage() {
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
         <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
         <p className="text-gray-500 mb-12">Last Updated: April 6, 2026</p>
         
         <div className="space-y-8 text-gray-700 leading-relaxed">
             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">1. Acceptance of Terms</h2>
                 <p>
                    By accessing or using the Rihla Limo platform, including our website, mobile applications, and chauffeur services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                 </p>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">2. Service Description</h2>
                 <p className="mb-4">
                    Rihla Limo provides a technology platform that connects users with professional chauffeur services. We act as an intermediary to facilitate premium transportation bookings.
                 </p>
                 <ul className="list-disc pl-6 space-y-2">
                     <li>All vehicles are operated by independent, licensed, and insured professional chauffeurs.</li>
                     <li>We reserve the right to modify, suspend, or discontinue any part of our service at any time without prior notice.</li>
                 </ul>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">3. Booking and Cancellation Policy</h2>
                 <p className="mb-4">
                    When you book a ride through Rihla Limo, you agree to pay the quoted fare.
                 </p>
                 <ul className="list-disc pl-6 space-y-2">
                     <li><strong>Cancellations:</strong> You may cancel your reservation without charge up to 24 hours before the scheduled pickup time.</li>
                     <li><strong>Late Cancellations:</strong> Cancellations made within 24 hours of the scheduled pickup time may be subject to a cancellation fee up to the full amount of the fare.</li>
                     <li><strong>No-Shows:</strong> If you fail to appear at the designated pickup location, you will be charged the full fare.</li>
                 </ul>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">4. User Responsibilities</h2>
                 <p>
                    You agree to use our services for lawful purposes only. You must not use our platform to transport illegal goods, engage in illicit activities, or cause damage to the vehicle or harm to the chauffeur. You are responsible for any damage caused to the vehicle by you or your party during the service.
                 </p>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">5. Limitation of Liability</h2>
                 <p>
                    Rihla Limo is not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. We are not responsible for delays caused by traffic, weather, or other circumstances beyond our control.
                 </p>
             </section>
         </div>
      </div>

      <Footer />
    </div>
  )
}
