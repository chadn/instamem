import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Builds the complex memory search query with nested tag relationships
 * Reusable for both search and sync operations
 */
export function buildMemorySearchQuery(supabase: SupabaseClient, limit: number = 50) {
    return supabase
        .from('memories')
        .select(`
            id,
            content,
            memory_date,
            url,
            created_at,
            memory_tag!left(
                tag_values(
                    text,
                    tag_keys(
                        name
                    )
                )
            )
        `)
        .order('memory_date', { ascending: false })
        .limit(limit)
}

/**
 * Builds query for fetching all user memories (for sync operations)
 */
export function buildAllMemoriesQuery(supabase: SupabaseClient) {
    return buildMemorySearchQuery(supabase, 1000) // Higher limit for sync
}