/*
 * Nutraatoz service worker.
 *
 * Goals:
 *  - Make the site installable (a SW with a fetch handler is required).
 *  - Stay fully in sync with the live site: navigations are network-first,
 *    so when online the user always sees fresh content; the cache is only a
 *    fallback for when they're offline.
 *  - Never cache auth / API / server-action / account traffic.
 */
const CACHE = "nutraatoz-v1";
const OFFLINE_URL = "/offline";
const PRECACHE = [
  OFFLINE_URL,
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
];

// Paths that must always hit the network (dynamic / authenticated / private).
const NO_CACHE_PREFIXES = ["/api", "/auth", "/admin", "/vendor"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
  );
  self.skipWaiting();
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

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave cross-origin alone
  if (NO_CACHE_PREFIXES.some((p) => url.pathname.startsWith(p))) return;

  // Page navigations: network-first, fall back to cache, then offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => undefined);
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate for speed, refreshed in background.
  if (["style", "script", "image", "font"].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches
              .open(CACHE)
              .then((c) => c.put(req, copy))
              .catch(() => undefined);
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
