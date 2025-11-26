import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '../hooks/useCart'
import ProfileDropdown from './ProfileDropdown'
import { apiRequest } from '../lib/api'

const ProductDropdown = ({ categories }) => (
  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 text-slate-800 animate-slide-down-fast">
    <div className="py-1">
      {categories.map((category) => (
        <Link
          key={category}
          to={`/products?category=${category}`}
          className="block px-4 py-2 text-sm hover:bg-slate-100"
        >
          {category}
        </Link>
      ))}
      <div className="border-t border-slate-200 my-1"></div>
      <Link
        to="/products?category=custom"
        className="block px-4 py-2 text-sm font-bold text-primary-600 hover:bg-slate-100"
      >
        Custom
      </Link>
    </div>
  </div>
);

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [isProductsHovered, setIsProductsHovered] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/assets/logos/logo.png');
  const { toggleCart, getCartCount, getCartSubtotal } = useCart()
  const cartCount = getCartCount()
  const cartSubtotal = getCartSubtotal()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories from the categories API (main source of truth)
        const catResponse = await apiRequest('/api/categories');
        const categories = catResponse.data || [];
        if (categories.length > 0) {
          setProductCategories(categories.map(c => c.name));
        } else {
          // Fallback to dropdown options if categories collection is empty
          const dropResponse = await apiRequest('/api/dropdowns');
          const dropData = dropResponse.data || dropResponse || {};
          if (dropData.category && Array.isArray(dropData.category)) {
            setProductCategories(dropData.category);
          }
        }
        
        // Fetch logo from site settings
        const settingsResponse = await apiRequest('/api/settings');
        const settings = settingsResponse.data || settingsResponse || {};
        if (settings.logos?.main) {
          setLogoUrl(settings.logos.main);
        }
      } catch (error) {
        console.error("Failed to fetch navigation data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logoUrl} 
              alt="PJA3D Logo" 
              className="h-10 w-auto object-contain" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="font-bold text-xl text-white">PJA3D</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-primary-400 transition-colors">
              Home
            </Link>
            <div 
              className="relative"
              onMouseEnter={() => setIsProductsHovered(true)}
              onMouseLeave={() => setIsProductsHovered(false)}
            >
              <Link to="/products" className="flex items-center hover:text-primary-400 transition-colors">
                Products <ChevronDown className="w-4 h-4 ml-1" />
              </Link>
              {isProductsHovered && <ProductDropdown categories={productCategories} />}
            </div>
            <Link to="/about" className="hover:text-primary-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-primary-400 transition-colors">
              Contact
            </Link>
            <Link to="/admin" className="hover:text-primary-400 transition-colors">
              Admin
            </Link>
          </div>

          {/* Cart Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full px-2 py-1 flex items-center justify-center">
                  {cartCount} | ₹{cartSubtotal.toFixed(2)}
                </div>
              )}
            </button>

            <ProfileDropdown />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 animate-slide-down">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block py-2 hover:text-primary-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            {/* TODO: Add mobile product dropdown */}
            <div className="py-2">
              <button 
                onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                className="w-full flex justify-between items-center hover:text-primary-400 transition-colors"
              >
                <span>Products</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileProductsOpen && (
                <div className="pt-2 pl-4 animate-slide-down-fast">
                  {productCategories.map((category) => (
                    <Link
                      key={category}
                      to={`/products?category=${category}`}
                      className="block py-2 text-sm hover:bg-slate-800 rounded"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category}
                    </Link>
                  ))}
                  <div className="border-t border-slate-700 my-2"></div>
                  <Link
                    to="/products?category=custom"
                    className="block py-2 text-sm font-bold text-primary-500 hover:bg-slate-800 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Custom
                  </Link>
                </div>
              )}
            </div>
            <Link
              to="/about"
              className="block py-2 hover:text-primary-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block py-2 hover:text-primary-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/admin"
              className="block py-2 hover:text-primary-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
