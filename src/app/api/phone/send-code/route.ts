import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock phone verification store (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || !phone.startsWith('+1')) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
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

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code with 10 minute expiration
    verificationCodes.set(phone, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    })

    // In production, send SMS via Twilio, AWS SNS, or similar
    console.log(`[Phone Verification] Code for ${phone}: ${code}`)

    // For development, return the test code
    const isDevelopment = process.env.NODE_ENV === 'development'

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      ...(isDevelopment && { testCode: code }),
    })
  } catch (error: any) {
    console.error('Error sending verification code:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
