// Service Worker — Asistencia COED
const CACHE = "coed-v1";
const OFFLINE_URL = "/offline.html";

// Archivos a cachear en instalación
const PRE_CACHE = ["/", "/offline.html", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRE_CACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Solo interceptar GET
  if (e.request.method !== "GET") return;
  // No interceptar Firebase/Firestore
  if (e.request.url.includes("firestore") || e.request.url.includes("firebase")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cachear recursos estáticos
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});
