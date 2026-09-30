// Offline-Speicher. Bei jeder Änderung an der App die Versionsnummer erhöhen,
// sonst bekommen installierte Handys die neuen Dateien nicht.
const CACHE = 'projekt100-v7';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/data.js',
  './js/recipes.js',
  './js/planner.js',
  './js/gesture.js',
  './js/fx.js',
  './js/sfx.js',
  './js/arena.js',
  './js/music.js',
  './js/battle.js',
  './js/views/battle.js',
  './js/logic.js',
  './js/store.js',
  './js/chart.js',
  './js/ui.js',
  './js/views/today.js',
  './js/views/week.js',
  './js/views/shop.js',
  './js/views/progress.js',
  './js/views/sheets.js',
  './js/views/parts.js',
  './js/views/swipe.js',
  './fonts/BricolageGrotesque-latin.woff2',
  './fonts/Figtree-latin.woff2',
  './fonts/PressStart2P-latin.woff2',
  './img/pixel/burg-hoch.png',
  './img/pixel/held.png',
  './img/pixel/drache.png',
  './img/pixel/oger.png',
  './img/pixel/ritter-schwarz.png',
  './img/pixel/held-koerper.png',
  './img/pixel/held-waffe.png',
  './img/pixel/oger-koerper.png',
  './img/pixel/oger-waffe.png',
  './img/pixel/ritter-schwarz-koerper.png',
  './img/pixel/ritter-schwarz-waffe.png',
  './img/pixel/bauer.png',
  './img/pixel/magd.png',
  './img/pixel/reiter.png',
  './img/pixel/schaf.png',
  './img/pixel/huhn.png',
  './img/pixel/vogel.png',
  './img/pixel/wolke1.png',
  './img/pixel/wolke2.png',
  './img/pixel/wolke3.png',
  './img/pixel/hieb.png',
  './img/pixel/essen.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/favicon-48.png',
];

// Ein Foto je Gericht. Fehlt eins, bleibt die App trotzdem installierbar.
const PHOTOS = [
  'porridge', 'quark_bowl', 'shake_fruehstueck', 'overnight_oats', 'ruehrei_brot', 'eiermuffins', 'huettenkaese_brot',
  'skyr_apfel', 'bowl_haehnchen', 'bowl_thunfisch', 'teriyaki_haehnchen', 'haehnchen_curry', 'abend_schenkel_kartoffel',
  'abend_brust_reis', 'abend_schenkel_reis', 'haehnchen_wrap', 'haehnchen_suesskartoffel', 'pute_paprika_reis', 'pute_gyros',
  'abend_huefte', 'chili_con_carne', 'hack_reis_pfanne', 'burger_bowl', 'abend_schweinelachs', 'schwein_bowl', 'lachs_reis',
  'kabeljau_kartoffel', 'thunfisch_nudeln', 'garnelen_reis', 'shakshuka', 'ofenkartoffel_huettenkaese', 'snack_nuesse',
  'snack_shake', 'skyr_beeren', 'protein_pudding', 'reiswaffeln_erdnuss', 'huettenkaese_rohkost', 'quark_apfel', 'eier_airfryer', 'laugenbrezel_huettenkaese', 'maultaschen_ei', 'linsen_spaetzle',
  'kartoffelsalat_pute', 'gaisburger_marsch', 'zwiebelrostbraten', 'kaesespaetzle_light', 'schupfnudeln_sauerkraut',
].map((id) => `./img/${id}.webp`);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await cache.addAll(CORE);
      await Promise.allSettled(PHOTOS.map((url) => cache.add(url)));
    }),
  );
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
    caches.match(event.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(event.request).then((response) => {
          if (response.ok && new URL(event.request.url).pathname.includes('/img/')) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        }),
    ),
  );
});
