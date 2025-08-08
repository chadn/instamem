import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  fetchMemoryById, 
  updateMemoryFields, 
  updateMemoryTags, 
  updateMemory,
  createMemory 
} from '@/lib/memory-queries'
import { MemoryTag } from '@/types/memory'

// Mock Supabase client with comprehensive methods
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
}

// Mock the Supabase client creation
vi.mock('@/lib/supabase-browser', () => ({
  createClient: () => mockSupabaseClient
}))

// Mock the memory transform function
vi.mock('@/types/memory', () => ({
  transformRawMemoryData: vi.fn((data) => [
    {
      id: 'mock-memory-id',
      content: 'Mock memory content',
      memoryDate: '2025-08-11',
      url: 'https://example.com',
      tags: [{ key: 'person', value: 'John' }],
      createdAt: '2025-08-11T10:00:00Z'
    }
  ])
}))

describe('memory-queries extended functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.error to suppress expected error messages in tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('fetchMemoryById', () => {
    it('should successfully fetch memory by ID', async () => {
      const mockMemoryData = {
        id: 'test-memory-123',
        content: 'Test memory content',
        memory_date: '2025-08-11',
        url: 'https://example.com',
        created_at: '2025-08-11T10:00:00Z',
        memory_tag: []
      }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: mockMemoryData, 
                  error: null 
                })
              })
            })
          }
        }
        return mockSupabaseClient
      })

      const result = await fetchMemoryById(mockSupabaseClient as any, 'test-memory-123')

      expect(result).toBeDefined()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('memories')
    })

    it('should return null when memory not found', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: null, 
                  error: { message: 'Not found' }
                })
              })
            })
          }
        }
        return mockSupabaseClient
      })

      const result = await fetchMemoryById(mockSupabaseClient as any, 'nonexistent-id')
      expect(result).toBeNull()
    })
  })

  describe('updateMemoryFields', () => {
    it('should successfully update memory fields', async () => {
      const updates = { 
        content: 'Updated content', 
        memory_date: '2025-08-12',
        url: 'https://updated.com' 
      }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { id: 'test-memory-123' }, 
                    error: null 
                  })
                })
              })
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'test-memory-123' }, 
                  error: null 
                })
              })
            })
          }
        }
        return mockSupabaseClient
      })

      await expect(updateMemoryFields(mockSupabaseClient as any, 'test-memory-123', updates))
        .resolves.toBeDefined()
    })

    it('should throw error when update fails', async () => {
      const updates = { content: 'Updated content' }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: null, 
                    error: { message: 'Update failed' }
                  })
                })
              })
            })
          }
        }
        return mockSupabaseClient
      })

      await expect(updateMemoryFields(mockSupabaseClient as any, 'test-memory-123', updates))
        .rejects.toThrow('Failed to update memory')
    })
  })

  describe('createMemory', () => {
    it('should successfully create memory with basic fields', async () => {
      const memoryData = {
        content: 'New memory content',
        memory_date: '2025-08-11',
        url: 'https://example.com'
      }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'new-memory-123' }, 
                  error: null 
                })
              })
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'new-memory-123' }, 
                  error: null 
                })
              })
            })
          }
        }
        return mockSupabaseClient
      })

      const result = await createMemory(mockSupabaseClient as any, memoryData)
      expect(result).toBeDefined()
    })

    it('should create memory with tags', async () => {
      const tags: MemoryTag[] = [
        { key: 'person', value: 'John' },
        { key: 'place', value: 'Paris' }
      ]

      const memoryData = {
        content: 'New memory with tags',
        memory_date: '2025-08-11',
        tags
      }

      // Mock memory creation
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'new-memory-456' }, 
                  error: null 
                })
              })
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'new-memory-456' }, 
                  error: null 
                })
              })
            })
          }
        }
        
        // Mock tag-related tables
        if (table === 'memory_tag') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            }),
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }

        if (table === 'tag_keys') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: null, 
                  error: { code: 'PGRST116' } // No rows found
                })
              })
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'tag-key-id' }, 
                  error: null 
                })
              })
            })
          }
        }

        if (table === 'tag_values') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ 
                data: null, 
                error: { code: 'PGRST116' } // No rows found
              })
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'tag-value-id' }, 
                  error: null 
                })
              })
            })
          }
        }

        return mockSupabaseClient
      })

      const result = await createMemory(mockSupabaseClient as any, memoryData)
      expect(result).toBeDefined()
    })

    it('should throw error when memory creation fails', async () => {
      const memoryData = {
        content: 'Failed memory',
        memory_date: '2025-08-11'
      }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: null, 
                  error: { message: 'Creation failed' }
                })
              })
            })
          }
        }
        return mockSupabaseClient
      })

      await expect(createMemory(mockSupabaseClient as any, memoryData))
        .rejects.toThrow('Failed to create memory')
    })
  })

  describe('updateMemoryTags', () => {
    it('should successfully update memory tags', async () => {
      const tags: MemoryTag[] = [
        { key: 'person', value: 'Jane' },
        { key: 'place', value: 'London' }
      ]

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memory_tag') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            }),
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }

        if (table === 'tag_keys') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'existing-key-id' }, 
                  error: null 
                })
              })
            })
          }
        }

        if (table === 'tag_values') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ 
                data: { id: 'existing-value-id' }, 
                error: null 
              })
            })
          }
        }

        return mockSupabaseClient
      })

      await expect(updateMemoryTags(mockSupabaseClient as any, 'memory-id', tags))
        .resolves.not.toThrow()
    })

    it('should handle tag deletion errors', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memory_tag') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ 
                error: { message: 'Delete failed' } 
              })
            })
          }
        }
        return mockSupabaseClient
      })

      await expect(updateMemoryTags(mockSupabaseClient as any, 'memory-id', []))
        .rejects.toThrow('Failed to remove existing tags')
    })
  })

  describe('updateMemory', () => {
    it('should update memory fields and tags together', async () => {
      const updates = {
        content: 'Updated content',
        memory_date: '2025-08-12',
        tags: [{ key: 'person', value: 'Bob' }] as MemoryTag[]
      }

      // Mock all required database operations
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { id: 'memory-id' }, 
                    error: null 
                  })
                })
              })
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'memory-id' }, 
                  error: null 
                })
              })
            })
          }
        }

        // Mock tag operations
        if (table === 'memory_tag') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            }),
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }

        if (table === 'tag_keys') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'key-id' }, 
                  error: null 
                })
              })
            })
          }
        }

        if (table === 'tag_values') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ 
                data: { id: 'value-id' }, 
                error: null 
              })
            })
          }
        }

        return mockSupabaseClient
      })

      const result = await updateMemory(mockSupabaseClient as any, 'memory-id', updates)
      expect(result).toBeDefined()
    })

    it('should handle partial updates (only content)', async () => {
      const updates = { content: 'Only content update' }

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memories') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { id: 'memory-id' }, 
                    error: null 
                  })
                })
              })
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: { id: 'memory-id' }, 
                  error: null 
                })
              })
            })
          }
        }
        return mockSupabaseClient
      })

      const result = await updateMemory(mockSupabaseClient as any, 'memory-id', updates)
      expect(result).toBeDefined()
    })
  })
})