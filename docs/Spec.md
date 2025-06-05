# About

Specs from convo with ChatGPT

## TODO/DONE

MVP

-   🔹 Hosting
    -   ✅ Database hosting: Supabase (PostgreSQL + optional GraphQL)
    -   🔄 App hosting: Vercel is a great choice for frontend + edge functions
-   🔹 **Datastore**
    -   ✅ PostgreSQL schema defined with `tag_keys`, `tag_values`, `memories`, `memory_tag`
    -   ✅ Search methods chosen:
        -   `ILIKE` for partial matches
        -   `to_tsvector` for full-text search
        -   Future: `pg_trgm` for fuzzy search
        -   Future: `pgvector` for semantic search
    -   🔄 Local caching (recent searches): planned
-   🔹 **Search (Reads)**
    -   🔄 React input: use `react-instantsearch` or custom component
    -   🔄 Add debounce (~500–1000ms) before query
    -   🔄 API hookup:
        -   Option 1: GraphQL (via Hasura or Supabase Edge)
        -   Option 2: Direct SQL/REST via Supabase functions or RPC
    -   🧠 Need to decide: query structure, result shape, search UX to give best UX and control
-   🔹 **Memory Entry (Writes)**
    -   🔄 Use OpenAI API to convert free-form text → structured memory
    -   🔄 Needs:
        -   Prompt template
        -   Output parsing and tag validation
        -   UI for confirming/correcting structured result
    -   🧠 Consider fallback if model output is uncertain
-   🔹 **Advanced (Later)**
    -   🔲 **Semantic search**: Add `pgvector` and OpenAI or open-source embeddings (e.g., `text-embedding-3-small`)
    -   🔲 Fuzzy search with `pg_trgm` (for typos, similarity)
    -   🔲 Offline search with Fuse.js and cached JSON of memories/tags

## Database

Postgres setup, etc

### 1. Full SQL DDL with Indexes & Constraints

This includes schema, relationships, constraints, and performance-oriented indexes.

```
-- Enable extensions for full-text and fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ===============================
-- Table: tag_keys (tag categories)
-- ===============================
CREATE TABLE tag_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (char_length(name) <= 21),
    description TEXT CHECK (char_length(description) <= 128)
);

-- ===============================
-- Table: tag_values (tag instances)
-- ===============================
CREATE TABLE tag_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tag_keys(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (char_length(text) <= 42),
    UNIQUE(tag_id, text)  -- Prevent duplicate values under same key
);

-- ===============================
-- Table: memories
-- ===============================
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    memory_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    url TEXT
);

-- ===============================
-- Table: memory_tag (many-to-many)
-- ===============================
CREATE TABLE memory_tag (
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tag_values(id) ON DELETE CASCADE,
    PRIMARY KEY (memory_id, tag_id)
);

-- ===============================
-- Indexes for search & performance
-- ===============================

-- For fast filtering by tag name
CREATE INDEX idx_tag_keys_name ON tag_keys(name);

-- For fast lookup of tag values per key
CREATE INDEX idx_tag_values_tag_id ON tag_values(tag_id);

-- For fast lookup by tag value text (case-insensitive)
CREATE INDEX idx_tag_values_text ON tag_values(text);
CREATE INDEX idx_tag_values_text_trgm ON tag_values USING gin (text gin_trgm_ops);

-- For fast memory lookup by user/date
CREATE INDEX idx_memories_user_date ON memories(user_id, memory_date);

-- Full-text search on content
CREATE INDEX idx_memories_content_fts ON memories USING gin(to_tsvector('english', content));

-- Optional: trigram index for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tag_values_text_trgm ON tag_values USING gin (text gin_trgm_ops);
```

🔍 Fuzzy Search Example

```
-- Find tag values similar to 'chad'
SELECT * FROM tag_values
WHERE text % 'chad'
ORDER BY similarity(text, 'chad') DESC;
```

🔍 Full-text Search on Memory Content

```
-- Basic full-text search
SELECT * FROM memories
WHERE to_tsvector('english', content) @@ plainto_tsquery('remember project');

-- Rank and return top 5
SELECT *, ts_rank(to_tsvector('english', content), plainto_tsquery('project')) AS rank
FROM memories
WHERE to_tsvector('english', content) @@ plainto_tsquery('project')
ORDER BY rank DESC
LIMIT 5;
```

🔎 2. Sample Queries for Efficient Search
🔹 Search by tag type and partial match (e.g. “person:cha”)

```
SELECT tv.*
FROM tag_values tv
JOIN tag_keys tk ON tv.tag_id = tk.id
WHERE tk.name = 'person'
  AND tv.text ILIKE '%cha%';
```

🔹 Find all memories tagged with a specific value (e.g. tag_values.id = 'abc')

```
SELECT m.*
FROM memories m
JOIN memory_tag mt ON m.id = mt.memory_id
WHERE mt.tag_id = 'abc';
```

🔹 Find memories matching multiple tag values (e.g., “person:chad” AND “place:home”)

```
SELECT m.*
FROM memories m
JOIN memory_tag mt ON m.id = mt.memory_id
WHERE mt.tag_id IN ('uuid1', 'uuid2')
GROUP BY m.id
HAVING COUNT(DISTINCT mt.tag_id) = 2; -- both tags must match
```

🔹 Full-text search on memory content

```
SELECT *
FROM memories
WHERE to_tsvector('english', content) @@ plainto_tsquery('project');
```

🔹 Fuzzy tag value search with similarity

```
SELECT *
FROM tag_values
WHERE text % 'home'
ORDER BY similarity(text, 'home') DESC
LIMIT 5;
```

### GraphQL Schema Design (if using Hasura or PostGraphile)

If using Hasura, your tables will be auto-exposed. Here’s how that would map:

Sample query graphql:

```
query {
  tag_values(where: {
    tag_key: { name: { _eq: "person" } }
    text: { _ilike: "%cha%" }
  }) {
    id
    text
    tag_key {
      name
    }
  }
}
```

Sample nested memory query:

```
query {
  memories(where: {
    memory_tags: {
      tag_value: {
        text: { _eq: "chad" }
      }
    }
  }) {
    id
    content
    memory_date
    memory_tags {
      tag_value {
        text
        tag_key {
          name
        }
      }
    }
  }
}
```

You’ll need to define relationships in Hasura:

-   tag_values.tag_key → tag_keys
-   memory_tag.memory → memories
-   memory_tag.tag_value → tag_values

### 🛠️ 4. REST API Tips (if not using GraphQL)

If building your own backend (e.g., Express + Supabase/Postgres), suggested endpoints:

`GET /tags?type=person&search=chad`
Returns all tag values of type “person” matching “chad”

`GET /memories?tagIds=uuid1,uuid2`
Get all memories linked to specified tags

`POST /memories`
Create a new memory with:

```
{
  "content": "Worked on Supabase with Chad at home",
  "memory_date": "2025-06-04T14:00:00Z",
  "tags": [
    { "key": "person", "value": "Chad" },
    { "key": "place", "value": "home" },
    { "key": "content", "value": "Supabase" }
  ]
}
```

Backend would:

Look up or insert tag_keys and tag_values

Create memory_tag entries for all
