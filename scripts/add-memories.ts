#!/usr/bin/env tsx

/**
 * CLI script to add memories from JSON file to InstaMem
 * Usage: npm run add-memories list  # list users and tags
 * Usage: npm run add-memories memory.json
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables
config({ path: '.env.local' })

const Usage = `Usage:
npm run add-memories list  # list users and tags for memory creating
npm run add-memories <file.json>
`

// Types
interface Tag {
    key: string
    value: string
}

interface UserInfo {
    uuid: string
    name: string
    email: string
    provider: string
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

interface Memory {
    id: string
    content: string
    memory_date: string
    user_id: string
    url?: string
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

// Parse tags from array format
function parseTags(tagArray: string[] = []): Tag[] {
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

// Insert memory into database
async function insertMemory(memoryInput: MemoryInput, userId: string): Promise<Memory | null> {
    try {
        const memoryDate = parseDate(memoryInput.date)
        
        // Insert memory
        const { data: memory, error: memoryError } = await adminSupabase
            .from('memories')
            .insert({
                content: memoryInput.content,
                memory_date: memoryDate.toISOString(),
                user_id: userId,
                url: memoryInput.url || null
            })
            .select()
            .single()

        if (memoryError) {
            console.error(`❌ Failed to insert memory: ${memoryError.message}`)
            return null
        }

        console.log(`✅ Memory created: ${memory.id}`)
        console.log(`   Content: ${memoryInput.content.substring(0, 60)}${memoryInput.content.length > 60 ? '...' : ''}`)

        // Process tags if provided
        const tags = parseTags(memoryInput.tags)
        if (tags.length > 0) {
            console.log(`   🏷️  Processing ${tags.length} tags...`)
            
            for (const tag of tags) {
                try {
                    // Get or create tag key
                    let { data: tagKey, error: tagKeyError } = await adminSupabase
                        .from('tag_keys')
                        .select('id')
                        .eq('name', tag.key)
                        .single()

                    if (tagKeyError || !tagKey) {
                        // Create new tag key
                        const { data: newTagKey, error: createKeyError } = await adminSupabase
                            .from('tag_keys')
                            .insert({ name: tag.key })
                            .select()
                            .single()
                        
                        if (createKeyError || !newTagKey) {
                            console.warn(`      ⚠️  Failed to create tag key "${tag.key}"`)
                            continue
                        }
                        tagKey = newTagKey
                    }

                    // Ensure tagKey exists before proceeding
                    if (!tagKey) {
                        console.warn(`      ⚠️  Failed to get or create tag key "${tag.key}"`)
                        continue
                    }

                    // Get or create tag value
                    let { data: tagValue, error: tagValueError } = await adminSupabase
                        .from('tag_values')
                        .select('id')
                        .eq('tag_id', tagKey.id)
                        .eq('text', tag.value)
                        .single()

                    if (tagValueError || !tagValue) {
                        // Create new tag value
                        const { data: newTagValue, error: createValueError } = await adminSupabase
                            .from('tag_values')
                            .insert({
                                tag_id: tagKey.id,
                                text: tag.value
                            })
                            .select()
                            .single()
                        
                        if (createValueError || !newTagValue) {
                            console.warn(`      ⚠️  Failed to create tag value "${tag.value}"`)
                            continue
                        }
                        tagValue = newTagValue
                    }

                    // Ensure tagValue exists before proceeding
                    if (!tagValue) {
                        console.warn(`      ⚠️  Failed to get or create tag value "${tag.value}"`)
                        continue
                    }

                    // Link memory to tag
                    const { error: linkError } = await adminSupabase
                        .from('memory_tag')
                        .insert({
                            memory_id: memory.id,
                            tag_id: tagValue.id
                        })

                    if (linkError) {
                        console.warn(`      ⚠️  Failed to link tag "${tag.key}:${tag.value}"`)
                    } else {
                        console.log(`      ✅ Added tag: ${tag.key}:${tag.value}`)
                    }
                } catch (tagError) {
                    console.warn(`      ⚠️  Error processing tag "${tag.key}:${tag.value}"`)
                }
            }
        }

        return memory as Memory
    } catch (error) {
        console.error(`❌ Database error: ${error instanceof Error ? error.message : String(error)}`)
        return null
    }
}

// List all existing tags
async function listInfo(): Promise<void> {
    try {
        const users = await getUsers()
        console.log(`\n👥 Total users in database: ${users.length}`)
        users.forEach(user => {
            console.log(`${user.uuid} ${user.name} ${user.email} via ${user.provider}`)
        })

        console.log('\n📋 Existing tags in database:\n')
        
        const { data: tagData, error } = await adminSupabase
            .from('tag_values')
            .select(`
                text,
                tag_keys!inner(name)
            `)
            .order('tag_keys(name)')
            .order('text')

        if (error) {
            console.error('❌ Error fetching tags:', error.message)
            return
        }

        if (!tagData || tagData.length === 0) {
            console.log('No tags found in database.')
            return
        }

        // Group tags by key and output in requested format
        const tagsByKey: Record<string, string[]> = {}
        
        tagData.forEach(item => {
            const key = (item.tag_keys as any).name
            if (!tagsByKey[key]) {
                tagsByKey[key] = []
            }
            tagsByKey[key].push(item.text)
        })

        // Output in format: key:value
        Object.entries(tagsByKey).forEach(([key, values]) => {
            values.forEach(value => {
                console.log(`${key}:${value}`)
            })
        })

    } catch (error) {
        console.error('❌ Error listing tags:', error instanceof Error ? error.message : String(error))
    }
}

// Fetch all users from database
async function getUsers(): Promise<UserInfo[]> {
    try {
        console.log('👥 Fetching all users from database...')
        
        const { data: users, error } = await adminSupabase.auth.admin.listUsers()
        
        if (error) {
            console.error('❌ Error fetching users:', error.message)
            return []
        }
        
        if (!users || users.users.length === 0) {
            console.log('No users found in database')
            return []
        }
        
        const userInfos: UserInfo[] = users.users.map(user => ({
            uuid: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown',
            email: user.email || 'No email',
            provider: user.app_metadata?.provider || 'unknown'
        }))
        
        console.log(`✅ Found ${userInfos.length} users in database`)
        return userInfos
        
    } catch (error) {
        console.error('❌ Error fetching users:', error instanceof Error ? error.message : String(error))
        return []
    }
}

// Load and parse JSON file
function loadMemoriesFile(filePath: string): UserMemories[] {
    try {
        const fullPath = resolve(filePath)
        const fileContent = readFileSync(fullPath, 'utf-8')
        const data = JSON.parse(fileContent)
        
        // Validate structure
        if (!Array.isArray(data)) {
            throw new Error('JSON file must contain an array')
        }
        
        for (const item of data) {
            if (!item.uuid || !item['add-memories'] || !Array.isArray(item['add-memories'])) {
                throw new Error('Invalid JSON structure. Expected: [{"uuid":"...", "add-memories":[...]}]')
            }
        }
        
        return data as UserMemories[]
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Error loading file:', error.message)
        } else {
            console.error('❌ Unknown error loading file')
        }
        process.exit(1)
    }
}

// Main function
async function main(): Promise<void> {
    try {
        const args = process.argv.slice(2)
        
        if (args[0] === 'list') {
            await listInfo()
            return
        }
        
        // Require file path or list option
        if (args.length === 0) {
            console.error(Usage)
            process.exit(1)
        }
        
        const filePath = args[0]
        console.log('🧠 InstaMem - Batch Add Memories')
        console.log('=================================\n')
        console.log(`📁 Loading memories from: ${filePath}`)
        
        const userMemoriesData = loadMemoriesFile(filePath)
        console.log(`📊 Found ${userMemoriesData.length} user(s) with memories\n`)
        
        // Validate user UUIDs against database
        console.log('🔍 Validating user UUIDs...')
        const allUsers = await getUsers()
        if (!allUsers || allUsers.length === 0) {
            console.error('❌ No users found in database. Please ensure you have users created before adding memories.')
            process.exit(1)
        }
        const userMap = new Map(allUsers.map(user => [user.uuid, user]))        
        let totalMemoriesAdded = 0

        for (const userData of userMemoriesData) {
            if (!userMap.has(userData.uuid)) {
                console.warn(`⚠️  User UUID ${userData.uuid} does not exist in database - skipping ${userData['add-memories'].length} memories`)
                continue
            }
            const user = userMap.get(userData.uuid)!
            console.log(`👤 Processing user: ${user.email} ${userData.uuid}`)
            console.log(`📝 ${userData['add-memories'].length} memories to add\n`)
            
            let userMemoriesAdded = 0
            
            for (const memoryInput of userData['add-memories']) {
                const memory = await insertMemory(memoryInput, userData.uuid)
                if (memory) {
                    userMemoriesAdded++
                    totalMemoriesAdded++
                }
                console.log() // Empty line between memories
            }
            
            console.log(`✅ Added ${userMemoriesAdded}/${userData['add-memories'].length} memories for user ${userData.uuid}\n`)
        }
        
        console.log(`🎉 Batch complete! Total memories added: ${totalMemoriesAdded}`)
        
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Goodbye!')
    process.exit(0)
})

// Run the CLI
if (require.main === module) {
    main()
}