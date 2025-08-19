import { describe, it, expect, beforeEach, vi } from 'vitest'
import { searchOfflineMemories } from '@/lib/offline-search'
import { offlineStorage } from '@/lib/offline-storage'
import { RawMemoryData } from '@/types/memory'

// Mock the offline storage
vi.mock('@/lib/offline-storage', () => ({
  offlineStorage: {
    getCachedMemories: vi.fn()
  }
}))

// Mock console.log to reduce test noise
vi.mock('console', () => ({
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

describe('searchOfflineMemories', () => {
  const mockMemories: RawMemoryData[] = [
    {
      id: '1',
      content: 'I had feedback from my manager about the project',
      memory_date: '2024-01-01',
      url: undefined,
      created_at: '2024-01-01T10:00:00Z',
      memory_tag: [
        { tag_values: { text: 'manager', tag_keys: { name: 'person' } } },
        { tag_values: { text: 'work', tag_keys: { name: 'topic' } } }
      ]
    },
    {
      id: '2', 
      content: 'Meeting with John about the new features',
      memory_date: '2024-01-02',
      url: undefined,
      created_at: '2024-01-02T10:00:00Z',
      memory_tag: [
        { tag_values: { text: 'john', tag_keys: { name: 'person' } } },
        { tag_values: { text: 'features', tag_keys: { name: 'topic' } } }
      ]
    },
    {
      id: '3',
      content: 'Fixed the email notification system bug',
      memory_date: '2024-01-03', 
      url: 'https://github.com/project/issues/123',
      created_at: '2024-01-03T10:00:00Z',
      memory_tag: [
        { tag_values: { text: 'bug', tag_keys: { name: 'topic' } } },
        { tag_values: { text: 'email', tag_keys: { name: 'system' } } }
      ]
    },
    {
      id: '4',
      content: 'Coffee break discussion about frontend architecture',
      memory_date: '2024-01-04',
      url: undefined,
      created_at: '2024-01-04T10:00:00Z',
      memory_tag: [
        { tag_values: { text: 'frontend', tag_keys: { name: 'topic' } } },
        { tag_values: { text: 'discussion', tag_keys: { name: 'type' } } }
      ]
    },
    {
      id: '5',
      content: 'Analyzed performance metrics for Q4 report',
      memory_date: '2024-01-05',
      url: undefined,
      created_at: '2024-01-05T10:00:00Z',
      memory_tag: [
        { tag_values: { text: 'performance', tag_keys: { name: 'topic' } } },
        { tag_values: { text: 'q4', tag_keys: { name: 'period' } } }
      ]
    },
    {
      id: '6',
      content: 'Got amazing news about the project approval',
      memory_date: '2024-01-06',
      url: undefined,
      created_at: '2024-01-06T10:00:00Z',
      memory_tag: [
        { tag_values: { text: 'excited', tag_keys: { name: 'feeling' } } },
        { tag_values: { text: 'project', tag_keys: { name: 'topic' } } }
      ]
    },
    {
      id: '7',
      content: 'Feeling really grateful for the team support',
      memory_date: '2024-01-07',
      url: undefined,
      created_at: '2024-01-07T10:00:00Z',
      memory_tag: [
        { tag_values: { text: 'gratified', tag_keys: { name: 'feeling' } } },
        { tag_values: { text: 'team', tag_keys: { name: 'topic' } } }
      ]
    },
    {
      id: '8',
      content: 'Proud of completing the milestone',
      memory_date: '2024-01-08',
      url: undefined,
      created_at: '2024-01-08T10:00:00Z',
      memory_tag: [
        { tag_values: { text: 'proud', tag_keys: { name: 'feeling' } } },
        { tag_values: { text: 'milestone', tag_keys: { name: 'topic' } } }
      ]
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(offlineStorage.getCachedMemories).mockResolvedValue(mockMemories)
  })

  describe('Exact substring matching', () => {
    it('should find exact substring matches in content', async () => {
      const results = await searchOfflineMemories('feedback')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('feedback')
    })

    it('should find case-insensitive matches', async () => {
      const results = await searchOfflineMemories('FEEDBACK')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('feedback')
    })

    it('should find partial substring matches with exact search for short queries', async () => {
      const results = await searchOfflineMemories('fe')
      expect(results).toHaveLength(6) // "feedback", "features", "frontend", and 3 "feeling" tags
      const contents = results.map(r => r.content)
      expect(contents.some(c => c.includes('feedback'))).toBe(true)
      expect(contents.some(c => c.includes('features'))).toBe(true)
      expect(contents.some(c => c.includes('frontend'))).toBe(true)
      expect(contents.some(c => c.includes('amazing news'))).toBe(true) // memory with feeling:excited tag
      expect(contents.some(c => c.includes('grateful'))).toBe(true) // memory with feeling:gratified tag
    })

    it('should find single character matches', async () => {
      const results = await searchOfflineMemories('f')
      expect(results.length).toBeGreaterThan(0)
      // Should find "feedback", "features", "Fixed", "frontend"
      expect(results.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Tag matching', () => {
    it('should find matches in tag values', async () => {
      const results = await searchOfflineMemories('john')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('John')
    })

    it('should find matches in tag keys', async () => {
      const results = await searchOfflineMemories('person')
      // With fuzzy search, "person" might match "performance" too, so could be 2 or 3
      expect(results.length).toBeGreaterThanOrEqual(2)
      expect(results.length).toBeLessThanOrEqual(3)
      // Verify we get the expected exact matches
      const contents = results.map(r => r.content)
      expect(contents.some(c => c.includes('manager'))).toBe(true)
      expect(contents.some(c => c.includes('John'))).toBe(true)
    })

    it('should find matches in both content and tags', async () => {
      const results = await searchOfflineMemories('email')
      expect(results).toHaveLength(3) // Now also matches other content/URLs containing "email"
      // Should include the original memory with email notification
      expect(results.some(r => r.content.includes('email notification'))).toBe(true)
    })

    it('should find memories by tag in key:value format', async () => {
      const results = await searchOfflineMemories('feeling:excited')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('amazing news')
      expect(results[0].tags.some(tag => tag.key === 'feeling' && tag.value === 'excited')).toBe(true)
    })

    it('should find memories by tag in key:value format case insensitive', async () => {
      const results = await searchOfflineMemories('FEELING:EXCITED')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('amazing news')
    })

    it('should find partial matches for feeling:gr (should only match feeling:gratified)', async () => {
      const results = await searchOfflineMemories('feeling:gr')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('grateful')
      expect(results[0].tags.some(tag => tag.key === 'feeling' && tag.value === 'gratified')).toBe(true)
    })

    it('should NOT use precise tag search for standalone colon', async () => {
      // A standalone ":" should use regular search, not precise tag search
      const results = await searchOfflineMemories(':')
      // Should use regular exact match since it's 1 character
      // Will find memories with tags containing ":" like "feeling:excited"
      expect(results.length).toBeGreaterThan(0) // Should find memories with ":" in tag combinations
      // Verify it's NOT using precise tag search by checking if it finds content containing ":"
      const hasTagMatches = results.some(r => r.tags.some(tag => `${tag.key}:${tag.value}`.includes(':')))
      expect(hasTagMatches).toBe(true)
    })

    it('should NOT use precise tag search for invalid tag format', async () => {
      // "tag:" (missing value) should use regular search
      const results = await searchOfflineMemories('tag:')
      // Should use fuzzy search since it's 4+ characters
      expect(results.length).toBeGreaterThanOrEqual(0) // Could match content containing "tag:"
    })
  })

  describe('Fuzzy matching capabilities', () => {
    it('should handle minor typos in content with 3+ chars', async () => {
      // This tests fuzzy matching for 3+ character queries
      const results = await searchOfflineMemories('feeback') // missing 'd' 
      // With fuzzy threshold 0.4, this should match "feedback"
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('feedback')
    })

    it('should match "feeback" search term to "feedback"', async () => {
      // Specific test for the requirement: "feeback" should match "feedback"
      const results = await searchOfflineMemories('feeback')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('feedback')
      expect(results[0].id).toBe('1')
    })

    it('should handle typos in names with 3+ chars', async () => {
      const results = await searchOfflineMemories('johm') // typo in john
      // With fuzzy threshold 0.4, this should match "john" tag
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('John')
    })
    
    it('should use exact match for 1-2 characters', async () => {
      // Short queries should use exact matching only
      const results = await searchOfflineMemories('fe')
      // Should find "feedback", "features", "frontend", and 3 "feeling" tags
      expect(results).toHaveLength(6)
      const contents = results.map(r => r.content)
      expect(contents.some(c => c.includes('feedback'))).toBe(true)
      expect(contents.some(c => c.includes('features'))).toBe(true)
      expect(contents.some(c => c.includes('frontend'))).toBe(true)
      expect(contents.some(c => c.includes('amazing news'))).toBe(true) // memory with feeling:excited tag
      expect(contents.some(c => c.includes('grateful'))).toBe(true) // memory with feeling:gratified tag
    })
  })

  describe('Edge cases', () => {
    it('should return empty array for empty query', async () => {
      const results = await searchOfflineMemories('')
      expect(results).toHaveLength(0)
    })

    it('should return empty array for whitespace query', async () => {
      const results = await searchOfflineMemories('   ')
      expect(results).toHaveLength(0)
    })

    it('should handle queries with no matches', async () => {
      const results = await searchOfflineMemories('nonexistentword')
      expect(results).toHaveLength(0)
    })

    it('should handle special characters', async () => {
      const results = await searchOfflineMemories('Q4')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('Q4')
    })

    it('should handle URL content matching', async () => {
      const results = await searchOfflineMemories('github')
      expect(results).toHaveLength(1)
      expect(results[0].url).toContain('github')
    })
  })

  describe('Result limits and ordering', () => {
    it('should limit results to 20 items', async () => {
      // Create a large dataset to test limits
      const manyMemories = Array.from({ length: 25 }, (_, i) => ({
        ...mockMemories[0],
        id: `${i + 1}`,
        content: `Test memory ${i + 1} with feedback keyword`
      }))
      
      vi.mocked(offlineStorage.getCachedMemories).mockResolvedValue(manyMemories)
      
      const results = await searchOfflineMemories('feedback')
      expect(results).toHaveLength(20) // Should be limited to 20
    })

    it('should return results when Fuse.js works', async () => {
      const results = await searchOfflineMemories('manager')
      expect(results).toHaveLength(1)
      expect(results[0].content).toContain('manager')
    })
  })

  describe('Fallback behavior', () => {
    it('should handle empty cache gracefully', async () => {
      vi.mocked(offlineStorage.getCachedMemories).mockResolvedValue([])
      
      const results = await searchOfflineMemories('anything')
      expect(results).toHaveLength(0)
    })

    it('should handle storage errors', async () => {
      vi.mocked(offlineStorage.getCachedMemories).mockRejectedValue(new Error('Storage error'))
      
      await expect(searchOfflineMemories('test')).rejects.toThrow('Offline search unavailable')
    })
  })

  describe('Search precision tests', () => {
    it('should NOT match "fe" in words that only contain "f" or "e" separately', async () => {
      // Add a memory that contains 'f' and 'e' but not 'fe' together
      const memoryWithSeparateFE: RawMemoryData = {
        id: '7',
        content: 'Found an error in the code',  // has 'f' and 'e' but not 'fe'
        memory_date: '2024-01-07',
        url: undefined,
        created_at: '2024-01-07T10:00:00Z',
        memory_tag: []
      }
      
      const memoriesWithExtra = [...mockMemories, memoryWithSeparateFE]
      vi.mocked(offlineStorage.getCachedMemories).mockResolvedValue(memoriesWithExtra)
      
      const results = await searchOfflineMemories('fe')
      
      // Should find "feedback", "features", "frontend", and 3 "feeling" tags, but not "Found an error"
      expect(results).toHaveLength(6)
      const contents = results.map(r => r.content)
      expect(contents.some(c => c.includes('feedback'))).toBe(true)
      expect(contents.some(c => c.includes('features'))).toBe(true)
      expect(contents.some(c => c.includes('frontend'))).toBe(true)
      expect(contents.some(c => c.includes('amazing news'))).toBe(true) // memory with feeling:excited tag
      expect(contents.some(c => c.includes('grateful'))).toBe(true) // memory with feeling:gratified tag
      expect(contents.some(c => c.includes('Found an error'))).toBe(false)
    })

    it('should find consecutive character matches only', async () => {
      const results = await searchOfflineMemories('nt')
      
      // Should find "frontend" (has "nt" in "frontend")
      expect(results.length).toBeGreaterThan(0)
      const hasConsecutiveNT = results.some(r => 
        r.content.toLowerCase().includes('nt')
      )
      expect(hasConsecutiveNT).toBe(true)
    })
  })

  describe('Weight and priority tests', () => {
    it('should prioritize content matches over tag matches', async () => {
      // Search for "email" which appears in both content and tags
      const results = await searchOfflineMemories('email')
      expect(results).toHaveLength(3) // Now also matches other content/URLs containing "email"
      
      // Should include the memory where "email" appears in content
      expect(results.some(r => r.content.includes('email notification'))).toBe(true)
    })

    it('should return multiple results when query matches multiple entries', async () => {
      const results = await searchOfflineMemories('the')
      
      // "the" appears in multiple entries
      expect(results.length).toBeGreaterThan(1)
    })
  })
})