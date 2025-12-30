'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Star,
  CheckCircle,
  Heart,
  Loader2,
  Filter,
  DollarSign,
  Clock,
} from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import AuthModal from '@/components/AuthModal'

interface Provider {
  id: string
  user_id: string
  business_name: string
  bio: string
  rating: number
  total_reviews: number
  price: number
  is_verified: boolean
  avatar_url?: string
  distance?: number
  provider_service_id: string
  duration_minutes?: number
}

export default function ServiceProvidersPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { user, showAuthModal, authAction, requireAuth, closeAuthModal } = useAuthGuard()

  const serviceId = params.serviceId as string
  const [serviceName, setServiceName] = useState('')
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'distance'>('rating')
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [serviceId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Get service name
      const { data: service } = await supabase
        .from('services')
        .select('name')
        .eq('id', serviceId)
        .single()

      if (service) {
        setServiceName(service.name)
      }

      // Get providers offering this service
      const { data, error } = await supabase
        .from('provider_services')
        .select(`
          id,
          base_price,
          duration_minutes,
          platform_commission_rate,
          provider_profiles!inner (
            id,
            business_name,
            rating,
            total_reviews,
            is_verified,
            identity_verification_status,
            profiles!inner (
              user_id,
              bio,
              avatar_url
            )
          )
        `)
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .eq('provider_profiles.identity_verification_status', 'approved')

      if (error) throw error

      const formattedProviders = (data || []).map((ps: any) => {
        const basePrice = Number(ps.base_price)
        const commissionRate = Number(ps.platform_commission_rate) || 0.2
        const finalPrice = Math.round(basePrice * (1 + commissionRate))

        return {
          id: ps.provider_profiles.id,
          user_id: ps.provider_profiles.profiles.user_id,
          business_name: ps.provider_profiles.business_name,
          bio: ps.provider_profiles.profiles.bio || '',
          rating: ps.provider_profiles.rating || 0,
          total_reviews: ps.provider_profiles.total_reviews || 0,
          price: finalPrice,
          is_verified: ps.provider_profiles.is_verified,
          avatar_url: ps.provider_profiles.profiles.avatar_url,
          provider_service_id: ps.id,
          duration_minutes: ps.duration_minutes,
        }
      })

      setProviders(formattedProviders)

      // Load favorites if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: favorites } = await supabase
          .from('favorite_providers')
          .select('provider_id')
          .eq('customer_id', user.id)

        if (favorites) {
          setFavoriteIds(new Set(favorites.map((f) => f.provider_id)))
        }
      }
    } catch (err: any) {
      console.error('Error loading providers:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (providerId: string) => {
    requireAuth('favorite', async () => {
      try {
        if (favoriteIds.has(providerId)) {
          await supabase
            .from('favorite_providers')
            .delete()
            .eq('customer_id', user!.id)
            .eq('provider_id', providerId)

          setFavoriteIds((prev) => {
            const next = new Set(prev)
            next.delete(providerId)
            return next
          })
        } else {
          await supabase
            .from('favorite_providers')
            .insert({ customer_id: user!.id, provider_id: providerId })

          setFavoriteIds((prev) => new Set(prev).add(providerId))
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
      }
    })
  }

  const sortedProviders = [...providers].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'distance') return (a.distance || 999) - (b.distance || 999)
    return 0
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D97A5F] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal} 
        action={authAction}
      />

      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/search"
                className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[#1A1A1A]">
                  {serviceName}
                </h1>
                <p className="text-sm text-[#6B6B6B]">
                  {providers.length} provider{providers.length !== 1 ? 's' : ''}{' '}
                  available
                </p>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#6B6B6B]" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'rating' | 'price' | 'distance')
                }
                className="px-3 py-2 bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg text-sm font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#D97A5F]"
              >
                <option value="rating">Top Rated</option>
                <option value="price">Price: Low to High</option>
                <option value="distance">Nearest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {providers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              No providers found
            </h3>
            <p className="text-[#6B6B6B] mb-6">
              No providers are currently offering this service
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D97A5F] hover:bg-[#C86A50] text-white rounded-xl font-semibold transition-colors"
            >
              Browse All Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Provider Header */}
                <div className="p-5 border-b border-[#F0F0F0]">
                  <div className="flex items-start gap-3 mb-3">
                    <Link
                      href={`/provider/${provider.id}`}
                      className="flex-shrink-0"
                    >
                      {provider.avatar_url ? (
                        <img
                          src={provider.avatar_url}
                          alt={provider.business_name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#FCE5DF] flex items-center justify-center">
                          <span className="text-xl font-bold text-[#D97A5F]">
                            {provider.business_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/provider/${provider.id}`}
                        className="block"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[#1A1A1A] truncate">
                            {provider.business_name}
                          </h3>
                          {provider.is_verified && (
                            <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                          )}
                        </div>
                      </Link>

                      {/* Rating */}
                      {provider.total_reviews > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-[#FFA500] fill-[#FFA500]" />
                          <span className="font-semibold text-[#1A1A1A]">
                            {provider.rating.toFixed(1)}
                          </span>
                          <span className="text-[#6B6B6B]">
                            ({provider.total_reviews})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(provider.id)}
                      className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favoriteIds.has(provider.id)
                            ? 'fill-[#EF4444] text-[#EF4444]'
                            : 'text-[#6B6B6B]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Bio */}
                  {provider.bio && (
                    <p className="text-sm text-[#6B6B6B] line-clamp-2">
                      {provider.bio}
                    </p>
                  )}
                </div>

                {/* Service Details */}
                <div className="p-5 space-y-3">
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#6B6B6B]">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Starting at</span>
                    </div>
                    <span className="text-lg font-bold text-[#D97A5F]">
                      ${(provider.price / 100).toFixed(2)}
                    </span>
                  </div>

                  {/* Duration */}
                  {provider.duration_minutes && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#6B6B6B]">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <span className="text-sm font-medium text-[#1A1A1A]">
                        {provider.duration_minutes} min
                      </span>
                    </div>
                  )}

                  {/* Distance */}
                  {provider.distance && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#6B6B6B]">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Distance</span>
                      </div>
                      <span className="text-sm font-medium text-[#1A1A1A]">
                        {provider.distance.toFixed(1)} km
                      </span>
                    </div>
                  )}

                  {/* Book Button */}
                  <Link
                    href={`/book/${provider.id}/${serviceId}`}
                    className="block w-full py-3 bg-[#D97A5F] hover:bg-[#C86A50] text-white text-center rounded-xl font-semibold transition-colors mt-4"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
