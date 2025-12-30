'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Bell, Calendar, Clock, MapPin, MessageCircle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Booking {
  id: string
  status: string
  booking_date: string
  start_time: string
  total_price: number
  customer_address?: string
  provider_id: string
  customer_id: string
  provider_profiles?: { business_name?: string; profile_photo_url?: string }
  provider_services?: { services?: { name?: string }; duration_minutes?: number }
}

interface BookingsListProps {
  initialBookings: Booking[]
  userId: string
  userRole: 'customer' | 'provider'
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', label: 'Pending' },
  confirmed: { bg: 'bg-[#D1FAE5]', text: 'text-[#10B981]', label: 'Confirmed' },
  in_progress: { bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]', label: 'In Progress' },
  completed: { bg: 'bg-[#F0F0F0]', text: 'text-[#6B6B6B]', label: 'Completed' },
  cancelled: { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Cancelled' },
}

export function BookingsList({ initialBookings, userId, userRole }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to booking changes
    const channel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: userRole === 'customer' ? `customer_id=eq.${userId}` : `provider_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedBooking = payload.new as Booking

            // Fetch related data
            const { data: fullBooking } = await supabase
              .from('bookings')
              .select(`
                *,
                provider_profiles (business_name, profile_photo_url),
                provider_services (services (name), duration_minutes)
              `)
              .eq('id', updatedBooking.id)
              .single()

            if (fullBooking) {
              setBookings(prev => prev.map(b => b.id === fullBooking.id ? fullBooking : b))

              // Show notification
              const statusLabel = statusConfig[fullBooking.status]?.label || fullBooking.status
              setNotification({
                message: `Booking status updated to "${statusLabel}"`,
                type: fullBooking.status === 'confirmed' ? 'success' : 'info'
              })

              // Auto-hide notification after 5 seconds
              setTimeout(() => setNotification(null), 5000)
            }
          } else if (payload.eventType === 'INSERT') {
            const newBooking = payload.new as Booking

            const { data: fullBooking } = await supabase
              .from('bookings')
              .select(`
                *,
                provider_profiles (business_name, profile_photo_url),
                provider_services (services (name), duration_minutes)
              `)
              .eq('id', newBooking.id)
              .single()

            if (fullBooking) {
              setBookings(prev => [fullBooking, ...prev])
              setNotification({ message: 'New booking received!', type: 'success' })
              setTimeout(() => setNotification(null), 5000)
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id
            setBookings(prev => prev.filter(b => b.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, userRole, supabase])

  const upcomingBookings = bookings.filter(b =>
    ['pending', 'confirmed', 'in_progress'].includes(b.status) && new Date(b.booking_date) >= new Date(new Date().setHours(0,0,0,0))
  )

  const pastBookings = bookings.filter(b =>
    b.status === 'completed' || b.status === 'cancelled' || new Date(b.booking_date) < new Date(new Date().setHours(0,0,0,0))
  )

  return (
    <div className="relative">
      {/* Real-time Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in ${
          notification.type === 'success' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#DBEAFE] text-[#3B82F6]'
        }`}>
          <Bell className="w-5 h-5" />
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upcoming Bookings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
          Upcoming
          {upcomingBookings.length > 0 && (
            <span className="bg-[#F4B5A4] text-[#1A1A1A] text-xs px-2 py-0.5 rounded-full">{upcomingBookings.length}</span>
          )}
        </h2>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} userRole={userRole} />
            ))}
          </div>
        ) : (
          <EmptyState message="No upcoming bookings" linkHref="/browse" linkText="Book a service →" />
        )}
      </section>

      {/* Past Bookings */}
      <section>
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Past</h2>
        {pastBookings.length > 0 ? (
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} userRole={userRole} isPast />
            ))}
          </div>
        ) : (
          <EmptyState message="No past bookings" />
        )}
      </section>
    </div>
  )
}

// Booking Card Component
function BookingCard({ booking, userRole, isPast = false }: { booking: Booking; userRole: 'customer' | 'provider'; isPast?: boolean }) {
  const status = statusConfig[booking.status] || statusConfig.pending
  const serviceName = booking.provider_services?.services?.name || 'Service'
  const providerName = booking.provider_profiles?.business_name || 'Provider'

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 transition-all ${isPast ? 'opacity-75' : 'hover:shadow-md'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 ${isPast ? 'bg-[#F0F0F0]' : 'bg-[#FEF5F2]'} rounded-full flex items-center justify-center`}>
            <span className="text-2xl">💅</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">{serviceName}</h3>
            <p className="text-sm text-[#6B6B6B]">{providerName}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-[#9E9E9E]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(booking.booking_date).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {booking.start_time?.slice(0, 5)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
          <p className={`text-lg font-bold mt-2 ${isPast ? 'text-[#1A1A1A]' : 'text-[#D97A5F]'}`}>
            ${(booking.total_price / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex gap-4">
        <Link
          href={userRole === 'customer' ? `/customer/bookings/${booking.id}` : `/provider/bookings/${booking.id}`}
          className="text-[#D97A5F] hover:text-[#E89580] text-sm font-medium transition-colors"
        >
          View Details
        </Link>
        {!isPast && booking.status === 'confirmed' && (
          <Link
            href={userRole === 'customer' ? `/customer/messages?booking=${booking.id}` : `/provider/messages?booking=${booking.id}`}
            className="text-[#6B6B6B] hover:text-[#D97A5F] text-sm font-medium transition-colors flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Message
          </Link>
        )}
        {booking.status === 'completed' && userRole === 'customer' && (
          <Link
            href={`/customer/bookings/${booking.id}/review`}
            className="text-[#D97A5F] hover:text-[#E89580] text-sm font-medium transition-colors"
          >
            Leave a Review
          </Link>
        )}
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ message, linkHref, linkText }: { message: string; linkHref?: string; linkText?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
      <p className="text-[#9E9E9E] mb-4">{message}</p>
      {linkHref && linkText && (
        <Link href={linkHref} className="text-[#D97A5F] hover:text-[#E89580] font-medium transition-colors">
          {linkText}
        </Link>
      )}
    </div>
  )
}

