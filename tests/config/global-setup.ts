import { FullConfig } from '@playwright/test'
import { getSession } from '../helpers/getSession'
import { config as loadDotenv } from 'dotenv'
import path from 'path'

async function globalSetup(playwrightConfig: FullConfig) {
    // Load environment variables from .env.local (same as Next.js)
    const envPath = path.resolve(process.cwd(), '.env.local')
    loadDotenv({ path: envPath })

    // Validate required environment variables
    const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'TEST_USER_EMAIL',
        'TEST_USER_PASSWORD',
    ]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars.join(', '))
        console.error('💡 Run: npm run db seed-test-user to create test credentials')
        process.exit(1)
    }

    console.log('🔐 Setting up cached authentication for tests...')

    try {
        // Get cached session (this handles caching/refresh automatically)
        const session = await getSession()

        // Encode the session the way @supabase/ssr expects (base64-URL)
        const payload = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_at - Math.floor(Date.now() / 1000),
            expires_at: session.expires_at,
            token_type: 'bearer',
        }

        const encoded =
            'base64-' +
            Buffer.from(JSON.stringify(payload))
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '')

        // For @supabase/ssr, the key includes the project URL
        // Format: sb-<project-ref>-auth-token
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const projectRef = supabaseUrl.split('//')[1].split('.')[0]
        const localStorageKey = `sb-${projectRef}-auth-token`
        
        // Store the encoded session for use in test fixtures
        process.env.PLAYWRIGHT_SUPABASE_TOKEN_KEY = localStorageKey
        process.env.PLAYWRIGHT_SUPABASE_TOKEN_VALUE = encoded

        // Session injection was problematic with @supabase/ssr, but keeping session generation
        // for potential future use or reference in test debugging

        console.log('✅ Test authentication setup complete')
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('❌ Failed to setup test authentication:', errorMessage)
        console.error('💡 Make sure you ran: npm run db seed-test-user')
        process.exit(1)
    }
}

export default globalSetup
