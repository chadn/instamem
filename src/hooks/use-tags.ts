'use client'

import { useState, useEffect } from 'react'
import { MemoryTag } from '@/types/memory'
import { createClient } from '@/lib/supabase-browser'

interface TagValueWithKey {
    text: string
    tag_keys: {
        name: string
    } | null
}

interface UseTagsReturn {
    availableTags: MemoryTag[]
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
}

/**
 * Hook to fetch all available tags for autocomplete functionality
 */
export function useTags(): UseTagsReturn {
    const [availableTags, setAvailableTags] = useState<MemoryTag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTags = async () => {
        setLoading(true)
        setError(null)
        
        try {
            const supabase = createClient()
            
            // Fetch all unique tag combinations from the database
            const { data, error: queryError } = await supabase
                .from('tag_values')
                .select(`
                    text,
                    tag_keys (
                        name
                    )
                `)
                .order('text')
            
            if (queryError) {
                throw queryError
            }

            // Transform the data to MemoryTag format  
            const tags: MemoryTag[] = (data as unknown as TagValueWithKey[] || [])
                .filter((item: TagValueWithKey) => item.tag_keys?.name && item.text)
                .map((item: TagValueWithKey) => ({
                    key: item.tag_keys!.name,
                    value: item.text
                }))
                // Remove duplicates (shouldn't happen but just in case)
                .filter((tag, index, arr) => 
                    arr.findIndex(t => t.key === tag.key && t.value === tag.value) === index
                )
                // Sort by key first, then by value
                .sort((a, b) => {
                    if (a.key !== b.key) {
                        return a.key.localeCompare(b.key)
                    }
                    return a.value.localeCompare(b.value)
                })

            setAvailableTags(tags)
        } catch (err) {
            console.error('Error fetching tags:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch tags')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTags()
    }, [])

    return {
        availableTags,
        loading,
        error,
        refresh: fetchTags
    }
}

/**
 * Hook to filter tags based on search query
 */
export function useTagSearch(query: string, allTags: MemoryTag[]): MemoryTag[] {
    const [filteredTags, setFilteredTags] = useState<MemoryTag[]>([])

    useEffect(() => {
        if (!query.trim()) {
            setFilteredTags([])
            return
        }

        const searchLower = query.toLowerCase()
        const filtered = allTags
            .filter(tag => 
                tag.key.toLowerCase().includes(searchLower) || 
                tag.value.toLowerCase().includes(searchLower)
            )
            .slice(0, 10) // Limit to 10 results for performance

        setFilteredTags(filtered)
    }, [query, allTags])

    return filteredTags
}
