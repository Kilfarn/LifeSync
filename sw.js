const CACHE_NAME = 'lifesync-20260629-120000';
const ASSETS = [
  '/LifeSync/',
  '/LifeSync/index.html',
  '/LifeSync/icon-192.png',
  '/LifeSync/icon-512.png',
  '/LifeSync/manifest.json',
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '🏠 LifeSync', {
      body: data.body || 'You have a new notification',
      icon: '/LifeSync/icon-192.png',
      badge: '/LifeSync/icon-192.png',
      tag: data.tag || 'lifesync',
      requireInteraction: data.requireInteraction || false,
      data: data,
    })
  );
});

// Notification click — open the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/LifeSync/');
    })
  );
});
