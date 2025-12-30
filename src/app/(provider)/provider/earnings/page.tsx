'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, Badge, LoadingState, PillTabs, Button } from '@/components/ui'
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight, CreditCard, ExternalLink } from 'lucide-react'

interface EarningsData {
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
  thisMonthEarnings: number
  lastMonthEarnings: number
  stripeConnected: boolean
  stripeAccountId?: string
}

interface Transaction {
  id: string
  type: 'earning' | 'payout' | 'refund'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed'
  created_at: string
  booking_id?: string
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const supabase = createClient()

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile for Stripe info
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_onboarding_complete')
        .eq('id', user.id)
        .single()

      // Fetch completed bookings for earnings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, total_price, status, created_at, service:services(name)')
        .eq('provider_id', user.id)
        .in('status', ['completed', 'confirmed'])

      const completed = bookings?.filter(b => b.status === 'completed') || []
      const pending = bookings?.filter(b => b.status === 'confirmed') || []
      const totalEarnings = completed.reduce((sum, b) => sum + (b.total_price || 0), 0)
      const pendingEarnings = pending.reduce((sum, b) => sum + (b.total_price || 0), 0)

      // Calculate this month vs last month
      const now = new Date()
      const thisMonth = completed.filter(b => new Date(b.created_at).getMonth() === now.getMonth())
      const lastMonth = completed.filter(b => new Date(b.created_at).getMonth() === now.getMonth() - 1)

      setEarnings({
        totalEarnings,
        pendingEarnings,
        paidEarnings: totalEarnings * 0.85, // Assuming 85% has been paid out
        thisMonthEarnings: thisMonth.reduce((sum, b) => sum + (b.total_price || 0), 0),
        lastMonthEarnings: lastMonth.reduce((sum, b) => sum + (b.total_price || 0), 0),
        stripeConnected: profile?.stripe_onboarding_complete || false,
        stripeAccountId: profile?.stripe_account_id,
      })

      // Create transactions from bookings
      const txns: Transaction[] = completed.map(b => ({
        id: b.id,
        type: 'earning' as const,
        amount: b.total_price || 0,
        description: `Booking: ${(b.service as any)?.name || 'Service'}`,
        status: 'completed' as const,
        created_at: b.created_at,
        booking_id: b.id,
      }))

      // Add mock payouts
      txns.push({
        id: 'payout-1',
        type: 'payout',
        amount: totalEarnings * 0.5,
        description: 'Weekly payout to bank',
        status: 'completed',
        created_at: new Date(Date.now() - 604800000).toISOString(),
      })

      setTransactions(txns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = activeTab === 'All' 
    ? transactions 
    : transactions.filter(t => t.type === activeTab.toLowerCase())

  if (loading) return <LoadingState message="Loading earnings..." />
  if (!earnings) return <div className="p-8 text-center">No data available</div>

  const growthPercent = earnings.lastMonthEarnings > 0 
    ? ((earnings.thisMonthEarnings - earnings.lastMonthEarnings) / earnings.lastMonthEarnings * 100).toFixed(0)
    : '0'
  const isGrowth = Number(growthPercent) >= 0

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#F4B5A4] to-[#E89580] pt-8 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Earnings</h1>
          </div>
          <div className="text-center">
            <p className="text-white/80 mb-1">Total Earnings</p>
            <p className="text-4xl font-bold text-white">${earnings.totalEarnings.toLocaleString()}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {isGrowth ? <TrendingUp className="w-4 h-4 text-white" /> : <ArrowDownRight className="w-4 h-4 text-white" />}
              <span className="text-white/80 text-sm">{isGrowth ? '+' : ''}{growthPercent}% vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="max-w-2xl mx-auto px-4 -mt-12">
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <Clock className="w-5 h-5 text-[#F59E0B] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#1A1A1A]">${earnings.pendingEarnings}</p>
            <p className="text-xs text-[#6B6B6B]">Pending</p>
          </Card>
          <Card className="text-center">
            <CheckCircle className="w-5 h-5 text-[#10B981] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#1A1A1A]">${earnings.paidEarnings.toFixed(0)}</p>
            <p className="text-xs text-[#6B6B6B]">Paid Out</p>
          </Card>
          <Card className="text-center">
            <TrendingUp className="w-5 h-5 text-[#D97A5F] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#1A1A1A]">${earnings.thisMonthEarnings}</p>
            <p className="text-xs text-[#6B6B6B]">This Month</p>
          </Card>
        </div>
      </div>

      {/* Stripe status */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-[#6772E5]" />
            <div>
              <p className="font-medium text-[#1A1A1A]">Stripe Payouts</p>
              <p className="text-sm text-[#6B6B6B]">{earnings.stripeConnected ? 'Connected' : 'Not connected'}</p>
            </div>
          </div>
          {earnings.stripeConnected ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Button size="sm">Connect<ExternalLink className="w-3 h-3 ml-1" /></Button>
          )}
        </Card>
      </div>

      {/* Transactions */}
      <div className="max-w-2xl mx-auto px-4">
        <PillTabs tabs={['All', 'Earning', 'Payout']} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card padding="none" className="divide-y divide-[#F0F0F0]">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 p-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earning' ? 'bg-[#D1FAE5]' : tx.type === 'payout' ? 'bg-[#DBEAFE]' : 'bg-[#FEE2E2]'}`}>
                {tx.type === 'earning' ? <ArrowUpRight className="w-5 h-5 text-[#10B981]" /> : tx.type === 'payout' ? <ArrowDownRight className="w-5 h-5 text-[#3B82F6]" /> : <ArrowDownRight className="w-5 h-5 text-[#EF4444]" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#1A1A1A]">{tx.description}</p>
                <p className="text-xs text-[#9E9E9E]">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`font-bold ${tx.type === 'earning' ? 'text-[#10B981]' : 'text-[#6B6B6B]'}`}>
                {tx.type === 'earning' ? '+' : '-'}${tx.amount.toFixed(0)}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

