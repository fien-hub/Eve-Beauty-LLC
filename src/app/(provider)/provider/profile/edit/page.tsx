'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, Save, Loader2 } from 'lucide-react';

export default function EditProviderProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    business_name: '',
    bio: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    avatar_url: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get provider profile data
      const { data: providerProfile } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setFormData({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        business_name: providerProfile?.business_name || '',
        bio: profile?.bio || '',
        phone: profile?.phone || '',
        email: user.email || '',
        address: providerProfile?.address || '',
        city: providerProfile?.city || '',
        state: providerProfile?.state || '',
        zip_code: providerProfile?.zip_code || '',
        avatar_url: providerProfile?.avatar_url || profile?.avatar_url || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update provider_profiles table
      const { error: providerError } = await supabase
        .from('provider_profiles')
        .update({
          business_name: formData.business_name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          avatar_url: formData.avatar_url,
        })
        .eq('id', user.id);

      if (providerError) throw providerError;
      router.push('/provider/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
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
            <h1 className="text-xl font-bold text-[#1A1A1A]">Edit Profile</h1>
          </div>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 bg-[#F4B5A4] text-[#1A1A1A] px-4 py-2 rounded-xl font-semibold hover:bg-[#E89580] transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-6">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#FCE5DF] flex items-center justify-center text-4xl">👤</div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#F4B5A4] flex items-center justify-center hover:bg-[#E89580] transition-colors disabled:opacity-50">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin text-[#1A1A1A]" /> : <Camera className="w-5 h-5 text-[#1A1A1A]" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-[#1A1A1A] mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1">First Name</label>
                <input type="text" value={formData.first_name} onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" placeholder="First name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Last Name</label>
                <input type="text" value={formData.last_name} onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" placeholder="Last name" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Business Name</label>
              <input type="text" value={formData.business_name} onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" placeholder="Your business name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Bio</label>
              <textarea value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} rows={4}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors resize-none" placeholder="Tell customers about yourself and your services..." />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-[#1A1A1A] mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Email</label>
              <input type="email" value={formData.email} disabled
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl bg-[#F7F7F7] text-[#9E9E9E]" />
              <p className="text-xs text-[#9E9E9E] mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Phone Number</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-[#1A1A1A] mb-4">Business Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Street Address</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1">City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1">State</label>
                <input type="text" value={formData.state} onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" placeholder="State" />
              </div>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-[#6B6B6B] mb-1">ZIP Code</label>
              <input type="text" value={formData.zip_code} onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" placeholder="12345" />
            </div>
          </div>
        </div>

        {/* Submit Button (Mobile) */}
        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#F4B5A4] text-[#1A1A1A] py-4 rounded-xl font-bold hover:bg-[#E89580] transition-colors disabled:opacity-50 md:hidden">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

