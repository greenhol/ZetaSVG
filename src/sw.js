const CACHE = "app-v1";

self.addEventListener("install", () => {
    // nothing to pre-cache, satisfies PWA requirement
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then(r => r || fetch(event.request))
    );
});
