/**
 * Search utilities for InstaMem
 * Functions for query sanitization, network detection, and offline search
 */

/**
 * Sanitizes search queries to prevent XSS and normalize input
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/(script|alert|eval|javascript|onerror|onload)/gi, '') // Remove dangerous keywords
    .replace(/[<>"'&()]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 100) // Limit length
}

/**
 * Detects if the user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}

/**
 * Simple offline search through memory data
 */
export function searchOffline(memories: Array<{
  id?: string
  content?: string
  tags?: Array<{ key?: string; value?: string }>
}>, query: string) {
  if (!query.trim()) return memories
  
  const lowerQuery = query.toLowerCase()
  return memories.filter(memory => 
    memory.content?.toLowerCase().includes(lowerQuery) ||
    memory.tags?.some((tag) => 
      tag.key?.toLowerCase().includes(lowerQuery) ||
      tag.value?.toLowerCase().includes(lowerQuery)
    )
  )
}

/**
 * Simple text highlighting for testing (non-React version)
 */
export function highlightPartialMatches(text: string, query: string): string {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}