import { useState, useEffect } from 'react';
import { CartContext } from './CartContext';

// Re-export useCart hook from CartContext
export { useCart } from './CartContext';

/**
 * Cart Provider Component
 * Manages cart state with localStorage persistence
 */
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pja3d_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('pja3d_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pja3d_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Add item to cart or increment quantity if already exists
   * @param {object} product - Product object
   * @param {number} quantity - Quantity to add
   */
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { product, quantity }];
      }
    });
  };

  /**
   * Remove item from cart
   * @param {string} productId
   */
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  /**
   * Update quantity of item in cart
   * @param {string} productId
   * @param {number} quantity
   */
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('pja3d_cart');
  };

  /**
   * Get total number of items in cart
   */
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Get cart subtotal
   */
  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // Prefer discounted price, fall back to regular price
      const price = item.product.pricing?.discountedPrice || item.product.discountedPrice || item.product.price || item.product.pricing?.basePrice || item.product.actualPrice || 0;
      return total + price * item.quantity;
    }, 0);
  };

  /**
   * Check if product is in cart
   * @param {string} productId
   */
  const isInCart = (productId) => {
    return cartItems.some(item => item.product.id === productId);
  };

  /**
   * Get quantity of product in cart
   * @param {string} productId
   */
  const getQuantity = (productId) => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  /**
   * Toggle cart drawer
   */
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartSubtotal,
    isInCart,
    getQuantity,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
