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
                    <Button variant="ghost" size="sm" onClick={handleSync} className="h-6 px-2 text-xs">
                        Retry
                    </Button>
                )}
            </div>
        )
    }

    // Show online/offline status with last sync info
    return (
        <div className="flex flex-col gap-y-1 text-sm">
            <div className="flex items-center gap-2">
                {isOnline ? (
                    <>
                        <Cloud className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">Online • Last sync: {formatLastSync(lastSync)}</span>
                    </>
                ) : (
                    <>
                        <CloudOff className="h-4 w-4 text-orange-600" />
                        <span className="text-gray-600">Offline • Cached: {formatLastSync(lastSync)}</span>
                    </>
                )}
            </div>
            {isOnline && (
                <div className="flex justify-start w-full p-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSync}
                        className="h-6 text-left text-xs hover:bg-gray-100 !p-0 !pl-0 !px-0 m-0"
                    >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                    </Button>
                </div>
            )}
        </div>
    )
}
