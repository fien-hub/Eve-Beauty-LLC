'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Key, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function ChangePasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const levels = [
      { strength: 0, label: 'Too weak', color: 'bg-[#C62828]' },
      { strength: 1, label: 'Weak', color: 'bg-[#FF6B00]' },
      { strength: 2, label: 'Fair', color: 'bg-[#FFD700]' },
      { strength: 3, label: 'Good', color: 'bg-[#7CB342]' },
      { strength: 4, label: 'Strong', color: 'bg-[#2E7D32]' },
      { strength: 5, label: 'Very Strong', color: 'bg-[#1B5E20]' },
    ]

    return levels[Math.min(strength, 5)]
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)
  const passwordsMatch = formData.newPassword && formData.newPassword === formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (passwordStrength.strength < 2) {
      setError('Please choose a stronger password')
      return
    }

    setLoading(true)

    try {
      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      })

      if (updateError) throw updateError

      setSuccess(true)
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/provider/settings/security')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-6 md:py-8">
      <div className="container-responsive max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/provider/settings/security"
            className="inline-flex items-center text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-4"
          >
            <span className="mr-2">←</span> Back to Security Settings
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#D97A5F] bg-opacity-10 flex items-center justify-center">
              <Key className="w-6 h-6 text-[#D97A5F]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">Change Password</h1>
              <p className="text-[#6B6B6B]">Update your account password</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-[#E8F5E9] border border-[#2E7D32] rounded-2xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#2E7D32] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#2E7D32] font-medium">Password updated successfully!</p>
              <p className="text-xs text-[#2E7D32] mt-1">Redirecting you back...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFE5E5] border border-[#C62828] rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#C62828] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#C62828]">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
          <div className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-12 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent"
                  placeholder="Enter your current password"
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-12 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent"
                  placeholder="Enter your new password"
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#6B6B6B]">Password strength:</span>
                    <span className={`text-xs font-medium ${passwordStrength.strength >= 3 ? 'text-[#2E7D32]' : 'text-[#FF6B00]'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                <p className="text-xs text-[#6B6B6B]">Password must contain:</p>
                <ul className="space-y-1">
                  <li className={`text-xs flex items-center gap-2 ${formData.newPassword.length >= 8 ? 'text-[#2E7D32]' : 'text-[#9E9E9E]'}`}>
                    {formData.newPassword.length >= 8 ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    At least 8 characters
                  </li>
                  <li className={`text-xs flex items-center gap-2 ${/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? 'text-[#2E7D32]' : 'text-[#9E9E9E]'}`}>
                    {/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    Uppercase and lowercase letters
                  </li>
                  <li className={`text-xs flex items-center gap-2 ${/\d/.test(formData.newPassword) ? 'text-[#2E7D32]' : 'text-[#9E9E9E]'}`}>
                    {/\d/.test(formData.newPassword) ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    At least one number
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-12 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent"
                  placeholder="Confirm your new password"
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#2E7D32]" />
                      <span className="text-xs text-[#2E7D32]">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#C62828]" />
                      <span className="text-xs text-[#C62828]">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="submit"
              disabled={loading || success || !passwordsMatch || passwordStrength.strength < 2}
              className="flex-1 px-6 py-3 bg-[#D97A5F] text-white rounded-xl hover:bg-[#C96A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Updating...' : success ? 'Password Updated!' : 'Update Password'}
            </button>
            <Link
              href="/provider/settings/security"
              className="flex-1 px-6 py-3 bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-xl hover:bg-[#F7F7F7] transition-colors text-center font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Security Tip */}
        <div className="mt-6 bg-[#E3F2FD] border border-[#2196F3] rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#1976D2] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#1976D2] font-medium">Security Tip</p>
              <p className="text-xs text-[#1976D2] mt-1">
                Use a unique password that you don't use for other accounts. Consider using a password manager for better security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
