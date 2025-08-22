# InstaMem System Architecture

## Table of Contents

-   [Overview](#overview)
-   [System Diagram](#system-diagram)
-   [Component Responsibilities](#component-responsibilities)
    -   [React Frontend (instamem)](#react-frontend-instamem)
    -   [LangChain API Server (instamem-server)](#langchain-api-server-instamem-server)
    -   [Supabase Database](#supabase-database)
-   [Data Flow](#data-flow)
    -   [Search (Read Path)](#search-read-path)
    -   [Memory Creation (Write Path)](#memory-creation-write-path)
-   [Technology Stack](#technology-stack)
    -   [Frontend](#frontend)
    -   [Backend](#backend)
    -   [Database](#database)
-   [Security Architecture](#security-architecture)
    -   [Authentication Flow](#authentication-flow)
    -   [Data Protection](#data-protection)
-   [Deployment Architecture](#deployment-architecture)
    -   [Production Environment](#production-environment)
    -   [Development Environment](#development-environment)
-   [Scalability Considerations](#scalability-considerations)
    -   [Current (0.1.0)](#current-010)
    -   [Future (1.0.0+)](#future-100)
-   [Migration Strategy](#migration-strategy)
-   [Investigations](#investigations)
    -   [Algolia for InstaMem: Analysis](#algolia-for-instamem-analysis)

## Overview

Current plan (as of 0.2.0) is to have 2 repos, instamem (this one) and instamem-server.

### instamem

**Current Architecture (0.2.0):** Single-repository Next.js application with Supabase backend, built on three core principles:

1. **INSTANT Search** — Local-first data storage enables zero-latency search results
2. **Customizable Memories** — Flexible content and user-defined tag categories
3. **Advanced Tag Handling** — Smart tag management and search refinement (coming in 0.5.0)

### instamem-server

**Target Architecture (0.5.0+):** Two-tier architecture with separate frontend and backend repositories, connected through a shared Supabase database.

## System Diagram

**Target Architecture (0.5.0+):**

```
                   🧠 InstaMem Target Architecture

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
     │ (Python FastAPI backend)    │                      │    memories
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

### LangChain API Server (instamem-server) - **Planned for 0.5.0**

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

### Search

**INSTANT Local Search:**

1. User enters search query in React frontend
2. **Zero-latency results** from locally cached data using Fuse.js
3. No network calls required — all data stored in IndexedDB
4. Results appear immediately as user types with fuzzy matching
5. UI displays results with highlighting and tags

**Large Dataset Strategy:**

**0.3.0 - Dataset Creation & UX Experimentation:**
- **Demo data creation**: Generate 1000+ memories with diverse content types
- **UX testing**: Experiment with search interface for large datasets
- **User experience validation**: Test search workflows with realistic data volumes

**0.5.0 - Performance Optimization:**
- **Fuse.js optimization**: Configure search thresholds and indexes for 1000+ memories
- **IndexedDB pagination**: Implement efficient data chunking for large datasets  
- **Memory management**: Optimize React rendering for large result sets
- **Search debouncing**: Fine-tune response times for different dataset sizes

**Background Data Sync:**

1. Sync fetches directly from Supabase with user's JWT
2. Supabase RLS policies ensure user only sees their own memories
3. Background sync keeps local cache updated with latest memories
4. Manual sync button for immediate refresh
5. Automatic sync when connectivity is restored

### AI Memory Creation

**Target for 0.5.0**

1. User enters natural language text in React frontend
2. Frontend sends text to LangChain API server
3. Server uses OpenAI to parse text into structured data
4. Server calls tool functions to update Supabase
5. Database updates with proper user attribution via JWT
6. Frontend receives confirmation and updates UI

### Manual Memory Creation

**Implemented in 0.2.0**

1. User enters memory details in React frontend form
2. Frontend sends structured data directly to Supabase
3. User manually adds tags using autocomplete suggestions
4. Database updates with proper user attribution via RLS

or

1. Admin uses CLI to bulk edit/create memories

## Technology Stack

### Frontend

-   **Framework**: Next.js 15 with App Router
-   **FED Library**: React 19
-   **UI Library**: ShadCN UI + Tailwind CSS
-   **State Management**: React Context providers
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

## Investigations

### Algolia for InstaMem: Analysis

What Algolia Would Provide:

Instant Search Benefits:

-   Sub-100ms search responses globally via their CDN
-   Typo tolerance and fuzzy matching built-in
-   Advanced ranking with customizable relevance
-   Faceted search perfect for tag filtering
-   Search analytics and performance insights

Developer Experience:

-   InstantSearch UI components for React
-   Real-time indexing via webhooks
-   A/B testing for search relevance
-   Dashboard for search analytics and tuning

Architectural Fit:

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  React Frontend │───▶│   Algolia    │    │  Supabase DB    │
│                 │    │   Search     │◀───│                 │
│ - UI components │    │   Index      │    │ - Auth/RLS      │
│ - InstantSearch │    │              │    │ - Memory CRUD   │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

Pros for InstaMem:

✅ Perfect for personal memory search:

-   Handles InstaMem's core use case exceptionally well
-   Natural language queries work better than SQL ILIKE
-   Tag-based faceting is exactly what Algolia excels at

✅ Immediate performance gain:

-   Eliminates the 500ms debounce need
-   True real-time search as you type
-   Scales effortlessly with memory volume

✅ Enhanced search features:

-   "Find memories about Sarah from coffee shops" would work intuitively
-   Automatic highlighting of search terms
-   Search suggestions and autocomplete

Cons & Considerations:

❌ Cost implications:

-   Free tier: 10K search operations/month, 10K records
-   Essential plan: $500/month for 250K operations, 100K records
-   For personal use, likely fits free tier, but could scale quickly

❌ Data privacy concerns:

-   Personal memories stored on Algolia's servers
-   Less control over data residency
-   Additional data processing agreement needed

❌ Architecture complexity:

-   Need to sync Supabase → Algolia
-   Dual write operations (memory to DB + index to Algolia)
-   Potential consistency issues between DB and search index

❌ Offline capabilities:

-   Algolia doesn't support offline search
-   Would complicate the offline strategy significantly

More at https://www.algolia.com/doc/guides/building-search-ui/getting-started/react/
