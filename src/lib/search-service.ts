import { createClient } from '@/lib/supabase-browser'
import { Memory, RawMemoryData, transformRawMemoryData, filterMemoriesByQuery } from '@/types/memory'
import { buildMemorySearchQuery } from '@/lib/queries'
import { searchOfflineMemories } from '@/lib/offline-search'

export interface SearchService {
  searchMemories(query: string): Promise<Memory[]>
}


/**
 * Offline search service using cached data and Fuse.js
 */
export class OfflineSearchService implements SearchService {
  async searchMemories(searchQuery: string): Promise<Memory[]> {
    return searchOfflineMemories(searchQuery)
  }
}

/**
 * Factory function to create appropriate search service based on network status
 */
export function createSearchService(isOnline: boolean): SearchService {
  return new OfflineSearchService()
}