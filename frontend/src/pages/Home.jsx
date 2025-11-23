import { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import Hero from '../components/Hero'
import StatsBanner from '../components/StatsBanner'
import FiltersBar from '../components/FiltersBar'
import ProductsGrid from '../components/ProductsGrid'
import ProductModal from '../components/ProductModal'
import CartDrawer from '../components/CartDrawer'
import Footer from '../components/Footer'
import { getProducts } from '../lib/api'

export default function Home() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
  })

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

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

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      )
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
        <ProductsGrid
          products={filteredProducts}
          loading={loading}
          onProductClick={setSelectedProduct}
        />
        
        {/* About Section */}
        <section id="about" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
                About PJA Stick & 3D Studio
              </h2>
              <p className="text-slate-600 mb-6">
                We are a creative studio specializing in custom 3D printing, premium stickers,
                and professional printing services. Located at Suresh Singh Chowk, we bring
                your ideas to life with cutting-edge technology and expert craftsmanship.
              </p>
              <p className="text-slate-600">
                From personalized flip names and moon lamps to divine idols and custom
                designs, we deliver quality products that exceed expectations. Order today
                via WhatsApp for fast and convenient service!
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-slate-600 mb-8">
                Have questions or special requests? We'd love to hear from you!
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card text-left">
                  <h3 className="font-semibold text-lg mb-3">Visit Us</h3>
                  <p className="text-slate-600">
                    Suresh Singh Chowk<br />
                    [Your City, State]<br />
                    [Pincode]
                  </p>
                </div>
                <div className="card text-left">
                  <h3 className="font-semibold text-lg mb-3">Contact</h3>
                  <p className="text-slate-600">
                    Phone: +91 6372362313<br />
                    Email: info@pja3dstudio.com<br />
                    WhatsApp: Available 24/7
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}
