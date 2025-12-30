'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaymentForm } from '@/components/PaymentForm'
import { DatePicker } from '@/components/ui/date-picker'
import { TimeSlotPicker, generateTimeSlots } from '@/components/ui/time-slot-picker'
import { PriceBreakdown } from '@/components/ui/price-breakdown'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, MapPin, Repeat, ChevronRight, CheckCircle, Star } from 'lucide-react'

interface Props {
  params: Promise<{ providerId: string; serviceId: string }>
}

interface ProviderData {
  business_name: string
  id: string
  user_id: string
  profile_photo_url?: string
  avatar_url?: string
  rating?: number
  total_reviews?: number
  travel_fee_per_mile?: number
  service_radius_miles?: number
}

interface ServiceData {
  base_price: number
  duration_minutes: number
  services: { name: string; description?: string }
}

export default function BookingPage({ params }: Props) {
  const { providerId, serviceId } = use(params)
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: date, 2: time, 3: details, 4: payment
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingId, setBookingId] = useState<string | null>(null)

  const [provider, setProvider] = useState<ProviderData | null>(null)
  const [service, setService] = useState<ServiceData | null>(null)
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([])

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [recurringCount, setRecurringCount] = useState(4)

  const [formData, setFormData] = useState({
    address: '',
    notes: '',
  })

  const travelFee = provider?.travel_fee_per_mile ? provider.travel_fee_per_mile * 5 : 1000 // Estimate 5 miles
  const servicePrice = service?.base_price || 0
  const recurringDiscount = isRecurring ? Math.round(servicePrice * 0.1) : 0 // 10% discount for recurring
  const totalPrice = servicePrice + travelFee - recurringDiscount

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const { data: providerData } = await supabase
        .from('provider_profiles')
        .select('business_name, id, user_id, profile_photo_url, avatar_url, rating, total_reviews, travel_fee_per_mile, service_radius_miles')
        .eq('id', providerId)
        .single()

      const { data: serviceData } = await supabase
        .from('provider_services')
        .select('*, services (name, description)')
        .eq('id', serviceId)
        .single()

      setProvider(providerData)
      setService(serviceData as ServiceData)
    }
    loadData()
  }, [providerId, serviceId])

  // Load unavailable times when date changes
  useEffect(() => {
    async function loadAvailability() {
      if (!selectedDate || !provider) return

      const supabase = createClient()
      const dateStr = selectedDate.toISOString().split('T')[0]

      // Get existing bookings for this provider on this date
      const { data: bookings } = await supabase
        .from('bookings')
        .select('scheduled_time')
        .eq('provider_id', providerId)
        .eq('scheduled_date', dateStr)
        .in('status', ['pending', 'confirmed'])

      const bookedTimes = bookings?.map(b => (b.scheduled_time as string).slice(0, 5)) || []
      setUnavailableTimes(bookedTimes)
    }
    loadAvailability()
  }, [selectedDate, provider])

  const timeSlots = generateTimeSlots(9, 19, 30, unavailableTimes)

  const handleContinueToPayment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          providerServiceId: serviceId,
          bookingDate: selectedDate.toISOString().split('T')[0],
          startTime: selectedTime,
          customerAddress: formData.address,
          notes: formData.notes,
          totalPrice,
          travelFee,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : null,
          recurringCount: isRecurring ? recurringCount : null,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      setBookingId(data.booking.id)
      setStep(4)
    } catch {
      setError('Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceedToTime = selectedDate !== null
  const canProceedToDetails = selectedDate !== null && selectedTime !== null
  const canProceedToPayment = canProceedToDetails && formData.address.trim() !== ''

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Update booking with payment info
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId }),
    })
    router.push('/customer/bookings?payment=success')
  }

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg)
  }

  const minDate = new Date()
  minDate.setHours(0, 0, 0, 0)

  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3) // Allow booking up to 3 months ahead

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#D97A5F]">Eve Beauty</Link>
          <Link href={`/provider/${providerId}`} className="text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">← Back</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: 'Date', icon: Calendar },
            { num: 2, label: 'Time', icon: Clock },
            { num: 3, label: 'Details', icon: MapPin },
            { num: 4, label: 'Payment', icon: CheckCircle },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => {
                  if (s.num === 1) setStep(1)
                  else if (s.num === 2 && canProceedToTime) setStep(2)
                  else if (s.num === 3 && canProceedToDetails) setStep(3)
                }}
                disabled={
                  (s.num === 2 && !canProceedToTime) ||
                  (s.num === 3 && !canProceedToDetails) ||
                  s.num === 4
                }
                className={`flex flex-col items-center ${s.num <= step ? 'text-[#D97A5F]' : 'text-[#9E9E9E]'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors ${
                  s.num < step ? 'bg-[#10B981] text-white' :
                  s.num === step ? 'bg-[#F4B5A4] text-[#1A1A1A]' :
                  'bg-[#E5E5E5] text-[#9E9E9E]'
                }`}>
                  {s.num < step ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </button>
              {idx < 3 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 ${s.num < step ? 'bg-[#10B981]' : 'bg-[#E5E5E5]'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-[#FEE2E2] text-[#EF4444] px-4 py-3 rounded-xl text-sm mb-6">{error}</div>
            )}

            {/* Step 1: Select Date */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Select a Date</h2>
                <p className="text-[#6B6B6B] text-sm mb-6">Choose your preferred appointment date</p>

                <DatePicker
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date)
                    setSelectedTime(null) // Reset time when date changes
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                />

                <Button
                  onClick={() => setStep(2)}
                  className="w-full mt-6"
                  size="lg"
                  disabled={!canProceedToTime}
                >
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}

            {/* Step 2: Select Time */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Select a Time</h2>
                <p className="text-[#6B6B6B] text-sm mb-6">
                  Available times for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>

                <TimeSlotPicker
                  slots={timeSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                />

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1" disabled={!canProceedToDetails}>
                    Continue <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Booking Details */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Booking Details</h2>
                <p className="text-[#6B6B6B] text-sm mb-6">Enter your address and any special requests</p>

                <div className="space-y-4">
                  <Input
                    label="Your Address"
                    placeholder="123 Main St, City, State ZIP"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Notes (optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Any special requests, parking instructions, etc..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#F4B5A4] transition-colors placeholder:text-[#9E9E9E]"
                    />
                  </div>

                  {/* Recurring Booking Option */}
                  <div className="border-2 border-[#E5E5E5] rounded-xl p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-5 h-5 rounded border-[#E5E5E5] text-[#F4B5A4] focus:ring-[#F4B5A4]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4 text-[#D97A5F]" />
                          <span className="font-medium text-[#1A1A1A]">Make this a recurring booking</span>
                        </div>
                        <p className="text-xs text-[#6B6B6B] mt-1">Save 10% on recurring appointments</p>
                      </div>
                    </label>

                    {isRecurring && (
                      <div className="mt-4 pt-4 border-t border-[#E5E5E5] grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Frequency</label>
                          <select
                            value={recurringFrequency}
                            onChange={(e) => setRecurringFrequency(e.target.value as typeof recurringFrequency)}
                            className="w-full px-4 py-2.5 border-2 border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#F4B5A4]"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Every 2 weeks</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Number of sessions</label>
                          <select
                            value={recurringCount}
                            onChange={(e) => setRecurringCount(parseInt(e.target.value))}
                            className="w-full px-4 py-2.5 border-2 border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#F4B5A4]"
                          >
                            {[2, 4, 6, 8, 12].map(n => (
                              <option key={n} value={n}>{n} sessions</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleContinueToPayment}
                    className="flex-1"
                    isLoading={isLoading}
                    disabled={!canProceedToPayment}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Payment</h2>
                <p className="text-[#6B6B6B] text-sm mb-6">Complete your payment to confirm the booking</p>

                <PaymentForm
                  amount={totalPrice}
                  providerId={providerId}
                  serviceId={serviceId}
                  bookingId={bookingId || undefined}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />

                <button
                  onClick={() => setStep(3)}
                  className="w-full mt-4 text-[#6B6B6B] hover:text-[#D97A5F] text-sm font-medium transition-colors"
                >
                  ← Back to details
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              {/* Provider Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5E5] mb-4">
                <div className="w-12 h-12 bg-[#FEF5F2] rounded-full flex items-center justify-center text-xl text-[#D97A5F]">
                  {provider?.profile_photo_url ? (
                    <img src={provider.profile_photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    provider?.business_name?.[0] || '?'
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{provider?.business_name}</h3>
                  {provider?.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-[#1A1A1A]">{provider.rating.toFixed(1)}</span>
                      <span className="text-[#9E9E9E]">({provider.total_reviews || 0})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Info */}
              <div className="mb-4">
                <h4 className="font-semibold text-[#1A1A1A]">{service?.services?.name}</h4>
                <p className="text-sm text-[#6B6B6B]">{service?.duration_minutes} minutes</p>
              </div>

              {/* Selected Date/Time */}
              {(selectedDate || selectedTime) && (
                <div className="bg-[#FEF5F2] rounded-xl p-3 mb-4">
                  {selectedDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#D97A5F]" />
                      <span className="text-[#1A1A1A]">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Clock className="w-4 h-4 text-[#D97A5F]" />
                      <span className="text-[#1A1A1A]">
                        {(() => {
                          const [h, m] = selectedTime.split(':')
                          const hour = parseInt(h)
                          return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <PriceBreakdown
                items={[
                  { label: service?.services?.name || 'Service', amount: servicePrice },
                  { label: 'Travel Fee', amount: travelFee },
                  ...(isRecurring ? [{ label: 'Recurring Discount (10%)', amount: -recurringDiscount }] : []),
                ]}
                total={totalPrice}
              />

              {isRecurring && (
                <div className="mt-4 p-3 bg-[#D1FAE5] rounded-xl">
                  <p className="text-sm text-[#10B981] font-medium">
                    🎉 You're saving ${(recurringDiscount / 100).toFixed(2)} with recurring booking!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

