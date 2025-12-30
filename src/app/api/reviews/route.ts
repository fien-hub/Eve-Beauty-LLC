import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Create a review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, providerId, rating, comment, photos } = body

    if (!providerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    // If bookingId provided, verify the booking belongs to user and is completed
    if (bookingId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, status, customer_id')
        .eq('id', bookingId)
        .single()

      if (!booking || booking.customer_id !== user.id) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      if (booking.status !== 'completed') {
        return NextResponse.json(
          { error: 'Can only review completed bookings' },
          { status: 400 }
        )
      }

      // Check if already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .single()

      if (existingReview) {
        return NextResponse.json(
          { error: 'Already reviewed this booking' },
          { status: 400 }
        )
      }
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        customer_id: user.id,
        provider_id: providerId,
        booking_id: bookingId || null,
        rating,
        comment: comment || null,
        photos: photos || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    // Update provider's average rating
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', providerId)

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

      await supabase
        .from('provider_profiles')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          total_reviews: reviews.length,
        })
        .eq('id', providerId)
    }

    // Notify provider
    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('user_id')
      .eq('id', providerId)
      .single()

    if (provider) {
      await supabase.from('notifications').insert({
        user_id: provider.user_id,
        type: 'new_review',
        title: 'New Review',
        message: `You received a ${rating}-star review!`,
        data: { reviewId: review.id },
      })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get reviews for a provider
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:customer_profiles!reviews_customer_id_fkey (
          profiles!customer_profiles_id_fkey (first_name, last_name, avatar_url)
        )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

