'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Bell, Mail, Smartphone, Calendar, Star, DollarSign, MessageCircle, Moon } from 'lucide-react';

export default function ProviderNotificationSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    // Email notifications
    email_new_booking: true,
    email_booking_reminder: true,
    email_booking_cancelled: true,
    email_new_review: true,
    email_new_message: true,
    email_payout_sent: true,
    email_weekly_summary: true,
    // Push notifications
    push_new_booking: true,
    push_booking_reminder: true,
    push_booking_cancelled: true,
    push_new_review: true,
    push_new_message: true,
    push_payout_sent: true,
    // SMS notifications
    sms_new_booking: false,
    sms_booking_reminder: false,
    sms_booking_cancelled: false,
    // Quiet Hours
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: user.id, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[#F4B5A4]' : 'bg-[#E5E5E5]'}`}>
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4B5A4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/provider/profile" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Notification Settings</h1>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#F4B5A4] text-[#1A1A1A] px-4 py-2 rounded-xl font-semibold hover:bg-[#E89580] transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Email Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-[#F4B5A4]" />
            <h2 className="font-bold text-[#1A1A1A]">Email Notifications</h2>
          </div>
          <div className="space-y-4">
            <NotificationRow icon={<Calendar className="w-4 h-4" />} title="New Bookings" desc="When a customer books your service"
              checked={settings.email_new_booking} onChange={() => setSettings(prev => ({ ...prev, email_new_booking: !prev.email_new_booking }))} />
            <NotificationRow icon={<Bell className="w-4 h-4" />} title="Booking Reminders" desc="Reminders before upcoming appointments"
              checked={settings.email_booking_reminder} onChange={() => setSettings(prev => ({ ...prev, email_booking_reminder: !prev.email_booking_reminder }))} />
            <NotificationRow icon={<Calendar className="w-4 h-4" />} title="Cancellations" desc="When a booking is cancelled"
              checked={settings.email_booking_cancelled} onChange={() => setSettings(prev => ({ ...prev, email_booking_cancelled: !prev.email_booking_cancelled }))} />
            <NotificationRow icon={<Star className="w-4 h-4" />} title="New Reviews" desc="When a customer leaves a review"
              checked={settings.email_new_review} onChange={() => setSettings(prev => ({ ...prev, email_new_review: !prev.email_new_review }))} />
            <NotificationRow icon={<MessageCircle className="w-4 h-4" />} title="New Messages" desc="When you receive a message"
              checked={settings.email_new_message} onChange={() => setSettings(prev => ({ ...prev, email_new_message: !prev.email_new_message }))} />
            <NotificationRow icon={<DollarSign className="w-4 h-4" />} title="Payouts" desc="When a payout is sent to your account"
              checked={settings.email_payout_sent} onChange={() => setSettings(prev => ({ ...prev, email_payout_sent: !prev.email_payout_sent }))} />
            <NotificationRow icon={<Bell className="w-4 h-4" />} title="Weekly Summary" desc="Weekly performance summary"
              checked={settings.email_weekly_summary} onChange={() => setSettings(prev => ({ ...prev, email_weekly_summary: !prev.email_weekly_summary }))} />
          </div>
        </div>
        {/* Push Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-[#F4B5A4]" />
            <h2 className="font-bold text-[#1A1A1A]">Push Notifications</h2>
          </div>
          <div className="space-y-4">
            <NotificationRow icon={<Calendar className="w-4 h-4" />} title="New Bookings" desc="Instant alerts for new bookings"
              checked={settings.push_new_booking} onChange={() => setSettings(prev => ({ ...prev, push_new_booking: !prev.push_new_booking }))} />
            <NotificationRow icon={<Bell className="w-4 h-4" />} title="Booking Reminders" desc="Reminders before appointments"
              checked={settings.push_booking_reminder} onChange={() => setSettings(prev => ({ ...prev, push_booking_reminder: !prev.push_booking_reminder }))} />
            <NotificationRow icon={<Calendar className="w-4 h-4" />} title="Cancellations" desc="Alerts when bookings are cancelled"
              checked={settings.push_booking_cancelled} onChange={() => setSettings(prev => ({ ...prev, push_booking_cancelled: !prev.push_booking_cancelled }))} />
            <NotificationRow icon={<Star className="w-4 h-4" />} title="New Reviews" desc="Alerts for new customer reviews"
              checked={settings.push_new_review} onChange={() => setSettings(prev => ({ ...prev, push_new_review: !prev.push_new_review }))} />
            <NotificationRow icon={<MessageCircle className="w-4 h-4" />} title="New Messages" desc="Instant message alerts"
              checked={settings.push_new_message} onChange={() => setSettings(prev => ({ ...prev, push_new_message: !prev.push_new_message }))} />
            <NotificationRow icon={<DollarSign className="w-4 h-4" />} title="Payouts" desc="Alerts when payouts are sent"
              checked={settings.push_payout_sent} onChange={() => setSettings(prev => ({ ...prev, push_payout_sent: !prev.push_payout_sent }))} />
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-[#F4B5A4]" />
            <h2 className="font-bold text-[#1A1A1A]">SMS Notifications</h2>
          </div>
          <p className="text-sm text-[#6B6B6B] mb-4">Standard messaging rates may apply</p>
          <div className="space-y-4">
            <NotificationRow icon={<Calendar className="w-4 h-4" />} title="New Bookings" desc="SMS for new bookings"
              checked={settings.sms_new_booking} onChange={() => setSettings(prev => ({ ...prev, sms_new_booking: !prev.sms_new_booking }))} />
            <NotificationRow icon={<Bell className="w-4 h-4" />} title="Booking Reminders" desc="SMS reminders before appointments"
              checked={settings.sms_booking_reminder} onChange={() => setSettings(prev => ({ ...prev, sms_booking_reminder: !prev.sms_booking_reminder }))} />
            <NotificationRow icon={<Calendar className="w-4 h-4" />} title="Cancellations" desc="SMS for booking cancellations"
              checked={settings.sms_booking_cancelled} onChange={() => setSettings(prev => ({ ...prev, sms_booking_cancelled: !prev.sms_booking_cancelled }))} />
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-[#F4B5A4]" />
            <h2 className="font-bold text-[#1A1A1A]">Quiet Hours</h2>
          </div>
          <p className="text-sm text-[#6B6B6B] mb-4">Mute non-urgent notifications during specific hours</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#E5E5E5]">
              <div>
                <p className="font-medium text-[#1A1A1A]">Enable Quiet Hours</p>
                <p className="text-sm text-[#6B6B6B]">No notifications during quiet hours</p>
              </div>
              <button type="button" onClick={() => setSettings(prev => ({ ...prev, quiet_hours_enabled: !prev.quiet_hours_enabled }))}
                className={`w-12 h-6 rounded-full transition-colors ${settings.quiet_hours_enabled ? 'bg-[#F4B5A4]' : 'bg-[#E5E5E5]'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.quiet_hours_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {settings.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Start Time</label>
                  <input type="time" value={settings.quiet_hours_start} onChange={(e) => setSettings(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B6B6B] mb-1">End Time</label>
                  <input type="time" value={settings.quiet_hours_end} onChange={(e) => setSettings(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                    className="w-full px-4 py-2 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button (Mobile) */}
        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#F4B5A4] text-[#1A1A1A] py-4 rounded-xl font-bold hover:bg-[#E89580] transition-colors disabled:opacity-50 md:hidden">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function NotificationRow({ icon, title, desc, checked, onChange }: { icon: React.ReactNode; title: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E5E5E5] last:border-0">
      <div className="flex items-center gap-3">
        <div className="text-[#9E9E9E]">{icon}</div>
        <div>
          <p className="font-medium text-[#1A1A1A]">{title}</p>
          <p className="text-sm text-[#6B6B6B]">{desc}</p>
        </div>
      </div>
      <button type="button" onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[#F4B5A4]' : 'bg-[#E5E5E5]'}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

