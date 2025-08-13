'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { highlightPartialMatches } from '@/utils/searchHighlight'
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
                {/* Search Input */}
                <div className="relative mb-6">
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
                    <div>
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

                        <div className="space-y-2">
                            {result.memories.map((memory) => (
                                <div key={memory.id} className="border rounded p-3 hover:bg-gray-50">
                                    {/* Mobile and Desktop Layout */}
                                    <div className="md:flex md:items-center md:justify-between md:gap-3 text-sm space-y-2 md:space-y-0">
                                        {/* Main Content */}
                                        <div className="md:flex md:items-center md:gap-3 md:flex-1 md:min-w-0 space-y-1 md:space-y-0">
                                            {/* Date and Content Row */}
                                            <div className="flex items-start gap-3">
                                                {/* Date */}
                                                <span className="text-gray-500 font-mono text-xs whitespace-nowrap flex-shrink-0">
                                                    {formatDate(memory.memory_date, isMobile)}
                                                </span>
                                                
                                                {/* Content */}
                                                <span className="text-gray-900 flex-1 text-left break-words">
                                                    {highlightPartialMatches(memory.content, query, {
                                                        highlightClassName: 'bg-blue-200 text-blue-900 px-1 rounded font-medium'
                                                    })}
                                                </span>
                                            </div>
                                            
                                            {/* URL Row (if exists) */}
                                            {memory.url && (
                                                <div className="md:inline md:ml-3">
                                                    <a 
                                                        href={memory.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-xs hover:underline break-all"
                                                    >
                                                        {highlightPartialMatches(formatUrl(memory.url), query, {
                                                            highlightClassName: 'bg-blue-300 text-blue-900 px-1 rounded font-medium'
                                                        })}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Tags and Edit Button Row */}
                                        <div className="flex items-center justify-between gap-2">
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1">
                                                {memory.tags.map((tag, index) => (
                                                    <span 
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                                                    >
                                                        {highlightPartialMatches(`${tag.key}:${tag.value}`, query, {
                                                            highlightClassName: 'bg-blue-300 text-blue-900 px-0.5 rounded font-medium'
                                                        })}
                                                    </span>
                                                ))}
                                            </div>
                                            
                                            {/* Edit Button */}
                                            <button 
                                                onClick={() => router.push(`/memory/${memory.id}/edit`)}
                                                className={`p-1 rounded flex-shrink-0 transition-colors ${
                                                    isOnline 
                                                        ? "hover:bg-gray-200" 
                                                        : "cursor-not-allowed opacity-50"
                                                }`}
                                                aria-label="Edit memory"
                                                title={isOnline ? "Edit memory" : "Offline - editing disabled"}
                                                disabled={!isOnline}
                                            >
                                                <Edit className={`h-4 w-4 ${
                                                    isOnline 
                                                        ? "text-gray-500 hover:text-gray-700" 
                                                        : "text-gray-400"
                                                }`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Helpful prompt when no query */}
                {!query && (
                    <div className="flex items-center justify-between">
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
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Create Memory
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}