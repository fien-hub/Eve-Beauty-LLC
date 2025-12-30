import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, fullWidth, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.97] btn-press ripple'

    const variants = {
      // Primary - Coral button with black text (like mobile app)
      primary: 'bg-[#F4B5A4] text-black hover:bg-[#E89580] focus:ring-[#F4B5A4]',
      // Secondary - Grey
      secondary: 'bg-[#9CA3AF] text-white hover:bg-[#6B7280] focus:ring-[#9CA3AF]',
      // Outline - Coral border
      outline: 'border-2 border-[#F4B5A4] text-[#D97A5F] bg-transparent hover:bg-[#FEF5F2] focus:ring-[#F4B5A4] shadow-none',
      // Ghost - No background
      ghost: 'text-[#6B6B6B] hover:bg-[#F7F7F7] focus:ring-[#D97A5F] shadow-none',
      // Danger - Red
      danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] focus:ring-[#EF4444]',
      // Tertiary - Teal accent
      tertiary: 'bg-[#5EEAD4] text-black hover:bg-[#2DD4BF] focus:ring-[#5EEAD4]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

