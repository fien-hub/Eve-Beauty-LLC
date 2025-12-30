import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Create a new booking
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      providerId,
      providerServiceId,
      bookingDate,
      startTime,
      customerAddress,
      notes,
      totalPrice,
      travelFee,
    } = body

    // Validate required fields
    if (!providerId || !providerServiceId || !bookingDate || !startTime || !customerAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get provider service details
    const { data: providerService } = await supabase
      .from('provider_services')
      .select('duration_minutes')
      .eq('id', providerServiceId)
      .single()

    if (!providerService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + providerService.duration_minutes * 60000)
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

    // Create booking using correct column names from database schema
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        provider_id: providerId,
        provider_service_id: providerServiceId,
        scheduled_date: bookingDate,
        scheduled_time: startTime,
        address: customerAddress,
        notes,
        total_price: totalPrice,
        travel_fee: travelFee || 0,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // Create notification for provider
    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('user_id')
      .eq('id', providerId)
      .single()

    if (provider) {
      await supabase.from('notifications').insert({
        user_id: provider.user_id,
        type: 'new_booking',
        title: 'New Booking Request',
        message: `You have a new booking request for ${bookingDate}`,
        data: { bookingId: booking.id },
      })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'customer'

    let query = supabase
      .from('bookings')
      .select(`
        *,
        provider_services (base_price, duration_minutes, services (name)),
        provider_profiles (business_name, user_id),
        customer:customer_profiles!bookings_customer_id_fkey (
          profiles!customer_profiles_id_fkey (first_name, last_name, avatar_url)
        )
      `)
      .order('scheduled_date', { ascending: false })

    if (role === 'provider') {
      const { data: provider } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (provider) {
        query = query.eq('provider_id', provider.id)
      }
    } else {
      query = query.eq('customer_id', user.id)
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

