import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that should be publicly accessible (no auth required)
const PUBLIC_ROUTES = [
    '/login',
    '/login-email', 
    '/',
    '/auth/callback'
]

// Static files that should be publicly accessible
const PUBLIC_STATIC_PATHS = [
    '/manifest.json',
    '/sw.js',
    '/favicon.ico'
]

// File extensions that should be publicly accessible
const PUBLIC_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    '.js', '.css', '.txt', '.xml', '.webmanifest'
]

function isPublicPath(pathname: string): boolean {
    // Exact match for specific public routes
    if (PUBLIC_ROUTES.includes(pathname)) return true
    
    // Exact match for specific static files
    if (PUBLIC_STATIC_PATHS.includes(pathname)) return true
    
    // Prefix match for NextJS internal paths
    if (pathname.startsWith('/api/') || 
        pathname.startsWith('/_next/static/') || 
        pathname.startsWith('/_next/image/')) return true
    
    // Suffix match for file extensions
    if (PUBLIC_EXTENSIONS.some(ext => pathname.endsWith(ext))) return true
    
    // Pattern match for PWA icons
    if (/^\/icon-.*\.png$/.test(pathname)) return true
    
    return false
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    
    // Skip auth for public paths
    if (isPublicPath(pathname)) {
        return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user && (pathname === '/login' || pathname === '/login-email')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    // Run middleware on all routes - we handle public path filtering in the middleware function
    matcher: [
        '/((?!_next/static|_next/image).*)'
    ],
}
