import React, { useState, useEffect } from 'react';
import { useBreakpoint } from '../utils/responsive';
import ProductCard from './ProductCard';
import GlassCard from './GlassCard';

/**
 * Responsive product grid with lazy loading
 * Implements Requirements 3.1, 2.1, 2.2, 2.3, 25.4
 */
const ProductGrid = ({ 
  products = [], 
  loading = false, 
  error = null,
  onProductClick,
  layout = 'grid',
  className = ''
}) => {
  const { breakpoint } = useBreakpoint();
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [loadedCount, setLoadedCount] = useState(12);

  // Responsive grid columns
  const getGridColumns = () => {
    switch (breakpoint) {
      case 'mobile': return 1;
      case 'tablet': return 2;
      case 'desktop': return 3;
      default: return 3;
    }
  };

  // Load more products for lazy loading
  const loadMoreProducts = () => {
    const nextCount = Math.min(loadedCount + 12, products.length);
    setLoadedCount(nextCount);
  };

  // Update visible products when products or loadedCount changes
  useEffect(() => {
    setVisibleProducts(products.slice(0, loadedCount));
  }, [products, loadedCount]);

  // Reset when products change
  useEffect(() => {
    setLoadedCount(12);
  }, [products]);

  // Loading state
  if (loading) {
    return (
      <div className={`grid gap-6 ${className}`} 
           style={{ gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)` }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <GlassCard key={index} className="p-6 animate-pulse">
            <div className="aspect-square bg-gray-200/50 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200/50 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200/50 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200/50 rounded w-full"></div>
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 bg-gray-200/50 rounded w-16"></div>
                <div className="h-8 bg-gray-200/50 rounded w-20"></div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
          <p className="text-gray-600">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="glass-button-primary"
        >
          Try Again
        </button>
      </GlassCard>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={className}>
      {/* Product Grid */}
      <div 
        className={`grid gap-6 ${layout === 'list' ? 'grid-cols-1' : ''}`}
        style={layout === 'grid' ? { gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)` } : {}}
      >
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            layout={layout}
            onProductClick={onProductClick}
          />
        ))}
      </div>

      {/* Load More Button */}
      {visibleProducts.length < products.length && (
        <div className="text-center mt-8">
          <button
            onClick={loadMoreProducts}
            className="glass-button-secondary"
          >
            Load More Products ({products.length - visibleProducts.length} remaining)
          </button>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-center mt-6 text-gray-600">
        Showing {visibleProducts.length} of {products.length} products
      </div>
    </div>
  );
};

export default ProductGrid;