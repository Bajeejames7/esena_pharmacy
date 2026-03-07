import { useState, useEffect } from 'react';

/**
 * Browser compatibility utilities
 * Implements Requirements 1.6, 28.5, 28.6, 28.7
 */

// Feature detection utilities
export const featureDetection = {
  // Check if backdrop-filter is supported
  supportsBackdropFilter: () => {
    if (typeof window === 'undefined') return false;
    
    const testElement = document.createElement('div');
    testElement.style.backdropFilter = 'blur(10px)';
    testElement.style.webkitBackdropFilter = 'blur(10px)';
    
    return testElement.style.backdropFilter !== '' || 
           testElement.style.webkitBackdropFilter !== '';
  },

  // Check if CSS Grid is supported
  supportsCSSGrid: () => {
    if (typeof window === 'undefined') return false;
    
    const testElement = document.createElement('div');
    testElement.style.display = 'grid';
    
    return testElement.style.display === 'grid';
  },

  // Check if CSS Flexbox is supported
  supportsFlexbox: () => {
    if (typeof window === 'undefined') return false;
    
    const testElement = document.createElement('div');
    testElement.style.display = 'flex';
    
    return testElement.style.display === 'flex';
  },

  // Check if CSS custom properties (variables) are supported
  supportsCSSVariables: () => {
    if (typeof window === 'undefined') return false;
    
    return window.CSS && window.CSS.supports && window.CSS.supports('color', 'var(--test)');
  },

  // Check if IntersectionObserver is supported
  supportsIntersectionObserver: () => {
    return typeof window !== 'undefined' && 'IntersectionObserver' in window;
  },

  // Check if localStorage is supported
  supportsLocalStorage: () => {
    try {
      if (typeof window === 'undefined') return false;
      
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Browser detection utilities
export const browserDetection = {
  // Get browser name and version
  getBrowserInfo: () => {
    if (typeof window === 'undefined') {
      return { name: 'unknown', version: 'unknown', isSupported: false };
    }

    const userAgent = navigator.userAgent;
    let browserName = 'unknown';
    let browserVersion = 'unknown';
    let isSupported = true;

    // Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      browserVersion = match ? match[1] : 'unknown';
      isSupported = parseInt(browserVersion) >= 90;
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      browserVersion = match ? match[1] : 'unknown';
      isSupported = parseInt(browserVersion) >= 88;
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      browserVersion = match ? match[1] : 'unknown';
      isSupported = parseInt(browserVersion) >= 14;
    }
    // Edge
    else if (userAgent.includes('Edg')) {
      browserName = 'Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      browserVersion = match ? match[1] : 'unknown';
      isSupported = parseInt(browserVersion) >= 90;
    }
    // Internet Explorer
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      browserName = 'Internet Explorer';
      const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
      browserVersion = match ? match[1] : 'unknown';
      isSupported = false; // IE is not supported
    }

    return { name: browserName, version: browserVersion, isSupported };
  },

  // Check if browser is mobile
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if browser is iOS
  isIOS: () => {
    if (typeof window === 'undefined') return false;
    
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
};

// Compatibility class manager
export class CompatibilityManager {
  constructor() {
    this.features = {};
    this.browserInfo = {};
    this.initialized = false;
  }

  // Initialize compatibility detection
  init() {
    if (typeof window === 'undefined') return;

    this.features = {
      backdropFilter: featureDetection.supportsBackdropFilter(),
      cssGrid: featureDetection.supportsCSSGrid(),
      flexbox: featureDetection.supportsFlexbox(),
      cssVariables: featureDetection.supportsCSSVariables(),
      intersectionObserver: featureDetection.supportsIntersectionObserver(),
      localStorage: featureDetection.supportsLocalStorage()
    };

    this.browserInfo = browserDetection.getBrowserInfo();
    this.initialized = true;

    // Apply compatibility classes to document
    this.applyCompatibilityClasses();

    // Log compatibility info in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Browser Compatibility Info:', {
        browser: this.browserInfo,
        features: this.features
      });
    }
  }

  // Apply CSS classes based on feature support
  applyCompatibilityClasses() {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;

    // Add feature support classes
    Object.entries(this.features).forEach(([feature, supported]) => {
      if (supported) {
        html.classList.add(`supports-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      } else {
        html.classList.add(`no-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      }
    });

    // Add browser classes
    html.classList.add(`browser-${this.browserInfo.name.toLowerCase()}`);
    html.classList.add(`browser-version-${this.browserInfo.version}`);

    // Add mobile class
    if (browserDetection.isMobile()) {
      html.classList.add('is-mobile');
    }

    // Add iOS class
    if (browserDetection.isIOS()) {
      html.classList.add('is-ios');
    }

    // Add unsupported browser class
    if (!this.browserInfo.isSupported) {
      html.classList.add('unsupported-browser');
    }
  }

  // Check if glassmorphism should be enabled
  shouldUseGlassmorphism() {
    return this.features.backdropFilter && this.browserInfo.isSupported;
  }

  // Get fallback styles for glassmorphism
  getGlassFallbackStyles() {
    if (this.shouldUseGlassmorphism()) {
      return {};
    }

    return {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };
  }

  // Show browser compatibility warning
  showCompatibilityWarning() {
    if (this.browserInfo.isSupported) return;

    const warningDiv = document.createElement('div');
    warningDiv.id = 'browser-compatibility-warning';
    warningDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f59e0b;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      ">
        <strong>Browser Compatibility Notice:</strong> 
        You're using ${this.browserInfo.name} ${this.browserInfo.version}. 
        For the best experience, please update to a modern browser 
        (Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+).
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-left: 10px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        ">×</button>
      </div>
    `;

    document.body.appendChild(warningDiv);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      const warning = document.getElementById('browser-compatibility-warning');
      if (warning) {
        warning.remove();
      }
    }, 10000);
  }
}

// Create global instance
export const compatibilityManager = new CompatibilityManager();

// React hook for compatibility
export const useCompatibility = () => {
  const [compatibility, setCompatibility] = useState({
    features: {},
    browserInfo: {},
    initialized: false
  });

  useEffect(() => {
    if (!compatibilityManager.initialized) {
      compatibilityManager.init();
    }

    setCompatibility({
      features: compatibilityManager.features,
      browserInfo: compatibilityManager.browserInfo,
      initialized: compatibilityManager.initialized
    });

    // Show warning for unsupported browsers
    if (!compatibilityManager.browserInfo.isSupported) {
      compatibilityManager.showCompatibilityWarning();
    }
  }, []);

  return {
    ...compatibility,
    shouldUseGlassmorphism: compatibilityManager.shouldUseGlassmorphism(),
    getFallbackStyles: () => compatibilityManager.getGlassFallbackStyles()
  };
};

// Polyfills for older browsers
export const loadPolyfills = async () => {
  const polyfills = [];

  // IntersectionObserver polyfill
  if (!featureDetection.supportsIntersectionObserver()) {
    polyfills.push(
      import('intersection-observer').catch(() => {
        console.warn('Failed to load IntersectionObserver polyfill');
      })
    );
  }

  // Promise.allSettled polyfill for older browsers
  if (!Promise.allSettled) {
    Promise.allSettled = (promises) => {
      return Promise.all(
        promises.map(promise =>
          Promise.resolve(promise)
            .then(value => ({ status: 'fulfilled', value }))
            .catch(reason => ({ status: 'rejected', reason }))
        )
      );
    };
  }

  await Promise.allSettled(polyfills);
};

// Initialize compatibility on module load
if (typeof window !== 'undefined') {
  // Load polyfills first
  loadPolyfills().then(() => {
    compatibilityManager.init();
  });
}