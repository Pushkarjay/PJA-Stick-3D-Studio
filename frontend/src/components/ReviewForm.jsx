import { useState } from 'react';
import { apiRequest } from '../lib/api';
import { Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          rating,
          title,
          comment,
        }),
      });
      toast.success('Review submitted successfully!');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 animate-fade-in">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Write your review</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating*</label>
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <button
                  type="button"
                  key={starValue}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      starValue <= (hoverRating || rating)
                        ? 'text-yellow-400'
                        : 'text-slate-300'
                    }`}
                    fill="currentColor"
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="review-title" className="block text-sm font-medium text-slate-700 mb-1">
            Review Title
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Excellent quality!"
            className="input w-full"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="review-comment" className="block text-sm font-medium text-slate-700 mb-1">
            Your Comment
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            placeholder="Share your thoughts about the product..."
            className="textarea w-full"
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <span className="spinner-sm"></span>
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
}
