import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { LogOut, Plus, Edit, Trash2, Upload, Package } from 'lucide-react'
import { auth, db } from '../lib/firebaseClient'
import { getProducts, createProduct, updateProduct, deleteProduct, getUploadUrl, uploadImage, getOrders, updateOrderStatus } from '../lib/api'

export default function Admin() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  
  // Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Products
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)

  // Orders
  const [orders, setOrders] = useState([])

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Check if user is admin
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true)
          fetchData()
        } else {
          setIsAdmin(false)
        }
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchData = async () => {
    if (activeTab === 'products') {
      await fetchProducts()
    } else if (activeTab === 'orders') {
      await fetchOrders()
    }
  }

  const fetchProducts = async () => {
    try {
      const token = await user.getIdToken()
      const data = await getProducts({})
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const token = await user.getIdToken()
      const data = await getOrders(token)
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [activeTab, isAdmin])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setLoginError(error.message)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const token = await user.getIdToken()
      await deleteProduct(productId, token)
      fetchProducts()
    } catch (error) {
      alert('Error deleting product: ' + error.message)
    }
  }

  // Login Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-3xl font-display font-bold mb-2">
              PJA<span className="text-primary-600">3D</span> Admin
            </div>
            <p className="text-slate-600">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}

            <button type="submit" className="btn btn-primary w-full">
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-display font-bold">
                PJA<span className="text-primary-600">3D</span>
              </div>
              <span className="text-sm text-slate-600">Admin Panel</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user.email}</span>
              <button onClick={handleLogout} className="btn btn-ghost">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-primary-600 text-primary-600 font-medium'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-primary-600 text-primary-600 font-medium'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Orders
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Products</h1>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setShowProductForm(true)
                }}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Product</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Category</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Price Tier</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Stock</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{product.name}</div>
                            <div className="text-sm text-slate-600 line-clamp-1">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{product.category}</td>
                      <td className="p-4 text-sm font-medium text-primary-600">{product.priceTier}</td>
                      <td className="p-4 text-sm text-slate-600">{product.stockQty}</td>
                      <td className="p-4">
                        <span className={`badge ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product)
                              setShowProductForm(true)
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-12 text-slate-600">
                  No products found. Add your first product!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Orders</h1>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Order ID</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Items</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-sm font-mono">#{order.id.slice(0, 8)}</td>
                      <td className="p-4 text-sm">
                        <div className="font-medium">{order.customer?.name}</div>
                        <div className="text-slate-600">{order.customer?.phone}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{order.items?.length || 0} items</td>
                      <td className="p-4">
                        <span className={`badge ${
                          order.status === 'completed' ? 'badge-success' :
                          order.status === 'processing' ? 'badge-info' :
                          order.status === 'cancelled' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-12 text-slate-600">
                  No orders yet.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Product Form Modal - Simplified version */}
      {/* Note: Full implementation would include complete form with image upload */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-slate-600">
                Product form implementation here. Include fields for: name, description, category, 
                subCategory, price, priceTier, difficulty, productionTime, stockQty, isActive, 
                and image upload.
              </p>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowProductForm(false)} className="btn btn-outline flex-1">
                  Cancel
                </button>
                <button className="btn btn-primary flex-1">Save Product</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
