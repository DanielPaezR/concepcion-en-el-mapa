const CACHE_NAME = 'concepcion-v2';
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
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (
    event.request.mode === 'navigate' ||
    event.request.url.includes('/assets/') ||
    event.request.url.endsWith('.js') ||
    event.request.url.endsWith('.css')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((fetchResponse) => {
          const copy = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return fetchResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

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
    }).catch(() => {
      return caches.match('/index.html');
    })
  );
});

// Manejo mejorado de notificaciones push
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Concepción en el Mapa',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'concepcion-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      data: notificationData.data || {},
      actions: notificationData.actions || [
        { action: 'open', title: 'Ver' },
        { action: 'close', title: 'Cerrar' }
      ]
    })
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Manejo de cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('✓ Notificación cerrada:', event.notification.tag);
});
