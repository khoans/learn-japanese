/* Service worker — network-first (online luôn mới) + cache để chạy offline.
   Chỉ hoạt động trên http/https (GitHub Pages), KHÔNG chạy với file://.
   Khi đổi nội dung/app, bump CACHE để dọn cache cũ. */
const CACHE = 'jp-n5-v1';
const CORE = [
  './',
  './index.html',
  './kana_speed_trainer.html',
  './kana_speed_trainer_v2.html',
  './app.js',
  './manifest.json',
  './icon.svg',
  './data/registry.js',
  './data/core-data.js',
  './data/lessons/lesson-01.js',
  './data/lessons/lesson-02.js',
  './data/lessons/lesson-03.js',
  './data/lessons/lesson-04.js',
  './data/lessons/lesson-05.js',
  './data/lessons/lesson-06.js',
  './data/lessons/lesson-07.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // để font cross-origin đi bình thường
  e.respondWith(
    fetch(e.request).then(function (resp) {
      var copy = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
