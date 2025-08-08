import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteMemory } from '@/lib/memory-queries'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
}

// Mock the Supabase client creation
vi.mock('@/lib/supabase-browser', () => ({
  createClient: () => mockSupabaseClient
}))

describe('memory-queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.error to suppress expected error messages in tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('deleteMemory', () => {
    it('should successfully delete memory and its tag relationships', async () => {
      const memoryId = 'test-memory-id-123'

      // Mock successful deletion responses
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memory_tag') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          }
        }
        if (table === 'memories') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          }
        }
        return mockSupabaseClient
      })

      await expect(deleteMemory(mockSupabaseClient as any, memoryId)).resolves.not.toThrow()

      // Verify that memory_tag table is accessed first (for foreign key constraints)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('memory_tag')
      // Verify that memories table is accessed second
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('memories')
    })

    it('should handle memory_tag deletion errors', async () => {
      const memoryId = 'test-memory-id-456'
      const expectedError = new Error('Failed to delete memory tag relationships: Database error')

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memory_tag') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ 
                error: { message: 'Database error' } 
              })
            })
          }
        }
        return mockSupabaseClient
      })

      await expect(deleteMemory(mockSupabaseClient as any, memoryId))
        .rejects.toThrow(expectedError.message)
    })

    it('should handle memory deletion errors', async () => {
      const memoryId = 'test-memory-id-789'
      const expectedError = new Error('Failed to delete memory: Memory not found')

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memory_tag') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          }
        }
        if (table === 'memories') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ 
                error: { message: 'Memory not found' } 
              })
            })
          }
        }
        return mockSupabaseClient
      })

      await expect(deleteMemory(mockSupabaseClient as any, memoryId))
        .rejects.toThrow(expectedError.message)
    })

    it('should delete memory_tag relationships before deleting memory (foreign key order)', async () => {
      const memoryId = 'test-memory-id-order'
      const callOrder: string[] = []

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'memory_tag') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation(() => {
                callOrder.push('memory_tag')
                return Promise.resolve({ error: null })
              })
            })
          }
        }
        if (table === 'memories') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation(() => {
                callOrder.push('memories')
                return Promise.resolve({ error: null })
              })
            })
          }
        }
        return mockSupabaseClient
      })

      await deleteMemory(mockSupabaseClient as any, memoryId)

      // Verify correct order: memory_tag relationships deleted first, then memory
      expect(callOrder).toEqual(['memory_tag', 'memories'])
    })
  })
})