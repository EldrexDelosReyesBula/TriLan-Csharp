const CACHE_NAME = 'trilan-v2.1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))));
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
            // Cache successful GET requests (excluding data/blobs if necessary)
            if (response.ok && e.request.url.startsWith('http')) {
                const cacheCopy = response.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, cacheCopy));
            }
            return response;
        } catch (error) {
            // Fallback for navigation requests (SPA support)
            if (e.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
            throw error;
        }
    })()
  );
});