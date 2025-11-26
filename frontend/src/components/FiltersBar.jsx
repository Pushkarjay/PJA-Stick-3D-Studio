import { Search, SlidersHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'

export default function FiltersBar({ filters, onFilterChange, onSearchChange }) {
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [themes, setThemes] = useState([])
  const [features, setFeatures] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch categories from the categories API (main source of truth)
        const catResponse = await apiRequest('/api/categories');
        const categoriesData = catResponse.data || [];
        if (categoriesData.length > 0) {
          setCategories(['All', ...categoriesData.map(c => c.name)]);
        } else {
          // Fallback to dropdown options
          const dropResponse = await apiRequest('/api/dropdowns');
          const dropData = dropResponse.data || dropResponse || {};
          setCategories(['All', ...(dropData.category || [])]);
        }
        
        // Fetch other filter options from dropdowns
        const dropResponse = await apiRequest('/api/dropdowns');
        const dropData = dropResponse.data || dropResponse || {};
        setMaterials(['All', ...(dropData.material || [])]);
        setThemes(['All', ...(dropData.theme || [])]);
        setFeatures(dropData.features || []);
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
        // Fallback to some default values
        setCategories(['All', '3D Print', 'Stickers', 'Printing']);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleFeatureChange = (feature) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    onFilterChange('features', newFeatures);
  };
  
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'best-selling', label: 'Best Selling' },
    { value: 'alpha-asc', label: 'Name (A-Z)' },
    { value: 'alpha-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low-High)' },
    { value: 'price-desc', label: 'Price (High-Low)' },
    { value: 'date-desc', label: 'Newest' },
    { value: 'date-asc', label: 'Oldest' },
  ]

  return (
    <div className="bg-white border-b border-slate-200 py-4">
      <div className="container mx-auto px-4">
        {/* Main Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold mr-2 text-slate-600">Category:</h3>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onFilterChange('category', category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.category === category
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              aria-label="Search products"
            />
          </div>
          
          {/* Advanced Filter Toggle */}
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showAdvanced ? 'Hide' : 'More'} Filters</span>
          </button>
        </div>

        {/* Advanced Filters Row */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center gap-6 animate-fade-in">
            {/* Material Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Material</label>
              <select
                value={filters.material || 'All'}
                onChange={e => onFilterChange('material', e.target.value)}
                className="select"
              >
                {materials.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Theme Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Theme/Vibe</label>
              <select
                value={filters.theme || 'All'}
                onChange={e => onFilterChange('theme', e.target.value)}
                className="select"
              >
                {themes.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Features Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Features</label>
              <div className="flex flex-wrap gap-2">
                {features.map(feature => (
                  <button
                    key={feature}
                    onClick={() => handleFeatureChange(feature)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      filters.features.includes(feature)
                        ? 'bg-secondary-500 text-white shadow'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sort Dropdown */}
            <div className="md:ml-auto">
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
              <select
                value={filters.sort || 'featured'}
                onChange={e => onFilterChange('sort', e.target.value)}
                className="select"
                aria-label="Sort products"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
