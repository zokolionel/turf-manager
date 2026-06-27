/* Service Worker — Turf Manager France (PWA offline) */
const CACHE = 'turf-manager-v3';

// App shell pré-caché à l'installation (léger). Les gros PNG de fond sont
// mis en cache à la volée au premier usage (cache runtime ci-dessous).
const SHELL = [
  './',
  './turf-manager-france.html',
  './race_v3.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first + remplissage runtime (les bg_*.png se cachent au 1er téléchargement).
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((c) => { try { c.put(e.request, copy); } catch (_) {} });
      return resp;
    }).catch(() => caches.match('./turf-manager-france.html')))
  );
});
