'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { MemoryTag } from '@/types/memory'
import { useTags } from '@/hooks/use-tags'
import { cn } from '@/lib/utils'
import { getFeelingDefinition, searchFeelings } from '@/lib/feeling-definitions'

interface TagInputProps {
    value: MemoryTag[]
    onChange: (tags: MemoryTag[]) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function TagInput({ value, onChange, placeholder = "Add tags...", disabled, className }: TagInputProps) {
    const [inputValue, setInputValue] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    
    const { availableTags, loading: tagsLoading } = useTags()
    
    // Filter available tags based on input and exclude already selected ones
    const getFilteredTags = () => {
        if (!inputValue.trim()) return []
        
        const searchLower = inputValue.toLowerCase()
        const existingTags = new Set(value.map(tag => `${tag.key}:${tag.value}`))
        
        // 1. Get existing database tags that match
        const dbTags = availableTags
            .filter(tag => 
                (tag.key.toLowerCase().includes(searchLower) || 
                 tag.value.toLowerCase().includes(searchLower)) &&
                !existingTags.has(`${tag.key}:${tag.value}`)
            )
        
        // 2. Get feeling suggestions from searchFeelings()
        const feelingMatches = searchFeelings(inputValue)
            .map(feeling => ({ key: 'feeling', value: feeling.feeling }))
            .filter(tag => !existingTags.has(`${tag.key}:${tag.value}`))
        
        // 3. Combine and deduplicate (prioritize existing DB tags)
        const allTags = [...dbTags]
        feelingMatches.forEach(feelingTag => {
            const exists = allTags.some(tag => tag.key === feelingTag.key && tag.value === feelingTag.value)
            if (!exists) {
                allTags.push(feelingTag)
            }
        })
        
        return allTags.slice(0, 10) // Show max 10 suggestions
    }
    
    const filteredTags = getFilteredTags()
    
    // Show dropdown when there's input and filtered tags
    const shouldShowDropdown = showDropdown && inputValue.trim() && filteredTags.length > 0 && !disabled
    
    // Handle adding a tag
    const addTag = (tag: MemoryTag) => {
        const exists = value.some(existingTag => 
            existingTag.key === tag.key && existingTag.value === tag.value
        )
        if (!exists) {
            onChange([...value, tag])
        }
        setInputValue('')
        setShowDropdown(false)
        setSelectedIndex(-1)
        inputRef.current?.focus()
    }
    
    // Parse input for manual tag creation (tagKey:tagValue, )
    const tryParseManualTag = (input: string): MemoryTag | null => {
        // Check if input ends with comma+space and has colon format
        if (input.endsWith(', ')) {
            const tagText = input.slice(0, -2).trim() // Remove ", " from end
            const colonIndex = tagText.indexOf(':')
            
            if (colonIndex > 0 && colonIndex < tagText.length - 1) {
                const key = tagText.slice(0, colonIndex).trim()
                const value = tagText.slice(colonIndex + 1).trim()
                
                // Validate key and value are not empty
                if (key && value) {
                    return { key, value }
                }
            }
        }
        return null
    }
    
    // Handle input changes and detect manual tag creation
    const handleInputChange = (newValue: string) => {
        const manualTag = tryParseManualTag(newValue)
        
        if (manualTag) {
            // Add the manually created tag
            addTag(manualTag)
        } else {
            // Normal input handling
            setInputValue(newValue)
        }
    }
    
    // Handle removing a tag
    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index))
    }
    
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (shouldShowDropdown) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => 
                    prev < filteredTags.length - 1 ? prev + 1 : prev
                )
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < filteredTags.length) {
                    addTag(filteredTags[selectedIndex])
                }
            } else if (e.key === 'Escape') {
                setShowDropdown(false)
                setSelectedIndex(-1)
            }
        } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            // Remove last tag when backspace is pressed on empty input
            removeTag(value.length - 1)
        }
    }
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
                setSelectedIndex(-1)
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    
    // Reset selected index when filtered tags change
    useEffect(() => {
        setSelectedIndex(-1)
    }, [inputValue])
    
    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            {/* Tags Display and Input Container */}
            <div className={cn(
                "min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent",
                "flex flex-wrap gap-1.5 items-center",
                disabled && "bg-gray-50 cursor-not-allowed"
            )}>
                {/* Display existing tags */}
                {value.map((tag, index) => (
                    <TagChip 
                        key={`${tag.key}:${tag.value}`} 
                        tag={tag} 
                        onRemove={() => removeTag(index)}
                        disabled={disabled}
                    />
                ))}
                
                {/* Input field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    disabled={disabled}
                    className={cn(
                        "flex-1 min-w-[120px] outline-none bg-transparent",
                        "placeholder-gray-400",
                        disabled && "cursor-not-allowed"
                    )}
                />
            </div>
            
            {/* Autocomplete Dropdown */}
            {shouldShowDropdown && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {tagsLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading tags...</div>
                    ) : filteredTags.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No matching tags found</div>
                    ) : (
                        filteredTags.map((tag, index) => (
                            <TagSuggestion
                                key={`${tag.key}:${tag.value}`}
                                tag={tag}
                                isSelected={index === selectedIndex}
                                onClick={() => addTag(tag)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

// Tag chip component for displaying selected tags
interface TagChipProps {
    tag: MemoryTag
    onRemove: () => void
    disabled?: boolean
}

function TagChip({ tag, onRemove, disabled }: TagChipProps) {
    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            "bg-blue-100 text-blue-800 border border-blue-200",
            "transition-colors duration-150"
        )}>
            <span className="font-semibold">{tag.key}:</span>
            <span>{tag.value}</span>
            {!disabled && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-0.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${tag.key}:${tag.value} tag`}
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}

// Tag suggestion component for dropdown items
interface TagSuggestionProps {
    tag: MemoryTag
    isSelected: boolean
    onClick: () => void
}

function TagSuggestion({ tag, isSelected, onClick }: TagSuggestionProps) {
    // Special handling for feeling tags with definitions
    const isFeeling = tag.key === 'feeling'
    const definition = isFeeling ? getFeelingDefinition(tag.value) : undefined
    
    return (
        <button
            type="button"
            className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors",
                "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                isSelected && "bg-blue-50"
            )}
            onClick={onClick}
        >
            <div className="flex items-center gap-2">
                {/* Tag display and definition on same line */}
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <span className="font-semibold">{tag.key}:</span>
                    <span>{tag.value}</span>
                </div>
                
                {/* Feeling definition on same line */}
                {definition && (
                    <span className="text-xs text-gray-600">
                        {definition}
                    </span>
                )}
            </div>
        </button>
    )
}