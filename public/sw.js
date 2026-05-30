/* Desinflama — service worker (PWA web).
 *
 * Estratégia:
 *  - Navegações/HTML: NETWORK-FIRST (o HTML muda a cada build; servir cache
 *    primeiro mostraria um app desatualizado). Cai pro cache só offline.
 *  - Assets estáticos hasheados (/_next/static, ícones): CACHE-FIRST (imutáveis).
 *  - Demais GET same-origin: stale-while-revalidate.
 *
 * O Capacitor (iOS/Android) ignora este SW — a persistência nativa vem da camada
 * Repository. Bump CACHE a cada mudança de estratégia para invalidar o antigo. */
const CACHE = "desinflama-v2";
const PRECACHE = ["/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function isImmutableAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith("http")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // não cacheia APIs externas

  const isNavigation =
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  // HTML/navegação → network-first (sempre a versão mais nova quando online)
  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match("/")))
    );
    return;
  }

  // Assets imutáveis → cache-first
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            if (response.status === 200)
              caches.open(CACHE).then((c) => c.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // Demais → stale-while-revalidate
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200)
            cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
