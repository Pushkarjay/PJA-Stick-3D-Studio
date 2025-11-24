import { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import Hero from '../components/Hero'
import StatsBanner from '../components/StatsBanner'
import FiltersBar from '../components/FiltersBar'
import ProductsGrid from '../components/ProductsGrid'
// import ProductModal from '../components/ProductModal'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import { getProducts } from '../lib/api'

export default function Home() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [footerSettings, setFooterSettings] = useState(null)
  const [filters, setFilters] = useState({
    category: 'All',
    difficulty: 'All',
    sort: 'name_asc',
    search: '',
  })

  // Fetch products and footer settings on mount
  useEffect(() => {
    fetchProducts()
    fetchFooterSettings()
  }, [])
  // Fetch footer settings from backend (site settings)
  const fetchFooterSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setFooterSettings({
        description: data.footerDescription || data.siteTitle || '',
        socialLinks: data.socialLinks || {},
        contact: {
          address: data.contactAddress || 'Suresh Singh Chowk, [Your City]',
          phone: data.whatsappNumber || '+91 6372362313',
          email: data.contactEmail || 'info@pja3dstudio.com',
        },
      })
    } catch (e) {
      setFooterSettings(null)
    }
  }

  // Filter products when filters change
  useEffect(() => {
    filterProducts()
  }, [filters, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts({ isActive: true })
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      // TODO: Show error toast/notification
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Filter by category
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(p => p.category === filters.category)
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== 'All') {
      filtered = filtered.filter(p => (p.difficulty || '').toLowerCase() === filters.difficulty.toLowerCase())
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      )
    }

    // Sorting
    switch (filters.sort) {
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'price_asc':
        filtered.sort((a, b) => {
          // Extract numeric value from priceTier (e.g., '₹499')
          const getPrice = p => parseInt((p.priceTier || '').replace(/\D/g, '')) || 0
          return getPrice(a) - getPrice(b)
        })
        break
      case 'price_desc':
        filtered.sort((a, b) => {
          const getPrice = p => parseInt((p.priceTier || '').replace(/\D/g, '')) || 0
          return getPrice(b) - getPrice(a)
        })
        break
      case 'newest':
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <StatsBanner />
        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
        {/* Custom CTA for 3D Print category */}
        {filters.category === '3D Print' && (
          <div className="mb-8 bg-primary-100 border-l-4 border-primary-600 rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-primary-700 mb-1">Need a Custom 3D Print?</h3>
              <p className="text-primary-800">Contact us on WhatsApp for personalized designs, bulk orders, or special requests!</p>
            </div>
            <a
              href="https://wa.me/916372362313"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-base px-6 py-3"
            >
              Chat on WhatsApp
            </a>
          </div>
        )}
        <ProductsGrid
          products={filteredProducts}
          loading={loading}
        />
        
        // ...existing code...
      </main>

      <Footer
        description={footerSettings?.description}
        socialLinks={footerSettings?.socialLinks}
        contact={footerSettings?.contact}
      />

      {/* Product Modal removed: now using product pages */}

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}
