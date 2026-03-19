/**
 * Service Worker for Esena Pharmacy
 * Implements advanced caching strategies for optimal performance
 */

const CACHE_NAME = 'esena-pharmacy-v1.4';
const STATIC_CACHE = 'esena-static-v1.4';
const IMAGE_CACHE = 'esena-images-v1.4';
const API_CACHE = 'esena-api-v1.4';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Critical branding images (WebP)
  '/branding1.1.webp',
  '/branding1.2.webp',
  '/branding2.1.webp',
  '/branding2.2.webp',
  '/branding3.1.webp',
  '/branding3.2.webp',
  '/branding4.1.webp',
  '/branding4.2.webp',
  '/branding4.3.webp',
  // Essential UI images (WebP)
  '/quality_medication.webp',
  '/expert_consultations.webp',
  '/fast_delivery.webp',
  '/pharmacist_support.webp',
  '/mpesa.webp'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url =>
          !url.match(/\.(webp|jpeg|png|jpg)$/i)
        ));
      }),
      caches.open(IMAGE_CACHE).then((cache) => {
        console.log('Caching critical images');
        const imageAssets = STATIC_ASSETS.filter(url =>
          url.match(/\.(webp|jpeg|png|jpg)$/i)
        );
        return Promise.allSettled(
          imageAssets.map(url =>
            cache.add(url).catch(e => console.warn('Failed to cache image:', url, e))
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    Promise.all([
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
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated successfully');
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Never intercept video files — they are large and use range requests
  // which the SW cache doesn't handle well
  if (url.pathname.match(/\.(mp4|webm|ogg|mov)$/i)) return;

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }

    if (isImage(url)) {
      return await imageStrategy(request);
    }

    // API calls: never intercept — pass directly to network
    // Caching API responses causes stale data; SW timeout causes ERR_FAILED
    if (isApiCall(url)) {
      return await fetch(request);
    }

    if (isHtmlPage(url)) {
      return await networkFirst(request, STATIC_CACHE, 3000);
    }

    return await fetch(request);

  } catch (error) {
    console.error('Service Worker fetch error:', error);

    if (isHtmlPage(url)) {
      const cache = await caches.open(STATIC_CACHE);
      const fallback = await cache.match('/');
      if (fallback) return fallback;
    }

    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    fetch(request).then(response => {
      if (response.ok) cache.put(request, response.clone());
    }).catch(() => {});
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName, timeout = 5000) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      )
    ]);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn('Network failed, trying cache:', error.message);
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function imageStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.warn('Image load failed:', request.url);
    throw error;
  }
}

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
  return url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/uploads/');
}

function isHtmlPage(url) {
  return url.pathname === '/' ||
         (!url.pathname.includes('.') && !url.pathname.startsWith('/api/'));
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Background sync triggered');
}

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      data: data.url
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});
