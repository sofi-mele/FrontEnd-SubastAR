/* SubastAR PWA service worker.
 * - Precarga el shell de la app y assets básicos.
 * - Cache-first para estáticos (carga más rápida y soporte offline mínimo).
 * - Network-first para navegaciones, con fallback al shell y a /offline.html.
 * - Auto-update: skipWaiting + clients.claim para activar la versión nueva.
 * IMPORTANTE: nunca intercepta requests cross-origin (API / backend quedan intactos).
 */
const CACHE = 'subastar-static-v1';
const PRECACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // No tocar otros orígenes (backend / API / CDN externos).
  if (url.origin !== self.location.origin) return;

  // Navegaciones (rutas SPA): network-first con fallback al shell y offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/', copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((r) => r || caches.match('/'))
            .then((r) => r || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Estáticos: cache-first y se completa con la red.
  if (/\.(?:js|css|png|jpe?g|svg|gif|webp|avif|woff2?|ttf|otf|eot|ico|json|map)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req)
            .then((res) => {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
              return res;
            })
            .catch(() => cached)
      )
    );
  }
});
