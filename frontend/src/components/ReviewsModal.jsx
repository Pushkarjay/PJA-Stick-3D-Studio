import { Star } from 'lucide-react'

export default function ReviewsModal({ reviews = [], onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close reviews modal"
        >
          ✕
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Product Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-slate-600">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-slate-300'}`} />
                    ))}
                    <span className="ml-2 text-sm text-slate-700 font-medium">{review.userName || 'Anonymous'}</span>
                  </div>
                  <div className="text-slate-800 font-semibold mb-1">{review.title}</div>
                  <div className="text-slate-600 text-sm mb-1">{review.comment}</div>
                  <div className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
