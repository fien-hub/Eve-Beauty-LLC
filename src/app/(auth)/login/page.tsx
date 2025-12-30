'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SocialLoginButtons, OrDivider } from '@/components/auth/SocialLoginButtons'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#D97A5F] mb-2">Eve Beauty</h1>
          <p className="text-[#6B6B6B]">Welcome back! Sign in to continue</p>
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

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="rounded border-[#E5E5E5] text-[#F4B5A4] focus:ring-[#F4B5A4]" />
                <span className="ml-2 text-[#6B6B6B]">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-[#D97A5F] hover:text-[#E89580] font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#6B6B6B]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#D97A5F] hover:text-[#E89580] font-semibold">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

