import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  emoji?: string
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {/* Icon or Emoji */}
      {(icon || emoji) && (
        <div className="mb-4">
          {icon ? (
            <div className="w-16 h-16 bg-[#FEF5F2] rounded-full flex items-center justify-center text-[#D97A5F]">
              {icon}
            </div>
          ) : (
            <span className="text-5xl">{emoji}</span>
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-[#6B6B6B] max-w-sm mb-6">{description}</p>
      )}

      {/* Action */}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="px-6 py-2.5 bg-[#F4B5A4] text-[#1A1A1A] rounded-xl font-semibold hover:bg-[#E89580] transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="px-6 py-2.5 bg-[#F4B5A4] text-[#1A1A1A] rounded-xl font-semibold hover:bg-[#E89580] transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}

// Pre-built empty states for common scenarios
export function EmptyBookings() {
  return (
    <EmptyState
      emoji="📅"
      title="No bookings yet"
      description="When you book a service, it will appear here."
      action={{ label: 'Browse Services', href: '/browse' }}
    />
  )
}

export function EmptyFavorites() {
  return (
    <EmptyState
      emoji="❤️"
      title="No favorites yet"
      description="Save your favorite providers and services for quick access."
      action={{ label: 'Discover Providers', href: '/browse' }}
    />
  )
}

export function EmptyMessages() {
  return (
    <EmptyState
      emoji="💬"
      title="No messages yet"
      description="Start a conversation by booking a service."
      action={{ label: 'Find a Provider', href: '/browse' }}
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      emoji="🔔"
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
    />
  )
}

export function EmptyReviews() {
  return (
    <EmptyState
      emoji="⭐"
      title="No reviews yet"
      description="Reviews from customers will appear here."
    />
  )
}

export function EmptyServices() {
  return (
    <EmptyState
      emoji="💅"
      title="No services added"
      description="Add your services to start receiving bookings."
      action={{ label: 'Add Service', href: '/provider/services' }}
    />
  )
}

export function EmptyPortfolio() {
  return (
    <EmptyState
      emoji="📸"
      title="No portfolio items"
      description="Showcase your work by adding photos to your portfolio."
      action={{ label: 'Add Photos', href: '/provider/portfolio' }}
    />
  )
}

export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      emoji="🔍"
      title="No results found"
      description={query ? `We couldn't find anything matching "${query}".` : 'Try adjusting your filters or search terms.'}
    />
  )
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      emoji="😕"
      title="Something went wrong"
      description="We couldn't load this content. Please try again."
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
    />
  )
}

