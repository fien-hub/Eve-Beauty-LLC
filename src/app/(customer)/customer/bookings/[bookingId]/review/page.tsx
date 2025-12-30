'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Loader2, CheckCircle } from 'lucide-react';

export default function SubmitReviewPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('bookings')
        .select(`
          id, status, scheduled_date, scheduled_time,
          provider_services(services(name)),
          provider:provider_profiles!bookings_provider_id_fkey(id, business_name, avatar_url),
          review:reviews(id)
        `)
        .eq('id', bookingId)
        .eq('customer_id', user.id)
        .single();

      if (data?.review) {
        setSubmitted(true);
      }
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        provider_id: booking.provider.id,
        customer_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      // Update provider's average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('provider_id', booking.provider.id);

      if (reviews) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await supabase
          .from('provider_profiles')
          .update({ rating: avgRating, total_reviews: reviews.length })
          .eq('id', booking.provider.id);
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4B5A4]"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Booking not found</h2>
          <Link href="/customer/bookings" className="text-[#D97A5F] hover:underline">Back to bookings</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-md w-full">
          <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#10B981]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Thank You!</h2>
          <p className="text-[#6B6B6B] mb-6">Your review has been submitted successfully.</p>
          <Link href="/customer/bookings"
            className="inline-block bg-[#F4B5A4] text-[#1A1A1A] px-6 py-3 rounded-xl font-semibold hover:bg-[#E89580] transition-colors">
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/customer/bookings" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Leave a Review</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Provider Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
          {booking.provider?.avatar_url ? (
            <img src={booking.provider.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#FCE5DF] flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-[#D97A5F]">
              {booking.provider?.business_name?.[0]}
            </div>
          )}
          <h2 className="text-lg font-bold text-[#1A1A1A]">{booking.provider?.business_name}</h2>
          <p className="text-[#6B6B6B]">{(booking.provider_services as any)?.services?.name}</p>
        </div>
        {/* Rating */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4 text-center">How was your experience?</h3>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110">
                <Star className={`w-10 h-10 transition-colors ${(hoverRating || rating) >= star ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#E5E5E5]'}`} />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-[#6B6B6B]">
            {rating === 0 ? 'Tap to rate' : rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
          </p>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Share your thoughts (optional)</h3>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience..." rows={4}
            className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors resize-none" />
        </div>

        {/* Submit Button */}
        <button onClick={handleSubmit} disabled={submitting || rating === 0}
          className="w-full flex items-center justify-center gap-2 bg-[#F4B5A4] text-[#1A1A1A] py-4 rounded-xl font-bold hover:bg-[#E89580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}

