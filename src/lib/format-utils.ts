/**
 * Date formatting utilities for InstaMem
 */
export const formatDate = (dateString: string, isMobile = false) => {
  const date = new Date(dateString)
  const currentYear = new Date().getFullYear()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Temporarily using moble sring format for both mobile and desktop
  if (true || isMobile) {
    // Mobile: simple format like 8/1/25 or 8/1 for current year
    return `${month}/${day}/${year.toString().slice(-2)}`
  }
  
  // Desktop: original format
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * URL formatting utilities for InstaMem
 */
export const formatUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    const path = urlObj.pathname
    const formatted = domain + path
    
    if (formatted.length <= 30) {
      return formatted
    }
    
    // If too long, show domain + first part of path
    const pathParts = path.split('/').filter(p => p)
    if (pathParts.length > 0) {
      const firstPath = '/' + pathParts[0]
      return domain + firstPath + '...'
    }
    
    return domain + '...'
  } catch {
    return url.length > 30 ? url.substring(0, 27) + '...' : url
  }
}