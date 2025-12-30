import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  showBorder?: boolean
  verified?: boolean
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
}

const imageSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?'
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  className,
  showBorder = false,
  verified = false,
}: AvatarProps) {
  const initials = getInitials(name)

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center bg-[#FEF5F2]',
          sizeStyles[size],
          showBorder && 'ring-2 ring-white shadow-sm',
          className
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="font-semibold text-[#D97A5F]">{initials}</span>
        )}
      </div>
      {verified && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 bg-[#D97A5F] rounded-full flex items-center justify-center',
            size === 'xs' && 'w-3 h-3',
            size === 'sm' && 'w-3.5 h-3.5',
            size === 'md' && 'w-4 h-4',
            size === 'lg' && 'w-5 h-5',
            (size === 'xl' || size === '2xl') && 'w-6 h-6',
          )}
        >
          <svg className="w-2/3 h-2/3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </div>
  )
}

// Avatar group for showing multiple avatars
interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string }>
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'sm',
  className,
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((avatar, i) => (
        <Avatar
          key={i}
          src={avatar.src}
          name={avatar.name}
          size={size}
          showBorder
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full bg-[#F7F7F7] flex items-center justify-center font-medium text-[#6B6B6B] ring-2 ring-white',
            sizeStyles[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}

