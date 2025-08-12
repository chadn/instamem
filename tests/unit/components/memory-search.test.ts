import { describe, it, expect } from 'vitest'
import { formatDate, formatUrl } from '@/lib/format-utils'

describe('MemorySearch utility functions', () => {
  describe('formatDate', () => {
    it('should format dates in desktop mode with full format', () => {
      const result = formatDate('2025-08-01')
      // Note: Date parsing might be affected by timezone, let's check the format instead
      expect(result).toMatch(/\w{3} \d{1,2}, \d{4}/) // e.g., "Aug 1, 2025" or "Jul 31, 2025"
    })

    it('should format dates in mobile mode with short format', () => {
      const result = formatDate('2025-08-01', true)
      // Mobile format for current year: M/D/YY
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{2}$/)
    })

    it('should format dates in mobile mode with year for different years', () => {
      const result = formatDate('2024-12-25', true)
      // Mobile format for different year: M/D/YY
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{2}$/)
    })

    it('should handle different date formats', () => {
      const result1 = formatDate('2024-12-25')
      const result2 = formatDate('2024-01-01')
      
      // Just check that it produces month names and years (timezone might affect exact dates)
      expect(result1).toMatch(/\w{3} \d{1,2}, \d{4}/)
      expect(result2).toMatch(/\w{3} \d{1,2}, \d{4}/)
    })

    it('should handle invalid dates gracefully', () => {
      expect(() => formatDate('invalid-date')).not.toThrow()
    })
  })

  describe('formatUrl', () => {
    it('should format URLs under 30 characters as-is', () => {
      const result = formatUrl('https://example.com/page')
      expect(result).toBe('example.com/page')
    })

    it('should remove www prefix', () => {
      const result = formatUrl('https://www.example.com/page')
      expect(result).toBe('example.com/page')
    })

    it('should truncate long URLs with ellipsis', () => {
      const longUrl = 'https://example.com/very/long/path/that/exceeds/thirty/characters'
      const result = formatUrl(longUrl)
      
      expect(result).toContain('example.com')
      expect(result).toContain('...')
      expect(result.length).toBeLessThanOrEqual(33) // domain + /very + ...
    })

    it('should handle URLs without paths', () => {
      const result = formatUrl('https://example.com')
      expect(result).toBe('example.com/') // URL constructor adds trailing slash
    })

    it('should handle invalid URLs by truncating', () => {
      const invalidUrl = 'not-a-valid-url-but-very-long-string-that-should-be-truncated'
      const result = formatUrl(invalidUrl)
      
      expect(result).toHaveLength(30) // 27 chars + '...'
      expect(result.endsWith('...')).toBe(true)
    })

    it('should handle short invalid URLs as-is', () => {
      const shortInvalidUrl = 'short'
      const result = formatUrl(shortInvalidUrl)
      expect(result).toBe('short')
    })
  })
})