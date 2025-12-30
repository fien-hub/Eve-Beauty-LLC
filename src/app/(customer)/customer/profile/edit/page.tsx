'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, Card, LoadingState } from '@/components/ui'
import { ArrowLeft, Camera, User, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

interface ProfileForm {
  first_name: string
  last_name: string
  phone: string
  avatar_url: string | null
}

export default function EditProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    phone: '',
    avatar_url: null,
  })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url,
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
        })
        .eq('id', user.id)

      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/customer/profile'), 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${user.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setForm({ ...form, avatar_url: publicUrl })
    } catch (error) {
      console.error('Error uploading avatar:', error)
    }
  }

  if (loading) return <LoadingState message="Loading profile..." />

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/customer/profile" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" />
          </Link>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Edit Profile</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar src={form.avatar_url} name={`${form.first_name} ${form.last_name}`.trim() || 'User'} size="2xl" />
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#F4B5A4] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#E89580] transition-colors">
              <Camera className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-[#FEE2E2] border border-[#EF4444] rounded-xl text-[#EF4444] text-sm">{error}</div>}
            {success && <div className="p-3 bg-[#D1FAE5] border border-[#10B981] rounded-xl text-[#10B981] text-sm">Profile updated successfully!</div>}

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Your first name" className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Your last name" className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input type="email" value={email} disabled className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-xl bg-[#F7F7F7] text-[#9E9E9E]" />
              </div>
              <p className="text-xs text-[#9E9E9E] mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
              </div>
            </div>

            <Button type="submit" isLoading={saving} className="w-full">Save Changes</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

