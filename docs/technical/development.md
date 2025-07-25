# InstaMem Development Guide

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

2. **Environment configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Database setup**
   ```bash
   npm run db setup
   ```

4. **Start development server**
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
npm run type-check   # Run TypeScript checks
```

### Database Commands
```bash
npm run db setup     # Initialize database with tables and seed data
npm run db reset     # Drop all tables and recreate
npm run db seed      # Seed data only
npm run db check     # Verify database connection and structure
```

### Memory Management
```bash
npm run add-memories # CLI tool to add memories manually
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
│   ├── add-memories.ts      # CLI memory creation tool
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
   npm run type-check
   npm run build
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
npm run type-check

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