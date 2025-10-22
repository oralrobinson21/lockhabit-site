self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('lockhabit-cache-v1').then(cache => 
      cache.addAll(['/', '/index.html', '/privacy.html', '/terms.html'])
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => 
      resp || fetch(event.request)
    )
  );
});