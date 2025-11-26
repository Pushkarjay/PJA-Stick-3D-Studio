import { Package, Star, Zap, Eye } from 'lucide-react'
import { useCart } from '../hooks/useCart'

export default function ProductCard({ product, style, onProductClick }) {
  const { addToCart, isInCart } = useCart()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    // For simplicity, let's add the base variant if it exists, or just the product.
    // A more complex UI would let the user choose.
    const variant = product.variants?.[0] || null;
    addToCart(product, 1, variant);
  }

  const handleCardClick = () => {
    onProductClick(product);
  }

  const renderPrice = () => {
    // Support both flat fields and nested pricing object
    const basePrice = product.pricing?.basePrice || product.actualPrice || product.price;
    const discountedPrice = product.pricing?.discountedPrice || product.discountedPrice;
    const hasDiscount = discountedPrice && basePrice && discountedPrice < basePrice;
    
    if (hasDiscount) {
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">₹{Math.round(discountedPrice)}</span>
          <span className="text-lg font-medium text-slate-400 line-through">₹{Math.round(basePrice)}</span>
        </div>
      )
    }
    if (basePrice > 0) {
      return <span className="text-2xl font-bold text-slate-900">₹{Math.round(basePrice)}</span>
    }
    return <span className="text-slate-500 text-sm">Price on request</span>
  }

  const averageRating = product.stats?.averageRating || product.averageRating || 0;
  const reviewCount = product.stats?.reviewCount || product.reviewCount || 0;
  const stockStatus = product.stockQty > 0 ? 'In Stock' : 'Out of Stock';
  
  // Calculate discount percentage for badge
  const basePrice = product.pricing?.basePrice || product.actualPrice || product.price;
  const discountedPrice = product.pricing?.discountedPrice || product.discountedPrice;
  const hasDiscount = discountedPrice && basePrice && discountedPrice < basePrice;
  const discountPercent = hasDiscount ? Math.round(((basePrice - discountedPrice) / basePrice) * 100) : 0;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
      style={style}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick()
        }
      }}
      aria-label={`View details for ${product.name}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {(product.imageUrls?.length > 0 || product.imageUrl) ? (
          <img
            src={product.imageUrls?.[0] || product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-slate-300" />
          </div>
        )}
        {/* Overlay with View Details */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
           <div className="text-center">
             <Eye className="w-10 h-10 text-white mx-auto mb-2" />
             <p className="font-semibold text-white">View Details</p>
           </div>
        </div>
        {/* Tags & Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && discountPercent > 0 && (
            <span className="badge badge-accent shadow-md">SAVE {discountPercent}%</span>
          )}
          {product.isFeatured && (
            <span className="badge badge-secondary shadow-md">Featured</span>
          )}
          {product.tags?.includes('New Arrival') && (
            <span className="badge badge-info shadow-md">New</span>
          )}
        </div>
         <div className="absolute bottom-2 right-2">
            <button
                onClick={handleAddToCart}
                disabled={!product.isActive || stockStatus === 'Out of Stock'}
                className="btn btn-primary btn-sm rounded-full shadow-lg"
                aria-label={`Add ${product.name} to cart`}
            >
                {isInCart(product.id) ? 'Added ✓' : 'Add to Cart'}
            </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          {/* Category */}
          <p className="mb-1 text-sm font-medium text-primary-600">{product.category}</p>
          {/* Name */}
          <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-2 h-[3.2rem]">
            {product.name}
          </h3>
          {/* Rating */}
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Star className={`w-4 h-4 ${averageRating > 0 ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-slate-400">({reviewCount} reviews)</span>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="mt-4 flex items-end justify-between">
          {renderPrice()}
          <div className={`flex items-center gap-1 text-sm font-medium ${stockStatus === 'In Stock' ? 'text-green-600' : 'text-red-600'}`}>
            <Zap className="w-4 h-4" />
            <span>{stockStatus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
