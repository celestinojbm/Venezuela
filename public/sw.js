// Service worker de Manos Venezuela — modo offline.
//
// Estrategias por tipo de petición (solo del propio origen):
//  - Estáticos hashizados (/_next/static, /icons, manifest): cache-first (inmutables).
//  - Navegaciones (HTML): network-first -> caché -> /offline.html (con números de emergencia).
//  - API propia (/api/red, /api/sismos): network-first -> última respuesta guardada ("último visto").
//  - Resto del origen: stale-while-revalidate suave.
// Orígenes externos (Supabase, USGS, tiles del mapa) NO se interceptan: siempre van a la red.

const VERSION = "v2";
const SHELL = `manos-ve-shell-${VERSION}`;
const RUNTIME = `manos-ve-runtime-${VERSION}`;
const DATA = `manos-ve-data-${VERSION}`;
const VIGENTES = [SHELL, RUNTIME, DATA];

// Rutas/recursos críticos que deben existir sin conexión desde la instalación.
const PRECACHE = [
  "/",
  "/guia",
  "/recursos",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) =>
      // add() individual: si un recurso falla, no tumba a los demás (a diferencia de addAll).
      Promise.all(PRECACHE.map((u) => cache.add(u).catch(() => {}))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !VIGENTES.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function esEstatico(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  );
}

function guardar(cacheName, request, response) {
  if (response && response.ok) {
    const copia = response.clone();
    caches.open(cacheName).then((c) => c.put(request, copia)).catch(() => {});
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // no tocar Supabase / USGS / tiles

  // 1) API propia: red primero; si falla, la última respuesta guardada.
  if (url.pathname === "/api/red" || url.pathname === "/api/sismos") {
    event.respondWith(
      fetch(request)
        .then((res) => guardar(DATA, request, res))
        .catch(() =>
          caches
            .open(DATA)
            .then((c) => c.match(request))
            .then(
              (r) =>
                r ||
                new Response(JSON.stringify({ error: "offline", items: [], ultimo: null, count: 0 }), {
                  headers: { "Content-Type": "application/json" },
                }),
            ),
        ),
    );
    return;
  }

  // 2) Estáticos inmutables: caché primero.
  if (esEstatico(url)) {
    event.respondWith(
      caches.match(request).then(
        (c) => c || fetch(request).then((res) => guardar(RUNTIME, request, res)).catch(() => c),
      ),
    );
    return;
  }

  // 3) Navegaciones (cargas de página): red primero; si falla, caché o página offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => guardar(RUNTIME, request, res))
        .catch(() => caches.match(request).then((c) => c || caches.match("/offline.html"))),
    );
    return;
  }

  // 4) Resto del mismo origen: usa caché y revalida en segundo plano.
  event.respondWith(
    caches.match(request).then((c) => {
      const red = fetch(request)
        .then((res) => guardar(RUNTIME, request, res))
        .catch(() => c);
      return c || red;
    }),
  );
});
