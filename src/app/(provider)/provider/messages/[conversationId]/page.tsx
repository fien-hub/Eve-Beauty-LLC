'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface Message {
  id: string;
  message: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

export default function ProviderConversationPage() {
  const params = useParams();
  // conversationId is actually the other party's user_id
  const otherUserId = params.conversationId as string;
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<{ first_name: string; last_name: string; avatar_url: string | null } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`conversation-${otherUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as any;
          if ((msg.sender_id === user?.id && msg.receiver_id === otherUserId) ||
              (msg.sender_id === otherUserId && msg.receiver_id === user?.id)) {
            setMessages(prev => [...prev, msg as Message]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [otherUserId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Get customer profile info
      const { data: customerProfile } = await supabase
        .from('customer_profiles')
        .select(`profiles!customer_profiles_id_fkey(first_name, last_name, avatar_url)`)
        .eq('id', otherUserId)
        .single();

      if (customerProfile?.profiles) {
        setCustomer(customerProfile.profiles as any);
      }

      // Get messages between current user and other user
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      setMessages(msgs || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: otherUserId,
        message: newMessage.trim(),
        is_read: false,
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageDate = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMMM d, yyyy');
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
      const msgDate = formatMessageDate(msg.created_at);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4B5A4]"></div>
      </div>
    );
  }

  const getFullName = () => customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer' : 'Customer';

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/provider/messages" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          {customer?.avatar_url ? (
            <img src={customer.avatar_url} alt={getFullName()} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#FCE5DF] flex items-center justify-center text-lg font-bold text-[#D97A5F]">
              {(customer?.first_name || 'C').charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-lg font-bold text-[#1A1A1A]">{getFullName()}</h1>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {groupMessagesByDate().map((group, idx) => (
            <div key={idx}>
              <div className="flex justify-center mb-4">
                <span className="bg-[#E5E5E5] text-[#6B6B6B] text-xs px-3 py-1 rounded-full">{group.date}</span>
              </div>
              <div className="space-y-3">
                {group.messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isMe ? 'bg-[#F4B5A4] text-[#1A1A1A] rounded-br-md' : 'bg-white text-[#1A1A1A] rounded-bl-md shadow-sm'}`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-[#1A1A1A]/60' : 'text-[#9E9E9E]'}`}>
                          {format(new Date(msg.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#E5E5E5] p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..." className="flex-1 px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
          <button onClick={handleSend} disabled={!newMessage.trim() || sending}
            className="p-3 bg-[#F4B5A4] rounded-xl hover:bg-[#E89580] transition-colors disabled:opacity-50">
            {sending ? <Loader2 className="w-5 h-5 animate-spin text-[#1A1A1A]" /> : <Send className="w-5 h-5 text-[#1A1A1A]" />}
          </button>
        </div>
      </div>
    </div>
  );
}

