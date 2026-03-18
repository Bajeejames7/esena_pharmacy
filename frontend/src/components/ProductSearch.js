import GlassCard from './GlassCard';

/**
 * Fully controlled product search/filter component.
 * All state lives in the parent — no internal state, no feedback loops.
 */
const ProductSearch = ({
  searchTerm = '',
  onSearchChange,
  category = '',
  onCategoryChange,
  inStockOnly = false,
  onInStockChange,
  priceMin = '',
  priceMax = '',
  onPriceMinChange,
  onPriceMaxChange,
  sortBy = 'name',
  onSortChange,
  onClearFilters,
  categories = [],
  className = ''
}) => {
  const hasActiveFilters = searchTerm || category || inStockOnly || priceMin || priceMax || sortBy !== 'name';

  return (
    <GlassCard className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Products
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or description..."
              className={`glass-input w-full pl-10 ${searchTerm ? 'pr-8' : ''}`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="glass-input w-full"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => {
                if (typeof cat === 'string') return <option key={cat} value={cat}>{cat}</option>;
                return <option key={cat.value} value={cat.value}>{cat.label}</option>;
              })}
            </select>
          </div>

          {/* Price Range */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => onPriceMinChange(e.target.value)}
                placeholder="Min"
                className="glass-input w-0 flex-1 min-w-0"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                value={priceMax}
                onChange={(e) => onPriceMaxChange(e.target.value)}
                placeholder="Max"
                className="glass-input w-0 flex-1 min-w-0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="glass-input w-full"
            >
              <option value="name">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="stock">Stock Level</option>
            </select>
          </div>

          {/* Availability */}
          <div className="min-w-0 flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center pt-2 border-t border-white/20">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filters applied</span>
            <button onClick={onClearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Clear All
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ProductSearch;
