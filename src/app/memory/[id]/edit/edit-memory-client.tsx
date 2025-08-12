'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Memory } from '@/types/memory'
import { MemoryForm } from '@/components/memory-form'
import { updateMemory, deleteMemory } from '@/lib/memory-queries'
import { createClient } from '@/lib/supabase-browser'
import { useNetwork } from '@/providers/network-provider'

interface EditMemoryClientProps {
    memory: Memory
}

export function EditMemoryClient({ memory }: EditMemoryClientProps) {
    const router = useRouter()
    const { isOffline } = useNetwork()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false)
    
    const handleSave = async (updatedMemory: Partial<Memory>) => {
        setSaving(true)
        setError(null)
        
        try {
            const supabase = createClient()
            
            // Update all fields including tags using the complete update function
            await updateMemory(supabase, memory.id, {
                content: updatedMemory.content,
                memory_date: updatedMemory.memory_date,
                url: updatedMemory.url,
                tags: updatedMemory.tags
            })
            
            // Show success modal instead of immediately navigating
            setShowSuccessModal(true)
            
        } catch (err) {
            console.error('Error saving memory:', err)
            const errorMsg = err instanceof Error ? err.message : 'Failed to save memory'
            setErrorMessage(errorMsg)
            setShowErrorModal(true)
        } finally {
            setSaving(false)
        }
    }
    
    const handleCancel = () => {
        router.push('/')
    }
    
    const handleDelete = async () => {
        setSaving(true)
        setError(null)
        
        try {
            const supabase = createClient()
            await deleteMemory(supabase, memory.id)
            
            // Show delete success modal
            setShowDeleteSuccessModal(true)
            
        } catch (err) {
            console.error('Error deleting memory:', err)
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete memory'
            setErrorMessage(errorMsg)
            setShowErrorModal(true)
        } finally {
            setSaving(false)
        }
    }
    
    const handleSuccessOk = () => {
        setShowSuccessModal(false)
        router.push('/')
    }
    
    const handleErrorOk = () => {
        setShowErrorModal(false)
        setErrorMessage('')
    }
    
    const handleDeleteSuccessOk = () => {
        setShowDeleteSuccessModal(false)
        router.push('/')
    }
    
    return (
        <>
            {/* Dynamic page header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isOffline ? 'View Memory' : 'Edit Memory'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isOffline 
                        ? 'Viewing memory details in read-only mode while offline'
                        : 'Make changes to your memory details and tags'
                    }
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}
                
                <MemoryForm
                    mode="edit"
                    initialData={memory}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    loading={saving}
                />
            </div>
            
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Save Successful</h3>
                            <p className="text-gray-600 mb-4">Your memory has been updated successfully.</p>
                            <button
                                onClick={handleSuccessOk}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Operation Failed</h3>
                            <p className="text-gray-600 mb-4">{errorMessage}</p>
                            <button
                                onClick={handleErrorOk}
                                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Success Modal */}
            {showDeleteSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Memory Deleted</h3>
                            <p className="text-gray-600 mb-4">The memory has been permanently deleted.</p>
                            <button
                                onClick={handleDeleteSuccessOk}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}