import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Search, Sparkles, CheckCircle, Filter } from 'lucide-react'
import { getAvatarUrl, CATEGORY_IMAGES } from '@/lib/images'

export const metadata: Metadata = {
  title: 'Feed - Discover Beauty',
  description: 'Explore stunning work from talented beauty professionals',
}

const SERVICE_CATEGORIES = [
  { id: 'nails', name: 'Nails', icon: '💅', image: CATEGORY_IMAGES.nails },
  { id: 'hair', name: 'Hair', icon: '💇', image: CATEGORY_IMAGES.hair },
  { id: 'makeup', name: 'Makeup', icon: '💄', image: CATEGORY_IMAGES.makeup },
  { id: 'skincare', name: 'Skincare', icon: '✨', image: CATEGORY_IMAGES.skincare },
  { id: 'massage', name: 'Massage', icon: '💆', image: CATEGORY_IMAGES.massage },
  { id: 'waxing', name: 'Waxing', icon: '🌸', image: CATEGORY_IMAGES.waxing },
]

export default async function FeedPage() {
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
    <div className="min-h-screen bg-[#F7F7F7] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-[#F4B5A4] via-[#E89580] to-[#D97A5F] rounded-3xl p-8 md:p-12 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-3xl md:text-4xl font-bold">Discover Beauty</h1>
            </div>
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              Explore stunning work from talented beauty professionals
            </p>
            
            {/* Search Bar */}
            <Link 
              href="/search"
              className="block max-w-2xl bg-white/95 backdrop-blur rounded-2xl px-6 py-4 text-[#6B6B6B] hover:bg-white transition-all shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-[#D97A5F]" />
                <span>Search services, styles, or trends...</span>
              </div>
            </Link>
          </div>
        </section>

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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h3 className="text-white font-bold text-lg">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Posts */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Trending Now</h2>
              <p className="text-[#6B6B6B] mt-1">Most popular posts this week</p>
            </div>
          </div>

          {!posts || posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#F4B5A4]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-[#D97A5F]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No posts yet</h3>
              <p className="text-[#6B6B6B]">Check back soon for amazing beauty content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map((post) => {
                const provider = Array.isArray(post.provider) ? post.provider[0] : post.provider
                const service = Array.isArray(post.service) ? post.service[0] : post.service
                
                return (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <Image
                      src={post.image_url}
                      alt={post.caption || 'Portfolio post'}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      {/* Provider Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                          {provider?.avatar_url ? (
                            <Image
                              src={getAvatarUrl(provider.avatar_url, provider.business_name)}
                              alt={provider.business_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#F4B5A4] to-[#E89580]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate flex items-center gap-1">
                            {provider?.business_name || 'Unknown Provider'}
                            {provider?.is_verified && (
                              <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Caption */}
                      {post.caption && (
                        <p className="text-white/90 text-sm line-clamp-2 mb-2">
                          {post.caption}
                        </p>
                      )}

                      {/* Service Tag & Like Count */}
                      <div className="flex items-center justify-between gap-2">
                        {service?.name && (
                          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">
                            {service.name}
                          </span>
                        )}
                        {post.like_count > 0 && (
                          <span className="text-white/90 text-xs font-medium">
                            {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
