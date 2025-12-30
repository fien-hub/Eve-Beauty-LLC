'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Bookmark, Share2, CheckCircle, Loader2, Sparkles, TrendingUp, Flame, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAvatarUrl, PORTFOLIO_PLACEHOLDERS } from '@/lib/images';

interface Post {
  id: string;
  image_url: string;
  caption: string;
  like_count: number;
  created_at: string;
  provider: {
    id: string;
    business_name: string;
    is_verified: boolean;
    avatar_url: string | null;
  };
  service?: { id: string; name: string };
}

export default function ProviderHomePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for_you' | 'trending'>('for_you');
  const [posts, setPosts] = useState<Post[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
    fetchPosts();
  }, [activeTab]);

  const checkVerificationStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('identity_verification_status')
      .eq('user_id', user.id)
      .single();

    setVerificationStatus(provider?.identity_verification_status || 'not_started');
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('portfolio_items')
        .select(`
          id, image_url, caption, like_count, created_at,
          provider:provider_profiles!portfolio_items_provider_id_fkey(
            id, business_name, is_verified, avatar_url
          ),
          service:services!portfolio_items_service_id_fkey(id, name)
        `)
        .eq('is_visible', true);

      if (activeTab === 'trending') {
        query = query.order('like_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      
      const transformedPosts = (data || []).map((post: any) => ({
        ...post,
        provider: Array.isArray(post.provider) ? post.provider[0] : post.provider,
        service: Array.isArray(post.service) ? post.service[0] : post.service
      }));
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const needsVerification = verificationStatus && verificationStatus !== 'approved';

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Eve Beauty Pro</h1>
          </div>
          <div className="flex gap-2 bg-[#F7F7F7] p-1 rounded-xl">
            <button onClick={() => setActiveTab('for_you')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'for_you' ? 'bg-white text-[#D97A5F] shadow-sm' : 'text-[#6B6B6B]'}`}>
              <TrendingUp className="w-4 h-4" /> For You
            </button>
            <button onClick={() => setActiveTab('trending')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'trending' ? 'bg-white text-[#D97A5F] shadow-sm' : 'text-[#6B6B6B]'}`}>
              <Flame className="w-4 h-4" /> Trending
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Verification Banner */}
        {needsVerification && showBanner && (
          <div className="bg-[#FFF3CD] border border-[#FFE69C] rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#856404] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-[#856404]">
                  {verificationStatus === 'under_review' ? 'Verification Pending' : 'Verify Your Identity'}
                </h3>
                <p className="text-sm text-[#856404] mt-1">
                  {verificationStatus === 'under_review'
                    ? "Your documents are under review. You'll be visible to customers once approved."
                    : "You're not visible to customers yet. Verify your identity to start receiving bookings."}
                </p>
                {verificationStatus !== 'under_review' && (
                  <Link href="/provider/kyc" className="inline-flex items-center gap-2 bg-[#F4B5A4] text-black px-4 py-2 rounded-xl text-sm font-semibold mt-3 hover:bg-[#E89580] transition-all">
                    <ShieldCheck className="w-4 h-4" /> Verify Now
                  </Link>
                )}
              </div>
              <button onClick={() => setShowBanner(false)} className="text-[#856404] hover:text-[#6B5303]">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Feed Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#F4B5A4] mb-4" />
            <p className="text-[#6B6B6B]">Loading feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <Sparkles className="w-16 h-16 text-[#D97A5F] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">No posts yet</h2>
            <p className="text-[#6B6B6B]">Check back later for inspiration</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => {
              const providerAvatar = post.provider?.avatar_url || getAvatarUrl(post.provider?.business_name || 'Provider', 80);
              const postImage = post.image_url || PORTFOLIO_PLACEHOLDERS[index % PORTFOLIO_PLACEHOLDERS.length];
              return (
                <div key={post.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                  <div className="p-4 flex items-center gap-3">
                    <Link href={`/provider/${post.provider?.id}`}>
                      <Image src={providerAvatar} alt="" width={48} height={48} className="w-12 h-12 rounded-xl object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/provider/${post.provider?.id}`} className="flex items-center gap-1.5 font-semibold text-[#1A1A1A] hover:text-[#D97A5F]">
                        {post.provider?.business_name}
                        {post.provider?.is_verified && <CheckCircle className="w-4 h-4 text-[#10B981]" />}
                      </Link>
                      <p className="text-xs text-[#9E9E9E]">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                    </div>
                    <button className="p-2 hover:bg-[#F7F7F7] rounded-lg"><Share2 className="w-5 h-5 text-[#6B6B6B]" /></button>
                  </div>
                  <Link href={`/post/${post.id}`}>
                    <div className="relative aspect-square"><Image src={postImage} alt={post.caption || ''} fill className="object-cover" /></div>
                  </Link>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#6B6B6B]">
                        <Heart className="w-5 h-5" /> <span className="text-sm font-medium">{post.like_count}</span>
                      </div>
                      <Bookmark className="w-5 h-5 text-[#6B6B6B]" />
                    </div>
                    {post.caption && <p className="text-sm text-[#1A1A1A]"><span className="font-bold">{post.provider?.business_name}</span> {post.caption}</p>}
                    {post.service && <span className="inline-block mt-2 text-xs font-semibold text-[#D97A5F] bg-[#FEF5F2] px-3 py-1 rounded-full">{post.service.name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

