'use client'

import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui'
import { Calendar, Clock, ChevronRight, Phone, MessageSquare, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getAvatarUrl } from '@/lib/images'

interface BookingCardProps {
  booking: {
    id: string
    status: string
    scheduled_date: string
    scheduled_time: string
    total_price: number
    service: {
      name: string
      duration: number
    }
    provider?: {
      id: string
      business_name: string
      avatar_url?: string | null
      phone?: string | null
    }
    customer?: {
      id: string
      first_name?: string
      last_name?: string
      avatar_url?: string | null
      phone?: string | null
    }
  }
  variant?: 'customer' | 'provider'
  showActions?: boolean
  onCancel?: () => void
  onReschedule?: () => void
  onMessage?: () => void
  onCall?: () => void
  className?: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function BookingCard({
  booking,
  variant = 'customer',
  showActions = true,
  onCancel,
  onReschedule,
  onMessage,
  onCall,
  className,
}: BookingCardProps) {
  // Get the person to display based on variant
  const person = variant === 'customer' ? booking.provider : booking.customer
  const personLabel = variant === 'customer' ? 'Provider' : 'Customer'
  // Get display name - handle both provider and customer types
  const personName = person ? ('business_name' in person ? person.business_name : `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Customer') : 'Unknown'
  const personAvatar = person?.avatar_url || getAvatarUrl(personName, 96)
  const detailsHref = variant === 'customer'
    ? `/customer/bookings/${booking.id}`
    : `/provider/bookings/${booking.id}`

  const isUpcoming = ['pending', 'confirmed'].includes(booking.status)
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const canReschedule = booking.status === 'confirmed'

  return (
    <div className={cn('bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300', className)}>
      {/* Header */}
      <div className="p-5 border-b border-[#F0F0F0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
              <Image
                src={personAvatar}
                alt={personName}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-[#1A1A1A] text-lg">
                {personName}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-[#6B6B6B] mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D97A5F]" />
                {booking.service.name}
              </div>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[#6B6B6B] bg-[#F7F7F7] px-3 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-[#D97A5F]" />
            <span className="font-medium">{formatDate(booking.scheduled_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#6B6B6B] bg-[#F7F7F7] px-3 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-[#D97A5F]" />
            <span className="font-medium">{formatTime(booking.scheduled_time)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#FEF5F2] p-4 rounded-xl">
          <span className="text-sm text-[#6B6B6B]">
            Duration: <span className="font-semibold text-[#1A1A1A]">{booking.service.duration} min</span>
          </span>
          <span className="text-xl font-bold text-[#D97A5F]">
            ${booking.total_price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-5 pb-5 pt-2 border-t border-[#F0F0F0] space-y-3">
          {/* Quick actions */}
          <div className="flex gap-2">
            {person?.phone && onCall && (
              <button
                onClick={onCall}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#F7F7F7] rounded-xl text-sm font-semibold text-[#6B6B6B] hover:bg-[#E5E5E5] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
            )}
            {onMessage && (
              <button
                onClick={onMessage}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#F7F7F7] rounded-xl text-sm font-semibold text-[#6B6B6B] hover:bg-[#E5E5E5] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            )}
          </div>

          {/* Status-based actions */}
          {isUpcoming && (
            <div className="flex gap-2">
              {canReschedule && onReschedule && (
                <button
                  onClick={onReschedule}
                  className="flex-1 py-2.5 border-2 border-[#E5E5E5] rounded-xl text-sm font-semibold text-[#6B6B6B] hover:border-[#D97A5F] hover:text-[#D97A5F] transition-colors"
                >
                  Reschedule
                </button>
              )}
              {canCancel && onCancel && (
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 border-2 border-[#FEE2E2] text-[#EF4444] rounded-xl text-sm font-semibold hover:bg-[#FEE2E2] transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {/* View details link */}
          <Link
            href={detailsHref}
            className="flex items-center justify-center gap-1 py-2.5 text-sm font-semibold text-[#D97A5F] hover:text-[#E89580] transition-colors"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

