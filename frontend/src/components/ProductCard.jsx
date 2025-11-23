import { Clock, Package } from 'lucide-react'
import { useCart } from '../hooks/useCart'

export default function ProductCard({ product, onClick, style }) {
  const { addToCart, isInCart } = useCart()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product, 1)
  }

  // Determine stock status badge
  const getStockBadge = () => {
    if (!product.isActive) {
      return <span className="badge badge-error">Unavailable</span>
    }
    if (product.stockQty === 0) {
      return <span className="badge badge-warning">Out of Stock</span>
    }
    if (product.stockQty <= 5) {
      return <span className="badge badge-warning">Low Stock</span>
    }
    return <span className="badge badge-success">In Stock</span>
  }

  // Determine difficulty badge color
  const getDifficultyColor = () => {
    switch (product.difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer animate-slide-up"
      style={style}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick()
        }
      }}
      aria-label={`View details for ${product.name}`}
    >
      {/* Product Image */}
      <div className="relative mb-4 overflow-hidden rounded-lg bg-slate-100 aspect-square">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-slate-300" />
          </div>
        )}
        
        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-2 left-2">
            <span className="badge bg-white/90 text-slate-900 backdrop-blur-sm">
              {product.category}
            </span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          {getStockBadge()}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-slate-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-slate-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Price Tier */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            {product.priceTier}
          </span>
          {product.difficulty && (
            <span className={`badge ${getDifficultyColor()}`}>
              {product.difficulty}
            </span>
          )}
        </div>

        {/* Production Time */}
        {product.productionTime && (
          <div className="flex items-center text-sm text-slate-600">
            <Clock className="w-4 h-4 mr-1" />
            {product.productionTime}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.isActive || product.stockQty === 0}
            className="btn btn-primary flex-1 text-sm"
            aria-label={`Add ${product.name} to cart`}
          >
            {isInCart(product.id) ? 'Added' : 'Add to Cart'}
          </button>
          <button
            onClick={onClick}
            className="btn btn-outline text-sm"
            aria-label={`View ${product.name} details`}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  )
}
