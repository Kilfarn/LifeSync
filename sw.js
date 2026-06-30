const CACHE_NAME = 'lifesync-20260630-004500';
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

// Activate — clean up old caches, then claim all clients so they reload fresh
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
});

// Fetch — network-first for HTML navigation (always get fresh app shell),
//         cache-first for everything else (icons, manifest, etc.)
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
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
