# Memory Search
*See [roadmap.md](../roadmap.md) for version, priority, status, and effort estimates*

**Learning Focus:** Full-text search, PostgreSQL performance, real-time UI patterns

## What It Does
Real-time search that finds memories as you type using keyword matching.

## Current State (0.1.0)
- Basic keyword search with ILIKE pattern matching
- 500ms debounced queries for responsive feel
- Direct Supabase queries with RLS security

- RLS ensures users only search their own memories
## Next Steps (0.2.0)
- Upgrade to PostgreSQL full-text search with `to_tsvector`
- Add search filters by tags and date
- Implement search result highlighting

## Architecture Decision: Client-Side Search

**Decision**: Use direct Supabase client queries instead of API routes for memory search.

**Rationale**:
- ✅ **Better performance** - Direct database connection, no extra HTTP hop
- ✅ **RLS security** - Row-Level Security automatically filters to user's data
- ✅ **Simpler architecture** - Fewer moving parts, easier to debug
- ✅ **Lower costs** - Less server compute usage

**Trade-offs**:
- Database structure visible to client (acceptable for read-only search)
- Client controls query complexity (mitigated by RLS and reasonable limits)

## What I Learned
- **ILIKE Search**: Simple but effective for MVP - case-insensitive, works with partial matches
- **Debouncing**: 500ms delay gives real-time feel without excessive API calls
- **Direct DB Queries**: Supabase client queries are fast enough for real-time search
- **RLS Protection**: Client-side queries are secure when RLS policies are properly configured