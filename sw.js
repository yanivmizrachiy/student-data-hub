self.addEventListener('install', e => {
  e.waitUntil(caches.open('student-cache-v1').then(c => c.addAll([
    './', './index.html', './script.js', './manifest.webmanifest'
  ])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
