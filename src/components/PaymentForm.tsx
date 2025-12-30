'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  amount: number // in cents
  providerId: string
  serviceId: string
  bookingId?: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

function CheckoutForm({ onSuccess, onError }: { 
  onSuccess: (id: string) => void
  onError: (error: string) => void 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setMessage('')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/customer/bookings?payment=success`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setMessage(error.message || 'Payment failed')
      onError(error.message || 'Payment failed')
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }

    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {message && (
        <p className="text-red-500 text-sm">{message}</p>
      )}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  )
}

export function PaymentForm({
  amount,
  providerId,
  serviceId,
  bookingId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, providerId, serviceId, bookingId }),
        })

        const data = await response.json()

        if (data.error) {
          onError(data.error)
          return
        }

        setClientSecret(data.clientSecret)
      } catch {
        onError('Failed to initialize payment')
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [amount, providerId, serviceId, bookingId, onError])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4B5A4]"></div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="text-center p-4 text-red-500">
        Failed to initialize payment. Please try again.
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#F4B5A4',
            borderRadius: '12px',
          },
        },
      }}
    >
      <CheckoutForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}

