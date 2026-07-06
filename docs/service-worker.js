const CACHE_NAME = "free-draw-v6";
const APP_SHELL = [
  "./",
  "./index.html",
  "./src/styles.css",
  "./src/main.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/public-domain/baby-octopus.svg",
  "./assets/public-domain/christmas-bear.svg",
  "./assets/public-domain/pumpkin.svg",
  "./assets/public-domain/jingle-bells.svg",
  "./assets/public-domain/coloring-squares.svg",
  "./assets/public-domain/block-head.svg",
  "./assets/public-domain/stick-head.svg",
  "./assets/public-domain/elf-girl-face.svg",
  "./privacy.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
