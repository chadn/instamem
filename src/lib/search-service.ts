import { createClient } from '@/lib/supabase-browser'
import { Memory, RawMemoryData, transformRawMemoryData, filterMemoriesByQuery } from '@/types/memory'
import { buildMemorySearchQuery } from '@/lib/queries'
import { searchOfflineMemories } from '@/lib/offline-search'

export interface SearchService {
  searchMemories(query: string): Promise<Memory[]>
}

/**
 * Online search service using Supabase
 */
export class OnlineSearchService implements SearchService {
  private supabase = createClient()

  async searchMemories(searchQuery: string): Promise<Memory[]> {
    if (!searchQuery.trim()) {
      return []
    }

    // Get all memories with their tags using extracted query builder
    const query = buildMemorySearchQuery(this.supabase, 50)
    const { data: allMemories, error } = await query

    if (error) {
      console.error('Online search error:', error)
      throw new Error('Failed to search memories')
    }

    // Filter client-side for content and tag matches
    const filteredMemories = filterMemoriesByQuery(
      allMemories as unknown as RawMemoryData[] || [], 
      searchQuery
    ).slice(0, 20) // Limit final results

    // Transform data to flatten tags
    return transformRawMemoryData(filteredMemories)
  }
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
  return isOnline ? new OnlineSearchService() : new OfflineSearchService()
}