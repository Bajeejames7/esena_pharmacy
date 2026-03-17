import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import GlassCard from '../components/GlassCard';
import ProductGrid from '../components/ProductGrid';

/**
 * Supplements page - shows products filtered by supplement category
 */
const Supplements = () => {
  const { addToCart } = useCart();
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch supplements from API
  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/products?category=Supplements`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch supplements');
        }
        
        const data = await response.json();
        setSupplements(Array.isArray(data) ? data : (data.products || []));
      } catch (err) {
        console.error('Error fetching supplements:', err);
        setError('Failed to load supplements. Please try again later.');
        setSupplements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplements();
  }, []);

  const handleProductClick = (product) => {
    // TODO: Navigate to product details page
    console.log('Supplement clicked:', product);
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <GlassCard className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading supplements...</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <GlassCard className="p-12 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Error Loading Supplements</h2>
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
      <div className="max-w-6xl mx-auto px-4">
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-gray-800 dark:text-gray-100 mb-4">Supplements & Vitamins</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover our range of high-quality supplements and vitamins for your health needs.
          </p>
        </GlassCard>
        
        {supplements.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No Supplements Available</h2>
            <p className="text-gray-600 dark:text-gray-300">
              No supplements are currently available. Please check back later or browse our other products.
            </p>
          </GlassCard>
        ) : (
          <ProductGrid
            products={supplements}
            layout="grid"
            onProductClick={handleProductClick}
          />
        )}
      </div>
    </div>
  );
};

export default Supplements;