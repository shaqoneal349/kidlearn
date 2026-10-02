// 離線快取。更新任何檔案後，CACHE 版號要 +1，使用者才會拿到新版。
const CACHE = 'kidlearn-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/core.js', 'js/content-en.js', 'js/content-ma.js', 'js/content-zh.js',
  'js/games-en.js', 'js/games-ma.js', 'js/games-zh.js', 'js/shell.js',
  'vendor/hanzi-writer.min.js', 'vendor/hanzi-data.js',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
