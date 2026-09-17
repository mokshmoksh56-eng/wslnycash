/* ==========================================================
   PWA + OneSignal Service Worker (موحّد)
   ⚡ OneSignal يشتغل جوه نفس الـ Service Worker عن طريق importScripts
   ========================================================== */

// ✅ استدعاء مكتبة OneSignal أول سطر
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'wslny-cash-v4';
const urlsToCache = [
    './wslnycash.html',
    './wslnycash-manifest.json',
    './icon.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache).catch(() => {}))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.map((n) => { if (n !== CACHE_NAME) return caches.delete(n); })
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = event.request.url;

    // لا تتدخل في طلبات Firebase / Mapbox / OneSignal / Google APIs
    if (
        url.includes('firebase') ||
        url.includes('googleapis') ||
        url.includes('mapbox') ||
        url.includes('gstatic') ||
        url.includes('onesignal') ||
        url.includes('googleusercontent') ||
        url.includes('workers.dev')
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).catch(() => cached);
        })
    );
});

// ✅ استقبال رسائل من OneSignal
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
