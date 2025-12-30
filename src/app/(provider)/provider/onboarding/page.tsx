'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function ProviderOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    businessName: '',
    bio: '',
    serviceRadius: 10,
    address: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase.from('provider_profiles').insert({
        user_id: user.id,
        business_name: formData.businessName,
        bio: formData.bio,
        service_radius_miles: formData.serviceRadius,
        location_address: formData.address,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/provider/dashboard')
      router.refresh()
    } catch {
      setError('Failed to create profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Welcome to Eve Beauty Pro! ✨</h1>
          <p className="text-[#6B6B6B] mt-2">Let&apos;s set up your provider profile</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${s <= step ? 'bg-[#F4B5A4]' : 'bg-[#E5E5E5]'}`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="bg-[#FEE2E2] text-[#EF4444] px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Business Information</h2>
              <Input
                label="Business Name"
                name="businessName"
                placeholder="e.g., Jane's Nail Studio"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  placeholder="Tell customers about yourself and your services..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#F4B5A4] transition-colors placeholder:text-[#9E9E9E]"
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full" size="lg" disabled={!formData.businessName}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Service Area</h2>
              <Input
                label="Your Address"
                name="address"
                placeholder="123 Main St, City, State"
                value={formData.address}
                onChange={handleChange}
                helperText="This is your base location for calculating travel fees"
              />
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Service Radius: {formData.serviceRadius} miles
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={formData.serviceRadius}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceRadius: parseInt(e.target.value) }))}
                  className="w-full accent-[#F4B5A4]"
                />
                <div className="flex justify-between text-sm text-[#9E9E9E]">
                  <span>5 mi</span>
                  <span>30 mi</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1" size="lg">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1" size="lg">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Review & Submit</h2>
              <div className="bg-[#FEF5F2] rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-sm text-[#9E9E9E]">Business Name</p>
                  <p className="font-medium text-[#1A1A1A]">{formData.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#9E9E9E]">Bio</p>
                  <p className="font-medium text-[#1A1A1A]">{formData.bio || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-[#9E9E9E]">Service Area</p>
                  <p className="font-medium text-[#1A1A1A]">{formData.serviceRadius} miles from {formData.address || 'your location'}</p>
                </div>
              </div>
              <p className="text-sm text-[#9E9E9E]">
                You can add services and set your availability after completing setup.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1" size="lg">
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1" size="lg" isLoading={isLoading}>
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

