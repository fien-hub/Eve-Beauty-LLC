'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SocialLoginButtons, OrDivider } from '@/components/auth/SocialLoginButtons'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'provider',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: formData.role,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Create profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
        })

        // Create role-specific profile
        if (formData.role === 'customer') {
          await supabase.from('customer_profiles').insert({
            id: data.user.id,
          })
        } else if (formData.role === 'provider') {
          await supabase.from('provider_profiles').insert({
            id: data.user.id,
          })
        }

        router.push(`/verify?email=${encodeURIComponent(formData.email)}`)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#D97A5F] mb-2">Eve Beauty</h1>
          <p className="text-[#6B6B6B]">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Social Login */}
          <SocialLoginButtons redirectTo="/dashboard" />

          <OrDivider />

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-[#FEE2E2] text-[#EF4444] px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === 'customer'
                    ? 'border-[#F4B5A4] bg-[#FEF5F2]'
                    : 'border-[#E5E5E5] hover:border-[#D1D5DB]'
                }`}
              >
                <span className="text-2xl mb-1 block">💅</span>
                <span className="font-semibold text-[#1A1A1A]">Customer</span>
                <p className="text-xs text-[#6B6B6B] mt-1">Book services</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'provider' }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.role === 'provider'
                    ? 'border-[#F4B5A4] bg-[#FEF5F2]'
                    : 'border-[#E5E5E5] hover:border-[#D1D5DB]'
                }`}
              >
                <span className="text-2xl mb-1 block">✨</span>
                <span className="font-semibold text-[#1A1A1A]">Provider</span>
                <p className="text-xs text-[#6B6B6B] mt-1">Offer services</p>
              </button>
            </div>

            <Input label="Full Name" name="fullName" placeholder="Jane Doe" value={formData.fullName} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#6B6B6B]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#D97A5F] hover:text-[#E89580] font-semibold">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

