const OFFLINE_CACHE = 'lugari-offline-v1';
const OFFLINE = '/offline/';
const SHELL = [OFFLINE, '/offline.html', '/mark.svg', '/icon-192.png', '/manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then(cache => cache.addAll(SHELL)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('lugari-offline-') && key !== OFFLINE_CACHE).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode !== 'navigate') {
    if (SHELL.includes(url.pathname)) {
      event.respondWith(caches.open(OFFLINE_CACHE).then(async cache => (await cache.match(url.pathname)) || fetch(event.request)));
    }
    return;
  }
  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(OFFLINE_CACHE);
    return (await cache.match('/offline.html')) || Response.error();
  }));
});
