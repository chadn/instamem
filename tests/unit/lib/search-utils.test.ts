import { describe, it, expect } from 'vitest'
import { sanitizeSearchQuery, isOnline, searchOffline, highlightPartialMatches } from '@/lib/search-utils'

describe('Search utilities', () => {
  describe('sanitizeSearchQuery', () => {
    it('should remove HTML tags from search query', () => {
      const maliciousQuery = '<script>alert("xss")</script>search term'
      const result = sanitizeSearchQuery(maliciousQuery)
      
      expect(result).toBe('xsssearch term') // XSS string remains, but dangerous elements removed
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
      expect(result).not.toContain('alert')
    })

    it('should remove dangerous characters', () => {
      const dangerousQuery = 'search"term&<>with\'quotes'
      const result = sanitizeSearchQuery(dangerousQuery)
      
      expect(result).toBe('searchtermwithquotes')
      expect(result).not.toMatch(/[<>"'&()]/)
    })

    it('should trim whitespace', () => {
      const query = '   search term   '
      const result = sanitizeSearchQuery(query)
      
      expect(result).toBe('search term')
    })

    it('should limit query length', () => {
      const longQuery = 'a'.repeat(150)
      const result = sanitizeSearchQuery(longQuery)
      
      expect(result.length).toBe(100)
    })

    it('should handle empty strings', () => {
      expect(sanitizeSearchQuery('')).toBe('')
      expect(sanitizeSearchQuery('   ')).toBe('')
    })
  })

  describe('highlightPartialMatches', () => {
    it('should highlight exact matches', () => {
      const text = 'This is a test memory about cats'
      const query = 'test'
      const result = highlightPartialMatches(text, query)
      
      expect(result).toBe('This is a <mark>test</mark> memory about cats')
    })

    it('should highlight case-insensitive matches', () => {
      const text = 'This is a TEST memory about cats'
      const query = 'test'
      const result = highlightPartialMatches(text, query)
      
      expect(result).toBe('This is a <mark>TEST</mark> memory about cats')
    })

    it('should highlight multiple matches', () => {
      const text = 'Test this test string with test words'
      const query = 'test'
      const result = highlightPartialMatches(text, query)
      
      expect(result).toBe('<mark>Test</mark> this <mark>test</mark> string with <mark>test</mark> words')
    })

    it('should escape regex special characters', () => {
      const text = 'Search for *.js files'
      const query = '*.js'
      const result = highlightPartialMatches(text, query)
      
      expect(result).toBe('Search for <mark>*.js</mark> files')
    })

    it('should handle empty query', () => {
      const text = 'This is test text'
      const result = highlightPartialMatches(text, '')
      
      expect(result).toBe('This is test text')
    })

    it('should handle query with only whitespace', () => {
      const text = 'This is test text'
      const result = highlightPartialMatches(text, '   ')
      
      expect(result).toBe('This is test text')
    })
  })

  describe('network status detection', () => {
    it('should detect online status', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })
      
      expect(isOnline()).toBe(true)
    })

    it('should detect offline status', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })
      
      expect(isOnline()).toBe(false)
    })

    it('should handle missing navigator', () => {
      const originalNavigator = global.navigator
      // @ts-ignore
      delete global.navigator
      
      expect(isOnline()).toBe(false)
      
      global.navigator = originalNavigator
    })
  })

  describe('offline search', () => {
    const mockMemories = [
      {
        id: '1',
        content: 'Trip to Paris with friends',
        tags: [
          { key: 'place', value: 'Paris' },
          { key: 'person', value: 'John' }
        ]
      },
      {
        id: '2', 
        content: 'Meeting at work about project',
        tags: [
          { key: 'place', value: 'Office' },
          { key: 'topic', value: 'Project Alpha' }
        ]
      },
      {
        id: '3',
        content: 'Dinner with family at restaurant',
        tags: [
          { key: 'person', value: 'Mom' },
          { key: 'place', value: 'Restaurant' }
        ]
      }
    ]

    it('should search by content', () => {
      const result = searchOffline(mockMemories, 'Paris')
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should search by tag key', () => {
      const result = searchOffline(mockMemories, 'person')
      
      expect(result).toHaveLength(2)
      expect(result.map(r => r.id)).toEqual(['1', '3'])
    })

    it('should search by tag value', () => {
      const result = searchOffline(mockMemories, 'John')
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should be case insensitive', () => {
      const result = searchOffline(mockMemories, 'PARIS')
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should return all memories for empty query', () => {
      const result = searchOffline(mockMemories, '')
      
      expect(result).toHaveLength(3)
    })

    it('should return no results for non-matching query', () => {
      const result = searchOffline(mockMemories, 'nonexistent')
      
      expect(result).toHaveLength(0)
    })

    it('should handle partial matches', () => {
      const result = searchOffline(mockMemories, 'work')
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })
})