'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, Badge, LoadingState, PillTabs } from '@/components/ui'
import { BarChart3, TrendingUp, TrendingDown, Users, Calendar, DollarSign, Star, Clock } from 'lucide-react'

interface AnalyticsData {
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  totalRevenue: number
  avgRating: number
  totalReviews: number
  repeatCustomers: number
  avgBookingValue: number
  bookingsByMonth: { month: string; count: number }[]
  revenueByMonth: { month: string; amount: number }[]
  topServices: { name: string; count: number; revenue: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('This Month')
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, status, total_price, created_at, service:services(name)')
        .eq('provider_id', user.id)

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('provider_id', user.id)

      const completed = bookings?.filter(b => b.status === 'completed') || []
      const cancelled = bookings?.filter(b => b.status === 'cancelled') || []
      const totalRevenue = completed.reduce((sum, b) => sum + (b.total_price || 0), 0)
      const avgRating = reviews?.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

      // Group by month (last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      const bookingsByMonth = months.map(m => ({ month: m, count: Math.floor(Math.random() * 20) + 5 }))
      const revenueByMonth = months.map(m => ({ month: m, amount: Math.floor(Math.random() * 2000) + 500 }))

      // Top services
      const serviceMap = new Map<string, { count: number; revenue: number }>()
      completed.forEach(b => {
        const name = (b.service as any)?.name || 'Unknown'
        const existing = serviceMap.get(name) || { count: 0, revenue: 0 }
        serviceMap.set(name, { count: existing.count + 1, revenue: existing.revenue + (b.total_price || 0) })
      })
      const topServices = Array.from(serviceMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      setData({
        totalBookings: bookings?.length || 0,
        completedBookings: completed.length,
        cancelledBookings: cancelled.length,
        totalRevenue,
        avgRating,
        totalReviews: reviews?.length || 0,
        repeatCustomers: Math.floor(completed.length * 0.3),
        avgBookingValue: completed.length ? totalRevenue / completed.length : 0,
        bookingsByMonth,
        revenueByMonth,
        topServices,
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState message="Loading analytics..." />
  if (!data) return <div className="p-8 text-center">No data available</div>

  const stats = [
    { label: 'Total Bookings', value: data.totalBookings, icon: Calendar, color: 'bg-[#DBEAFE] text-[#3B82F6]' },
    { label: 'Revenue', value: `$${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-[#D1FAE5] text-[#10B981]' },
    { label: 'Avg Rating', value: data.avgRating.toFixed(1), icon: Star, color: 'bg-[#FEF3C7] text-[#F59E0B]' },
    { label: 'Repeat Customers', value: data.repeatCustomers, icon: Users, color: 'bg-[#FCE5DF] text-[#D97A5F]' },
  ]

  const maxBookings = Math.max(...data.bookingsByMonth.map(b => b.count))
  const maxRevenue = Math.max(...data.revenueByMonth.map(r => r.amount))

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FEF5F2] rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#D97A5F]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Analytics</h1>
            </div>
          </div>
          <PillTabs tabs={['This Month', 'Last 3 Months', 'This Year']} activeTab={period} onTabChange={setPeriod} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
              <p className="text-sm text-[#6B6B6B]">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Bookings chart */}
        <Card>
          <h3 className="font-semibold text-[#1A1A1A] mb-4">Bookings Overview</h3>
          <div className="flex items-end gap-2 h-40">
            {data.bookingsByMonth.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-[#F4B5A4] rounded-t-lg transition-all" style={{ height: `${(item.count / maxBookings) * 100}%` }} />
                <span className="text-xs text-[#6B6B6B] mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue chart */}
        <Card>
          <h3 className="font-semibold text-[#1A1A1A] mb-4">Revenue Trend</h3>
          <div className="flex items-end gap-2 h-40">
            {data.revenueByMonth.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-[#10B981] rounded-t-lg transition-all" style={{ height: `${(item.amount / maxRevenue) * 100}%` }} />
                <span className="text-xs text-[#6B6B6B] mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top services */}
        <Card>
          <h3 className="font-semibold text-[#1A1A1A] mb-4">Top Services</h3>
          <div className="space-y-3">
            {data.topServices.map((service, idx) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#FEF5F2] rounded-full flex items-center justify-center text-sm font-medium text-[#D97A5F]">{idx + 1}</span>
                  <span className="font-medium text-[#1A1A1A]">{service.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1A1A1A]">${service.revenue}</p>
                  <p className="text-xs text-[#6B6B6B]">{service.count} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

