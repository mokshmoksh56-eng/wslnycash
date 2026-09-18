/* ==========================================================
   PWA + Firebase Messaging Service Worker — v9
   ========================================================== */
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyDmPciW_QPM4vwcMLX2M44_C0a8jqHdPjU",
    projectId: "azemaa-proo",
    messagingSenderId: "787350492977",
    appId: "1:787350492977:web:84061dcf31622fcb07c210"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || '💰 وصلني كاش';
    const body  = payload.notification?.body  || payload.data?.body  || 'لديك إشعار جديد';

    return self.registration.showNotification(title, {
        body,
        icon: '/icon.png',
        badge: '/icon.png',
        dir: 'rtl',
        lang: 'ar',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        tag: payload.data?.tag || 'wslny-cash',
        data: {
            url: payload.data?.url || '/wslnycash.html',
            ...payload.data
        }
    });
});

// ✅ فتح التطبيق عند الضغط على الإشعار
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/wslnycash.html';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
            for (const c of list) {
                if (c.url.includes('wslnycash.html') && 'focus' in c) return c.focus();
            }
            return clients.openWindow(targetUrl);
        })
    );
});

/* ===== الكاش ===== */
const CACHE_NAME = 'wslny-cash-v9';
const urlsToCache = ['/wslnycash-manifest.json', '/icon.png'];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((c) =>
            c.addAll(urlsToCache).catch((err) => console.warn('cache warn:', err))
        )
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names.map((n) => n !== CACHE_NAME ? caches.delete(n) : null)
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = e.request.url;

    if (/(firebase|googleapis|mapbox|gstatic|onesignal|googleusercontent|workers\.dev)/.test(url)) return;

    // HTML → Network First
    if (e.request.destination === 'document' || url.endsWith('.html') || url.endsWith('/')) {
        e.respondWith(
            fetch(e.request)
                .then((res) => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(e.request, clone).catch(() => {}));
                    return res;
                })
                .catch(() => caches.match(e.request))
        );
        return;
    }

    // Static → Cache First
    e.respondWith(
        caches.match(e.request).then((cached) => {
            const net = fetch(e.request)
                .then((res) => {
                    if (res && res.status === 200) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone).catch(() => {}));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || net;
        })
    );
});

self.addEventListener('message', (e) => {
    if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
