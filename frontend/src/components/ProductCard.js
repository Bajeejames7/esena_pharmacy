import React from 'react';
import { useCart } from '../contexts/CartContext';
import GlassCard from './GlassCard';

/**
 * Product card component with glassmorphism styling
 * Implements Requirements 3.3, 3.4, 3.5
 */
const ProductCard = ({ 
  product, 
  layout = 'grid', 
  className = '',
  showAddToCart = true,
  onProductClick 
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

  const inCart = isInCart(product.id);
  const quantity = getItemQuantity(product.id);
  const isOutOfStock = product.stock === 0;

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
      className={`${layoutClasses[layout]} ${className} ${onProductClick ? 'cursor-pointer' : ''}`}
      hover={!!onProductClick}
      onClick={onProductClick ? handleCardClick : undefined}
    >
      {/* Product Image */}
      <div className={`${imageClasses[layout]} bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden`}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        )}
        
        {/* Stock status badge */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
        
        {/* In cart badge */}
        {inCart && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            In Cart ({quantity})
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className={contentClasses[layout]}>
        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Category */}
        {product.category && (
          <p className="text-sm text-gray-500 mb-2">
            {product.category}
          </p>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Stock Info */}
        <div className="text-xs text-gray-500 mb-3">
          {isOutOfStock ? (
            <span className="text-red-600 font-medium">Out of Stock</span>
          ) : product.stock <= 10 ? (
            <span className="text-orange-600 font-medium">
              Only {product.stock} left
            </span>
          ) : (
            <span>In Stock ({product.stock} available)</span>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex justify-between items-center mt-auto">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-800">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`glass-button-primary ${
                isOutOfStock 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105 transform transition-transform'
              }`}
              aria-label={`Add ${product.name} to cart`}
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