import React, { useState, useMemo } from 'react';
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

  // Demo products for testing functionality
  const allProducts = [
    { id: 1, name: 'Vitamin D3 Supplement', category: 'Supplement', price: 15.99, stock: 50, description: 'High-quality vitamin D3 for bone health and immune support.' },
    { id: 2, name: 'Pain Relief Tablets', category: 'Medication', price: 8.50, stock: 25, description: 'Fast-acting pain relief for headaches and muscle pain.' },
    { id: 3, name: 'Hand Sanitizer', category: 'Personal Care', price: 4.99, stock: 100, description: 'Antibacterial hand sanitizer with 70% alcohol content.' },
    { id: 4, name: 'Omega-3 Fish Oil', category: 'Supplement', price: 22.75, stock: 30, description: 'Premium omega-3 fatty acids for heart and brain health.' },
    { id: 5, name: 'First Aid Kit', category: 'Medical Supplies', price: 35.00, stock: 15, description: 'Complete first aid kit for home and travel emergencies.' },
    { id: 6, name: 'Multivitamin Complex', category: 'Supplement', price: 18.99, stock: 40, description: 'Daily multivitamin with essential vitamins and minerals.' },
    { id: 7, name: 'Cough Syrup', category: 'Medication', price: 12.99, stock: 0, description: 'Effective cough suppressant for dry and productive coughs.' },
    { id: 8, name: 'Moisturizing Lotion', category: 'Personal Care', price: 9.99, stock: 60, description: 'Hydrating body lotion for dry and sensitive skin.' },
    { id: 9, name: 'Blood Pressure Monitor', category: 'Medical Supplies', price: 89.99, stock: 8, description: 'Digital blood pressure monitor with large display.' },
    { id: 10, name: 'Calcium Tablets', category: 'Supplement', price: 14.50, stock: 35, description: 'Calcium supplement for strong bones and teeth.' },
    { id: 11, name: 'Thermometer', category: 'Medical Supplies', price: 25.99, stock: 20, description: 'Digital thermometer with fast and accurate readings.' },
    { id: 12, name: 'Sunscreen SPF 50', category: 'Personal Care', price: 16.99, stock: 45, description: 'Broad-spectrum sunscreen for UV protection.' }
  ];

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
  }, [searchTerm, filters]);

  const handleProductClick = (product) => {
    // TODO: Navigate to product details page
    console.log('Product clicked:', product);
  };

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
        <ProductGrid
          products={filteredProducts}
          layout={layout}
          onProductClick={handleProductClick}
        />

        {/* Demo Instructions */}
        <GlassCard className="p-6 mt-8">
          <h2 className="text-gray-800 mb-4">Demo Features</h2>
          <div className="text-gray-600 space-y-2">
            <p>• <strong>Search:</strong> Try searching for "vitamin", "pain", or "care"</p>
            <p>• <strong>Filter:</strong> Use category, price range, and stock filters</p>
            <p>• <strong>Sort:</strong> Sort by name, price, category, or stock level</p>
            <p>• <strong>Cart:</strong> Click "Add to Cart" to test shopping functionality</p>
            <p>• <strong>Layout:</strong> Switch between grid and list views</p>
            <p>• <strong>Responsive:</strong> Try resizing your browser window</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Products;