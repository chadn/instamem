// InstaMem Service Worker for basic caching
// Version 0.2.0 - Basic offline support

// Note: APP_VERSION is auto-updated to match the version in package.json by scripts/inject-sw-version.js
const APP_VERSION = 'instamem-0.1.14'
const STATIC_CACHE_URLS = [
    '/',
    '/login',
    // Removed /offline since it doesn't exist and causes cache errors
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker installing...')

    event.waitUntil(
        caches
            .open(APP_VERSION)
            .then((cache) => {
                console.log('📦 Caching static assets')
                return cache.addAll(STATIC_CACHE_URLS)
            })
            .catch((error) => {
                console.error('❌ Failed to cache static assets:', error)
            })
    )

    // Activate immediately
    self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated')

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== APP_VERSION) {
                        console.log('🗑️ Deleting old cache:', cacheName)
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )

    // Take control immediately
    self.clients.claim()
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event

    // Only handle GET requests
    if (request.method !== 'GET') {
        return
    }

    // Skip non-HTTP(S) requests
    if (!request.url.startsWith('http')) {
        return
    }

    // Network-first strategy for API calls, cache-first for static assets
    if (request.url.includes('/api/') || request.url.includes('supabase.co')) {
        // Network-first for API calls - let them fail gracefully
        event.respondWith(
            fetch(request).catch(() => {
                // If network fails, return a minimal response for API calls
                return new Response(JSON.stringify({ error: 'Offline - please try again when connected' }), {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'application/json' },
                })
            })
        )
    } else {
        // Cache-first for static assets, especially Next.js chunks
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse
                }

                // If not in cache, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Cache successful responses, especially JS chunks
                        if (networkResponse.status === 200) {
                            const responseClone = networkResponse.clone()
                            caches.open(APP_VERSION).then((cache) => {
                                // Always cache Next.js static assets and chunks
                                if (
                                    request.url.includes('/_next/static/') ||
                                    request.url.includes('.js') ||
                                    request.url.includes('.css')
                                ) {
                                    cache.put(request, responseClone)
                                }
                            })
                        }
                        return networkResponse
                    })
                    .catch(() => {
                        // If network fails and not in cache, return offline page for navigation
                        if (request.mode === 'navigate') {
                            return caches.match('/')
                        }

                        // For JS/CSS files, return a more specific error
                        if (request.url.includes('.js') || request.url.includes('.css')) {
                            console.error('❌ Failed to load asset offline:', request.url)
                            return new Response('// Offline - asset unavailable', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: { 'Content-Type': 'application/javascript' },
                            })
                        }

                        // Return minimal offline response for other resources
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                        })
                    })
            })
        )
    }
})

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: APP_VERSION })
    }
})

console.log(`🔧 InstaMem Service Worker loaded ${APP_VERSION}`)
