'use client'

import { useAuth } from '@/providers/auth-provider'
import { UserMenu } from '@/components/user-menu'
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
            <UserMenu />
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to InstaMem
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your personal memory assistant. Start by searching for memories or adding new ones.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Search your memories
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Search memories..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                  onChange={(e) => {
                    // Basic sanitization - remove HTML tags and script content
                    const sanitized = e.target.value.replace(/<[^>]*>/g, '').trim()
                    e.target.value = sanitized
                  }}
                />
                <p className="text-sm text-gray-500">
                  Try searching for people, places, or events from your memories
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}