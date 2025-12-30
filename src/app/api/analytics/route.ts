import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get provider analytics
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get('period') || '30' // days
  const periodDays = parseInt(period)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get provider profile
    const { data: profile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)
    const startDateStr = startDate.toISOString()

    // Get bookings in period
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        id,
        status,
        total_price,
        booking_date,
        created_at,
        provider_services (base_price, services (name, category))
      `)
      .eq('provider_id', user.id)
      .gte('created_at', startDateStr)

    // Get reviews in period
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, created_at')
      .eq('provider_id', user.id)
      .gte('created_at', startDateStr)

    // Calculate analytics
    const totalBookings = bookings?.length || 0
    const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0
    const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0
    const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0
    
    const totalRevenue = bookings
      ?.filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    const averageRating = reviews?.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    // Group bookings by date for chart
    const bookingsByDate = bookings?.reduce((acc: Record<string, number>, booking) => {
      const date = new Date(booking.booking_date).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {}) || {}

    // Revenue by date
    const revenueByDate = bookings
      ?.filter(b => b.status === 'completed')
      .reduce((acc: Record<string, number>, booking) => {
        const date = new Date(booking.booking_date).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + (booking.total_price || 0)
        return acc
      }, {}) || {}

    // Service popularity
    const serviceStats = bookings?.reduce((acc: Record<string, { count: number; revenue: number }>, booking: any) => {
      // Handle array or single object from Supabase
      const providerService = Array.isArray(booking.provider_services) ? booking.provider_services[0] : booking.provider_services
      const service = providerService ? (Array.isArray(providerService.services) ? providerService.services[0] : providerService.services) : null
      const serviceName = service?.name || 'Unknown'
      if (!acc[serviceName]) {
        acc[serviceName] = { count: 0, revenue: 0 }
      }
      acc[serviceName].count += 1
      if (booking.status === 'completed') {
        acc[serviceName].revenue += booking.total_price || 0
      }
      return acc
    }, {}) || {}

    return NextResponse.json({
      summary: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        completionRate: totalBookings ? Math.round((completedBookings / totalBookings) * 100) : 0,
        totalRevenue,
        averageBookingValue: completedBookings ? Math.round(totalRevenue / completedBookings) : 0,
        totalReviews: reviews?.length || 0,
        averageRating: Math.round(averageRating * 10) / 10,
      },
      charts: {
        bookingsByDate,
        revenueByDate,
      },
      serviceStats,
      period: periodDays,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

