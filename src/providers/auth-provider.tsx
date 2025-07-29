'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-browser'
import { registerServiceWorker } from '@/lib/service-worker'

// Global promise to warm Fuse.js chunk
let fuseWarmPromise: Promise<typeof import('fuse.js')> | null = null

declare global {
  var __fusePromise: Promise<typeof import('fuse.js').default> | undefined
}

function warmFuseChunk() {
  if (!fuseWarmPromise) {
    console.log('🔥 Warming Fuse.js chunk...')
    fuseWarmPromise = import('fuse.js')
    
    // Store in global for offline search to reuse
    globalThis.__fusePromise = fuseWarmPromise.then(mod => mod.default)
    
    fuseWarmPromise.then(() => {
      console.log('✅ Fuse.js chunk warmed and cached')
    }).catch(error => {
      console.error('❌ Failed to warm Fuse.js chunk:', error)
    })
  }
  return fuseWarmPromise
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Register service worker for offline support
    registerServiceWorker().catch(error => {
      console.error('Service worker registration failed:', error)
    })

    // Warm Fuse.js chunk as early as possible after hydration
    console.log('🚀 Auth provider initializing, warming Fuse.js...')
    warmFuseChunk()

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (provider: 'google' | 'github') => {
    // Ensure we're fully signed out before starting new auth flow
    await supabase.auth.signOut()
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Force account selection to avoid automatic login with cached credentials
        queryParams: {
          prompt: 'select_account'
        }
      },
    })
    
    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Clear any cached user data
      setUser(null)
      // Force a page reload to ensure all session data is cleared
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}