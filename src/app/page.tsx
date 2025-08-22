'use client'

import { useAuth } from '@/providers/auth-provider'
import { UserMenu } from '@/components/user-menu'
import { MemorySearch } from '@/components/memory-search'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LightningIcon } from '@/components/icons'
import { useNetwork } from '@/providers/network-provider'

export default function Home() {
    const { user, loading } = useAuth()
    const { isOnline } = useNetwork()
    const router = useRouter()

    useEffect(() => {
        // Only redirect to login when online and user is not authenticated
        // When offline, preserve the current auth state to avoid unnecessary redirects
        if (!loading && !user && isOnline) {
            router.push('/login')
        }
    }, [user, loading, router, isOnline])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <LightningIcon className="h-7 w-7 mr-1" />
                            <h1 className="text-xl font-semibold text-gray-900">InstaMem</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center">
                    <MemorySearch />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-6">Welcome to InstaMem</h2>
                    <p className="text-lg text-gray-600 mb-4">
                        Your personal memory assistant. Search through your memories instantly.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        New to InstaMem?{' '}
                        <a
                            href="https://github.com/chadn/instamem/blob/main/docs/usage.md#instamem-usage-guide"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            View the usage guide →
                        </a>
                    </p>
                </div>
            </main>
        </div>
    )
}
