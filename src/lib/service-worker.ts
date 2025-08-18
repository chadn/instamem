/**
 * Service Worker registration and management for InstaMem
 * Handles PWA offline capabilities
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('⚠️ Service Worker not supported')
        return null
    }

    try {
        console.log('📦 Registering Service Worker...')

        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        })

        // Initialize last update timestamp if not set yet (first run)
        try {
            if (!localStorage.getItem('lastSwUpdateAt')) {
                localStorage.setItem('lastSwUpdateAt', new Date().toISOString())
            }
        } catch {}

        // Actively check for updates immediately after registration
        registration.update().catch(() => {})

        // Periodically check for updates while the app is open (every 30 minutes)
        const THIRTY_MINUTES_MS = 30 * 60 * 1000
        setInterval(() => {
            registration.update().catch(() => {})
        }, THIRTY_MINUTES_MS)

        // Also check for updates when the tab becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                registration.update().catch(() => {})
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
                console.log('🔄 New Service Worker available')

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('✅ New Service Worker installed, ready to activate')

                        // Activate immediately
                        newWorker.postMessage({ type: 'SKIP_WAITING' })
                    }
                })
            }
        })

        // Handle service worker controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker controller changed, reloading page')
            try {
                localStorage.setItem('lastSwUpdateAt', new Date().toISOString())
            } catch {}
            window.location.reload()
        })

        console.log('✅ Service Worker registered successfully')
        return registration
    } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
        return null
    }
}

/**
 * Unregister service worker (useful for development)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return false
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
            const result = await registration.unregister()
            console.log('🗑️ Service Worker unregistered:', result)
            return result
        }
        return false
    } catch (error) {
        console.error('❌ Service Worker unregistration failed:', error)
        return false
    }
}

/**
 * Check if app is running in standalone PWA mode
 */
export function isPWA(): boolean {
    return (
        typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window.navigator as any).standalone === true)
    )
}

/**
 * Get service worker version (APP_VERSION) from the active controller
 */
export async function getServiceWorkerVersion(): Promise<string | null> {
    if (typeof window === 'undefined' || !navigator.serviceWorker.controller) {
        return null
    }

    return new Promise((resolve) => {
        const messageChannel = new MessageChannel()
        const controller = navigator.serviceWorker.controller

        if (!controller) {
            resolve(null)
            return
        }

        messageChannel.port1.onmessage = (event) => {
            resolve(event.data.version || null)
        }

        controller.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2])

        // Timeout after 1 second
        setTimeout(() => resolve(null), 1000)
    })
}

/**
 * Get the last time a new Service Worker took control of the page
 */
export function getLastServiceWorkerUpdateAt(): Date | null {
    if (typeof window === 'undefined') return null
    try {
        const value = localStorage.getItem('lastSwUpdateAt')
        if (!value) return null
        const date = new Date(value)
        return isNaN(date.getTime()) ? null : date
    } catch {
        return null
    }
}
