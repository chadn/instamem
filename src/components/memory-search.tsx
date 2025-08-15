'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { highlightExactMatches } from '@/utils/searchHighlight'
import { SearchResult } from '@/types/memory'
import { useNetwork } from '@/providers/network-provider'
import { searchOfflineMemories } from '@/lib/offline-search'
import { sanitizeSearchQuery } from '@/lib/search-utils'
import { formatDate, formatUrl } from '@/lib/format-utils'

export function MemorySearch() {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState<SearchResult>({
        memories: [],
        loading: false,
        error: null
    })
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const { isOnline } = useNetwork()
    const router = useRouter()
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Debounce search query (500ms as per docs)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 500)

        return () => clearTimeout(timer)
    }, [query])

    // Search function using abstracted search service
    const searchMemories = useCallback(async (searchQuery: string) => {
        console.log('🔍 [MemorySearch] Starting search for query:', searchQuery)
        console.log('🌐 [MemorySearch] Network status - isOnline:', isOnline)
        
        if (!searchQuery.trim()) {
            console.log('📝 [MemorySearch] Empty query - clearing results')
            setResult({ memories: [], loading: false, error: null })
            return
        }

        // Sanitize the search query for security
        const sanitizedQuery = sanitizeSearchQuery(searchQuery)
        console.log('🧹 [MemorySearch] Sanitized query:', sanitizedQuery)
        
        if (!sanitizedQuery.trim()) {
            console.log('⚠️ [MemorySearch] Query became empty after sanitization')
            setResult({ memories: [], loading: false, error: null })
            return
        }

        console.log('⏳ [MemorySearch] Setting loading state')
        setResult(prev => ({ ...prev, loading: true, error: null }))

        try {
            console.log('🗄️ [MemorySearch] Calling searchOfflineMemories with:', sanitizedQuery)
            // Always search local cache - sync is handled separately
            const memories = await searchOfflineMemories(sanitizedQuery)
            console.log('✅ [MemorySearch] Search completed, found memories:', memories.length)
            console.log('📊 [MemorySearch] Memory results preview:', memories.slice(0, 2).map(m => ({ id: m.id, content: m.content.substring(0, 50) })))

            setResult({ 
                memories, 
                loading: false, 
                error: null 
            })

        } catch (error) {
            console.error('❌ [MemorySearch] Search error:', error)
            setResult({ 
                memories: [], 
                loading: false, 
                error: error instanceof Error ? error.message : 'An error occurred while searching'
            })
        }
    }, [isOnline])

    // Trigger search when debounced query changes (but not when isOnline changes if we have results)
    useEffect(() => {
        searchMemories(debouncedQuery)
    }, [debouncedQuery, searchMemories])

    // When going offline, don't re-search if we already have results for current query
    const prevOnline = useRef(isOnline)
    useEffect(() => {
        // Only re-search when coming back online (offline to online)
        // Don't re-search when going offline if we have results
        if (prevOnline.current === false && isOnline === true && debouncedQuery.trim()) {
            searchMemories(debouncedQuery)
        }
        prevOnline.current = isOnline
    }, [isOnline, debouncedQuery, searchMemories])

    // Mobile detection utility
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-1">
                {/* Search Input */}
                <div className="relative mb-2 mt-4 mx-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search memories and tags..."
                        value={query}
                        onFocus={() => {
                            // Scroll search box to top on mobile when focused
                            if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                setTimeout(() => {
                                    searchInputRef.current?.scrollIntoView({ 
                                        behavior: 'smooth', 
                                        block: 'start' 
                                    })
                                }, 100)
                            }
                        }}
                        onChange={(e) => {
                            // Enhanced sanitization for XSS prevention
                            const sanitized = e.target.value
                                .replace(/<[^>]*>/g, '') // Remove HTML tags
                                .replace(/javascript:/gi, '') // Remove javascript: URIs
                                .replace(/data:/gi, '') // Remove data: URIs  
                                .replace(/vbscript:/gi, '') // Remove vbscript: URIs
                                .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
                                .trim()
                            setQuery(sanitized)
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={100}
                    />
                </div>

                {/* Loading State */}
                {result.loading && (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Searching...</p>
                    </div>
                )}

                {/* Error State */}
                {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                        <p className="text-red-800 text-sm">{result.error}</p>
                    </div>
                )}

                {/* Search Results */}
                {!result.loading && !result.error && query && (
                    <div className="mx-2">
                        <p className="text-sm text-gray-600 mb-4">
                            {result.memories.length === 0 
                                ? `No memories found for "${query}"` 
                                : `Found ${result.memories.length} memory(s)`
                            }
                            {!isOnline && (
                                <span className="text-orange-600 text-xs ml-2">
                                    📱 Searching offline cached memories
                                </span>
                            )}
                        </p>

                        <div className="space-y-1 text-left">
                            {result.memories.map((memory) => (
                                <div key={memory.id} className="py-2 px-1 hover:bg-gray-50 rounded">
                                    <div className="text-sm space-y-1">
                                        {/* Row 1: Edit button + Date + Content + URL */}
                                        <div className="flex items-start gap-2">
                                            {/* Edit Button - moved to front */}
                                            <button 
                                                onClick={() => router.push(`/memory/${memory.id}/edit`)}
                                                className={`p-1 rounded flex-shrink-0 transition-colors mt-0.5 ${
                                                    isOnline 
                                                        ? "hover:bg-gray-200" 
                                                        : "cursor-not-allowed opacity-50"
                                                }`}
                                                aria-label="Edit memory"
                                                title={isOnline ? "Edit memory" : "Offline - editing disabled"}
                                                disabled={!isOnline}
                                            >
                                                <Edit className={`h-3 w-3 ${
                                                    isOnline 
                                                        ? "text-gray-500 hover:text-gray-700" 
                                                        : "text-gray-400"
                                                }`} />
                                            </button>
                                            
                                            {/* Content Blob: Date + Content + URL */}
                                            <div className="flex-1 min-w-0">
                                                <span className="text-gray-500 font-mono text-xs mr-2">
                                                    {formatDate(memory.memory_date, isMobile)}
                                                </span>
                                                <span className="text-gray-900">
                                                    {highlightExactMatches(memory.content, query, {
                                                        highlightClassName: 'bg-blue-200 text-blue-900 px-1 rounded font-medium'
                                                    })}
                                                </span>
                                                {memory.url && (
                                                    <>
                                                        <span className="text-gray-400 mx-1">•</span>
                                                        <a 
                                                            href={memory.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 text-xs hover:underline break-words"
                                                        >
                                                            {highlightExactMatches(formatUrl(memory.url), query, {
                                                                highlightClassName: 'bg-blue-300 text-blue-900 px-1 rounded font-medium'
                                                            })}
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Row 2: Tags - left aligned with proper wrapping */}
                                        {memory.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 ml-7">
                                                {memory.tags.map((tag, index) => (
                                                    <span 
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                                                    >
                                                        {highlightExactMatches(`${tag.key}:${tag.value}`, query, {
                                                            highlightClassName: 'bg-blue-300 text-blue-900 px-0.5 rounded font-medium'
                                                        })}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Helpful prompt when no query */}
                {!query && (
                    <div className="flex items-center justify-between mx-4 mt-4 mb-4">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500">
                                Try searching for people, places, events, or tags like &quot;people&quot;, &quot;feeling&quot;, or &quot;excited&quot;
                            </p>
                            {!isOnline && (
                                <p className="text-xs text-orange-600 mt-2">
                                    📱 Searching offline cached memories
                                </p>
                            )}
                        </div>
                        
                        {/* Create Memory Button */}
                        <div className="flex-shrink-0 ml-4">
                            <button
                                onClick={() => router.push('/memory/create')}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                                    isOnline
                                        ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                }`}
                                disabled={!isOnline}
                                title={isOnline ? "Create new memory" : "Offline - creating disabled"}
                            >
                                Create Memory
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}