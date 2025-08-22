# AGENT.md

This file provides guidance to AI LLMs (Cursor, Claude Code claude.ai/code, Github Copilot, etc) when working with code in this repository.

## Project Overview

InstaMem is a personal memory assistant with 4 goals:

1. **INSTANT Search** — Zero-latency results and **Offline use**, uses local data storage sync'd with DB when online [implemented 0.2.0]
2. **Customizable Memories** — Users define content and **custom tag categories** [implemented 0.2.0]
3. **AI Assisted Memory Management** — Users can use natural language to update or create memories [planned 0.5.0]
4. **Advanced Tag Handling** — Smart tag management and search refinement [planned 0.5.0]

**Current Implementation (0.2.0):**
- React Next.js frontend with Supabase backend
- Offline-first search using cached data with Fuse.js for instant results
- UI-based memory creation with custom tagging system
- CLI tools for database configuration and memory management

**Planned Architecture (0.5.0+):**
- Separate instamem-server repository for AI-powered memory processing
- Enhanced tag search results and tag cloud management
- See [System Architecture](docs/technical/architecture.md) for detailed design

## Architecture

See [System Architecture](docs/technical/architecture.md) for detailed system design.

## Development Status 

See [Feature Roadmap](docs/roadmap.md) for current feature status and implementation timeline.

## Key Implementation Details

-   **Authentication**: Supabase Auth with Google/GitHub OAuth - see [Authentication](docs/features/authentication.md)
-   **Search**: Offline-first search with Fuse.js - see [Search](docs/features/search.md)  
-   **Memory Management**: UI and CLI-based memory creation - see [Usage Guide](docs/usage.md)
-   **Security**: Row-Level Security (RLS) policies - see [Database Design](docs/technical/database.md)
-   **Testing**: Comprehensive test suite - see [Testing Strategy](docs/tests.md)

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

-   2 spaces indentation
-   120 character line limit
-   Single quotes, no semicolons, trailing commas
-   Use TypeScript strict mode
-   NEVER use `@ts-ignore` without strong justification
-   Use JSDoc docstrings for documenting TypeScript definitions, not `//` comments
-   Imports: Use consistent-type-imports
-   Prefer functional programming patterns
-   Use TypeScript interfaces for public APIs
-   Follow existing ShadCN UI and Tailwind patterns

## Testing

-   **Unit Tests**: Use Vitest for fast business logic testing
-   **E2E Tests**: Use Playwright for comprehensive user workflow testing
-   Always add tests for new functionality
-   Mock external dependencies (Supabase, external APIs) appropriately
-   Test offline functionality when adding PWA features

## Security

-   Never commit secrets or API keys to repository
-   Use environment variables for sensitive data (`.env.local`)
-   Validate all user inputs on both client and server
-   Follow principle of least privilege
-   Use Supabase RLS policies for data isolation
-   Ensure proper JWT token validation

## Project-Specific Notes

-   Follow existing patterns in `src/components/ui/` for new UI components
-   Use `src/lib/supabase-*.ts` utilities for database interactions
-   Maintain offline-first approach - ensure features work without network
-   Use the established testing patterns in `tests/` directory
-   CLI tools in `scripts/` should be TypeScript with tsx runner
