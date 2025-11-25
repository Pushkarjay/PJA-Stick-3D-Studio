import { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import StatsBanner from '../components/StatsBanner';
import FiltersBar from '../components/FiltersBar';
import ProductsGrid from '../components/ProductsGrid';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { getProducts, apiRequest } from '../lib/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: 'All',
    sort: 'featured',
    search: '',
    material: 'All',
    theme: 'All',
    features: [],
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts({ ...filters, isActive: true });
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // TODO: Show error toast/notification
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch site settings on mount
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const settings = await apiRequest('/api/settings');
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };
    fetchSiteSettings();
  }, []);

  // No longer need to filter products on client-side
  // useEffect(() => {
  //   filterProducts()
  // }, [filters, products])



  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Hero 
          badge={siteSettings?.hero?.badge}
          headline={siteSettings?.hero?.headline}
          subtext={siteSettings?.hero?.subtext}
          description={siteSettings?.hero?.description}
          whatsAppNumber={siteSettings?.contact?.phone}
        />
        <StatsBanner stats={siteSettings?.stats} />
        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
        <ProductsGrid
          products={products}
          loading={loading}
          onProductClick={handleProductClick}
          showCustomCta={filters.category === '3D Print'}
          whatsAppNumber={siteSettings?.contact?.phone}
        />
        
      </main>

      <Footer
        description={siteSettings?.description}
        socialLinks={siteSettings?.socialLinks}
        contact={siteSettings?.contact}
      />

      <ProductModal 
        product={selectedProduct} 
        onClose={handleCloseModal} 
        whatsAppNumber={siteSettings?.contact?.phone}
      />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}
