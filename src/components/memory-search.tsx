'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { highlightPartialMatches } from '@/utils/searchHighlight'
import { SearchResult } from '@/types/memory'
import { useNetwork } from '@/providers/network-provider'
import { OnlineSearchService } from '@/lib/search-service'
import { searchOfflineMemories } from '@/lib/offline-search'

export function MemorySearch() {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState<SearchResult>({
        memories: [],
        loading: false,
        error: null
    })
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const { isOnline } = useNetwork()

    // Debounce search query (500ms as per docs)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 500)

        return () => clearTimeout(timer)
    }, [query])

    // Search function using abstracted search service
    const searchMemories = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResult({ memories: [], loading: false, error: null })
            return
        }

        setResult(prev => ({ ...prev, loading: true, error: null }))

        try {
            // Use direct function calls to avoid any dynamic loading
            const memories = isOnline 
                ? await new OnlineSearchService().searchMemories(searchQuery)
                : await searchOfflineMemories(searchQuery)

            setResult({ 
                memories, 
                loading: false, 
                error: null 
            })

        } catch (error) {
            console.error('Search error:', error)
            setResult({ 
                memories: [], 
                loading: false, 
                error: error instanceof Error ? error.message : 'An error occurred while searching'
            })
        }
    }, [isOnline])

    // Trigger search when debounced query changes
    useEffect(() => {
        searchMemories(debouncedQuery)
    }, [debouncedQuery, searchMemories])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatUrl = (url: string) => {
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

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                {/* Search Input */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search memories and tags..."
                        value={query}
                        onChange={(e) => {
                            // Basic sanitization
                            const sanitized = e.target.value.replace(/<[^>]*>/g, '').trim()
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
                        </p>

                        <div className="space-y-2">
                            {result.memories.map((memory) => (
                                <div key={memory.id} className="border rounded p-3 hover:bg-gray-50">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        {/* Left side: Date, Content, URL */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Date */}
                                            <span className="text-gray-500 font-mono text-xs whitespace-nowrap">
                                                {formatDate(memory.memory_date)}
                                            </span>
                                            
                                            {/* Context (Content) */}
                                            <span className="text-gray-900 flex-1 truncate text-left">
                                                {highlightPartialMatches(memory.content, query, {
                                                    highlightClassName: 'bg-blue-200 text-blue-900 px-1 rounded font-medium'
                                                })}
                                            
                                            {/* URL */}
                                            {memory.url && (
                                                <>
                                                    {' '}
                                                    <a 
                                                        href={memory.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-xs whitespace-nowrap flex-shrink-0 hover:underline"
                                                    >
                                                        {highlightPartialMatches(formatUrl(memory.url), query, {
                                                            highlightClassName: 'bg-blue-300 text-blue-900 px-1 rounded font-medium'
                                                        })}
                                                    </a>
                                                </>
                                            )}
                                            </span>
                                        </div>
                                        
                                        {/* Right side: Tags */}
                                        {memory.tags.length > 0 && (
                                            <div className="flex gap-1 flex-shrink-0">
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
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Helpful prompt when no query */}
                {!query && (
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Try searching for people, places, events, or tags like &quot;people&quot;, &quot;feeling&quot;, or &quot;excited&quot;
                        </p>
                        {!isOnline && (
                            <p className="text-xs text-orange-600 mt-2">
                                📱 Searching offline cached memories
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}