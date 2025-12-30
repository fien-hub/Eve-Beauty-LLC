import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full px-4 py-3 border-2 rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-0 focus:border-[#F4B5A4]',
              'placeholder:text-[#9E9E9E]',
              'bg-white shadow-sm',
              icon && 'pl-10',
              error
                ? 'border-[#EF4444] focus:border-[#EF4444]'
                : 'border-[#E5E5E5] hover:border-[#D1D5DB]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[#6B6B6B]">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }

