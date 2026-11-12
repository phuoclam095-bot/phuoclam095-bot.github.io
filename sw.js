// Service Worker cho ChonAnhNhanh.vn PWA
self.addEventListener('install', (e) => {
    // Buộc service worker mới thay thế ngay lập tức worker cũ đang chạy ngầm
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    // Nắm quyền điều khiển toàn bộ các client/tab đang mở ngay lập tức
    return e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
