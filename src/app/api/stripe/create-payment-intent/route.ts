import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, amount, providerId, serviceId } = body

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Get provider's Stripe account ID for Connect
    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('stripe_account_id, user_id')
      .eq('id', providerId)
      .single()

    // Calculate platform fee (15%)
    const platformFee = Math.round(amount * 0.15)

    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: bookingId || '',
        customerId: user.id,
        providerId,
        serviceId: serviceId || '',
      },
    }

    // If provider has Stripe Connect, use destination charges
    if (provider?.stripe_account_id) {
      paymentIntentData.transfer_data = {
        destination: provider.stripe_account_id,
      }
      paymentIntentData.application_fee_amount = platformFee
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

