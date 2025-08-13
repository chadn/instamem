# InstaMem Development Guide

## Table of Contents

- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Initial Setup](#initial-setup)
- [Development Commands](#development-commands)
  - [Core Commands](#core-commands)
  - [Database Commands](#database-commands)
  - [Memory Management](#memory-management)
- [Project Structure](#project-structure)
- [Configuration Files](#configuration-files)
  - [Environment Variables (.env.local)](#environment-variables-envlocal)
  - [TypeScript Configuration](#typescript-configuration)
  - [ESLint Configuration](#eslint-configuration)
- [Development Workflow](#development-workflow)
  - [Feature Development](#feature-development)
  - [Database Changes](#database-changes)
- [Testing Strategy](#testing-strategy)
  - [Current Testing](#current-testing)
  - [Planned Testing (1.0.0)](#planned-testing-100)
- [Code Style Guidelines](#code-style-guidelines)
  - [TypeScript](#typescript)
  - [React Components](#react-components)
  - [Database Queries](#database-queries)
- [Debugging](#debugging)
  - [Common Issues](#common-issues)
  - [Development Tools](#development-tools)
- [Performance Considerations](#performance-considerations)
  - [Development Environment](#development-environment)
  - [Build Optimization](#build-optimization)
- [Deployment Preparation](#deployment-preparation)
  - [Pre-deployment Checklist](#pre-deployment-checklist)
  - [Production Environment Variables](#production-environment-variables)
- [Contributing Guidelines](#contributing-guidelines)
  - [Code Quality](#code-quality)
  - [Documentation](#documentation)
  - [Git Workflow](#git-workflow)

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### Initial Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd instamem
   npm install
   ```

2. **Create Supabase project**

   - Create new Supabase project under your organization
   - Note your project ID and password
   - Copy your anon public key from https://supabase.com/dashboard/project/_/settings/api-keys
   - Enable Email Provider (login by email+password) in [Auth Providers](https://supabase.com/dashboard/project/_/auth/providers)
     - Make sure "Confirm email" and other switches are off, then click "Save"
   - Configure URL settings in [Auth Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration):
     - Site URL: `http://localhost:3000/`
     - Redirect URLs: `http://localhost:3000/auth/callback`

3. **Environment configuration**
   ```bash
   cat <<EOF > .env.local
   SUPABASE_PROJECT_ID=your_project_id_here
   SUPABASE_PROJECT_PASSWD=your_project_password_here
   # NEXT_PUBLIC_ prefix makes variables accessible to frontend
   NEXT_PUBLIC_SUPABASE_URL=https://your_project_id_here.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   EOF
   ```

4. **Database setup**
   ```bash
   npm run db setup
   ```

5. **Configure OAuth providers in Supabase** (optional, for Google/GitHub login)
   
   Go to your Supabase project dashboard → **Authentication** → **Providers**
   https://supabase.com/dashboard/project/_/auth/providers
   
   **Google OAuth:**
   - Enable the Google provider
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create/select project → Dashboard → APIs & Services → Create Credentials → Create OAuth client ID
   - Set Authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase
   
   **GitHub OAuth:**
   - Enable the GitHub provider  
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create new OAuth App with callback: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase
   
   **Site URL Settings:**
   - Set Site URL to `http://localhost:3000` (development)
   - Add `http://localhost:3000/auth/callback` to Redirect URLs

6. **Start development server**
   ```bash
   npm run dev
   ```

## Development Commands

### Core Commands
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
# TypeScript checking is included in npm run build
```

### Database Commands
```bash
npm run db setup          # Initialize database with tables and seed data
npm run db reset          # Drop all tables and recreate  
npm run db seed           # Seed data only
npm run db check          # Verify database connection and structure
npm run db seed-test-user # Create test@instamem.local for running tests
```

### Memory Management
```bash
npm run memories     # CLI tool to add memories manually
```

### Testing Commands
```bash
# All tests
npm test                  # Run unit + E2E tests
npm run test:unit         # Unit tests only (~1s)
npm run test:unit:watch   # Unit tests in watch mode
npm run test:e2e          # E2E tests (~90s)
npm run test:e2e:ui       # E2E interactive mode

# Cross-browser testing
npm run test:e2e:all-browsers  # Test Firefox, WebKit, mobile

# Target specific E2E areas
npm run test:e2e -- --grep "auth"      # Authentication flows
npm run test:e2e -- --grep "search"    # Search functionality  
npm run test:e2e -- --grep "memory"    # Memory management
```

## Project Structure

```
instamem/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── login/           # Authentication pages
│   │   └── auth/callback/   # OAuth callback handler
│   ├── components/
│   │   ├── ui/              # ShadCN UI components
│   │   └── [feature]/       # Feature-specific components
│   ├── lib/
│   │   ├── supabase/        # Supabase client configuration
│   │   └── utils.ts         # Utility functions
│   ├── types/
│   │   └── database.ts      # TypeScript database types
│   ├── hooks/               # Custom React hooks
│   └── providers/           # React context providers
├── scripts/
│   ├── memories.ts          # CLI memory creation tool
│   └── db-setup.sh          # Database setup automation
├── docs/                    # Documentation
└── public/                  # Static assets
```

## Configuration Files

### Environment Variables (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_PROJECT_PASSWD=your-project-password
```

### TypeScript Configuration
- `tsconfig.json` - Main TypeScript configuration
- Path aliases configured for clean imports
- Strict mode enabled for type safety

### ESLint Configuration
- Next.js recommended rules
- TypeScript-aware linting
- Custom rules for project conventions

## Development Workflow

### Feature Development
1. **Create feature branch**
   ```bash
   git checkout -b feature/memory-search
   ```

2. **Update roadmap** (if needed)
   - Mark feature as in-progress in `docs/roadmap.md`
   - Create feature documentation in `docs/features/`

3. **Implement feature**
   - Follow TypeScript best practices
   - Use existing UI components from `src/components/ui/`
   - Add proper error handling

4. **Test locally**
   ```bash
   npm run lint
   npm run build  # includes TypeScript checking
   ```

5. **Update documentation**
   - Add learnings to feature documentation
   - Update `docs/CHANGELOG.md` when complete

### Database Changes
1. **Modify schema** in `db/setup-database.sql`
2. **Test changes** with `npm run db reset && npm run db setup`
3. **Update types** in `src/types/database.ts`
4. **Update documentation** in `docs/technical/database.md`

## Testing Strategy

### Current Testing
- Manual testing via CLI tools
- Database integrity checks
- Basic smoke testing

### Planned Testing (1.0.0)
- Jest + React Testing Library
- Supabase integration tests
- End-to-end testing with Playwright

## Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper error handling with typed errors

### React Components
- Functional components with hooks
- Use ShadCN UI components as base
- Implement proper loading and error states

### Database Queries
- Use Supabase TypeScript client
- Implement proper error handling
- Follow RLS patterns for security

## Debugging

### Common Issues

**Authentication Problems**
```bash
# Check Supabase configuration
npm run db check

# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

**Database Connection Issues**
```bash
# Reset database
npm run db reset

# Check Supabase dashboard for errors
# Verify RLS policies are not blocking queries
```

**TypeScript Errors**
```bash
# Check type definitions
npm run build  # TypeScript checking included

# Regenerate database types if schema changed
npx supabase gen types typescript --local > src/types/database.ts
```

### Development Tools

**Browser DevTools**
- React Developer Tools extension
- Network tab for API debugging
- Application tab for localStorage/auth state

**Supabase Dashboard**
- SQL Editor for query testing
- Authentication logs
- Database performance monitoring

**VS Code Extensions**
- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
-   claude code, github copilot

### Iterating with Service Workers

When iterating over code changes, service worker may have old code and data cached that needs updating.

- Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- Disable cache: DevTools → Network tab → "Disable cache" checkbox
- Chrome DevTools → Application tab → Storage → "Clear site data"
- Incognito/Private window: Bypasses all caching

For service worker specifically:

-   DevTools → Application → Service Workers → "Update on reload"
-   Or manually click "Unregister" to force re-registration

## Performance Considerations

### Development Environment
- Hot reload should be fast (< 2s for most changes)
- Type checking runs in background
- ESLint provides immediate feedback

### Build Optimization
- Next.js automatic code splitting
- Image optimization enabled
- Bundle analyzer available via `npm run analyze`

## Deployment Preparation

### Pre-deployment Checklist
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Build completes successfully
- [ ] Environment variables configured
- [ ] Database migrations applied

### Production Environment Variables
```bash
# Required for Vercel deployment
NEXT_PUBLIC_SUPABASE_URL=production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production-key
```

## Contributing Guidelines

### Code Quality
1. Write TypeScript with proper types
2. Follow existing component patterns
3. Add proper error handling
4. Document complex logic with comments

### Documentation
1. Update feature docs when implementing
2. Add learnings to roadmap
3. Update CHANGELOG when shipping
4. Keep technical docs current

### Git Workflow
1. Feature branches from main
2. Descriptive commit messages
3. Clean up commits before merging
4. Update version in package.json for releases