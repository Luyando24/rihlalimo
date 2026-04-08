import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Rihla Limo\'s commitment to digital and physical accessibility for all our clients.',
  openGraph: {
    url: '/accessibility',
  },
}

export default async function AccessibilityPage() {
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
         <h1 className="text-4xl md:text-5xl font-bold mb-4">Accessibility Statement</h1>
         <p className="text-gray-500 mb-12">Last Updated: April 6, 2026</p>
         
         <div className="space-y-8 text-gray-700 leading-relaxed">
             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">Our Commitment</h2>
                 <p className="mb-4">
                    At Rihla Limo, we are committed to making our digital and physical services accessible to everyone, including individuals with disabilities. We continuously strive to improve the user experience for all and apply the relevant accessibility standards.
                 </p>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">Digital Accessibility</h2>
                 <p className="mb-4">
                    We are dedicated to ensuring that our website and mobile applications are accessible to users with visual, hearing, cognitive, and motor impairments.
                 </p>
                 <ul className="list-disc pl-6 space-y-2">
                     <li><strong>WCAG Compliance:</strong> Our digital platforms are designed to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.</li>
                     <li><strong>Screen Reader Compatibility:</strong> We strive to ensure our content is easily navigable using popular screen reading software.</li>
                     <li><strong>Keyboard Navigation:</strong> Our site is fully functional for users who rely on keyboard navigation.</li>
                 </ul>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">Vehicle Accessibility</h2>
                 <p className="mb-4">
                    Rihla Limo is committed to providing inclusive transportation solutions for all our clients.
                 </p>
                 <ul className="list-disc pl-6 space-y-2">
                     <li><strong>Wheelchair Accessible Vehicles (WAV):</strong> We offer specialized vehicles equipped with ramps or lifts upon request in select markets. Please contact our support team in advance to guarantee availability.</li>
                     <li><strong>Service Animals:</strong> Registered service animals are always welcome in any Rihla Limo vehicle without prior notification.</li>
                     <li><strong>Chauffeur Assistance:</strong> Our chauffeurs are trained to provide reasonable assistance with boarding, exiting, and stowing mobility devices.</li>
                 </ul>
             </section>

             <section>
                 <h2 className="text-2xl font-bold text-black mb-4">Feedback and Contact</h2>
                 <p className="mb-4">
                    We welcome your feedback on the accessibility of Rihla Limo. If you encounter any accessibility barriers while using our website, app, or services, please let us know so we can assist you.
                 </p>
                 <div className="bg-gray-50 p-6 rounded-xl mt-4">
                    <p className="font-medium text-black mb-2">Contact our Accessibility Team:</p>
                    <ul className="space-y-2">
                        <li><strong>Email:</strong> accessibility@rihlalimo.com</li>
                        <li><strong>Phone:</strong> 1-800-555-0199 (TTY/TDD users, please use your preferred relay service)</li>
                        <li><strong>Online:</strong> <Link href="/contact" className="text-black underline hover:text-gray-600">Contact Form</Link></li>
                    </ul>
                 </div>
             </section>
         </div>
      </div>

      <Footer />
    </div>
  )
}
