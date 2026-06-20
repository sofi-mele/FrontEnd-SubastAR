/* SubastAR PWA service worker.
 * Diseño conservador para no romper la carga de la app:
 *  - Precarga el shell y los íconos.
 *  - Navegaciones: network-first con fallback al shell cacheado y a /offline.html.
 *  - Imágenes/íconos same-origin: cache-first (no usan Content-Encoding, son seguros).
 *  - NO intercepta fuentes (.ttf/.woff), JS ni CSS: el navegador ya los cachea por HTTP
 *    y son hash-inmutables. Evita el bug de doble-descompresión (Content-Encoding) que
 *    produce "Failed to decode font".
 *  - Nunca toca requests cross-origin (backend / API quedan intactos).
 *  - Solo cachea respuestas válidas (response.ok).
 */
const CACHE = 'subastar-static-v2';
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
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => {})));
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

function isCacheableImage(pathname) {
  return /\.(?:png|jpe?g|svg|gif|webp|avif|ico)$/.test(pathname);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // No tocar otros orígenes (backend / API / CDN externos).
  if (url.origin !== self.location.origin) return;

  // Navegaciones (rutas SPA): network-first con fallback al shell y a offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put('/', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches
            .match('/')
            .then((r) => r || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Solo imágenes/íconos same-origin: cache-first. (Fuentes, JS y CSS quedan a cargo
  // del navegador para evitar problemas de Content-Encoding.)
  if (isCacheableImage(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req)
            .then((res) => {
              if (res && res.ok && res.type === 'basic') {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
              }
              return res;
            })
            .catch(() => cached)
      )
    );
  }
});
