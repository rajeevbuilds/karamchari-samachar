// Minimal service worker: cache-first for static assets (JS/CSS/fonts/icons),
// network-only for everything else so circular lists, detail pages, and API
// routes are never served stale.
const CACHE_NAME = 'ks-static-v1';
const STATIC_PATTERN = /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|svg|ico|gif|webp)$/;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  if (url.pathname.startsWith('/_next/static/')) return true;
  if (url.pathname.startsWith('/icons/')) return true;
  return STATIC_PATTERN.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API calls or page navigations - always fresh content.
  if (url.pathname.startsWith('/api/')) return;
  if (req.mode === 'navigate') return;
  if (!isStaticAsset(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
  );
});
