'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Car, MapPin, DollarSign, Info, CheckCircle, AlertCircle, Save } from 'lucide-react'

// Travel fee tiers based on distance
const TRAVEL_FEE_TIERS = [
  { distance: '0-5 miles', fee: 0, description: 'No travel fee' },
  { distance: '5-10 miles', fee: 10, description: 'Standard rate' },
  { distance: '10-15 miles', fee: 20, description: 'Extended range' },
  { distance: '15-25 miles', fee: 35, description: 'Long distance' },
  { distance: '25+ miles', fee: 50, description: 'Premium distance' },
]

export default function TravelSettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [settings, setSettings] = useState({
    acceptsOver25km: false,
    maxTravelDistance: 15, // miles
    requiresTravelFee: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get provider profile
      const { data: profile, error: profileError } = await supabase
        .from('provider_profiles')
        .select('accepts_over_25km')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError

      if (profile) {
        setSettings({
          acceptsOver25km: profile.accepts_over_25km || false,
          maxTravelDistance: profile.accepts_over_25km ? 25 : 15,
          requiresTravelFee: true,
        })
      }
    } catch (err: any) {
      console.error('Error loading settings:', err)
      setError('Failed to load travel settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update provider profile
      const { error: updateError } = await supabase
        .from('provider_profiles')
        .update({
          accepts_over_25km: settings.acceptsOver25km,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error saving settings:', err)
      setError(err.message || 'Failed to save travel settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D97A5F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B6B6B]">Loading travel settings...</p>
        </div>
      </div>
    )
  }

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
              <Car className="w-6 h-6 text-[#D97A5F]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">Travel & Distance Settings</h1>
              <p className="text-[#6B6B6B]">Configure your service area and travel preferences</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-[#E8F5E9] border border-[#2E7D32] rounded-2xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#2E7D32] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#2E7D32] font-medium">Travel settings saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFE5E5] border border-[#C62828] rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#C62828] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#C62828]">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Platform Policy Info */}
          <div className="bg-[#E3F2FD] border border-[#2196F3] rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#1976D2] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#1976D2] mb-2">Standardized Travel Fees</h3>
                <p className="text-sm text-[#1976D2] leading-relaxed">
                  Eve Beauty uses platform-wide standardized travel fees to ensure fair and transparent pricing for all customers. These fees are automatically calculated based on distance.
                </p>
              </div>
            </div>
          </div>

          {/* Travel Fee Structure */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-[#D97A5F]" />
              <h3 className="font-semibold text-[#1A1A1A]">Travel Fee Structure</h3>
            </div>

            <div className="space-y-3">
              {TRAVEL_FEE_TIERS.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#6B6B6B]" />
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{tier.distance}</p>
                      <p className="text-xs text-[#6B6B6B]">{tier.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#D97A5F]">
                      {tier.fee === 0 ? 'Free' : `$${tier.fee}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maximum Travel Distance */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Car className="w-5 h-5 text-[#D97A5F]" />
              <h3 className="font-semibold text-[#1A1A1A]">Maximum Travel Distance</h3>
            </div>

            <p className="text-sm text-[#6B6B6B] mb-4">
              Set the maximum distance you're willing to travel for appointments
            </p>

            <div className="space-y-4">
              {/* Standard Range (up to 15 miles) */}
              <label className="flex items-start gap-4 p-4 border-2 border-[#E5E5E5] rounded-xl cursor-pointer hover:border-[#D97A5F] transition-colors">
                <input
                  type="radio"
                  name="maxDistance"
                  checked={!settings.acceptsOver25km}
                  onChange={() => setSettings({ ...settings, acceptsOver25km: false, maxTravelDistance: 15 })}
                  className="mt-1 w-5 h-5 text-[#D97A5F] focus:ring-[#D97A5F]"
                />
                <div className="flex-1">
                  <p className="font-medium text-[#1A1A1A]">Standard Range (Up to 15 miles)</p>
                  <p className="text-sm text-[#6B6B6B] mt-1">
                    Recommended for most providers. Travel fees up to $20.
                  </p>
                </div>
              </label>

              {/* Extended Range (up to 25+ miles) */}
              <label className="flex items-start gap-4 p-4 border-2 border-[#E5E5E5] rounded-xl cursor-pointer hover:border-[#D97A5F] transition-colors">
                <input
                  type="radio"
                  name="maxDistance"
                  checked={settings.acceptsOver25km}
                  onChange={() => setSettings({ ...settings, acceptsOver25km: true, maxTravelDistance: 25 })}
                  className="mt-1 w-5 h-5 text-[#D97A5F] focus:ring-[#D97A5F]"
                />
                <div className="flex-1">
                  <p className="font-medium text-[#1A1A1A]">Extended Range (Up to 25+ miles)</p>
                  <p className="text-sm text-[#6B6B6B] mt-1">
                    Accept longer distance bookings. Travel fees up to $50.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Your Current Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-xl">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Maximum Travel Distance</p>
                  <p className="text-sm text-[#6B6B6B]">How far you'll travel</p>
                </div>
                <p className="font-semibold text-[#D97A5F]">
                  Up to {settings.maxTravelDistance} miles
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-xl">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Travel Fee Range</p>
                  <p className="text-sm text-[#6B6B6B]">Applied automatically</p>
                </div>
                <p className="font-semibold text-[#D97A5F]">
                  $0 - ${settings.acceptsOver25km ? '50' : '20'}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-xl">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Long Distance Bookings</p>
                  <p className="text-sm text-[#6B6B6B]">Over 15 miles</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  settings.acceptsOver25km 
                    ? 'bg-[#E8F5E9] text-[#2E7D32]' 
                    : 'bg-[#FFE5E5] text-[#C62828]'
                }`}>
                  {settings.acceptsOver25km ? 'Accepted' : 'Not Accepted'}
                </span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">How Travel Fees Work</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#2E7D32]">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">Automatic Calculation</p>
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    Travel fees are automatically calculated based on the distance between your location and the customer
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#2E7D32]">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">Transparent Pricing</p>
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    Customers see the travel fee clearly displayed before booking
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#2E7D32]">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">You Get Paid</p>
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    Travel fees are included in your total payout for each booking
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving || success}
              className="flex-1 px-6 py-3 bg-[#D97A5F] text-white rounded-xl hover:bg-[#C96A4F] transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
            <Link
              href="/provider/profile"
              className="flex-1 px-6 py-3 bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-xl hover:bg-[#F7F7F7] transition-colors text-center font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
