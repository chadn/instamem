'use client'

import { CloudOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface OfflineNoticeProps {
  action?: string
  showBackButton?: boolean
}

export function OfflineNotice({ action = "perform this action", showBackButton = true }: OfflineNoticeProps) {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="mb-6">
            <CloudOff className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re Currently Offline</h1>
            <p className="text-gray-600">
              InstaMem is in read-only mode when offline. You can still search your cached memories, 
              but you can&apos;t {action} right now.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>What you can do offline:</strong>
                <br />
                • Search through your cached memories
                <br />
                • View existing memory details
                <br />
                • Browse your memory history
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>To {action}:</strong>
                <br />
                Connect to the internet and try again. Your changes will sync automatically when you&apos;re back online.
              </p>
            </div>
          </div>
          
          {showBackButton && (
            <div className="mt-8">
              <Button 
                onClick={() => router.push('/')} 
                variant="outline" 
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Memories
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}