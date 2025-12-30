'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface DatePickerProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  className?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date, disabledDates?: Date[]): boolean {
  if (minDate && date < minDate) return true
  if (maxDate && date > maxDate) return true
  if (disabledDates?.some(d => isSameDay(d, date))) return true
  return false
}

export function DatePicker({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  disabledDates,
  className,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const days: (Date | null)[] = []
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className={cn('bg-white rounded-2xl p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#6B6B6B]" />
        </button>
        <h3 className="font-semibold text-[#1A1A1A]">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-[#9E9E9E] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isToday = isSameDay(date, today)
          const isDisabled = isDateDisabled(date, minDate, maxDate, disabledDates)
          const isPast = date < today

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isDisabled && !isPast && onDateSelect(date)}
              disabled={isDisabled || isPast}
              className={cn(
                'aspect-square flex items-center justify-center text-sm font-medium rounded-full transition-all',
                isSelected && 'bg-[#F4B5A4] text-[#1A1A1A]',
                !isSelected && isToday && 'ring-2 ring-[#F4B5A4] ring-inset',
                !isSelected && !isToday && !isDisabled && !isPast && 'hover:bg-[#FEF5F2]',
                (isDisabled || isPast) && 'text-[#E5E5E5] cursor-not-allowed',
                !isSelected && !isDisabled && !isPast && 'text-[#1A1A1A]'
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Inline date display
interface DateDisplayProps {
  date: Date | null
  placeholder?: string
  className?: string
}

export function DateDisplay({ date, placeholder = 'Select a date', className }: DateDisplayProps) {
  if (!date) {
    return <span className={cn('text-[#9E9E9E]', className)}>{placeholder}</span>
  }
  return (
    <span className={cn('text-[#1A1A1A]', className)}>
      {date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })}
    </span>
  )
}

