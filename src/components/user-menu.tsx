'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { LogOut, User } from 'lucide-react'

export function UserMenu() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5" />
        <span className="text-sm font-medium">{user.email}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        className="flex items-center space-x-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign out</span>
      </Button>
    </div>
  )
}