'use client'

import { cn } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface GalleryImage {
  id: string
  url: string
  alt?: string
  caption?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  aspectRatio?: 'square' | '4:3' | '16:9'
  showLightbox?: boolean
  className?: string
}

const gapStyles = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-4',
}

const aspectStyles = {
  square: 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 'md',
  aspectRatio = 'square',
  showLightbox = true,
  className,
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    if (showLightbox) setLightboxIndex(index)
  }

  return (
    <>
      <div
        className={cn(
          'grid',
          columns === 2 && 'grid-cols-2',
          columns === 3 && 'grid-cols-3',
          columns === 4 && 'grid-cols-4',
          gapStyles[gap],
          className
        )}
      >
        {images.map((image, idx) => (
          <button
            key={image.id}
            onClick={() => openLightbox(idx)}
            className={cn(
              'relative group overflow-hidden rounded-xl bg-[#F7F7F7]',
              aspectStyles[aspectRatio],
              showLightbox && 'cursor-pointer'
            )}
          >
            <Image
              src={image.url}
              alt={image.alt || `Gallery image ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {showLightbox && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {showLightbox && lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(Math.max(0, lightboxIndex - 1))}
          onNext={() => setLightboxIndex(Math.min(images.length - 1, lightboxIndex + 1))}
        />
      )}
    </>
  )
}

// Lightbox component
interface LightboxProps {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const currentImage = images[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[85vh]">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || 'Gallery image'}
          width={1200}
          height={800}
          className="object-contain max-h-[85vh] w-auto"
        />
        {currentImage.caption && (
          <p className="absolute bottom-0 left-0 right-0 p-4 text-white text-center bg-gradient-to-t from-black/60 to-transparent">
            {currentImage.caption}
          </p>
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}

