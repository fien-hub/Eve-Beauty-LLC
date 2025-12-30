'use client'

import Link from 'next/link'
import { LogIn, Heart, Calendar, Bookmark, X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  action?: 'like' | 'save' | 'book' | 'message' | 'favorite' | 'general'
  title?: string
  message?: string
}

const actionConfig = {
  like: {
    icon: Heart,
    title: 'Like this post?',
    message: 'Sign up to like posts and save your favorites',
  },
  save: {
    icon: Bookmark,
    title: 'Save for later?',
    message: 'Create an account to save posts and build your collection',
  },
  book: {
    icon: Calendar,
    title: 'Ready to book?',
    message: 'Sign up to book services from amazing beauty providers',
  },
  message: {
    icon: LogIn,
    title: 'Start a conversation?',
    message: 'Create an account to message providers and book services',
  },
  favorite: {
    icon: Heart,
    title: 'Add to favorites?',
    message: 'Sign up to save your favorite providers and services',
  },
  general: {
    icon: LogIn,
    title: 'Join Eve Beauty',
    message: 'Sign up to access all features and book beauty services',
  },
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  action = 'general',
  title,
  message 
}: AuthModalProps) {
  if (!isOpen) return null

  const config = actionConfig[action]
  const Icon = config.icon
  const displayTitle = title || config.title
  const displayMessage = message || config.message

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#9E9E9E] hover:text-[#1A1A1A] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">{displayTitle}</h3>

        {/* Message */}
        <p className="text-[#6B6B6B] mb-6 leading-relaxed">{displayMessage}</p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            href="/signup" 
            className="block w-full py-3.5 bg-gradient-to-r from-[#F4B5A4] to-[#E89580] text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            Create Account
          </Link>
          <Link 
            href="/login" 
            className="block w-full py-3.5 border-2 border-[#E5E5E5] text-[#6B6B6B] rounded-xl font-semibold hover:border-[#D97A5F] hover:text-[#D97A5F] transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Additional Context */}
        <p className="text-xs text-[#9E9E9E] mt-4">
          Join 10,000+ customers finding their perfect beauty services
        </p>
      </div>
    </div>
  )
}
