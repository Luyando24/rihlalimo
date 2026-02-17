import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/utils/supabase/server'
import { LucideMail, LucidePhone, LucideMapPin } from 'lucide-react'

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: userResponse } = await supabase.auth.getUser()
  const user = userResponse?.user

  let role = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} role={role} />
      
      <div className="pt-32 pb-20 px-6 lg:px-16 container mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
                <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
                <p className="text-lg text-gray-600 mb-12">
                    Have questions or need assistance? Our 24/7 support team is here to help.
                </p>
                
                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <LucidePhone size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Phone</h3>
                            <p className="text-gray-600">+1 (800) 123-4567</p>
                            <p className="text-sm text-gray-500">Available 24/7</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <LucideMail size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Email</h3>
                            <p className="text-gray-600">support@rihlalimo.com</p>
                            <p className="text-sm text-gray-500">We respond within 24 hours</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <LucideMapPin size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Headquarters</h3>
                            <p className="text-gray-600">123 Luxury Lane<br/>Beverly Hills, CA 90210</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Send Message
                    </button>
                </form>
            </div>
         </div>
      </div>
    </div>
  )
}
