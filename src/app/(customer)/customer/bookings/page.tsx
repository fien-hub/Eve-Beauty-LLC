import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookingsList } from '@/components/bookings/BookingsList'

export default async function CustomerBookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all bookings with related data
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      provider_profiles (business_name, profile_photo_url),
      provider_services (base_price, duration_minutes, services (name))
    `)
    .eq('customer_id', user.id)
    .order('booking_date', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#D97A5F]">Eve Beauty</Link>
          <Link href="/customer/dashboard" className="text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">My Bookings</h1>

        {/* Real-time Bookings List */}
        <BookingsList
          initialBookings={bookings || []}
          userId={user.id}
          userRole="customer"
        />
      </main>
    </div>
  )
}

