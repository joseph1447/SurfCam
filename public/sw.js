const CACHE_NAME = 'surf-cam-1767129369007';
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

// Fetch event - serve from cache, fallback to network
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

  event.respondWith(
    (async () => {
      try {
        // Try to use preloadResponse if available (for navigation requests)
        const preloadResponse = event.preloadResponse;
        if (preloadResponse) {
          try {
            const response = await preloadResponse;
            if (response) {
              return response;
            }
          } catch (err) {
            console.log('[SW] PreloadResponse failed, falling back to cache/network:', err);
          }
        }

        // Try cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback to network
        try {
          const networkResponse = await fetch(event.request);
          
          // Cache successful responses (but not for streaming or large files)
          if (networkResponse.ok && networkResponse.status === 200) {
            const contentType = networkResponse.headers.get('content-type');
            // Don't cache streaming content, videos, or very large files
            if (contentType && 
                !contentType.includes('video') && 
                !contentType.includes('stream') &&
                !contentType.includes('application/octet-stream')) {
              const cache = await caches.open(CACHE_NAME);
              // Clone the response before caching (responses can only be read once)
              cache.put(event.request, networkResponse.clone()).catch(err => {
                console.log('[SW] Failed to cache response:', err);
              });
            }
          }
          
          return networkResponse;
        } catch (fetchError) {
          console.log('[SW] Network fetch failed:', fetchError);
          // Return a basic offline page or error response
          if (event.request.destination === 'document') {
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          }
          throw fetchError;
        }
      } catch (error) {
        console.error('[SW] Fetch handler error:', error);
        // Return a basic error response instead of failing completely
        return new Response('Network error', {
          status: 408,
          statusText: 'Request Timeout',
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
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
