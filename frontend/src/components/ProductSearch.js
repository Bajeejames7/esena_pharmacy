import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';

/**
 * Product search and filter component
 * Implements Requirements 3.6, 3.7, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7
 */
const ProductSearch = ({ 
  onSearch, 
  onFilterChange, 
  categories = [],
  initialFilters = {},
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [inStockOnly, setInStockOnly] = useState(initialFilters.inStockOnly || false);
  const [priceRange, setPriceRange] = useState({
    min: initialFilters.priceMin || '',
    max: initialFilters.priceMax || ''
  });
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'name');

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  // Handle filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        category: selectedCategory,
        inStockOnly,
        priceMin: priceRange.min ? parseFloat(priceRange.min) : null,
        priceMax: priceRange.max ? parseFloat(priceRange.max) : null,
        sortBy
      });
    }
  }, [selectedCategory, inStockOnly, priceRange, sortBy, onFilterChange]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setInStockOnly(false);
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
  };

  const hasActiveFilters = searchTerm || selectedCategory || inStockOnly || priceRange.min || priceRange.max || sortBy !== 'name';

  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Products
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, or category..."
              className="glass-input w-full pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input w-full"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                placeholder="Min"
                className="glass-input w-full"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                placeholder="Max"
                className="glass-input w-full"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input w-full"
            >
              <option value="name">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="category">Category</option>
              <option value="stock">Stock Level</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <div className="flex items-center space-x-3 mt-3">
              <input
                type="checkbox"
                id="inStockOnly"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="inStockOnly" className="text-sm text-gray-700">
                In Stock Only
              </label>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center pt-4 border-t border-white/20">
            <span className="text-sm text-gray-600">
              Filters applied
            </span>
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ProductSearch;