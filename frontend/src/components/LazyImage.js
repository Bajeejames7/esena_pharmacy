import React, { useState, useRef, useEffect } from 'react';
import { cacheManager } from '../utils/cacheManager';

/**
 * Enhanced LazyImage component with caching and performance optimizations
 * Implements Requirements 25.1, 25.2, and advanced caching strategies
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
  sizes,
  srcSet,
  loading = 'lazy',
  priority = false, // For critical images that should load immediately
  preload = false, // For images that should be preloaded
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Priority images start as "in view"
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  const imgRef = useRef(null);

  // Preload image if requested
  useEffect(() => {
    if (preload && src) {
      cacheManager.getOptimizedImageUrl(src).catch(e => 
        console.warn('Failed to preload image:', src, e)
      );
    }
  }, [src, preload]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: priority ? '0px' : '100px' // Larger margin for better UX
      }
    );

    if (imgRef.current && !priority) { // Skip observer for priority images
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Load optimized image when in view
  useEffect(() => {
    if ((isInView || priority) && src && !isLoaded && !hasError) {
      loadOptimizedImage();
    }
  }, [isInView, priority, src, isLoaded, hasError]);

  const loadOptimizedImage = async () => {
    try {
      const cachedUrl = await cacheManager.getOptimizedImageUrl(src);
      if (cachedUrl && cachedUrl !== src) {
        setOptimizedSrc(cachedUrl);
      }
    } catch (e) {
      console.warn('Failed to load cached image, using original:', e);
    }
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
    
    // Track performance metrics
    if (performance && performance.mark) {
      performance.mark(`image-loaded-${src}`);
    }
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
    
    // If cached image failed, try original
    if (optimizedSrc !== src) {
      console.warn('Cached image failed, trying original:', src);
      setOptimizedSrc(src);
      setHasError(false);
    }
  };

  // Generate responsive srcSet for better performance
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || baseSrc.startsWith('blob:') || srcSet) return srcSet;
    
    const sizes = [320, 640, 768, 1024, 1280];
    return sizes.map(size => {
      try {
        const url = new URL(baseSrc, window.location.origin);
        url.searchParams.set('w', size);
        return `${url.toString()} ${size}w`;
      } catch (e) {
        return `${baseSrc} ${size}w`;
      }
    }).join(', ');
  };

  const shouldLoad = loading === 'eager' || priority || isInView;

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {shouldLoad && (
        <img
          src={optimizedSrc}
          srcSet={generateSrcSet(optimizedSrc)}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          alt={alt}
          loading={priority ? 'eager' : loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {shouldLoad && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glass-blue"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;