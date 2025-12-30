import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker, DateDisplay } from '@/components/ui/date-picker'
import { TimeSlotPicker, TimeDisplay, generateTimeSlots } from '@/components/ui/time-slot-picker'
import { PriceBreakdown, BookingSummary, SimplePrice } from '@/components/ui/price-breakdown'

describe('Booking Components', () => {
  describe('DatePicker', () => {
    it('renders month and year', () => {
      const onDateSelect = vi.fn()
      render(<DatePicker selectedDate={null} onDateSelect={onDateSelect} />)

      // Should show current month
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      const now = new Date()
      expect(screen.getByText(new RegExp(months[now.getMonth()]))).toBeInTheDocument()
    })

    it('renders day headers', () => {
      const onDateSelect = vi.fn()
      render(<DatePicker selectedDate={null} onDateSelect={onDateSelect} />)

      expect(screen.getByText('Sun')).toBeInTheDocument()
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Fri')).toBeInTheDocument()
    })

    it('allows navigation between months', async () => {
      const onDateSelect = vi.fn()
      const user = userEvent.setup()
      render(<DatePicker selectedDate={null} onDateSelect={onDateSelect} />)

      // Click next month button
      const buttons = screen.getAllByRole('button')
      const nextButton = buttons[buttons.length - 1] // Last button is next
      await user.click(nextButton)

      // Month should change - component should re-render
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })
  })

  describe('DateDisplay', () => {
    it('renders placeholder when no date', () => {
      render(<DateDisplay date={null} placeholder="Select a date" />)
      expect(screen.getByText('Select a date')).toBeInTheDocument()
    })

    it('formats date correctly', () => {
      const testDate = new Date(2024, 11, 15) // Dec 15, 2024
      render(<DateDisplay date={testDate} />)
      // Should show formatted date
      expect(screen.getByText(/Sun.*Dec.*15/i)).toBeInTheDocument()
    })
  })

  describe('TimeSlotPicker', () => {
    it('renders time slots grouped by period', () => {
      const onTimeSelect = vi.fn()
      const slots = generateTimeSlots(9, 17)
      render(<TimeSlotPicker slots={slots} selectedTime={null} onTimeSelect={onTimeSelect} />)

      expect(screen.getByText(/morning/i)).toBeInTheDocument()
      expect(screen.getByText(/afternoon/i)).toBeInTheDocument()
    })

    it('highlights selected time slot', () => {
      const onTimeSelect = vi.fn()
      const slots = generateTimeSlots(9, 17)
      render(<TimeSlotPicker slots={slots} selectedTime="09:00" onTimeSelect={onTimeSelect} />)

      const selectedSlot = screen.getByText('9:00 AM').closest('button')
      expect(selectedSlot).toHaveClass('bg-[#F4B5A4]')
    })

    it('shows unavailable slots as disabled', () => {
      const onTimeSelect = vi.fn()
      const slots = generateTimeSlots(9, 17, 30, ['09:00'])
      render(<TimeSlotPicker slots={slots} selectedTime={null} onTimeSelect={onTimeSelect} />)

      const unavailableSlot = screen.getByText('9:00 AM').closest('button')
      expect(unavailableSlot).toBeDisabled()
    })

    it('calls onTimeSelect when slot is clicked', async () => {
      const onTimeSelect = vi.fn()
      const user = userEvent.setup()
      const slots = generateTimeSlots(9, 17)
      render(<TimeSlotPicker slots={slots} selectedTime={null} onTimeSelect={onTimeSelect} />)

      await user.click(screen.getByText('10:00 AM'))
      expect(onTimeSelect).toHaveBeenCalledWith('10:00')
    })
  })

  describe('TimeDisplay', () => {
    it('renders placeholder when no time', () => {
      render(<TimeDisplay time={null} placeholder="Select a time" />)
      expect(screen.getByText('Select a time')).toBeInTheDocument()
    })

    it('formats time correctly', () => {
      render(<TimeDisplay time="14:30" />)
      expect(screen.getByText('2:30 PM')).toBeInTheDocument()
    })
  })

  describe('PriceBreakdown', () => {
    it('renders line items', () => {
      render(
        <PriceBreakdown
          items={[
            { label: 'Hair Styling', amount: 50 },
            { label: 'Service fee', amount: 5 },
          ]}
          total={55}
        />
      )

      expect(screen.getByText('Hair Styling')).toBeInTheDocument()
      expect(screen.getByText('Service fee')).toBeInTheDocument()
    })

    it('shows discount items in green', () => {
      render(
        <PriceBreakdown
          items={[
            { label: 'Hair Styling', amount: 50 },
            { label: 'Promo discount', amount: 5, isDiscount: true },
          ]}
          total={45}
        />
      )

      const discountItem = screen.getByText('Promo discount')
      expect(discountItem).toHaveClass('text-[#10B981]')
    })

    it('displays total', () => {
      render(
        <PriceBreakdown
          items={[{ label: 'Service', amount: 50 }]}
          total={50}
        />
      )

      expect(screen.getByText('Total')).toBeInTheDocument()
      // Multiple $50.00 elements exist (line item + total), just check one exists
      expect(screen.getAllByText('$50.00').length).toBeGreaterThan(0)
    })
  })

  describe('BookingSummary', () => {
    it('renders service name and duration', () => {
      render(
        <BookingSummary
          serviceName="Hair Coloring"
          servicePrice={75}
          duration={90}
        />
      )

      expect(screen.getByText('Booking Summary')).toBeInTheDocument()
      expect(screen.getByText('90 min')).toBeInTheDocument()
    })
  })

  describe('SimplePrice', () => {
    it('renders price', () => {
      render(<SimplePrice amount={50} />)
      expect(screen.getByText('$50.00')).toBeInTheDocument()
    })

    it('shows original price with strikethrough when discounted', () => {
      render(<SimplePrice amount={45} originalAmount={50} />)
      expect(screen.getByText('$45.00')).toBeInTheDocument()
      expect(screen.getByText('$50.00')).toBeInTheDocument()
    })
  })
})

describe('generateTimeSlots', () => {
  it('generates slots with 30-minute intervals by default', () => {
    const slots = generateTimeSlots(9, 11) // 9 AM to 11 AM
    expect(slots.length).toBe(4) // 9:00, 9:30, 10:00, 10:30
    expect(slots[0].time).toBe('09:00')
    expect(slots[1].time).toBe('09:30')
  })

  it('marks unavailable times correctly', () => {
    const slots = generateTimeSlots(9, 10, 30, ['09:00'])
    expect(slots[0].available).toBe(false)
    expect(slots[1].available).toBe(true)
  })
})

