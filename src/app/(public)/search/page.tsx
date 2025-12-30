'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Search, MapPin, Star, CheckCircle, Loader2 } from 'lucide-react';
import SearchFilters, { FilterState } from '@/components/search/SearchFilters';

interface Provider {
  id: string;
  business_name: string;
  bio: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  service_radius_miles: number;
  avatar_url: string | null;
  profiles: { first_name: string; last_name: string; avatar_url: string | null };
  provider_services: { id: string; base_price: number; service: { id: string; name: string; category_id: string } }[];
}

const SERVICE_CATEGORIES = [
  { id: 'all', name: 'All', icon: '✨' },
  { id: 'nails', name: 'Nails', icon: '💅' },
  { id: 'hair', name: 'Hair', icon: '💇' },
  { id: 'makeup', name: 'Makeup', icon: '💄' },
  { id: 'skincare', name: 'Skincare', icon: '🧴' },
  { id: 'massage', name: 'Massage', icon: '💆' },
  { id: 'waxing', name: 'Waxing', icon: '🌸' },
];

export default function SearchPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    priceMin: 0, priceMax: 500, minRating: 0, maxDistance: 50, availability: 'any', sortBy: 'rating',
  });

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, filters]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('provider_profiles')
        .select(`
          id, business_name, bio, rating, total_reviews, is_verified, avatar_url,
          profiles!provider_profiles_id_fkey(first_name, last_name, avatar_url),
          provider_services(id, base_price, service:services(id, name, category_id))
        `)
        .eq('is_verified', true);

      // Apply rating filter
      if (filters.minRating > 0) {
        query = query.gte('rating', filters.minRating);
      }

      // Apply distance filter
      if (filters.maxDistance < 50) {
        query = query.lte('service_radius_miles', filters.maxDistance);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'reviews':
          query = query.order('total_reviews', { ascending: false });
          break;
        case 'distance':
          query = query.order('service_radius_miles', { ascending: true });
          break;
        default:
          query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data || [];

      // Filter by category (using category_id from service)
      if (selectedCategory !== 'all') {
        filtered = filtered.filter((p: any) =>
          p.provider_services?.some((ps: any) => ps.service?.name?.toLowerCase().includes(selectedCategory))
        );
      }

      // Filter by price range (using base_price from provider_services)
      filtered = filtered.filter((p: any) =>
        p.provider_services?.some((ps: any) => ps.base_price >= filters.priceMin && ps.base_price <= filters.priceMax)
      );

      // Filter by search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((p: any) =>
          p.business_name?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.provider_services?.some((ps: any) => ps.service?.name?.toLowerCase().includes(q))
        );
      }

      // Sort by price if needed
      if (filters.sortBy === 'price_low') {
        filtered.sort((a: any, b: any) => {
          const aMin = Math.min(...(a.provider_services?.map((ps: any) => ps.base_price) || [0]));
          const bMin = Math.min(...(b.provider_services?.map((ps: any) => ps.base_price) || [0]));
          return aMin - bMin;
        });
      } else if (filters.sortBy === 'price_high') {
        filtered.sort((a: any, b: any) => {
          const aMax = Math.max(...(a.provider_services?.map((ps: any) => ps.base_price) || [0]));
          const bMax = Math.max(...(b.provider_services?.map((ps: any) => ps.base_price) || [0]));
          return bMax - aMax;
        });
      }

      // Transform data to match Provider interface (Supabase returns arrays for relations)
      const transformedProviders = filtered.map((p: any) => ({
        ...p,
        profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
        provider_services: Array.isArray(p.provider_services) ? p.provider_services : []
      }));
      setProviders(transformedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const getMinPrice = (providerServices: any[]) => {
    if (!providerServices?.length) return null;
    return Math.min(...providerServices.map(ps => ps.base_price));
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#D97A5F]">Eve Beauty</Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-[#6B6B6B] hover:text-[#D97A5F] font-medium">Login</Link>
            <Link href="/signup" className="bg-[#F4B5A4] text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-[#E89580] transition-all">Sign Up</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, providers..." className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
          </div>
          <SearchFilters onFiltersChange={setFilters} initialFilters={filters} />
          <button type="submit" className="bg-[#F4B5A4] text-[#1A1A1A] px-6 py-3 rounded-xl font-semibold hover:bg-[#E89580] transition-colors">Search</button>
        </form>
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {SERVICE_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-[#F4B5A4] text-[#1A1A1A]' : 'bg-white border-2 border-[#E5E5E5] text-[#6B6B6B] hover:border-[#F4B5A4]'}`}>
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#6B6B6B]">
            {loading ? 'Searching...' : `${providers.length} provider${providers.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#F4B5A4]" />
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">No providers found</h2>
            <p className="text-[#6B6B6B]">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Link key={provider.id} href={`/provider/${provider.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                <div className="h-32 bg-gradient-to-r from-[#F8CFC3] to-[#FCE5DF] relative">
                  {provider.is_verified && (
                    <span className="absolute top-3 right-3 bg-white/90 text-[#10B981] text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {(provider.avatar_url || provider.profiles?.avatar_url) ? (
                      <img src={provider.avatar_url || provider.profiles?.avatar_url || ''} alt={provider.business_name} className="w-12 h-12 rounded-full object-cover -mt-10 border-4 border-white" />
                    ) : (
                      <div className="w-12 h-12 bg-[#FCE5DF] rounded-full flex items-center justify-center -mt-10 border-4 border-white">
                        <span className="text-xl text-[#D97A5F] font-bold">{provider.business_name?.[0]}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1A1A1A] truncate group-hover:text-[#D97A5F] transition-colors">{provider.business_name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                        <span className="font-medium text-[#1A1A1A]">{provider.rating?.toFixed(1) || 'New'}</span>
                        <span className="text-[#9E9E9E]">({provider.total_reviews || 0})</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#6B6B6B] line-clamp-2 mb-3">{provider.bio || 'Professional beauty services'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-[#6B6B6B]">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.service_radius_miles} mi</span>
                    </div>
                    {getMinPrice(provider.provider_services) && (
                      <span className="font-semibold text-[#1A1A1A]">From ${getMinPrice(provider.provider_services)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

