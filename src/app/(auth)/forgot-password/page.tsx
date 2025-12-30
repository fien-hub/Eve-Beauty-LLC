'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Check your email</h1>
            <p className="text-[#6B6B6B] mb-6">
              We've sent a password reset link to <span className="font-medium text-[#1A1A1A]">{email}</span>
            </p>
            <p className="text-sm text-[#9E9E9E] mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setSuccess(false)} variant="outline" fullWidth>
                Try another email
              </Button>
              <Link
                href="/login"
                className="block text-center text-[#D97A5F] font-medium hover:underline"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF] px-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[#6B6B6B] hover:text-[#D97A5F] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#FEF5F2] rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#D97A5F]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Forgot password?</h1>
            <p className="text-[#6B6B6B]">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-[#FEE2E2] border border-[#EF4444] rounded-xl text-[#EF4444] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors"
              />
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Send reset link
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-[#6B6B6B] mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-[#D97A5F] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

