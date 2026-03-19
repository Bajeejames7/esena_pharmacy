/**
 * Service Worker for Esena Pharmacy
 * Implements advanced caching strategies for optimal performance
 */

const CACHE_NAME = 'esena-pharmacy-v1.2';
const STATIC_CACHE = 'esena-static-v1.2';
const IMAGE_CACHE = 'esena-images-v1.2';
const API_CACHE = 'esena-api-v1.2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  // Critical branding images
  '/branding1.1.jpeg',
  '/branding1.2.jpeg',
  '/branding2.1.jpeg',
  '/branding2.2.jpeg',
  '/branding3.1.jpeg',
  '/branding3.2.jpeg',
  '/branding4.1.jpeg',
  '/branding4.2.jpeg',
  '/branding4.3.jpeg',
  // Essential UI images
  '/quality_medication.jpg',
  '/expert_consultations.png',
  '/fast_delivery.png',
  '/pharmacist_support.png',
  '/mpesa.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products',
  '/api/categories',
  '/api/blog'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => 
          !url.includes('.jpeg') && !url.includes('.png') && !url.includes('.jpg')
        ));
      }),
      // Cache critical images separately
      caches.open(IMAGE_CACHE).then((cache) => {
        console.log('Caching critical images');
        const imageAssets = STATIC_ASSETS.filter(url => 
          url.includes('.jpeg') || url.includes('.png') || url.includes('.jpg')
        );
        return Promise.allSettled(
          imageAssets.map(url => 
            cache.add(url).catch(e => console.warn('Failed to cache image:', url, e))
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE &&
                cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated successfully');
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Static assets (Cache First)
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Images (Cache First with fallback)
    if (isImage(url)) {
      return await imageStrategy(request);
    }
    
    // Strategy 3: API calls (Network First with cache fallback)
    if (isApiCall(url)) {
      return await networkFirst(request, API_CACHE, 5000); // 5 second timeout
    }
    
    // Strategy 4: HTML pages (Network First)
    if (isHtmlPage(url)) {
      return await networkFirst(request, STATIC_CACHE, 3000); // 3 second timeout
    }
    
    // Default: Network only
    return await fetch(request);
    
  } catch (error) {
    console.error('Service Worker fetch error:', error);
    
    // Return offline fallback if available
    if (isHtmlPage(url)) {
      const cache = await caches.open(STATIC_CACHE);
      const fallback = await cache.match('/');
      if (fallback) return fallback;
    }
    
    throw error;
  }
}

// Cache First strategy (for static assets)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {}); // Ignore network errors
    
    return cached;
  }
  
  // Not in cache, fetch from network
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network First strategy (for dynamic content)
async function networkFirst(request, cacheName, timeout = 5000) {
  const cache = await caches.open(cacheName);
  
  try {
    // Try network first with timeout
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      )
    ]);
    
    if (networkResponse.ok) {
      // Update cache with fresh response
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Network failed, trying cache:', error.message);
    
    // Network failed, try cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Special strategy for images
async function imageStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Only cache successful image responses
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return a placeholder image for failed loads
    console.warn('Image load failed:', request.url);
    throw error;
  }
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.includes('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.includes('/favicon');
}

function isImage(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

function isApiCall(url) {
  return url.pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

function isHtmlPage(url) {
  return url.pathname === '/' ||
         (!url.pathname.includes('.') && !url.pathname.startsWith('/api/'));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline form submissions, etc.
  console.log('Background sync triggered');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      data: data.url
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Periodic background sync for cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupCaches());
  }
});

async function cleanupCaches() {
  const imageCache = await caches.open(IMAGE_CACHE);
  const apiCache = await caches.open(API_CACHE);
  
  // Remove old entries (older than 24 hours)
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  
  const requests = await imageCache.keys();
  for (const request of requests) {
    const response = await imageCache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (now - responseDate > maxAge) {
          await imageCache.delete(request);
        }
      }
    }
  }
  
  console.log('Storage cleanup completed');
}