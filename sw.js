// 1. Increment this version name every time you push an update (e.g., v1 -> v2 -> v3)
const CACHE_NAME = 'brainstack-cache-v4';

const ASSETS = [
  '/',
  '/index.html',
  '/brainstack-ai/brainstack-ai.html', // Added explicit reference to your subfolder path
  '/style.css',
  '/logo.png',
  '/manifest.json'
];

// Install Service Worker and cache essential assets
self.addEventListener('install', (e) => {
  // Activate immediately without waiting for previous sessions to close
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate and clean up old versions automatically
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      ).then(() => self.clients.claim()); // Take control of open pages immediately
    })
  );
});

// Network-First Strategy: Inspect online server first, fall back to cache if offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // If internet connection works perfectly, update the local copy inside storage cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If user has no internet access, load the locally stored file
        return caches.match(e.request);
      })
  );
});
