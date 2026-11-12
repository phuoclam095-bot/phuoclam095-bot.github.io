// Service Worker cơ bản cho ChonAnhNhanh.vn
self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  return self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  // Cho phép fetch bình thường qua mạng
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
