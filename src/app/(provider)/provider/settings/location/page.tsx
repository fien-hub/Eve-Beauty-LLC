'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Loader2,
  Save,
  ExternalLink,
  Info,
} from 'lucide-react'

export default function LocationSettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    serviceRadius: '10',
  })

  useEffect(() => {
    loadLocationData()
  }, [])

  const loadLocationData = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Get provider profile with location data
      const { data: providerProfile, error: profileError } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('id', profile.id)
        .single()

      if (profileError) throw profileError

      if (providerProfile) {
        setFormData({
          address: providerProfile.address || '',
          city: providerProfile.city || '',
          state: providerProfile.state || '',
          zipCode: providerProfile.zip_code || '',
          latitude: providerProfile.latitude?.toString() || '',
          longitude: providerProfile.longitude?.toString() || '',
          serviceRadius: providerProfile.service_radius_km?.toString() || '10',
        })
      }
    } catch (err: any) {
      console.error('Error loading location data:', err)
      setError('Failed to load location data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!formData.address.trim()) {
      setError('Please enter your business address')
      return
    }
    if (!formData.city.trim()) {
      setError('Please enter your city')
      return
    }
    if (!formData.state.trim()) {
      setError('Please enter your state')
      return
    }
    if (!formData.zipCode.trim()) {
      setError('Please enter your zip code')
      return
    }

    const radiusNum = parseInt(formData.serviceRadius)
    if (isNaN(radiusNum) || radiusNum < 1 || radiusNum > 100) {
      setError('Service radius must be between 1 and 100 km')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const updateData: any = {
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zipCode.trim(),
        service_radius_km: radiusNum,
      }

      // Add coordinates if provided
      if (formData.latitude.trim() && formData.longitude.trim()) {
        const lat = parseFloat(formData.latitude)
        const lng = parseFloat(formData.longitude)
        if (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        ) {
          updateData.latitude = lat
          updateData.longitude = lng
        }
      }

      const { error: updateError } = await supabase
        .from('provider_profiles')
        .update(updateData)
        .eq('id', profile.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error saving location:', err)
      setError(err.message || 'Failed to save location settings')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenGoogleMaps = () => {
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    window.open(url, '_blank')
  }

  const handleViewOnMap = () => {
    if (!formData.latitude || !formData.longitude) {
      setError('Please add coordinates first')
      return
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D97A5F] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/provider/profile"
              className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">
                Location Settings
              </h1>
              <p className="text-sm text-[#6B6B6B]">
                Manage your business address and service area
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-600">
              ✓ Location settings saved successfully!
            </p>
          </div>
        )}

        {/* Business Address Section */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#D97A5F]" />
            </div>
            <div>
              <h2 className="font-bold text-[#1A1A1A]">Business Address</h2>
              <p className="text-sm text-[#6B6B6B]">
                Set your business location to help customers find you
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Main Street"
                className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent"
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="New York"
                  className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      state: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="NY"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent uppercase"
                />
              </div>
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                placeholder="10001"
                maxLength={10}
                className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Coordinates Section */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-[#D97A5F]" />
            </div>
            <div>
              <h2 className="font-bold text-[#1A1A1A]">
                Coordinates (Optional)
              </h2>
              <p className="text-sm text-[#6B6B6B]">
                Add precise coordinates for better location accuracy
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Lat/Long */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  placeholder="40.7128"
                  className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  placeholder="-74.0060"
                  className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent"
                />
              </div>
            </div>

            {/* Map Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleOpenGoogleMaps}
                className="flex items-center gap-2 px-4 py-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-xl transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#6B6B6B]" />
                <span className="text-sm font-medium text-[#1A1A1A]">
                  Find Coordinates
                </span>
                <ExternalLink className="w-3 h-3 text-[#6B6B6B]" />
              </button>

              {formData.latitude && formData.longitude && (
                <button
                  onClick={handleViewOnMap}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-xl transition-colors"
                >
                  <Navigation className="w-4 h-4 text-[#6B6B6B]" />
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    View on Map
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#6B6B6B]" />
                </button>
              )}
            </div>

            {/* Help Text */}
            <div className="flex items-start gap-2 p-3 bg-[#F7F7F7] rounded-xl">
              <Info className="w-4 h-4 text-[#6B6B6B] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#6B6B6B]">
                To get coordinates: Use Google Maps to find your location,
                long-press on your location, copy the coordinates, and paste
                them in the fields above.
              </p>
            </div>
          </div>
        </div>

        {/* Service Area Section */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#D97A5F]" />
            </div>
            <div>
              <h2 className="font-bold text-[#1A1A1A]">Service Area</h2>
              <p className="text-sm text-[#6B6B6B]">
                Set how far you're willing to travel for appointments
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Service Radius */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Service Radius (km) *
              </label>
              <input
                type="number"
                value={formData.serviceRadius}
                onChange={(e) =>
                  setFormData({ ...formData, serviceRadius: e.target.value })
                }
                placeholder="10"
                min="1"
                max="100"
                className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] focus:border-transparent"
              />
              <p className="mt-2 text-xs text-[#6B6B6B]">
                You will receive booking requests within {formData.serviceRadius || '0'}{' '}
                km of your business location
              </p>
            </div>

            {/* Distance Reference */}
            <div className="p-4 bg-[#F7F7F7] rounded-xl">
              <p className="text-sm font-medium text-[#1A1A1A] mb-2">
                📏 Distance Reference:
              </p>
              <ul className="space-y-1 text-xs text-[#6B6B6B]">
                <li>• 5 km ≈ 3 miles (neighborhood)</li>
                <li>• 10 km ≈ 6 miles (small city)</li>
                <li>• 25 km ≈ 15 miles (large city)</li>
                <li>• 50 km ≈ 31 miles (metro area)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-[#D97A5F] hover:bg-[#C86A50] disabled:bg-[#E5E5E5] text-white disabled:text-[#6B6B6B] rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Location Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}
