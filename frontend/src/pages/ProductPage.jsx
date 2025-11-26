import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { getProducts } from '../lib/api'
import { useCart } from '../hooks/useCart'
import { ShoppingCart, MessageCircle, ArrowLeft, Star, X } from 'lucide-react'
import { openWhatsApp, formatProductMessage } from '../utils/whatsapp'

// Sample reviews data (replace with API integration as needed)
const sampleReviews = [
  {
    name: 'Amit S.',
    rating: 5,
    comment: 'Amazing quality and fast delivery! Highly recommend.',
  },
  {
    name: 'Priya K.',
    rating: 4,
    comment: 'Loved the custom 3D print. Will order again!',
  },
  {
    name: 'Rahul D.',
    rating: 5,
    comment: 'Great service and support. Product exceeded expectations.',
  },
]

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showReviews, setShowReviews] = useState(false)
  const { addToCart } = useCart()

  // Helper to render stars
  const renderStars = (count) => (
    <span className="inline-flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < count ? 'text-yellow-400' : 'text-slate-300'}`} />
      ))}
    </span>
  )

  useEffect(() => {
    fetchProduct()
    // eslint-disable-next-line
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await getProducts({ isActive: true })
      // API returns { success: true, data: [...] }
      const products = response.data || response.products || [];
      const found = products.find(p => p.id === id)
      setProduct(found)
    } catch (error) {
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="mb-4">The product you are looking for does not exist.</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Back to Products
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const handleWhatsAppOrder = () => {
    const message = formatProductMessage(product, quantity)
    openWhatsApp(message)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 py-12 bg-white">
        <div className="container mx-auto px-4">
          <button onClick={() => navigate(-1)} className="flex items-center mb-6 text-slate-600 hover:text-primary-600">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Product Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-slate-300" />
                </div>
              )}
            </div>
            {/* Product Info */}
            <div className="space-y-6">
              <h1 className="text-3xl font-display font-bold text-slate-900">{product.name}</h1>
              <div className="text-slate-600 mb-2">{product.category}</div>
              <div className="text-lg text-slate-700 mb-4">{product.description}</div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-primary-600">{product.priceTier}</span>
                {product.difficulty && (
                  <span className="badge badge-info">{product.difficulty}</span>
                )}
                {product.productionTime && (
                  <span className="flex items-center text-sm text-slate-600">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {product.productionTime}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-slate-700">Quantity:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-slate-300 hover:border-primary-600 hover:text-primary-600 transition-colors font-bold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                    className="w-10 h-10 rounded-lg border-2 border-slate-300 hover:border-primary-600 hover:text-primary-600 transition-colors font-bold"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleWhatsAppOrder}
                  className="btn btn-primary flex-1 text-base py-3"
                  disabled={!product.isActive || product.stockQty === 0}
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Request on WhatsApp
                </button>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-outline flex-1 text-base py-3"
                  disabled={!product.isActive || product.stockQty === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                </button>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => setShowReviews(true)}
                  className="btn btn-outline text-sm flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                  View Reviews
                </button>
                <span className="text-sm text-slate-600">{sampleReviews.length} reviews</span>
              </div>
              <div className="text-sm text-slate-600 space-y-2 mt-4">
                <p>✓ Custom designs available</p>
                <p>✓ Quality guaranteed</p>
                <p>✓ Fast delivery at Suresh Singh Chowk</p>
              </div>
                  {/* Reviews Modal */}
                  {showReviews && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 relative animate-slide-up">
                        <button
                          onClick={() => setShowReviews(false)}
                          className="absolute top-3 right-3 p-2 hover:bg-slate-100 rounded-lg"
                          aria-label="Close reviews"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <Star className="w-6 h-6 text-yellow-400" />
                          Customer Reviews
                        </h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {sampleReviews.map((review, idx) => (
                            <div key={idx} className="border-b border-slate-100 pb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-900">{review.name}</span>
                                {renderStars(review.rating)}
                              </div>
                              <p className="text-slate-700">{review.comment}</p>
                            </div>
                          ))}
                          {sampleReviews.length === 0 && (
                            <div className="text-slate-500 text-center py-8">No reviews yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
