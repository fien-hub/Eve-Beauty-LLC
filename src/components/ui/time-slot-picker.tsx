'use client'

import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface TimeSlot {
  time: string // HH:MM format
  available: boolean
}

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedTime: string | null
  onTimeSelect: (time: string) => void
  className?: string
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function TimeSlotPicker({
  slots,
  selectedTime,
  onTimeSelect,
  className,
}: TimeSlotPickerProps) {
  // Group slots by morning, afternoon, evening
  const morning = slots.filter((s) => {
    const hour = parseInt(s.time.split(':')[0])
    return hour < 12
  })
  const afternoon = slots.filter((s) => {
    const hour = parseInt(s.time.split(':')[0])
    return hour >= 12 && hour < 17
  })
  const evening = slots.filter((s) => {
    const hour = parseInt(s.time.split(':')[0])
    return hour >= 17
  })

  const renderSlots = (timeSlots: TimeSlot[], label: string) => {
    if (timeSlots.length === 0) return null

    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-medium text-[#6B6B6B] mb-3">{label}</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onTimeSelect(slot.time)}
              disabled={!slot.available}
              className={cn(
                'py-2.5 px-3 rounded-xl text-sm font-medium transition-all',
                selectedTime === slot.time
                  ? 'bg-[#F4B5A4] text-[#1A1A1A] ring-2 ring-[#D97A5F]'
                  : slot.available
                  ? 'bg-[#F7F7F7] text-[#1A1A1A] hover:bg-[#FEF5F2] hover:text-[#D97A5F]'
                  : 'bg-[#F7F7F7] text-[#E5E5E5] cursor-not-allowed line-through'
              )}
            >
              {formatTime(slot.time)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Clock className="w-12 h-12 text-[#E5E5E5] mx-auto mb-3" />
        <p className="text-[#6B6B6B]">No available time slots for this date</p>
      </div>
    )
  }

  return (
    <div className={cn('', className)}>
      {renderSlots(morning, '🌅 Morning')}
      {renderSlots(afternoon, '☀️ Afternoon')}
      {renderSlots(evening, '🌙 Evening')}
    </div>
  )
}

// Simple time display
interface TimeDisplayProps {
  time: string | null
  placeholder?: string
  className?: string
}

export function TimeDisplay({ time, placeholder = 'Select a time', className }: TimeDisplayProps) {
  if (!time) {
    return <span className={cn('text-[#9E9E9E]', className)}>{placeholder}</span>
  }
  return <span className={cn('text-[#1A1A1A]', className)}>{formatTime(time)}</span>
}

// Generate time slots helper
export function generateTimeSlots(
  startHour: number = 9,
  endHour: number = 18,
  intervalMinutes: number = 30,
  unavailableTimes: string[] = []
): TimeSlot[] {
  const slots: TimeSlot[] = []
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push({
        time,
        available: !unavailableTimes.includes(time),
      })
    }
  }
  
  return slots
}

