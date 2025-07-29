'use client'

import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react'
import { useNetwork } from '@/providers/network-provider'
import { useSync } from '@/providers/sync-provider'
import { Button } from '@/components/ui/button'

export function SyncStatus() {
  const { isOnline } = useNetwork()
  const { status, lastSync, progress, forceSync } = useSync()

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleSync = async () => {
    try {
      await forceSync()
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  // Show sync progress during sync
  if (status === 'syncing') {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Syncing... {progress}%</span>
      </div>
    )
  }

  // Show error state
  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>Sync failed</span>
        {isOnline && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSync}
            className="h-6 px-2 text-xs"
          >
            Retry
          </Button>
        )}
      </div>
    )
  }

  // Show online/offline status with last sync info
  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Cloud className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">
            Online • Last sync: {formatLastSync(lastSync)}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSync}
            className="h-6 px-2 text-xs hover:bg-gray-100"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync
          </Button>
        </>
      ) : (
        <>
          <CloudOff className="h-4 w-4 text-orange-600" />
          <span className="text-gray-600">
            Offline • Cached: {formatLastSync(lastSync)}
          </span>
        </>
      )}
    </div>
  )
}