import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Shield, Key, Smartphone, Clock, Monitor, AlertCircle } from 'lucide-react'

export default async function ProviderSecuritySettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's authentication factors
  const { data: factors } = await supabase.auth.mfa.listFactors()

  // Get recent login activity (mock for now - implement with actual session tracking)
  const recentLogins = [
    {
      id: '1',
      device: 'Chrome on MacOS',
      location: 'San Francisco, CA',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'San Francisco, CA',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      current: false,
    },
  ]

  const hasMFA = factors && factors.totp && factors.totp.length > 0

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-6 md:py-8">
      <div className="container-responsive max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/provider/profile"
            className="inline-flex items-center text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-4"
          >
            <span className="mr-2">←</span> Back to Profile
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#D97A5F] bg-opacity-10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#D97A5F]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">Security Settings</h1>
              <p className="text-[#6B6B6B]">Manage your account security and authentication</p>
            </div>
          </div>
        </div>

        {/* Security Alert */}
        <div className="bg-[#FFF9E6] border border-[#FFD700] rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#CC9900] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[#996600] font-medium">Protect your business account</p>
            <p className="text-xs text-[#996600] mt-1">
              As a service provider, we highly recommend enabling two-factor authentication to protect your business and client data.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Password Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D97A5F] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-[#D97A5F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-1">Password</h3>
                  <p className="text-sm text-[#6B6B6B]">
                    Last changed: {new Date(user.updated_at || '').toLocaleDateString()}
                  </p>
                  <p className="text-xs text-[#9E9E9E] mt-2">
                    Use a strong, unique password to protect your business account
                  </p>
                </div>
              </div>
              <Link
                href="/provider/settings/security/change-password"
                className="px-4 py-2 bg-[#D97A5F] text-white text-sm font-medium rounded-xl hover:bg-[#C96A4F] transition-colors"
              >
                Change
              </Link>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D97A5F] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-[#D97A5F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-1">Two-Factor Authentication</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        hasMFA
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : 'bg-[#FFE5E5] text-[#C62828]'
                      }`}
                    >
                      {hasMFA ? '✓ Enabled' : '○ Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-[#9E9E9E]">
                    {hasMFA
                      ? 'Your business account is protected with 2FA'
                      : 'Add an extra layer of security to your business account'}
                  </p>
                </div>
              </div>
              <Link
                href="/provider/settings/security/2fa"
                className="px-4 py-2 bg-[#D97A5F] text-white text-sm font-medium rounded-xl hover:bg-[#C96A4F] transition-colors"
              >
                {hasMFA ? 'Manage' : 'Enable'}
              </Link>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#D97A5F] bg-opacity-10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-[#D97A5F]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A1A]">Active Sessions</h3>
                <p className="text-sm text-[#6B6B6B]">Manage devices logged into your account</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {recentLogins.map((login) => (
                <div
                  key={login.id}
                  className="flex items-start justify-between p-4 bg-[#F7F7F7] rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <Monitor className="w-5 h-5 text-[#6B6B6B] mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#1A1A1A] text-sm">{login.device}</p>
                        {login.current && (
                          <span className="text-xs bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B6B6B] mt-1">{login.location}</p>
                      <p className="text-xs text-[#9E9E9E] mt-1">
                        {new Date(login.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!login.current && (
                    <button className="text-sm text-[#C62828] hover:text-[#B71C1C] font-medium">
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Login History */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#D97A5F] bg-opacity-10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#D97A5F]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A1A]">Recent Login Activity</h3>
                <p className="text-sm text-[#6B6B6B]">Review your recent account access</p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {recentLogins.map((login) => (
                <div
                  key={login.id}
                  className="flex items-center justify-between p-3 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                    <div>
                      <p className="text-sm text-[#1A1A1A]">{login.device}</p>
                      <p className="text-xs text-[#9E9E9E]">{login.location}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B6B6B]">
                    {new Date(login.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-sm text-[#D97A5F] hover:text-[#C96A4F] font-medium">
              View Full History
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#FFE5E5] p-6">
            <h3 className="font-semibold text-[#C62828] mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Danger Zone
            </h3>
            <p className="text-sm text-[#6B6B6B] mb-4">
              Irreversible actions that affect your account security
            </p>
            <div className="space-y-3">
              <button className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-[#C62828] text-[#C62828] rounded-xl hover:bg-[#FFE5E5] transition-colors font-medium">
                Sign Out All Devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
