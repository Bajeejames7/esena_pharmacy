import { useMemo } from 'react';
import { useBreakpoint } from '../utils/responsive';
import ProductCard from './ProductCard';
import GlassCard from './GlassCard';

/**
 * Responsive product grid — renders whatever products it receives.
 * Pagination/load-more is handled by the parent page.
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

  const gridColumns = useMemo(() => {
    switch (breakpoint) {
      case 'mobile': return 1;
      case 'tablet': return 2;
      default: return 3;
    }
  }, [breakpoint]);

  if (loading) {
    return (
      <div
        className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
        role="status"
        aria-label="Loading products"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <GlassCard key={i} className="p-6 animate-pulse" aria-hidden="true">
            <div className="aspect-square bg-gray-200/50 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200/50 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200/50 rounded w-1/2"></div>
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

  if (error) {
    return (
      <GlassCard className="p-8 text-center" role="alert">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="glass-button-primary">Try Again</button>
      </GlassCard>
    );
  }

  if (products.length === 0) {
    return (
      <GlassCard className="p-8 text-center" role="status">
        <p className="text-gray-600 dark:text-gray-300">No products found.</p>
      </GlassCard>
    );
  }

  return (
    <div
      className={`grid gap-4 ${
        layout === 'list'
          ? 'grid-cols-1'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      } ${className}`}
      role="list"
      aria-label={`${products.length} products`}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          layout={layout}
          onProductClick={onProductClick}
          role="listitem"
          aria-posinset={index + 1}
          aria-setsize={products.length}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
