/* ── Basha.app Service Worker ─────────────────── */
const CACHE_NAME = "basha-app-v2";
const STATIC_CACHE = "basha-static-v2";
const API_CACHE = "basha-api-v2";

// Files to cache immediately on install
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// ── INSTALL ─────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Basha.app service worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// ── ACTIVATE ────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Basha.app service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// ── FETCH ────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip the blog entirely — always load these static pages from the network,
  // never from cache or the offline fallback.
  if (url.pathname === "/blog" || url.pathname.startsWith("/blog/")) return;

  // Skip cross-origin requests (Leaflet tiles, Unsplash images, etc.)
  // But serve them with network-first for map tiles
  if (url.hostname === "tile.openstreetmap.org") {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // API calls — network first, fall back to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static assets — cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages — network first with offline fallback
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

// ── STRATEGIES ──────────────────────────────────

// Cache First: good for static assets
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return offlineFallback();
  }
}

// Network First: good for dynamic content
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlineFallback();
  }
}

// Offline fallback page
function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>Basha.app — Offline</title>
      <style>
        body { font-family: 'DM Sans', sans-serif; display: flex; align-items: center;
               justify-content: center; min-height: 100vh; margin: 0; background: #f5f6f8; }
        .box { text-align: center; padding: 40px 24px; }
        .logo { font-size: 48px; margin-bottom: 16px; }
        h1 { color: #C8102E; font-size: 24px; margin-bottom: 8px; }
        p { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
        button { background: #C8102E; color: #fff; border: none; padding: 12px 28px;
                 border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="logo">🏠</div>
        <h1>You're offline</h1>
        <p>Basha.app needs a connection to show properties.<br/>Please check your internet and try again.</p>
        <button onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

// ── PUSH NOTIFICATIONS ───────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || "New property matches your search!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
    actions: [
      { action: "view", title: "View Property" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || "Basha.app", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
