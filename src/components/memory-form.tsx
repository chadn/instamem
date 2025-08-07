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
    loading?: boolean
}

export function MemoryForm({ mode, initialData, onSave, onCancel, loading = false }: MemoryFormProps) {
    const [tags, setTags] = useState<MemoryTag[]>(initialData?.tags || [])
    
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
            </div>
        </form>
    )
}