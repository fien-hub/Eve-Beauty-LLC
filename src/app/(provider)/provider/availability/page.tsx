'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, Badge, LoadingState, Button, Modal } from '@/components/ui'
import { Calendar, Clock, Plus, X, Save } from 'lucide-react'

interface DaySchedule {
  day: string
  enabled: boolean
  start: string
  end: string
}

interface BlockedDate {
  id: string
  date: string
  reason: string | null
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7
  const min = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${min}`
})

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map(day => ({ day, enabled: day !== 'Sunday', start: '09:00', end: '17:00' }))
  )
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockForm, setBlockForm] = useState({ date: '', reason: '' })
  const supabase = createClient()

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch weekly schedule
      const { data: scheduleData } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', user.id)

      if (scheduleData?.length) {
        setSchedule(DAYS.map(day => {
          const found = scheduleData.find(s => s.day_of_week === day)
          return found 
            ? { day, enabled: found.is_available, start: found.start_time, end: found.end_time }
            : { day, enabled: false, start: '09:00', end: '17:00' }
        }))
      }

      // Fetch blocked dates
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('provider_id', user.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')

      setBlockedDates(blocked || [])
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete existing and insert new
      await supabase.from('provider_availability').delete().eq('provider_id', user.id)
      
      const rows = schedule.map(s => ({
        provider_id: user.id,
        day_of_week: s.day,
        is_available: s.enabled,
        start_time: s.start,
        end_time: s.end,
      }))
      
      await supabase.from('provider_availability').insert(rows)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleBlockDate = async () => {
    if (!blockForm.date) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('blocked_dates')
        .insert({ provider_id: user.id, date: blockForm.date, reason: blockForm.reason || null })
        .select()
        .single()

      if (error) throw error
      if (data) setBlockedDates([...blockedDates, data])
      setShowBlockModal(false)
      setBlockForm({ date: '', reason: '' })
    } catch (error) {
      console.error('Error blocking date:', error)
    }
  }

  const handleUnblock = async (id: string) => {
    try {
      await supabase.from('blocked_dates').delete().eq('id', id)
      setBlockedDates(blockedDates.filter(b => b.id !== id))
    } catch (error) {
      console.error('Error unblocking:', error)
    }
  }

  const updateDay = (day: string, updates: Partial<DaySchedule>) => {
    setSchedule(schedule.map(s => s.day === day ? { ...s, ...updates } : s))
  }

  if (loading) return <LoadingState message="Loading availability..." />

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEF5F2] rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#D97A5F]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Availability</h1>
          </div>
          <Button onClick={handleSave} isLoading={saving}><Save className="w-4 h-4 mr-2" />Save</Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Weekly schedule */}
        <Card>
          <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D97A5F]" /> Weekly Schedule
          </h3>
          <div className="space-y-3">
            {schedule.map((day) => (
              <div key={day.day} className="flex items-center gap-3">
                <label className="flex items-center gap-2 w-28">
                  <input type="checkbox" checked={day.enabled} onChange={(e) => updateDay(day.day, { enabled: e.target.checked })} className="w-4 h-4 rounded border-[#E5E5E5] text-[#F4B5A4] focus:ring-[#F4B5A4]" />
                  <span className={`text-sm ${day.enabled ? 'text-[#1A1A1A]' : 'text-[#9E9E9E]'}`}>{day.day.slice(0, 3)}</span>
                </label>
                {day.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <select value={day.start} onChange={(e) => updateDay(day.day, { start: e.target.value })} className="px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:border-[#F4B5A4] focus:outline-none">
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-[#9E9E9E]">to</span>
                    <select value={day.end} onChange={(e) => updateDay(day.day, { end: e.target.value })} className="px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:border-[#F4B5A4] focus:outline-none">
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="text-sm text-[#9E9E9E]">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Blocked dates */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1A1A1A]">Blocked Dates</h3>
            <Button size="sm" variant="outline" onClick={() => setShowBlockModal(true)}><Plus className="w-4 h-4 mr-1" />Block Date</Button>
          </div>
          {blockedDates.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-4">No blocked dates</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div key={blocked.id} className="flex items-center justify-between p-3 bg-[#FEE2E2] rounded-xl">
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{new Date(blocked.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    {blocked.reason && <p className="text-sm text-[#6B6B6B]">{blocked.reason}</p>}
                  </div>
                  <button onClick={() => handleUnblock(blocked.id)} className="p-1 hover:bg-[#FCA5A5] rounded-full transition-colors">
                    <X className="w-4 h-4 text-[#EF4444]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Block date modal */}
      <Modal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} title="Block a Date">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Date</label>
            <input type="date" value={blockForm.date} onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Reason (optional)</label>
            <input type="text" value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} placeholder="e.g., Vacation, Personal day" className="w-full px-4 py-2 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowBlockModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleBlockDate} disabled={!blockForm.date} className="flex-1">Block Date</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

