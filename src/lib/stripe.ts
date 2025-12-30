import Stripe from 'stripe'

// Create a mock stripe instance if no key is provided (for build/demo purposes)
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(stripeKey, {
  // @ts-expect-error - Stripe types may not match the latest API version
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
}

export const isStripeConfigured = () => {
  return !!process.env.STRIPE_SECRET_KEY
}

