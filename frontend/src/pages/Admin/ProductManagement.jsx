import { useState, useEffect } from 'react'
import { Plus, Package, Edit, Trash2 } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import ProductForm from '../../components/Admin/ProductForm'

export default function ProductManagement() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)

  const fetchProducts = async () => {
    // No need to check for user, apiRequest will handle auth if needed
    try {
      // To get all products (active and inactive), we can add a query param
      // The backend should be updated to handle this. For now, let's assume it does.
      const data = await apiRequest('/api/products?includeInactive=true&sort=date-desc')
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const token = await user.getIdToken()
      await apiRequest(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      }, token)
      fetchProducts() // Refresh list after delete
    } catch (error) {
      alert('Error deleting product: ' + error.message)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Products</h1>
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

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          user={user}
          onClose={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
          onSave={() => {
            fetchProducts()
          }}
        />
      )}
    </>
  )
}
