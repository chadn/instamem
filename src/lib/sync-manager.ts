import { createClient } from '@/lib/supabase-browser'
import { buildAllMemoriesQuery } from '@/lib/queries'
import { offlineStorage } from '@/lib/offline-storage'
import { RawMemoryData } from '@/types/memory'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export interface SyncState {
  status: SyncStatus
  lastSync: Date | null
  error: string | null
  progress: number // 0-100 percentage
}

export class SyncManager {
  private supabase = createClient()
  private listeners: Array<(state: SyncState) => void> = []

  /**
   * Add listener for sync state changes
   */
  onSyncStateChange(callback: (state: SyncState) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(state: SyncState) {
    this.listeners.forEach(callback => callback(state))
  }

  /**
   * Download all memories from Supabase and cache them locally
   */
  async syncMemories(userId: string): Promise<void> {
    this.notifyListeners({ 
      status: 'syncing', 
      lastSync: null, 
      error: null, 
      progress: 0 
    })

    try {
      console.log('🔄 Starting memory sync for user:', userId)
      
      // Step 1: Fetch all memories from Supabase (10%)
      this.notifyListeners({ 
        status: 'syncing', 
        lastSync: null, 
        error: null, 
        progress: 10 
      })
      
      const query = buildAllMemoriesQuery(this.supabase)
      const { data: memories, error } = await query

      if (error) {
        console.error('❌ Sync error from Supabase:', error)
        throw new Error(`Failed to fetch memories: ${error.message}`)
      }

      if (!memories) {
        throw new Error('No data returned from Supabase')
      }

      // Step 2: Cache memories locally (50%)
      this.notifyListeners({ 
        status: 'syncing', 
        lastSync: null, 
        error: null, 
        progress: 50 
      })

      await offlineStorage.cacheMemories(
        memories as unknown as RawMemoryData[], 
        userId
      )

      // Step 3: Sync complete (100%)
      const lastSync = new Date()
      this.notifyListeners({ 
        status: 'success', 
        lastSync, 
        error: null, 
        progress: 100 
      })

      console.log(`✅ Sync completed: ${memories.length} memories cached`)

    } catch (error) {
      console.error('💥 Sync failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error'
      
      this.notifyListeners({ 
        status: 'error', 
        lastSync: await offlineStorage.getLastSyncTime(), 
        error: errorMessage, 
        progress: 0 
      })
      
      throw error
    }
  }

  /**
   * Check if user has cached data and sync if needed
   */
  async ensureDataCached(userId: string): Promise<boolean> {
    try {
      const hasCache = await offlineStorage.hasCachedData(userId)
      
      if (!hasCache) {
        console.log('📥 No cached data found, initiating sync...')
        await this.syncMemories(userId)
        return true
      }

      console.log('✅ Cached data exists for user')
      return true
    } catch (error) {
      console.error('❌ Failed to ensure data cached:', error)
      return false
    }
  }

  /**
   * Force a refresh of cached data
   */
  async forceSync(userId: string): Promise<void> {
    console.log('🔄 Force sync requested')
    await this.syncMemories(userId)
  }

  /**
   * Get current sync status
   */
  async getCurrentSyncState(): Promise<SyncState> {
    try {
      const lastSync = await offlineStorage.getLastSyncTime()
      return {
        status: 'idle',
        lastSync,
        error: null,
        progress: 0
      }
    } catch (error) {
      return {
        status: 'error',
        lastSync: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        progress: 0
      }
    }
  }
}

// Singleton instance
export const syncManager = new SyncManager()