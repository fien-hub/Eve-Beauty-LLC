'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Search, Users, Calendar, DollarSign, Star, MessageCircle, ChevronRight } from 'lucide-react';

interface Customer {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  email: string;
  phone: string | null;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string | null;
  averageRating: number | null;
}

export default function CustomersPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'bookings' | 'spent'>('recent');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all bookings for this provider with customer info
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id, total_price, scheduled_date, status,
          customer:customer_profiles!bookings_customer_id_fkey(
            id,
            profiles!customer_profiles_id_fkey(id, user_id, first_name, last_name, avatar_url, phone)
          )
        `)
        .eq('provider_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (!bookings) { setLoading(false); return; }

      // Group by customer
      const customerMap = new Map<string, Customer>();

      for (const booking of bookings) {
        const customerProfile = booking.customer as any;
        if (!customerProfile?.profiles) continue;
        const profile = customerProfile.profiles;

        const existing = customerMap.get(profile.user_id);
        if (existing) {
          existing.totalBookings++;
          existing.totalSpent += booking.total_price || 0;
          if (!existing.lastBooking || new Date(booking.scheduled_date) > new Date(existing.lastBooking)) {
            existing.lastBooking = booking.scheduled_date;
          }
        } else {
          customerMap.set(profile.user_id, {
            id: customerProfile.id,
            user_id: profile.user_id,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            avatar_url: profile.avatar_url,
            email: '',
            phone: profile.phone,
            totalBookings: 1,
            totalSpent: booking.total_price || 0,
            lastBooking: booking.scheduled_date,
            averageRating: null,
          });
        }
      }

      // Get reviews for each customer
      for (const [userId, customer] of customerMap) {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('customer_id', userId)
          .eq('provider_id', user.id);

        if (reviews && reviews.length > 0) {
          customer.averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        }
      }

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (c: Customer) => `${c.first_name} ${c.last_name}`.trim() || 'Unknown';

  const filteredCustomers = customers
    .filter(c => getFullName(c).toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'bookings') return b.totalBookings - a.totalBookings;
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      return new Date(b.lastBooking || 0).getTime() - new Date(a.lastBooking || 0).getTime();
    });

  const repeatCustomers = customers.filter(c => c.totalBookings > 1).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/provider/profile" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Customers</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Users className="w-6 h-6 text-[#F4B5A4] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#1A1A1A]">{customers.length}</p>
            <p className="text-sm text-[#6B6B6B]">Total Customers</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Star className="w-6 h-6 text-[#F59E0B] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#1A1A1A]">{repeatCustomers}</p>
            <p className="text-sm text-[#6B6B6B]">Repeat Customers</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <DollarSign className="w-6 h-6 text-[#10B981] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#1A1A1A]">${(totalRevenue / 100).toFixed(0)}</p>
            <p className="text-sm text-[#6B6B6B]">Total Revenue</p>
          </div>
        </div>
        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..." className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors bg-white">
            <option value="recent">Most Recent</option>
            <option value="bookings">Most Bookings</option>
            <option value="spent">Highest Spent</option>
          </select>
        </div>

        {/* Customer List */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Users className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">No customers yet</h3>
            <p className="text-[#6B6B6B]">Your customers will appear here once you receive bookings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div key={customer.user_id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {customer.avatar_url ? (
                    <img src={customer.avatar_url} alt={getFullName(customer)} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#FCE5DF] flex items-center justify-center text-xl">
                      {(customer.first_name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#1A1A1A] truncate">{getFullName(customer)}</h3>
                      {customer.totalBookings > 1 && (
                        <span className="bg-[#FCE5DF] text-[#D97A5F] text-xs px-2 py-0.5 rounded-full font-medium">
                          Repeat
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B6B6B] truncate">{customer.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#6B6B6B]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {customer.totalBookings} bookings
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" /> ${(customer.totalSpent / 100).toFixed(0)}
                      </span>
                      {customer.averageRating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-[#F59E0B]" /> {customer.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/provider/messages?customer=${customer.user_id}`}
                      className="p-2 hover:bg-[#FCE5DF] rounded-full transition-colors">
                      <MessageCircle className="w-5 h-5 text-[#D97A5F]" />
                    </Link>
                    <ChevronRight className="w-5 h-5 text-[#9E9E9E]" />
                  </div>
                </div>
                {customer.lastBooking && (
                  <p className="text-xs text-[#9E9E9E] mt-3 pt-3 border-t border-[#E5E5E5]">
                    Last booking: {new Date(customer.lastBooking).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

