import { SupabaseClient } from '@supabase/supabase-js'
import { Memory, MemoryTag, RawMemoryData, transformRawMemoryData } from '@/types/memory'

/**
 * Fetch a single memory by ID with all tag relationships
 */
export async function fetchMemoryById(supabase: SupabaseClient, id: string): Promise<Memory | null> {
    const { data, error } = await supabase
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
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching memory:', error)
        return null
    }

    if (!data) return null

    // Transform the single memory using existing transform function
    const transformedMemories = transformRawMemoryData([data as unknown as RawMemoryData])
    return transformedMemories[0] || null
}

/**
 * Update memory content, date, and URL (tags handled separately)
 */
export async function updateMemoryFields(
    supabase: SupabaseClient, 
    id: string, 
    updates: { content?: string; memory_date?: string; url?: string }
): Promise<Memory | null> {
    const { error } = await supabase
        .from('memories')
        .update(updates)
        .eq('id', id)
        .select('id')
        .single()

    if (error) {
        console.error('Error updating memory:', error)
        throw new Error('Failed to update memory')
    }

    // Fetch the updated memory with full data
    return await fetchMemoryById(supabase, id)
}

/**
 * Update memory tags by replacing all existing tags with new ones
 */
export async function updateMemoryTags(
    supabase: SupabaseClient,
    memoryId: string,
    newTags: MemoryTag[]
): Promise<void> {
    // Start a transaction-like operation
    try {
        // 1. Remove all existing memory_tag relationships for this memory
        const { error: deleteError } = await supabase
            .from('memory_tag')
            .delete()
            .eq('memory_id', memoryId)

        if (deleteError) {
            console.error('Error removing existing tags:', deleteError)
            throw new Error('Failed to remove existing tags')
        }

        // 2. For each new tag, ensure tag_keys and tag_values exist, then create memory_tag relationships
        for (const tag of newTags) {
            // Ensure tag_keys exists
            let tagKeyId: string
            const { data: existingKey, error: keyFetchError } = await supabase
                .from('tag_keys')
                .select('id')
                .eq('name', tag.key)
                .single()

            if (keyFetchError && keyFetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw new Error(`Failed to fetch tag key: ${keyFetchError.message}`)
            }

            if (existingKey) {
                tagKeyId = existingKey.id
            } else {
                // Create new tag_keys entry
                const { data: newKey, error: keyCreateError } = await supabase
                    .from('tag_keys')
                    .insert({ name: tag.key })
                    .select('id')
                    .single()

                if (keyCreateError || !newKey) {
                    throw new Error(`Failed to create tag key: ${keyCreateError?.message}`)
                }
                tagKeyId = newKey.id
            }

            // Ensure tag_values exists
            let tagValueId: string
            const { data: existingValue, error: valueFetchError } = await supabase
                .from('tag_values')
                .select('id')
                .eq('tag_id', tagKeyId)
                .eq('text', tag.value)
                .single()

            if (valueFetchError && valueFetchError.code !== 'PGRST116') {
                throw new Error(`Failed to fetch tag value: ${valueFetchError.message}`)
            }

            if (existingValue) {
                tagValueId = existingValue.id
            } else {
                // Create new tag_values entry
                const { data: newValue, error: valueCreateError } = await supabase
                    .from('tag_values')
                    .insert({ 
                        tag_id: tagKeyId,
                        text: tag.value 
                    })
                    .select('id')
                    .single()

                if (valueCreateError || !newValue) {
                    throw new Error(`Failed to create tag value: ${valueCreateError?.message}`)
                }
                tagValueId = newValue.id
            }

            // Create memory_tag relationship
            const { error: relationError } = await supabase
                .from('memory_tag')
                .insert({
                    memory_id: memoryId,
                    tag_id: tagValueId
                })

            if (relationError) {
                throw new Error(`Failed to create memory-tag relationship: ${relationError.message}`)
            }
        }

    } catch (error) {
        console.error('Error updating memory tags:', error)
        throw error
    }
}

/**
 * Complete memory update including content, date, url, and tags
 */
export async function updateMemory(
    supabase: SupabaseClient,
    id: string,
    updates: {
        content?: string
        memory_date?: string
        url?: string
        tags?: MemoryTag[]
    }
): Promise<Memory | null> {
    try {
        // Update basic fields first
        if (updates.content !== undefined || updates.memory_date !== undefined || updates.url !== undefined) {
            const basicUpdates: { content?: string; memory_date?: string; url?: string } = {}
            if (updates.content !== undefined) basicUpdates.content = updates.content
            if (updates.memory_date !== undefined) basicUpdates.memory_date = updates.memory_date
            if (updates.url !== undefined) basicUpdates.url = updates.url

            await updateMemoryFields(supabase, id, basicUpdates)
        }

        // Update tags if provided
        if (updates.tags !== undefined) {
            await updateMemoryTags(supabase, id, updates.tags)
        }

        // Return the updated memory
        return await fetchMemoryById(supabase, id)

    } catch (error) {
        console.error('Error updating memory:', error)
        throw error
    }
}

/**
 * Create a new memory with content, date, url, and tags
 */
export async function createMemory(
    supabase: SupabaseClient,
    data: {
        content: string
        memory_date: string
        url?: string
        tags?: MemoryTag[]
    }
): Promise<Memory | null> {
    try {
        // 1. Create the basic memory record
        const { data: newMemory, error: memoryError } = await supabase
            .from('memories')
            .insert({
                content: data.content,
                memory_date: data.memory_date,
                url: data.url || null
            })
            .select('id')
            .single()

        if (memoryError || !newMemory) {
            throw new Error(`Failed to create memory: ${memoryError?.message}`)
        }

        // 2. Add tags if provided
        if (data.tags && data.tags.length > 0) {
            await updateMemoryTags(supabase, newMemory.id, data.tags)
        }

        // 3. Return the complete memory with tags
        return await fetchMemoryById(supabase, newMemory.id)

    } catch (error) {
        console.error('Error creating memory:', error)
        throw error
    }
}