import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List messages with a specific user
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const otherUserId = searchParams.get('otherUserId')

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (otherUserId) {
      // Get messages between current user and other user
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id)

      return NextResponse.json({ messages })
    } else {
      // Get all messages for user grouped by conversation partner
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Group by conversation partner
      const conversationMap = new Map<string, any[]>()
      messages?.forEach((msg: any) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, [])
        }
        conversationMap.get(partnerId)!.push(msg)
      })

      const conversations = Array.from(conversationMap.entries()).map(([partnerId, msgs]) => ({
        partner_id: partnerId,
        last_message: msgs[0],
        unread_count: msgs.filter(m => !m.is_read && m.sender_id !== user.id).length
      }))

      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId, content } = await request.json()

    if (!content || !receiverId) {
      return NextResponse.json({ error: 'Message content and receiver are required' }, { status: 400 })
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: content,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

