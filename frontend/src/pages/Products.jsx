import { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import ProductsGrid from '../components/ProductsGrid';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { getProducts } from '../lib/api';
import { useLocation } from 'react-router-dom';
import FiltersBar from '../components/FiltersBar';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
      const data = await getProducts({ ...filters, isActive: true });
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
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
