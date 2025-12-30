'use client'

import { cn } from '@/lib/utils'
import { Avatar, Badge, CompactRating } from '@/components/ui'
import { MapPin, Heart, Clock, CheckCircle, Star, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { getAvatarUrl, getPlaceholderImage } from '@/lib/images'

interface ProviderCardProps {
  provider: {
    id: string
    business_name: string
    avatar_url?: string | null
    bio?: string | null
    rating?: number
    total_reviews?: number
    is_verified?: boolean
    distance?: number
    city?: string
    price_range?: string
    categories?: string[]
    cover_image?: string | null
  }
  variant?: 'default' | 'compact' | 'featured'
  showFavorite?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
  className?: string
}

export function ProviderCard({
  provider,
  variant = 'default',
  showFavorite = true,
  isFavorite = false,
  onFavoriteToggle,
  className,
}: ProviderCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorite(!favorite)
    onFavoriteToggle?.(provider.id)
  }

  // Get avatar and cover image with fallbacks
  const avatarUrl = provider.avatar_url || getAvatarUrl(provider.business_name, 96)
  const coverUrl = provider.cover_image || getPlaceholderImage(provider.business_name, 400, 200)

  if (variant === 'compact') {
    return (
      <Link
        href={`/provider/${provider.id}`}
        className={cn(
          'flex items-center gap-3 p-4 bg-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group',
          className
        )}
      >
        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
          <Image
            src={avatarUrl}
            alt={provider.business_name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#1A1A1A] truncate group-hover:text-[#D97A5F] transition-colors">{provider.business_name}</h3>
            {provider.is_verified && <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mt-1">
            {provider.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                <span className="font-medium">{provider.rating.toFixed(1)}</span>
                {provider.total_reviews && <span className="text-[#9E9E9E]">({provider.total_reviews})</span>}
              </div>
            )}
            {provider.city && (
              <>
                <span className="text-[#E5E5E5]">•</span>
                <span className="truncate">{provider.city}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/provider/${provider.id}`}
      className={cn(
        'block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group',
        variant === 'featured' && 'ring-2 ring-[#F4B5A4]',
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-36 overflow-hidden">
        <Image
          src={coverUrl}
          alt={provider.business_name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Favorite button */}
        {showFavorite && (
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:scale-110 transition-all"
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-all',
                favorite ? 'text-[#EF4444] fill-[#EF4444] scale-110' : 'text-[#6B6B6B]'
              )}
            />
          </button>
        )}
        {/* Featured badge */}
        {variant === 'featured' && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-[#F4B5A4] to-[#E89580] text-white px-3 py-1.5 rounded-xl text-sm font-semibold shadow-md">
            <Sparkles className="w-4 h-4" />
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 -mt-10 rounded-xl overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
            <Image
              src={avatarUrl}
              alt={provider.business_name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[#1A1A1A] group-hover:text-[#D97A5F] transition-colors truncate">
                {provider.business_name}
              </h3>
              {provider.is_verified && <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />}
            </div>
            {provider.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                <span className="font-semibold text-[#1A1A1A]">{provider.rating.toFixed(1)}</span>
                {provider.total_reviews && <span className="text-sm text-[#9E9E9E]">({provider.total_reviews})</span>}
              </div>
            )}
          </div>
        </div>

        {provider.bio && (
          <p className="text-sm text-[#6B6B6B] mt-4 line-clamp-2 leading-relaxed">{provider.bio}</p>
        )}

        <div className="flex items-center gap-3 mt-4 text-sm text-[#6B6B6B]">
          {provider.city && (
            <div className="flex items-center gap-1.5 bg-[#F7F7F7] px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-[#D97A5F]" />
              <span>{provider.city}</span>
            </div>
          )}
          {provider.distance !== undefined && (
            <div className="flex items-center gap-1.5 bg-[#F7F7F7] px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-[#D97A5F]" />
              <span>{provider.distance.toFixed(1)} km</span>
            </div>
          )}
          {provider.price_range && (
            <span className="text-[#D97A5F] font-semibold bg-[#FEF5F2] px-2.5 py-1 rounded-lg">{provider.price_range}</span>
          )}
        </div>

        {/* Categories */}
        {provider.categories && provider.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {provider.categories.slice(0, 3).map((cat) => (
              <span key={cat} className="text-xs font-medium text-[#6B6B6B] bg-[#F7F7F7] px-3 py-1.5 rounded-lg">{cat}</span>
            ))}
            {provider.categories.length > 3 && (
              <span className="text-xs font-medium text-[#D97A5F] bg-[#FEF5F2] px-3 py-1.5 rounded-lg">+{provider.categories.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

