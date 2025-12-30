import { cn } from '@/lib/utils'
import { Avatar, StarRating } from '@/components/ui'
import { ThumbsUp, Flag, MessageSquare } from 'lucide-react'

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    comment?: string | null
    created_at: string
    customer: {
      first_name?: string
      last_name?: string
      avatar_url?: string | null
    }
    service?: {
      name: string
    }
    provider_response?: string | null
    helpful_count?: number
  }
  showService?: boolean
  showResponse?: boolean
  onHelpful?: () => void
  onReport?: () => void
  onRespond?: () => void
  isProvider?: boolean
  className?: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function ReviewCard({
  review,
  showService = false,
  showResponse = true,
  onHelpful,
  onReport,
  onRespond,
  isProvider = false,
  className,
}: ReviewCardProps) {
  return (
    <div className={cn('bg-white rounded-xl p-4', className)}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar
          src={review.customer.avatar_url}
          name={`${review.customer.first_name || ''} ${review.customer.last_name || ''}`.trim() || 'Customer'}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[#1A1A1A]">
              {`${review.customer.first_name || ''} ${review.customer.last_name || ''}`.trim() || 'Customer'}
            </h4>
            <span className="text-sm text-[#9E9E9E]">{formatDate(review.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} size="sm" />
            {showService && review.service && (
              <span className="text-sm text-[#6B6B6B]">• {review.service.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-[#1A1A1A] mt-3 leading-relaxed">{review.comment}</p>
      )}

      {/* Provider Response */}
      {showResponse && review.provider_response && (
        <div className="mt-4 pl-4 border-l-2 border-[#F4B5A4] bg-[#FEF5F2] rounded-r-lg p-3">
          <p className="text-sm font-medium text-[#D97A5F] mb-1">Provider Response</p>
          <p className="text-sm text-[#6B6B6B]">{review.provider_response}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F0F0F0]">
        <div className="flex items-center gap-4">
          {onHelpful && (
            <button
              onClick={onHelpful}
              className="flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#D97A5F] transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful{review.helpful_count ? ` (${review.helpful_count})` : ''}</span>
            </button>
          )}
          {onReport && (
            <button
              onClick={onReport}
              className="flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#EF4444] transition-colors"
            >
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>
          )}
        </div>

        {/* Provider respond button */}
        {isProvider && !review.provider_response && onRespond && (
          <button
            onClick={onRespond}
            className="flex items-center gap-1.5 text-sm font-medium text-[#D97A5F] hover:underline"
          >
            <MessageSquare className="w-4 h-4" />
            Respond
          </button>
        )}
      </div>
    </div>
  )
}

// Simple review preview for lists
interface ReviewPreviewProps {
  rating: number
  comment?: string
  customerName: string
  date: string
  className?: string
}

export function ReviewPreview({ rating, comment, customerName, date, className }: ReviewPreviewProps) {
  return (
    <div className={cn('py-3', className)}>
      <div className="flex items-center justify-between mb-1">
        <StarRating rating={rating} size="sm" />
        <span className="text-xs text-[#9E9E9E]">{formatDate(date)}</span>
      </div>
      {comment && <p className="text-sm text-[#6B6B6B] line-clamp-2">{comment}</p>}
      <p className="text-xs text-[#9E9E9E] mt-1">— {customerName}</p>
    </div>
  )
}

