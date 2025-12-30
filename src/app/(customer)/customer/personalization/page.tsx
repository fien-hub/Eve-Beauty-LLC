'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Loader2,
  Check,
} from 'lucide-react'

interface ServiceCategory {
  id: string
  name: string
  icon: string
}

const BUDGET_OPTIONS = [
  { value: 'budget', label: '$', description: 'Budget-friendly (Under $50)' },
  { value: 'moderate', label: '$$', description: 'Moderate ($50-$100)' },
  { value: 'premium', label: '$$$', description: 'Premium ($100+)' },
]

const TIME_OPTIONS = [
  { value: 'morning', label: '🌅 Morning', description: '6AM - 12PM' },
  { value: 'afternoon', label: '☀️ Afternoon', description: '12PM - 6PM' },
  { value: 'evening', label: '🌙 Evening', description: '6PM - 10PM' },
  { value: 'flexible', label: '🕐 Flexible', description: 'Anytime' },
]

export default function PersonalizationPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [location, setLocation] = useState({ city: '', state: '', zipCode: '' })
  const [timePreference, setTimePreference] = useState('')
  const [budget, setBudget] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from('service_categories')
        .select('id, name, icon')
        .order('name')

      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleNext = () => {
    if (step === 1 && selectedCategories.length === 0) {
      alert('Please select at least one service category')
      return
    }
    if (step === 2 && (!location.city || !location.state || !location.zipCode)) {
      alert('Please fill in your location details')
      return
    }
    if (step === 3 && !timePreference) {
      alert('Please select your booking preference')
      return
    }
    if (step === 4 && !budget) {
      alert('Please select your budget preference')
      return
    }

    if (step < 4) {
      setStep(step + 1)
    } else {
      savePreferences()
    }
  }

  const handleSkip = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        await supabase
          .from('customer_profiles')
          .update({ onboarding_completed: true })
          .eq('id', profile.id)
      }

      router.push('/customer/discover')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
    }
  }

  const savePreferences = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      await supabase
        .from('customer_profiles')
        .update({
          preferred_categories: selectedCategories,
          location_city: location.city,
          location_state: location.state,
          location_zip_code: location.zipCode,
          booking_time_preference: timePreference,
          budget_preference: budget,
          onboarding_completed: true,
        })
        .eq('id', profile.id)

      router.push('/customer/discover')
    } catch (error: any) {
      console.error('Error saving preferences:', error)
      alert(error.message || 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE5DF] via-[#F7F7F7] to-[#FEF5F2]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-[#D97A5F]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Personalize Your Experience
          </h1>
          <p className="text-[#6B6B6B]">
            Help us find the perfect services for you
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-[#D97A5F]'
                  : s < step
                  ? 'w-2 bg-[#D97A5F]'
                  : 'w-2 bg-[#E5E5E5]'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          {/* Step 1: Service Categories */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                What services interest you?
              </h2>
              <p className="text-[#6B6B6B] mb-6">
                Select all that apply
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                      selectedCategories.includes(category.id)
                        ? 'border-[#D97A5F] bg-[#FCE5DF]'
                        : 'border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <p className="font-semibold text-sm text-[#1A1A1A]">
                      {category.name}
                    </p>
                    {selectedCategories.includes(category.id) && (
                      <Check className="w-5 h-5 text-[#D97A5F] mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#D97A5F]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">
                    Where are you located?
                  </h2>
                  <p className="text-[#6B6B6B]">
                    We'll find providers near you
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={location.city}
                    onChange={(e) =>
                      setLocation({ ...location, city: e.target.value })
                    }
                    placeholder="City"
                    className="px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F]"
                  />
                  <input
                    type="text"
                    value={location.state}
                    onChange={(e) =>
                      setLocation({
                        ...location,
                        state: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="State"
                    maxLength={2}
                    className="px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F] uppercase"
                  />
                </div>
                <input
                  type="text"
                  value={location.zipCode}
                  onChange={(e) =>
                    setLocation({ ...location, zipCode: e.target.value })
                  }
                  placeholder="Zip Code"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D97A5F]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Time Preference */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#D97A5F]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">
                    When do you prefer bookings?
                  </h2>
                  <p className="text-[#6B6B6B]">
                    Select your preferred time
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {TIME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimePreference(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all hover:scale-105 text-left ${
                      timePreference === option.value
                        ? 'border-[#D97A5F] bg-[#FCE5DF]'
                        : 'border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#1A1A1A] mb-1">
                          {option.label}
                        </p>
                        <p className="text-sm text-[#6B6B6B]">
                          {option.description}
                        </p>
                      </div>
                      {timePreference === option.value && (
                        <Check className="w-6 h-6 text-[#D97A5F]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#D97A5F]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">
                    What's your budget?
                  </h2>
                  <p className="text-[#6B6B6B]">
                    We'll show you matching options
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {BUDGET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBudget(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all hover:scale-105 text-left ${
                      budget === option.value
                        ? 'border-[#D97A5F] bg-[#FCE5DF]'
                        : 'border-[#E5E5E5] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#1A1A1A] text-xl mb-1">
                          {option.label}
                        </p>
                        <p className="text-sm text-[#6B6B6B]">
                          {option.description}
                        </p>
                      </div>
                      {budget === option.value && (
                        <Check className="w-6 h-6 text-[#D97A5F]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-[#6B6B6B] hover:text-[#1A1A1A] font-semibold transition-colors"
            >
              Skip
            </button>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#1A1A1A] rounded-xl font-semibold transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 py-3 bg-[#D97A5F] hover:bg-[#C86A50] disabled:bg-[#E5E5E5] text-white disabled:text-[#6B6B6B] rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : step === 4 ? (
                'Complete'
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
