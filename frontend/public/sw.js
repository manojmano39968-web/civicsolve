// CivicSolve V2 Service Worker — Production Safe
const CACHE_NAME = 'civicsolve-v2-cache-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/images/civicsolve-mark.svg',
  '/assets/images/civicsolve-logo.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache non-critical warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 1. Only process GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // 2. EXCLUDE all external / cross-origin requests (e.g. Google Fonts)
  // Let the browser load them directly per standard CSP style-src/font-src rules
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. EXCLUDE API routes and auth endpoints completely
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 4. Handle HTML Navigation requests (e.g. /, /search, /requests, etc.)
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback to cached index.html or root
          return caches.match('/index.html')
            .then((cached) => cached || caches.match('/'))
            .then((fallback) => {
              if (fallback) return fallback;
              return new Response('Offline — CivicSolve V2', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' },
              });
            });
        })
    );
    return;
  }

  // 5. Handle Same-Origin Static Assets (/assets/*, icons, manifests)
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.webmanifest') || url.pathname.endsWith('.svg')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('Asset unavailable offline', {
              status: 404,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
    );
    return;
  }

  // 6. For all other requests, do not intercept — allow standard browser fetching
});
