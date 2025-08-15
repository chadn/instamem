'use client'

import { useAuth } from '@/providers/auth-provider'
import { LogOut, User, Cloud, CloudOff } from 'lucide-react'
import { GoogleIcon, GitHubIcon } from '@/components/icons'
import { SyncStatus } from '@/components/sync-status'
import { useRef, useState, useEffect } from 'react'
import { useNetwork } from '@/providers/network-provider'
import { getServiceWorkerVersion, getLastServiceWorkerUpdateAt } from '@/lib/service-worker'

export function UserMenu() {
    const { user, signOut } = useAuth()
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const { isOnline } = useNetwork()
    const [swVersion, setSwVersion] = useState<string | null>(null)
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

    // Close dropdown on outside click or escape
    useEffect(() => {
        if (!open) return
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        document.addEventListener('keydown', handleKey)
        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('keydown', handleKey)
        }
    }, [open])

    // When opening the menu, fetch SW version and last updated timestamp
    useEffect(() => {
        if (!open) return
        getServiceWorkerVersion()
            .then(setSwVersion)
            .catch(() => setSwVersion(null))
        setLastUpdatedAt(getLastServiceWorkerUpdateAt())
    }, [open])

    if (!user) return null

    // Get provider information
    const provider = user.app_metadata?.provider || 'email'
    const primaryIdentity = user.identities?.[0]
    const providerName = primaryIdentity?.provider || provider

    // Get provider icon
    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'google':
                return <GoogleIcon className="h-4 w-4" />
            case 'github':
                return <GitHubIcon className="h-4 w-4" />
            default:
                return <User className="h-4 w-4" />
        }
    }

    // Capitalize provider name
    const getProviderDisplayName = (provider: string) => {
        return provider.charAt(0).toUpperCase() + provider.slice(1)
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="flex items-center space-x-2 px-3 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                title={`Signed in via ${getProviderDisplayName(providerName)}`}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={open}
            >
                {isOnline ? (
                    <Cloud className="h-4 w-4 text-green-600" />
                ) : (
                    <CloudOff className="h-4 w-4 text-orange-600" />
                )}
                {getProviderIcon(providerName)}
                <span className="text-sm font-medium">{user.email ? user.email.split('@')[0] + '@' : ''}</span>
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-50 p-4 min-w-[200px] flex flex-col items-start">
                    <div className="flex items-center space-x-2 mb-2">
                        {getProviderIcon(providerName)}
                        <span className="text-sm font-semibold">{user.email}</span>
                    </div>
                    <div className="mb-2 w-full">
                        <SyncStatus />
                    </div>
                    <div className="w-full border-t border-gray-200 my-2" />
                    <div className="w-full text-xs text-gray-600 space-y-1">
                        <div className="font-semibold text-gray-700">Developer</div>
                        <div>Version: {swVersion ?? 'unknown'}</div>
                        <div>
                            Updated:{' '}
                            {lastUpdatedAt
                                ? new Intl.DateTimeFormat(undefined, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  }).format(lastUpdatedAt)
                                : 'n/a'}
                        </div>
                    </div>
                    <div className="w-full border-t border-gray-200 my-2" />
                    <button
                        onClick={signOut}
                        className="flex items-center space-x-2 w-full py-2 rounded hover:bg-gray-100 text-left text-sm text-red-600"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                    </button>
                </div>
            )}
        </div>
    )
}
