/**
 * Service Worker for Offline Support
 * ===========================
 * Cache-First for static assets, Network-First with IndexedDB fallback for API
 */

const CACHE_NAME = 'nurisk-v1';
const API_CACHE_NAME = 'nurisk-api-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
];

const API_ROUTES = [
  '/api/incidents',
  '/api/incidents/list',
  '/api/missions',
  '/api/profile',
  '/api/notifications',
];

const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  
  self.clients.claim();
});

/**
 * Fetch event - handle requests
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // API requests - Network-First with IndexedDB fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Static assets - Cache-First
  event.respondWith(handleStaticRequest(event.request));
});

/**
 * Handle API request with Network-First strategy
 */
async function handleApiRequest(request: Request): Promise<Response> {
  const url = request.url;
  const shouldCache = API_ROUTES.some((route) => url.includes(route));

  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && shouldCache) {
      // Clone and cache the response
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(url, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] API request failed, trying cache:', url);
    
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(url);
    
    if (cachedResponse) {
      // Return cached response with warning header
      const response = cachedResponse.clone();
      response.headers.set('X-Source', 'cache');
      return response;
    }
    
    // No cache, return offline error
    return new Response(
      JSON.stringify({ error: 'offline', cached: false }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle static request with Cache-First strategy
 */
async function handleStaticRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, try network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline fallback for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
      const cache = await caches.open(CACHE_NAME);
      const offlinePage = await cache.match('/offline.html');
      
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

/**
 * Background sync for queued actions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueue());
  }
});

/**
 * Process sync queue
 */
async function syncQueue(): Promise<void> {
  // This would communicate with the main thread to process the queue
  // For now, just log
  console.log('[SW] Processing sync queue...');
}

/**
 * Push notification received
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options: NotificationOptions = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag || 'nurisk-notification',
    data: data.data,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nurisk', options)
  );
});

/**
 * Notification click
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(urlToOpen);
    })
  );
});