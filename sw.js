// sw.js – super light cache-first for shell assets
const NAME = 'lh-v1';
const ASSETS = [
  '/', '/index.html',
  '/demo.html', '/calculator.html',
  '/manifest.webmanifest',
  '/assets/favicon.svg', '/assets/og-image.svg', '/assets/icon-192.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(NAME).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==NAME).map(k=>caches.delete(k))))
  );
});
self.addEventListener('fetch', e=>{
  const {request} = e;
  if(request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(resp=>{
      const copy = resp.clone();
      caches.open(NAME).then(c=>c.put(request, copy)).catch(()=>{});
      return resp;
    }).catch(()=> cached))
  );
});