const CACHE = 'progressions-v5';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './program.js',
  './nutrition.js',
  './ai.js',
  './manifest.json',
  './apple-touch-icon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(ASSETS.map(async url => {
      try { await cache.add(url); } catch (err) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/version.json')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok) {
        try { await cache.put(req, fresh.clone()); } catch (err) {}
      }
      return fresh;
    } catch (err) {
      const hit = await cache.match(req) || (req.mode === 'navigate' ? await cache.match('./index.html') : null);
      if (hit) return hit;
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
