import { X, Clock, Package, MessageCircle, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../hooks/useCart'
import { openWhatsApp, formatProductMessage } from '../utils/whatsapp'

export default function ProductModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  if (!product) return null

  const handleAddToCart = () => {
    addToCart(product, quantity)
    onClose()
  }

  const handleWhatsAppOrder = () => {
    const message = formatProductMessage(product, quantity)
    openWhatsApp(message)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <h2 id="product-modal-title" className="text-xl font-bold text-slate-900">
            Product Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-slate-300" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-3xl font-display font-bold text-slate-900">
                    {product.name}
                  </h3>
                  {product.category && (
                    <span className="badge badge-info">{product.category}</span>
                  )}
                </div>
                {product.subCategory && (
                  <p className="text-sm text-slate-600 mb-3">{product.subCategory}</p>
                )}
                {product.description && (
                  <p className="text-slate-700 leading-relaxed">{product.description}</p>
                )}
              </div>

              {/* Specifications */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Price Tier</span>
                  <span className="text-lg font-bold text-primary-600">{product.priceTier}</span>
                </div>

                {product.difficulty && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Difficulty</span>
                    <span className="badge badge-info">{product.difficulty}</span>
                  </div>
                )}

                {product.productionTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Production Time</span>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-1 text-slate-600" />
                      {product.productionTime}
                    </div>
                  </div>
                )}

                {product.material && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Material</span>
                    <span className="text-sm font-medium">{product.material}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Stock Status</span>
                  {product.isActive && product.stockQty > 0 ? (
                    <span className="badge badge-success">
                      {product.stockQty <= 5 ? `Only ${product.stockQty} left` : 'In Stock'}
                    </span>
                  ) : (
                    <span className="badge badge-error">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              {product.isActive && product.stockQty > 0 && (
                <div className="flex items-center gap-4">
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
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {product.isActive && product.stockQty > 0 ? (
                  <>
                    <button
                      onClick={handleWhatsAppOrder}
                      className="btn btn-primary w-full text-base py-3"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Request on WhatsApp
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="btn btn-outline w-full text-base py-3"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                  </>
                ) : (
                  <button disabled className="btn w-full text-base py-3 opacity-50 cursor-not-allowed">
                    Currently Unavailable
                  </button>
                )}
              </div>

              {/* Additional Info */}
              <div className="text-sm text-slate-600 space-y-2">
                <p>✓ Custom designs available</p>
                <p>✓ Quality guaranteed</p>
                <p>✓ Fast delivery at Suresh Singh Chowk</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
