import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, paymentIntentId } = body

    // Get booking to verify ownership
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, provider_profiles (user_id)')
      .eq('id', id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is customer or provider of this booking
    const isCustomer = booking.customer_id === user.id
    const isProvider = (booking.provider_profiles as { user_id?: string })?.user_id === user.id

    if (!isCustomer && !isProvider) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed'],
      completed: [],
      cancelled: [],
    }

    if (status && !validTransitions[booking.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${booking.status} to ${status}` },
        { status: 400 }
      )
    }

    // Update booking
    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (paymentIntentId) {
      updateData.payment_intent_id = paymentIntentId
      updateData.payment_status = 'paid'
    }

    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
    }

    // Send notification based on status change
    if (status) {
      const notificationUserId = isProvider ? booking.customer_id : (booking.provider_profiles as { user_id?: string })?.user_id
      const messages: Record<string, { title: string; message: string }> = {
        confirmed: { title: 'Booking Confirmed', message: 'Your booking has been confirmed!' },
        cancelled: { title: 'Booking Cancelled', message: 'Your booking has been cancelled.' },
        in_progress: { title: 'Service Started', message: 'Your service has started!' },
        completed: { title: 'Service Completed', message: 'Your service has been completed!' },
      }

      if (messages[status] && notificationUserId) {
        await supabase.from('notifications').insert({
          user_id: notificationUserId,
          type: `booking_${status}`,
          title: messages[status].title,
          message: messages[status].message,
          data: { bookingId: id },
        })
      }
    }

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        provider_services (base_price, duration_minutes, services (name, category)),
        provider_profiles (business_name, user_id, bio),
        customer:customer_profiles!bookings_customer_id_fkey (
          profiles!customer_profiles_id_fkey (first_name, last_name, avatar_url, phone)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify user has access to this booking
    const isCustomer = booking.customer_id === user.id
    const isProvider = (booking.provider_profiles as { user_id?: string })?.user_id === user.id

    if (!isCustomer && !isProvider) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

