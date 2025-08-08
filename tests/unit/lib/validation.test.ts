import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  validateMemoryContent,
  validateUrl,
  validateMemoryDate,
  validateTags,
  validateMemoryForm,
  ValidationResult,
  FormValidationResult
} from '@/lib/validation-utils'

describe('Validation Utils', () => {
  describe('validateMemoryContent', () => {
    it('should reject empty content', () => {
      const result = validateMemoryContent('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory content is required')
    })

    it('should reject whitespace-only content', () => {
      const result = validateMemoryContent('   \n\t  ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory content is required')
    })

    it('should reject content over 10,000 characters', () => {
      const longContent = 'x'.repeat(10001)
      const result = validateMemoryContent(longContent)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory content must be less than 10,000 characters')
    })

    it('should accept valid content', () => {
      const result = validateMemoryContent('This is a valid memory content')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept content at the 10,000 character limit', () => {
      const maxContent = 'x'.repeat(10000)
      const result = validateMemoryContent(maxContent)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('validateUrl', () => {
    it('should accept empty URL (optional field)', () => {
      const result = validateUrl('')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept whitespace-only URL', () => {
      const result = validateUrl('   ')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://www.google.com/search?q=test',
        'ftp://files.example.com/file.txt'
      ]

      validUrls.forEach(url => {
        const result = validateUrl(url)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'http://',
        'just-text',
        'www.example.com' // missing protocol
      ]

      invalidUrls.forEach(url => {
        const result = validateUrl(url)
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Please enter a valid URL')
      })
    })
  })

  describe('validateMemoryDate', () => {
    beforeEach(() => {
      // Mock current date to be consistent
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should reject empty date', () => {
      const result = validateMemoryDate('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory date is required')
    })

    it('should reject whitespace-only date', () => {
      const result = validateMemoryDate('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory date is required')
    })

    it('should reject invalid date formats', () => {
      const invalidDates = [
        'not-a-date',
        '2024-13-01', // invalid month
        '2024-01-32' // invalid day
        // Note: JavaScript Date is forgiving with formats like '2024/01/01'
      ]

      invalidDates.forEach(date => {
        const result = validateMemoryDate(date)
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Please enter a valid date')
      })
    })

    it('should reject future dates', () => {
      const futureDate = '2024-01-16' // tomorrow
      const result = validateMemoryDate(futureDate)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory date cannot be in the future')
    })

    it('should reject dates over 100 years ago', () => {
      const tooOldDate = '1923-01-01' // > 100 years ago
      const result = validateMemoryDate(tooOldDate)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Memory date cannot be more than 100 years ago')
    })

    it('should accept valid dates', () => {
      const validDates = [
        '2024-01-15', // today
        '2024-01-14', // yesterday
        '2023-12-31', // last year
        '1924-01-16'  // exactly 100 years ago
      ]

      validDates.forEach(date => {
        const result = validateMemoryDate(date)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('validateTags', () => {
    it('should reject non-array input', () => {
      const result = validateTags('not-an-array' as any)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Tags must be an array')
    })

    it('should reject more than 20 tags', () => {
      const tooManyTags = Array.from({ length: 21 }, (_, i) => ({
        key: 'key',
        value: `value${i}`
      }))
      
      const result = validateTags(tooManyTags)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Maximum 20 tags allowed')
    })

    it('should reject tags with empty keys', () => {
      const tagsWithEmptyKey = [
        { key: '', value: 'value1' },
        { key: 'key2', value: 'value2' }
      ]
      
      const result = validateTags(tagsWithEmptyKey)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('All tags must have a key')
    })

    it('should reject tags with empty values', () => {
      const tagsWithEmptyValue = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: '' }
      ]
      
      const result = validateTags(tagsWithEmptyValue)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('All tags must have a value')
    })

    it('should reject tags with keys over 50 characters', () => {
      const tagsWithLongKey = [
        { key: 'x'.repeat(51), value: 'value' }
      ]
      
      const result = validateTags(tagsWithLongKey)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Tag keys must be less than 50 characters')
    })

    it('should reject tags with values over 100 characters', () => {
      const tagsWithLongValue = [
        { key: 'key', value: 'x'.repeat(101) }
      ]
      
      const result = validateTags(tagsWithLongValue)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Tag values must be less than 100 characters')
    })

    it('should accept valid tags', () => {
      const validTags = [
        { key: 'person', value: 'John Doe' },
        { key: 'location', value: 'New York' },
        { key: 'mood', value: 'happy' }
      ]
      
      const result = validateTags(validTags)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept empty tags array', () => {
      const result = validateTags([])
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('validateMemoryForm', () => {
    const validFormData = {
      content: 'Valid memory content',
      memoryDate: '2024-01-01',
      url: 'https://example.com',
      tags: [{ key: 'person', value: 'John' }]
    }

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return valid for complete valid form', () => {
      const result = validateMemoryForm(validFormData)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should collect multiple validation errors', () => {
      const invalidFormData = {
        content: '', // invalid
        memoryDate: 'not-a-date', // invalid
        url: 'invalid-url', // invalid
        tags: [{ key: '', value: 'value' }] // invalid
      }

      const result = validateMemoryForm(invalidFormData)
      expect(result.isValid).toBe(false)
      expect(result.errors.content).toBe('Memory content is required')
      expect(result.errors.memoryDate).toBe('Please enter a valid date')
      expect(result.errors.url).toBe('Please enter a valid URL')
      expect(result.errors.tags).toBe('All tags must have a key')
    })

    it('should handle optional fields correctly', () => {
      const minimalFormData = {
        content: 'Valid memory content',
        memoryDate: '2024-01-01'
        // url and tags are optional
      }

      const result = validateMemoryForm(minimalFormData)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should skip URL validation when URL is not provided', () => {
      const formDataWithoutUrl = {
        content: 'Valid memory content',
        memoryDate: '2024-01-01'
      }

      const result = validateMemoryForm(formDataWithoutUrl)
      expect(result.isValid).toBe(true)
      expect(result.errors.url).toBeUndefined()
    })

    it('should skip tags validation when no tags provided', () => {
      const formDataWithoutTags = {
        content: 'Valid memory content',
        memoryDate: '2024-01-01'
      }

      const result = validateMemoryForm(formDataWithoutTags)
      expect(result.isValid).toBe(true)
      expect(result.errors.tags).toBeUndefined()
    })
  })
})