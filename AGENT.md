# AGENT.md

This file provides guidance to AI LLMs (Cursor, Claude Code claude.ai/code, Github Copilot, etc) when working with code in this repository.

## Project Overview

InstaMem is a personal memory assistant that lets users instantly search memories using keywords. It consists of two separate repositories:

1. **instamem** (React Next.js on Vercel)
    - Supabase auth with JWT tokens
    - Direct Supabase reads for search functionality
    - Calls instamem-server for memory updates
    - Uses ShadCN UI components
    - contains CLI tools to configurate DB and update its data
2. **instamem-server** (Python FastAPI on Render) (planned)
    - LangChain + OpenAI for text-to-structured-data conversion
    - Uses JWT from frontend to authenticate Supabase updates
    - Converts free-form text into structured memories with tags

## Architecture

Currently implemented as a single-repository Next.js application with planned backend separation:

-   **Frontend**: Next.js app handles auth, search (direct Supabase), offline PWA capabilities, and UI
-   **Database**: Supabase PostgreSQL with RLS policies for user isolation
-   **Offline**: IndexedDB + localforage for cached memories, Fuse.js for client-side search
-   **Future Backend**: Python LangChain server for AI-powered memory processing (planned)

## Database Schema

Key tables:

-   `memories`: User content with full-text search indexes
-   `tag_keys`: Tag categories (person, place, feeling, etc.)
-   `tag_values`: Specific tag instances linked to keys
-   `memory_tag`: Many-to-many relationship between memories and tags

Search capabilities:

-   `ILIKE` for partial matches
-   `to_tsvector` for full-text search
-   `pg_trgm` for fuzzy search (planned)
-   `pgvector` for semantic search (planned)

## Development Status

This is the main frontend repository containing a working Next.js application with:

-   React/Next.js with Supabase integration (implemented)
-   ShadCN UI components and Tailwind CSS (implemented)
-   PWA with offline search capabilities (implemented)
-   Comprehensive test suite with Vitest and Playwright (implemented)
-   Database CLI tools for setup and memory management (implemented)

Backend repo (instamem-server) with Python FastAPI + LangChain is planned for future implementation.

## Key Implementation Details

-   **Authentication**: Supabase Auth with Google/GitHub OAuth
-   **Search**: Real-time search with debouncing (~500-1000ms)
-   **Memory Entry**: AI-powered conversion of free-form text to structured data
-   **Security**: Row-Level Security (RLS) policies ensure user data isolation
-   **Hosting**: Vercel (frontend) + Render (backend) + Supabase (database)

## Development Commands

See `package.json` for all available scripts. Key commands:

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run all tests (unit + E2E)
npm run test:unit    # Fast unit tests with Vitest
npm run test:e2e     # Full E2E tests with Playwright
npm run db           # Database setup script
```

## Code Style

### TypeScript/React
- 2 spaces indentation
- 120 character line limit
- Single quotes, no semicolons, trailing commas
- Use TypeScript strict mode
- NEVER use `@ts-ignore` without strong justification
- Use JSDoc docstrings for documenting TypeScript definitions, not `//` comments
- Imports: Use consistent-type-imports
- Prefer functional programming patterns
- Use TypeScript interfaces for public APIs
- Follow existing ShadCN UI and Tailwind patterns

## Testing

- **Unit Tests**: Use Vitest for fast business logic testing
- **E2E Tests**: Use Playwright for comprehensive user workflow testing
- Always add tests for new functionality
- Mock external dependencies (Supabase, external APIs) appropriately
- Test offline functionality when adding PWA features

## Security

- Never commit secrets or API keys to repository
- Use environment variables for sensitive data (`.env.local`)
- Validate all user inputs on both client and server
- Follow principle of least privilege
- Use Supabase RLS policies for data isolation
- Ensure proper JWT token validation

## Project-Specific Notes

- Follow existing patterns in `src/components/ui/` for new UI components
- Use `src/lib/supabase/` utilities for database interactions
- Maintain offline-first approach - ensure features work without network
- Use the established testing patterns in `tests/` directory
- CLI tools in `scripts/` should be TypeScript with tsx runner
