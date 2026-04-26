const CACHE_NAME = 'ed-v2';
const ASSETS = [
  '/', '/index.html', '/css/style.css',
  '/js/utils.js', '/js/icons.js', '/js/store.js',
  '/js/screens.js', '/js/screens2.js', '/js/screens3.js',
  '/js/modals.js', '/js/app.js', '/manifest.json',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
