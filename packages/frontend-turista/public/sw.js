const CACHE_NAME = 'concepcion-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('⚠️ PWA: Algunos recursos no se pudieron cachear durante la instalación:', err);
        // No bloqueamos la instalación si falla un recurso estático (como el manifest en entornos protegidos)
        return Promise.resolve();
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna el recurso del caché o hace la petición a la red
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Cachear recursos estáticos del propio dominio automáticamente
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Nueva notificación', body: 'Tienes una actualización en ConceMap' };
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/favicon.ico',
    data: data.url || '/',
    vibrate: [100, 50, 100]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});