import { useState, useEffect, useMemo } from 'react'
import { Plus, Package, Edit, Trash2, Archive, RotateCcw, Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import ProductForm from '../../components/Admin/ProductForm'
import toast from 'react-hot-toast'

export default function ProductManagement() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive
    category: 'all',
    hasDiscount: 'all', // all, yes, no
    featured: 'all' // all, yes, no
  })

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))]
    return cats.sort()
  }, [products])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/api/products?includeInactive=true&sort=date-desc')
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Soft delete (archive) - sets isActive to false
  const handleArchiveProduct = async (productId, productName) => {
    if (!confirm(`Archive "${productName}"? It will be hidden from customers but can be restored.`)) return
    
    try {
      const token = await user.getIdToken()
      await apiRequest(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      }, token)
      toast.success(`"${productName}" archived`)
      fetchProducts()
    } catch (error) {
      toast.error('Error archiving product: ' + error.message)
    }
  }

  // Restore archived product
  const handleRestoreProduct = async (productId, productName) => {
    try {
      const token = await user.getIdToken()
      await apiRequest(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: true })
      }, token)
      toast.success(`"${productName}" restored`)
      fetchProducts()
    } catch (error) {
      toast.error('Error restoring product: ' + error.message)
    }
  }

  // Hard delete - permanently removes from database
  const handlePermanentDelete = async (productId, productName) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE "${productName}"?\n\nThis action CANNOT be undone! The product will be completely removed from the database.`)) return
    if (!confirm(`Are you ABSOLUTELY sure? This is permanent.`)) return
    
    try {
      const token = await user.getIdToken()
      await apiRequest(`/api/admin/products/${productId}/permanent`, {
        method: 'DELETE'
      }, token)
      toast.success(`"${productName}" permanently deleted`)
      fetchProducts()
    } catch (error) {
      toast.error('Error deleting product: ' + error.message)
    }
  }

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Sort icon component
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-3 h-3 text-slate-300" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-primary-500" />
      : <ChevronDown className="w-3 h-3 text-primary-500" />
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.subCategory?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(p => 
        filters.status === 'active' ? p.isActive : !p.isActive
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category)
    }

    // Discount filter
    if (filters.hasDiscount !== 'all') {
      result = result.filter(p => {
        const basePrice = p.pricing?.basePrice || p.actualPrice || p.price || 0
        const discountedPrice = p.pricing?.discountedPrice || p.discountedPrice || basePrice
        const hasDiscount = discountedPrice < basePrice
        return filters.hasDiscount === 'yes' ? hasDiscount : !hasDiscount
      })
    }

    // Featured filter
    if (filters.featured !== 'all') {
      result = result.filter(p => 
        filters.featured === 'yes' ? p.isFeatured : !p.isFeatured
      )
    }

    // Sorting
    result.sort((a, b) => {
      let aVal, bVal

      switch (sortConfig.key) {
        case 'name':
          aVal = a.name?.toLowerCase() || ''
          bVal = b.name?.toLowerCase() || ''
          break
        case 'category':
          aVal = a.category?.toLowerCase() || ''
          bVal = b.category?.toLowerCase() || ''
          break
        case 'price':
          aVal = a.pricing?.basePrice || a.actualPrice || a.price || 0
          bVal = b.pricing?.basePrice || b.actualPrice || b.price || 0
          break
        case 'discount':
          const aBase = a.pricing?.basePrice || a.actualPrice || a.price || 0
          const aDisc = a.pricing?.discountedPrice || a.discountedPrice || aBase
          const bBase = b.pricing?.basePrice || b.actualPrice || b.price || 0
          const bDisc = b.pricing?.discountedPrice || b.discountedPrice || bBase
          aVal = aBase > 0 ? ((aBase - aDisc) / aBase) * 100 : 0
          bVal = bBase > 0 ? ((bBase - bDisc) / bBase) * 100 : 0
          break
        case 'stock':
          aVal = a.stockQty ?? 0
          bVal = b.stockQty ?? 0
          break
        case 'status':
          aVal = a.isActive ? 1 : 0
          bVal = b.isActive ? 1 : 0
          break
        case 'createdAt':
        default:
          aVal = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0)
          bVal = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0)
          break
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [products, searchQuery, filters, sortConfig])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      status: 'all',
      category: 'all',
      hasDiscount: 'all',
      featured: 'all'
    })
  }

  const hasActiveFilters = searchQuery || 
    filters.status !== 'all' || 
    filters.category !== 'all' || 
    filters.hasDiscount !== 'all' ||
    filters.featured !== 'all'

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filteredProducts.length} of {products.length} products
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>
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

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm w-full pl-9"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="select select-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
            className="select select-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Discount Filter */}
          <select
            value={filters.hasDiscount}
            onChange={(e) => setFilters(f => ({ ...f, hasDiscount: e.target.value }))}
            className="select select-sm"
          >
            <option value="all">All Pricing</option>
            <option value="yes">On Sale</option>
            <option value="no">Regular Price</option>
          </select>

          {/* Featured Filter */}
          <select
            value={filters.featured}
            onChange={(e) => setFilters(f => ({ ...f, featured: e.target.value }))}
            className="select select-sm"
          >
            <option value="all">All Products</option>
            <option value="yes">Featured Only</option>
            <option value="no">Non-Featured</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-ghost btn-sm text-slate-500"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th 
                  className="text-left p-4 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Product <SortIcon columnKey="name" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category <SortIcon columnKey="category" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-1">
                    Price <SortIcon columnKey="price" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('discount')}
                >
                  <div className="flex items-center gap-1">
                    Discount <SortIcon columnKey="discount" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center gap-1">
                    Stock <SortIcon columnKey="stock" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status <SortIcon columnKey="status" />
                  </div>
                </th>
                <th className="text-right p-4 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    {hasActiveFilters ? 'No products match your filters.' : 'No products found. Add your first product!'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const basePrice = product.pricing?.basePrice || product.actualPrice || product.price || 0
                  const discountedPrice = product.pricing?.discountedPrice || product.discountedPrice || basePrice
                  const hasDiscount = discountedPrice < basePrice
                  const discountPercent = hasDiscount ? Math.round(((basePrice - discountedPrice) / basePrice) * 100) : 0
                  
                  return (
                    <tr key={product.id} className={`border-b border-slate-100 hover:bg-slate-50 ${!product.isActive ? 'bg-slate-50/50 opacity-70' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            {(product.imageUrls?.[0] || product.imageUrl) ? (
                              <img src={product.imageUrls?.[0] || product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 flex items-center gap-2">
                              {product.name}
                              {product.isFeatured && <span className="badge badge-secondary text-xs">Featured</span>}
                            </div>
                            <div className="text-sm text-slate-500 line-clamp-1 max-w-[200px]">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        <div>{product.category || '-'}</div>
                        {product.subCategory && <div className="text-xs text-slate-400">{product.subCategory}</div>}
                      </td>
                      <td className="p-4">
                        {basePrice > 0 ? (
                          <div>
                            {hasDiscount ? (
                              <>
                                <div className="font-medium text-primary-600">₹{Math.round(discountedPrice)}</div>
                                <div className="text-xs text-slate-400 line-through">₹{Math.round(basePrice)}</div>
                              </>
                            ) : (
                              <div className="font-medium text-slate-900">₹{Math.round(basePrice)}</div>
                            )}
                            {product.priceTier && <div className="text-xs text-slate-500">Tier: {product.priceTier}</div>}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">{product.priceTier || 'N/A'}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {hasDiscount ? (
                          <span className="badge badge-accent">{discountPercent}% OFF</span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-600">{product.stockQty ?? '-'}</td>
                      <td className="p-4">
                        <span className={`badge ${product.isActive ? 'badge-success' : 'badge-warning'}`}>
                          {product.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingProduct(product)
                              setShowProductForm(true)
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          
                          {/* Archive/Restore */}
                          {product.isActive ? (
                            <button
                              onClick={() => handleArchiveProduct(product.id, product.name)}
                              className="p-2 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                              title="Archive product (hide from customers)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreProduct(product.id, product.name)}
                              className="p-2 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                              title="Restore product"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Permanent Delete - only for archived products */}
                          {!product.isActive && (
                            <button
                              onClick={() => handlePermanentDelete(product.id, product.name)}
                              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                              title="Permanently delete (cannot be undone!)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Edit className="w-3 h-3" /> Edit product
        </div>
        <div className="flex items-center gap-2">
          <Archive className="w-3 h-3" /> Archive (soft delete - can restore)
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-3 h-3" /> Restore archived product
        </div>
        <div className="flex items-center gap-2">
          <Trash2 className="w-3 h-3 text-red-500" /> Permanent delete (cannot undo)
        </div>
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
