import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Search, MapPin, Star, Sparkles, CheckCircle, Filter } from 'lucide-react'
import { getAvatarUrl, CATEGORY_IMAGES } from '@/lib/images'

const SERVICE_CATEGORIES = [
  { id: 'nails', name: 'Nails', icon: '💅', image: CATEGORY_IMAGES.nails },
  { id: 'hair', name: 'Hair', icon: '💇', image: CATEGORY_IMAGES.hair },
  { id: 'makeup', name: 'Makeup', icon: '💄', image: CATEGORY_IMAGES.makeup },
  { id: 'skincare', name: 'Skincare', icon: '✨', image: CATEGORY_IMAGES.skincare },
  { id: 'massage', name: 'Massage', icon: '💆', image: CATEGORY_IMAGES.massage },
  { id: 'waxing', name: 'Waxing', icon: '🌸', image: CATEGORY_IMAGES.waxing },
]

export default async function DiscoverPage() {
  const supabase = await createClient()

  // Get featured posts from portfolio
  const { data: posts } = await supabase
    .from('portfolio_items')
    .select(`
      id,
      image_url,
      caption,
      like_count,
      created_at,
      provider:provider_profiles!portfolio_items_provider_id_fkey (
        id,
        business_name,
        is_verified,
        avatar_url
      ),
      service:services!portfolio_items_service_id_fkey (
        id,
        name
      )
    `)
    .eq('is_visible', true)
    .order('like_count', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#FEF5F2] to-[#FCE5DF] rounded-3xl p-8 md:p-12 mb-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B5A4]/20 rounded-full blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4">
              Discover Beauty<br />
              <span className="text-[#D97A5F]">Inspiration</span>
            </h1>
            <p className="text-lg text-[#6B6B6B] max-w-xl mb-8">
              Browse trending looks and services from verified beauty professionals.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-white bg-white rounded-xl focus:outline-none focus:border-[#F4B5A4] transition-colors shadow-sm"
                />
              </div>
              <Link href="/search" className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#F4B5A4] to-[#E89580] text-black px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5">
                <Search className="w-5 h-5" />
                Search
              </Link>
            </div>
          </div>
        </div>

        {/* Categories */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Browse by Category</h2>
              <p className="text-[#6B6B6B] mt-1">Find the perfect service for you</p>
            </div>
            <Link href="/search" className="flex items-center gap-2 text-[#D97A5F] font-medium hover:text-[#E89580] transition-colors">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICE_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/services/${category.id}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Image
                  src={category.image}
                  alt={`${category.name} services`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <span className="text-3xl mb-1">{category.icon}</span>
                  <span className="font-bold text-white text-lg">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Posts */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Trending Looks</h2>
              <p className="text-[#6B6B6B] mt-1">Popular posts from verified providers</p>
            </div>
            <Link href="/feed" className="text-[#D97A5F] font-medium hover:text-[#E89580] transition-colors">
              View all →
            </Link>
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map((post) => {
                const provider = Array.isArray(post.provider) ? post.provider[0] : post.provider
                const service = Array.isArray(post.service) ? post.service[0] : post.service
                const avatarUrl = provider?.avatar_url || getAvatarUrl(provider?.business_name || 'Provider')

                return (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Post Image */}
                    <Image
                      src={post.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'}
                      alt={post.caption || 'Portfolio image'}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Verified Badge */}
                    {provider?.is_verified && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                        <span className="text-xs font-medium text-[#10B981]">Verified</span>
                      </div>
                    )}

                    {/* Like Count */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">❤️ {post.like_count || 0}</span>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {/* Provider Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#FEF5F2]">
                          <Image
                            src={avatarUrl}
                            alt={provider?.business_name || 'Provider'}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-white font-semibold text-sm truncate">
                          {provider?.business_name || 'Unknown Provider'}
                        </span>
                      </div>

                      {/* Caption */}
                      {post.caption && (
                        <p className="text-white/90 text-sm line-clamp-2 mb-2">
                          {post.caption}
                        </p>
                      )}

                      {/* Service Tag */}
                      {service && (
                        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          {service.name}
                        </span>
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[#D97A5F]/0 group-hover:bg-[#D97A5F]/10 transition-colors duration-300" />
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="w-20 h-20 bg-[#FEF5F2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-[#D97A5F]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No posts yet</h3>
              <p className="text-[#6B6B6B] mb-6">Check back soon for trending beauty looks</p>
              <Link href="/feed" className="inline-flex items-center gap-2 bg-[#F4B5A4] text-black px-6 py-3 rounded-xl font-semibold hover:bg-[#E89580] transition-all">
                Explore Feed
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

