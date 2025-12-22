import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookingWizard from '@/components/booking/BookingWizard'
import Navbar from '@/components/layout/Navbar'

export default async function BookPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Book Your Ride</h1>
          <BookingWizard />
        </div>
      </div>
    </div>
  )
}
