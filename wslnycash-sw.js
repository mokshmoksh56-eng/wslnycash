/* ==========================================================
   PWA + OneSignal + Firebase Service Worker (موحّد)
   الإصدار: v8
   ========================================================== */

// 1. استدعاء OneSignal
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// 2. استدعاء مكتبات Firebase للعمل في الخلفية
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// 3. تهيئة Firebase بنفس إعداداتك
firebase.initializeApp({
    apiKey: "AIzaSyDmPciW_QPM4vwcMLX2M44_C0a8jqHdPjU",
    projectId: "azemaa-proo",
    messagingSenderId: "787350492977",
    appId: "1:787350492977:web:84061dcf31622fcb07c210"
});

const messaging = firebase.messaging();

// 4. معالج الإشعارات والتطبيق مغلق
messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || '💰 وصلني كاش';
    const options = {
        body: payload.notification?.body || payload.data?.body || 'لديك إشعار جديد',
        icon: './icon.png',
        dir: 'rtl',
        requireInteraction: true
    };
    return self.registration.showNotification(title, options);
});

// ==========================================================
// إعدادات الكاش - ⚠️ غيّر الرقم v8 لأي رقم أحدث مع كل تحديث جديد
// ==========================================================
const CACHE_NAME = 'wslny-cash-v8';
const urlsToCache = [
    './wslnycash-manifest.json',
    './icon.png'
];

// ==========================================================
// ✅ INSTALL: تثبيت الـ SW الجديد فورًا + تحديث الكاش
// ==========================================================
self.addEventListener('install', (event) => {
    // ✅ يفعّل الـ SW الجديد فورًا بدون انتظار إغلاق كل التبويبات
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache).catch((err) => {
                console.warn('⚠️ فشل بعض ملفات الكاش:', err);
            });
        })
    );
});

// ==========================================================
// ✅ ACTIVATE: حذف الكاشات القديمة + السيطرة الفورية على التبويبات
// ==========================================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names.map((n) => {
                    if (n !== CACHE_NAME) {
                        console.log('🗑️ حذف الكاش القديم:', n);
                        return caches.delete(n);
                    }
                })
            ))
            .then(() => self.clients.claim())
    );
});

// ==========================================================
// ✅ FETCH: استراتيجية ذكية (Network First للـ HTML، Cache First للـ Static)
// ==========================================================
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = event.request.url;

    // ⛔ استثناءات: Firebase, OneSignal, Mapbox, Google APIs
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

    // ✅ للـ HTML: Network First (دايمًا يجيب أحدث نسخة، لو فشل يرجع للكاش)
    if (
        event.request.destination === 'document' ||
        url.endsWith('.html') ||
        url.endsWith('/')
    ) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // خزّن النسخة الجديدة في الكاش
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone).catch(() => {});
                    });
                    return response;
                })
                .catch(() => {
                    // لو الشبكة فشلت، ارجع للكاش
                    return caches.match(event.request);
                })
        );
        return;
    }

    // ✅ لبقية الملفات (صور، CSS، JS): Cache First مع تحديث في الخلفية
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clone).catch(() => {});
                        });
                    }
                    return response;
                })
                .catch(() => cached);

            return cached || fetchPromise;
        })
    );
});

// ==========================================================
// ✅ MESSAGE: استقبال أمر SKIP_WAITING من الصفحة
// ==========================================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
