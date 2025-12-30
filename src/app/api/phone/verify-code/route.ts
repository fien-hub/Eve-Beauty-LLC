import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock phone verification store (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone and code are required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if code exists and is not expired
    const storedData = verificationCodes.get(phone)
    if (!storedData) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      )
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(phone)
      return NextResponse.json(
        { error: 'Verification code expired. Please request a new one.' },
        { status: 400 }
      )
    }

    if (storedData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Code is valid, mark phone as verified
    verificationCodes.delete(phone)

    // Update user metadata with verified phone
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        phone_verified: true,
        phone_number: phone,
      },
    })

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      verified: true,
      message: 'Phone number verified successfully',
    })
  } catch (error: any) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
