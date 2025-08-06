#!/usr/bin/env tsx

/**
 * Unified CLI script for InstaMem memory management
 * Handles: add, edit, delete, list, search, users
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
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
    search <query>             Search memories across all users
    add <file.json>            Add memories from JSON file
    delete <memory-id>         Delete memory by ID (interactive confirmation)
    edit <memory-id>           Edit memory content and tags (interactive)

EXAMPLES:
    npm run memories users
    npm run memories list test@instamem.local
    npm run memories list 550e8400-e29b-41d4-a716-446655440000
    npm run memories search "coffee"
    npm run memories add my-memories.json
    npm run memories delete abc123-def456-789
    npm run memories edit abc123-def456-789

JSON FORMAT for adding memories:
[{
    "uuid": "user-uuid-here",
    "add-memories": [
        {
            "content": "Memory text here",
            "date": "2024-07-31",
            "url": "https://example.com",
            "tags": ["person:alice", "feeling:happy"]
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
    content: string
    date?: string
    url?: string
    tags?: string[]
}

interface UserMemories {
    uuid: string
    'add-memories': MemoryInput[]
}

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
        persistSession: false
    }
})

// Create readline interface for user input  
let rl: readline.Interface

function createReadlineInterface() {
    if (rl) {
        rl.close()
    }
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
}

// Helper function to prompt user input
function question(prompt: string): Promise<string> {
    return new Promise(resolve => {
        if (!rl) {
            createReadlineInterface()
        }
        rl.question(prompt, resolve)
    })
}

// Parse tags from array format (for JSON input)
function parseTagsFromArray(tagArray: string[] = []): Tag[] {
    return tagArray.map(tag => {
        if (tag.includes(':')) {
            const [key, value] = tag.split(':', 2)
            return {
                key: key.trim().toLowerCase(),
                value: value.trim()
            }
        } else {
            return {
                key: 'general',
                value: tag.trim()
            }
        }
    })
}

// Parse tags from string format (for interactive input)
function parseTagsFromString(tagString: string = ''): Tag[] {
    if (!tagString.trim()) return []
    
    return tagString.split(',').map(tag => {
        const trimmed = tag.trim()
        if (trimmed.includes(':')) {
            const [key, value] = trimmed.split(':', 2)
            return {
                key: key.trim().toLowerCase(),
                value: value.trim()
            }
        } else {
            return {
                key: 'general',
                value: trimmed
            }
        }
    }).filter(tag => tag.value) // Remove empty tags
}

// Format tags for display
function formatTags(tags: Tag[]): string {
    return tags.map(tag => `${tag.key}:${tag.value}`).join(', ')
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
    
    let query = adminSupabase
        .from('memories')
        .select(`
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
        `)
        .order('memory_date', { ascending: false })
    
    // Filter by user if identifier provided
    if (userIdentifier) {
        let userId: string | undefined
        
        // Check if it's a UUID (36 characters with dashes in specific positions)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdentifier)
        
        if (isUuid) {
            // It's a UUID, use it directly
            userId = userIdentifier
            console.log(`Filtering memories for user UUID: ${userIdentifier}`)
        } else {
            // It's an email, look up the user
            const { data: users } = await adminSupabase.auth.admin.listUsers()
            const user = users?.users.find(u => u.email === userIdentifier || (u.user_metadata as any)?.email === userIdentifier)
            
            if (!user) {
                console.error(`❌ User with email "${userIdentifier}" not found`)
                return
            }
            
            userId = user.id
            console.log(`Filtering memories for user: ${userIdentifier}`)
        }
        
        query = query.eq('user_id', userId)
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
        const tags = memory.memory_tag?.map((mt: any) => ({
            key: mt.tag_values.tag_keys.name,
            value: mt.tag_values.text
        })) || []
        
        console.log(`${index + 1}. ID: ${memory.id}`)
        console.log(`   Date: ${new Date(memory.memory_date).toLocaleDateString()}`)
        console.log(`   Content: ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}`)
        if (memory.url) console.log(`   URL: ${memory.url}`)
        if (tags.length) console.log(`   Tags: ${formatTags(tags)}`)
        if (!userIdentifier) console.log(`   User: ${memory.user_id}`)
        console.log('')
    })
}

// Search memories across all users
async function searchMemories(searchQuery: string) {
    console.log(`🔍 Searching for: "${searchQuery}"`)
    
    const { data: memories, error } = await adminSupabase
        .from('memories')
        .select(`
            id,
            content,
            memory_date,
            user_id,
            url,
            created_at,
            updated_at
        `)
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
        console.log(`${index + 1}. ID: ${memory.id}`)
        console.log(`   Date: ${new Date(memory.memory_date).toLocaleDateString()}`)
        console.log(`   Content: ${memory.content}`)
        if (memory.url) console.log(`   URL: ${memory.url}`)
        console.log('')
    })
}

// Add memories from JSON file
async function addMemoriesFromFile(filePath: string) {
    try {
        console.log(`📝 Reading memories from: ${filePath}`)
        
        const fullPath = resolve(filePath)
        const fileContent = readFileSync(fullPath, 'utf-8')
        const rawData = JSON.parse(fileContent)
        
        // Handle both single user object and array of users
        let usersData: UserMemories[]
        
        if (Array.isArray(rawData)) {
            usersData = rawData
        } else if (rawData.uuid && rawData['add-memories']) {
            usersData = [rawData]
        } else {
            console.error('❌ Invalid JSON format. Expected:')
            console.error('Single user: { "uuid": "...", "add-memories": [...] }')
            console.error('Multiple users: [{ "uuid": "...", "add-memories": [...] }, ...]')
            return
        }

        console.log(`Found ${usersData.length} user(s) with memories to add`)
        
        let totalAddedCount = 0
        
        for (const userData of usersData) {
            if (!userData.uuid || !userData['add-memories']) {
                console.error(`❌ Invalid user data format, skipping user`)
                continue
            }

            const memories = userData['add-memories']
            console.log(`\n👤 Processing ${memories.length} memories for user ${userData.uuid}`)

            let userAddedCount = 0
            
            for (const memoryInput of memories) {
                try {
                    const memory = {
                        user_id: userData.uuid,
                        content: memoryInput.content,
                        memory_date: parseDate(memoryInput.date).toISOString(),
                        url: memoryInput.url || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
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
                        const tags = parseTagsFromArray(memoryInput.tags)
                        
                        for (const tag of tags) {
                            await addTagToMemory(insertedMemory.id, tag)
                        }
                    }

                    userAddedCount++
                    totalAddedCount++
                    console.log(`✅ Added memory: ${memoryInput.content.substring(0, 50)}...`)
                    
                } catch (error) {
                    console.error(`❌ Error processing memory: ${error}`)
                }
            }
            
            console.log(`✅ Added ${userAddedCount} out of ${memories.length} memories for user ${userData.uuid}`)
        }

        console.log(`\n🎉 Successfully added ${totalAddedCount} memories across ${usersData.length} user(s)!`)
        
    } catch (error) {
        console.error('❌ Error reading or parsing file:', error)
    }
}

// Helper function to add tag to memory
async function addTagToMemory(memoryId: string, tag: Tag) {
    // Get or create tag_key
    let { data: tagKey } = await adminSupabase
        .from('tag_keys')
        .select('id')
        .eq('name', tag.key)
        .single()
    
    if (!tagKey) {
        const { data: newTagKey } = await adminSupabase
            .from('tag_keys')
            .insert({ name: tag.key })
            .select('id')
            .single()
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
                tag_id: tagKey!.id
            })
            .select('id')
            .single()
        tagValue = newTagValue
    }
    
    // Link memory to tag
    await adminSupabase
        .from('memory_tag')
        .insert({
            memory_id: memoryId,
            tag_id: tagValue!.id
        })
}

// Delete a memory by ID
async function deleteMemory(memoryId: string) {
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
    const { error: tagError } = await adminSupabase
        .from('memory_tag')
        .delete()
        .eq('memory_id', memoryId)
    
    if (tagError) {
        console.error('❌ Error deleting memory tags:', tagError.message)
        return
    }

    // Delete the memory
    const { error: deleteError } = await adminSupabase
        .from('memories')
        .delete()
        .eq('id', memoryId)
    
    if (deleteError) {
        console.error('❌ Error deleting memory:', deleteError.message)
        return
    }

    console.log('✅ Memory deleted successfully!')
}

// Edit a memory by ID
async function editMemory(memoryId: string) {
    console.log(`✏️  Editing memory: ${memoryId}`)
    
    // Fetch the current memory with tags
    const { data: memory, error: fetchError } = await adminSupabase
        .from('memories')
        .select(`
            *,
            memory_tag(
                tag_values(
                    text,
                    tag_keys(name)
                )
            )
        `)
        .eq('id', memoryId)
        .single()
    
    if (fetchError || !memory) {
        console.error(`❌ Memory with ID "${memoryId}" not found`)
        return
    }

    const currentTags = memory.memory_tag?.map((mt: any) => ({
        key: mt.tag_values.tag_keys.name,
        value: mt.tag_values.text
    })) || []

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
        updated_at: new Date().toISOString()
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
    const { error: updateError } = await adminSupabase
        .from('memories')
        .update(updates)
        .eq('id', memoryId)
    
    if (updateError) {
        console.error('❌ Error updating memory:', updateError.message)
        return
    }

    // Handle tags if provided
    if (newTagsString.trim()) {
        const newTags = parseTagsFromString(newTagsString)
        
        // Delete existing tags
        await adminSupabase
            .from('memory_tag')
            .delete()
            .eq('memory_id', memoryId)
        
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
    createReadlineInterface()

    try {
        switch (command) {
            case 'users':
                await listUsers()
                break
                
            case 'list':
                const userIdentifier = args[1]
                await listMemories(userIdentifier)
                break
                
            case 'search':
                if (args.length < 2) {
                    console.error('❌ Please provide a search query')
                    console.log('Usage: npm run memories search <query>')
                    break
                }
                await searchMemories(args.slice(1).join(' '))
                break
                
            case 'add':
                if (args.length < 2) {
                    console.error('❌ Please provide a JSON file path')
                    console.log('Usage: npm run memories add <file.json>')
                    break
                }
                await addMemoriesFromFile(args[1])
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
        if (rl) {
            rl.close()
        }
        process.exit(0)
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught error:', error)
    if (rl) {
        rl.close()
    }
    process.exit(1)
})

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error)
    if (rl) {
        rl.close()
    }
    process.exit(1)
})

// Run the script
main()
