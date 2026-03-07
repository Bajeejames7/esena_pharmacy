import React from 'react';
import { useCart } from '../contexts/CartContext';
import GlassCard from './GlassCard';
import LazyImage from './LazyImage';
import { generateSrcSet } from '../utils/performance';

/**
 * Product card component with glassmorphism styling, accessibility, and performance optimizations
 * Implements Requirements 3.3, 3.4, 3.5, 25.4, 29.1, 29.2, 29.3
 */
const ProductCard = ({ 
  product, 
  layout = 'grid', 
  className = '',
  showAddToCart = true,
  onProductClick,
  ...props
}) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const inCart = isInCart(product.id);
  const quantity = getItemQuantity(product.id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= 10 && product.stock > 0;

  // Layout-specific classes
  const layoutClasses = {
    grid: 'flex flex-col',
    list: 'flex flex-row space-x-4'
  };

  const imageClasses = {
    grid: 'aspect-square w-full',
    list: 'w-24 h-24 flex-shrink-0'
  };

  const contentClasses = {
    grid: 'flex-1',
    list: 'flex-1 min-w-0'
  };

  return (
    <GlassCard 
      className={`${layoutClasses[layout]} ${className} ${onProductClick ? 'cursor-pointer focus:ring-2 focus:ring-glass-blue focus:outline-none' : ''}`}
      hover={!!onProductClick}
      onClick={onProductClick ? handleCardClick : undefined}
      onKeyDown={onProductClick ? handleKeyDown : undefined}
      tabIndex={onProductClick ? 0 : -1}
      role={onProductClick ? 'button' : 'article'}
      aria-label={onProductClick ? `View details for ${product.name}` : undefined}
      {...props}
    >
      {/* Product Image with lazy loading */}
      <div className={`${imageClasses[layout]} bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden`}>
        {product.image ? (
          <LazyImage
            src={product.image}
            alt={`${product.name} - ${product.category || 'Product'} priced at $${product.price.toFixed(2)}`}
            className="w-full h-full object-cover"
            srcSet={generateSrcSet(product.image)}
            sizes={layout === 'grid' ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw' : '96px'}
          />
        ) : (
          <div className="text-center" role="img" aria-label="No product image available">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        )}
        
        {/* Stock status badge */}
        {isOutOfStock && (
          <div 
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
            role="status"
            aria-label="Out of stock"
          >
            Out of Stock
          </div>
        )}
        
        {/* In cart badge */}
        {inCart && (
          <div 
            className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
            role="status"
            aria-label={`${quantity} items in cart`}
          >
            In Cart ({quantity})
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className={contentClasses[layout]}>
        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Category */}
        {product.category && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2" aria-label={`Category: ${product.category}`}>
            {product.category}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2" aria-label={`Description: ${product.description}`}>
            {product.description}
          </p>
        )}

        {/* Stock Info with proper status indicators */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3" role="status">
          {isOutOfStock ? (
            <span className="text-red-600 dark:text-red-400 font-medium" aria-label="Product is out of stock">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="text-orange-600 dark:text-orange-400 font-medium" aria-label={`Low stock: only ${product.stock} items remaining`}>
              Only {product.stock} left
            </span>
          ) : (
            <span aria-label={`In stock: ${product.stock} items available`}>
              In Stock ({product.stock} available)
            </span>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex justify-between items-center mt-auto">
          <div className="flex flex-col" role="group" aria-label="Product pricing">
            <span className="text-lg font-bold text-gray-800 dark:text-white" aria-label={`Current price: $${product.price.toFixed(2)}`}>
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through" aria-label={`Original price: $${product.originalPrice.toFixed(2)}`}>
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`glass-button-primary min-h-[44px] min-w-[44px] ${
                isOutOfStock 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105 transform transition-transform focus:ring-2 focus:ring-glass-blue focus:outline-none'
              }`}
              aria-label={
                isOutOfStock 
                  ? `${product.name} is out of stock` 
                  : inCart 
                    ? `Add another ${product.name} to cart (currently ${quantity} in cart)`
                    : `Add ${product.name} to cart for $${product.price.toFixed(2)}`
              }
              aria-describedby={`stock-${product.id}`}
            >
              {isOutOfStock ? 'Out of Stock' : inCart ? 'Add More' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductCard;