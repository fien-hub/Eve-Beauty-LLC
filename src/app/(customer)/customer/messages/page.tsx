'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, Card, EmptyMessages, LoadingState } from '@/components/ui'
import { MessageSquare, Search } from 'lucide-react'
import Link from 'next/link'

interface Conversation {
  id: string
  provider_id: string
  provider_name: string
  provider_avatar: string | null
  last_message: string
  last_message_at: string
  unread_count: number
  booking_id?: string
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get customer profile id
      const { data: customerProfile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!customerProfile) return

      // Fetch messages where user is sender or receiver, grouped by the other party
      const { data: messages } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, message, created_at, is_read, booking_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!messages || messages.length === 0) {
        setConversations([])
        return
      }

      // Group messages by the other party (provider)
      const conversationMap = new Map<string, any[]>()
      messages.forEach((msg: any) => {
        const otherPartyId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!conversationMap.has(otherPartyId)) {
          conversationMap.set(otherPartyId, [])
        }
        conversationMap.get(otherPartyId)!.push(msg)
      })

      // Fetch provider info for each conversation
      const providerIds = Array.from(conversationMap.keys())
      const { data: providers } = await supabase
        .from('provider_profiles')
        .select('id, user_id, business_name, avatar_url')
        .in('user_id', providerIds)

      const providerMap = new Map(providers?.map((p: any) => [p.user_id, p]) || [])

      const convos: Conversation[] = []
      conversationMap.forEach((msgs, otherPartyId) => {
        const provider = providerMap.get(otherPartyId)
        const lastMsg = msgs[0]
        const unreadCount = msgs.filter((m: any) => !m.is_read && m.sender_id !== user.id).length

        convos.push({
          id: otherPartyId,
          provider_id: provider?.id || otherPartyId,
          provider_name: provider?.business_name || 'Provider',
          provider_avatar: provider?.avatar_url || null,
          last_message: lastMsg?.message || 'No messages yet',
          last_message_at: lastMsg?.created_at || new Date().toISOString(),
          unread_count: unreadCount,
          booking_id: lastMsg?.booking_id,
        })
      })

      setConversations(convos.sort((a, b) =>
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      ))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(c =>
    c.provider_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  if (loading) return <LoadingState message="Loading messages..." />

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FEF5F2] rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#D97A5F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Messages</h1>
              {totalUnread > 0 && (
                <p className="text-sm text-[#6B6B6B]">{totalUnread} unread</p>
              )}
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-3 bg-[#F7F7F7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4B5A4]"
            />
          </div>
        </div>
      </div>

      {/* Conversations */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {filteredConversations.length === 0 ? (
          <EmptyMessages />
        ) : (
          <Card padding="none" className="divide-y divide-[#F0F0F0]">
            {filteredConversations.map((convo) => (
              <Link
                key={convo.id}
                href={`/customer/messages/${convo.id}`}
                className="flex items-center gap-3 p-4 hover:bg-[#F7F7F7] transition-colors"
              >
                <div className="relative">
                  <Avatar src={convo.provider_avatar} name={convo.provider_name} size="md" />
                  {convo.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D97A5F] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {convo.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium truncate ${convo.unread_count > 0 ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>
                      {convo.provider_name}
                    </h3>
                    <span className="text-xs text-[#9E9E9E] ml-2">{formatTime(convo.last_message_at)}</span>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${convo.unread_count > 0 ? 'text-[#1A1A1A] font-medium' : 'text-[#9E9E9E]'}`}>
                    {convo.last_message}
                  </p>
                </div>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}

