'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, Badge, Card, EmptyNotifications, LoadingState, PillTabs } from '@/components/ui'
import { Bell, Check, CheckCheck, Trash2, Calendar, Star, MessageSquare, Gift } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  body: string
  type: 'booking' | 'review' | 'message' | 'promo' | 'system'
  is_read: boolean
  created_at: string
  action_url?: string
  data?: Record<string, unknown>
}

const typeIcons: Record<string, React.ElementType> = {
  booking: Calendar,
  review: Star,
  message: MessageSquare,
  promo: Gift,
  system: Bell,
}

const typeColors: Record<string, string> = {
  booking: 'bg-[#DBEAFE] text-[#3B82F6]',
  review: 'bg-[#FEF3C7] text-[#F59E0B]',
  message: 'bg-[#D1FAE5] text-[#10B981]',
  promo: 'bg-[#FCE5DF] text-[#D97A5F]',
  system: 'bg-[#F3F4F6] text-[#6B7280]',
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const filteredNotifications = activeTab === 'All' 
    ? notifications 
    : notifications.filter(n => !n.is_read)

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) return <LoadingState message="Loading notifications..." />

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FEF5F2] rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#D97A5F]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A1A]">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-[#6B6B6B]">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm text-[#D97A5F] font-medium hover:underline flex items-center gap-1">
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            )}
          </div>
          <PillTabs tabs={['All', 'Unread']} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {filteredNotifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell
              return (
                <Card key={notification.id} padding="none" className={`${!notification.is_read ? 'ring-2 ring-[#F4B5A4]' : ''}`}>
                  <div className="flex items-start gap-3 p-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[notification.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium ${!notification.is_read ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-[#9E9E9E] whitespace-nowrap">{formatTime(notification.created_at)}</span>
                      </div>
                      <p className="text-sm text-[#6B6B6B] mt-1">{notification.body}</p>
                      <div className="flex items-center gap-3 mt-3">
                        {notification.action_url && (
                          <Link href={notification.action_url} className="text-sm text-[#D97A5F] font-medium hover:underline">
                            View Details
                          </Link>
                        )}
                        {!notification.is_read && (
                          <button onClick={() => markAsRead(notification.id)} className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-1">
                            <Check className="w-3 h-3" /> Mark read
                          </button>
                        )}
                        <button onClick={() => deleteNotification(notification.id)} className="text-sm text-[#9E9E9E] hover:text-[#EF4444] flex items-center gap-1 ml-auto">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

