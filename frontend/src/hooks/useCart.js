import { createContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, loading } = useAuth();

  const fetchCart = useCallback(async () => {
    if (user) {
      try {
        const { data } = await apiRequest('/cart');
        if (data && data.items) {
          setCartItems(data.items);
        }
      } catch (error) {
        console.error('Failed to fetch cart from backend:', error);
        // If backend fails, fall back to localStorage
        const localCart = localStorage.getItem('cart');
        setCartItems(localCart ? JSON.parse(localCart) : []);
      }
    } else {
      const localCart = localStorage.getItem('cart');
      setCartItems(localCart ? JSON.parse(localCart) : []);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      fetchCart();
    }
  }, [user, loading, fetchCart]);

  const persistCart = useCallback(async (items) => {
    setCartItems(items);
    if (user) {
      try {
        await apiRequest('/cart', { method: 'POST', body: { items } });
      } catch (error) {
        console.error('Failed to save cart to backend:', error);
        // Fallback to localStorage if backend fails
        localStorage.setItem('cart', JSON.stringify(items));
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [user]);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    let newCartItems;
    if (existingItem) {
      newCartItems = cartItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCartItems = [...cartItems, { product, quantity }];
    }
    persistCart(newCartItems);
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    const newCartItems = cartItems.filter(item => item.product.id !== productId);
    persistCart(newCartItems);
    toast.error('Item removed from cart.');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    const newCartItems = cartItems.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    persistCart(newCartItems);
  };
  
  const clearCart = () => {
    persistCart([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => {
        const price = item.product.pricing?.discountedPrice || item.product.pricing?.basePrice || 0;
        return total + price * item.quantity;
    }, 0);
  };

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
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
