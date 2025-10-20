const CACHE_NAME = 'grades-app-v1';
const ASSETS = [
  '/index.html','/manifest.webmanifest','/assets/css/theme.css','/assets/js/app.js','/assets/js/db.js','/assets/js/importer.js','/assets/js/exporter.js'
];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  e.respondWith(caches.match(req).then(cached => {
    if(cached) return cached;
    return fetch(req).then(resp => {
      // cache same-origin GET requests
      if(req.method === 'GET' && req.url.startsWith(self.location.origin)){
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return resp;
    }).catch(()=>{
      // fallback: maybe return offline page if existed
      return new Response('אופליין - לא ניתן לטעון', {status:503, statusText:'Offline'});
    });
  }));
});
