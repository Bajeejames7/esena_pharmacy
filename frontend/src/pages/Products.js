import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import GlassCard from '../components/GlassCard';
import ProductGrid from '../components/ProductGrid';
import ProductSearch from '../components/ProductSearch';

/**
 * Products page with search, filter, and cart functionality
 * Implements Requirements 3.1, 3.2, 3.6, 3.7, 18.1, 18.2, 18.3, 18.4, 18.5
 */
const Products = () => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [layout, setLayout] = useState('grid');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setAllProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories
  const categories = [...new Set(allProducts.map(product => product.category))];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply stock filter
    if (filters.inStockOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Apply price range filter
    if (filters.priceMin !== null && filters.priceMin !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.priceMin);
    }
    if (filters.priceMax !== null && filters.priceMax !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.priceMax);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default: // 'name'
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [allProducts, searchTerm, filters]);

  const handleProductClick = (product) => {
    // TODO: Navigate to product details page
    console.log('Product clicked:', product);
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <GlassCard className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading products...</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <GlassCard className="p-12 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Error Loading Products</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="glass-button-primary"
            >
              Try Again
            </button>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-gray-800 mb-4">Our Products</h1>
          <p className="text-gray-600">
            Browse our comprehensive selection of medications, supplements, and healthcare products.
          </p>
        </GlassCard>

        {/* Search and Filters */}
        <ProductSearch
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          categories={categories}
          className="mb-8"
        />

        {/* Layout Toggle and Results Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded-lg transition-colors ${
                layout === 'grid' 
                  ? 'bg-glass-blue/20 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded-lg transition-colors ${
                layout === 'list' 
                  ? 'bg-glass-blue/20 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 && !loading ? (
          <GlassCard className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No Products Found</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'No products are currently available. Please check back later.'
              }
            </p>
          </GlassCard>
        ) : (
          <ProductGrid
            products={filteredProducts}
            layout={layout}
            onProductClick={handleProductClick}
          />
        )}
      </div>
    </div>
  );
};

export default Products;