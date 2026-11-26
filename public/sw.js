// Service worker de San Andrés Explorer.
// - HTML: red primero (para recibir actualizaciones) con respaldo en caché.
// - JS/CSS con hash: caché primero.
// - Fotos y mapa satelital: caché primero (permite usar la app sin conexión).
const VERSION = 'v2.0.0';
const SHELL = `sax-shell-${VERSION}`;
const RUNTIME = 'sax-runtime';
const IMAGES = 'sax-images';
const TILES = 'sax-tiles';
const BASE = new URL('./', self.location).href;
const CORE = ['', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'].map((p) => new URL(p, BASE).href);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('sax-shell-') && k !== SHELL).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i += 1) await cache.delete(keys[i]);
}

async function cacheFirst(request, cacheName, { cors = false, max } = {}) {
  const cached = await caches.match(request.url);
  if (cached) return cached;
  const response = await fetch(cors ? new Request(request.url, { mode: 'cors', credentials: 'omit' }) : request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request.url, response.clone());
    if (max) trim(cacheName, max);
  }
  return response;
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(SHELL)).put(new URL('index.html', BASE).href, response.clone());
    return response;
  } catch {
    return (await caches.match(new URL('index.html', BASE).href)) || (await caches.match(BASE)) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  const network = fetch(request).then((response) => {
    if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (url.origin === self.location.origin) {
    if (url.pathname.includes('/assets/')) event.respondWith(cacheFirst(request, SHELL));
    else event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
    return;
  }
  if (url.hostname === 'server.arcgisonline.com') {
    event.respondWith(cacheFirst(request, TILES, { cors: true, max: 3000 }).catch(() => Response.error()));
    return;
  }
  if (url.hostname === 'images.unsplash.com' || (url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/v1/object/public/'))) {
    event.respondWith(cacheFirst(request, IMAGES, { cors: true, max: 300 }).catch(() => Response.error()));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request));
  }
  // Supabase (datos) y demás peticiones pasan directo a la red.
});
