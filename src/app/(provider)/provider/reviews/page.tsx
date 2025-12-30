'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, Badge, LoadingState, EmptyReviews, PillTabs, Avatar, Modal, Button } from '@/components/ui'
import { StarRating } from '@/components/ui/star-rating'
import { Star, MessageSquare, Send } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  provider_response: string | null
  created_at: string
  customer: {
    id: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
  service: {
    name: string
  } | null
}

interface Stats {
  avgRating: number
  totalReviews: number
  distribution: { stars: number; count: number }[]
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({ avgRating: 0, totalReviews: 0, distribution: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [respondingTo, setRespondingTo] = useState<Review | null>(null)
  const [response, setResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('reviews')
        .select(`
          id, rating, comment, provider_response, created_at,
          customer:customer_profiles!reviews_customer_id_fkey(
            id,
            profiles!customer_profiles_id_fkey(id, first_name, last_name, avatar_url)
          ),
          service:services(name)
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })

      // Transform data to match Review interface (Supabase returns arrays for relations)
      const reviewList = (data || []).map((review: any) => {
        const customerProfile = Array.isArray(review.customer) ? review.customer[0] : review.customer;
        const profile = customerProfile?.profiles;
        return {
          ...review,
          customer: profile ? {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url
          } : null,
          service: Array.isArray(review.service) ? review.service[0] : review.service
        };
      }) as Review[]
      setReviews(reviewList)

      // Calculate stats
      const total = reviewList.length
      const avg = total > 0 ? reviewList.reduce((sum, r) => sum + r.rating, 0) / total : 0
      const dist = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: reviewList.filter(r => r.rating === stars).length,
      }))
      setStats({ avgRating: avg, totalReviews: total, distribution: dist })
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!respondingTo || !response.trim()) return
    setSubmitting(true)

    try {
      await supabase
        .from('reviews')
        .update({ provider_response: response.trim() })
        .eq('id', respondingTo.id)

      setReviews(reviews.map(r => r.id === respondingTo.id ? { ...r, provider_response: response.trim() } : r))
      setRespondingTo(null)
      setResponse('')
    } catch (error) {
      console.error('Error responding:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredReviews = activeTab === 'All' 
    ? reviews 
    : activeTab === 'Responded' 
      ? reviews.filter(r => r.provider_response) 
      : reviews.filter(r => !r.provider_response)

  if (loading) return <LoadingState message="Loading reviews..." />

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FEF5F2] rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-[#D97A5F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Reviews</h1>
              <p className="text-sm text-[#6B6B6B]">{stats.totalReviews} reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#1A1A1A]">{stats.avgRating.toFixed(1)}</p>
            <StarRating rating={stats.avgRating} size="sm" />
            <p className="text-sm text-[#6B6B6B] mt-1">{stats.totalReviews} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {stats.distribution.map(({ stars, count }) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm text-[#6B6B6B] w-3">{stars}</span>
                <Star className="w-3 h-3 text-[#F59E0B]" fill="#F59E0B" />
                <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%` }} />
                </div>
                <span className="text-sm text-[#9E9E9E] w-6">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4">
        <PillTabs tabs={['All', 'Pending', 'Responded']} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Reviews list */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {filteredReviews.length === 0 ? (
          <EmptyReviews />
        ) : (
          filteredReviews.map((review) => {
            const customerName = review.customer ? `${review.customer.first_name || ''} ${review.customer.last_name || ''}`.trim() || 'Customer' : 'Customer';
            return (
            <Card key={review.id}>
              <div className="flex items-start gap-3">
                <Avatar src={review.customer?.avatar_url} name={customerName} size="md" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[#1A1A1A]">{customerName}</h3>
                    <span className="text-xs text-[#9E9E9E]">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={review.rating} size="sm" className="mt-1" />
                  {review.service && <Badge variant="secondary" size="sm" className="mt-2">{review.service.name}</Badge>}
                  {review.comment && <p className="text-[#6B6B6B] mt-2">{review.comment}</p>}
                  
                  {review.provider_response ? (
                    <div className="mt-3 p-3 bg-[#FEF5F2] rounded-xl">
                      <p className="text-sm font-medium text-[#D97A5F] mb-1">Your response:</p>
                      <p className="text-sm text-[#6B6B6B]">{review.provider_response}</p>
                    </div>
                  ) : (
                    <button onClick={() => setRespondingTo(review)} className="mt-3 flex items-center gap-1 text-sm text-[#D97A5F] hover:underline">
                      <MessageSquare className="w-4 h-4" /> Respond
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );})
        )}
      </div>

      {/* Response modal */}
      <Modal isOpen={!!respondingTo} onClose={() => setRespondingTo(null)} title="Respond to Review">
        <div className="space-y-4">
          {respondingTo && (
            <div className="p-3 bg-[#F7F7F7] rounded-xl">
              <p className="text-sm text-[#6B6B6B]">"{respondingTo.comment}"</p>
              <p className="text-xs text-[#9E9E9E] mt-1">- {respondingTo.customer ? `${respondingTo.customer.first_name || ''} ${respondingTo.customer.last_name || ''}`.trim() || 'Customer' : 'Customer'}</p>
            </div>
          )}
          <textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Write your response..." rows={4} className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none resize-none" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setRespondingTo(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleRespond} isLoading={submitting} disabled={!response.trim()} className="flex-1"><Send className="w-4 h-4 mr-2" />Send</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

