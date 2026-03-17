import React, { useState, useEffect, useCallback, useRef } from 'react';
import GlassCard from '../components/GlassCard';
import ProductGrid from '../components/ProductGrid';
import ProductSearch from '../components/ProductSearch';
import { CATEGORIES } from '../utils/categories';

const PAGE_SIZE = 12; // 4 rows × 3 cols on desktop
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // Track current offset for load-more
  const offsetRef = useRef(0);
  // Track active fetch params to reset on filter change
  const activeParams = useRef('');

  const buildQuery = useCallback((offset) => {
    const params = new URLSearchParams({ limit: PAGE_SIZE, offset });
    if (filters.category) params.set('category', filters.category);
    if (searchTerm) params.set('search', searchTerm);
    return params.toString();
  }, [filters.category, searchTerm]);

  // Initial / filter-change fetch — resets the list
  useEffect(() => {
    const query = buildQuery(0);
    if (query === activeParams.current) return;
    activeParams.current = query;
    offsetRef.current = 0;

    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/products?${query}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list);
        setTotal(data.total ?? list.length);
        offsetRef.current = list.length;
      } catch (err) {
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [buildQuery]);

  const handleLoadMore = async () => {
    if (loadingMore || products.length >= total) return;
    setLoadingMore(true);
    try {
      const query = buildQuery(offsetRef.current);
      const res = await fetch(`${API_BASE}/products?${query}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const more = Array.isArray(data) ? data : (data.products || []);
      setProducts(prev => [...prev, ...more]);
      setTotal(data.total ?? total);
      offsetRef.current += more.length;
    } catch (err) {
      // silently fail — user can retry
    } finally {
      setLoadingMore(false);
    }
  };

  // Client-side sort (search/filter already handled server-side, sort is local)
  const sortedProducts = [...products].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name_desc': return b.name.localeCompare(a.name);
      case 'price_asc': return parseFloat(a.price) - parseFloat(b.price);
      case 'price_desc': return parseFloat(b.price) - parseFloat(a.price);
      case 'stock': return b.stock - a.stock;
      default: return 0; // server already returns by created_at DESC
    }
  });

  // Client-side stock filter (lightweight, no extra request)
  const displayProducts = filters.inStockOnly
    ? sortedProducts.filter(p => p.stock > 0)
    : sortedProducts;

  const hasMore = products.length < total;

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
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <button onClick={() => { activeParams.current = ''; setFilters({}); }} className="glass-button-primary">
              Try Again
            </button>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Page Header */}
        <GlassCard className="p-4 sm:p-8 text-center mb-6">
          <h1 className="text-gray-800 dark:text-white mb-2">Our Products</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Browse our comprehensive selection of medications, supplements, and healthcare products.
          </p>
        </GlassCard>

        {/* Search and Filters */}
        <ProductSearch
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          categories={CATEGORIES}
          className="mb-8"
        />

        {/* Results info + layout toggle */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {displayProducts.length} of {total} product{total !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded-lg transition-colors ${layout === 'grid' ? 'bg-glass-blue/20 text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded-lg transition-colors ${layout === 'list' ? 'bg-glass-blue/20 text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Grid */}
        {displayProducts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || filters.category ? "No products match your search. Try adjusting your filters." : "No products available yet."}
            </p>
          </GlassCard>
        ) : (
          <>
            <ProductGrid products={displayProducts} layout={layout} />

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="glass-button-secondary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                      Loading...
                    </span>
                  ) : (
                    `Load More (${total - products.length} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;