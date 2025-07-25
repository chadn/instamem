'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { LogOut, User } from 'lucide-react'
import { GoogleIcon, GitHubIcon } from '@/components/icons'

export function UserMenu() {
    const { user, signOut } = useAuth()

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
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <div 
                    className="flex items-center space-x-2"
                    title={`Signed in via ${getProviderDisplayName(providerName)}`}
                >
                    {getProviderIcon(providerName)}
                    <span className="text-sm font-medium">{user.email}</span>
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
            </Button>
        </div>
    )
}
