import { Memory } from '@/types/memory'
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
 * Factory function to create appropriate search service
 */
export function createSearchService(): SearchService {
  return new OfflineSearchService()
}