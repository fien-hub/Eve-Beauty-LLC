import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get user's loyalty info and available promos
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's loyalty points
    const { data: loyalty } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get available promotions
    const { data: promotions } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: true })

    // Get user's redeemed rewards
    const { data: redeemedRewards } = await supabase
      .from('redeemed_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_used', false)
      .order('expires_at', { ascending: true })

    // Get points history
    const { data: pointsHistory } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate tier based on points
    const totalPoints = loyalty?.total_points || 0
    const tier = calculateTier(totalPoints)

    return NextResponse.json({
      loyalty: {
        currentPoints: loyalty?.current_points || 0,
        totalPoints,
        tier,
        tierProgress: getTierProgress(totalPoints),
      },
      promotions,
      redeemedRewards,
      pointsHistory,
    })
  } catch (error) {
    console.error('Loyalty fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch loyalty info' }, { status: 500 })
  }
}

// POST - Redeem points for a reward
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rewardId, pointsCost } = await request.json()

    if (!rewardId || !pointsCost) {
      return NextResponse.json({ error: 'Reward ID and points cost are required' }, { status: 400 })
    }

    // Check user has enough points
    const { data: loyalty } = await supabase
      .from('loyalty_points')
      .select('current_points')
      .eq('user_id', user.id)
      .single()

    if (!loyalty || loyalty.current_points < pointsCost) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Deduct points
    const { error: updateError } = await supabase
      .from('loyalty_points')
      .update({ current_points: loyalty.current_points - pointsCost })
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Create redeemed reward
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 day expiry

    const { data: reward, error: rewardError } = await supabase
      .from('redeemed_rewards')
      .insert({
        user_id: user.id,
        reward_id: rewardId,
        points_spent: pointsCost,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (rewardError) {
      return NextResponse.json({ error: rewardError.message }, { status: 500 })
    }

    // Record transaction
    await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: user.id,
        points: -pointsCost,
        type: 'redemption',
        description: `Redeemed reward`,
      })

    return NextResponse.json({ reward }, { status: 201 })
  } catch (error) {
    console.error('Redeem reward error:', error)
    return NextResponse.json({ error: 'Failed to redeem reward' }, { status: 500 })
  }
}

// Helper functions
function calculateTier(points: number): string {
  if (points >= 10000) return 'Platinum'
  if (points >= 5000) return 'Gold'
  if (points >= 2000) return 'Silver'
  return 'Bronze'
}

function getTierProgress(points: number): { current: number; next: number; percentage: number } {
  const tiers = [
    { name: 'Bronze', threshold: 0 },
    { name: 'Silver', threshold: 2000 },
    { name: 'Gold', threshold: 5000 },
    { name: 'Platinum', threshold: 10000 },
  ]

  let currentTierIndex = 0
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (points >= tiers[i].threshold) {
      currentTierIndex = i
      break
    }
  }

  const currentThreshold = tiers[currentTierIndex].threshold
  const nextThreshold = tiers[currentTierIndex + 1]?.threshold || currentThreshold

  const progressPoints = points - currentThreshold
  const tierRange = nextThreshold - currentThreshold

  return {
    current: progressPoints,
    next: tierRange,
    percentage: tierRange > 0 ? Math.min(100, Math.round((progressPoints / tierRange) * 100)) : 100,
  }
}

