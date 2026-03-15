/**
 * Comprehensive Performance and Storage Manager
 * Implements multi-layered browser storage strategy for optimal performance
 */

/**
 * Browser storage utilities for lightweight data
 */
export class CookieCache {
  static set(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  static get(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  static remove(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  static exists(name) {
    return this.get(name) !== null;
  }
}

/**
 * LocalStorage with expiration for temporary data
 */
export class LocalStorageCache {
  static set(key, value, ttlMinutes = 60) {
    const item = {
      value: value,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('LocalStorage quota exceeded, clearing old items');
      this.cleanup();
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch (e2) {
        console.error('Failed to store in localStorage:', e2);
      }
    }
  }

  static get(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static cleanup() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && Date.now() - parsed.timestamp > parsed.ttl) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        // Invalid JSON, remove it
        localStorage.removeItem(key);
      }
    });
  }

  static getSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
}

/**
 * IndexedDB storage for larger data and images
 */
export class IndexedDBCache {
  constructor(dbName = 'EsenaPharmacyCache', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', { keyPath: 'url' });
          imageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('api')) {
          const apiStore = db.createObjectStore('api', { keyPath: 'key' });
          apiStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async setImage(url, blob, ttlHours = 24) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    
    const item = {
      url: url,
      blob: blob,
      timestamp: Date.now(),
      ttl: ttlHours * 60 * 60 * 1000
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getImage(url) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['images'], 'readonly');
    const store = transaction.objectStore('images');
    
    return new Promise((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }
        
        // Check if expired
        if (Date.now() - result.timestamp > result.ttl) {
          this.removeImage(url);
          resolve(null);
          return;
        }
        
        resolve(result.blob);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeImage(url) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['images'], 'readwrite');
    const store = transaction.objectStore('images');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanup() {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction(['images', 'api'], 'readwrite');
    const imageStore = transaction.objectStore('images');
    const apiStore = transaction.objectStore('api');
    
    const now = Date.now();
    
    // Cleanup images
    const imageRequest = imageStore.openCursor();
    imageRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (now - cursor.value.timestamp > cursor.value.ttl) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
    
    // Cleanup API cache
    const apiRequest = apiStore.openCursor();
    apiRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (now - cursor.value.timestamp > cursor.value.ttl) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}

/**
 * Image cache manager with multiple fallback strategies
 */
export class ImageCacheManager {
  constructor() {
    this.indexedDB = new IndexedDBCache();
    this.memoryCache = new Map();
    this.loadingPromises = new Map();
  }

  async init() {
    try {
      await this.indexedDB.init();
    } catch (e) {
      console.warn('IndexedDB not available, using memory cache only');
    }
  }

  async getCachedImage(url) {
    // Check memory cache first (fastest)
    if (this.memoryCache.has(url)) {
      return this.memoryCache.get(url);
    }

    // Check IndexedDB cache
    try {
      const blob = await this.indexedDB.getImage(url);
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        this.memoryCache.set(url, objectUrl);
        return objectUrl;
      }
    } catch (e) {
      console.warn('Error reading from IndexedDB cache:', e);
    }

    return null;
  }

  async cacheImage(url) {
    // Prevent duplicate requests
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    const loadPromise = this._loadAndCacheImage(url);
    this.loadingPromises.set(url, loadPromise);
    
    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  async _loadAndCacheImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Cache in memory
      this.memoryCache.set(url, objectUrl);
      
      // Cache in IndexedDB
      try {
        await this.indexedDB.setImage(url, blob);
      } catch (e) {
        console.warn('Failed to cache image in IndexedDB:', e);
      }
      
      return objectUrl;
    } catch (e) {
      console.error('Failed to load image:', url, e);
      return null;
    }
  }

  preloadImages(urls) {
    urls.forEach(url => {
      this.cacheImage(url).catch(e => 
        console.warn('Failed to preload image:', url, e)
      );
    });
  }

  clearMemoryCache() {
    // Revoke object URLs to prevent memory leaks
    this.memoryCache.forEach(objectUrl => {
      URL.revokeObjectURL(objectUrl);
    });
    this.memoryCache.clear();
  }
}

/**
 * Performance preferences manager with cookie consent integration
 */
export class PerformancePreferences {
  static getConsentStatus() {
    const consent = CookieCache.get('cookie_consent');
    return consent || {
      necessary: true,
      performance: false,
      functional: false,
      analytics: false,
      marketing: false
    };
  }

  static hasPerformanceConsent() {
    const consent = this.getConsentStatus();
    return consent.performance === true;
  }

  static hasFunctionalConsent() {
    const consent = this.getConsentStatus();
    return consent.functional === true;
  }

