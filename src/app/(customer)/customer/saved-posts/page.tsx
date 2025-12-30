import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Bookmark, Heart, Image as ImageIcon, Calendar, User, Eye } from 'lucide-react'

export default async function SavedPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's profile ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Get saved posts with portfolio item details
  const { data: savedPosts } = await supabase
    .from('portfolio_saves')
    .select(`
      id,
      created_at,
      portfolio_item_id,
      portfolio_items (
        id,
        image_url,
        caption,
        like_count,
        view_count,
        created_at,
        provider_id,
        service_category_id,
        provider_profiles (
          id,
          business_name,
          profile_photo_url,
          rating,
          total_reviews,
          is_verified
        ),
        service_categories (
          name,
          icon_emoji
        )
      )
    `)
    .eq('profile_id', profile?.id)
    .order('created_at', { ascending: false })

  const savedCount = savedPosts?.length || 0

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="container-responsive py-6">
          <Link
            href="/customer/profile"
            className="inline-flex items-center text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-4"
          >
            <span className="mr-2">←</span> Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#D97A5F] bg-opacity-10 flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-[#D97A5F]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">Saved Posts</h1>
                <p className="text-[#6B6B6B]">{savedCount} {savedCount === 1 ? 'post' : 'posts'} saved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-6">
        {/* Empty State */}
        {savedCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-[#F7F7F7] flex items-center justify-center mb-6">
              <Bookmark className="w-12 h-12 text-[#9E9E9E]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No saved posts yet</h3>
            <p className="text-[#6B6B6B] text-center max-w-md mb-6">
              Start saving posts you love to easily find them later. Tap the bookmark icon on any post to save it.
            </p>
            <Link
              href="/customer/discover"
              className="px-6 py-3 bg-[#D97A5F] text-white rounded-xl hover:bg-[#C96A4F] transition-colors font-medium"
            >
              Discover Posts
            </Link>
          </div>
        ) : (
          <>
            {/* Filter/Sort Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="px-4 py-2 bg-[#D97A5F] text-white text-sm font-medium rounded-xl">
                    All
                  </button>
                  <button className="px-4 py-2 text-[#6B6B6B] text-sm font-medium hover:bg-[#F7F7F7] rounded-xl transition-colors">
                    Recently Saved
                  </button>
                  <button className="px-4 py-2 text-[#6B6B6B] text-sm font-medium hover:bg-[#F7F7F7] rounded-xl transition-colors">
                    Most Popular
                  </button>
                </div>
              </div>
            </div>

            {/* Pinterest-style Grid Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {savedPosts?.map((save: any) => {
                const post = save.portfolio_items
                if (!post) return null

                const provider = post.provider_profiles
                const category = post.service_categories

                return (
                  <div
                    key={save.id}
                    className="break-inside-avoid bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    {/* Image */}
                    <Link href={`/post/${post.id}`} className="block relative">
                      <img
                        src={post.image_url}
                        alt={post.caption || 'Saved post'}
                        className="w-full h-auto object-cover"
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="w-8 h-8 text-white" />
                      </div>

                      {/* Category Badge */}
                      {category && (
                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-white bg-opacity-95 rounded-full flex items-center gap-1.5">
                          <span className="text-sm">{category.icon_emoji}</span>
                          <span className="text-xs font-medium text-[#1A1A1A]">{category.name}</span>
                        </div>
                      )}

                      {/* Save indicator */}
                      <div className="absolute top-3 right-3">
                        <button className="w-8 h-8 bg-[#D97A5F] rounded-full flex items-center justify-center shadow-lg">
                          <Bookmark className="w-4 h-4 text-white fill-white" />
                        </button>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      {/* Caption */}
                      {post.caption && (
                        <p className="text-sm text-[#1A1A1A] mb-3 line-clamp-2">
                          {post.caption}
                        </p>
                      )}

                      {/* Provider Info */}
                      <Link
                        href={`/provider/${provider.id}`}
                        className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
                      >
                        {provider.profile_photo_url ? (
                          <img
                            src={provider.profile_photo_url}
                            alt={provider.business_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#D97A5F] bg-opacity-10 flex items-center justify-center">
                            <User className="w-4 h-4 text-[#D97A5F]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-[#1A1A1A] truncate">
                              {provider.business_name}
                            </p>
                            {provider.is_verified && (
                              <span className="text-[#2196F3]" title="Verified">✓</span>
                            )}
                          </div>
                          {provider.rating > 0 && (
                            <p className="text-xs text-[#6B6B6B]">
                              ⭐ {provider.rating.toFixed(1)} ({provider.total_reviews})
                            </p>
                          )}
                        </div>
                      </Link>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{post.like_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{post.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Saved {new Date(save.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
