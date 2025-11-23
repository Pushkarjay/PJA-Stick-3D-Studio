import { X, Trash2, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartCount } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-slide-left flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Your Cart ({getCartCount()})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag className="w-20 h-20 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Your cart is empty</h3>
              <p className="text-slate-600 mb-6">Add some products to get started!</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-primary-600 font-medium mb-2">
                        {item.product.priceTier}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded border border-slate-300 hover:border-primary-600 hover:text-primary-600 transition-colors text-sm font-bold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stockQty}
                          className="w-7 h-7 rounded border border-slate-300 hover:border-primary-600 hover:text-primary-600 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors self-start"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Total Items:</span>
              <span className="font-semibold">{getCartCount()}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary w-full text-base py-3"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Proceed to Checkout
            </button>

            <p className="text-xs text-center text-slate-500">
              Final price will be confirmed via WhatsApp
            </p>
          </div>
        )}
      </div>
    </>
  )
}
