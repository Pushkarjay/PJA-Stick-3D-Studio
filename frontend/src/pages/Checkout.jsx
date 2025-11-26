import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, CheckCircle2 } from 'lucide-react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useCart } from '../hooks/useCart'
import { apiRequest } from '../lib/api';
import { openWhatsApp, formatCheckoutMessage } from '../utils/whatsapp'

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, clearCart, getCartSubtotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [siteSettings, setSiteSettings] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await apiRequest('/api/settings');
        setSiteSettings(response.data || response);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };
    fetchSiteSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits required)'
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms and conditions'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!')
      navigate('/')
      return
    }

    try {
      setLoading(true)

      // Create order in backend
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          priceTier: item.product.priceTier,
        })),
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        },
        notes: formData.notes,
      }

      const response = await apiRequest('/api/orders', { 
        method: 'POST',
        body: JSON.stringify(orderData) 
      });
      setOrderId(response.orderId)
      setOrderComplete(true)

      // Open WhatsApp with pre-filled message
      const message = formatCheckoutMessage(cartItems, formData, response.orderId)
      openWhatsApp(message, siteSettings?.contact?.phone)

      // Clear cart after successful order
      clearCart()

    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Order Complete Screen
  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">
                  Order Placed Successfully!
                </h1>
                <p className="text-slate-600 mb-6">
                  Your order <span className="font-semibold">#{orderId}</span> has been created.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <p className="text-sm text-blue-900">
                    <strong>Next Steps:</strong> A WhatsApp chat should have opened with your order details. 
                    Please send the message to confirm your order and receive payment instructions.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const message = formatCheckoutMessage(
                        cartItems.map(item => ({
                          product: item.product,
                          quantity: item.quantity
                        })),
                        formData,
                        orderId
                      )
                      openWhatsApp(message, siteSettings?.contact?.phone)
                    }}
                    className="btn btn-primary w-full text-base py-3"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Open WhatsApp Again
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="btn btn-outline w-full text-base py-3"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer
          description={siteSettings?.description}
          socialLinks={siteSettings?.socialLinks}
          contact={siteSettings?.contact}
        />
      </div>
    )
  }

  // Checkout Form
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-600 hover:text-primary-600 transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <h1 className="text-3xl font-display font-bold text-slate-900">Checkout</h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                  {/* Customer Details */}
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Customer Details</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`input ${errors.name ? 'border-red-500' : ''}`}
                          placeholder="John Doe"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`input ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="john@example.com"
                          />
                          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`input ${errors.phone ? 'border-red-500' : ''}`}
                            placeholder="+91 9876543210"
                          />
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                          Address *
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={3}
                          className={`input ${errors.address ? 'border-red-500' : ''}`}
                          placeholder="Street address, apartment, etc."
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="input"
                            placeholder="City"
                          />
                        </div>

                        <div>
                          <label htmlFor="pincode" className="block text-sm font-medium text-slate-700 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            className="input"
                            placeholder="123456"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                          Order Notes (Optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={3}
                          className="input"
                          placeholder="Any special instructions..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="border-t border-slate-200 pt-6">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <span className="text-sm text-slate-600">
                        I agree to the{' '}
                        <a href="/terms" className="text-primary-600 hover:underline">
                          Terms & Conditions
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-primary-600 hover:underline">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || cartItems.length === 0}
                    className="btn btn-primary w-full text-base py-3"
                  >
                    {loading ? (
                      <>
                        <div className="spinner mr-2" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Place Order via WhatsApp
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Summary</h2>
                  
                  {cartItems.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {cartItems.map((item) => (
                          <div key={item.product.id} className="flex gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              {(item.product.imageUrls?.[0] || item.product.imageUrl) ? (
                                <img
                                  src={item.product.imageUrls?.[0] || item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-slate-400 text-xs">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-900 text-sm truncate">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                              <p className="text-sm font-medium text-primary-600">
                                {item.product.priceTier}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Subtotal:</span>
                          <span className="font-medium">
                            ₹{getCartSubtotal().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Total Items:</span>
                          <span className="font-medium">
                            {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Final price:</span>
                          <span>To be confirmed</span>
                        </div>
                      </div>

                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-xs text-blue-900">
                          💡 Final price and payment details will be shared via WhatsApp
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer 
        description={siteSettings?.description}
        socialLinks={siteSettings?.socialLinks}
        contact={siteSettings?.contact}
      />
    </div>
  )
}
