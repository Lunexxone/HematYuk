// HematYuk service worker: cache tampilan agar aplikasi cepat terbuka & tetap tampil saat offline.
// Data (Apps Script) tidak pernah di-cache supaya selalu terbaru.
const V = 'hematyuk-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET') return;
  if (u.hostname === 'script.google.com' || u.hostname.endsWith('googleusercontent.com')) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('index.html', c)); return r; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      const ok = r.ok && (u.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname));
      if (ok) { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); }
      return r;
    }))
  );
});
