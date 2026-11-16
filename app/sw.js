/* Shell-only install support. No authenticated data is cached. */
const CACHE="swaymark-private-app-shell-v1";
const SHELL=["/app/","/app/index.html","/app/secure.js","/app/secure.css","/app/config.js","/app/icon.svg","/hub/app.css","/assets/logo-mark.webp","/assets/favicon.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.filter(path=>path!=="/app/config.js"))).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x.startsWith("swaymark-private-app-shell-")&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
 const req=event.request, url=new URL(req.url);
 if(req.method!=="GET"||url.origin!==self.location.origin)return;
 if(url.pathname.startsWith("/api/")||url.pathname.endsWith("/app/config.js"))return;
 event.respondWith(fetch(req).catch(()=>caches.match(req)));
});
