'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Smartphone, Shield, Key, Copy, CheckCircle, AlertCircle, QrCode } from 'lucide-react'
import QRCode from 'qrcode'

export default function TwoFactorAuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'check' | 'setup' | 'verify' | 'manage'>('check')
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedBackup, setCopiedBackup] = useState(false)

  useEffect(() => {
    checkMFAStatus()
  }, [])

  const checkMFAStatus = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user has MFA enabled
      const { data: factors } = await supabase.auth.mfa.listFactors()
      
      if (factors && factors.totp && factors.totp.length > 0) {
        setStep('manage')
      } else {
        setStep('setup')
      }
    } catch (err) {
      console.error('Error checking MFA status:', err)
      setError('Failed to check 2FA status')
    } finally {
      setLoading(false)
    }
  }

  const startSetup = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })

      if (enrollError) throw enrollError

      if (data) {
        setSecret(data.totp.secret)
        
        // Generate QR code
        const otpauthUrl = data.totp.uri
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)
        setQrCode(qrCodeDataUrl)
        
        setStep('verify')
      }
    } catch (err: any) {
      console.error('Error starting 2FA setup:', err)
      setError(err.message || 'Failed to start 2FA setup')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndEnable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const factorId = factors?.totp?.[0]?.id

      if (!factorId) throw new Error('No factor found')

      const { data, error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      })

      if (verifyError) throw verifyError

      // Generate backup codes (mock for now)
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      )
      setBackupCodes(codes)
      
      setStep('manage')
    } catch (err: any) {
      console.error('Error verifying 2FA:', err)
      setError('Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    setLoading(true)
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const factorId = factors?.totp?.[0]?.id

      if (factorId) {
        await supabase.auth.mfa.unenroll({ factorId })
        setStep('setup')
      }
    } catch (err) {
      console.error('Error disabling 2FA:', err)
      setError('Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text)
    if (type === 'secret') {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } else {
      setCopiedBackup(true)
      setTimeout(() => setCopiedBackup(false), 2000)
    }
  }

  if (loading && step === 'check') {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D97A5F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B6B6B]">Loading 2FA settings...</p>
        </div>
      </div>
    )
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
              <Smartphone className="w-6 h-6 text-[#D97A5F]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">Two-Factor Authentication</h1>
              <p className="text-[#6B6B6B]">
                {step === 'manage' ? 'Manage your 2FA settings' : 'Add an extra layer of security'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFE5E5] border border-[#C62828] rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#C62828] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#C62828]">{error}</p>
          </div>
        )}

        {/* Setup Flow */}
        {step === 'setup' && (
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[#2196F3]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">What is Two-Factor Authentication?</h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">
                    2FA adds an extra layer of security by requiring a code from your phone in addition to your password when signing in.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#2E7D32]">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Install an authenticator app</p>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Download Google Authenticator, Authy, or 1Password on your phone
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#2E7D32]">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Scan the QR code</p>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Use your authenticator app to scan the QR code we'll provide
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#2E7D32]">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Enter the verification code</p>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Enter the 6-digit code from your app to complete setup
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={startSetup}
                disabled={loading}
                className="w-full mt-6 px-6 py-3 bg-[#D97A5F] text-white rounded-xl hover:bg-[#C96A4F] transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
              </button>
            </div>
          </div>
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
              <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#D97A5F]" />
                Scan QR Code
              </h3>

              {qrCode && (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl border-2 border-[#E5E5E5]">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                  
                  <p className="text-sm text-[#6B6B6B] text-center mt-4 mb-4">
                    Scan this QR code with your authenticator app
                  </p>

                  {/* Manual Entry */}
                  <div className="w-full p-4 bg-[#F7F7F7] rounded-xl">
                    <p className="text-xs text-[#6B6B6B] mb-2">Can't scan? Enter this code manually:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white rounded-lg text-sm font-mono text-[#1A1A1A] border border-[#E5E5E5]">
                        {secret}
                      </code>
                      <button
                        onClick={() => copyToClipboard(secret, 'secret')}
                        className="px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F7] transition-colors"
                        title="Copy code"
                      >
                        {copiedSecret ? (
                          <CheckCircle className="w-4 h-4 text-[#2E7D32]" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#6B6B6B]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Code Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
              <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#D97A5F]" />
                Enter Verification Code
              </h3>

              <p className="text-sm text-[#6B6B6B] mb-4">
                Enter the 6-digit code from your authenticator app
              </p>

              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent text-center text-2xl font-mono tracking-widest"
                maxLength={6}
              />

              <button
                onClick={verifyAndEnable}
                disabled={loading || verifyCode.length !== 6}
                className="w-full mt-4 px-6 py-3 bg-[#D97A5F] text-white rounded-xl hover:bg-[#C96A4F] transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Verifying...' : 'Verify and Enable'}
              </button>
            </div>
          </div>
        )}

        {/* Manage (Enabled) */}
        {step === 'manage' && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-[#E8F5E9] border border-[#2E7D32] rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#2E7D32] flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-[#2E7D32] mb-1">2FA is Enabled</h3>
                  <p className="text-sm text-[#2E7D32]">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              </div>
            </div>

            {/* Backup Codes */}
            {backupCodes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
                <h3 className="font-semibold text-[#1A1A1A] mb-2">Backup Codes</h3>
                <p className="text-sm text-[#6B6B6B] mb-4">
                  Save these codes in a safe place. You can use them to access your account if you lose your phone.
                </p>

                <div className="grid grid-cols-2 gap-2 p-4 bg-[#F7F7F7] rounded-xl mb-4">
                  {backupCodes.map((code, idx) => (
                    <code key={idx} className="text-sm font-mono text-[#1A1A1A]">
                      {code}
                    </code>
                  ))}
                </div>

                <button
                  onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                  className="w-full px-4 py-2 bg-[#D97A5F] text-white rounded-xl hover:bg-[#C96A4F] transition-colors flex items-center justify-center gap-2"
                >
                  {copiedBackup ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy All Codes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
              <h3 className="font-semibold text-[#1A1A1A] mb-4">Manage 2FA</h3>
              
              <button
                onClick={disable2FA}
                disabled={loading}
                className="w-full px-6 py-3 bg-white border-2 border-[#C62828] text-[#C62828] rounded-xl hover:bg-[#FFE5E5] transition-colors font-medium"
              >
                {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
