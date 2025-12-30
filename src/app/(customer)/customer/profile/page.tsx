'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar, Badge, Card, LoadingState } from '@/components/ui'
import { 
  User, Edit, Calendar, Heart, CreditCard, Star, 
  Bell, HelpCircle, LogOut, ChevronRight, Bookmark
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  phone: string | null
  loyalty_points: number
  created_at: string
}

interface Stats {
  totalBookings: number
  completedBookings: number
  totalReviews: number
  favoritesCount: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<Stats>({ totalBookings: 0, completedBookings: 0, totalReviews: 0, favoritesCount: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({ ...profileData, email: user.email || '' })
      }

      // Fetch stats
      const [bookingsRes, reviewsRes, favoritesRes] = await Promise.all([
        supabase.from('bookings').select('id, status', { count: 'exact' }).eq('customer_id', user.id),
        supabase.from('reviews').select('id', { count: 'exact' }).eq('customer_id', user.id),
        supabase.from('favorite_providers').select('id', { count: 'exact' }).eq('customer_id', user.id),
      ])

      const completedCount = bookingsRes.data?.filter(b => b.status === 'completed').length || 0
      setStats({
        totalBookings: bookingsRes.count || 0,
        completedBookings: completedCount,
        totalReviews: reviewsRes.count || 0,
        favoritesCount: favoritesRes.count || 0,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const [deleting, setDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your data including bookings, messages, and saved posts will be permanently deleted.'
    )

    if (!confirmed) return

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    )

    if (doubleConfirm !== 'DELETE') {
      alert('Account deletion cancelled.')
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      alert('Your account has been successfully deleted.')
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please contact support.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingState message="Loading profile..." />
  if (!profile) return <div className="p-8 text-center">Profile not found</div>

  const menuItems = [
    { icon: Edit, label: 'Edit Profile', href: '/customer/profile/edit' },
    { icon: Calendar, label: 'My Bookings', href: '/customer/bookings', badge: stats.totalBookings },
    { icon: Heart, label: 'Favorites', href: '/customer/favorites', badge: stats.favoritesCount },
    { icon: Bookmark, label: 'Saved Posts', href: '/customer/saved-posts' },
    { icon: CreditCard, label: 'Payment Methods', href: '/customer/payment-methods' },
    { icon: Bell, label: 'Notifications', href: '/customer/settings/notifications' },
    { icon: HelpCircle, label: 'Help & Support', href: '/customer/help' },
  ]

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header with avatar */}
      <div className="bg-gradient-to-br from-[#F4B5A4] to-[#E89580] pt-8 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Avatar src={profile.avatar_url} name={`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'} size="2xl" className="mx-auto mb-4 ring-4 ring-white" />
          <h1 className="text-2xl font-bold text-white mb-1">{`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'}</h1>
          <p className="text-white/80">{profile.email}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge variant="primary" className="bg-white/20 text-white">
              <Star className="w-3 h-3 mr-1" /> {stats.totalReviews} Reviews
            </Badge>
            <Badge variant="primary" className="bg-white/20 text-white">
              Member since {new Date(profile.created_at).getFullYear()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <Card className="grid grid-cols-3 divide-x divide-[#F0F0F0]">
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-[#D97A5F]">{stats.totalBookings}</p>
            <p className="text-sm text-[#6B6B6B]">Bookings</p>
          </div>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-[#D97A5F]">{stats.completedBookings}</p>
            <p className="text-sm text-[#6B6B6B]">Completed</p>
          </div>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-[#D97A5F]">{stats.favoritesCount}</p>
            <p className="text-sm text-[#6B6B6B]">Favorites</p>
          </div>
        </Card>
      </div>

      {/* Menu */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card padding="none" className="divide-y divide-[#F0F0F0]">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center justify-between px-4 py-4 hover:bg-[#F7F7F7] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FEF5F2] rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#D97A5F]" />
                </div>
                <span className="font-medium text-[#1A1A1A]">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && <Badge variant="secondary" size="sm">{item.badge}</Badge>}
                <ChevronRight className="w-5 h-5 text-[#9E9E9E]" />
              </div>
            </Link>
          ))}
        </Card>

        {/* Sign out */}
        <button onClick={handleSignOut} className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-white rounded-2xl text-[#EF4444] font-medium hover:bg-[#FEE2E2] transition-colors">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>

        {/* Delete account */}
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="w-full mt-2 flex items-center justify-center gap-2 py-4 bg-white rounded-2xl text-[#9E9E9E] text-sm font-medium hover:bg-[#F7F7F7] hover:text-[#EF4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? 'Deleting Account...' : 'Delete Account'}
        </button>
      </div>
    </div>
  )
}

