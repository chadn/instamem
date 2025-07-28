import React from 'react'

interface HighlightOptions {
  caseSensitive?: boolean
  highlightClassName?: string
}

/**
 * Highlights partial matches in text, similar to Algolia's search highlighting.
 * If searching "exc", it will highlight the "exc" part in "excited".
 * 
 * @param text - The text to search within
 * @param searchQuery - The search term to highlight
 * @param options - Configuration options
 * @returns React nodes with highlighted matches
 */
export function highlightPartialMatches(
  text: string,
  searchQuery: string,
  options: HighlightOptions = {}
): React.ReactNode {
  const { 
    caseSensitive = false, 
    highlightClassName = 'bg-blue-100 text-blue-900 px-1 rounded font-medium' 
  } = options
  
  if (!searchQuery.trim() || !text) return text
  
  const query = caseSensitive ? searchQuery : searchQuery.toLowerCase()
  const searchText = caseSensitive ? text : text.toLowerCase()
  
  // Find all partial matches
  const matches: Array<{ start: number; end: number }> = []
  let searchIndex = 0
  
  // Look for consecutive character matches
  for (let i = 0; i < searchText.length && searchIndex < query.length; i++) {
    if (searchText[i] === query[searchIndex]) {
      const matchStart = i
      let matchEnd = i
      let tempSearchIndex = searchIndex
      
      // Extend the match as far as possible
      while (
        matchEnd < searchText.length && 
        tempSearchIndex < query.length && 
        searchText[matchEnd] === query[tempSearchIndex]
      ) {
        matchEnd++
        tempSearchIndex++
      }
      
      // Only record matches of at least 1 character
      if (matchEnd > matchStart) {
        matches.push({ start: matchStart, end: matchEnd })
        searchIndex = tempSearchIndex
        i = matchEnd - 1 // -1 because loop will increment
      }
    }
  }
  
  // If no matches found, return original text
  if (matches.length === 0) return text
  
  // Build the result with highlighted segments
  const result: React.ReactNode[] = []
  let lastIndex = 0
  
  matches.forEach((match, index) => {
    // Add text before the match
    if (match.start > lastIndex) {
      result.push(text.slice(lastIndex, match.start))
    }
    
    // Add highlighted match
    result.push(
      React.createElement(
        'mark',
        { 
          key: `highlight-${index}`, 
          className: highlightClassName 
        },
        text.slice(match.start, match.end)
      )
    )
    
    lastIndex = match.end
  })
  
  // Add remaining text after last match
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }
  
  return result
}

/**
 * Simple exact match highlighting for cases where you want full word matches
 */
export function highlightExactMatches(
  text: string,
  searchQuery: string,
  options: HighlightOptions = {}
): React.ReactNode {
  const { 
    caseSensitive = false, 
    highlightClassName = 'bg-yellow-200 text-yellow-900 px-1 rounded' 
  } = options
  
  if (!searchQuery.trim() || !text) return text
  
  const flags = caseSensitive ? 'g' : 'gi'
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, flags)
  
  const parts = text.split(regex)
  
  return parts.map((part, index) => {
    const isMatch = regex.test(part)
    return isMatch ? (
      React.createElement(
        'mark',
        { 
          key: `exact-${index}`, 
          className: highlightClassName 
        },
        part
      )
    ) : (
      part
    )
  })
}