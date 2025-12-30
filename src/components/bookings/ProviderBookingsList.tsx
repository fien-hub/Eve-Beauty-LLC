'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Bell, Calendar, Clock, MapPin, Phone, X, Check, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Booking {
  id: string
  status: string
  booking_date: string
  start_time: string
  total_price: number
  customer_address?: string
  provider_id: string
  customer_id: string
  customer?: { profiles?: { first_name?: string; last_name?: string; phone?: string; avatar_url?: string } }
  provider_services?: { services?: { name?: string }; duration_minutes?: number }
}

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending: { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]', label: 'Pending' },
  confirmed: { bg: 'bg-[#D1FAE5]', text: 'text-[#10B981]', border: 'border-[#10B981]', label: 'Confirmed' },
  in_progress: { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]', label: 'In Progress' },
  completed: { bg: 'bg-[#F0F0F0]', text: 'text-[#6B6B6B]', border: 'border-[#6B6B6B]', label: 'Completed' },
  cancelled: { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', border: 'border-[#EF4444]', label: 'Cancelled' },
}

export function ProviderBookingsList({ initialBookings, providerId }: { initialBookings: Booking[]; providerId: string }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('provider-booking-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `provider_id=eq.${providerId}` },
        async (payload) => {
          const bookingId = (payload.new as Booking)?.id || (payload.old as { id: string })?.id
          if (payload.eventType === 'DELETE') {
            setBookings(prev => prev.filter(b => b.id !== bookingId))
          } else {
            const { data } = await supabase.from('bookings')
              .select(`*, customer:customer_profiles!bookings_customer_id_fkey (profiles!customer_profiles_id_fkey (first_name, last_name, phone)), provider_services (services (name))`)
              .eq('id', bookingId).single()
            if (data) {
              if (payload.eventType === 'INSERT') {
                setBookings(prev => [data, ...prev])
                setNotification({ message: '🎉 New booking!', type: 'success' })
              } else {
                setBookings(prev => prev.map(b => b.id === data.id ? data : b))
              }
              setTimeout(() => setNotification(null), 5000)
            }
          }
        }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [providerId, supabase])

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    setLoadingId(id)
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
      setNotification({ message: `Booking ${status === 'confirmed' ? 'accepted' : status}!`, type: 'success' })
    } else setNotification({ message: 'Update failed', type: 'warning' })
    setLoadingId(null)
    setTimeout(() => setNotification(null), 3000)
  }

  const pending = bookings.filter(b => b.status === 'pending')
  const confirmed = bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status))
  const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status))

  return (
    <div className="relative">
      {notification && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${notification.type === 'success' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FEF3C7] text-[#F59E0B]'}`}>
          <Bell className="w-5 h-5" /><span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="w-3 h-3 bg-[#F59E0B] rounded-full animate-pulse" />Pending ({pending.length})</h2>
          <div className="space-y-4">{pending.map(b => <Card key={b.id} b={b} onUpdate={handleStatusUpdate} loading={loadingId} actions />)}</div>
        </section>
      )}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="w-3 h-3 bg-[#10B981] rounded-full" />Upcoming ({confirmed.length})</h2>
        {confirmed.length > 0 ? <div className="space-y-4">{confirmed.map(b => <Card key={b.id} b={b} onUpdate={handleStatusUpdate} loading={loadingId} complete />)}</div>
          : <div className="bg-white rounded-2xl p-8 text-center text-[#9E9E9E]">No upcoming bookings</div>}
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Past ({past.length})</h2>
          <div className="space-y-4">{past.slice(0, 5).map(b => <Card key={b.id} b={b} past />)}</div>
        </section>
      )}
    </div>
  )
}


function Card({ b, onUpdate, loading, actions, complete, past }: { b: Booking; onUpdate?: (id: string, s: 'confirmed' | 'cancelled' | 'completed') => void; loading?: string | null; actions?: boolean; complete?: boolean; past?: boolean }) {
  const s = statusConfig[b.status] || statusConfig.pending
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${s.border} ${past ? 'opacity-75' : 'hover:shadow-md transition-shadow'}`}>
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold text-[#1A1A1A]">{b.customer?.profiles ? `${b.customer.profiles.first_name || ''} ${b.customer.profiles.last_name || ''}`.trim() || 'Customer' : 'Customer'}</h3>
          <p className="text-sm text-[#6B6B6B]">{b.provider_services?.services?.name}</p>
          <div className="flex gap-3 mt-2 text-sm text-[#9E9E9E]">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(b.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.start_time?.slice(0, 5)}</span>
          </div>
          {b.customer_address && <p className="text-sm text-[#9E9E9E] flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{b.customer_address}</p>}
          {b.customer?.profiles?.phone && !past && <p className="text-sm text-[#D97A5F] flex items-center gap-1 mt-1"><Phone className="w-3.5 h-3.5" />{b.customer.profiles.phone}</p>}
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${past ? 'text-[#1A1A1A]' : 'text-[#D97A5F]'}`}>${(b.total_price / 100).toFixed(2)}</p>
          {past && <span className={`inline-block px-3 py-1 rounded-full text-xs mt-1 ${s.bg} ${s.text}`}>{s.label}</span>}
        </div>
      </div>
      {actions && onUpdate && (
        <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex gap-3">
          <Button size="sm" onClick={() => onUpdate(b.id, 'confirmed')} disabled={loading === b.id} className="bg-[#10B981] hover:bg-[#059669]"><Check className="w-4 h-4 mr-1" />Accept</Button>
          <Button size="sm" variant="outline" onClick={() => onUpdate(b.id, 'cancelled')} disabled={loading === b.id} className="border-[#EF4444] text-[#EF4444] hover:bg-[#FEE2E2]"><XCircle className="w-4 h-4 mr-1" />Decline</Button>
        </div>
      )}
      {complete && onUpdate && (
        <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex gap-3">
          <Link href={`/provider/bookings/${b.id}`} className="text-[#D97A5F] hover:text-[#E89580] text-sm font-medium">View Details →</Link>
          <Button size="sm" onClick={() => onUpdate(b.id, 'completed')} disabled={loading === b.id} className="ml-auto">Mark Complete</Button>
        </div>
      )}
      {past && <div className="mt-4 pt-4 border-t border-[#E5E5E5]"><Link href={`/provider/bookings/${b.id}`} className="text-[#6B6B6B] hover:text-[#D97A5F] text-sm font-medium">View Details</Link></div>}
    </div>
  )
}