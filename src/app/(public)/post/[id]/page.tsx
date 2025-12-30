'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Bookmark, Share2, CheckCircle, ArrowLeft, Calendar, Clock, MapPin, Star, MessageCircle, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl, PORTFOLIO_PLACEHOLDERS } from '@/lib/images';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthModal from '@/components/AuthModal';

interface Post {
  id: string;
  image_url: string;
  caption: string;
  like_count: number;
  view_count: number;
  created_at: string;
  provider: {
    id: string;
    business_name: string;
    is_verified: boolean;
    bio: string;
    city: string;
    rating: number;
    total_reviews: number;
    avatar_url: string | null;
  };
  service?: { id: string; name: string; price: number; duration: number };
}

interface RelatedPost {
  id: string;
  image_url: string;
  like_count: number;
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = use(params);
  const supabase = createClient();
  const { user, showAuthModal, authAction, requireAuth, closeAuthModal } = useAuthGuard();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchPost();
    recordView();
  }, [postId]);

  const recordView = async () => {
    try {
      await supabase.rpc('record_portfolio_view', { portfolio_id: postId, viewer_id: null });
    } catch (e) { /* silent */ }
  };

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select(`
          id, image_url, caption, like_count, view_count, created_at,
          provider:provider_profiles!portfolio_items_provider_id_fkey(
            id, business_name, is_verified, bio, city, rating, total_reviews, avatar_url
          ),
          service:services(id, name, price, duration)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      const transformed = {
        ...data,
        provider: Array.isArray(data.provider) ? data.provider[0] : data.provider,
        service: Array.isArray(data.service) ? data.service[0] : data.service
      };
      setPost(transformed as Post);

      // Fetch related posts from same provider
      const { data: related } = await supabase
        .from('portfolio_items')
        .select('id, image_url, like_count')
        .eq('provider_id', transformed.provider?.id)
        .neq('id', postId)
        .limit(6);
      setRelatedPosts(related || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    requireAuth('like', async () => {
      try {
        const { data: existingLike } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user!.id)
          .single();

        if (existingLike) {
          await supabase.from('post_likes').delete().eq('id', existingLike.id);
          setIsLiked(false);
          if (post) setPost({ ...post, like_count: post.like_count - 1 });
        } else {
          await supabase.from('post_likes').insert({ post_id: postId, user_id: user!.id });
          setIsLiked(true);
          if (post) setPost({ ...post, like_count: post.like_count + 1 });
        }
      } catch (error) {
        console.error('Error liking post:', error);
      }
    });
  };
  
  const handleSave = async () => {
    requireAuth('save', async () => {
      try {
        const { data: existingSave } = await supabase
          .from('saved_posts')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user!.id)
          .single();

        if (existingSave) {
          await supabase.from('saved_posts').delete().eq('id', existingSave.id);
          setIsSaved(false);
        } else {
          await supabase.from('saved_posts').insert({ post_id: postId, user_id: user!.id });
          setIsSaved(true);
        }
      } catch (error) {
        console.error('Error saving post:', error);
      }
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post?.caption || 'Check this out!', url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F4B5A4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Post not found</h1>
          <Link href="/feed" className="text-[#D97A5F] hover:underline">Back to feed</Link>
        </div>
      </div>
    );
  }

  const avatar = post.provider?.avatar_url || getAvatarUrl(post.provider?.business_name, 120);
  const postImage = post.image_url || PORTFOLIO_PLACEHOLDERS[0];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal} 
        action={authAction}
      />

      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A]">
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1A1A]">Eve Beauty</span>
          </Link>
          {!user && (
            <Link href="/signup" className="bg-[#1A1A1A] text-white px-4 py-2 rounded-xl text-sm font-semibold">Sign up</Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="lg:flex">
            {/* Image */}
            <div className="lg:w-1/2 relative aspect-square lg:aspect-auto lg:min-h-[500px]">
              <Image src={postImage} alt={post.caption || 'Post'} fill className="object-cover" />
            </div>

            {/* Details */}
            <div className="lg:w-1/2 p-6 flex flex-col">
              {/* Provider */}
              <div className="flex items-center gap-4 pb-4 border-b border-[#F0F0F0]">
                <Link href={`/provider/${post.provider?.id}`}>
                  <Image src={avatar} alt="" width={56} height={56} className="w-14 h-14 rounded-xl object-cover" />
                </Link>
                <div className="flex-1">
                  <Link href={`/provider/${post.provider?.id}`} className="flex items-center gap-1.5 font-bold text-[#1A1A1A] hover:text-[#D97A5F]">
                    {post.provider?.business_name}
                    {post.provider?.is_verified && <CheckCircle className="w-4 h-4 text-[#10B981]" />}
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
                    {post.provider?.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{post.provider.city}</span>}
                    {post.provider?.rating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#F59E0B]" />{post.provider.rating.toFixed(1)}</span>}
                  </div>
                </div>
                <Link href={`/provider/${post.provider?.id}`} className="px-4 py-2 border-2 border-[#E5E5E5] rounded-xl text-sm font-semibold hover:border-[#D97A5F] hover:text-[#D97A5F]">
                  View Profile
                </Link>
              </div>

              {/* Caption */}
              <div className="py-4 flex-1">
                {post.caption && <p className="text-[#1A1A1A] leading-relaxed">{post.caption}</p>}
                <p className="text-sm text-[#9E9E9E] mt-2">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-[#6B6B6B]">
                  <span>{post.like_count} likes</span>
                  <span>{post.view_count || 0} views</span>
                </div>
              </div>

              {/* Service CTA */}
              {post.service && (
                <div className="bg-[#FEF5F2] rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-[#1A1A1A]">{post.service.name}</p>
                      <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.service.duration} min</span>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-[#D97A5F]">${(post.service.price / 100).toFixed(0)}</span>
                  </div>
                  <Link href={user ? `/book/${post.provider?.id}/${post.service.id}` : '/signup'} className="block w-full py-3 bg-gradient-to-r from-[#F4B5A4] to-[#E89580] text-white text-center rounded-xl font-semibold hover:shadow-lg transition-all">
                    <Calendar className="w-5 h-5 inline mr-2" />Book Now
                  </Link>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#F0F0F0]">
                <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${isLiked ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#F7F7F7] text-[#6B6B6B] hover:bg-[#FEF5F2]'}`}>
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} /> Like
                </button>
                <button onClick={handleSave} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${isSaved ? 'bg-[#FEF5F2] text-[#D97A5F]' : 'bg-[#F7F7F7] text-[#6B6B6B] hover:bg-[#FEF5F2]'}`}>
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} /> Save
                </button>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-[#F7F7F7] text-[#6B6B6B] hover:bg-[#FEF5F2]">
                  <Share2 className="w-5 h-5" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">More from {post.provider?.business_name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {relatedPosts.map((p, i) => (
                <Link key={p.id} href={`/post/${p.id}`} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <Image src={p.image_url || PORTFOLIO_PLACEHOLDERS[i % PORTFOLIO_PLACEHOLDERS.length]} alt="" fill className="object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100 flex items-center gap-1"><Heart className="w-4 h-4" />{p.like_count}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

