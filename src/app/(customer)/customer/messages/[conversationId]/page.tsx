'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, LoadingState } from '@/components/ui'
import { ChatBubble, ChatDateSeparator, ChatInput } from '@/components/ui/chat-bubble'
import { ArrowLeft, Phone, MoreVertical } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  content: string
  created_at: string
  is_read: boolean
  sender: { id: string; name: string; avatar_url: string | null }
  image_url?: string | null
}

interface ConversationInfo {
  provider_id: string
  provider_name: string
  provider_avatar: string | null
}

export default function ChatPage() {
  const params = useParams()
  // conversationId is actually the other party's user_id
  const otherPartyId = params.conversationId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [convoInfo, setConvoInfo] = useState<ConversationInfo | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchConversation()
    setupRealtime()
    return () => { supabase.channel(`chat:${otherPartyId}`).unsubscribe() }
  }, [otherPartyId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Fetch provider info
      const { data: provider } = await supabase
        .from('provider_profiles')
        .select('id, business_name, avatar_url')
        .eq('user_id', otherPartyId)
        .single()

      if (provider) {
        setConvoInfo({
          provider_id: provider.id,
          provider_name: provider.business_name || 'Provider',
          provider_avatar: provider.avatar_url,
        })
      }

      // Fetch messages between current user and other party
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, message, created_at, is_read, image_url, sender_id')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherPartyId}),and(sender_id.eq.${otherPartyId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (msgs) {
        const formatted = msgs.map((m: any) => ({
          id: m.id,
          content: m.message,
          created_at: m.created_at,
          is_read: m.is_read,
          image_url: m.image_url,
          sender: { id: m.sender_id, name: m.sender_id === user.id ? 'You' : (provider?.business_name || 'Provider'), avatar_url: m.sender_id === user.id ? null : provider?.avatar_url },
        }))
        setMessages(formatted)
        // Mark as read
        await supabase.from('messages').update({ is_read: true }).eq('sender_id', otherPartyId).eq('receiver_id', user.id)
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtime = () => {
    supabase.channel(`chat:${otherPartyId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as any
        // Only add if it's part of this conversation
        if ((newMsg.sender_id === userId && newMsg.receiver_id === otherPartyId) ||
            (newMsg.sender_id === otherPartyId && newMsg.receiver_id === userId)) {
          setMessages((prev) => [...prev, {
            id: newMsg.id,
            content: newMsg.message,
            created_at: newMsg.created_at,
            is_read: newMsg.is_read,
            image_url: newMsg.image_url,
            sender: { id: newMsg.sender_id, name: '', avatar_url: null },
          }])
        }
      })
      .subscribe()
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return
    const content = newMessage.trim()
    setNewMessage('')

    try {
      await supabase.from('messages').insert({
        sender_id: userId,
        receiver_id: otherPartyId,
        message: content,
        is_read: false,
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = []
  messages.forEach((msg) => {
    const date = new Date(msg.created_at).toDateString()
    const lastGroup = groupedMessages[groupedMessages.length - 1]
    if (lastGroup?.date === date) {
      lastGroup.messages.push(msg)
    } else {
      groupedMessages.push({ date, messages: [msg] })
    }
  })

  if (loading) return <LoadingState message="Loading chat..." />

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/customer/messages" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" />
          </Link>
          <Avatar src={convoInfo?.provider_avatar} name={convoInfo?.provider_name || ''} size="sm" />
          <div className="flex-1">
            <h1 className="font-semibold text-[#1A1A1A]">{convoInfo?.provider_name}</h1>
            <p className="text-xs text-[#10B981]">Online</p>
          </div>
          <button className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <Phone className="w-5 h-5 text-[#6B6B6B]" />
          </button>
          <button className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-[#6B6B6B]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <ChatDateSeparator date={group.date} />
            {group.messages.map((msg) => (
              <div key={msg.id} className="mb-3">
                <ChatBubble message={msg} isOwn={msg.sender.id === userId} />
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto w-full">
        <ChatInput value={newMessage} onChange={setNewMessage} onSend={sendMessage} />
      </div>
    </div>
  )
}

