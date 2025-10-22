self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('lh-v1').then(c =>
      c.addAll(['/', '/index.html', '/assets/favicon.svg', '/assets/logo.svg'])
    )
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});