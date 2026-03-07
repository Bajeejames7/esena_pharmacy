import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBreakpoint } from '../utils/responsive';
import ProductCard from './ProductCard';
import GlassCard from './GlassCard';
import LazyImage from './LazyImage';

/**
 * Responsive product grid with lazy loading and performance optimizations
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Memoize grid columns calculation for performance
  const gridColumns = useMemo(() => {
    switch (breakpoint) {
      case 'mobile': return 1;
      case 'tablet': return 2;
      case 'desktop': return 3;
      default: return 3;
    }
  }, [breakpoint]);

  // Optimized load more function with loading state
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const nextCount = Math.min(loadedCount + 12, products.length);
    setLoadedCount(nextCount);
    setIsLoadingMore(false);
  }, [loadedCount, products.length, isLoadingMore]);

  // Intersection Observer for infinite scroll
  const observerRef = useCallback(node => {
    if (loading || isLoadingMore) return;
    if (visibleProducts.length >= products.length) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [loading, isLoadingMore, visibleProducts.length, products.length, loadMoreProducts]);

  // Update visible products when products or loadedCount changes
  useEffect(() => {
    setVisibleProducts(products.slice(0, loadedCount));
  }, [products, loadedCount]);

  // Reset when products change
  useEffect(() => {
    setLoadedCount(12);
    setIsLoadingMore(false);
  }, [products]);

  // Loading state with skeleton cards
  if (loading) {
    return (
      <div className={`grid gap-6 ${className}`} 
           style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
           role="status" 
           aria-label="Loading products">
        {Array.from({ length: 6 }).map((_, index) => (
          <GlassCard key={index} className="p-6 animate-pulse" aria-hidden="true">
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
        <span className="sr-only">Loading products...</span>
      </div>
    );
  }

  // Error state with retry functionality
  if (error) {
    return (
      <GlassCard className="p-8 text-center" role="alert" aria-live="polite">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
          <p className="text-gray-600">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="glass-button-primary"
          aria-label="Retry loading products"
        >
          Try Again
        </button>
      </GlassCard>
    );
  }

  // Empty state with helpful message
  if (products.length === 0) {
    return (
      <GlassCard className="p-8 text-center" role="status" aria-live="polite">
        <div className="text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
      {/* Product Grid with optimized rendering */}
      <div 
        className={`grid gap-6 ${layout === 'list' ? 'grid-cols-1' : ''}`}
        style={layout === 'grid' ? { gridTemplateColumns: `repeat(${gridColumns}, 1fr)` } : {}}
        role="grid"
        aria-label={`Product grid showing ${visibleProducts.length} of ${products.length} products`}
      >
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            layout={layout}
            onProductClick={onProductClick}
            role="gridcell"
            tabIndex={0}
            aria-posinset={index + 1}
            aria-setsize={products.length}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {visibleProducts.length < products.length && (
        <div ref={observerRef} className="h-4 mt-8" aria-hidden="true" />
      )}

      {/* Load More Button (fallback for infinite scroll) */}
      {visibleProducts.length < products.length && (
        <div className="text-center mt-8">
          <button
            onClick={loadMoreProducts}
            disabled={isLoadingMore}
            className="glass-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Load more products. ${products.length - visibleProducts.length} remaining`}
          >
            {isLoadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current inline-block mr-2" aria-hidden="true" />
                Loading...
              </>
            ) : (
              `Load More Products (${products.length - visibleProducts.length} remaining)`
            )}
          </button>
        </div>
      )}

      {/* Results Summary with live region for screen readers */}
      <div 
        className="text-center mt-6 text-gray-600" 
        role="status" 
        aria-live="polite"
        aria-label={`Showing ${visibleProducts.length} of ${products.length} products`}
      >
        Showing {visibleProducts.length} of {products.length} products
      </div>
    </div>
  );
};

export default ProductGrid;