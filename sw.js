// Tăng số phiên bản (v1 -> v2, v3...) mỗi khi sếp cập nhật code mới lên GitHub
const CACHE_NAME = 'chonanhnhanh-v2';

self.addEventListener('install', (e) => {
    // Buộc service worker mới thay thế ngay lập tức worker cũ đang chạy ngầm
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    // Xóa bỏ toàn bộ các kho cache phiên bản cũ khác tên
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => clients.claim()) // Nắm quyền điều khiển toàn bộ tab ngay lập tức
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
