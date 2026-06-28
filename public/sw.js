// Service worker mínimo para la PWA.
// Estrategia: red primero con respaldo a caché para el app shell.
// Mantiene la app utilizable con conexión intermitente sin servir datos obsoletos
// (las peticiones a Supabase nunca se cachean).

const CACHE = "manos-ve-v1";
const APP_SHELL = ["/", "/mapa", "/mensajes", "/perfil", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // No interceptar APIs externas (Supabase, tiles del mapa).
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        // Cachea sólo navegaciones y recursos estáticos del propio origen.
        const copia = res.clone();
        if (res.ok && (request.mode === "navigate" || url.pathname.startsWith("/_next/"))) {
          caches.open(CACHE).then((cache) => cache.put(request, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(request).then((c) => c || caches.match("/"))),
  );
});
