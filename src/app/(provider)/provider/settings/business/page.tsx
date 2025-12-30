'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, MapPin, Clock, DollarSign, FileText } from 'lucide-react';

export default function BusinessSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    service_radius: 10,
    travel_fee_per_mile: 0,
    free_travel_radius: 5,
    cancellation_policy: 'flexible',
    cancellation_hours: 24,
    cancellation_fee_percent: 50,
    min_booking_notice: 2,
    max_booking_advance: 30,
    instant_booking: true,
    deposit_required: false,
    deposit_percent: 25,
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
        .from('provider_settings')
        .select('*')
        .eq('provider_id', user.id)
        .single();

      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
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
        .from('provider_settings')
        .upsert({
          provider_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'provider_id' });

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-xl font-bold text-[#1A1A1A]">Business Settings</h1>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#F4B5A4] text-[#1A1A1A] px-4 py-2 rounded-xl font-semibold hover:bg-[#E89580] transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Service Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-[#F4B5A4]" />
            <h2 className="font-bold text-[#1A1A1A]">Service Area & Travel</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Service Radius (miles)</label>
              <input type="number" value={settings.service_radius} onChange={(e) => setSettings(prev => ({ ...prev, service_radius: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Free Travel Radius (miles)</label>
              <input type="number" value={settings.free_travel_radius} onChange={(e) => setSettings(prev => ({ ...prev, free_travel_radius: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Travel Fee (per mile beyond free radius)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]">$</span>
                <input type="number" step="0.5" value={settings.travel_fee_per_mile} onChange={(e) => setSettings(prev => ({ ...prev, travel_fee_per_mile: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[#F4B5A4]" />
            <h2 className="font-bold text-[#1A1A1A]">Cancellation Policy</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-2">Policy Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['flexible', 'moderate', 'strict'].map((policy) => (
                  <button key={policy} type="button" onClick={() => setSettings(prev => ({ ...prev, cancellation_policy: policy }))}
                    className={`py-3 rounded-xl font-medium capitalize transition-colors ${settings.cancellation_policy === policy ? 'bg-[#F4B5A4] text-[#1A1A1A]' : 'bg-[#F7F7F7] text-[#6B6B6B] hover:bg-[#E5E5E5]'}`}>
                    {policy}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Cancellation Notice (hours)</label>
              <input type="number" value={settings.cancellation_hours} onChange={(e) => setSettings(prev => ({ ...prev, cancellation_hours: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Late Cancellation Fee (%)</label>
              <input type="number" value={settings.cancellation_fee_percent} onChange={(e) => setSettings(prev => ({ ...prev, cancellation_fee_percent: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
            </div>
          </div>
        </div>
        {/* Booking Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-[#F4B5A4]" />
            <h2 className="font-bold text-[#1A1A1A]">Booking Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Minimum Booking Notice (hours)</label>
              <input type="number" value={settings.min_booking_notice} onChange={(e) => setSettings(prev => ({ ...prev, min_booking_notice: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Maximum Advance Booking (days)</label>
              <input type="number" value={settings.max_booking_advance} onChange={(e) => setSettings(prev => ({ ...prev, max_booking_advance: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-[#E5E5E5]">
              <div>
                <p className="font-medium text-[#1A1A1A]">Instant Booking</p>
                <p className="text-sm text-[#6B6B6B]">Allow customers to book without approval</p>
              </div>
              <button type="button" onClick={() => setSettings(prev => ({ ...prev, instant_booking: !prev.instant_booking }))}
                className={`w-12 h-6 rounded-full transition-colors ${settings.instant_booking ? 'bg-[#F4B5A4]' : 'bg-[#E5E5E5]'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.instant_booking ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-[#F4B5A4]" />
            <h2 className="font-bold text-[#1A1A1A]">Payment Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-[#1A1A1A]">Require Deposit</p>
                <p className="text-sm text-[#6B6B6B]">Collect a deposit when booking is made</p>
              </div>
              <button type="button" onClick={() => setSettings(prev => ({ ...prev, deposit_required: !prev.deposit_required }))}
                className={`w-12 h-6 rounded-full transition-colors ${settings.deposit_required ? 'bg-[#F4B5A4]' : 'bg-[#E5E5E5]'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.deposit_required ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {settings.deposit_required && (
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Deposit Amount (%)</label>
                <input type="number" value={settings.deposit_percent} onChange={(e) => setSettings(prev => ({ ...prev, deposit_percent: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
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

