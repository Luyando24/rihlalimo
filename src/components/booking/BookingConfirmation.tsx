'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  LucideCheck,
  LucideClock,
  LucideRefreshCw,
  LucideTriangleAlert
} from 'lucide-react'
import { getBookingConfirmationAction } from '@/app/book/actions'
import {
  trackBookingEvent,
  trackConfirmedBookingPurchase
} from '@/utils/analytics'

type ConfirmationState = 'checking' | 'pending' | 'confirmed' | 'error'

type ConfirmationDetails = {
  amount?: number
  currency?: string
  serviceType?: string
  vehicleTypeId?: string
  error?: string
}

const MAX_AUTOMATIC_CHECKS = 40
const CHECK_INTERVAL_MS = 3_000

export default function BookingConfirmation({
  bookingId,
  confirmationToken
}: {
  bookingId: string
  confirmationToken: string
}) {
  const [state, setState] = useState<ConfirmationState>('checking')
  const [details, setDetails] = useState<ConfirmationDetails>({})
  const [retryKey, setRetryKey] = useState(0)
  const pendingEventSent = useRef(false)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const checkConfirmation = async (attempt: number) => {
      const result = await getBookingConfirmationAction({
        bookingId,
        confirmationToken
      })

      if (cancelled) return

      if (!result.success) {
        setDetails({ error: result.error })
        setState('error')
        return
      }

      if (result.confirmed) {
        const confirmedDetails = {
          amount: result.amount,
          currency: result.currency,
          serviceType: result.serviceType,
          vehicleTypeId: result.vehicleTypeId
        }

        setDetails(confirmedDetails)
        setState('confirmed')

        const storageKey = `rihla_ads_purchase_${bookingId}`
        const alreadySent = sessionStorage.getItem(storageKey) === 'sent'

        if (!alreadySent) {
          trackBookingEvent('booking_confirmed', {
            transaction_id: bookingId,
            value: result.amount,
            currency: result.currency,
            service_type: result.serviceType
          })

          const sentToGoogleAds = trackConfirmedBookingPurchase({
            bookingId,
            value: result.amount,
            currency: result.currency,
            serviceType: result.serviceType,
            vehicleTypeId: result.vehicleTypeId
          })

          if (sentToGoogleAds) {
            sessionStorage.setItem(storageKey, 'sent')
          }
        }
        return
      }

      setDetails({})
      setState('pending')

      if (!pendingEventSent.current) {
        pendingEventSent.current = true
        trackBookingEvent('booking_confirmation_pending', {
          payment_status: result.paymentStatus,
          booking_status: result.status
        })
      }

      if (attempt < MAX_AUTOMATIC_CHECKS) {
        timer = setTimeout(
          () => checkConfirmation(attempt + 1),
          CHECK_INTERVAL_MS
        )
      }
    }

    checkConfirmation(0)

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [bookingId, confirmationToken, retryKey])

  if (state === 'confirmed') {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <LucideCheck className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-light mb-4 text-black">Booking Confirmed</h1>
        <p className="text-gray-600 mb-2">
          Your payment has been verified and your ride is confirmed.
        </p>
        <p className="font-mono text-sm text-gray-500 mb-8">Booking ID: {bookingId}</p>
        {typeof details.amount === 'number' && (
          <p className="text-xl font-semibold mb-8">
            {details.currency} {details.amount.toFixed(2)}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/dashboard" className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800">
            View Dashboard
          </Link>
          <Link href="/" className="px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="text-center py-12">
        <LucideTriangleAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-light mb-4">Unable to Verify Booking</h1>
        <p className="text-gray-600 mb-8">{details.error}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              setState('checking')
              setRetryKey(key => key + 1)
            }}
            className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800"
          >
            Check Again
          </button>
          <Link href="/contact" className="px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Contact Support
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-6">
        {state === 'checking' ? (
          <LucideRefreshCw className="w-16 h-16 text-blue-600 animate-spin" />
        ) : (
          <LucideClock className="w-16 h-16 text-blue-600" />
        )}
      </div>
      <h1 className="text-3xl font-light mb-4">
        {state === 'checking' ? 'Verifying Payment' : 'Payment Processing'}
      </h1>
      <p className="text-gray-600 max-w-lg mx-auto mb-4">
        We are waiting for Stripe&apos;s signed confirmation. Keep this page open; it will update automatically.
      </p>
      <p className="font-mono text-sm text-gray-500 mb-8">Booking ID: {bookingId}</p>
      <button
        onClick={() => {
          setState('checking')
          setRetryKey(key => key + 1)
        }}
        className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
      >
        Check Now
      </button>
    </div>
  )
}
