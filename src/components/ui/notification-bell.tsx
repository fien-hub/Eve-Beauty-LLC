'use client'

import { cn } from '@/lib/utils'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Avatar } from './avatar'

interface Notification {
  id: string
  title: string
  body: string
  type: 'booking' | 'review' | 'message' | 'promo' | 'system'
  is_read: boolean
  created_at: string
  action_url?: string
  actor?: {
    name: string
    avatar_url?: string | null
  }
}

interface NotificationBellProps {
  notifications: Notification[]
  unreadCount: number
  href?: string
  onMarkAsRead?: (id: string) => void
  onMarkAllRead?: () => void
  className?: string
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

const typeIcons: Record<string, string> = {
  booking: '📅',
  review: '⭐',
  message: '💬',
  promo: '🎉',
  system: '🔔',
}

export function NotificationBell({
  notifications,
  unreadCount,
  href = '/notifications',
  onMarkAsRead,
  onMarkAllRead,
  className,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#6B6B6B] hover:text-[#D97A5F] hover:bg-[#FEF5F2] rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#EF4444] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#F0F0F0] overflow-hidden animate-scale-in origin-top-right z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
            <h3 className="font-semibold text-[#1A1A1A]">Notifications</h3>
            {unreadCount > 0 && onMarkAllRead && (
              <button
                onClick={onMarkAllRead}
                className="text-sm text-[#D97A5F] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <span className="text-3xl mb-2 block">🔔</span>
                <p className="text-sm text-[#6B6B6B]">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.action_url || href}
                  onClick={() => {
                    onMarkAsRead?.(notification.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-[#F7F7F7] transition-colors',
                    !notification.is_read && 'bg-[#FEF5F2]'
                  )}
                >
                  {notification.actor ? (
                    <Avatar
                      src={notification.actor.avatar_url}
                      name={notification.actor.name}
                      size="sm"
                    />
                  ) : (
                    <span className="text-lg">{typeIcons[notification.type]}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm truncate',
                      !notification.is_read ? 'font-semibold text-[#1A1A1A]' : 'text-[#6B6B6B]'
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-[#9E9E9E] truncate mt-0.5">
                      {notification.body}
                    </p>
                    <p className="text-xs text-[#9E9E9E] mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-[#D97A5F] rounded-full flex-shrink-0 mt-2" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <Link
              href={href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-center text-sm font-medium text-[#D97A5F] border-t border-[#F0F0F0] hover:bg-[#FEF5F2] transition-colors"
            >
              View all notifications
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

