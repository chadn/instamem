'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface NetworkContextType {
  isOnline: boolean
  isOffline: boolean
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Initialize with current status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <NetworkContext.Provider value={{ 
      isOnline, 
      isOffline: !isOnline 
    }}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}