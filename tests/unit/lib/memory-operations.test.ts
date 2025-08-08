import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchMemoryById, updateMemoryFields } from '@/lib/memory-queries'
import { transformRawMemoryData } from '@/types/memory'
import { createMockSupabaseClient, createSuccessResponse, createErrorResponse } from './__mocks__/supabase'

// Create mock Supabase client
const mockSupabaseClient = createMockSupabaseClient()

// Mock the transform function
vi.mock('@/types/memory', () => ({
  transformRawMemoryData: vi.fn(),
}))

describe('Memory Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchMemoryById', () => {
    it('should return null when memory not found', async () => {
      mockSupabaseClient.single.mockResolvedValue(createSuccessResponse(null))

      const result = await fetchMemoryById(mockSupabaseClient as any, 'nonexistent-id')
      
      expect(result).toBeNull()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('memories')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'nonexistent-id')
    })

    it('should return null and log error when database error occurs', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockSupabaseClient.single.mockResolvedValue(createErrorResponse('Database connection failed'))

      const result = await fetchMemoryById(mockSupabaseClient as any, 'test-id')
      
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching memory:', { message: 'Database connection failed', code: 'PGRST000' })
      
      consoleSpy.mockRestore()
    })

    it('should return transformed memory when found', async () => {
      const rawMemoryData = {
        id: 'test-id',
        content: 'Test memory',
        memory_date: '2024-01-01',
        url: 'https://example.com',
        created_at: '2024-01-01T00:00:00Z',
        memory_tag: []
      }

      const transformedMemory = {
        id: 'test-id',
        content: 'Test memory',
        memoryDate: '2024-01-01',
        url: 'https://example.com',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        tags: []
      }

      mockSupabaseClient.single.mockResolvedValue(createSuccessResponse(rawMemoryData))

      vi.mocked(transformRawMemoryData).mockReturnValue([transformedMemory])

      const result = await fetchMemoryById(mockSupabaseClient as any, 'test-id')
      
      expect(result).toEqual(transformedMemory)
      expect(transformRawMemoryData).toHaveBeenCalledWith([rawMemoryData])
    })
  })

  describe('updateMemoryFields', () => {
    it('should handle database update errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockSupabaseClient.single.mockResolvedValue(createErrorResponse('Update failed'))

      await expect(updateMemoryFields(mockSupabaseClient as any, 'test-id', {
        content: 'Updated content'
      })).rejects.toThrow('Failed to update memory')
      
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ content: 'Updated content' })
      expect(consoleSpy).toHaveBeenCalledWith('Error updating memory:', { message: 'Update failed', code: 'PGRST000' })
      
      consoleSpy.mockRestore()
    })

    it('should update memory fields successfully', async () => {
      const updates = {
        content: 'Updated content',
        memory_date: '2024-02-01',
        url: 'https://updated.com'
      }

      const updatedMemory = {
        id: 'test-id',
        content: 'Updated content',
        memoryDate: '2024-02-01',
        url: 'https://updated.com',
        createdAt: new Date(),
        tags: []
      }

      // Mock successful update, then successful fetch
      mockSupabaseClient.single
        .mockResolvedValueOnce(createSuccessResponse({ id: 'test-id' })) // for update
        .mockResolvedValueOnce(createSuccessResponse({ // for fetchMemoryById
          id: 'test-id',
          content: 'Updated content',
          memory_date: '2024-02-01',
          url: 'https://updated.com',
          created_at: '2024-01-01T00:00:00Z',
          memory_tag: []
        }))

      vi.mocked(transformRawMemoryData).mockReturnValue([updatedMemory])

      const result = await updateMemoryFields(mockSupabaseClient as any, 'test-id', updates)
      
      expect(result).toEqual(updatedMemory)
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updates)
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'test-id')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle malformed memory data gracefully', async () => {
      mockSupabaseClient.single.mockResolvedValue(createSuccessResponse({ id: 'test-id' })) // Missing required fields

      vi.mocked(transformRawMemoryData).mockReturnValue([])

      const result = await fetchMemoryById(mockSupabaseClient as any, 'test-id')
      
      expect(result).toBeNull()
    })

    it('should handle empty update object', async () => {
      // Mock successful update and fetch
      mockSupabaseClient.single
        .mockResolvedValueOnce(createSuccessResponse({ id: 'test-id' }))
        .mockResolvedValueOnce(createSuccessResponse({
          id: 'test-id',
          content: 'existing',
          memory_date: '2024-01-01',
          created_at: '2024-01-01T00:00:00Z',
          memory_tag: []
        }))

      vi.mocked(transformRawMemoryData).mockReturnValue([{
        id: 'test-id',
        content: 'existing',
        memoryDate: '2024-01-01',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        tags: []
      }])

      const result = await updateMemoryFields(mockSupabaseClient as any, 'test-id', {})
      
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({})
      expect(result).toBeDefined()
    })
  })
})