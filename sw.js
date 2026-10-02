// ==========================================================================
// HOTEL PREMIER - OFFLINE SERVICE WORKER (PWA)
// Enables instant loading and full offline browsing of the Digital QR Menu
// ==========================================================================

const CACHE_NAME = 'hotel-premier-v2.1';
const CORE_ASSETS = [
  './',
  'index.html',
  'admin.html',
  'styles.css',
  'app.js',
  'admin.js',
  'storage.js',
  'data/hotel-data.js',
  'data/menu-data.js',
  'data/translations.js',
  'manifest.json',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/hotel_premier_gold_crest.jpg',
  'assets/hotel_premier_arch_crest.jpg'
];

// Install Event - Pre-cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache-First for static assets, Network-First for images/API
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // For same-origin static assets: Cache first, fall back to network
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(req).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(req).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache));
          return networkResponse;
        }).catch(() => {
          if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
            return caches.match('index.html');
          }
        });
      })
    );
  } else {
    // For external assets (Unsplash images, Google Fonts): Network first, then fallback to cache
    event.respondWith(
      fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(req);
      })
    );
  }
});
