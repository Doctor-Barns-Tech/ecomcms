'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cachedQuery, invalidateCache } from '@/lib/query-cache';
import { useRecaptcha } from '@/hooks/useRecaptcha';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  content: string;
  helpful: number;
  user_id: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [filter, setFilter] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const { getToken, verifying } = useRecaptcha();

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchReviews = async () => {
    try {
      // Fetch approved reviews (cached for 5 minutes)
      const { data, error } = await cachedQuery<{ data: any; error: any }>(
        `reviews:${productId}`,
        (() => supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })) as any,
        5 * 60 * 1000
      );

      if (error) throw error;

      if (data) {
        const formattedReviews = data.map((r: any) => ({
          id: r.id,
          author: 'Verified Customer',
          rating: r.rating,
          date: r.created_at,
          verified: r.verified_purchase,
          title: r.title,
          content: r.content,
          helpful: r.helpful_votes || 0,
          user_id: r.user_id
        }));
        setReviews(formattedReviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    return {
      star,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
    };
  });

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter));

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    const isHuman = await getToken('review');
    if (!isHuman) {
      alert('Security verification failed. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert([{
        product_id: productId,
        user_id: user.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        content: reviewForm.content,
        status: 'approved', // Auto-approve for demo
        verified_purchase: false
      }]);

      if (error) throw error;

      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', content: '' });
      invalidateCache(`reviews:${productId}`);
      fetchReviews();

    } catch (err: any) {
      console.error('Submit review error:', err);
      alert('Failed to submit review: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500 font-light">Loading reviews...</div>;

  return (
    <div className="bg-white">
      {reviews.length === 0 && !showReviewForm ? (
        <div className="text-center py-12 border border-dashed border-gray-200">
          <p className="text-gray-500 mb-6 font-light">No reviews yet. Be the first to verify this quality.</p>
          <button
            onClick={() => setShowReviewForm(true)}
            className="border border-black text-black px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors"
          >
            Write a Review
          </button>
        </div>
      ) : (
        <>
          {!showReviewForm && (
            <div className="grid md:grid-cols-12 gap-12 mb-16 pb-12 border-b border-gray-100">
              <div className="md:col-span-4 text-center md:text-left">
                <div className="text-6xl font-serif text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center md:justify-start gap-1 mb-4 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`ri-star-${star <= Math.round(averageRating) ? 'fill' : 'line'} text-xl`}
                    ></i>
                  ))}
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">{reviews.length} Reviews</p>
              </div>

              <div className="md:col-span-8">
                <div className="space-y-3">
                  {ratingDistribution.map((dist) => (
                    <button
                      key={dist.star}
                      onClick={() => setFilter(dist.star.toString())}
                      className="flex items-center w-full group"
                    >
                      <span className="text-xs font-medium w-8 text-gray-500">{dist.star} ★</span>
                      <div className="flex-1 h-1.5 bg-gray-100 mx-3 relative overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gray-900 transition-all duration-500"
                          style={{ width: `${dist.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right underline opacity-0 group-hover:opacity-100 transition-opacity">Filter</span>
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-end gap-4">
                  {filter !== 'all' && (
                    <button
                      onClick={() => setFilter('all')}
                      className="text-xs text-gray-500 underline hover:text-black"
                    >
                      Clear Filter
                    </button>
                  )}
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
                  >
                    Write a Review
                  </button>
                </div>
              </div>
            </div>
          )}

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="bg-gray-50 p-8 mb-12 border border-gray-100 max-w-2xl mx-auto">
              <h3 className="font-serif text-2xl text-gray-900 mb-6 text-center">Share your experience</h3>

              <div className="mb-6 text-center">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Rate the Product</label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <i
                        className={`ri-star-${star <= reviewForm.rating ? 'fill' : 'line'} text-3xl ${star <= reviewForm.rating ? 'text-amber-400' : 'text-gray-300'
                          }`}
                      ></i>
                    </button>
                  ))}
                </div>
              </div>

              {!user && (
                <div className="mb-6 p-4 bg-white border border-red-100 text-red-600 text-sm text-center">
                  You must be logged in to submit a review.
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-black transition-colors"
                  placeholder="Review Title"
                  required
                  disabled={!user}
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Review</label>
                <textarea
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="Tell us what you think..."
                  required
                  disabled={!user}
                ></textarea>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-12">
            {filteredReviews.map((review) => (
              <div key={review.id} className="grid md:grid-cols-12 gap-6 border-b border-gray-100 pb-12 last:border-0">
                <div className="md:col-span-3">
                  <div className="flex flex-col">
                    <span className="font-serif text-lg text-gray-900 mb-1">{review.author}</span>
                    {review.verified && (
                      <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-medium mb-2">
                        Verified Buyer
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="md:col-span-9">
                  <div className="flex mb-3 text-amber-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={i < review.rating ? "ri-star-fill" : "ri-star-line text-gray-200"}></i>
                    ))}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                  <p className="text-gray-600 leading-relaxed max-w-3xl font-light">{review.content}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
