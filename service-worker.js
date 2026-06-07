const CACHE_VERSION = 'tkd-v3.9-fix-fechas';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache){
      return cache.addAll(ASSETS).catch(function(){return Promise.resolve();});
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE_VERSION) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  var url = event.request.url;
  if(url.indexOf('firestore') !== -1 || url.indexOf('googleapis') !== -1 || url.indexOf('gstatic') !== -1){
    return;
  }
  event.respondWith(
    fetch(event.request).then(function(res){
      if(res && res.status === 200 && event.request.method === 'GET'){
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function(cache){ cache.put(event.request, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
