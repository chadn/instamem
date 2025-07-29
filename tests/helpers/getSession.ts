import fs from 'fs/promises'
import path from 'path'
import { request } from '@playwright/test'

const CACHE_DIR = path.resolve(__dirname, '../.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'supabase-session.json')

type Session = {
    access_token: string
    refresh_token: string
    expires_at: number // epoch seconds
}

const isFresh = (s: Session) => s && s.expires_at - 30 > Math.floor(Date.now() / 1000) // 30-sec margin

export async function getSession(): Promise<Session> {
    // Load environment variables
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL
    const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
        throw new Error(`Missing required environment variables:
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? 'SET' : 'MISSING'}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}
      TEST_USER_EMAIL: ${TEST_USER_EMAIL ? 'SET' : 'MISSING'}
      TEST_USER_PASSWORD: ${TEST_USER_PASSWORD ? 'SET' : 'MISSING'}
    `)
    }

    // 1. Try cache first
    try {
        const raw = await fs.readFile(CACHE_FILE, 'utf-8')
        const cached: Session = JSON.parse(raw)
        if (isFresh(cached)) {
            console.log('🎯 Using cached session')
            return cached
        }

        // If only access token is stale, try refresh-token flow
        console.log('🔄 Refreshing expired session...')
        try {
            const refreshed = await refreshWithToken(cached.refresh_token, SUPABASE_URL, SUPABASE_ANON_KEY)
            await saveSession(refreshed)
            console.log('✅ Session refreshed successfully')
            return refreshed
        } catch (refreshError) {
            console.log('⚠️  Refresh failed, falling back to password login')
        }
    } catch (_) {
        console.log('📝 No cached session found, creating new one...')
    }

    // 2. Password login (slowest path)
    const fresh = await loginWithPassword(TEST_USER_EMAIL, TEST_USER_PASSWORD, SUPABASE_URL, SUPABASE_ANON_KEY)
    await saveSession(fresh)
    console.log('🔐 Created fresh session via password login')
    return fresh
}

async function loginWithPassword(
    email: string,
    password: string,
    supabaseUrl: string,
    supabaseAnonKey: string
): Promise<Session> {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            apikey: supabaseAnonKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Password login failed (${response.status}): ${error}`)
    }

    const json = await response.json()
    return {
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        expires_at: json.expires_at,
    }
}

async function refreshWithToken(refreshToken: string, supabaseUrl: string, supabaseAnonKey: string): Promise<Session> {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
            apikey: supabaseAnonKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refresh_token: refreshToken,
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Token refresh failed (${response.status}): ${error}`)
    }

    const json = await response.json()
    return {
        access_token: json.access_token,
        refresh_token: json.refresh_token ?? refreshToken, // Some APIs don't return new refresh token
        expires_at: json.expires_at,
    }
}

async function saveSession(session: Session): Promise<void> {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    await fs.writeFile(CACHE_FILE, JSON.stringify(session, null, 2), 'utf-8')
}
