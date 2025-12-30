'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async () => {
    const token = otp.join('')
    if (token.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    try {
      const supabase = createClient()
      await supabase.auth.resend({ type: 'signup', email })
      setResendCooldown(60)
    } catch {
      setError('Failed to resend code')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#D97A5F] mb-2">Eve Beauty</h1>
          <p className="text-[#6B6B6B]">Verify your email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#FEF5F2] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <p className="text-[#6B6B6B]">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-[#1A1A1A]">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-[#FEE2E2] text-[#EF4444] px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors"
              />
            ))}
          </div>

          <Button onClick={handleVerify} className="w-full" size="lg" isLoading={isLoading}>
            Verify Email
          </Button>

          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm text-[#D97A5F] hover:text-[#E89580] disabled:text-[#9E9E9E] font-medium"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive code? Resend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}

