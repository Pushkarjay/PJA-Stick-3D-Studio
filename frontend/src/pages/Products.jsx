import { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import ProductsGrid from '../components/ProductsGrid';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { getProducts, apiRequest } from '../lib/api';
import { useLocation } from 'react-router-dom';
import FiltersBar from '../components/FiltersBar';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [whatsAppNumber, setWhatsAppNumber] = useState('916372362313');
  const query = useQuery();
  const category = query.get('category') || 'All';

  const [filters, setFilters] = useState({
    category: category,
    sort: 'date-desc',
    search: '',
    material: 'All',
    theme: 'All',
    features: [],
  });

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
    } finally {
      setLoading(false);
    }
  }, [filters]);

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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // Fetch WhatsApp number from settings
    const fetchSettings = async () => {
      try {
        const response = await apiRequest('/api/settings');
        const data = response.data || response;
        if (data.contact?.whatsapp) {
          setWhatsAppNumber(data.contact.whatsapp.replace(/[^0-9]/g, ''));
        }
      } catch (e) {
        // Use default
      }
    };
    fetchSettings();
  }, []);
  
  useEffect(() => {
    setFilters(prev => ({ ...prev, category: category }));
  }, [category]);

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
        <div className="bg-slate-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-slate-800">{filters.category === 'All' ? 'All Products' : filters.category}</h1>
            </div>
        </div>
        <FiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
        <ProductsGrid
          products={products}
          loading={loading}
          onProductClick={handleProductClick}
          showCustomCta={true}
          whatsAppNumber={whatsAppNumber}
        />
      </main>

      <Footer />

      <ProductModal 
        product={selectedProduct} 
        onClose={handleCloseModal} 
      />

      <CartDrawer />
    </div>
  )
}
