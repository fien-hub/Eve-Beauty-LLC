import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  }

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-[#F7F7F7] via-[#E5E5E5] to-[#F7F7F7] bg-[length:200%_100%]',
    none: '',
  }

  return (
    <div
      className={cn(
        'bg-[#F0F0F0]',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}

// Pre-built skeleton components for common patterns
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn('h-4', i === lines - 1 && 'w-3/4')}
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }
  return <Skeleton variant="circular" className={sizes[size]} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl p-4 shadow-sm', className)}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar />
        <div className="flex-1">
          <Skeleton variant="text" className="h-4 w-24 mb-2" />
          <Skeleton variant="text" className="h-3 w-32" />
        </div>
      </div>
      <Skeleton variant="rounded" className="h-40 w-full mb-4" />
      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonProviderCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl overflow-hidden shadow-sm', className)}>
      <Skeleton className="h-32 w-full" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <SkeletonAvatar size="lg" />
          <div className="flex-1">
            <Skeleton variant="text" className="h-5 w-32 mb-2" />
            <Skeleton variant="text" className="h-4 w-20" />
          </div>
        </div>
        <Skeleton variant="text" className="h-4 w-full mb-2" />
        <Skeleton variant="text" className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function SkeletonBookingCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl p-4 shadow-sm', className)}>
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1">
          <Skeleton variant="text" className="h-5 w-40 mb-2" />
          <Skeleton variant="text" className="h-4 w-32 mb-2" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
        <Skeleton variant="rounded" className="h-8 w-20" />
      </div>
    </div>
  )
}

export function SkeletonServiceCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl p-4 shadow-sm', className)}>
      <div className="flex items-start gap-3">
        <Skeleton variant="rounded" className="w-16 h-16" />
        <div className="flex-1">
          <Skeleton variant="text" className="h-5 w-32 mb-2" />
          <Skeleton variant="text" className="h-4 w-full mb-2" />
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="h-4 w-16" />
            <Skeleton variant="text" className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Feed skeleton
export function SkeletonFeed({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

