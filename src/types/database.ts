export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Use a flexible Database type that allows any table operations
// This is a workaround until proper types are generated from the database schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any

// Type definitions for common tables (for reference/autocomplete)
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  address: string | null
  city: string | null
  role: 'customer' | 'provider' | 'admin'
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  category: string
  icon: string | null
  created_at: string
}

export interface ProviderService {
  id: string
  provider_id: string
  service_id: string
  base_price: number
  duration_minutes: number
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string
  provider_id: string
  provider_service_id: string
  booking_date: string
  booking_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  total_price: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  booking_id: string
  customer_id: string
  provider_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  customer_id: string
  provider_id: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  is_read: boolean
  data: Json | null
  created_at: string
}

export interface LoyaltyPoints {
  id: string
  user_id: string
  current_points: number
  total_points: number
  created_at: string
  updated_at: string
}

export interface ProviderAvailability {
  id: string
  provider_id: string
  day_of_week: number
  is_available: boolean
  start_time: string
  end_time: string
  created_at: string
}

