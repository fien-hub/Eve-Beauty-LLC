import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'white' | 'gray'
}

const sizeStyles = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
}

const colorStyles = {
  primary: 'border-[#F4B5A4] border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-[#E5E5E5] border-t-transparent',
}

export function Spinner({ size = 'md', className, color = 'primary' }: SpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeStyles[size],
        colorStyles[color],
        className
      )}
    />
  )
}

interface LoadingOverlayProps {
  message?: string
  className?: string
}

export function LoadingOverlay({ message, className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
        className
      )}
    >
      <Spinner size="xl" />
      {message && (
        <p className="mt-4 text-[#6B6B6B] font-medium">{message}</p>
      )}
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        className
      )}
    >
      <Spinner size="lg" />
      <p className="mt-4 text-[#6B6B6B] font-medium">{message}</p>
    </div>
  )
}

// Button loading state component
interface ButtonSpinnerProps {
  className?: string
}

export function ButtonSpinner({ className }: ButtonSpinnerProps) {
  return <Spinner size="sm" color="white" className={className} />
}

