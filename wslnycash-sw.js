/* ==========================================================
   🔔 Firebase Cloud Messaging (FCM)
   ========================================================== */
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDmPciW_QPM4vwcMLX2M44_C0a8jqHdPjU",
    authDomain: "azemaa-proo.firebaseapp.com",
    databaseURL: "https://azemaa-proo-default-rtdb.firebaseio.com",
    projectId: "azemaa-proo",
    storageBucket: "azemaa-proo.firebasestorage.app",
    messagingSenderId: "787350492977",
    appId: "1:787350492977:web:84061dcf31622fcb07c210"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 🔔 Background:', payload);
    const title = (payload.notification && payload.notification.title) || '💰 وصلني كاش';
    const body  = (payload.notification && payload.notification.body)  || 'وصلك طلب جديد';
    const data = payload.data || {};

    self.registration.showNotification(title, {
        body: body,
        icon: '/wslnycash/icon.png',
        badge: '/wslnycash/icon.png',
        dir: 'rtl',
        lang: 'ar',
        vibrate: [300, 100, 300, 100, 500],
        requireInteraction: true,
        tag: data.order_key || 'wslny_order',
        renotify: true,
        silent: false,
        data: {
            url: data.url || '/wslnycash/wslnycash.html',
            order_key: data.order_key || ''
        }
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = (event.notification.data && event.notification.data.url) || '/wslnycash/wslnycash.html';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes('wslnycash') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

/* ==========================================================
   📦 PWA Cache
   ========================================================== */
const CACHE_NAME = 'wslny-cash-v1';
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
    if (url.includes('firebase') || url.includes('googleapis') ||
        url.includes('mapbox') || url.includes('gstatic') ||
        url.includes('onesignal')) {
        return;
    }
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).catch(() => cached);
        })
    );
});
