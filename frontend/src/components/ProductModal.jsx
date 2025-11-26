import { X, ShoppingCart, Star, Share2, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../hooks/useCart';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

const StarRating = ({ rating, size = 'w-5 h-5' }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-slate-300'}`}
        fill="currentColor"
      />
    ))}
  </div>
);

const ProductImageGallery = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-slate-100 rounded-lg flex items-center justify-center">
        <span className="text-slate-400">No Image</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      <div className="aspect-square w-full overflow-hidden rounded-xl shadow-lg bg-slate-100">
        <img
          src={images[currentIndex]}
          alt={`${productName} - image ${currentIndex + 1}`}
          className="w-full h-full object-contain transition-opacity duration-300"
        />
      </div>
      {images.length > 1 && (
        <>
          <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow-md hover:bg-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow-md hover:bg-white">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-primary-600' : 'bg-slate-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CustomerReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('Most Recent');

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiRequest(`/api/reviews/${productId}`);
            let sortedReviews = response.data?.reviews || response.data || [];
            if (sort === 'Highest Rating') {
                sortedReviews.sort((a, b) => b.rating - a.rating);
            } else if (sort === 'Lowest Rating') {
                sortedReviews.sort((a, b) => a.rating - b.rating);
            }
            // Default is most recent, which the API should provide
            setReviews(sortedReviews);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    }, [productId, sort]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const overallRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

    return (
        <div className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4">
                <h3 className="text-2xl font-bold text-slate-800">Customer Reviews</h3>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-4">
                        <StarRating rating={overallRating} />
                        <span className="text-slate-600">{overallRating.toFixed(1)} out of 5 ({reviews.length} reviews)</span>
                    </div>
                )}
            </div>

            {loading ? (
                <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <p className="text-slate-500">No reviews yet for this product.</p>
            ) : (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review.id} className="border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                                    {review.reviewerName ? review.reviewerName.charAt(0) : 'A'}
                                </div>
                                <div>
                                    <p className="font-semibold">{review.reviewerName || 'Anonymous'}</p>
                                    <StarRating rating={review.rating} size="w-4 h-4" />
                                </div>
                                <p className="text-sm text-slate-500 ml-auto">{new Date(review.createdAt.seconds * 1000).toLocaleDateString()}</p>
                            </div>
                            <p className="mt-2 text-slate-700">{review.reviewText}</p>
                            {/* Review images could be displayed here */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setQuantity(1); // Reset quantity when a new product is opened
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} x ${product.name} added to cart!`);
    onClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this product: ${product.name}`,
        url: window.location.href, // This will be the base URL, might need adjustment for product pages
      }).catch(console.error);
    } else {
      toast('Share feature not available on this device.');
    }
  };

  // Support both flat fields and nested pricing object
  const basePrice = product.pricing?.basePrice || product.actualPrice || product.price || 0;
  const discountedPrice = product.pricing?.discountedPrice || product.discountedPrice || basePrice;
  const hasDiscount = discountedPrice && basePrice && discountedPrice < basePrice;
  const baseDiscountPercent = product.pricing?.discountBreakdown?.baseDiscount || product.baseDiscount || 0;
  const extraDiscountPercent = product.pricing?.discountBreakdown?.extraDiscount || product.extraDiscount || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-slide-up-fast"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-slate-800 truncate pr-4">{product.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <ProductImageGallery images={product.imageUrls || (product.imageUrl ? [product.imageUrl] : [])} productName={product.name} />

            <div className="flex flex-col">
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">{product.name}</h1>
                
                {product.stats?.reviewCount > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={product.stats.averageRating} />
                    <span className="text-slate-600 text-sm">{product.stats.averageRating.toFixed(1)} ({product.stats.reviewCount} reviews)</span>
                  </div>
                )}

                <div className="mb-4">
                    {hasDiscount ? (
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-primary-600">₹{Math.round(discountedPrice)}</span>
                            <span className="text-xl font-medium text-slate-400 line-through">₹{Math.round(basePrice)}</span>
                        </div>
                    ) : (
                        basePrice > 0 && <span className="text-4xl font-bold text-slate-900">₹{Math.round(basePrice)}</span>
                    )}
                    {(baseDiscountPercent > 0 || extraDiscountPercent > 0) && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                            Includes {baseDiscountPercent}% base + {extraDiscountPercent}% extra discount
                        </p>
                    )}
                </div>

                {product.description && <p className="text-slate-600 mt-4" dangerouslySetInnerHTML={{ __html: product.description }} />}

                <div className="mt-6 border-t pt-4 space-y-3">
                    {product.category && <p><strong>Category:</strong> {product.category}</p>}
                    {product.subCategory && <p><strong>Subcategory:</strong> {product.subCategory}</p>}
                    {product.productionTime && <p><strong>Production Time:</strong> {product.productionTime} days</p>}
                    {product.stockQty !== undefined && <p><strong>Availability:</strong> {product.stockQty > 0 ? `${product.stockQty} in stock` : 'Available on backorder'}</p>}
                    {product.difficulty && <p><strong>Difficulty:</strong> {product.difficulty}</p>}
                    {product.priceTier && <p><strong>Price Tier:</strong> {product.priceTier}</p>}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-slate-600 hover:bg-slate-100 rounded-l-lg"><Minus size={16}/></button>
                    <span className="px-4 font-semibold text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-slate-600 hover:bg-slate-100 rounded-r-lg"><Plus size={16}/></button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button onClick={handleShare} className="btn btn-outline p-3">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <CustomerReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}
