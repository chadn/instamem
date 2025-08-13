# InstaMem Database Design

## Table of Contents

- [Design Rationale](#design-rationale)
- [Key Query Patterns](#key-query-patterns)
  - [Memory Search](#memory-search)
  - [Tag Filtering](#tag-filtering)
  - [Memory Creation](#memory-creation)
- [Performance Considerations](#performance-considerations)
- [Database Access Patterns](#database-access-patterns)
  - [Client-Side Pattern (Current)](#client-side-pattern-current)
  - [Server-Side Pattern (Future)](#server-side-pattern-future)
- [Database Scripts](#database-scripts)
  - [npm run db](#npm-run-db)
  - [npm run memories](#npm-run-memories)
- [Future Optimizations](#future-optimizations)

## Design Rationale

### Flexible Tagging System

Instead of fixed fields like "person" or "location", InstaMem uses a flexible tag system:

-   **tag_keys**: Categories like `person`, `place`, `feeling`
-   **tag_values**: Specific instances like `Sarah`, `coffee shop`, `happy`
-   **memory_tag**: Many-to-many relationship allowing multiple tags per memory

This allows users to create their own organizational system while supporting structured queries.

**Why This Approach?**

-   **Extensible**: Users can add new tag categories without schema changes
-   **Searchable**: Can query by tag category ("all people") or specific tags ("memories with Sarah")
-   **Natural**: Matches how people naturally think about organizing memories

## Key Query Patterns

### Basic Search

```sql
-- Simple keyword search (current)
SELECT * FROM memories
WHERE content ILIKE '%coffee%' AND user_id = auth.uid()
ORDER BY memory_date DESC;

-- Full-text search (planned for 0.2.0)
SELECT *, ts_rank(to_tsvector('english', content), plainto_tsquery('coffee')) AS rank
FROM memories
WHERE to_tsvector('english', content) @@ plainto_tsquery('coffee')
ORDER BY rank DESC;
```

### Tag Queries

```sql
-- Find memories tagged with specific person
SELECT m.* FROM memories m
JOIN memory_tag mt ON m.id = mt.memory_id
JOIN tag_values tv ON mt.tag_id = tv.id
JOIN tag_keys tk ON tv.tag_id = tk.id
WHERE tk.name = 'person' AND tv.text = 'Sarah';

-- Get all people mentioned in memories
SELECT tv.text, COUNT(*) as mentions FROM tag_values tv
JOIN tag_keys tk ON tv.tag_id = tk.id
JOIN memory_tag mt ON tv.id = mt.tag_id
WHERE tk.name = 'person'
GROUP BY tv.text ORDER BY mentions DESC;
```

## Performance Considerations

**Current Indexes** (see `db/setup-database.sql` for full schema):

-   Full-text search: `gin(to_tsvector('english', content))`
-   User/date lookup: `(user_id, memory_date)`
-   Tag searches: indexes on tag names and values

## Database Access Patterns

### Two Different Keys, Two Different Purposes

**NEXT_PUBLIC_SUPABASE_ANON_KEY** (Browser-safe):

-   Used in frontend code and CLI scripts
-   Respects Row-Level Security (RLS) policies
-   Users can only access their own data
-   Safe to expose in browser/client-side code
-   Example: User searches only return their own memories

**SUPABASE_SERVICE_ROLE_KEY** (Server-only):

-   Bypasses all RLS policies
-   Used for database setup and admin operations
-   **Never exposed to browsers or client code**
-   Example: `db-setup.sh` script creates tables and seeds data

### RLS Security Model

All user data tables use Row-Level Security policies that automatically filter by `auth.uid()`. This means:

-   Frontend queries with anon key are automatically scoped to the authenticated user
-   No risk of data leakage between users, even with client-side queries
-   Database-level security that can't be bypassed by application bugs

## Database Scripts

For complete database command reference, see [Development Commands](development.md#database-commands) section.

**Quick Reference:**
- `npm run db setup` - Initialize database with schema and seed data
- `npm run memories` - CLI tool to add memories manually

## Future Optimizations

-   Created `db/seed-feelings.sql` with 200+ feeling words, Ready for autocomplete functionality with hover tooltips
-   `pg_trgm` for fuzzy search
-   `pgvector` for semantic similarity
-   Materialized views for tag statistics
