/* SWAYMARK Hub prototype: shell-only offline cache, never cache customer records or API data. */
const CACHE = "swaymark-hub-shell-v1";
const SHELL = ["/hub/","/hub/index.html","/hub/app.css","/hub/app.js","/assets/logo-mark.webp","/assets/favicon.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("swaymark-hub-shell-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});