import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/utils/stripe/server'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  sendAdminNewBookingEmail,
  sendCustomerBookingConfirmationEmail
} from '@/utils/notifications'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('Stripe webhook rejected: STRIPE_WEBHOOK_SECRET is missing')
    return new NextResponse('Webhook is not configured', { status: 500 })
  }

  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature')
  if (!signature) {
    return new NextResponse('Missing Stripe signature', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: unknown) {
    return new NextResponse(`Webhook Error: ${getErrorMessage(error)}`, { status: 400 })
  }

  const supabase = createAdminClient()

  // Fast-path completed retries. Core payment updates below are independently
  // idempotent as well, so concurrent deliveries remain safe.
  const { data: existingEvent } = await supabase
    .from('stripe_events')
    .select('processed')
    .eq('stripe_event_id', event.id)
    .maybeSingle()

  if (existingEvent?.processed) {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
  }

  const recordEvent = async (processed: boolean) => {
    const { error } = await supabase.from('stripe_events').upsert({
      stripe_event_id: event.id,
      type: event.type,
      payload: event,
      processed
    }, { onConflict: 'stripe_event_id' })

    if (error) {
      console.error(`Failed to record Stripe event ${event.id}:`, error)
    }
  }

  await recordEvent(false)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.booking_id

        // Ignore PaymentIntents that were not created by this booking flow.
        if (!bookingId) break

        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('id, total_price_calculated, payment_status, discount_id')
          .eq('id', bookingId)
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (bookingError || !booking) {
          throw new Error(`No booking is linked to PaymentIntent ${paymentIntent.id}`)
        }

        const expectedAmount = Math.round(Number(booking.total_price_calculated) * 100)
        if (paymentIntent.currency !== 'usd' || paymentIntent.amount_received !== expectedAmount) {
          throw new Error(`PaymentIntent ${paymentIntent.id} does not match booking ${bookingId}`)
        }

        // The unique PaymentIntent constraint makes this safe under webhook retries.
        const { error: paymentError } = await supabase.from('payments').upsert({
          booking_id: bookingId,
          amount: paymentIntent.amount_received / 100,
          currency: paymentIntent.currency,
          stripe_payment_intent_id: paymentIntent.id,
          status: 'succeeded'
        }, { onConflict: 'stripe_payment_intent_id' })

        if (paymentError) {
          throw new Error(`Failed to record payment: ${paymentError.message}`)
        }

        // Only the delivery that transitions the booking to paid sends notifications
        // or consumes the discount. Later deliveries find no rows to update.
        const { data: confirmedBookings, error: confirmationError } = await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid'
          })
          .eq('id', bookingId)
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .in('payment_status', ['unpaid', 'failed'])
          .select('id, discount_id')

        if (confirmationError) {
          throw new Error(`Failed to confirm booking: ${confirmationError.message}`)
        }

        const confirmedBooking = confirmedBookings?.[0]
        if (confirmedBooking?.discount_id) {
          const { error: discountError } = await supabase.rpc(
            'increment_discount_usage',
            { discount_uuid: confirmedBooking.discount_id }
          )
          if (discountError) {
            // Payment and booking confirmation are authoritative; a promotion
            // counter failure must not cause Stripe to retry customer emails.
            console.error('Failed to increment discount usage:', discountError)
          }
        }

        if (confirmedBooking) {
          const notificationResults = await Promise.allSettled([
            sendAdminNewBookingEmail(bookingId),
            sendCustomerBookingConfirmationEmail(bookingId)
          ])
          for (const result of notificationResults) {
            if (result.status === 'rejected') {
              console.error('Post-payment notification failed:', result.reason)
            }
          }
        }
        break
      }

      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.booking_id
        if (!bookingId) break

        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('id, payment_status')
          .eq('id', bookingId)
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (bookingError || !booking) {
          throw new Error(`No booking is linked to PaymentIntent ${paymentIntent.id}`)
        }

        // A late failure event must never downgrade an already successful payment.
        if (booking.payment_status === 'paid') break

        const failedStatus = event.type === 'payment_intent.canceled' ? 'cancelled' : 'failed'
        const { error: paymentError } = await supabase.from('payments').upsert({
          booking_id: bookingId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          stripe_payment_intent_id: paymentIntent.id,
          status: failedStatus
        }, { onConflict: 'stripe_payment_intent_id' })

        if (paymentError) {
          throw new Error(`Failed to record unsuccessful payment: ${paymentError.message}`)
        }

        const { error: failureUpdateError } = await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            payment_status: failedStatus
          })
          .eq('id', bookingId)
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .neq('payment_status', 'paid')

        if (failureUpdateError) {
          throw new Error(`Failed to close unpaid booking: ${failureUpdateError.message}`)
        }
        break
      }

      default:
        console.log(`Unhandled Stripe event type ${event.type}`)
    }

    await recordEvent(true)
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: unknown) {
    console.error(`Error processing Stripe event ${event.id}: ${getErrorMessage(error)}`)
    await recordEvent(false)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
