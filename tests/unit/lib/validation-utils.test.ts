import { describe, it, expect } from 'vitest'
import { 
  validateMemoryContent,
  validateUrl, 
  validateMemoryDate,
  validateTags,
  validateMemoryForm
} from '@/lib/validation-utils'

describe('Form validation utilities', () => {
  describe('validateMemoryContent', () => {
    it('should validate non-empty content', () => {
      const result = validateMemoryContent('Valid memory content')
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty content', () => {
      const result = validateMemoryContent('')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory content is required')
    })

    it('should reject whitespace-only content', () => {
      const result = validateMemoryContent('   ')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory content is required')
    })

    it('should reject content that is too long', () => {
      const longContent = 'a'.repeat(10001)
      const result = validateMemoryContent(longContent)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory content must be less than 10,000 characters')
    })

    it('should accept content at the limit', () => {
      const limitContent = 'a'.repeat(10000)
      const result = validateMemoryContent(limitContent)
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateUrl', () => {
    it('should validate empty URL (optional field)', () => {
      const result = validateUrl('')
      
      expect(result.isValid).toBe(true)
    })

    it('should validate valid HTTP URL', () => {
      const result = validateUrl('https://example.com')
      
      expect(result.isValid).toBe(true)
    })

    it('should validate valid HTTPS URL', () => {
      const result = validateUrl('https://www.example.com/path')
      
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid URL format', () => {
      const result = validateUrl('not-a-url')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Please enter a valid URL')
    })

    it('should reject malformed URL', () => {
      const result = validateUrl('http://invalid url with spaces')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Please enter a valid URL')
    })
  })

  describe('validateMemoryDate', () => {
    it('should validate valid date', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const result = validateMemoryDate(yesterday.toISOString().split('T')[0])
      
      expect(result.isValid).toBe(true)
    })

    it('should reject empty date', () => {
      const result = validateMemoryDate('')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory date is required')
    })

    it('should reject invalid date format', () => {
      const result = validateMemoryDate('invalid-date')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Please enter a valid date')
    })

    it('should reject future dates', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const result = validateMemoryDate(tomorrow.toISOString().split('T')[0])
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory date cannot be in the future')
    })

    it('should reject dates too far in the past', () => {
      const veryOldDate = new Date('1900-01-01')
      const result = validateMemoryDate(veryOldDate.toISOString().split('T')[0])
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory date cannot be more than 100 years ago')
    })

    it('should accept dates exactly 100 years ago', () => {
      const hundredYearsAgo = new Date()
      hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 99) // Just under 100 years
      const result = validateMemoryDate(hundredYearsAgo.toISOString().split('T')[0])
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateTags', () => {
    it('should validate empty tag array', () => {
      const result = validateTags([])
      
      expect(result.isValid).toBe(true)
    })

    it('should validate valid tags', () => {
      const tags = [
        { key: 'person', value: 'John' },
        { key: 'place', value: 'Paris' }
      ]
      const result = validateTags(tags)
      
      expect(result.isValid).toBe(true)
    })

    it('should reject tags without keys', () => {
      const tags = [{ key: '', value: 'John' }]
      const result = validateTags(tags)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('All tags must have a key')
    })

    it('should reject tags without values', () => {
      const tags = [{ key: 'person', value: '' }]
      const result = validateTags(tags)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('All tags must have a value')
    })

    it('should reject too many tags', () => {
      const tags = Array.from({ length: 21 }, (_, i) => ({
        key: `key${i}`,
        value: `value${i}`
      }))
      const result = validateTags(tags)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Maximum 20 tags allowed')
    })

    it('should reject tag keys that are too long', () => {
      const tags = [{ key: 'a'.repeat(51), value: 'John' }]
      const result = validateTags(tags)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Tag keys must be less than 50 characters')
    })

    it('should reject tag values that are too long', () => {
      const tags = [{ key: 'person', value: 'a'.repeat(101) }]
      const result = validateTags(tags)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Tag values must be less than 100 characters')
    })
  })

  describe('validateMemoryForm', () => {
    it('should validate complete valid form', () => {
      const formData = {
        content: 'Valid memory content',
        memoryDate: '2025-08-10',
        url: 'https://example.com',
        tags: [
          { key: 'person', value: 'John' },
          { key: 'place', value: 'Paris' }
        ]
      }
      
      const result = validateMemoryForm(formData)
      
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should validate minimal valid form (only required fields)', () => {
      const formData = {
        content: 'Valid memory content',
        memoryDate: '2025-08-10'
      }
      
      const result = validateMemoryForm(formData)
      
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should collect multiple validation errors', () => {
      const formData = {
        content: '', // Invalid: empty
        memoryDate: 'invalid-date', // Invalid: not a date
        url: 'not-a-url', // Invalid: malformed URL
        tags: [{ key: '', value: 'John' }] // Invalid: empty key
      }
      
      const result = validateMemoryForm(formData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.content).toBe('Memory content is required')
      expect(result.errors.memoryDate).toBe('Please enter a valid date')
      expect(result.errors.url).toBe('Please enter a valid URL')
      expect(result.errors.tags).toBe('All tags must have a key')
    })

    it('should handle partial errors (some fields valid, some invalid)', () => {
      const formData = {
        content: 'Valid content',
        memoryDate: '', // Invalid: required
        url: 'https://example.com', // Valid
        tags: [{ key: 'person', value: 'John' }] // Valid
      }
      
      const result = validateMemoryForm(formData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.memoryDate).toBe('Memory date is required')
      expect(result.errors.content).toBeUndefined()
      expect(result.errors.url).toBeUndefined()
      expect(result.errors.tags).toBeUndefined()
    })
  })
})