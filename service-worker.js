// service-worker.js - VERSÃO CORRIGIDA
const CACHE_NAME = 'supervisao-v3.0';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './firebase-config.js',
  './firebase-auth.js',
  './firebase-documents.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  console.log('✅ Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('✅ Todos os recursos em cache');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('🔄 Service Worker ativando...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('✅ Service Worker ativado');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // 🎯 IGNORAR REQUISIÇÕES PARA O APPS SCRIPT
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 🎯 RETORNAR DO CACHE OU FAZER REQUISIÇÃO
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

console.log('⚙️ Service Worker carregado!');
