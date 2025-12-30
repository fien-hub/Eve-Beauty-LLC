import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get provider availability
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const providerId = searchParams.get('providerId')
  const date = searchParams.get('date') // YYYY-MM-DD
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    const supabase = await createClient()

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 })
    }

    // Get provider's regular availability schedule
    const { data: schedule } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', providerId)
      .order('day_of_week', { ascending: true })

    // Get blocked dates/times
    const { data: blockedTimes } = await supabase
      .from('provider_blocked_times')
      .select('*')
      .eq('provider_id', providerId)
      .gte('date', startDate || date || new Date().toISOString().split('T')[0])
      .lte('date', endDate || date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    // Get existing bookings to show as unavailable
    let bookingsQuery = supabase
      .from('bookings')
      .select('booking_date, booking_time, provider_services (duration_minutes)')
      .eq('provider_id', providerId)
      .in('status', ['pending', 'confirmed', 'in_progress'])

    if (date) {
      bookingsQuery = bookingsQuery.eq('booking_date', date)
    } else if (startDate && endDate) {
      bookingsQuery = bookingsQuery.gte('booking_date', startDate).lte('booking_date', endDate)
    }

    const { data: existingBookings } = await bookingsQuery

    // Build available slots for the requested date
    let availableSlots: string[] = []
    
    if (date && schedule) {
      const dayOfWeek = new Date(date).getDay()
      const daySchedule = schedule.find(s => s.day_of_week === dayOfWeek)
      
      if (daySchedule && daySchedule.is_available) {
        // Generate time slots
        const start = parseTime(daySchedule.start_time)
        const end = parseTime(daySchedule.end_time)
        const slotDuration = 30 // 30 minute slots
        
        for (let time = start; time < end; time += slotDuration) {
          const timeStr = formatTime(time)
          
          // Check if slot is booked
          const isBooked = existingBookings?.some((b: any) => {
            const bookingStart = parseTime(b.booking_time)
            // Handle array or single object from Supabase
            const providerService = Array.isArray(b.provider_services) ? b.provider_services[0] : b.provider_services
            const bookingDuration = providerService?.duration_minutes || 60
            const bookingEnd = bookingStart + bookingDuration
            return time >= bookingStart && time < bookingEnd
          })
          
          // Check if slot is blocked
          const isBlocked = blockedTimes?.some(bt => 
            bt.date === date && 
            (!bt.start_time || (parseTime(bt.start_time) <= time && parseTime(bt.end_time) > time))
          )
          
          if (!isBooked && !isBlocked) {
            availableSlots.push(timeStr)
          }
        }
      }
    }

    return NextResponse.json({
      schedule,
      blockedTimes,
      existingBookings: existingBookings?.map((b: any) => {
        // Handle array or single object from Supabase
        const providerService = Array.isArray(b.provider_services) ? b.provider_services[0] : b.provider_services
        return {
          date: b.booking_date,
          time: b.booking_time,
          duration: providerService?.duration_minutes || 60
        }
      }),
      availableSlots,
    })
  } catch (error) {
    console.error('Availability fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

// POST - Update provider availability
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { schedule } = await request.json()

    if (!schedule || !Array.isArray(schedule)) {
      return NextResponse.json({ error: 'Schedule is required' }, { status: 400 })
    }

    // Delete existing schedule
    await supabase
      .from('provider_availability')
      .delete()
      .eq('provider_id', user.id)

    // Insert new schedule
    const { error } = await supabase
      .from('provider_availability')
      .insert(schedule.map((s: { day_of_week: number; is_available: boolean; start_time: string; end_time: string }) => ({
        provider_id: user.id,
        day_of_week: s.day_of_week,
        is_available: s.is_available,
        start_time: s.start_time,
        end_time: s.end_time,
      })))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update availability error:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}

// Helper functions
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

