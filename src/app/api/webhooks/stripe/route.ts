import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe/server'
import { createAdminClient } from '@/utils/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.booking_id
        
        if (bookingId) {
          // Update booking status
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              stripe_payment_intent_id: paymentIntent.id
            })
            .eq('id', bookingId)

          // Create payment record
          await supabase.from('payments').insert({
            booking_id: bookingId,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            stripe_payment_intent_id: paymentIntent.id,
            status: 'succeeded'
          })
        }
        break
        
      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent
        const bookingIdFailed = paymentIntentFailed.metadata.booking_id
        
         if (bookingIdFailed) {
          await supabase
            .from('bookings')
            .update({
              payment_status: 'failed'
            })
            .eq('id', bookingIdFailed)
         }
        break
        
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    // Log event
    await supabase.from('stripe_events').insert({
      stripe_event_id: event.id,
      type: event.type,
      payload: event,
      processed: true
    })

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
