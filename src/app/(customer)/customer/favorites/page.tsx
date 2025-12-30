'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PillTabs, EmptyFavorites, SkeletonProviderCard, SkeletonServiceCard } from '@/components/ui'
import { ProviderCard, ServiceCard } from '@/components/cards'
import { Heart } from 'lucide-react'

interface FavoriteProvider {
  id: string
  business_name: string
  avatar_url?: string | null
  bio?: string | null
  city?: string
  is_verified?: boolean
  rating?: number
  total_reviews?: number
}

interface FavoriteService {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string | null
  image_url: string | null
  provider_id: string
  provider_name: string
}

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState('Providers')
  const [providers, setProviders] = useState<FavoriteProvider[]>([])
  const [services, setServices] = useState<FavoriteService[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch favorite providers
      const { data: favProviders } = await supabase
        .from('favorite_providers')
        .select(`
          provider:provider_profiles!favorite_providers_provider_id_fkey(
            id, business_name, avatar_url, bio, city, is_verified, rating, total_reviews
          )
        `)
        .eq('customer_id', user.id)

      // Fetch favorite services
      const { data: favServices } = await supabase
        .from('favorite_services')
        .select(`
          service:services!favorite_services_service_id_fkey(
            id, name, description
          )
        `)
        .eq('customer_id', user.id)

      // Transform the data (Supabase returns arrays for relations)
      if (favProviders) {
        const providerList = favProviders
          .filter((f: any) => f.provider)
          .map((f: any) => {
            const provider = Array.isArray(f.provider) ? f.provider[0] : f.provider
            return {
              ...provider,
              rating: provider.rating || 4.5, // Use actual rating or fallback
              total_reviews: provider.total_reviews || 0,
            }
          }) as FavoriteProvider[]
        setProviders(providerList)
      }

      if (favServices) {
        const serviceList = favServices
          .filter((f: any) => f.service)
          .map((f: any) => {
            const service = Array.isArray(f.service) ? f.service[0] : f.service
            const provider = Array.isArray(service?.provider) ? service.provider[0] : service?.provider
            return {
              ...service,
              provider_name: provider?.business_name || 'Unknown',
            }
          }) as FavoriteService[]
        setServices(serviceList)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (id: string, type: 'provider' | 'service') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const filter = type === 'provider' 
        ? { provider_id: id } 
        : { service_id: id }

      await supabase
        .from('favorites')
        .delete()
        .eq('customer_id', user.id)
        .match(filter)

      // Update local state
      if (type === 'provider') {
        setProviders(providers.filter(p => p.id !== id))
      } else {
        setServices(services.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const isEmpty = providers.length === 0 && services.length === 0
  const currentItems = activeTab === 'Providers' ? providers : services

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FEF5F2] rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#D97A5F]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">My Favorites</h1>
          </div>
          <PillTabs
            tabs={['Providers', 'Services']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              activeTab === 'Providers' 
                ? <SkeletonProviderCard key={i} />
                : <SkeletonServiceCard key={i} />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyFavorites />
        ) : currentItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6B6B6B]">
              No favorite {activeTab.toLowerCase()} yet
            </p>
          </div>
        ) : activeTab === 'Providers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isFavorite={true}
                onFavoriteToggle={() => handleRemoveFavorite(provider.id, 'provider')}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                showFavorite
                isFavorite={true}
                onFavoriteToggle={() => handleRemoveFavorite(service.id, 'service')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

