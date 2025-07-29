'use client'

import { useAuth } from '@/providers/auth-provider'
import { UserMenu } from '@/components/user-menu'
import { MemorySearch } from '@/components/memory-search'
import { SyncStatus } from '@/components/sync-status'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

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
                            <h1 className="text-xl font-semibold text-gray-900">InstaMem</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <SyncStatus />
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to InstaMem</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Your personal memory assistant. Search through your memories instantly.
                    </p>

                    <MemorySearch />
                </div>
            </main>
        </div>
    )
}
