// ==========================================================================
// HOTEL PREMIER - OFFLINE SERVICE WORKER (PWA)
// Network-First with Offline Cache Fallback
// Guarantees mobile users always see latest menu updates & sub-sections
// ==========================================================================

const CACHE_NAME = 'hotel-premier-v21.13';
const CORE_ASSETS = [
  './',
  'index.html',
  'admin.html',
  'styles.css',
  'royal.css',
  'public-reviews.js',
  'data/public-reviews.json',
  'asset-pipeline.js',
  'app.js',
  'admin.js',
  'content-studio.js',
  'property-gallery.js',
  'storage.js',
  'vault.js',
  'data/hotel-data.js',
  'data/menu-data.js',
  'data/menu-photos.js',
  'data/menu-image-sizes.js',
  'data/translations.js',
  'manifest.json',
  'assets/premier-original-logo.png',
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
          if (key.startsWith('hotel-premier-') && key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - keep the app shell fresh without caching third-party food photos.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // A cached local image makes repeat menu visits near-instant, while the first
  // visit still downloads normally. Scripts and data remain network-first below.
  if (req.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(req);
        // Content-hashed derivatives are immutable; original filenames may be replaced.
        if (cachedResponse && /\/menu-responsive\/[a-f0-9]+-\d+\.webp$/.test(url.pathname)) return cachedResponse;
        return fetch(req, { cache: 'reload' }).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const imageCopy = networkResponse.clone();
            cache.put(req, imageCopy).catch(() => {});
          }
          return networkResponse;
        }).catch(() => cachedResponse || Response.error());
      })
    );
    return;
  }

  // Network-First strategy: fetch newest version from network, fallback to cache if offline
  event.respondWith(
    fetch(req, { cache: 'no-cache' }).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        }).catch(() => {});
      }
      return networkResponse;
    }).catch(() => {
      // Offline fallback: serve from cache (ignoring version query parameters like ?v=18.1)
      return caches.match(req, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
          return caches.match('index.html', { ignoreSearch: true });
        }
      });
    })
  );
});
