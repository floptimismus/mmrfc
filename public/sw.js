// Service Worker: App offline verfügbar machen. Immer zuerst Netz, bei Offline der zuletzt gespeicherte Stand.
const CACHE = "monks-v2";
const SHELL = ["/", "/extra.css", "/konto.js", "/ergebnisse.js", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/favicon.png"];
// Nur diese API-Antworten dürfen offline aus dem Speicher kommen (keine Konto-Daten!)
const CACHEABLE_API = ["/api/ics", "/api/results"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Google Fonts etc. normal laden
  if (url.pathname.startsWith("/api/") && !CACHEABLE_API.includes(url.pathname)) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === "navigate" ? caches.match("/") : Response.error())))
  );
});
