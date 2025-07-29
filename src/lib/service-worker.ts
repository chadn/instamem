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
      scope: '/'
    })

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        console.log('🔄 New Service Worker available')
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✅ New Service Worker installed, ready to activate')
            
            // Optionally notify user about update
            // For now, just activate immediately
            newWorker.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      }
    })

    // Handle service worker controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed, reloading page')
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
  return typeof window !== 'undefined' && 
         (window.matchMedia('(display-mode: standalone)').matches ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window.navigator as any).standalone === true)
}

/**
 * Get service worker version
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
    
    controller.postMessage(
      { type: 'GET_VERSION' }, 
      [messageChannel.port2]
    )
    
    // Timeout after 1 second
    setTimeout(() => resolve(null), 1000)
  })
}