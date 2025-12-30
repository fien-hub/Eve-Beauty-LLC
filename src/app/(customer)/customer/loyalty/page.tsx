'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Gift, Star, Trophy, Clock, ChevronRight } from 'lucide-react'

interface LoyaltyData {
  loyalty: {
    currentPoints: number
    totalPoints: number
    tier: string
    tierProgress: number
  }
  pointsHistory: Array<{
    id: string
    points: number
    type: string
    description: string
    created_at: string
  }>
}

export default function LoyaltyPage() {
  const [data, setData] = useState<LoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLoyaltyData()
  }, [])

  const fetchLoyaltyData = async () => {
    try {
      const response = await fetch('/api/loyalty')
      if (response.ok) {
        const loyaltyData = await response.json()
        setData(loyaltyData)
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-gradient-to-r from-gray-300 to-gray-400'
      case 'Gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
      case 'Silver': return 'bg-gradient-to-r from-gray-200 to-gray-300'
      default: return 'bg-gradient-to-r from-amber-600 to-amber-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4B5A4]"></div>
      </div>
    )
  }

  const loyalty = data?.loyalty || { currentPoints: 0, totalPoints: 0, tier: 'Bronze', tierProgress: 0 }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/customer/profile" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Loyalty & Rewards</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Points Card */}
        <div className={`${getTierColor(loyalty.tier)} rounded-2xl p-6 text-white mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Your Points</p>
              <p className="text-4xl font-bold">{loyalty.currentPoints}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
          </div>
          <div className="border-t border-white/20 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{loyalty.tier} Member</span>
              <span>{loyalty.totalPoints} lifetime points</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all" 
                style={{ width: `${loyalty.tierProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#FEF5F2] rounded-full flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-[#D97A5F]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-1">How it works</h3>
              <p className="text-sm text-[#6B6B6B]">
                Earn 1 point for every $1 spent on services. Redeem 100 points for $10 off your next booking!
              </p>
            </div>
          </div>
        </div>

        {/* Points History */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-4 border-b border-[#E5E5E5]">
            <h3 className="font-semibold text-[#1A1A1A]">Points History</h3>
          </div>
          {data?.pointsHistory && data.pointsHistory.length > 0 ? (
            <div className="divide-y divide-[#E5E5E5]">
              {data.pointsHistory.map((transaction) => (
                <div key={transaction.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.points > 0 ? 'bg-[#D1FAE5]' : 'bg-[#FEE2E2]'
                    }`}>
                      <Star className={`w-5 h-5 ${transaction.points > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{transaction.description}</p>
                      <p className="text-sm text-[#6B6B6B]">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${transaction.points > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-[#9E9E9E] mx-auto mb-3" />
              <p className="text-[#6B6B6B]">No points history yet</p>
              <p className="text-sm text-[#9E9E9E]">Book services to start earning points!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

