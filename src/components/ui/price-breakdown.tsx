import { cn } from '@/lib/utils'

interface PriceLineItem {
  label: string
  amount: number
  isDiscount?: boolean
  isSubtotal?: boolean
}

interface PriceBreakdownProps {
  items: PriceLineItem[]
  total: number
  currency?: string
  showSavings?: boolean
  className?: string
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function PriceBreakdown({
  items,
  total,
  currency = 'USD',
  showSavings = true,
  className,
}: PriceBreakdownProps) {
  const totalSavings = items
    .filter(item => item.isDiscount)
    .reduce((acc, item) => acc + Math.abs(item.amount), 0)

  return (
    <div className={cn('bg-white rounded-xl p-4', className)}>
      {/* Line items */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              'flex items-center justify-between',
              item.isSubtotal && 'pt-3 border-t border-[#F0F0F0]'
            )}
          >
            <span
              className={cn(
                'text-sm',
                item.isDiscount ? 'text-[#10B981]' : 'text-[#6B6B6B]'
              )}
            >
              {item.label}
            </span>
            <span
              className={cn(
                'text-sm font-medium',
                item.isDiscount ? 'text-[#10B981]' : 'text-[#1A1A1A]'
              )}
            >
              {item.isDiscount ? '-' : ''}{formatCurrency(Math.abs(item.amount), currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-[#E5E5E5]">
        <span className="font-semibold text-[#1A1A1A]">Total</span>
        <span className="text-xl font-bold text-[#D97A5F]">
          {formatCurrency(total, currency)}
        </span>
      </div>

      {/* Savings badge */}
      {showSavings && totalSavings > 0 && (
        <div className="mt-3 p-2 bg-[#D1FAE5] rounded-lg text-center">
          <span className="text-sm font-medium text-[#10B981]">
            🎉 You save {formatCurrency(totalSavings, currency)}!
          </span>
        </div>
      )}
    </div>
  )
}

// Simple price display for inline use
interface SimplePriceProps {
  amount: number
  originalAmount?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SimplePrice({
  amount,
  originalAmount,
  size = 'md',
  className,
}: SimplePriceProps) {
  const sizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  const hasDiscount = originalAmount && originalAmount > amount

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-bold text-[#D97A5F]', sizeStyles[size])}>
        ${amount.toFixed(2)}
      </span>
      {hasDiscount && (
        <span className={cn('text-[#9E9E9E] line-through', sizeStyles[size] === 'lg' ? 'text-base' : 'text-sm')}>
          ${originalAmount.toFixed(2)}
        </span>
      )}
    </div>
  )
}

// Booking summary price card
interface BookingSummaryProps {
  serviceName: string
  servicePrice: number
  duration: number
  platformFee?: number
  discount?: number
  promoCode?: string
  className?: string
}

export function BookingSummary({
  serviceName,
  servicePrice,
  duration,
  platformFee = 0,
  discount = 0,
  promoCode,
  className,
}: BookingSummaryProps) {
  const items: PriceLineItem[] = [
    { label: serviceName, amount: servicePrice },
  ]

  if (platformFee > 0) {
    items.push({ label: 'Service fee', amount: platformFee })
  }

  if (discount > 0) {
    items.push({
      label: promoCode ? `Promo (${promoCode})` : 'Discount',
      amount: discount,
      isDiscount: true,
    })
  }

  const total = servicePrice + platformFee - discount

  return (
    <div className={cn('bg-[#FEF5F2] rounded-2xl p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-[#1A1A1A]">Booking Summary</h4>
        <span className="text-sm text-[#6B6B6B]">{duration} min</span>
      </div>
      <PriceBreakdown items={items} total={total} className="bg-white" />
    </div>
  )
}

