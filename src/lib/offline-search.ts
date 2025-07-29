// Dedicated offline search module with warm chunk loading
import { Memory, transformRawMemoryData } from '@/types/memory'
import { offlineStorage } from '@/lib/offline-storage'

// Global promise for warmed Fuse.js chunk
declare global {
  var __fusePromise: Promise<typeof import('fuse.js').default> | undefined
}

async function getFuse() {
  // Reuse warmed promise if available, otherwise import on demand
  if (!globalThis.__fusePromise) {
    console.log('🔥 Loading Fuse.js chunk on demand...')
    globalThis.__fusePromise = import('fuse.js').then(mod => mod.default)
  }
  return globalThis.__fusePromise
}

/**
 * Simple offline search function that avoids class instantiation
 * and uses only pre-loaded dependencies
 */
export async function searchOfflineMemories(searchQuery: string): Promise<Memory[]> {
  if (!searchQuery.trim()) {
    return []
  }

  try {
    console.log('🔍 Starting offline search for:', searchQuery)
    
    // Get cached memories
    const cachedMemories = await offlineStorage.getCachedMemories()
    
    if (cachedMemories.length === 0) {
      console.log('⚠️ No cached memories available for offline search')
      return []
    }

    // Transform to searchable format
    const transformedMemories = transformRawMemoryData(cachedMemories)
    console.log('📝 Searching through', transformedMemories.length, 'cached memories')

    // Try Fuse.js fuzzy search first
    try {
      const Fuse = await getFuse()
      const fuse = new Fuse(transformedMemories, {
        keys: [
          { name: 'content', weight: 0.7 },
          { name: 'tags.value', weight: 0.2 },
          { name: 'tags.key', weight: 0.1 }
        ],
        threshold: 0.4,
        distance: 100,
        minMatchCharLength: 2,
        includeScore: true,
        findAllMatches: true
      })

      const results = fuse.search(searchQuery)
      const memories = results.slice(0, 20).map(result => result.item)
      
      console.log(`✅ Offline fuzzy search found ${memories.length} results`)
      return memories

    } catch (fuseError) {
      console.warn('⚠️ Fuse.js failed, using simple search:', fuseError)
      
      // Fallback to simple text search
      const searchLower = searchQuery.toLowerCase()
      const filteredMemories = transformedMemories.filter(memory => {
        if (memory.content.toLowerCase().includes(searchLower)) {
          return true
        }
        
        return memory.tags.some(tag => 
          tag.key.toLowerCase().includes(searchLower) ||
          tag.value.toLowerCase().includes(searchLower)
        )
      }).slice(0, 20)

      console.log(`✅ Offline simple search found ${filteredMemories.length} results`)
      return filteredMemories
    }

  } catch (error) {
    console.error('❌ Offline search completely failed:', error)
    throw new Error('Offline search unavailable')
  }
}