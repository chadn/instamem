/**
 * Validation utilities for InstaMem forms and user input
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Validates memory content
 */
export function validateMemoryContent(content: string): ValidationResult {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Memory content is required' }
  }
  
  if (content.length > 10000) {
    return { isValid: false, error: 'Memory content must be less than 10,000 characters' }
  }
  
  return { isValid: true }
}

/**
 * Validates URL format (optional field)
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: true } // URL is optional
  }
  
  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' }
  }
}

/**
 * Validates memory date
 */
export function validateMemoryDate(dateString: string): ValidationResult {
  if (!dateString || dateString.trim().length === 0) {
    return { isValid: false, error: 'Memory date is required' }
  }
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' }
  }
  
  const now = new Date()
  if (date > now) {
    return { isValid: false, error: 'Memory date cannot be in the future' }
  }
  
  // Check if date is too far in the past (100 years)
  const hundredYearsAgo = new Date()
  hundredYearsAgo.setFullYear(now.getFullYear() - 100)
  if (date < hundredYearsAgo) {
    return { isValid: false, error: 'Memory date cannot be more than 100 years ago' }
  }
  
  return { isValid: true }
}

/**
 * Validates tags array
 */
export function validateTags(tags: Array<{key: string, value: string}>): ValidationResult {
  if (!Array.isArray(tags)) {
    return { isValid: false, error: 'Tags must be an array' }
  }
  
  if (tags.length > 20) {
    return { isValid: false, error: 'Maximum 20 tags allowed' }
  }
  
  for (const tag of tags) {
    if (!tag.key || tag.key.trim().length === 0) {
      return { isValid: false, error: 'All tags must have a key' }
    }
    
    if (!tag.value || tag.value.trim().length === 0) {
      return { isValid: false, error: 'All tags must have a value' }
    }
    
    if (tag.key.length > 50) {
      return { isValid: false, error: 'Tag keys must be less than 50 characters' }
    }
    
    if (tag.value.length > 100) {
      return { isValid: false, error: 'Tag values must be less than 100 characters' }
    }
  }
  
  return { isValid: true }
}

/**
 * Validates a complete memory form
 */
export function validateMemoryForm(data: {
  content: string
  memoryDate: string
  url?: string
  tags?: Array<{key: string, value: string}>
}): FormValidationResult {
  const errors: Record<string, string> = {}
  
  const contentValidation = validateMemoryContent(data.content)
  if (!contentValidation.isValid) {
    errors.content = contentValidation.error!
  }
  
  const dateValidation = validateMemoryDate(data.memoryDate)
  if (!dateValidation.isValid) {
    errors.memoryDate = dateValidation.error!
  }
  
  if (data.url) {
    const urlValidation = validateUrl(data.url)
    if (!urlValidation.isValid) {
      errors.url = urlValidation.error!
    }
  }
  
  if (data.tags && data.tags.length > 0) {
    const tagsValidation = validateTags(data.tags)
    if (!tagsValidation.isValid) {
      errors.tags = tagsValidation.error!
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}