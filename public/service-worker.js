/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'mdrrmo-v1';
const RUNTIME_CACHE = 'mdrrmo-runtime-v1';
const API_CACHE = 'mdrrmo-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logome.webp',
  '/p1.jpeg',
  '/p2.jpeg',
  '/p3.jpeg',
  '/p4.jpeg',
  '/p5.jpeg',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/hotlines',
  '/api/resources',
  '/api/checklist',
  '/api/map/locations',
  '/api/disaster-guidelines',
  '/api/typhoon-data',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {cache: 'reload'})));
    }).catch(err => {
      console.error('[SW] Failed to cache static assets:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle incident submission with network-first strategy and offline queuing
  if (request.method === 'POST' && url.pathname === '/api/incidents') {
    event.respondWith(
      fetch(request).catch(() => {
        // If fetch fails, queue the request for later sync and return success response
        return queueIncidentRequest(request).then(() => {
          return new Response(JSON.stringify({ queued: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }).catch(error => {
          console.error('[SW] Failed to queue incident:', error);
          return new Response('Failed to queue incident', { status: 500 });
        });
      })
    );
    return;
  }

  // Skip other non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      handleAPIRequest(request)
    );
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update cache in background
        event.waitUntil(
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              return caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, response.clone());
                return response;
              });
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Cache the new response
        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Network failed, handle different types of requests
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        
        // For API requests, return appropriate fallback
        if (url.pathname.startsWith('/api/')) {
          const isCriticalEndpoint = API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint));
          if (isCriticalEndpoint) {
            return new Response(
              JSON.stringify({ 
                offline: true, 
                message: 'This data is not available offline. Please check your connection.',
                data: [] // Provide empty data array for list endpoints
              }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
        }
        
        // For images and other assets, return a placeholder or error
        if (request.destination === 'image') {
          return new Response(
            JSON.stringify({ error: 'Image not available offline' }),
            { status: 503 }
          );
        }
        
        // Default fallback response
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});

// Handle API requests with cache-first strategy for critical endpoints
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const isCriticalEndpoint = API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint));

  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Clone and cache the response
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] Network failed, trying cache for:', url.pathname);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', url.pathname);
      return cachedResponse;
    }
    
    // No cache available
    if (isCriticalEndpoint) {
      // Return a detailed offline response for critical endpoints
      return new Response(
        JSON.stringify({ 
          offline: true, 
          message: 'This data is not available offline. Please check your connection.',
          data: [], // Provide empty data array for consistency
          timestamp: Date.now(),
          endpoint: url.pathname
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Background sync for queued incidents
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-incidents') {
    event.waitUntil(syncQueuedIncidents());
  }
});

// Queue an incident for later synchronization
async function queueIncidentRequest(request) {
  try {
    const body = await request.clone().json();
    const db = await openDB();
    const tx = db.transaction('incidents', 'readwrite');
    const store = tx.objectStore('incidents');
    
    const incidentToQueue = {
      data: body,
      timestamp: Date.now(),
      synced: false,
      type: 'incident-report'
    };
    
    await store.add(incidentToQueue);
    await tx.complete;
    
    console.log('[SW] Incident queued for sync:', incidentToQueue.id);
    
    // Register background sync if available
    if ('sync' in self.registration) {
      await self.registration.sync.register('sync-incidents');
    }
    
    return incidentToQueue;
  } catch (error) {
    console.error('[SW] Failed to queue incident request:', error);
    throw error;
  }
}

// Sync queued incidents when back online
async function syncQueuedIncidents() {
  try {
    // Open IndexedDB and get queued incidents
    const db = await openDB();
    const tx = db.transaction('incidents', 'readonly');
    const store = tx.objectStore('incidents');
    const incidents = await getAll(store);
    
    console.log('[SW] Found', incidents.length, 'queued incidents to sync');
    
    // Send each incident to the server
    const results = await Promise.allSettled(
      incidents.map(incident => syncIncident(incident))
    );
    
    // Remove successfully synced incidents
    const successfulSyncs = results.filter(r => r.status === 'fulfilled');
    console.log('[SW] Successfully synced', successfulSyncs.length, 'incidents');
    
    // Notify all clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        synced: successfulSyncs.length,
        failed: results.length - successfulSyncs.length
      });
    });
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Helper function to sync a single incident
async function syncIncident(incident) {
  const response = await fetch('/api/incidents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(incident.data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to sync incident');
  }
  
  // Remove from IndexedDB after successful sync
  const db = await openDB();
  const tx = db.transaction('incidents', 'readwrite');
  const store = tx.objectStore('incidents');
  await store.delete(incident.id);
  await tx.complete;
  
  return response.json();
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MDRRMOOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('incidents')) {
        const store = db.createObjectStore('incidents', { keyPath: 'id', autoIncrement: true });
        // Add indexes for better query performance
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
