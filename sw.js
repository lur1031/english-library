// 오프라인용 캐시 — 파일을 바꾸면 VERSION 숫자만 올리면 됨
const VERSION = 'mlel-v1';
const FILES = [
  './', './index.html', './css/style.css', './js/app.js', './data/library.js',
  './data/stories/daily-lemon-tree.js', './data/stories/romance-notes.js', './data/stories/adventure-lighthouse.js',
  './data/stories/fantasy-clockmaker.js', './data/stories/mystery-umbrella.js', './data/stories/business-coffee-cart.js',
  './data/stories/history-28-letters.js', './data/stories/psychology-envelope.js', './data/stories/science-optimizer.js',
  './data/stories/society-last-speaker.js', './icons/icon-180.png', './icons/icon-192.png', './manifest.webmanifest'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
// 네트워크 우선 → 실패하면 캐시 (새 소설을 올리면 바로 반영되도록)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
