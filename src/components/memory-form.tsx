'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Memory, MemoryTag } from '@/types/memory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagInput } from '@/components/ui/tag-input'

const memoryFormSchema = z.object({
    content: z.string().min(1, 'Content is required').max(1000, 'Content must be less than 1000 characters'),
    memory_date: z.string().min(1, 'Date is required'),
    url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    tags: z.array(z.object({
        key: z.string(),
        value: z.string()
    }))
})

type MemoryFormData = z.infer<typeof memoryFormSchema>

interface MemoryFormProps {
    mode: 'create' | 'edit'
    initialData?: Memory
    onSave: (data: Partial<Memory>) => Promise<void>
    onCancel: () => void
    onDelete?: () => Promise<void>
    loading?: boolean
}

export function MemoryForm({ mode, initialData, onSave, onCancel, onDelete, loading = false }: MemoryFormProps) {
    const [tags, setTags] = useState<MemoryTag[]>(initialData?.tags || [])
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isDirty }
    } = useForm<MemoryFormData>({
        resolver: zodResolver(memoryFormSchema),
        defaultValues: {
            content: initialData?.content || '',
            memory_date: initialData?.memory_date 
                ? new Date(initialData.memory_date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            url: initialData?.url || '',
            tags: initialData?.tags || []
        }
    })
    
    // Update form when tags change
    useEffect(() => {
        setValue('tags', tags, { shouldValidate: true, shouldDirty: true })
    }, [tags, setValue])
    
    const onSubmit = async (data: MemoryFormData) => {
        try {
            await onSave({
                content: data.content,
                memory_date: data.memory_date,
                url: data.url || undefined,
                tags: tags
            })
        } catch (error) {
            console.error('Error submitting form:', error)
        }
    }
    
    const handleCancel = () => {
        if (isDirty) {
            if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                onCancel()
            }
        } else {
            onCancel()
        }
    }
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Content Field */}
            <div className="space-y-2">
                <Label htmlFor="content">
                    Memory Content *
                </Label>
                <textarea
                    id="content"
                    {...register('content')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="What do you want to remember?"
                    disabled={loading}
                />
                {errors.content && (
                    <p className="text-red-600 text-sm">{errors.content.message}</p>
                )}
            </div>
            
            {/* Date Field */}
            <div className="space-y-2">
                <Label htmlFor="memory_date">
                    Date *
                </Label>
                <Input
                    id="memory_date"
                    type="date"
                    {...register('memory_date')}
                    disabled={loading}
                />
                {errors.memory_date && (
                    <p className="text-red-600 text-sm">{errors.memory_date.message}</p>
                )}
            </div>
            
            {/* URL Field */}
            <div className="space-y-2">
                <Label htmlFor="url">
                    URL (optional)
                </Label>
                <Input
                    id="url"
                    type="url"
                    {...register('url')}
                    placeholder="https://example.com"
                    disabled={loading}
                />
                {errors.url && (
                    <p className="text-red-600 text-sm">{errors.url.message}</p>
                )}
            </div>
            
            {/* Tags Field */}
            <div className="space-y-2">
                <Label htmlFor="tags">
                    Tags
                </Label>
                <TagInput
                    value={tags}
                    onChange={setTags}
                    placeholder="Add tags (e.g., person:john, feeling:excited)"
                    disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Create new tags like <code className="bg-gray-100 px-1 rounded text-xs">place:Trader Joes</code> by typing comma then space
                </p>
                {errors.tags && (
                    <p className="text-red-600 text-sm">{errors.tags.message}</p>
                )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            {mode === 'edit' ? 'Saving...' : 'Creating...'}
                        </div>
                    ) : (
                        mode === 'edit' ? 'Save Changes' : 'Create Memory'
                    )}
                </Button>
                
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                
                {/* Delete Button - only show in edit mode */}
                {mode === 'edit' && onDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete
                    </Button>
                )}
            </div>
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Memory</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete this memory? This action cannot be undone.
                            </p>
                            {initialData?.content && (
                                <div className="bg-gray-50 p-3 rounded mb-4">
                                    <p className="text-sm text-gray-700 truncate">
                                        &quot;{initialData.content.length > 50 ? initialData.content.substring(0, 50) + '...' : initialData.content}&quot;
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={async () => {
                                        try {
                                            await onDelete!()
                                            setShowDeleteConfirm(false)
                                        } catch (error) {
                                            console.error('Delete failed:', error)
                                        }
                                    }}
                                    variant="destructive"
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Deleting...
                                        </div>
                                    ) : (
                                        'Delete'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}