  static getPreferences() {
    const consent = this.getConsentStatus();
    const saved = consent.performance ? CookieCache.get('performance_prefs') : null;
    
    return {
      enableImageCache: consent.performance,
      enableApiCache: consent.performance,
      enablePreloading: consent.performance && !this.isSlowConnection(),
      cacheExpiry: 24, // hours
      ...saved
    };
  }

  static setPreferences(prefs) {
    const consent = this.getConsentStatus();
    if (consent.performance) {
      CookieCache.set('performance_prefs', prefs, 30); // 30 days
    }
  }

  static isSlowConnection() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return connection.effectiveType === 'slow-2g' || 
             connection.effectiveType === '2g' ||
             connection.saveData;
    }
    return false;
  }

  static shouldPreload() {
    const prefs = this.getPreferences();
    return prefs.enablePreloading && !this.isSlowConnection();
  }
}

/**
 * Main cache manager that orchestrates all caching strategies
 */
export class CacheManager {
  constructor() {
    this.imageCache = new ImageCacheManager();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Check if user has given performance consent
      const consent = PerformancePreferences.getConsentStatus();
      
      if (consent.performance) {
        await this.imageCache.init();
        
        // Cleanup old cache entries on startup
        LocalStorageCache.cleanup();
        await this.imageCache.indexedDB.cleanup();
        
        // Preload critical images if enabled
        if (PerformancePreferences.shouldPreload()) {
          this.preloadCriticalImages();
        }
      }
      
      this.initialized = true;
      console.log('Performance system initialized successfully');
    } catch (e) {
      console.error('Failed to initialize performance system:', e);
    }
  }

  preloadCriticalImages() {
    const criticalImages = [
      '/branding1.1.jpeg',
      '/branding1.2.jpeg',
      '/branding2.1.jpeg',
      '/branding2.2.jpeg',
      '/branding3.1.jpeg',
      '/branding3.2.jpeg',
      '/branding4.1.jpeg',
      '/branding4.2.jpeg',
      '/branding4.3.jpeg',
      '/quality_medication.jpg',
      '/expert_consultations.png',
      '/fast_delivery.png'
    ];

    this.imageCache.preloadImages(criticalImages);
  }

  async getOptimizedImageUrl(url) {
    if (!this.initialized) await this.init();
    
    // Check if performance features are enabled
    const consent = PerformancePreferences.getConsentStatus();
    if (!consent.performance) {
      return url; // Return original URL if no performance consent
    }
    
    // Check cache first
    const cachedUrl = await this.imageCache.getCachedImage(url);
    if (cachedUrl) return cachedUrl;
    
    // Load and cache if not found
    const newUrl = await this.imageCache.cacheImage(url);
    return newUrl || url; // Fallback to original URL
  }

  // Cache API responses (only with consent)
  cacheApiResponse(key, data, ttlMinutes = 30) {
    const consent = PerformancePreferences.getConsentStatus();
    if (consent.performance) {
      LocalStorageCache.set(`api_${key}`, data, ttlMinutes);
    }
  }

  getCachedApiResponse(key) {
    const consent = PerformancePreferences.getConsentStatus();
    if (consent.performance) {
      return LocalStorageCache.get(`api_${key}`);
    }
    return null;
  }

  // Cache user preferences (only with functional consent)
  cacheUserPreference(key, value) {
    const consent = PerformancePreferences.getConsentStatus();
    if (consent.functional) {
      CookieCache.set(`pref_${key}`, value, 365); // 1 year
    }
  }

  getUserPreference(key, defaultValue = null) {
    const consent = PerformancePreferences.getConsentStatus();
    if (consent.functional) {
      return CookieCache.get(`pref_${key}`) || defaultValue;
    }
    return defaultValue;
  }

  // Clear all caches
  clearAllCaches() {
    // Clear cookies (performance related only)
    const cookieKeys = ['performance_prefs'];
    cookieKeys.forEach(key => CookieCache.remove(key));
    
    // Clear localStorage cache
    const lsKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('api_') || key.startsWith('cache_')
    );
    lsKeys.forEach(key => LocalStorageCache.remove(key));
    
    // Clear memory cache
    this.imageCache.clearMemoryCache();
    
    console.log('Browser storage cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      localStorageSize: LocalStorageCache.getSize(),
      memoryCacheSize: this.imageCache.memoryCache.size,
      isSlowConnection: PerformancePreferences.isSlowConnection(),
      preferences: PerformancePreferences.getPreferences()
    };
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

// Initialize on module load
if (typeof window !== 'undefined') {
  cacheManager.init().catch(e => 
    console.error('Failed to initialize cache manager:', e)
  );
}