/* Service worker — network-first (online luôn mới) + cache để chạy offline.
   Chỉ hoạt động trên http/https (GitHub Pages), KHÔNG chạy với file://.
   Khi đổi nội dung/app, bump CACHE để dọn cache cũ. */
const CACHE = 'jp-n5-v126';

// Danh sach file bai lay tu manifest (dung chung voi trang) -> them bai/giao trinh KHONG phai sua file nay.
importScripts('./data/lessons/manifest.js'); // dat self.COURSES + self.LESSON_MANIFEST + self.LESSON_FILES
var LESSON_URLS = (self.LESSON_FILES || []).map(function (f) { return './data/lessons/' + f; });

const CORE = [
  './',
  './index.html',
  './report.html',
  './js/kanji-tip.js',
  './js/core.js',
  './js/input-kana.js',
  './js/kanji130.js',
  './js/decks.js',
  './js/drill.js',
  './js/stats.js',
  './js/tools-init.js',
  './manifest.json',
  './assets/icon.svg',
  './data/registry.js',
  './data/core-data.js',
  './data/radicals.js',
  './data/kanji-parts.js',
  './data/themes.js',
  './data/lessons/manifest.js'
].concat(LESSON_URLS);

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
