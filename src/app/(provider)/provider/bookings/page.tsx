import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProviderBookingsList } from '@/components/bookings/ProviderBookingsList'

export default async function ProviderBookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!provider) {
    redirect('/provider/onboarding')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customer_profiles!bookings_customer_id_fkey (
        id,
        profiles!customer_profiles_id_fkey (first_name, last_name, phone, avatar_url)
      ),
      provider_services (base_price, duration_minutes, services (name))
    `)
    .eq('provider_id', provider.id)
    .order('booking_date', { ascending: true })

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#D97A5F]">Eve Beauty Pro</Link>
          <Link href="/provider/dashboard" className="text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Bookings</h1>

        {/* Real-time Bookings List */}
        <ProviderBookingsList
          initialBookings={bookings || []}
          providerId={provider.id}
        />
      </main>
    </div>
  )
}

