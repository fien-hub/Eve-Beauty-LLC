'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  User, Edit, Calendar, DollarSign, Star, Users, MapPin, Bell, Settings, 
  Shield, Lock, Camera, Heart, Eye, ChevronRight, LogOut, Briefcase, Car
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalReviews: number;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  caption: string | null;
  like_count: number;
  view_count: number;
}

export default function ProviderProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0, upcomingBookings: 0, completedBookings: 0,
    totalEarnings: 0, monthlyEarnings: 0, averageRating: 0, totalReviews: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(profileData);

      // Fetch portfolio items
      if (profileData) {
        const { data: portfolio } = await supabase
          .from('portfolio_items')
          .select('id, image_url, caption, like_count, view_count')
          .eq('provider_id', profileData.id)
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
          .limit(6);
        setPortfolioItems(portfolio || []);
      }

      // Fetch bookings for stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, status, scheduled_date, total_price')
        .eq('provider_id', user.id);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const upcoming = bookings?.filter(b => b.status === 'confirmed' && new Date(b.scheduled_date) > now) || [];
      const completed = bookings?.filter(b => b.status === 'completed') || [];

      // Fetch payments
      const bookingIds = bookings?.map(b => b.id) || [];
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at')
        .in('booking_id', bookingIds)
        .eq('status', 'succeeded');

      const totalEarnings = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const monthlyPayments = payments?.filter(p => new Date(p.created_at) >= firstDayOfMonth) || [];
      const monthlyEarnings = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('provider_id', user.id);

      const avgRating = reviews?.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

      setStats({
        totalBookings: bookings?.length || 0,
        upcomingBookings: upcoming.length,
        completedBookings: completed.length,
        totalEarnings: totalEarnings / 100,
        monthlyEarnings: monthlyEarnings / 100,
        averageRating: avgRating,
        totalReviews: reviews?.length || 0,
      });

      // Fetch verification status
      const { data: verification } = await supabase
        .from('provider_verifications')
        .select('status')
        .eq('provider_id', user.id)
        .single();
      if (verification) setVerificationStatus(verification.status);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your data including bookings, services, portfolio, messages, and earnings will be permanently deleted.'
    )

    if (!confirmed) return

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    )

    if (doubleConfirm !== 'DELETE') {
      alert('Account deletion cancelled.')
      return
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      alert('Your account has been successfully deleted.');
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
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
      {/* Profile Header */}
      <div className="bg-white px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="relative mb-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#FCE5DF] flex items-center justify-center">
                <User className="w-12 h-12 text-[#D97A5F]" />
              </div>
            )}
            <Link href="/provider/profile/edit" 
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-[#F4B5A4] flex items-center justify-center hover:bg-[#FEF5F2] transition-colors">
              <Camera className="w-4 h-4 text-[#D97A5F]" />
            </Link>
          </div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">{profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user?.email}</h1>
          <p className="text-[#6B6B6B]">Service Provider</p>
        </div>
      </div>
      {/* Performance Stats */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Performance Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#FCE5DF] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1A1A1A]">{stats.upcomingBookings}</p>
            <p className="text-sm text-[#6B6B6B]">Upcoming</p>
          </div>
          <div className="bg-[#D1FAE5] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1A1A1A]">{stats.completedBookings}</p>
            <p className="text-sm text-[#6B6B6B]">Completed</p>
          </div>
          <div className="bg-[#FEF3C7] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1A1A1A]">{stats.averageRating.toFixed(1)} ⭐</p>
            <p className="text-sm text-[#6B6B6B]">Rating</p>
          </div>
          <div className="bg-[#E0E7FF] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalReviews}</p>
            <p className="text-sm text-[#6B6B6B]">Reviews</p>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Earnings Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#E5E5E5]">
              <span className="text-[#6B6B6B]">Total Earnings</span>
              <span className="font-bold text-[#1A1A1A]">${stats.totalEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#E5E5E5]">
              <span className="text-[#6B6B6B]">This Month</span>
              <span className="font-bold text-[#10B981]">${stats.monthlyEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B6B6B]">Total Bookings</span>
              <span className="font-bold text-[#1A1A1A]">{stats.totalBookings}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1A1A1A]">My Portfolio</h3>
            <Link href="/provider/portfolio" className="bg-[#F4B5A4] text-[#1A1A1A] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#E89580] transition-colors">
              + Create Post
            </Link>
          </div>
          {portfolioItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📸</div>
              <p className="font-bold text-[#1A1A1A] mb-1">No portfolio posts yet</p>
              <p className="text-sm text-[#6B6B6B] mb-4">Showcase your work to attract more customers</p>
              <Link href="/provider/portfolio" className="inline-block bg-[#F4B5A4] text-[#1A1A1A] px-6 py-3 rounded-xl font-semibold hover:bg-[#E89580] transition-colors">
                Create Your First Post
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {portfolioItems.map((item) => (
                  <Link key={item.id} href="/provider/portfolio" className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={item.image_url} alt={item.caption || 'Portfolio'} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <div className="flex gap-2 text-white text-xs">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {item.like_count}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.view_count}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/provider/portfolio" className="block text-center text-[#D97A5F] font-semibold hover:underline">
                View All Posts →
              </Link>
            </>
          )}
        </div>

        {/* Business Management */}
        <div className="mb-6">
          <h3 className="font-bold text-[#1A1A1A] mb-3">Business Management</h3>
          <div className="space-y-3">
            <Link href="/provider/profile/edit" className="flex items-center justify-between bg-[#F4B5A4] text-[#1A1A1A] p-4 rounded-xl font-semibold hover:bg-[#E89580] transition-colors">
              <span className="flex items-center gap-3"><Edit className="w-5 h-5" /> Edit Profile</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <MenuLink href="/provider/availability" icon={<Calendar className="w-5 h-5" />} label="Manage Availability" />
            <MenuLink href="/provider/earnings" icon={<DollarSign className="w-5 h-5" />} label="Earnings & Payouts" />
            <MenuLink href="/provider/verification" icon={<Shield className="w-5 h-5" />} label="Identity Verification" badge={verificationStatus} />
            <MenuLink href="/provider/reviews" icon={<Star className="w-5 h-5" />} label="Reviews" />
            <MenuLink href="/provider/customers" icon={<Users className="w-5 h-5" />} label="Customers" />
            <MenuLink href="/provider/settings/location" icon={<MapPin className="w-5 h-5" />} label="Location & Service Area" />
          </div>
        </div>

        {/* Account Settings */}
        <div className="mb-6">
          <h3 className="font-bold text-[#1A1A1A] mb-3">Account Settings</h3>
          <div className="space-y-3">
            <MenuLink href="/provider/settings/travel" icon={<Car className="w-5 h-5" />} label="Travel & Distance" />
            <MenuLink href="/provider/settings/notifications" icon={<Bell className="w-5 h-5" />} label="Notification Settings" />
            <MenuLink href="/provider/settings/business" icon={<Settings className="w-5 h-5" />} label="Business Settings" />
            <MenuLink href="/provider/settings/security" icon={<Shield className="w-5 h-5" />} label="Security Settings" />
          </div>
        </div>

        {/* As Customer */}
        <div className="mb-6">
          <h3 className="font-bold text-[#1A1A1A] mb-1">As a Customer</h3>
          <p className="text-sm text-[#6B6B6B] mb-3">Services you've booked from other providers</p>
          <Link href="/customer/bookings" className="flex items-center justify-between bg-[#F4B5A4] text-[#1A1A1A] p-4 rounded-xl font-semibold hover:bg-[#E89580] transition-colors">
            <span className="flex items-center gap-3"><Briefcase className="w-5 h-5" /> My Bookings</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-3 bg-[#F4B5A4] text-[#1A1A1A] p-4 rounded-xl font-semibold hover:bg-[#E89580] transition-colors mb-4">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>

        {/* Delete Account */}
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#E5E5E5] text-[#9E9E9E] p-4 rounded-xl text-sm font-medium hover:bg-[#F7F7F7] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? 'Deleting Account...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
}

function MenuLink({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <Link href={href} className="flex items-center justify-between bg-white border border-[#E5E5E5] p-4 rounded-xl hover:border-[#F4B5A4] transition-colors">
      <span className="flex items-center gap-3 text-[#1A1A1A] font-medium">{icon} {label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            badge === 'approved' ? 'bg-[#D1FAE5] text-[#10B981]' :
            badge === 'under_review' ? 'bg-[#DBEAFE] text-[#3B82F6]' :
            'bg-[#FEF3C7] text-[#F59E0B]'
          }`}>
            {badge === 'approved' ? 'Verified' : badge === 'under_review' ? 'Under Review' : 'Not Verified'}
          </span>
        )}
        <ChevronRight className="w-5 h-5 text-[#9E9E9E]" />
      </div>
    </Link>
  );
}

