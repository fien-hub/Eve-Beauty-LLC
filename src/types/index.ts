// User types
export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'provider' | 'admin'
}

export interface ProviderProfile {
  id: string
  user_id: string
  business_name: string
  bio: string | null
  profile_photo_url: string | null
  is_verified: boolean
  kyc_status: 'pending' | 'approved' | 'rejected' | null
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  service_radius_miles: number
  location_lat: number | null
  location_lng: number | null
  location_address: string | null
  average_rating: number
  total_reviews: number
  cancellation_policy: string | null
  booking_buffer_hours: number
}

// Service types
export interface Service {
  id: string
  name: string
  description: string | null
  category: ServiceCategory
  icon: string | null
}

export type ServiceCategory = 'nails' | 'hair' | 'makeup' | 'skincare' | 'massage' | 'waxing'

export interface ProviderService {
  id: string
  provider_id: string
  service_id: string
  base_price: number
  duration_minutes: number
  description: string | null
  is_active: boolean
  service?: Service
}

// Booking types
export interface Booking {
  id: string
  customer_id: string
  provider_id: string
  provider_service_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: BookingStatus
  customer_address: string
  customer_lat: number | null
  customer_lng: number | null
  base_price: number
  travel_fee: number
  total_price: number
  payment_intent_id: string | null
  payment_status: PaymentStatus
  notes: string | null
  created_at: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

// Review types
export interface Review {
  id: string
  booking_id: string
  customer_id: string
  provider_id: string
  rating: number
  comment: string | null
  created_at: string
}

// Portfolio types
export interface PortfolioItem {
  id: string
  provider_id: string
  service_id: string
  image_url: string
  caption: string | null
  created_at: string
}

// Availability types
export interface AvailabilitySlot {
  id: string
  provider_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

// Travel fee calculation
export const TRAVEL_FEES: { maxMiles: number; fee: number }[] = [
  { maxMiles: 3, fee: 5 },
  { maxMiles: 5, fee: 8 },
  { maxMiles: 8, fee: 12 },
  { maxMiles: 12, fee: 18 },
  { maxMiles: 15, fee: 22 },
  { maxMiles: Infinity, fee: 30 },
]

export function calculateTravelFee(distanceMiles: number): number {
  const tier = TRAVEL_FEES.find(t => distanceMiles <= t.maxMiles)
  return tier?.fee ?? 30
}

