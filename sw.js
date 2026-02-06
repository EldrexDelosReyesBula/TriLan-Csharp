const CACHE_NAME = 'trilan-v2.3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    (async () => {
        // Try Cache first
        const cached = await caches.match(e.request);
        if (cached) return cached;

        try {
            // Try Network
            const response = await fetch(e.request);
            // Cache successful GET requests to external assets or local files
            if (response.ok && (e.request.url.startsWith('http') || e.request.url.includes(self.registration.scope))) {
                const cacheCopy = response.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, cacheCopy));
            }
            return response;
        } catch (error) {
            // Fallback for navigation requests (SPA support)
            // If the user is offline and requests any route, serve index.html
            if (e.request.mode === 'navigate') {
                return caches.match('./index.html') || caches.match('./');
            }
            throw error;
        }
    })()
  );
});