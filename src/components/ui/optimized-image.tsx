'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
  showSkeleton?: boolean
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  showSkeleton = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        {...props}
      />
    </div>
  )
}

// Avatar with optimized loading
interface AvatarImageProps {
  src: string | null | undefined
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
}

export function AvatarImage({ src, alt, size = 'md', className }: AvatarImageProps) {
  const dimension = sizeMap[size]
  
  if (!src) {
    return (
      <div 
        className={cn(
          'rounded-full bg-[#F4B5A4] flex items-center justify-center text-white font-semibold',
          className
        )}
        style={{ width: dimension, height: dimension }}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      className={cn('rounded-full object-cover', className)}
      style={{ width: dimension, height: dimension }}
    />
  )
}

// Service/Portfolio image with lazy loading
interface GalleryImageProps {
  src: string
  alt: string
  aspectRatio?: 'square' | 'video' | 'portrait'
  className?: string
  priority?: boolean
}

export function GalleryImage({ 
  src, 
  alt, 
  aspectRatio = 'square',
  className,
  priority = false 
}: GalleryImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }

  return (
    <div className={cn(aspectClasses[aspectRatio], 'relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
      />
    </div>
  )
}

