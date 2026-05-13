import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookingWizard from '@/components/booking/BookingWizard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Ride',
  description: 'Book your premium Rihla Limo chauffeur service online. Get an instant quote for airport transfers, hourly charter, or point-to-point travel.',
  openGraph: {
    url: '/book',
  },
}

export default async function BookPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <Navbar user={user} />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-black">Book Your Ride</h1>
          <BookingWizard user={user} profile={profile} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
