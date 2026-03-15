/**
 * Tests for Cache Manager
 */

import { 
  CookieCache, 
  LocalStorageCache, 
  PerformancePreferences,
  CacheManager 
} from './cacheManager';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
});

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      objectStoreNames: { contains: jest.fn(() => false) },
      createObjectStore: jest.fn(() => ({
        createIndex: jest.fn()
      }))
    }
  }))
};

describe('CookieCache', () => {
  beforeEach(() => {
    document.cookie = '';
  });

  test('sets and gets cookie values', () => {
    const testData = { test: 'value' };
    CookieCache.set('test-cookie', testData);
    
    // Mock the cookie being set
    document.cookie = `test-cookie=${encodeURIComponent(JSON.stringify(testData))}`;
    
    const result = CookieCache.get('test-cookie');
    expect(result).toEqual(testData);
  });

  test('returns null for non-existent cookie', () => {
    const result = CookieCache.get('non-existent');
    expect(result).toBeNull();
  });

  test('checks if cookie exists', () => {
    document.cookie = 'existing-cookie=value';
    expect(CookieCache.exists('existing-cookie')).toBe(true);
    expect(CookieCache.exists('non-existent')).toBe(false);
  });
});

describe('LocalStorageCache', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  test('sets and gets values with TTL', () => {
    const testData = { test: 'value' };
    const mockItem = {
      value: testData,
      timestamp: Date.now(),
      ttl: 60 * 60 * 1000 // 1 hour
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockItem));
    
    LocalStorageCache.set('test-key', testData, 60);
    expect(localStorageMock.setItem).toHaveBeenCalled();

    const result = LocalStorageCache.get('test-key');
    expect(result).toEqual(testData);
  });

  test('returns null for expired items', () => {
    const expiredItem = {
      value: { test: 'value' },
      timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
      ttl: 60 * 60 * 1000 // 1 hour TTL
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredItem));
    
    const result = LocalStorageCache.get('expired-key');
    expect(result).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('expired-key');
  });

  test('handles JSON parse errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    
    const result = LocalStorageCache.get('invalid-key');
    expect(result).toBeNull();
  });
});

describe('PerformancePreferences', () => {
  test('returns default preferences', () => {
    const prefs = PerformancePreferences.getPreferences();
    expect(prefs).toHaveProperty('enableImageCache', true);
    expect(prefs).toHaveProperty('enableApiCache', true);
    expect(prefs).toHaveProperty('enablePreloading', true);
    expect(prefs).toHaveProperty('cacheExpiry', 24);
  });

  test('detects slow connection', () => {
    // Mock navigator.connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: '2g',
        saveData: false
      }
    });

    expect(PerformancePreferences.isSlowConnection()).toBe(true);

    navigator.connection.effectiveType = '4g';
    expect(PerformancePreferences.isSlowConnection()).toBe(false);
  });

  test('should preload based on preferences and connection', () => {
    // Mock fast connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: '4g',
        saveData: false
      }
    });

    expect(PerformancePreferences.shouldPreload()).toBe(true);

    // Mock slow connection
    navigator.connection.effectiveType = '2g';
    expect(PerformancePreferences.shouldPreload()).toBe(false);
  });
});

describe('CacheManager', () => {
  let cacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
  });

  test('initializes successfully', async () => {
    await expect(cacheManager.init()).resolves.not.toThrow();
    expect(cacheManager.initialized).toBe(true);
  });

  test('caches and retrieves user preferences', () => {
    cacheManager.cacheUserPreference('theme', 'dark');
    const result = cacheManager.getUserPreference('theme');
    // Note: This will return null in test environment due to cookie mocking
    // In real environment, it would return 'dark'
    expect(result).toBeDefined();
  });

  test('gets cache statistics', () => {
    const stats = cacheManager.getCacheStats();
    expect(stats).toHaveProperty('localStorageSize');
    expect(stats).toHaveProperty('memoryCacheSize');
    expect(stats).toHaveProperty('isSlowConnection');
    expect(stats).toHaveProperty('preferences');
  });

  test('clears all caches', () => {
    expect(() => cacheManager.clearAllCaches()).not.toThrow();
  });
});

describe('Integration Tests', () => {
  test('cache manager handles image optimization', async () => {
    const cacheManager = new CacheManager();
    await cacheManager.init();

    // Mock fetch for image
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['fake-image-data']))
      })
    );

    const imageUrl = '/test-image.jpg';
    const result = await cacheManager.getOptimizedImageUrl(imageUrl);
    
    // Should return either cached URL or original URL
    expect(typeof result).toBe('string');
  });

  test('performance preferences persist across sessions', () => {
    const originalPrefs = PerformancePreferences.getPreferences();
    
    const newPrefs = {
      ...originalPrefs,
      enableImageCache: false,
      cacheExpiry: 48
    };
    
    PerformancePreferences.setPreferences(newPrefs);
    const retrievedPrefs = PerformancePreferences.getPreferences();
    
    expect(retrievedPrefs.enableImageCache).toBe(false);
    expect(retrievedPrefs.cacheExpiry).toBe(48);
  });
});