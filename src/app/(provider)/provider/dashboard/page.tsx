import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Sparkles, Calendar, Star, CheckCircle, Clock, TrendingUp, DollarSign, Users, ChevronRight, Briefcase, Camera, Settings } from 'lucide-react'
import { getAvatarUrl } from '@/lib/images'

export default async function ProviderDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get provider profile
  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // If no provider profile, redirect to onboarding
  if (!providerProfile) {
    redirect('/provider/onboarding')
  }

  // Get upcoming bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customer_profiles!bookings_customer_id_fkey (
        id,
        profiles!customer_profiles_id_fkey (first_name, last_name, avatar_url)
      ),
      provider_services (base_price, services (name))
    `)
    .eq('provider_id', providerProfile.id)
    .in('status', ['pending', 'confirmed'])
    .order('booking_date', { ascending: true })
    .limit(5)

  // Get stats
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', providerProfile.id)
    .eq('status', 'completed')

  const providerAvatar = providerProfile.profile_photo_url || getAvatarUrl(providerProfile.business_name, 80)

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#D97A5F]">Eve Beauty Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/provider/services" className="text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">Services</Link>
            <Link href="/provider/bookings" className="text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">Bookings</Link>
            <Link href="/provider/portfolio" className="text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">Portfolio</Link>
            <Link href="/provider/profile" className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#F4B5A4]">
              <Image
                src={providerAvatar}
                alt={providerProfile.business_name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#FEF5F2] to-[#FCE5DF] rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={providerAvatar}
                  alt={providerProfile.business_name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
                  Welcome back, {providerProfile.business_name}! ✨
                </h1>
                <p className="text-[#6B6B6B] mt-1">Here&apos;s your business overview</p>
              </div>
            </div>
            <Link href="/provider/analytics" className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-[#D97A5F]">
              <TrendingUp className="w-5 h-5" />
              View Analytics
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#3B82F6]" />
              </div>
            </div>
            <p className="text-[#6B6B6B] text-sm">Total Bookings</p>
            <p className="text-3xl font-bold text-[#1A1A1A] mt-1">{totalBookings || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-[#F59E0B]" />
              </div>
            </div>
            <p className="text-[#6B6B6B] text-sm">Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-bold text-[#1A1A1A]">{providerProfile.rating?.toFixed(1) || 'N/A'}</p>
              {providerProfile.rating && <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-[#D97A5F]" />
              </div>
            </div>
            <p className="text-[#6B6B6B] text-sm">Reviews</p>
            <p className="text-3xl font-bold text-[#1A1A1A] mt-1">{providerProfile.total_reviews || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${providerProfile.is_verified ? 'bg-[#D1FAE5]' : 'bg-[#FEF3C7]'} rounded-xl flex items-center justify-center`}>
                <CheckCircle className={`w-5 h-5 ${providerProfile.is_verified ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
              </div>
            </div>
            <p className="text-[#6B6B6B] text-sm">Status</p>
            <p className={`text-lg font-bold mt-1 ${providerProfile.is_verified ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
              {providerProfile.is_verified ? 'Verified' : 'Pending'}
            </p>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#D97A5F]" />
              </div>
              <h3 className="font-bold text-lg text-[#1A1A1A]">Upcoming Bookings</h3>
            </div>
            <Link href="/provider/bookings" className="flex items-center gap-1 text-[#D97A5F] text-sm font-medium hover:text-[#E89580] transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const customer = booking.customer as { profiles?: { first_name?: string; last_name?: string; avatar_url?: string | null } }
                const customerName = customer?.profiles ? `${customer.profiles.first_name || ''} ${customer.profiles.last_name || ''}`.trim() || 'Customer' : 'Customer'
                const customerAvatar = customer?.profiles?.avatar_url || getAvatarUrl(customerName, 96)

                return (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-2xl hover:bg-[#FEF5F2] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                        <Image
                          src={customerAvatar}
                          alt={customerName}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">
                          {customerName}
                        </p>
                        <p className="text-sm text-[#6B6B6B]">
                          {(booking.provider_services as { services?: { name?: string } })?.services?.name} • {new Date(booking.booking_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
                        booking.status === 'confirmed' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#FEF3C7] text-[#F59E0B]'
                      }`}>
                        {booking.status}
                      </span>
                      <Link href={`/provider/bookings/${booking.id}`} className="flex items-center gap-1 text-[#D97A5F] hover:text-[#E89580] font-medium">
                        View <ChevronRight className="w-4 h-4" />
                      </Link>
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
              <p className="text-[#6B6B6B] font-medium">No upcoming bookings</p>
              <p className="text-sm text-[#9E9E9E] mt-1">New bookings will appear here</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/provider/services" className="group bg-white p-6 rounded-3xl border-2 border-[#E5E5E5] hover:border-[#F4B5A4] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-[#FCE5DF] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-7 h-7 text-[#D97A5F]" />
            </div>
            <h3 className="font-bold text-lg text-[#1A1A1A]">Manage Services</h3>
            <p className="text-[#6B6B6B] text-sm mt-1">Add or edit your services</p>
          </Link>
          <Link href="/provider/availability" className="group bg-white p-6 rounded-3xl border-2 border-[#E5E5E5] hover:border-[#F4B5A4] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-[#DBEAFE] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7 text-[#3B82F6]" />
            </div>
            <h3 className="font-bold text-lg text-[#1A1A1A]">Set Availability</h3>
            <p className="text-[#6B6B6B] text-sm mt-1">Update your schedule</p>
          </Link>
          <Link href="/provider/portfolio" className="group bg-white p-6 rounded-3xl border-2 border-[#E5E5E5] hover:border-[#F4B5A4] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-[#FEF3C7] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-7 h-7 text-[#F59E0B]" />
            </div>
            <h3 className="font-bold text-lg text-[#1A1A1A]">Portfolio</h3>
            <p className="text-[#6B6B6B] text-sm mt-1">Showcase your work</p>
          </Link>
        </div>
      </main>
    </div>
  )
}

