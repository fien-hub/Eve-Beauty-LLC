'use client'

import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  showCount?: boolean
  count?: number
  className?: string
}

const sizeStyles = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count = 0,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => {
          const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100
          
          return (
            <div key={i} className="relative">
              {/* Empty star */}
              <Star className={cn(sizeStyles[size], 'text-[#E5E5E5]')} />
              {/* Filled star overlay */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star className={cn(sizeStyles[size], 'text-[#F59E0B] fill-[#F59E0B]')} />
              </div>
            </div>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-[#1A1A1A]">{rating.toFixed(1)}</span>
      )}
      {showCount && count > 0 && (
        <span className="text-sm text-[#6B6B6B]">({count})</span>
      )}
    </div>
  )
}

// Interactive star rating for reviews
interface InteractiveStarRatingProps {
  value: number
  onChange: (value: number) => void
  maxRating?: number
  size?: 'md' | 'lg' | 'xl'
  className?: string
}

const interactiveSizes = {
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
}

export function InteractiveStarRating({
  value,
  onChange,
  maxRating = 5,
  size = 'lg',
  className,
}: InteractiveStarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1
        const isFilled = (hoverValue || value) >= starValue

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={cn(
                interactiveSizes[size],
                'transition-colors',
                isFilled
                  ? 'text-[#F59E0B] fill-[#F59E0B]'
                  : 'text-[#E5E5E5] hover:text-[#FCD34D]'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

// Compact rating display
interface CompactRatingProps {
  rating: number
  count?: number
  className?: string
}

export function CompactRating({ rating, count, className }: CompactRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
      <span className="text-sm font-medium text-[#1A1A1A]">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-sm text-[#6B6B6B]">({count})</span>
      )}
    </div>
  )
}

