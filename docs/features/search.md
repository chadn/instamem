# Search

_See [roadmap.md](../roadmap.md) for version, priority, status, and effort estimates_

**Learning Focus:** Full-text search, PostgreSQL performance, real-time UI patterns

## Table of Contents

-   [What It Does](#what-it-does)
-   [Current State (0.1.0)](#current-state-010)
-   [Next Steps (0.2.0)](#next-steps-020)
-   [Architecture Decision: Client-Side Search](#architecture-decision-client-side-search)
-   [What I Learned](#what-i-learned)

## What It Does

Real-time search that finds memories as you type using keyword matching.

_Status tracked in [Feature Status Table](../roadmap.md#feature-status-table)_

## Current State (0.2.0)

-   Offline-first search powered by cached data with Fuse.js
-   500ms debounced input for a responsive feel
-   Sync manager keeps a local copy of your memories for offline search
-   RLS ensures users only cache and search their own memories
-   **Search term highlighting**: Partial match highlighting in content, URLs, and tags

## Future Enhancements

-   Online search path using PostgreSQL full-text search with `to_tsvector`
-   Add search filters by tags and date
-   Performance optimizations
-   **Rich demo content**: See [Demo Data Strategy](demo-data.md) for diverse content examples that showcase search capabilities across different use cases (DJ collections, curated lists, professional notes, personal memories)

## Architecture Decision: Client-Side Search

**Decision**: Use direct Supabase client queries instead of API routes for memory search.

**Rationale**:

-   **Better performance** - Direct database connection, no extra HTTP hop
-   **RLS security** - Row-Level Security automatically filters to user's data
-   **Simpler architecture** - Fewer moving parts, easier to debug
-   **Lower costs** - Less server compute usage

**Trade-offs**:

-   Database structure visible to client (acceptable for read-only search)
-   Client controls query complexity (mitigated by RLS and reasonable limits)

## What I Learned

-   **ILIKE Search**: Simple but effective for MVP - case-insensitive, works with partial matches
-   **Debouncing**: 500ms delay gives real-time feel without excessive API calls. For local, using 100ms to feel "instant".
-   **Direct DB Queries**: Supabase client queries are fast enough for real-time search
-   **RLS Protection**: Client-side queries are secure when RLS policies are properly configured
-   **Search Highlighting**: Client-side partial match highlighting is surprisingly simple (~50 lines) and works offline, providing Algolia-like UX without external dependencies
