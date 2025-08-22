# Authentication

_See [roadmap.md](../roadmap.md) for version, priority, status, and effort estimates_

**Learning Focus:** OAuth flows, JWT tokens, Row-Level Security policies

## Table of Contents

-   [What It Does](#what-it-does)
-   [Why This Version/Priority](#why-this-versionpriority)
-   [Implementation Approach](#implementation-approach)
-   [Key Technology Choices](#key-technology-choices)
-   [Integration Points](#integration-points)
-   [Dependencies](#dependencies)
-   [Success Criteria](#success-criteria)
-   [What I Learned](#what-i-learned)
-   [What Worked Well](#what-worked-well)
-   [What I'd Do Differently](#what-id-do-differently)
-   [Discussion Points for Others](#discussion-points-for-others)

## What It Does

User authentication via Google and GitHub OAuth using Supabase Auth, enabling secure access to personal memories with automatic user isolation.

## Why This Version/Priority

Essential foundation for any personal data application. Without proper authentication, memories cannot be securely attributed to users. OAuth provides seamless signup/login experience.

## Implementation Approach

-   Supabase Auth handles OAuth flows and JWT token management
-   Next.js middleware validates authentication state on protected routes
-   Browser Client and server-side Supabase clients for different contexts
-   Row-Level Security (RLS) policies ensure database-level user isolation

## Key Technology Choices

-   **Supabase Auth**: Chose over NextAuth.js for simpler integration with Supabase database
-   **OAuth Providers**: Google and GitHub for broad user coverage without passwords
-   **JWT Storage**: Automatic handling via Supabase client with secure httpOnly cookies

## Integration Points

-   Middleware protects all routes except `/`, `/login`, `/login-email`, and OAuth callbacks
-   User context provider makes auth state available throughout app
-   Database queries automatically filter by authenticated user via RLS

## Dependencies

-   Supabase project with OAuth providers configured
-   Google Cloud Console OAuth credentials
-   GitHub OAuth app configuration

## Success Criteria

_Status tracked in [Feature Status Table](../roadmap.md#feature-status-table)_

-   Users can sign in with Google OAuth
-   Users can sign in with GitHub OAuth
-   Authentication state persists across browser sessions
-   Protected routes redirect unauthenticated users to login
-   RLS policies prevent cross-user data access

---

## What I Learned

-   **RLS Policies**: Database-level security is more robust than application-level checks
-   **Supabase Auth**: The `@supabase/ssr` package handles SSR authentication complexities elegantly
-   **Next.js Middleware**: Perfect for route protection without component-level auth checks

## What Worked Well

-   **Supabase Integration**: Seamless connection between auth and database with generated types
-   **OAuth Setup**: Google and GitHub OAuth configuration was straightforward
-   **User Experience**: Zero-friction signup process encourages immediate usage

## What I'd Do Differently

-   **User Onboarding**: Could add initial setup flow to explain the tagging system
-   **Profile Management**: Basic user profile/settings management would be useful
-   **Session Management**: More granular control over session duration and refresh

## Discussion Points for Others

-   **Database vs Application Security**: RLS policies provide defense-in-depth but require understanding PostgreSQL security model
-   **OAuth vs Magic Links**: OAuth reduces friction but requires external provider setup
-   **SSR Authentication**: Managing auth state across server/client boundary in Next.js requires careful client configuration
