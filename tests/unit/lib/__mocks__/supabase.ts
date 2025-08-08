import { vi } from 'vitest'

/**
 * Simple Supabase client mock for unit tests
 * Follows maintenance-first philosophy - simple, predictable mocking
 */
export function createMockSupabaseClient() {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    // Add more methods as needed for specific tests
  }
}

/**
 * Helper to create successful Supabase response
 */
export function createSuccessResponse<T>(data: T) {
  return { data, error: null }
}

/**
 * Helper to create error Supabase response
 */
export function createErrorResponse(message: string, code?: string) {
  return { 
    data: null, 
    error: { 
      message, 
      code: code || 'PGRST000'
    } 
  }
}

/**
 * Example usage:
 * 
 * const mockClient = createMockSupabaseClient()
 * mockClient.single.mockResolvedValue(createSuccessResponse({ id: '123', content: 'test' }))
 * mockClient.single.mockResolvedValue(createErrorResponse('Not found'))
 */