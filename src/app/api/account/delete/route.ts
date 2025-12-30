import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Placeholder values for build/demo when env vars are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Use service role key for admin operations (delete auth users)
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Delete all related data in order (respecting foreign key constraints)
    // Using admin client for deletion operations
    
    // 1. Delete reviews (both as customer and provider)
    await supabaseAdmin.from('reviews').delete().eq('customer_id', userId)
    await supabaseAdmin.from('reviews').delete().eq('provider_id', userId)

    // 2. Delete messages and conversations
    await supabaseAdmin.from('messages').delete().eq('sender_id', userId)
    await supabaseAdmin.from('messages').delete().eq('receiver_id', userId)
    await supabaseAdmin.from('conversations').delete().eq('customer_id', userId)
    await supabaseAdmin.from('conversations').delete().eq('provider_id', userId)

    // 3. Delete saved posts and favorites
    await supabaseAdmin.from('saved_posts').delete().eq('user_id', userId)
    await supabaseAdmin.from('favorite_providers').delete().eq('customer_id', userId)
    await supabaseAdmin.from('post_likes').delete().eq('user_id', userId)

    // 4. Delete notifications
    await supabaseAdmin.from('notifications').delete().eq('user_id', userId)

    // 5. Get booking IDs for this user
    const { data: userBookings } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .or(`customer_id.eq.${userId},provider_id.eq.${userId}`)

    // 6. Delete payments related to user's bookings
    if (userBookings && userBookings.length > 0) {
      const bookingIds = userBookings.map(b => b.id)
      await supabaseAdmin.from('payments').delete().in('booking_id', bookingIds)
    }

    // 7. Delete bookings (both as customer and provider)
    await supabaseAdmin.from('bookings').delete().eq('customer_id', userId)
    await supabaseAdmin.from('bookings').delete().eq('provider_id', userId)

    // 8. Delete portfolio items
    await supabaseAdmin.from('portfolio_items').delete().eq('provider_id', userId)

    // 9. Delete provider services and availability
    await supabaseAdmin.from('provider_services').delete().eq('provider_id', userId)
    await supabaseAdmin.from('provider_availability').delete().eq('provider_id', userId)

    // 10. Delete provider verification
    await supabaseAdmin.from('provider_verifications').delete().eq('provider_id', userId)

    // 11. Delete role-specific profiles
    await supabaseAdmin.from('customer_profiles').delete().eq('id', userId)
    await supabaseAdmin.from('provider_profiles').delete().eq('id', userId)

    // 12. Delete main profile
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    // 13. Delete the auth user (must be done with admin client)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      return NextResponse.json(
        { error: 'Failed to delete authentication account' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

