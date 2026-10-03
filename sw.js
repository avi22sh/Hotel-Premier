// ==========================================================================
// HOTEL PREMIER - OFFLINE SERVICE WORKER (PWA)
// Network-First with Offline Cache Fallback
// Guarantees mobile users always see latest menu updates & sub-sections
// ==========================================================================

const CACHE_NAME = 'hotel-premier-v4.0';
const CORE_ASSETS = [
  './',
  'index.html',
  'admin.html',
  'styles.css',
  'app.js',
  'admin.js',
  'storage.js',
  'vault.js',
  'data/hotel-data.js',
  'data/menu-data.js',
  'data/translations.js',
  'manifest.json',
  'assets/icon-192.png',
  'assets/icon-512.png'
];

// Install Event - Pre-cache core shell assets & immediately take control
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
});

// Activate Event - Clean up all stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First for HTML, Scripts & Styles so changes reflect immediately
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Network-First strategy: fetch newest version from network, fallback to cache if offline
  event.respondWith(
    fetch(req).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        }).catch(() => {});
      }
      return networkResponse;
    }).catch(() => {
      // Offline fallback: serve from cache
      return caches.match(req).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
          return caches.match('index.html');
        }
      });
    })
  );
});
