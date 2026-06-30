const CACHE_NAME = 'lifesync-20260630-210000';
const ASSETS = [
  '/LifeSync/',
  '/LifeSync/index.html',
  '/LifeSync/icon-192.png',
  '/LifeSync/icon-512.png',
  '/LifeSync/manifest.json',
];

// Install — cache core assets and skip waiting immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches and claim clients
// The page detects controllerchange and reloads itself (see index.html)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch — network-first for HTML (always fresh), cache-first for assets
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).catch(() => caches.match(event.request))
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

// Notification click — handle bin actions or open the app
self.addEventListener('notificationclick', event => {
  event.notification.close();

  // Dismiss action: close only, don't open the app
  if (event.action === 'dismiss') return;

  if (event.action === 'done' && event.notification.tag.startsWith('bin-')) {
    const date = event.notification.tag.replace('bin-', '');
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        if (clientList.length > 0) {
          // App is open — postMessage to mark done, then focus
          clientList.forEach(c => c.postMessage({ type: 'bin-done', date }));
          return clientList[0].focus();
        }
        // App is closed — open with URL param so it marks done on load
        return self.clients.openWindow('/LifeSync/?bin-done=' + date);
      })
    );
    return;
  }

  // Tapping the notification body opens the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('/LifeSync/');
    })
  );
});
