/* TiyanPure Service Worker — cache offline + installable PWA */
const CACHE = 'tiyanpure-v3';
const CORE = [
  '/', '/index.html', '/search.html', '/submit-apk.html', '/offline.html',
  '/list.html', '/apk.html', '/dl.html', '/404.html',
  '/game.html', '/app.html', '/discover.html', '/pre-register.html',
  '/game-24h.html', '/app-24h.html', '/editor-choice.html', '/game-sales.html',
  '/partner-developers.html', '/topic/top-new-games.html', '/topic/top-new-apps.html',
  '/about.html', '/contact-us.html', '/cooperation.html', '/privacy-policy.html',
  '/copyright-policy.html', '/terms.html', '/eu-amau.html', '/support.html', '/tiyanpure-app.html',
  '/manifest.webmanifest',
  '/assets/css/style.css',
  '/assets/js/common.js', '/assets/js/home.js', '/assets/js/search.js',
  '/assets/js/upload.js', '/assets/js/list.js', '/assets/js/detail.js', '/assets/js/dl.js',
  '/assets/icons/icon-96x96.png', '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png', '/assets/icons/maskable-512x512.png',
  '/assets/icons/apple-touch-icon.png', '/assets/icons/favicon.ico',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  // API proxy: network first, fallback cache (singkat)
  if (url.pathname.startsWith('/apiproxy/')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Gambar remote (winudf dkk): cache first, fallback ikon lokal
  if (req.destination === 'image' && url.origin !== self.location.origin) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match('/assets/icons/icon-96x96.png')))
    );
    return;
  }

  // Halaman: network first, fallback cache, terakhir offline.html
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('/offline.html')))
    );
    return;
  }

  // Asset lokal lain: cache first
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }))
  );
});
