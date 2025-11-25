// service-worker.js
const CACHE_NAME = 'supervisao-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css', 
  '/script.js',
  '/manifest.json',
  '/firebase-config.js',
  '/firebase-auth.js',
  '/firebase-documents.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  console.log('✅ Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});
