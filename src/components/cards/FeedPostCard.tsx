'use client'

import { cn } from '@/lib/utils'
import { Avatar, Badge, CompactRating } from '@/components/ui'
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface FeedPostCardProps {
  post: {
    id: string
    image_url: string
    caption?: string | null
    like_count: number
    comments_count: number
    created_at: string
    provider: {
      id: string
      business_name: string
      avatar_url?: string | null
      is_verified?: boolean
      rating?: number
    }
    service?: {
      id: string
      name: string
      price: number
    }
    tags?: string[]
  }
  isLiked?: boolean
  isSaved?: boolean
  onLike?: () => void
  onSave?: () => void
  onComment?: () => void
  onShare?: () => void
  onBook?: () => void
  className?: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function FeedPostCard({
  post,
  isLiked = false,
  isSaved = false,
  onLike,
  onSave,
  onComment,
  onShare,
  onBook,
  className,
}: FeedPostCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [likesCount, setLikesCount] = useState(post.like_count)

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
    onLike?.()
  }

  const handleSave = () => {
    setSaved(!saved)
    onSave?.()
  }

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href={`/provider/${post.provider.id}`} className="flex items-center gap-3">
          <Avatar
            src={post.provider.avatar_url}
            name={post.provider.business_name}
            size="md"
            verified={post.provider.is_verified}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#1A1A1A] hover:text-[#D97A5F] transition-colors">
                {post.provider.business_name}
              </span>
              {post.provider.is_verified && (
                <CheckCircle className="w-4 h-4 text-[#D97A5F]" />
              )}
            </div>
            {post.provider.rating && (
              <CompactRating rating={post.provider.rating} className="mt-0.5" />
            )}
          </div>
        </Link>
        <button className="p-2 text-[#6B6B6B] hover:bg-[#F7F7F7] rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-[#F7F7F7]">
        <Image
          src={post.image_url}
          alt={post.caption || 'Portfolio post'}
          fill
          className="object-cover"
        />
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="flex items-center gap-1.5 group">
              <Heart
                className={cn(
                  'w-6 h-6 transition-all',
                  liked
                    ? 'text-[#EF4444] fill-[#EF4444] scale-110'
                    : 'text-[#1A1A1A] group-hover:text-[#EF4444]'
                )}
              />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
            <button onClick={onComment} className="flex items-center gap-1.5 group">
              <MessageCircle className="w-6 h-6 text-[#1A1A1A] group-hover:text-[#D97A5F] transition-colors" />
              <span className="text-sm font-medium">{post.comments_count}</span>
            </button>
            <button onClick={onShare} className="group">
              <Share2 className="w-6 h-6 text-[#1A1A1A] group-hover:text-[#D97A5F] transition-colors" />
            </button>
          </div>
          <button onClick={handleSave}>
            <Bookmark
              className={cn(
                'w-6 h-6 transition-all',
                saved ? 'text-[#D97A5F] fill-[#D97A5F]' : 'text-[#1A1A1A] hover:text-[#D97A5F]'
              )}
            />
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="mt-3 text-[#1A1A1A]">
            <Link href={`/provider/${post.provider.id}`} className="font-semibold mr-1.5">
              {post.provider.business_name}
            </Link>
            {post.caption}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-sm text-[#D97A5F]">#{tag}</span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-[#9E9E9E] mt-2">{formatDate(post.created_at)}</p>
      </div>

      {/* Book Service CTA */}
      {post.service && onBook && (
        <div className="px-4 pb-4">
          <button
            onClick={onBook}
            className="w-full flex items-center justify-between p-3 bg-[#FEF5F2] rounded-xl hover:bg-[#FCE5DF] transition-colors"
          >
            <div>
              <p className="font-semibold text-[#1A1A1A]">{post.service.name}</p>
              <p className="text-sm text-[#D97A5F]">${post.service.price}</p>
            </div>
            <span className="px-4 py-2 bg-[#F4B5A4] text-[#1A1A1A] rounded-lg font-semibold text-sm">
              Book Now
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

