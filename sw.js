// Public shell only. Guest records and private API responses never enter these caches.
const CACHE_NAME = 'hotel-premier-v22.66';
const CORE_ASSETS = [
 './', 'index.html', 'offline.html', 'admin.html', 'styles.css', 'royal.css', 'inline-styles.css', 'theme-tokens.css',
 'local-admin.css', 'local-lock.js', 'photo-storage.js', 'photo-workflow.js', 'photo-worker.js',  'ui-dialogs.js', 'pwa-updates.js', 'overlay-manager.js', 'guest-forms.js', 'overlays.css', 'public-reviews.js',
 'asset-pipeline.js', 'data-validation.js', 'image-safety.js', 'admin-layout.js', 'app.js', 'guest-network.js', 'group-stays.js', 'admin.js', 'publish-bundle.js','data/published-overrides.js',
 'content-studio.js', 'menu-structure.js', 'property-gallery.js', 'section-navigation.js', 'storage.js', 'vault.js', 'admin-localization.js', 'data/interface-copy.js',
 'data/hotel-data.js', 'data/menu-data.js', 'data/menu-photos.js',
 'data/menu-image-sizes.js', 'data/translations.js', 'data/guest-localization.js', 'data/public-reviews.json',
 'manifest.json', 'data/legacy-photo-paths.js', 'assets/brand-placeholder.svg', 'assets/premier-original-logo.png',
 'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon-maskable-512.png',
 'assets/brands/google-g.png', 'assets/brands/google-maps.png',
 'assets/brands/makemytrip.png', 'assets/brands/goibibo-sprite.png',
 'assets/brands/swiggy.png', 'assets/brands/zomato.png'
];
const mayCache = response => response && response.ok && response.type !== 'opaque'
 && !/no-store|private/i.test(response.headers.get('cache-control') || '');
self.addEventListener('install', event => {
 // One unavailable asset must not prevent the rest of the offline shell installing.
 event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.allSettled(
  CORE_ASSETS.map(async asset => {
   const response = await fetch(new Request(new URL(asset, self.registration.scope), { cache: 'no-cache' }));
   if (mayCache(response)) await cache.put(asset, response);
  })
 )));
});
self.addEventListener('activate', event => {
 // Natural activation after old tabs close, or after the guest chooses Refresh.
 event.waitUntil((async()=>{
  // Other tabs may still have an unsaved form and an older controller. Keep their offline shell.
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  if(windows.length)return;
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('hotel-premier-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));
 })());
});
self.addEventListener('message', event => {
 if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
 const req = event.request;
 const url = new URL(req.url);
 if (req.method !== 'GET' || url.origin !== self.location.origin || req.cache === 'no-store'
  || req.headers.has('authorization') || /\/(?:guest-access|guest-network-admin)(?:\/|$)/.test(url.pathname)) return;
 const cacheNetwork = async cache => {
  const response = await fetch(req);
  if (mayCache(response)) await cache.put(req, response.clone()).catch(() => {});
  return response;
 };
 if (req.destination === 'image') {
  const cacheReady = caches.open(CACHE_NAME);
  const cachedReady = cacheReady.then(cache => cache.match(req));
  const immutable = /\/menu-responsive\/[a-f0-9]+-\d+\.webp$/.test(url.pathname);
  const network = Promise.all([cacheReady, cachedReady]).then(([cache, cached]) =>
   cached && immutable ? cached : cacheNetwork(cache));
  event.waitUntil(network.catch(() => {}));
  event.respondWith(cachedReady.then(cached => cached || network).catch(async () =>
   (await cacheReady).match('assets/brand-placeholder.svg')).then(response => response || Response.error()));
  return;
 }
 event.respondWith(caches.open(CACHE_NAME).then(async cache => {
  try {
   const response = await cacheNetwork(cache);
   if (response.ok || req.mode !== 'navigate') return response;
  } catch (_) { /* Use the public offline shell below. */ }
  const cached = await cache.match(req, { ignoreSearch: true });
  if (cached) return cached;
  if (req.mode === 'navigate') return (await cache.match('index.html'))
   || (await cache.match('offline.html')) || new Response('Hotel Premier is offline.', { status: 503 });
  return Response.error();
 }));
});
