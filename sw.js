// Offline-Speicher. Bei jeder Änderung an der App die Versionsnummer erhöhen,
// sonst bekommen installierte Handys die neuen Dateien nicht.
const CACHE = 'projekt100-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/data.js',
  './js/logic.js',
  './js/store.js',
  './js/chart.js',
  './js/ui.js',
  './js/views/today.js',
  './js/views/week.js',
  './js/views/shop.js',
  './js/views/progress.js',
  './js/views/sheets.js',
  './fonts/BricolageGrotesque-latin.woff2',
  './fonts/Figtree-latin.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/favicon-48.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((hit) => hit || fetch(event.request)),
  );
});
