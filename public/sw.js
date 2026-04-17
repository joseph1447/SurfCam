const CACHE_NAME = 'surf-cam-1770303363419';
const urlsToCache = [
  '/',
  '/contacto',
  '/manifest.json',
  '/wave-16.png',
  '/wave-32.png',
  '/wave-128.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
          // Suppress and log cache errors
          console.error('Service Worker cache addAll failed:', err);
        });
      })
  );
});

// Fetch event - different strategies for different resource types
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension, chrome, and other non-http(s) requests
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip YouTube and external video/streaming services - let browser handle them directly
  if (url.hostname.includes('youtube.com') ||
      url.hostname.includes('youtubei.googleapis.com') ||
      url.hostname.includes('ytimg.com') ||
      url.hostname.includes('googlevideo.com') ||
      url.hostname.includes('twitch.tv') ||
      url.hostname.includes('twitchcdn.net')) {
    return; // Don't intercept - let browser handle directly
  }

  // Determine if this is a request that should use network-first strategy
  const isNavigationRequest = event.request.mode === 'navigate';
  const isApiRequest = url.pathname.startsWith('/api/');
  const isNextData = url.pathname.startsWith('/_next/data/');
  const isHtmlRequest = event.request.headers.get('accept')?.includes('text/html');
  const useNetworkFirst = isNavigationRequest || isApiRequest || isNextData || isHtmlRequest;

  if (useNetworkFirst) {
    // NETWORK-FIRST: Always get fresh HTML, API responses, and Next.js data
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          // Cache the fresh response for offline fallback
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone()).catch(() => {});
          }
          return networkResponse;
        } catch (fetchError) {
          // Network failed - try cache as fallback (offline support)
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          if (isNavigationRequest || isHtmlRequest) {
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          }
          return new Response('Network error', {
            status: 408,
            statusText: 'Request Timeout',
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })()
    );
    return;
  }

  // CACHE-FIRST: For static assets (images, fonts, JS/CSS bundles)
  event.respondWith(
    (async () => {
      try {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        const networkResponse = await fetch(event.request);

        if (networkResponse.ok && networkResponse.status === 200) {
          const contentType = networkResponse.headers.get('content-type');
          if (contentType &&
              !contentType.includes('video') &&
              !contentType.includes('stream') &&
              !contentType.includes('application/octet-stream')) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone()).catch(() => {});
          }
        }

        return networkResponse;
      } catch (error) {
        return new Response('Network error', {
          status: 408,
          statusText: 'Request Timeout',
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Activate event - clean up old caches and notify clients to refresh
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const hasOldCaches = cacheNames.some(name => name !== CACHE_NAME);
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        // If there were old caches, a new version was deployed - notify all clients
        if (hasOldCaches) {
          return self.clients.matchAll({ type: 'window' }).then((clients) => {
            clients.forEach((client) => {
              client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
            });
          });
        }
      });
    }).then(() => self.clients.claim())
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle background sync tasks
  console.log('Background sync triggered');
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '¡Nuevas olas en Santa Teresa!',
    icon: '/wave-128.png',
    badge: '/wave-16.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Surf Cam',
        icon: '/wave-32.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/wave-32.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Santa Teresa Surf Cam', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
