// Offline-Speicher. Bei jeder Änderung an der App die Versionsnummer erhöhen,
// sonst bekommen installierte Handys die neuen Dateien nicht.
const CACHE = 'projekt100-v8';
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
  './img/pixel/haenger.png',
  './img/pixel/feuerwehr.png',
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
  'pesto_eier', 'tortilla_faltwrap', 'huettenkaese_pancakes', 'skyr_bagel_lachs', 'baked_oats', 'joghurt_toast', 'feta_spiegeleier', 'wolkeneier', 'dampfei', 'crispy_eggs', 'frambled_eggs', 'hot_honey_bowl', 'tuerkische_nudeln', 'bigmac_tacos', 'lasagne_suppe', 'marry_me_chicken', 'alfredo_huettenkaese', 'tomaten_reis_haehnchen', 'caesar_pizza', 'feta_pasta', 'bohnensalat_haehnchen', 'haehnchen_fajita_quesadilla', 'philly_cheesesteak_paprika', 'oyakodon', 'bieber_haehnchenbaellchen', 'swamp_soup', 'tomaten_ruehrei_reis', 'steakwuerfel_knoblauch', 'chopped_italian_sandwich', 'reiskocher_bratreis', 'pfeffer_haehnchen', 'zitronen_haehnchen_reis', 'backpapier_doener', 'rind_brokkoli', 'dirty_spaghetti', 'puten_feta_baellchen', 'gochujang_bowl', 'blech_kafta', 'lachs_bowl_mariko', 'fruehlingsrollen_bowl', 'gurkensalat_lachs', 'huettenkaese_pizza', 'huettenkaese_eis', 'skyr_lotus_cheesecake', 'skyr_schoko_cluster', 'huettenkaese_keksteig', 'mayak_eier', 'thunfischsalat_mcconaughey', 'egg_flight', 'thunfischbrot',
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
