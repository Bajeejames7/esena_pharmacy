/**
 * Performance monitoring utilities
 * Implements Requirements 25.1, 25.2, 25.3
 */

/**
 * Measure and report Core Web Vitals
 */
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return;

  // First Contentful Paint (FCP)
  const measureFCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        // Only log in development, only warn if significantly slow
        if (process.env.NODE_ENV === 'development') {
          console.log('First Contentful Paint:', fcpEntry.startTime, 'ms');
        }
        // Target: < 2.5s (2500ms) - more lenient threshold
        if (fcpEntry.startTime > 2500) {
          console.warn('FCP is slower than recommended (2.5s)');
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });
  };

  // Largest Contentful Paint (LCP)
  const measureLCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (process.env.NODE_ENV === 'development') {
        console.log('Largest Contentful Paint:', lastEntry.startTime, 'ms');
      }
      // Target: < 4s (4000ms) - more lenient threshold
      if (lastEntry.startTime > 4000) {
        console.warn('LCP is slower than recommended (4s)');
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  };

  // Time to Interactive (TTI) approximation
  const measureTTI = () => {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadTime = performance.now();
        if (process.env.NODE_ENV === 'development') {
          console.log('Approximate Time to Interactive:', loadTime, 'ms');
        }
        // Target: < 5s (5000ms) - more lenient threshold
        if (loadTime > 5000) {
          console.warn('TTI is slower than recommended (5s)');
        }
      }, 0);
    });
  };

  // Cumulative Layout Shift (CLS)
  const measureCLS = () => {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('Cumulative Layout Shift:', clsValue);
      }
      // Target: < 0.25 - more lenient threshold
      if (clsValue > 0.25) {
        console.warn('CLS is higher than recommended (0.25)');
      }
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  };

  // Initialize measurements
  measureFCP();
  measureLCP();
  measureTTI();
  measureCLS();
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy load components with dynamic imports
 */
export const lazyLoadComponent = (importFunc) => {
  const React = require('react');
  return React.lazy(() => 
    importFunc().catch(err => {
      console.error('Failed to load component:', err);
      // Return a fallback component
      return { default: () => React.createElement('div', null, 'Failed to load component') };
    })
  );
};

/**
 * Preload critical resources
 */
export const preloadResource = (href, as = 'script', crossorigin = null) => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) link.crossOrigin = crossorigin;
  
  document.head.appendChild(link);
};

/**
 * Monitor bundle size and performance
 */
export const monitorBundleSize = () => {
  if (typeof window === 'undefined') return;

  // Monitor resource loading
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
        const sizeKB = entry.transferSize ? (entry.transferSize / 1024).toFixed(2) : 'unknown';
        // Only log large resources or slow loading ones
        if (entry.transferSize > 500000 || entry.duration > 1000) { // > 500KB or > 1s
          console.log(`Large/Slow Resource: ${entry.name}, Size: ${sizeKB}KB, Load Time: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
};

/**
 * Image optimization utilities
 */
export const optimizeImage = (src, width, height, quality = 80) => {
  // This would typically integrate with a service like Cloudinary or ImageKit
  // For now, return the original src with query parameters for services that support it
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality !== 80) params.append('q', quality);
  
  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
};

/**
 * Generate responsive image srcSet
 */
export const generateSrcSet = (baseSrc, sizes = [320, 640, 768, 1024, 1280]) => {
  return sizes.map(size => `${optimizeImage(baseSrc, size)} ${size}w`).join(', ');
};

/**
 * Memory usage monitoring
 */
export const monitorMemoryUsage = () => {
  if (typeof window === 'undefined' || !window.performance || !window.performance.memory) {
    console.warn('Memory monitoring not supported in this browser');
    return;
  }

  const logMemoryUsage = () => {
    const memory = window.performance.memory;
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  };

  // Log memory usage every 30 seconds
  setInterval(logMemoryUsage, 30000);
  
  // Log initial memory usage
  logMemoryUsage();
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  // Only run detailed monitoring in development
  if (process.env.NODE_ENV === 'development') {
    measureWebVitals();
    monitorBundleSize();
    // Only monitor memory usage if explicitly enabled
    if (localStorage.getItem('enableMemoryMonitoring') === 'true') {
      monitorMemoryUsage();
    }
  } else {
    // In production, only measure critical metrics without console logs
    measureWebVitals();
  }
};