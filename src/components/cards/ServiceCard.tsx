'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { Clock, Heart, Sparkles, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { getPlaceholderImage, CATEGORY_IMAGES } from '@/lib/images'

interface ServiceCardProps {
  service: {
    id: string
    name: string
    description?: string | null
    price: number
    duration: number
    category?: string | null
    image_url?: string | null
    provider_id: string
    provider_name?: string
  }
  variant?: 'default' | 'compact' | 'horizontal'
  showFavorite?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
  onBook?: () => void
  className?: string
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

export function ServiceCard({
  service,
  variant = 'default',
  showFavorite = false,
  isFavorite = false,
  onFavoriteToggle,
  onBook,
  className,
}: ServiceCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorite(!favorite)
    onFavoriteToggle?.(service.id)
  }

  // Get service image with fallback
  const categoryKey = (service.category?.toLowerCase() || 'beauty') as keyof typeof CATEGORY_IMAGES
  const serviceImage = service.image_url || CATEGORY_IMAGES[categoryKey] || getPlaceholderImage(service.name, 300, 200)

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-[#FEF5F2] transition-colors', className)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FCE5DF] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#D97A5F]" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-[#1A1A1A] truncate">{service.name}</h4>
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(service.duration)}</span>
              {service.category && (
                <>
                  <span className="text-[#E5E5E5]">•</span>
                  <span>{service.category}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <span className="font-bold text-[#D97A5F] ml-3 text-lg">{formatPrice(service.price)}</span>
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group',
          className
        )}
      >
        {/* Image */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={serviceImage}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[#1A1A1A] truncate group-hover:text-[#D97A5F] transition-colors">{service.name}</h4>
          {service.description && (
            <p className="text-sm text-[#6B6B6B] line-clamp-1 mt-1">{service.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-sm text-[#6B6B6B] bg-[#F7F7F7] px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-[#D97A5F]" />
              <span>{formatDuration(service.duration)}</span>
            </div>
            {service.category && (
              <span className="text-xs font-medium text-[#6B6B6B] bg-[#F7F7F7] px-2.5 py-1 rounded-lg">{service.category}</span>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-xl font-bold text-[#D97A5F]">{formatPrice(service.price)}</span>
          {onBook && (
            <button
              onClick={onBook}
              className="flex items-center gap-1 px-4 py-2 bg-[#F4B5A4] text-[#1A1A1A] text-sm font-semibold rounded-xl hover:bg-[#E89580] transition-all hover:shadow-md"
            >
              Book <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Default card
  return (
    <Link
      href={`/book/${service.provider_id}/${service.id}`}
      className={cn(
        'block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group',
        className
      )}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={serviceImage}
          alt={service.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {showFavorite && (
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:scale-110 transition-all"
          >
            <Heart className={cn('w-5 h-5 transition-all', favorite ? 'text-[#EF4444] fill-[#EF4444] scale-110' : 'text-[#6B6B6B]')} />
          </button>
        )}
        {service.category && (
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#1A1A1A] px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
            {service.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h4 className="font-bold text-[#1A1A1A] group-hover:text-[#D97A5F] transition-colors truncate text-lg">
          {service.name}
        </h4>
        {service.provider_name && (
          <p className="text-sm text-[#6B6B6B] mt-1">{service.provider_name}</p>
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-sm text-[#6B6B6B] bg-[#F7F7F7] px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-[#D97A5F]" />
            <span>{formatDuration(service.duration)}</span>
          </div>
          <span className="text-xl font-bold text-[#D97A5F]">{formatPrice(service.price)}</span>
        </div>
      </div>
    </Link>
  )
}

