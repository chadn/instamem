'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Memory } from '@/types/memory'
import { MemoryForm } from '@/components/memory-form'
import { OfflineNotice } from '@/components/offline-notice'
import { createMemory } from '@/lib/memory-queries'
import { createClient } from '@/lib/supabase-browser'
import { useNetwork } from '@/providers/network-provider'

export function CreateMemoryClient() {
    const router = useRouter()
    const { isOffline } = useNetwork()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    
    // Show offline notice if user is offline
    if (isOffline) {
        return <OfflineNotice action="create new memories" />
    }
    
    const handleSave = async (memoryData: Partial<Memory>) => {
        setSaving(true)
        setError(null)
        
        try {
            const supabase = createClient()
            
            // Create new memory
            await createMemory(supabase, {
                content: memoryData.content!,
                memory_date: memoryData.memory_date!,
                url: memoryData.url,
                tags: memoryData.tags || []
            })
            
            // Show success modal
            setShowSuccessModal(true)
            
        } catch (err) {
            console.error('Error creating memory:', err)
            const errorMsg = err instanceof Error ? err.message : 'Failed to create memory'
            setErrorMessage(errorMsg)
            setShowErrorModal(true)
        } finally {
            setSaving(false)
        }
    }
    
    const handleCancel = () => {
        router.push('/')
    }
    
    const handleSuccessOk = () => {
        setShowSuccessModal(false)
        router.push('/')
    }
    
    const handleErrorOk = () => {
        setShowErrorModal(false)
        setErrorMessage('')
    }
    
    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border p-6">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}
                
                <MemoryForm
                    mode="create"
                    onSave={handleSave}
                    onCancel={handleCancel}
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Memory Created</h3>
                            <p className="text-gray-600 mb-4">Your memory has been created successfully.</p>
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Creation Failed</h3>
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
        </>
    )
}