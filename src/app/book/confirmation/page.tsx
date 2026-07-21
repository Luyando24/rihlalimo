import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BookingConfirmation from '@/components/booking/BookingConfirmation'

export const metadata: Metadata = {
  title: 'Booking Confirmation',
  robots: {
    index: false,
    follow: false
  }
}

export default async function BookingConfirmationPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const bookingId = typeof params.booking_id === 'string' ? params.booking_id : ''
  const confirmationToken = typeof params.token === 'string' ? params.token : ''

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar user={null} />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-xl rounded-xl px-6 md:px-12">
          <BookingConfirmation
            bookingId={bookingId}
            confirmationToken={confirmationToken}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

