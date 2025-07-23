'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      router.push('/')
      return
    }
    
    // Check if we're being redirected here with an OAuth code
    // This shouldn't happen, but let's handle it gracefully
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    
    if (code && !error) {
      console.log('OAuth code received on login page, redirecting to auth callback')
      // Use router.replace to avoid infinite loops
      router.replace(`/auth/callback?code=${code}`)
    } else if (error) {
      console.log('OAuth error received:', error)
      setError(`Authentication failed: ${error}`)
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to InstaMem</CardTitle>
          <CardDescription>
            Sign in to access your personal memory assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              try {
                setError(null)
                await signIn('google')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Authentication failed')
              }
            }}
          >
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              try {
                setError(null)
                await signIn('github')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'GitHub authentication is not currently enabled')
              }
            }}
          >
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}