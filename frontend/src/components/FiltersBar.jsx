import { Search } from 'lucide-react'

export default function FiltersBar({ filters, onFilterChange, onSearchChange }) {
  const categories = ['All', '3D Print', 'Stickers', 'Printing']

  return (
    <div className="bg-white border-b border-slate-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onFilterChange('category', category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.category === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
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
        </div>
      </div>
    </div>
  )
}
