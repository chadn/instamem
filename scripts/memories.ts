#!/usr/bin/env tsx

/**
 * Unified CLI script for InstaMem memory management
 * Handles: add, edit, delete, list, search, users
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import * as readline from 'readline'

// Load environment variables
config({ path: '.env.local' })

const Usage = `InstaMem Memory Management CLI

USAGE:
    npm run memories <command> [options]

COMMANDS:
    users                      List all users
    list [user-email|uuid]     List memories (optionally filter by user email or UUID)
    list-json <user-email|uuid|all> [output-file] Export user memories to JSON file (use 'all' for all users)
    search <query>             Search memories across all users
    update <file.json>         Add or Edit memories from JSON file
    delete <memory-id|user-id> Delete memory by ID or all memories for user-id (interactive confirmation)
    edit <memory-id>           Edit memory content and tags (interactive)

EXAMPLES:
    npm run memories users
    npm run memories list test@instamem.local
    npm run memories list 550e8400-e29b-41d4-a716-446655440000
    npm run memories list-json test@instamem.local my-memories.json
    npm run memories list-json all all-memories.json
    npm run memories search "coffee"
    npm run memories update my-memories.json
    npm run memories delete abc123-def456-789
    npm run memories delete test@instamem.local
    npm run memories edit abc123-def456-789

JSON FORMAT for adding (first with no id) or editing (second has id) memories:
[{
    "uuid": "user-uuid-here",
    "memories": [
        {
            "content": "Memory text here",
            "date": "2024-07-31",
            "url": "https://example.com",
            "tags": ["person:alice", "feeling:happy"]
        },
        {
            "id": "8e062b67-1b07-4544-b04c-dbf46e5f99a4",
            "content": "Test memory for editing",
            "date": "2024-07-31",
            "url": "https://example.com",
            "tags": ["feeling:excited"]
        }
    ]
}]
`

// Types
interface Tag {
    key: string
    value: string
}

interface MemoryInput {
    id?: string
    content: string
    date?: string
    url?: string
    tags?: string[]
}

interface UserMemories {
    uuid: string
    memories: MemoryInput[]
}

// Constants
const MEMORY_QUERY_WITH_TAGS = `
    id,
    content,
    memory_date,
    user_id,
    url,
    created_at,
    updated_at,
    memory_tag(
        tag_values(
            text,
            tag_keys(name)
        )
    )
`

// Initialize Supabase client with service role key for CLI operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase environment variables')
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
    process.exit(1)
}

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
})

// Helper Functions

// Resolve user identifier (email or UUID) to user ID
async function resolveUserIdentifier(userIdentifier: string): Promise<{ userId: string; displayName: string } | null> {
    if (isUuid(userIdentifier)) {
        return { userId: userIdentifier, displayName: userIdentifier }
    }
    
    const { data: users } = await adminSupabase.auth.admin.listUsers()
    const user = users?.users.find(
        (u) => u.email === userIdentifier || (u.user_metadata as any)?.email === userIdentifier
    )

    if (!user) {
        return null
    }

    return { userId: user.id, displayName: userIdentifier }
}

// Extract and format tags from memory data
function extractMemoryTags(memory: any): Tag[] {
    return (
        memory.memory_tag?.map((mt: any) => ({
            key: mt.tag_values.tag_keys.name,
            value: mt.tag_values.text,
        })) || []
    )
}

// Format memory tags for JSON export
function formatMemoryTagsForExport(memory: any): string[] | undefined {
    const tags = memory.memory_tag?.map((mt: any) => `${mt.tag_values.tag_keys.name}:${mt.tag_values.text}`) || []
    return tags.length > 0 ? tags : undefined
}

// Check if identifier could be a UUID
function isUuid(identifier: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
}

// Display a memory in a consistent format
function displayMemory(memory: any, index: number, showUser = false, showTags = true, truncateContent = 100) {
    console.log(`${index + 1}. ID: ${memory.id}`)
    console.log(`   Date: ${new Date(memory.memory_date).toLocaleDateString()}`)

    const content =
        truncateContent > 0 && memory.content.length > truncateContent
            ? `${memory.content.substring(0, truncateContent)}...`
            : memory.content
    console.log(`   Content: ${content}`)

    if (memory.url) console.log(`   URL: ${memory.url}`)

    if (showTags) {
        const tags = extractMemoryTags(memory)
        if (tags.length) console.log(`   Tags: ${formatTags(tags)}`)
    }

    if (showUser) console.log(`   User: ${memory.user_id}`)
    console.log('')
}

// Helper function to prompt user input
function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        rl.question(prompt, (answer) => {
            rl.close()
            resolve(answer)
        })
    })
}

// Parse a single tag string into Tag object
function parseTag(tagString: string): Tag {
    if (tagString.includes(':')) {
        const [key, value] = tagString.split(':', 2)
        return {
            key: key.trim().toLowerCase(),
            value: value.trim(),
        }
    } else {
        return {
            key: 'general',
            value: tagString.trim(),
        }
    }
}

// Parse tags from array or string format
function parseTags(input: string[] | string = ''): Tag[] {
    if (Array.isArray(input)) {
        return input.map(parseTag)
    }
    
    if (!input.trim()) return []

    return input
        .split(',')
        .map((tag) => parseTag(tag.trim()))
        .filter((tag) => tag.value) // Remove empty tags
}

// Format tags for display
function formatTags(tags: Tag[]): string {
    return tags.map((tag) => `${tag.key}:${tag.value}`).join(', ')
}

// Parse date input
function parseDate(dateInput?: string): Date {
    if (!dateInput || dateInput === 'now') {
        return new Date()
    }

    const date = new Date(dateInput)
    if (isNaN(date.getTime())) {
        console.warn(`⚠️  Invalid date format: ${dateInput}, using current date`)
        return new Date()
    }

    return date
}

// List all users
async function listUsers() {
    console.log('👥 Fetching all users...')

    const { data: users, error } = await adminSupabase.auth.admin.listUsers()

    if (error) {
        console.error('❌ Error fetching users:', error.message)
        return
    }

    if (!users.users.length) {
        console.log('No users found.')
        return
    }

    console.log(`\nFound ${users.users.length} users:\n`)
    users.users.forEach((user, index) => {
        const email = user.email || (user.user_metadata as any)?.email || 'No email'
        const name = (user.user_metadata as any)?.name || 'No name'
        console.log(`${index + 1}. ${email} (${name})`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`)
        console.log('')
    })
}

// List memories for a user
async function listMemories(userIdentifier?: string) {
    console.log('📚 Fetching memories...')

    let query = adminSupabase.from('memories').select(MEMORY_QUERY_WITH_TAGS).order('memory_date', { ascending: false })

    // Filter by user if identifier provided
    if (userIdentifier) {
        const userInfo = await resolveUserIdentifier(userIdentifier)
        if (!userInfo) {
            console.error(`❌ User with email "${userIdentifier}" not found`)
            return
        }

        console.log(`Filtering memories for ${userInfo.displayName}`)
        query = query.eq('user_id', userInfo.userId)
    }

    const { data: memories, error } = await query.limit(50)

    if (error) {
        console.error('❌ Error fetching memories:', error.message)
        return
    }

    if (!memories?.length) {
        console.log('No memories found.')
        return
    }

    console.log(`\nFound ${memories.length} memories:\n`)

    memories.forEach((memory: any, index) => {
        displayMemory(memory, index, !userIdentifier, true, 100)
    })
}

// Export memories to JSON file (compatible with add command)
async function listMemoriesJson(userIdentifier: string, outputFile?: string) {
    if (outputFile) {
        console.log(`📤 Exporting memories to: ${outputFile}`)
    }
    let query = adminSupabase.from('memories').select(MEMORY_QUERY_WITH_TAGS).order('memory_date', { ascending: false })

    // Handle special "all" case or look up specific user
    if (userIdentifier.toLowerCase() === 'all') {
        console.log('Exporting memories for all users')
        // Don't filter by user_id - get all memories
    } else {
        const userInfo = await resolveUserIdentifier(userIdentifier)
        if (!userInfo) {
            console.error(`❌ User with email "${userIdentifier}" not found`)
            return
        }

        console.log(`Filtering memories for ${userInfo.displayName}`)
        query = query.eq('user_id', userInfo.userId)
    }

    const { data: memories, error } = await query

    if (error) {
        console.error('❌ Error fetching memories:', error.message)
        return
    }

    if (!memories?.length) {
        console.log('No memories found.')
        if (outputFile) {
            writeFileSync(outputFile, '[]', 'utf-8')
            console.log(`✅ Empty JSON array written to ${outputFile}`)
        } else {
            console.log('[]')
        }
        return
    }

    // Group memories by user_id
    const memoriesByUser: { [userId: string]: any[] } = {}

    memories.forEach((memory: any) => {
        if (!memoriesByUser[memory.user_id]) {
            memoriesByUser[memory.user_id] = []
        }

        const tags = formatMemoryTagsForExport(memory)

        memoriesByUser[memory.user_id].push({
            id: memory.id,
            content: memory.content,
            date: memory.memory_date.split('T')[0], // Format as YYYY-MM-DD
            url: memory.url || undefined,
            tags: tags,
        })
    })

    // Format output compatible with add command
    const output = Object.keys(memoriesByUser).map((userId) => ({
        uuid: userId,
        memories: memoriesByUser[userId],
    }))

    // Output JSON
    const jsonContent = JSON.stringify(output, null, 2)

    if (outputFile) {
        // Write to file
        writeFileSync(outputFile, jsonContent, 'utf-8')
        const totalMemories = Object.values(memoriesByUser).reduce((sum, memories) => sum + memories.length, 0)
        console.log(
            `✅ Successfully exported ${totalMemories} memories across ${output.length} user(s) to ${outputFile}`
        )
    } else {
        // Output to console
        console.log(jsonContent)
    }
}

// Search memories across all users
async function searchMemories(searchQuery: string) {
    console.log(`🔍 Searching for: "${searchQuery}"`)

    const { data: memories, error } = await adminSupabase
        .from('memories')
        .select(
            `
            id,
            content,
            memory_date,
            user_id,
            url,
            created_at,
            updated_at
        `
        )
        .ilike('content', `%${searchQuery}%`)
        .order('memory_date', { ascending: false })
        .limit(20)

    if (error) {
        console.error('❌ Error searching memories:', error.message)
        return
    }

    if (!memories?.length) {
        console.log('No memories found matching your search.')
        return
    }

    console.log(`\nFound ${memories.length} matching memories:\n`)

    memories.forEach((memory, index) => {
        displayMemory(memory, index, false, false, 0)
    })
}

// Add or Edit memories from JSON file
async function updateMemoriesFromFile(filePath: string) {
    try {
        console.log(`📝 Reading memories from: ${filePath}`)

        const fullPath = resolve(filePath)
        const fileContent = readFileSync(fullPath, 'utf-8')
        const jsonData = JSON.parse(fileContent)

        // Handle both single user object and array of users
        let userMemoriesData: UserMemories[]

        if (Array.isArray(jsonData)) {
            userMemoriesData = jsonData
        } else if (jsonData.uuid && jsonData.memories) {
            userMemoriesData = [jsonData]
        } else {
            console.error('❌ Invalid JSON format. Expected:')
            console.error('Single user: { "uuid": "...", "memories": [...] }')
            console.error('Multiple users: [{ "uuid": "...", "memories": [...] }, ...]')
            return
        }

        console.log(`Found ${userMemoriesData.length} user(s) with memories to process`)

        let totalProcessedCount = 0

        for (const userData of userMemoriesData) {
            if (!userData.uuid || !userData.memories) {
                console.error(`❌ Invalid user data format, skipping user`)
                continue
            }

            const memories = userData.memories
            console.log(`\n👤 Processing ${memories.length} memories for user ${userData.uuid}`)

            let userProcessedCount = 0

            for (const memoryInput of memories) {
                try {
                    if (memoryInput.id) {
                        // Edit existing memory
                        const updates = {
                            content: memoryInput.content,
                            memory_date: parseDate(memoryInput.date).toISOString(),
                            url: memoryInput.url || null,
                            updated_at: new Date().toISOString(),
                        }

                        const { error: updateError } = await adminSupabase
                            .from('memories')
                            .update(updates)
                            .eq('id', memoryInput.id)
                            .eq('user_id', userData.uuid) // Ensure user can only edit their own memories

                        if (updateError) {
                            console.error(`❌ Error updating memory ${memoryInput.id}: ${updateError.message}`)
                            continue
                        }

                        // Update tags if provided
                        if (memoryInput.tags) {
                            const tags = parseTags(memoryInput.tags)

                            // Delete existing tags
                            await adminSupabase.from('memory_tag').delete().eq('memory_id', memoryInput.id)

                            // Add new tags
                            for (const tag of tags) {
                                await addTagToMemory(memoryInput.id, tag)
                            }
                        }

                        console.log(`✅ Updated memory: ${memoryInput.content.substring(0, 50)}...`)
                    } else {
                        // Add new memory
                        const memory = {
                            user_id: userData.uuid,
                            content: memoryInput.content,
                            memory_date: parseDate(memoryInput.date).toISOString(),
                            url: memoryInput.url || null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }

                        // Insert the memory
                        const { data: insertedMemory, error: memoryError } = await adminSupabase
                            .from('memories')
                            .insert(memory)
                            .select('id')
                            .single()

                        if (memoryError) {
                            console.error(`❌ Error adding memory: ${memoryError.message}`)
                            continue
                        }

                        // Add tags if provided
                        if (memoryInput.tags && memoryInput.tags.length > 0) {
                            const tags = parseTags(memoryInput.tags)

                            for (const tag of tags) {
                                await addTagToMemory(insertedMemory.id, tag)
                            }
                        }

                        console.log(`✅ Added memory: ${memoryInput.content.substring(0, 50)}...`)
                    }

                    userProcessedCount++
                    totalProcessedCount++
                } catch (error) {
                    console.error(`❌ Error processing memory: ${error}`)
                }
            }

            console.log(`✅ Processed ${userProcessedCount} out of ${memories.length} memories for user ${userData.uuid}`)
        }

        console.log(`\n🎉 Successfully processed ${totalProcessedCount} memories across ${userMemoriesData.length} user(s)!`)
    } catch (error) {
        console.error('❌ Error reading or parsing file:', error)
    }
}

// Helper function to add tag to memory
async function addTagToMemory(memoryId: string, tag: Tag) {
    // Get or create tag_key
    let { data: tagKey } = await adminSupabase.from('tag_keys').select('id').eq('name', tag.key).single()

    if (!tagKey) {
        const { data: newTagKey } = await adminSupabase.from('tag_keys').insert({ name: tag.key }).select('id').single()
        tagKey = newTagKey
    }

    // Get or create tag_value
    let { data: tagValue } = await adminSupabase
        .from('tag_values')
        .select('id')
        .eq('text', tag.value)
        .eq('tag_id', tagKey!.id)
        .single()

    if (!tagValue) {
        const { data: newTagValue } = await adminSupabase
            .from('tag_values')
            .insert({
                text: tag.value,
                tag_id: tagKey!.id,
            })
            .select('id')
            .single()
        tagValue = newTagValue
    }

    // Link memory to tag
    await adminSupabase.from('memory_tag').insert({
        memory_id: memoryId,
        tag_id: tagValue!.id,
    })
}

// Delete a memory by ID or all memories for a user
async function deleteMemory(identifier: string) {
    if (isUuid(identifier)) {
        // First try as memory ID
        const { data: memory } = await adminSupabase.from('memories').select('*').eq('id', identifier).single()

        if (memory) {
            // It's a memory ID
            return await deleteSingleMemory(identifier)
        } else {
            // Try as user ID
            return await deleteAllUserMemories(identifier, true)
        }
    } else {
        // It's an email, delete all memories for this user
        return await deleteAllUserMemories(identifier, false)
    }
}

// Delete a single memory by ID
async function deleteSingleMemory(memoryId: string) {
    console.log(`🗑️  Attempting to delete memory: ${memoryId}`)

    // First fetch the memory to show what we're deleting
    const { data: memory, error: fetchError } = await adminSupabase
        .from('memories')
        .select('*')
        .eq('id', memoryId)
        .single()

    if (fetchError || !memory) {
        console.error(`❌ Memory with ID "${memoryId}" not found`)
        return
    }

    console.log('\nMemory to delete:')
    console.log(`Content: ${memory.content}`)
    console.log(`Date: ${new Date(memory.memory_date).toLocaleDateString()}`)
    if (memory.url) console.log(`URL: ${memory.url}`)

    const confirm = await question('\nAre you sure you want to delete this memory? (yes/no): ')

    if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Deletion cancelled.')
        return
    }

    // Delete associated tags first
    const { error: tagError } = await adminSupabase.from('memory_tag').delete().eq('memory_id', memoryId)

    if (tagError) {
        console.error('❌ Error deleting memory tags:', tagError.message)
        return
    }

    // Delete the memory
    const { error: deleteError } = await adminSupabase.from('memories').delete().eq('id', memoryId)

    if (deleteError) {
        console.error('❌ Error deleting memory:', deleteError.message)
        return
    }

    console.log('✅ Memory deleted successfully!')
}

// Delete all memories for a user
async function deleteAllUserMemories(userIdentifier: string, isUuidProvided: boolean) {
    let userId: string
    let displayName: string

    if (isUuidProvided) {
        // It's already a user UUID
        userId = userIdentifier
        displayName = userIdentifier
    } else {
        // It's an email, look up the user
        const userInfo = await resolveUserIdentifier(userIdentifier)
        if (!userInfo) {
            console.error(`❌ User with email "${userIdentifier}" not found`)
            return
        }
        userId = userInfo.userId
        displayName = userInfo.displayName
    }

    console.log(`🗑️  Attempting to delete all memories for ${displayName}`)

    // Count memories for this user
    const { data: memories, error: fetchError } = await adminSupabase
        .from('memories')
        .select('id, content, memory_date')
        .eq('user_id', userId)
        .order('memory_date', { ascending: false })

    if (fetchError) {
        console.error('❌ Error fetching user memories:', fetchError.message)
        return
    }

    if (!memories || memories.length === 0) {
        console.log('No memories found for this user.')
        return
    }

    console.log(`\nFound ${memories.length} memories to delete:`)
    memories.slice(0, 5).forEach((memory, index) => {
        console.log(
            `${index + 1}. ${memory.content.substring(0, 60)}... (${new Date(memory.memory_date).toLocaleDateString()})`
        )
    })

    if (memories.length > 5) {
        console.log(`... and ${memories.length - 5} more memories`)
    }

    const confirm = await question(
        `\n⚠️  This will permanently delete ALL ${memories.length} memories for this user. Are you sure? (yes/no): `
    )

    if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Deletion cancelled.')
        return
    }

    // Delete all memory tags first
    const memoryIds = memories.map((m) => m.id)
    const { error: tagError } = await adminSupabase.from('memory_tag').delete().in('memory_id', memoryIds)

    if (tagError) {
        console.error('❌ Error deleting memory tags:', tagError.message)
        return
    }

    // Delete all memories for the user
    const { error: deleteError } = await adminSupabase.from('memories').delete().eq('user_id', userId)

    if (deleteError) {
        console.error('❌ Error deleting memories:', deleteError.message)
        return
    }

    console.log(`✅ Successfully deleted all ${memories.length} memories for the user!`)
}

// Edit a memory by ID
async function editMemory(memoryId: string) {
    console.log(`✏️  Editing memory: ${memoryId}`)

    // Fetch the current memory with tags
    const { data: memory, error: fetchError } = await adminSupabase
        .from('memories')
        .select(MEMORY_QUERY_WITH_TAGS)
        .eq('id', memoryId)
        .single()

    if (fetchError || !memory) {
        console.error(`❌ Memory with ID "${memoryId}" not found`)
        return
    }

    const currentTags = extractMemoryTags(memory)

    console.log('\nCurrent memory:')
    console.log(`Content: ${memory.content}`)
    console.log(`Date: ${new Date(memory.memory_date).toLocaleDateString()}`)
    console.log(`URL: ${memory.url || 'None'}`)
    console.log(`Tags: ${currentTags.length ? formatTags(currentTags) : 'None'}`)

    console.log('\nEnter new values (press Enter to keep current value):')

    const newContent = await question(`Content [${memory.content.substring(0, 50)}...]: `)
    const newDate = await question(`Date (YYYY-MM-DD) [${memory.memory_date.split('T')[0]}]: `)
    const newUrl = await question(`URL [${memory.url || 'None'}]: `)
    const newTagsString = await question(`Tags (key:value,key:value) [${formatTags(currentTags)}]: `)

    // Prepare updates
    const updates: any = {
        updated_at: new Date().toISOString(),
    }

    if (newContent.trim()) updates.content = newContent.trim()
    if (newDate.trim()) {
        const parsedDate = new Date(newDate.trim())
        if (!isNaN(parsedDate.getTime())) {
            updates.memory_date = parsedDate.toISOString()
        } else {
            console.log('⚠️  Invalid date format, keeping current date')
        }
    }
    if (newUrl.trim()) updates.url = newUrl.trim()
    if (newUrl.trim() === 'none' || newUrl.trim() === 'null') updates.url = null

    // Update memory
    const { error: updateError } = await adminSupabase.from('memories').update(updates).eq('id', memoryId)

    if (updateError) {
        console.error('❌ Error updating memory:', updateError.message)
        return
    }

    // Handle tags if provided
    if (newTagsString.trim()) {
        const newTags = parseTags(newTagsString)

        // Delete existing tags
        await adminSupabase.from('memory_tag').delete().eq('memory_id', memoryId)

        // Add new tags
        for (const tag of newTags) {
            await addTagToMemory(memoryId, tag)
        }
    }

    console.log('✅ Memory updated successfully!')
}

// Main function
async function main() {
    const args = process.argv.slice(2)

    if (args.length === 0) {
        console.log(Usage)
        return
    }

    const command = args[0]

    try {
        switch (command) {
            case 'users':
                await listUsers()
                break

            case 'list':
                const listUserIdentifier = args[1]
                await listMemories(listUserIdentifier)
                break

            case 'list-json':
                if (args.length < 2) {
                    console.error('❌ Please provide a user email or UUID')
                    console.log('Usage: npm run memories list-json <user-email|uuid> [output-file]')
                    break
                }
                const jsonUserIdentifier = args[1]
                const outputFile = args[2]
                await listMemoriesJson(jsonUserIdentifier, outputFile)
                break

            case 'search':
                if (args.length < 2) {
                    console.error('❌ Please provide a search query')
                    console.log('Usage: npm run memories search <query>')
                    break
                }
                await searchMemories(args.slice(1).join(' '))
                break

            case 'update':
                if (args.length < 2) {
                    console.error('❌ Please provide a JSON file path')
                    console.log('Usage: npm run memories update <file.json>')
                    break
                }
                await updateMemoriesFromFile(args[1])
                break

            case 'delete':
                if (args.length < 2) {
                    console.error('❌ Please provide a memory ID')
                    console.log('Usage: npm run memories delete <memory-id>')
                    break
                }
                await deleteMemory(args[1])
                break

            case 'edit':
                if (args.length < 2) {
                    console.error('❌ Please provide a memory ID')
                    console.log('Usage: npm run memories edit <memory-id>')
                    break
                }
                await editMemory(args[1])
                break

            default:
                console.error(`❌ Unknown command: ${command}`)
                console.log(Usage)
                break
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error)
    } finally {
        process.exit(0)
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught error:', error)
    process.exit(1)
})

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error)
    process.exit(1)
})

// Run the script
main()
