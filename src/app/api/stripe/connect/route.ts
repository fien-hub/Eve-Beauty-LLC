import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Create Stripe Connect account for provider
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a provider
    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('id, stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Not a provider' }, { status: 403 })
    }

    // If already has Stripe account, create new onboarding link
    if (provider.stripe_account_id) {
      const accountLink = await stripe.accountLinks.create({
        account: provider.stripe_account_id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/provider/settings?stripe=refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/provider/settings?stripe=success`,
        type: 'account_onboarding',
      })

      return NextResponse.json({ url: accountLink.url })
    }

    // Get user profile for pre-filling
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    // Create new Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        providerId: provider.id,
        userId: user.id,
      },
    })

    // Save Stripe account ID to provider profile
    await supabase
      .from('provider_profiles')
      .update({ stripe_account_id: account.id })
      .eq('id', provider.id)

    // Create account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/provider/settings?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/provider/settings?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url, accountId: account.id })
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}

// Get Stripe Connect account status
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (!provider?.stripe_account_id) {
      return NextResponse.json({ connected: false })
    }

    const account = await stripe.accounts.retrieve(provider.stripe_account_id)

    return NextResponse.json({
      connected: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    })
  } catch (error) {
    console.error('Error getting Stripe account status:', error)
    return NextResponse.json({ connected: false })
  }
}

