import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'outline'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#F7F7F7] text-[#6B6B6B]',
  primary: 'bg-[#FCE5DF] text-[#D97A5F]',
  secondary: 'bg-[#F3F4F6] text-[#6B7280]',
  success: 'bg-[#D1FAE5] text-[#10B981]',
  warning: 'bg-[#FEF3C7] text-[#F59E0B]',
  error: 'bg-[#FEE2E2] text-[#EF4444]',
  info: 'bg-[#DBEAFE] text-[#3B82F6]',
  pending: 'bg-[#FEF3C7] text-[#F59E0B]',
  confirmed: 'bg-[#DBEAFE] text-[#3B82F6]',
  completed: 'bg-[#D1FAE5] text-[#10B981]',
  cancelled: 'bg-[#FEE2E2] text-[#EF4444]',
  outline: 'bg-transparent border border-[#E5E5E5] text-[#6B6B6B]',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-[#10B981]',
          variant === 'warning' && 'bg-[#F59E0B]',
          variant === 'error' && 'bg-[#EF4444]',
          variant === 'info' && 'bg-[#3B82F6]',
          variant === 'primary' && 'bg-[#D97A5F]',
          variant === 'pending' && 'bg-[#F59E0B]',
          variant === 'confirmed' && 'bg-[#3B82F6]',
          variant === 'completed' && 'bg-[#10B981]',
          variant === 'cancelled' && 'bg-[#EF4444]',
          (variant === 'default' || variant === 'secondary' || variant === 'outline') && 'bg-[#6B6B6B]',
        )} />
      )}
      {children}
    </span>
  )
}

// Status badge specifically for booking status
export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, BadgeVariant> = {
    pending: 'pending',
    confirmed: 'confirmed',
    in_progress: 'info',
    completed: 'completed',
    cancelled: 'cancelled',
    rejected: 'error',
  }

  const displayText: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  }

  return (
    <Badge variant={statusMap[status] || 'default'} dot>
      {displayText[status] || status}
    </Badge>
  )
}

// Verification badge for providers
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-5 h-5 bg-[#D97A5F] rounded-full',
        className
      )}
      title="Verified Provider"
    >
      <svg
        className="w-3 h-3 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  )
}

