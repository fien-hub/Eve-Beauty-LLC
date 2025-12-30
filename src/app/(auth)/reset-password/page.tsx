'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSessionError(true)
      }
    }
    checkSession()
  }, [supabase.auth])

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase', met: /[A-Z]/.test(password) },
    { label: 'Passwords match', met: password === confirmPassword && password.length > 0 },
  ]

  const allRequirementsMet = passwordRequirements.every(req => req.met)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRequirementsMet) return
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF] px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-[#EF4444]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Invalid or expired link</h1>
          <p className="text-[#6B6B6B] mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button fullWidth>Request new link</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF] px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#10B981]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Password reset successful!</h1>
          <p className="text-[#6B6B6B] mb-6">
            Your password has been updated. Redirecting to login...
          </p>
          <Link href="/login">
            <Button fullWidth>Go to login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FEF5F2] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#D97A5F]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Set new password</h1>
          <p className="text-[#6B6B6B]">Your new password must be different from previous passwords.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#EF4444] rounded-xl text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full px-4 py-3 pr-12 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full px-4 py-3 pr-12 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          <div className="space-y-2">
            {passwordRequirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-[#10B981]' : 'bg-[#E5E5E5]'}`}>
                  {req.met && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className={req.met ? 'text-[#10B981]' : 'text-[#9E9E9E]'}>{req.label}</span>
              </div>
            ))}
          </div>

          <Button type="submit" isLoading={loading} disabled={!allRequirementsMet} className="w-full">
            Reset password
          </Button>
        </form>
      </div>
    </div>
  )
}

