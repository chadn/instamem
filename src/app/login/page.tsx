'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
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
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('google')}
          >
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('github')}
          >
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}