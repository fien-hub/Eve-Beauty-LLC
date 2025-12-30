import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook (no user context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { bookingId, customerId, providerId } = paymentIntent.metadata

        if (bookingId) {
          // Update booking status to confirmed
          await supabaseAdmin
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              payment_intent_id: paymentIntent.id,
            })
            .eq('id', bookingId)

          // Create notification for provider
          await supabaseAdmin.from('notifications').insert({
            user_id: providerId,
            type: 'booking_confirmed',
            title: 'New Booking Confirmed',
            message: 'You have a new confirmed booking!',
            data: { bookingId },
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { bookingId } = paymentIntent.metadata

        if (bookingId) {
          await supabaseAdmin
            .from('bookings')
            .update({
              payment_status: 'failed',
            })
            .eq('id', bookingId)
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        const providerId = account.metadata?.providerId

        if (providerId) {
          await supabaseAdmin
            .from('provider_profiles')
            .update({
              stripe_charges_enabled: account.charges_enabled,
              stripe_payouts_enabled: account.payouts_enabled,
            })
            .eq('id', providerId)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

