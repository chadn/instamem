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
  console.log('🔍 [OfflineSearch] Function called with query:', searchQuery)
  
  if (!searchQuery.trim()) {
    console.log('📝 [OfflineSearch] Empty query - returning empty array')
    return []
  }

  try {
    console.log('🔍 [OfflineSearch] Starting offline search for:', searchQuery)
    
    // Get cached memories
    console.log('🗄️ [OfflineSearch] Fetching cached memories from storage...')
    const cachedMemories = await offlineStorage.getCachedMemories()
    console.log('📦 [OfflineSearch] Retrieved from cache:', cachedMemories.length, 'raw memories')
    
    if (cachedMemories.length === 0) {
      console.log('⚠️ [OfflineSearch] No cached memories available for offline search')
      console.log('💡 [OfflineSearch] Check if sync has run and memories are cached')
      return []
    }

    // Log first few cached memories for debugging
    console.log('👀 [OfflineSearch] Sample cached memories:', cachedMemories.slice(0, 2).map(m => ({ 
      id: m.id, 
      content: m.content?.substring(0, 50),
      tags: m.memory_tag?.length || 0 
    })))

    // Transform to searchable format
    console.log('🔄 [OfflineSearch] Transforming raw memory data...')
    const transformedMemories = transformRawMemoryData(cachedMemories)
    console.log('📝 [OfflineSearch] Searching through', transformedMemories.length, 'transformed memories')
    console.log('👀 [OfflineSearch] Sample transformed memories:', transformedMemories.slice(0, 2).map(m => ({ 
      id: m.id, 
      content: m.content?.substring(0, 50),
      tags: m.tags?.length || 0 
    })))

    // Determine search strategy based on query length
    const queryLength = searchQuery.trim().length
    
    if (queryLength <= 2) {
      // 1-2 characters: exact match only
      console.log('🔍 [OfflineSearch] Using exact match for short query:', searchQuery)
      const searchLower = searchQuery.toLowerCase()
      const filteredMemories = transformedMemories.filter(memory => {
        const contentMatch = memory.content.toLowerCase().includes(searchLower)
        const urlMatch = memory.url && memory.url.toLowerCase().includes(searchLower)
        const tagMatch = memory.tags.some(tag => 
          tag.key.toLowerCase().includes(searchLower) ||
          tag.value.toLowerCase().includes(searchLower)
        )
        
        if (contentMatch || urlMatch || tagMatch) {
          console.log('📝 [OfflineSearch] Exact match found:', {
            contentMatch,
            urlMatch,
            tagMatch,
            content: memory.content.substring(0, 50),
            query: searchQuery
          })
        }
        
        return contentMatch || urlMatch || tagMatch
      }).slice(0, 20)

      console.log(`✅ [OfflineSearch] Exact search found ${filteredMemories.length} results`)
      return filteredMemories
    }
    
    // 3+ characters: use fuzzy search with fallback
    try {
      const Fuse = await getFuse()
      const fuse = new Fuse(transformedMemories, {
        keys: [
          { name: 'content', weight: 0.7 },
          { name: 'url', weight: 0.15 },
          { name: 'tags.value', weight: 0.15 },
          { name: 'tags.key', weight: 0.2 }
        ],
        threshold: 0.4,  // Moderate threshold for fuzzy matching (0.0 = exact, 1.0 = match anything)
        distance: 100,   // Allow longer distance for fuzzy matching
        minMatchCharLength: 2,
        includeScore: true,
        findAllMatches: true,
        ignoreLocation: true,  // Don't care about position in string
        useExtendedSearch: false  // Disable extended search for literal matching
      })

      console.log('🔍 [OfflineSearch] Running fuzzy search with query:', searchQuery)

      const results = fuse.search(searchQuery)

      console.log('📊 [OfflineSearch] Fuse.js raw results:', results.length, 'matches')
      
      if (results.length > 0) {
        console.log('👀 [OfflineSearch] Sample Fuse results:', results.slice(0, 3).map(r => ({
          score: r.score,
          content: r.item.content?.substring(0, 50)
        })))
      }
      
      const memories = results.slice(0, 20).map(result => result.item)
      
      console.log(`✅ [OfflineSearch] Offline fuzzy search found ${memories.length} results`)
      return memories

    } catch (fuseError) {
      console.warn('⚠️ [OfflineSearch] Fuse.js failed, using simple search:', fuseError)
      
      // Fallback to simple literal search
      console.log('🔍 [OfflineSearch] Running fallback literal search')
      const searchLower = searchQuery.toLowerCase()
      const filteredMemories = transformedMemories.filter(memory => {
        const contentMatch = memory.content.toLowerCase().includes(searchLower)
        const urlMatch = memory.url && memory.url.toLowerCase().includes(searchLower)
        const tagMatch = memory.tags.some(tag => 
          tag.key.toLowerCase().includes(searchLower) ||
          tag.value.toLowerCase().includes(searchLower)
        )
        
        if (contentMatch || urlMatch || tagMatch) {
          console.log('📝 [OfflineSearch] Match found:', {
            contentMatch,
            urlMatch,
            tagMatch,
            content: memory.content.substring(0, 50),
            query: searchQuery
          })
        }
        
        return contentMatch || urlMatch || tagMatch
      }).slice(0, 20)

      console.log(`✅ [OfflineSearch] Offline literal search found ${filteredMemories.length} results`)
      return filteredMemories
    }

  } catch (error) {
    console.error('❌ Offline search completely failed:', error)
    throw new Error('Offline search unavailable')
  }
}