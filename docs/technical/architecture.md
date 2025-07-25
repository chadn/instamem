# InstaMem System Architecture

## Overview

InstaMem follows a two-tier architecture with separate frontend and backend repositories, connected through a shared Supabase database.

## System Diagram

```
                   🧠 InstaMem System Architecture

┌───────────────────────────┐                    ┌──────────────────────────┐
│       React Frontend      │ ───── Auth ──────▶ │      Supabase DB         │
│     (Runs in Browser)     │ ◀───── JWT ─────── │ (Postgres + Auth + RLS)  │
│      JWT used for auth    │                    │                          │
│     in reads and updates  │ ────── read ─────▶ │                          │
└────────────┬──────────────┘                    └────────┬────┬────────────┘
             │  update                                    ▲    ▲
             ▼                                            │    │
     ┌─────────────────────────────┐                      │    └ CLI for
     │    LangChain API Server     │                      │     db setup,
     │ (Python FastAPI backend)    │                      │    add-memories
     └────────┬─────────┬──────────┘                      │
              │         │                                 │
              │         └──▶ Second, Update DB via Tool ──┘
              │ First,
              │ Parse Text to Structured Data via Tool Function
              │      ┌──────────────────────────────┐
              └─────▶│     OpenAI/Gemini/etc API    │
                     │   (Calls Tool Functions to   │
                     │      update Supabase DB)     │
                     └──────────────────────────────┘
```

## Component Responsibilities

### React Frontend (instamem)

-   **Authentication**: Supabase Auth with Google/GitHub OAuth
-   **Search Interface**: Real-time memory search with debouncing
-   **Data Reads**: Direct Supabase queries for search and display
-   **User Interface**: ShadCN UI components with Tailwind CSS
-   **Deployment**: Vercel with automatic deployments

### LangChain API Server (instamem-server)

-   **Memory Processing**: Natural language to structured data conversion
-   **AI Integration**: OpenAI/LangChain for text parsing and tagging
-   **Database Updates**: Authenticated writes to Supabase using JWT
-   **Tool Functions**: Structured memory creation with tags
-   **Deployment**: Render or similar Python hosting

### Supabase Database

-   **Authentication**: User management and JWT token validation
-   **Data Storage**: PostgreSQL with full-text search capabilities
-   **Security**: Row-Level Security (RLS) policies for user isolation
-   **Performance**: Optimized indexes for search operations

## Data Flow

### Memory Search (Read Path)

1. User enters search query in React frontend
2. Frontend queries Supabase directly with user's JWT
3. RLS policies ensure user only sees their own memories
4. Results returned with full-text search ranking
5. UI displays results with highlighting and tags

### Memory Creation (Write Path)

1. User enters natural language text in React frontend
2. Frontend sends text to LangChain API server
3. Server uses OpenAI to parse text into structured data
4. Server calls tool functions to update Supabase
5. Database updates with proper user attribution via JWT
6. Frontend receives confirmation and updates UI

## Technology Stack

### Frontend

-   **Framework**: Next.js 14 with App Router
-   **UI Library**: ShadCN UI + Tailwind CSS
-   **State Management**: React Context + TanStack Query
-   **Authentication**: Supabase Auth (@supabase/ssr)
-   **Type Safety**: Full TypeScript with generated types

### Backend

-   **Framework**: FastAPI (Python)
-   **AI/ML**: LangChain + OpenAI API
-   **Database Client**: Supabase Python SDK
-   **Authentication**: JWT validation with Supabase
-   **Deployment**: Render with automatic deploys

### Database

-   **Platform**: Supabase (managed PostgreSQL)
-   **Search**: Full-text search with `tsvector` indexes
-   **Security**: Row-Level Security policies
-   **Extensions**: `pg_trgm` for fuzzy search, `pgvector` (future)

## Security Architecture

### Authentication Flow

1. User authenticates via OAuth (Google/GitHub) in frontend
2. Supabase returns JWT token with user claims
3. Frontend stores JWT securely and includes in requests
4. Backend validates JWT against Supabase for write operations
5. RLS policies enforce data isolation at database level

### Data Protection

-   **Transport**: HTTPS/TLS for all communications
-   **Storage**: PostgreSQL with encrypted at rest
-   **Access Control**: RLS policies prevent cross-user data access
-   **API Security**: JWT validation on all backend endpoints

## Deployment Architecture

### Production Environment

-   **Frontend**: Vercel with global CDN
-   **Backend**: Render with auto-scaling
-   **Database**: Supabase with global read replicas
-   **Monitoring**: Built-in platform monitoring

### Development Environment

-   **Frontend**: Next.js dev server (localhost:3000)
-   **Backend**: Local Python server or cloud development
-   **Database**: Shared Supabase instance with separate tables/RLS

## Scalability Considerations

### Current (0.1.0)

-   Single-user focused with simple architecture
-   Direct database queries for reads
-   Minimal caching requirements

### Future (1.0.0+)

-   Implement Redis caching for frequent searches
-   Database read replicas for search performance
-   CDN caching for static assets and API responses
-   Horizontal scaling of LangChain servers

## Migration Strategy

The architecture supports gradual evolution:

1. **Phase 1**: Simple CLI-based memory creation
2. **Phase 2**: Add LangChain server for AI processing
3. **Phase 3**: Advanced search with vector embeddings
4. **Phase 4**: Multi-device sync with offline support

Each phase builds on the previous without requiring major architectural changes.
