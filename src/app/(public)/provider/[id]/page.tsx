import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Star, MapPin, Clock, MessageCircle, Heart, Share2, CheckCircle, ChevronRight, Calendar, Award } from 'lucide-react'
import { getAvatarUrl, getPortfolioImage, PORTFOLIO_PLACEHOLDERS } from '@/lib/images'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProviderProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Get provider profile with user info
  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      profiles!provider_profiles_id_fkey (first_name, last_name, avatar_url, phone)
    `)
    .eq('id', id)
    .single()

  if (!provider) {
    notFound()
  }

  const profile = provider.profiles as { first_name?: string; last_name?: string; avatar_url?: string | null; phone?: string }
  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : ''
  const avatarUrl = provider.avatar_url || profile?.avatar_url || getAvatarUrl(fullName || provider.business_name, 256)

  // Get provider services with category info
  const { data: services } = await supabase
    .from('provider_services')
    .select(`*, services (*, service_categories (name))`)
    .eq('provider_id', id)
    .eq('is_active', true)
    .order('base_price', { ascending: true })

  // Get all portfolio items
  const { data: portfolio } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('provider_id', id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(12)

  // Get all reviews with customer profile info
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:customer_profiles!reviews_customer_id_fkey (
        id,
        profiles!customer_profiles_id_fkey (first_name, last_name, avatar_url)
      )
    `)
    .eq('provider_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews?.filter(r => r.rating === stars).length || 0,
    percentage: reviews?.length ? ((reviews.filter(r => r.rating === stars).length / reviews.length) * 100) : 0
  }))

  // Get min price from services
  const minPrice = services?.length ? Math.min(...services.map(s => s.base_price)) : 0

  // Group services by category
  const servicesByCategory = services?.reduce((acc: Record<string, typeof services>, service) => {
    const category = (service.services as any)?.service_categories?.name || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {}) || {}

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Eve Beauty Logo"
              width={40}
              height={40}
              className="rounded-xl shadow-md"
            />
            <span className="text-2xl font-bold text-[#D97A5F]">Eve Beauty</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/browse" className="text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">← Back</Link>
            <button className="p-2.5 hover:bg-[#FEF5F2] rounded-xl transition-colors border border-[#E5E5E5]">
              <Share2 className="w-5 h-5 text-[#6B6B6B]" />
            </button>
            <button className="p-2.5 hover:bg-[#FEF5F2] rounded-xl transition-colors border border-[#E5E5E5]">
              <Heart className="w-5 h-5 text-[#6B6B6B]" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-6 shadow-lg">
          <Image
            src={`https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop`}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-6 -mt-20 relative z-10 mx-4 md:mx-0">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative -mt-20 md:-mt-24">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-[#FEF5F2]">
                <Image
                  src={avatarUrl}
                  alt={provider.business_name}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              </div>
              {provider.is_verified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{provider.business_name}</h1>
              </div>
              <p className="text-[#6B6B6B] mb-5 max-w-xl leading-relaxed">{provider.bio || 'Professional beauty services tailored to your needs.'}</p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex items-center gap-2 bg-[#FEF5F2] px-4 py-2 rounded-xl">
                  <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="font-bold text-[#1A1A1A]">{provider.rating?.toFixed(1) || 'New'}</span>
                  <span className="text-[#6B6B6B] text-sm">({provider.total_reviews || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F7F7F7] px-4 py-2 rounded-xl text-[#6B6B6B]">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.service_radius_miles} mi area</span>
                </div>
                {minPrice > 0 && (
                  <div className="flex items-center gap-2 bg-[#F7F7F7] px-4 py-2 rounded-xl">
                    <span className="text-[#6B6B6B]">From</span>
                    <span className="font-bold text-[#D97A5F]">${(minPrice / 100).toFixed(0)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link href={`/customer/messages?provider=${provider.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#E5E5E5] rounded-xl text-[#1A1A1A] font-medium hover:border-[#F4B5A4] hover:bg-[#FEF5F2] transition-all">
                  <MessageCircle className="w-4 h-4" /> Message
                </Link>
                <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#E5E5E5] rounded-xl text-[#1A1A1A] font-medium hover:border-[#F4B5A4] hover:bg-[#FEF5F2] transition-all">
                  <Calendar className="w-4 h-4" /> View Availability
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services by Category */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Services</h2>
              {Object.keys(servicesByCategory).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-[#9E9E9E] uppercase tracking-wide mb-3">{category}</h3>
                      <div className="space-y-3">
                        {categoryServices.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-xl hover:bg-[#FCE5DF] transition-colors group">
                            <div className="flex-1">
                              <h4 className="font-semibold text-[#1A1A1A]">
                                {(service.services as { name?: string })?.name}
                              </h4>
                              {service.description && (
                                <p className="text-sm text-[#6B6B6B] mt-1 line-clamp-2">{service.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-sm text-[#9E9E9E]">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{service.duration_minutes} min</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <span className="font-bold text-[#D97A5F] text-lg">${(service.base_price / 100).toFixed(0)}</span>
                              <Link href={`/book/${provider.id}/${service.id}`}
                                className="bg-[#F4B5A4] text-[#1A1A1A] px-4 py-2 rounded-xl font-semibold hover:bg-[#E89580] transition-all opacity-0 group-hover:opacity-100">
                                Book
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#6B6B6B]">No services available</p>
                </div>
              )}
            </div>

            {/* Portfolio Gallery */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#D97A5F]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#1A1A1A]">Portfolio</h2>
                    <p className="text-sm text-[#9E9E9E]">{portfolio?.length || 0} photos</p>
                  </div>
                </div>
              </div>

              {portfolio && portfolio.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolio.map((item, index) => (
                    <div key={item.id} className={`relative aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                      <Image
                        src={item.image_url || getPortfolioImage(id, index)}
                        alt={item.caption || 'Portfolio work'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          {item.caption && <p className="text-white text-sm font-medium line-clamp-2">{item.caption}</p>}
                          <div className="flex items-center gap-3 mt-2 text-white/80 text-sm">
                            <span className="flex items-center gap-1.5">
                              <Heart className="w-4 h-4" /> {item.like_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Show placeholder portfolio if no real images */
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PORTFOLIO_PLACEHOLDERS.slice(0, 6).map((imgUrl, index) => (
                    <div key={index} className={`relative aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-sm ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                      <Image
                        src={imgUrl}
                        alt="Portfolio example"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Sample work
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">Reviews</h2>
                </div>
                {reviews && reviews.length > 0 && (
                  <span className="text-sm text-[#9E9E9E]">{provider.total_reviews || reviews.length} total</span>
                )}
              </div>

              {reviews && reviews.length > 0 ? (
                <>
                  {/* Rating Summary */}
                  <div className="flex items-start gap-6 mb-6 pb-6 border-b border-[#E5E5E5]">
                    <div className="text-center bg-[#FEF5F2] rounded-2xl p-4">
                      <div className="text-4xl font-bold text-[#1A1A1A]">{provider.rating?.toFixed(1) || '0.0'}</div>
                      <div className="flex items-center gap-0.5 my-2 justify-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= Math.round(provider.rating || 0) ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#E5E5E5]'}`} />
                        ))}
                      </div>
                      <div className="text-sm text-[#9E9E9E]">{reviews.length} reviews</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {ratingDistribution.map(({ stars, count, percentage }) => (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-sm text-[#6B6B6B] w-3">{stars}</span>
                          <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                          <div className="flex-1 h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-xs text-[#9E9E9E] w-8">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review List */}
                  <div className="space-y-5">
                    {reviews.map((review) => {
                      const customer = review.customer as { profiles?: { first_name?: string; last_name?: string; avatar_url?: string | null } }
                      const reviewerName = customer?.profiles ? `${customer.profiles.first_name || ''} ${customer.profiles.last_name || ''}`.trim() || 'Anonymous' : 'Anonymous'
                      const reviewerAvatar = customer?.profiles?.avatar_url || getAvatarUrl(reviewerName, 80)

                      return (
                        <div key={review.id} className="pb-5 border-b border-[#F0F0F0] last:border-0 last:pb-0">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                              <Image
                                src={reviewerAvatar}
                                alt={reviewerName}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-[#1A1A1A]">{reviewerName}</span>
                                <span className="text-xs text-[#9E9E9E]">{new Date(review.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#E5E5E5]'}`} />
                                ))}
                                {(review.services as { name?: string })?.name && (
                                  <span className="text-xs text-[#9E9E9E] ml-2 bg-[#F7F7F7] px-2 py-0.5 rounded-full">• {(review.services as { name?: string }).name}</span>
                                )}
                              </div>
                              {review.comment && <p className="text-[#6B6B6B] leading-relaxed">{review.comment}</p>}
                              {review.provider_response && (
                                <div className="mt-4 p-4 bg-[#FEF5F2] rounded-xl border-l-4 border-[#F4B5A4]">
                                  <p className="text-xs font-semibold text-[#D97A5F] mb-1">Provider Response</p>
                                  <p className="text-sm text-[#6B6B6B]">{review.provider_response}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#FEF5F2] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-[#D97A5F]" />
                  </div>
                  <p className="text-[#6B6B6B] font-medium">No reviews yet</p>
                  <p className="text-sm text-[#9E9E9E] mt-1">Be the first to leave a review!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-[#1A1A1A] mb-5">Quick Info</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#D97A5F]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Service Area</p>
                    <p className="text-sm text-[#6B6B6B]">{provider.service_radius_miles} miles radius</p>
                    {provider.travel_fee_per_mile > 0 && (
                      <p className="text-xs text-[#9E9E9E] mt-0.5">${(provider.travel_fee_per_mile / 100).toFixed(2)}/mile travel fee</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Response Time</p>
                    <p className="text-sm text-[#6B6B6B]">Usually within 1 hour</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#D1FAE5] rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">Verified Provider</p>
                    <p className="text-sm text-[#6B6B6B]">Background checked</p>
                  </div>
                </div>
                {provider.cancellation_policy && (
                  <div className="pt-5 border-t border-[#E5E5E5]">
                    <p className="text-xs text-[#9E9E9E] uppercase tracking-wide mb-1">Cancellation Policy</p>
                    <p className="text-sm text-[#6B6B6B] capitalize">{provider.cancellation_policy}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Book Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] p-4 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6B6B6B]">Starting from</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">${minPrice > 0 ? (minPrice / 100).toFixed(0) : '—'}</p>
          </div>
          {services && services.length > 0 ? (
            <Link href={`/book/${provider.id}/${services[0].id}`}
              className="bg-[#F4B5A4] text-[#1A1A1A] px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#E89580] transition-all flex items-center gap-2">
              Book Now <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <button disabled className="bg-[#E5E5E5] text-[#9E9E9E] px-8 py-3 rounded-xl font-bold text-lg cursor-not-allowed">
              No Services
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

