// Shared memory types for InstaMem application

export interface MemoryTag {
    key: string
    value: string
}

export interface Memory {
    id: string
    content: string
    memory_date: string
    url?: string
    created_at: string
    tags: MemoryTag[]
    tagCombinations?: string[]  // Combined "key:value" strings for search
}

export interface SearchResult {
    memories: Memory[]
    loading: boolean
    error: string | null
}

// Raw data structure from Supabase query with nested relationships
export interface RawMemoryData {
    id: string
    content: string
    memory_date: string
    url?: string
    created_at: string
    memory_tag: {
        tag_values: {
            text: string
            tag_keys: {
                name: string
            }
        }
    }[] | null
}

/**
 * Transforms raw Supabase memory data with nested relationships 
 * into flattened Memory objects suitable for UI consumption
 */
export function transformRawMemoryData(rawMemories: RawMemoryData[]): Memory[] {
    return rawMemories.map((memory) => {
        const tags = (memory.memory_tag || [])
            .filter((mt) => mt.tag_values && mt.tag_values.tag_keys)
            .map((mt) => ({
                key: mt.tag_values.tag_keys.name,
                value: mt.tag_values.text
            }))
        
        return {
            id: memory.id,
            content: memory.content,
            memory_date: memory.memory_date,
            url: memory.url,
            created_at: memory.created_at,
            tags,
            tagCombinations: tags.map(tag => `${tag.key}:${tag.value}`)
        }
    })
}

/**
 * Client-side filtering logic for memory search
 * Searches both content and tags for partial matches
 */
export function filterMemoriesByQuery(memories: RawMemoryData[], searchQuery: string): RawMemoryData[] {
    if (!searchQuery.trim()) {
        return memories
    }

    const searchLower = searchQuery.toLowerCase()
    
    return memories.filter((memory) => {
        // Check content
        if (memory.content.toLowerCase().includes(searchLower)) {
            return true
        }
        
        // Check tags
        if (memory.memory_tag && memory.memory_tag.length > 0) {
            return memory.memory_tag.some((mt) => {
                if (!mt.tag_values) return false
                
                // Check tag value
                if (mt.tag_values.text.toLowerCase().includes(searchLower)) {
                    return true
                }
                
                // Check tag key  
                if (mt.tag_values.tag_keys && 
                    mt.tag_values.tag_keys.name.toLowerCase().includes(searchLower)) {
                    return true
                }
                
                return false
            })
        }
        
        return false
    })
}