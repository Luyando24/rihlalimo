'use client'

type AnalyticsParameters = Record<string, string | number | boolean | null | undefined | object>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function sendGtag(...args: unknown[]) {
  if (typeof window === 'undefined') return false

  if (typeof window.gtag === 'function') {
    window.gtag(...args)
    return true
  }

  // Keep early events available until gtag.js finishes loading.
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
  return true
}

export function trackBookingEvent(
  eventName: string,
  parameters: AnalyticsParameters = {}
) {
  return sendGtag('event', eventName, parameters)
}

export function trackConfirmedBookingPurchase({
  bookingId,
  value,
  currency = 'USD',
  serviceType,
  vehicleTypeId,
}: {
  bookingId: string
  value: number
  currency?: string
  serviceType?: string
  vehicleTypeId?: string
}) {
  // GA4 receives the canonical ecommerce event when a GA destination is configured.
  trackBookingEvent('purchase', {
    transaction_id: bookingId,
    value,
    currency,
    items: [
      {
        item_id: serviceType || 'chauffeur_booking',
        item_name: serviceType || 'Chauffeur booking',
        item_category: 'Chauffeur service',
        item_variant: vehicleTypeId || undefined,
        price: value,
        quantity: 1,
      },
    ],
  })

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || 'AW-18320205966'
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_CONVERSION_LABEL?.trim()

  if (!conversionLabel) {
    console.warn(
      'Confirmed booking was not sent to Google Ads because NEXT_PUBLIC_GOOGLE_ADS_BOOKING_CONVERSION_LABEL is missing.'
    )
    return false
  }

  return sendGtag('event', 'conversion', {
    send_to: `${adsId}/${conversionLabel}`,
    value,
    currency,
    transaction_id: bookingId,
  })
}

