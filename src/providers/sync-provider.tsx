'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useNetwork } from '@/providers/network-provider'
import { syncManager, SyncState } from '@/lib/sync-manager'

interface SyncContextType extends SyncState {
  forceSync: () => Promise<void>
  clearCache: () => Promise<void>
}

const SyncContext = createContext<SyncContextType | undefined>(undefined)

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { isOnline } = useNetwork()
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSync: null,
    error: null,
    progress: 0
  })

  // Initialize sync state on mount
  useEffect(() => {
    const initSyncState = async () => {
      const initialState = await syncManager.getCurrentSyncState()
      setSyncState(initialState)
    }
    
    initSyncState()
  }, [])

  // Set up sync state listener
  useEffect(() => {
    const unsubscribe = syncManager.onSyncStateChange(setSyncState)
    return unsubscribe
  }, [])

  // Auto-sync when user comes online or changes
  useEffect(() => {
    if (user && isOnline) {
      // Ensure data is cached when user is online
      syncManager.ensureDataCached(user.id).catch(error => {
        console.error('Auto-sync failed:', error)
      })
    }
  }, [user, isOnline])

  const forceSync = async () => {
    if (!user) {
      throw new Error('No user authenticated')
    }
    
    if (!isOnline) {
      throw new Error('Cannot sync while offline')
    }

    await syncManager.forceSync(user.id)
  }

  const clearCache = async () => {
    const { offlineStorage } = await import('@/lib/offline-storage')
    await offlineStorage.clearCache()
    
    // Reset sync state
    setSyncState({
      status: 'idle',
      lastSync: null,
      error: null,
      progress: 0
    })
  }

  return (
    <SyncContext.Provider value={{
      ...syncState,
      forceSync,
      clearCache
    }}>
      {children}
    </SyncContext.Provider>
  )
}

export const useSync = () => {
  const context = useContext(SyncContext)
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider')
  }
  return context
}