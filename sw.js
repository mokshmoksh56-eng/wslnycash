const CACHE_NAME = 'azemaa-cache-v2'; // رفعنا رقم الإصدار لكسر الكاش القديم
const assets = [
  './',
  'index.html',
  'manifest.json',
  'windows.html' // إضافة ملف الشبابيك
];

// تثبيت السيرفس وركر وإجبار المتصفح على استخدامه فوراً
self.addEventListener('install', e => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// تفعيل السيرفس وركر وحذف أي كاش قديم (مثل v1)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// استراتيجية (الشبكة أولاً، ثم الكاش)
// هذا يضمن أنك ترى أي تعديل ترفعه على جيت هاب فوراً
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // إذا نجح الاتصال بالإنترنت، نقوم بحفظ نسخة جديدة في الكاش
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // إذا انقطع الإنترنت، نستخدم النسخة المحفوظة في الكاش
        return caches.match(e.request);
      })
  );
});
