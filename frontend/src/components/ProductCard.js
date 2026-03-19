import React, { useState, useRef } from 'react';
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
  const [mediaIndex, setMediaIndex] = useState(0); // 0 = image, 1 = video
  const touchStartX = useRef(null);

  // Build full image/video URL — backend stores just the filename
  // Use /api/uploads/ path since Passenger routes /api to Node on cPanel
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const imageUrl = product.image
    ? (product.image.startsWith('http') ? product.image : `${API_BASE}/uploads/products/${product.image}`)
    : null;
  const videoUrl = product.video
    ? (product.video.startsWith('http') ? product.video : `${API_BASE}/uploads/videos/${product.video}`)
    : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock > 0) {
      // Store the fully-resolved imageUrl so cart/checkout don't need to rebuild it
      addToCart({ ...product, imageUrl }, 1);
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
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isMediumStock = product.stock > 5 && product.stock <= 20;

  const slides = [
    ...(imageUrl ? ['image'] : []),
    ...(videoUrl ? ['video'] : []),
  ];
  const totalSlides = slides.length;

  const goTo = (idx, e) => {
    if (e) e.stopPropagation();
    setMediaIndex(Math.max(0, Math.min(idx, totalSlides - 1)));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      goTo(delta > 0 ? mediaIndex + 1 : mediaIndex - 1, null);
    }
    touchStartX.current = null;
  };

  // Layout-specific classes
  const layoutClasses = {
    grid: 'flex flex-col',
    list: 'flex flex-row'
  };

  const imageClasses = {
    grid: 'aspect-square w-full',
    list: 'w-40 sm:w-56 flex-shrink-0 self-stretch min-h-[140px]'
  };

  const contentClasses = {
    grid: 'flex-1',
    list: 'flex-1 min-w-0 p-4'
  };

  const currentSlide = slides[mediaIndex];

  return (
    <GlassCard 
      className={`${layoutClasses[layout]} ${className} ${layout === 'list' ? 'p-0 overflow-hidden' : 'p-4'} ${onProductClick ? 'cursor-pointer focus:ring-2 focus:ring-glass-blue focus:outline-none' : ''}`}
      hover={!!onProductClick}
      onClick={onProductClick ? handleCardClick : undefined}
      onKeyDown={onProductClick ? handleKeyDown : undefined}
      tabIndex={onProductClick ? 0 : -1}
      role={onProductClick ? 'button' : 'article'}
      aria-label={onProductClick ? `View details for ${product.name}` : undefined}
      {...props}
    >
      {/* Media viewer — swipeable image/video within the card */}
      <div
        className={`${imageClasses[layout]} bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg ${layout === 'grid' ? 'mb-4' : 'mr-0'} relative overflow-hidden select-none`}
        onTouchStart={totalSlides > 1 ? handleTouchStart : undefined}
        onTouchEnd={totalSlides > 1 ? handleTouchEnd : undefined}
      >
        {/* Slides */}
        {currentSlide === 'image' && (
          imageUrl ? (
            <LazyImage
              src={imageUrl}
              alt={`${product.name} - ${product.category || 'Product'} priced at KSh ${parseFloat(product.price).toFixed(2)}`}
              className="absolute inset-0 w-full h-full"
              srcSet={generateSrcSet(imageUrl)}
              sizes={layout === 'grid' ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw' : '96px'}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center" role="img" aria-label="No product image available">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-500">No Image</span>
            </div>
          )
        )}

        {currentSlide === 'video' && (
          <video
            src={videoUrl}
            controls
            className="absolute inset-0 w-full h-full object-contain bg-black"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Dot indicators + arrow nav — only when both media exist */}
        {totalSlides > 1 && (
          <>
            {/* Left arrow */}
            {mediaIndex > 0 && (
              <button
                onClick={(e) => goTo(mediaIndex - 1, e)}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors z-10"
                aria-label="Previous media"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {/* Right arrow */}
            {mediaIndex < totalSlides - 1 && (
              <button
                onClick={(e) => goTo(mediaIndex + 1, e)}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors z-10"
                aria-label="Next media"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {slides.map((s, i) => (
                <button
                  key={s}
                  onClick={(e) => goTo(i, e)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === mediaIndex ? 'bg-white' : 'bg-white/40'}`}
                  aria-label={s === 'video' ? 'Switch to video' : 'Switch to image'}
                />
              ))}
            </div>
            {/* Label for current slide */}
            {currentSlide === 'video' && (
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Video
              </div>
            )}
          </>
        )}

        {/* Stock status badge */}
        {isOutOfStock && (
          <div 
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
            role="status"
            aria-label="Out of stock"
          >
            Out of Stock
          </div>
        )}
        
        {/* In cart badge */}
        {inCart && (
          <div 
            className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10"
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

        {/* Stock badge */}
        <div className="mb-3" role="status">
          {isOutOfStock ? (
            <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium px-2 py-1 rounded-full">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium px-2 py-1 rounded-full">
              Only {product.stock} left
            </span>
          ) : isMediumStock ? (
            <span className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium px-2 py-1 rounded-full">
              {product.stock} in stock
            </span>
          ) : (
            <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
              In Stock ({product.stock})
            </span>
          )}
        </div>

        {/* Price and Actions */}
        <div className={`flex items-center mt-auto ${layout === 'list' ? 'flex-col items-start gap-2 sm:flex-row sm:justify-between sm:items-center' : 'justify-between'}`}>
          <div className="flex flex-col" role="group" aria-label="Product pricing">
            <span className="text-lg font-bold text-gray-800 dark:text-white" aria-label={`Current price: KSh ${parseFloat(product.price).toFixed(2)}`}>
              KSh {parseFloat(product.price).toFixed(2)}
            </span>
            {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through" aria-label={`Original price: KSh ${parseFloat(product.originalPrice).toFixed(2)}`}>
                KSh {parseFloat(product.originalPrice).toFixed(2)}
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
                    : `Add ${product.name} to cart for KSh ${parseFloat(product.price).toFixed(2)}`
              }
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
