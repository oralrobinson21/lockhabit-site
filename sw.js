// Minimal offline cache for LockHabit
const CACHE = "lh-v1";
const ASSETS = [
  "/", "/index.html", "/demo.html",
  "/assets/og-image.svg",
  "/manifest.webmanifest"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const { request } = e;
  // network-first for pages, cache-first for assets
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
  } else {
    e.respondWith(
      caches.match(request).then(res => res || fetch(request))
    );
  }
});