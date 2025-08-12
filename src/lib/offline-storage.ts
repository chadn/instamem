import localForage from 'localforage'
import { RawMemoryData } from '@/types/memory'

// Configure localForage for better performance and storage
localForage.config({
  name: 'InstaMem',
  version: 1.0,
  storeName: 'memories',
  description: 'Offline storage for InstaMem memories and tags'
})

const CACHE_KEYS = {
  MEMORIES: 'cached_memories',
  SYNC_TIMESTAMP: 'last_sync_timestamp',
  USER_ID: 'cached_user_id'
} as const

export class OfflineStorage {
  /**
   * Store memories in IndexedDB via localForage
   */
  async cacheMemories(memories: RawMemoryData[], userId: string): Promise<void> {
    try {
      await localForage.setItem(CACHE_KEYS.MEMORIES, memories)
      await localForage.setItem(CACHE_KEYS.USER_ID, userId)
      await localForage.setItem(CACHE_KEYS.SYNC_TIMESTAMP, new Date().toISOString())
      console.log(`✅ Cached ${memories.length} memories for user ${userId}`)
    } catch (error) {
      console.error('❌ Failed to cache memories:', error)
      throw new Error('Failed to cache memories for offline use')
    }
  }

  /**
   * Retrieve cached memories from IndexedDB
   */
  async getCachedMemories(): Promise<RawMemoryData[]> {
    try {
      console.log('🗄️ [OfflineStorage] Getting cached memories from localForage...')
      const memories = await localForage.getItem<RawMemoryData[]>(CACHE_KEYS.MEMORIES)
      console.log('📦 [OfflineStorage] Raw localForage result:', memories ? `${memories.length} memories` : 'null/empty')
      
      if (memories && memories.length > 0) {
        console.log('✅ [OfflineStorage] Found cached memories:', memories.length)
        console.log('👀 [OfflineStorage] Sample memory structure:', {
          firstMemory: memories[0],
          keys: Object.keys(memories[0] || {}),
          hasContent: !!memories[0]?.content,
          hasTags: !!memories[0]?.memory_tag
        })
      } else {
        console.log('⚠️ [OfflineStorage] No cached memories found in storage')
      }
      
      return memories || []
    } catch (error) {
      console.error('❌ [OfflineStorage] Failed to retrieve cached memories:', error)
      return []
    }
  }

  /**
   * Check if cache exists and is valid
   */
  async hasCachedData(userId: string): Promise<boolean> {
    try {
      const cachedUserId = await localForage.getItem<string>(CACHE_KEYS.USER_ID)
      const memories = await localForage.getItem<RawMemoryData[]>(CACHE_KEYS.MEMORIES)
      
      return cachedUserId === userId && memories !== null && memories.length > 0
    } catch (error) {
      console.error('❌ Failed to check cached data:', error)
      return false
    }
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const timestamp = await localForage.getItem<string>(CACHE_KEYS.SYNC_TIMESTAMP)
      return timestamp ? new Date(timestamp) : null
    } catch (error) {
      console.error('❌ Failed to get last sync time:', error)
      return null
    }
  }

  /**
   * Clear all cached data (useful for debugging or user logout)
   */
  async clearCache(): Promise<void> {
    try {
      await localForage.clear()
      console.log('✅ Cache cleared successfully')
    } catch (error) {
      console.error('❌ Failed to clear cache:', error)
      throw new Error('Failed to clear offline cache')
    }
  }

  /**
   * Get cache size information for debugging
   */
  async getCacheInfo(): Promise<{ 
    memoryCount: number
    lastSync: Date | null
    userId: string | null 
  }> {
    try {
      const memories = await this.getCachedMemories()
      const lastSync = await this.getLastSyncTime()
      const userId = await localForage.getItem<string>(CACHE_KEYS.USER_ID)
      
      return {
        memoryCount: memories.length,
        lastSync,
        userId
      }
    } catch (error) {
      console.error('❌ Failed to get cache info:', error)
      return { memoryCount: 0, lastSync: null, userId: null }
    }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage()