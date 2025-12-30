'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Search, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_read: boolean;
}

export default function ProviderMessagesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('provider-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all messages where user is sender or receiver
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!messages) { setLoading(false); return; }

      // Group by conversation partner
      const conversationMap = new Map<string, any[]>();
      messages.forEach((msg: any) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, []);
        }
        conversationMap.get(partnerId)!.push(msg);
      });

      // Get customer profiles for each partner
      const partnerIds = Array.from(conversationMap.keys());
      const { data: customerProfiles } = await supabase
        .from('customer_profiles')
        .select(`
          id,
          profiles!customer_profiles_id_fkey(id, user_id, first_name, last_name, avatar_url)
        `)
        .in('id', partnerIds);

      const profileMap = new Map<string, any>();
      customerProfiles?.forEach((cp: any) => {
        if (cp.profiles) {
          profileMap.set(cp.id, cp.profiles);
        }
      });

      const formattedConvos: Conversation[] = Array.from(conversationMap.entries()).map(([partnerId, msgs]) => {
        const profile = profileMap.get(partnerId);
        const lastMsg = msgs[0];
        const unreadCount = msgs.filter(m => !m.is_read && m.sender_id !== user.id).length;

        return {
          id: partnerId,
          customer_id: partnerId,
          customer_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
          customer_avatar: profile?.avatar_url || null,
          last_message: lastMsg?.message || 'No messages yet',
          last_message_time: lastMsg?.created_at,
          unread_count: unreadCount,
          is_read: lastMsg ? lastMsg.is_read : true,
        };
      });

      setConversations(formattedConvos);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4B5A4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/provider/dashboard" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">Messages</h1>
              {totalUnread > 0 && (
                <p className="text-sm text-[#D97A5F]">{totalUnread} unread message{totalUnread !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..." className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
        </div>

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <MessageCircle className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">No messages yet</h3>
            <p className="text-[#6B6B6B]">Customer messages will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((convo) => (
              <Link key={convo.id} href={`/provider/messages/${convo.id}`}
                className={`block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow ${convo.unread_count > 0 ? 'border-l-4 border-[#F4B5A4]' : ''}`}>
                <div className="flex items-center gap-4">
                  {convo.customer_avatar ? (
                    <img src={convo.customer_avatar} alt={convo.customer_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#FCE5DF] flex items-center justify-center text-lg font-bold text-[#D97A5F]">
                      {convo.customer_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${convo.unread_count > 0 ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>
                        {convo.customer_name}
                      </h3>
                      <span className="text-xs text-[#9E9E9E] whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(convo.last_message_time), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${convo.unread_count > 0 ? 'text-[#1A1A1A] font-medium' : 'text-[#6B6B6B]'}`}>
                        {convo.last_message}
                      </p>
                      <div className="flex items-center gap-2 ml-2">
                        {convo.is_read ? (
                          <CheckCheck className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <Check className="w-4 h-4 text-[#9E9E9E]" />
                        )}
                        {convo.unread_count > 0 && (
                          <span className="bg-[#F4B5A4] text-[#1A1A1A] text-xs font-bold px-2 py-0.5 rounded-full">
                            {convo.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

