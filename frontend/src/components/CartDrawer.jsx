import { X, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useState } from 'react';
import CheckoutPopup from './CheckoutPopup';
import { useNavigate } from 'react-router-dom';
import { openWhatsApp, formatCartForWhatsApp } from '../utils/whatsapp';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartSubtotal } = useCart();
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const navigate = useNavigate();

  const subtotal = getCartSubtotal();
  const tax = subtotal * 0.05; // Example 5% tax
  const shipping = subtotal > 500 ? 0 : 50; // Example free shipping over 500
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    setShowCheckoutPopup(true);
  };

  const handleWhatsAppOrder = () => {
    const message = formatCartForWhatsApp(cartItems, subtotal, tax, shipping, total);
    openWhatsApp(message); // Assuming openWhatsApp is configured globally
    setShowCheckoutPopup(false);
    setIsCartOpen(false);
  };

  const handleSaveAndLogin = () => {
    setShowCheckoutPopup(false);
    setIsCartOpen(false);
    navigate('/login'); // Or your desired login route
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-slide-left flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="w-20 h-20 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4 items-center">
                  <img src={item.product.images?.[0]} alt={item.product.name} className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-slate-500">₹{item.product.pricing?.discountedPrice || item.product.pricing?.basePrice}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="btn btn-xs btn-outline">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="btn btn-xs btn-outline">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              <button
                onClick={handleCheckout}
                className="w-full btn btn-primary btn-lg mt-4"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>

      {showCheckoutPopup && (
        <CheckoutPopup
          onWhatsApp={handleWhatsAppOrder}
          onSaveAndLogin={handleSaveAndLogin}
          onClose={() => setShowCheckoutPopup(false)}
        />
      )}
    </>
  );
}
