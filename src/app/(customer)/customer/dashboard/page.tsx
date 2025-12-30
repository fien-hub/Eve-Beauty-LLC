import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Heart, Search, Bell, Clock, ChevronRight, Gift } from 'lucide-react'
import { getAvatarUrl } from '@/lib/images'

export default async function CustomerDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get recent bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      provider_profiles (
        id,
        business_name,
        profile_photo_url
      ),
      provider_services (
        base_price,
        services (name)
      )
    `)
    .eq('customer_id', user.id)
    .order('booking_date', { ascending: false })
    .limit(5)

  // Get loyalty points
  const { data: loyaltyData } = await supabase
    .from('loyalty_points')
    .select('points_balance')
    .eq('user_id', user.id)
    .single()

  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User' : 'User'
  const avatarUrl = profile?.avatar_url || getAvatarUrl(fullName, 80)

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Eve Beauty Logo"
              width={40}
              height={40}
              className="rounded-xl shadow-md"
            />
            <span className="text-2xl font-bold text-[#D97A5F]">Eve Beauty</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/browse" className="hidden sm:flex items-center gap-2 text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">
              <Search className="w-4 h-4" />
              Browse
            </Link>
            <Link href="/customer/notifications" className="relative p-2.5 hover:bg-[#FEF5F2] rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-[#6B6B6B]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
            </Link>
            <Link href="/customer/profile" className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#F4B5A4]">
              <Image
                src={avatarUrl}
                alt={fullName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#FEF5F2] to-[#FCE5DF] rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
                Welcome back, {profile?.first_name || 'there'}! 👋
              </h1>
              <p className="text-[#6B6B6B] mt-2">Ready to book your next beauty service?</p>
            </div>
            {loyaltyData && (
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B6B6B]">Loyalty Points</p>
                  <p className="text-xl font-bold text-[#1A1A1A]">{loyaltyData.points_balance || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/browse"
            className="group relative bg-gradient-to-br from-[#F4B5A4] to-[#E89580] p-6 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white">Book a Service</h3>
              <p className="text-white/80 text-sm mt-1">Find beauty pros near you</p>
            </div>
          </Link>
          <Link
            href="/customer/bookings"
            className="group bg-white p-6 rounded-3xl border-2 border-[#E5E5E5] hover:border-[#F4B5A4] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-[#FCE5DF] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7 text-[#D97A5F]" />
            </div>
            <h3 className="font-bold text-lg text-[#1A1A1A]">My Bookings</h3>
            <p className="text-[#6B6B6B] text-sm mt-1">View upcoming appointments</p>
          </Link>
          <Link
            href="/customer/favorites"
            className="group bg-white p-6 rounded-3xl border-2 border-[#E5E5E5] hover:border-[#F4B5A4] hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-[#FEE2E2] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7 text-[#EF4444]" />
            </div>
            <h3 className="font-bold text-lg text-[#1A1A1A]">Favorites</h3>
            <p className="text-[#6B6B6B] text-sm mt-1">Your saved providers</p>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#D97A5F]" />
              </div>
              <h3 className="font-bold text-lg text-[#1A1A1A]">Recent Bookings</h3>
            </div>
            <Link href="/customer/bookings" className="flex items-center gap-1 text-[#D97A5F] text-sm font-medium hover:text-[#E89580] transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const providerProfile = booking.provider_profiles as { id?: string; business_name?: string; profile_photo_url?: string | null }
                const providerAvatar = providerProfile?.profile_photo_url || getAvatarUrl(providerProfile?.business_name || 'Provider', 96)

                return (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-2xl hover:bg-[#FEF5F2] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                        <Image
                          src={providerAvatar}
                          alt={providerProfile?.business_name || 'Provider'}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">
                          {(booking.provider_services as { services?: { name?: string } })?.services?.name || 'Service'}
                        </p>
                        <p className="text-sm text-[#6B6B6B]">
                          {providerProfile?.business_name} • {new Date(booking.booking_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
                        booking.status === 'confirmed' ? 'bg-[#D1FAE5] text-[#10B981]' :
                        booking.status === 'pending' ? 'bg-[#FEF3C7] text-[#F59E0B]' :
                        booking.status === 'completed' ? 'bg-[#DBEAFE] text-[#3B82F6]' :
                        'bg-[#F3F4F6] text-[#6B6B6B]'
                      }`}>
                        {booking.status}
                      </span>
                      <ChevronRight className="w-5 h-5 text-[#9E9E9E] group-hover:text-[#D97A5F] transition-colors" />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#FEF5F2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-[#D97A5F]" />
              </div>
              <p className="text-[#6B6B6B] font-medium">No bookings yet</p>
              <p className="text-sm text-[#9E9E9E] mt-1 mb-4">Book your first beauty service today!</p>
              <Link href="/browse" className="inline-flex items-center gap-2 bg-[#F4B5A4] text-black px-6 py-3 rounded-xl font-semibold hover:bg-[#E89580] transition-all">
                Browse Services <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

