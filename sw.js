/* ==========================================
   BrainStack Service Worker
   Version 1.0.0
========================================== */

const CACHE_NAME = "brainstack-v1";

const STATIC_FILES = [

"/",
"/index.html",
"/offline.html",
"/manifest.json",

"/style.css",
"/script.js",
"/search.js",

"/logo.png",
"/brainstack.png",

"https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"

];

/* ==========================================
   INSTALL
========================================== */

self.addEventListener("install", event => {

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache => cache.addAll(STATIC_FILES))

);

self.skipWaiting();

});

/* ==========================================
   ACTIVATE
========================================== */

self.addEventListener("activate", event => {

event.waitUntil(

caches.keys().then(keys => {

return Promise.all(

keys.map(key => {

if(key !== CACHE_NAME){

return caches.delete(key);

}

})

);

})

);

self.clients.claim();

});

/* ==========================================
   FETCH
========================================== */

self.addEventListener("fetch", event => {

if(event.request.method !== "GET") return;

event.respondWith(

caches.match(event.request)

.then(cached => {

if(cached){

return cached;

}

return fetch(event.request)

.then(networkResponse => {

if(

networkResponse &&
networkResponse.status === 200 &&
event.request.url.startsWith(self.location.origin)

){

const responseClone = networkResponse.clone();

caches.open(CACHE_NAME)

.then(cache => {

cache.put(event.request,responseClone);

});

}

return networkResponse;

})

.catch(() => {

if(event.request.mode === "navigate"){

return caches.match("/offline.html");

}

});

})

);

});