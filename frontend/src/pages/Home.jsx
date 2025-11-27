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
    sort: 'date-desc',
    search: '',
    material: 'All',
    theme: 'All',
    features: [],
  });

  // Helper function to sort products client-side
  const sortProducts = (products, sortType) => {
    const sorted = [...products];
    
    switch (sortType) {
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = a.pricing?.discountedPrice || a.discountedPrice || a.actualPrice || a.price || 0;
          const priceB = b.pricing?.discountedPrice || b.discountedPrice || b.actualPrice || b.price || 0;
          return priceA - priceB;
        });
      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = a.pricing?.discountedPrice || a.discountedPrice || a.actualPrice || a.price || 0;
          const priceB = b.pricing?.discountedPrice || b.discountedPrice || b.actualPrice || b.price || 0;
          return priceB - priceA;
        });
      case 'alpha-asc':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'alpha-desc':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'featured':
        return sorted.sort((a, b) => {
          if (a.isFeatured === b.isFeatured) {
            const dateA = a.createdAt?.seconds || new Date(a.createdAt).getTime() / 1000 || 0;
            const dateB = b.createdAt?.seconds || new Date(b.createdAt).getTime() / 1000 || 0;
            return dateB - dateA;
          }
          return b.isFeatured ? 1 : -1;
        });
      case 'best-selling':
        return sorted.sort((a, b) => (b.stats?.salesCount || 0) - (a.stats?.salesCount || 0));
      case 'date-asc':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt?.seconds || new Date(a.createdAt).getTime() / 1000 || 0;
          const dateB = b.createdAt?.seconds || new Date(b.createdAt).getTime() / 1000 || 0;
          return dateA - dateB;
        });
      case 'date-desc':
      default:
        return sorted.sort((a, b) => {
          const dateA = a.createdAt?.seconds || new Date(a.createdAt).getTime() / 1000 || 0;
          const dateB = b.createdAt?.seconds || new Date(b.createdAt).getTime() / 1000 || 0;
          return dateB - dateA;
        });
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Don't send sort to backend - we'll sort client-side for reliability
      const { sort, ...filtersWithoutSort } = filters;
      const data = await getProducts({ ...filtersWithoutSort, isActive: true });
      let fetchedProducts = data.data || [];
      
      // Client-side sorting for reliability (Firestore indexes can be tricky)
      fetchedProducts = sortProducts(fetchedProducts, sort);
      
      setProducts(fetchedProducts);
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
        const response = await apiRequest('/api/settings');
        setSiteSettings(response.data || response);
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
