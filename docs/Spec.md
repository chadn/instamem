# About

Specs from convo with ChatGPT

## TODO/DONE

MVP

-   **Hosting**
    -   ✅ Database hosting: Supabase (PostgreSQL + optional GraphQL)
    -   ✅ FE App hosting: Vercel is a great choice for frontend + edge functions
    -   ✅ Langchain Server hosting: Python is ideal for Langchain, [Render supports FastAPI Python](https://render.com/docs/deploy-fastapi)
-   ✅ **User Login**
    -   ✅ Supabase Auth (Google, Github) - Fast and simple
    -   Option B NextAuth.js (best with Next.js + Vercel):
-   ✅ **Datastore**
    -   ✅ PostgreSQL schema defined with `tag_keys`, `tag_values`, `memories`, `memory_tag`
    -   ✅ Search methods chosen:
        -   `ILIKE` for partial matches
        -   `to_tsvector` for full-text search
        -   Future: `pg_trgm` for fuzzy search
        -   Future: `pgvector` for semantic search
    -   🔄 Local caching (recent searches): planned
-   **Search (Reads)**
    -   🔄 React input: use `react-instantsearch` or custom component
    -   🔄 Add debounce (~500–1000ms) before query
    -   🔄 API hookup:
        -   Option 1: GraphQL (via Hasura or Supabase Edge)
        -   Option 2: Direct SQL/REST via Supabase functions or RPC
    -   🧠 Need to decide: query structure, result shape, search UX to give best UX and control
-   **Memory Entry (Writes)**
    -   🔄 Use OpenAI API to convert free-form text → structured memory
    -   🔄 Needs:
        -   Prompt template
        -   Output parsing and tag validation
        -   UI for confirming/correcting structured result
    -   🧠 Consider fallback if model output is uncertain
-   **Advanced (Later)**
    -   🔲 **Semantic search**: Add `pgvector` and OpenAI or open-source embeddings (e.g., `text-embedding-3-small`)
    -   🔲 Fuzzy search with `pg_trgm` (for typos, similarity)
    -   🔲 Offline search with Fuse.js and cached JSON of memories/tags

## Architecture

```
                   🧠 InstaMem System Architecture

┌───────────────────────────┐                    ┌──────────────────────────┐
│       React Frontend      │ ───── Auth ──────▶ │      Supabase DB         │
│     (Runs in Browser)     │ ◀───── JWT ─────── │ (Postgres + Auth + RLS)  │
│      JWT used for auth    │                    │                          │
│     in reads and udpates  │ ────── read ─────▶ │                          │
└────────────┬──────────────┘                    └──────────┬───────────────┘
             │  update                                      ▲
             ▼                                              │
     ┌─────────────────────────────┐                        │
     │    LangChain API Server     │                        │
     │ (Node.js or Python backend) │                        │
     └────────┬───────────┬────────┘                        │
              │           │                                 │
              │           └──▶ Second, Update DB via Tool ──┘
              │ First,
              │ Parse Text to Structured Data via Tool Function
              │      ┌──────────────────────────────┐
              └─────▶│     OpenAI/Gemini/etc API    │
                     │   (Calls Tool Functions to   │
                     │      update Supabase DB)     │
                     └──────────────────────────────┘

```

### One or Two repos

Decided to implement in two repos

-   instamem or instamem-frontend
    -   react next.js deployed on vercel
    -   supabase for auth, gets JWT
    -   UX for calls supabase for reads, instantsearch UI
    -   calls instamem-server for updates, streamlit like UX using [ShadCN](https://ui.shadcn.com/)
-   instamem-server
    -   API server in python
    -   uses python langchain and openAI compatible APIs to do text to tool calling
    -   uses JWT from frontend to update data in supabase

🔍 Why Separate Repos?

| Reason                         | Benefit                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- |
| 📁 **Tech Stack Separation**   | Frontend: JS/TS + React + Vercel<br>Backend: Python + LangChain + Supabase |
| 🚀 **Deployment Independence** | Push frontend to Vercel, backend to Render/Fly independently               |
| 🔐 **Secrets & Auth**          | Manage different `.env` files, API keys separately                         |
| 🛠 **Tooling Compatibility**    | Frontend uses npm/next.config.js; backend uses pip/FastAPI                 |
| 👥 **Team Scaling**            | Frontend & backend devs can work without stepping on each other            |
| 🧪 **Testing & CI/CD**         | Separate test pipelines and CI workflows                                   |

### Node.js or Python for LangChain Server

Both can work, but going with Python

| Feature                        | ✅ Node.js                             | ✅ Python (Recommended)                               |
| ------------------------------ | -------------------------------------- | ----------------------------------------------------- |
| **LangChain SDK support**      | ✅ Partial via `langchainjs`           | ✅ Full support via `langchain`                       |
| **OpenAI integration**         | ✅ Easy with `openai` SDK              | ✅ Mature, native support                             |
| **Supabase SDK**               | ✅ `@supabase/supabase-js`             | ✅ `supabase-py` (official)                           |
| **Developer Experience**       | ✅ Seamless with React (same language) | ❌ Context switch, but Python is cleaner for AI tasks |
| **Tool Use & Agents**          | ❌ Limited tool calling support        | ✅ Full support (e.g. `tool` callbacks, RAG)          |
| **Performance for API server** | ✅ Fast via Vercel/Node runtimes       | ✅ Also fast via FastAPI or Flask                     |
| **Best for AI/NLP workflows**  | ⚠️ Good (growing)                      | ✅ Excellent (LangChain is Python-first)              |

### Consider Streamlit Python for Updates

❌ Not doing due to non-trivial auth in streamlit. Python benefit is realized in Langchain Server

Since updating memories uses AI, it will be easy to do with Streamlit python.
However, auth in streamlit is more complicated.

| Feature                   | React (browser)                    | Streamlit (Python backend)                        |
| ------------------------- | ---------------------------------- | ------------------------------------------------- |
| OAuth login (Google etc.) | ✅ Easy via `signInWithOAuth()`    | ❌ Harder — no built-in UI flow                   |
| Email/password login      | ✅ Supported                       | ✅ Supported (via Python SDK)                     |
| Session tokens            | ✅ Handled automatically (browser) | 🔧 You manage token storage manually in Streamlit |
| Calling Supabase DB       | ✅ Supabase JS client              | ✅ Use Supabase Python client or direct SQL       |
| Authenticated requests    | ✅ Handled via JWT in headers      | ✅ You add JWT to headers manually                |

## Example Auth

jsx in React app

```
<button onClick={() => loginWithProvider('google')}>Continue with Google</button>
<button onClick={() => loginWithProvider('github')}>Continue with GitHub</button>
```

React app has js that triggers supabase auth

```
const loginWithProvider = async (provider) => {
  const { error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) console.error('Login error:', error.message);
};
```

## Database

Postgres setup, etc

### 1. Full SQL DDL with Indexes & Constraints

This includes schema, relationships, constraints, and performance-oriented indexes.

```
-- Enable extensions for full-text and fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ======================================
-- Table: tag_keys (tag categories)
-- ======================================
CREATE TABLE tag_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (char_length(name) <= 21),
    description TEXT CHECK (char_length(description) <= 128)
);

-- ======================================
-- Table: tag_values (tag instances)
-- ======================================
CREATE TABLE tag_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tag_keys(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (char_length(text) <= 42),
    UNIQUE(tag_id, text)  -- Prevent duplicate values under same key
);

-- ======================================
-- Table: memories
-- ======================================
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),  -- 🛡 Auto-assign current user
    content TEXT NOT NULL,
    memory_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    url TEXT
);

-- ======================================
-- Table: memory_tag (many-to-many)
-- ======================================
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
-- ======================================
-- Row-Level Security (RLS)
-- ======================================

-- Enable RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tag ENABLE ROW LEVEL SECURITY;

-- === RLS for memories ===

-- Read: users can only view their own memories
CREATE POLICY "Users can read their own memories"
  ON memories FOR SELECT
  USING (user_id = auth.uid());

-- Insert: users can insert memories with their own user_id
CREATE POLICY "Users can insert their own memories"
  ON memories FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Update: users can update only their own memories
CREATE POLICY "Users can update their own memories"
  ON memories FOR UPDATE
  USING (user_id = auth.uid());

-- Delete: users can delete only their own memories
CREATE POLICY "Users can delete their own memories"
  ON memories FOR DELETE
  USING (user_id = auth.uid());

-- === RLS for memory_tag ===

-- Read tags only for memories the user owns
CREATE POLICY "Users can read tags on their memories"
  ON memory_tag FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memories m
      WHERE m.id = memory_tag.memory_id
      AND m.user_id = auth.uid()
    )
  );

-- Allow tag inserts only for user's own memories
CREATE POLICY "Users can tag their own memories"
  ON memory_tag FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memories m
      WHERE m.id = memory_tag.memory_id
      AND m.user_id = auth.uid()
    )
  );

-- Optional: restrict delete too
CREATE POLICY "Users can remove tags from their memories"
  ON memory_tag FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM memories m
      WHERE m.id = memory_tag.memory_id
      AND m.user_id = auth.uid()
    )
  );

```

Supabase maintains an internal auth.users table (managed by Supabase Auth). It contains:

| Column       | Description                         |
| ------------ | ----------------------------------- |
| `id`         | UUID of the user (aka `auth.uid()`) |
| `email`      | Email from login provider           |
| `created_at` | Signup timestamp                    |
| `provider`   | Google, GitHub, etc.                |

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

## Hosting

### Langchain Server

✅ [Render and FastAPI](https://render.com/docs/deploy-fastapi)
https://github.com/render-examples/fastapi/
`uv pip freeze > requirements.txt`

Recommended Hosting Options for LangChain (Python)
| Platform | Type | Pros | Cons |
| ------------------------------ | ------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| **Fly.io** | Lightweight VMs | ✨ Fast global deploys<br>🔒 Private networking<br>💸 Free tier | Learning curve for setup/deployments |
| **Render** | PaaS (like Heroku) | ✅ Simple deploys from GitHub<br>🔧 Background jobs<br>💸 Free tier | Cold start delay (shared plans)<br>Resource limits on free plan |
| **Railway** | PaaS + CI/CD | ⚡ Easy to use<br>🎛️ Environments<br>💸 Free trial (not unlimited) | 30-day project inactivity limits on free plan |
| **Replit Deployments** | Container-lite | 🧪 Good for fast prototyping<br>💸 Generous free tier | Not ideal for production or scale |
| **Google Cloud Run** | Containerized | ⚙️ Scales to zero<br>🌍 Global availability<br>🔒 Good security | Requires container knowledge<br>Free tier limited in CPU/memory |
| **EC2 / DigitalOcean Droplet** | VM/IaaS | 🧩 Full control<br>🔁 Persistent | Needs DevOps work: updates, scaling, security |
| **Render Static + Backend** | Fullstack combo | 🧱 Serve static frontend + Python backend together | Slightly more setup for CORS/Auth coordination |

🥊 Render vs. PythonAnywhere

| Feature                           | **Render**                                    | **PythonAnywhere**                             |
| --------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| 🔧 **Purpose**                    | Modern full-stack PaaS                        | Python-focused hosting (traditional style)     |
| ☁️ **Deployment Type**            | Git-based CI/CD (auto deploy from GitHub)     | Manual upload or web editor                    |
| 🐍 **Python Support**             | ✅ Yes, supports full Python stack            | ✅ Yes, Python-only                            |
| 🔁 **API Server (FastAPI/Flask)** | ✅ Full support (WSGI/ASGI)                   | ✅ WSGI only (e.g., Flask)                     |
| 🌐 **Custom domains**             | ✅ Yes (on free and paid)                     | ✅ Yes (paid only)                             |
| 🔄 **Auto-deploy from GitHub**    | ✅ Built-in                                   | ❌ Not built-in (requires manual config)       |
| 🔐 **Env Variables Support**      | ✅ Yes                                        | ✅ Yes                                         |
| 🔌 **Long-running processes**     | ✅ Yes (background workers, cron jobs)        | ⚠️ Limited: requires paid tier                 |
| 🚀 **Cold start time**            | ⚠️ Free tier may sleep                        | ⚠️ Free tier sleeps after inactivity           |
| 💸 **Free Tier**                  | ✅ Yes, generous                              | ✅ Yes, limited bandwidth & CPU                |
| 🌍 **Geographic scaling**         | ✅ Global edge regions                        | ❌ Hosted in a single region (EU or US)        |
| 🧱 **Containerization/Docker**    | ✅ Yes (custom Docker supported)              | ❌ No Docker                                   |
| 📦 **PostgreSQL integration**     | ✅ Render-managed or external (e.g. Supabase) | ❌ External only                               |
| 🧠 **Ideal for LangChain/OpenAI** | ✅ Modern, flexible backend stack             | ⚠️ Possible but not ideal for modern workflows |

| Framework   | Best For                             | Pros                                                                                                                   | Cons                                                           |
| ----------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **FastAPI** | Modern APIs, async, LangChain/OpenAI | ⚡ Fast, async-native<br>🧠 Auto-generates OpenAPI docs<br>🔐 Easy JWT + auth<br>💬 Best for REST or tool-based agents | 🔧 Newer ecosystem, some advanced features may need extra libs |
| **Flask**   | Simple APIs                          | ✅ Minimal, lightweight<br>📚 Tons of extensions                                                                       | ❌ Not async-native<br>❌ No built-in data validation          |
| **Django**  | Full-stack apps, admin dashboards    | 🎛️ Batteries included<br>🛠️ ORM, admin, auth                                                                           | 🧱 Heavy for API-only use<br>❌ Not async-native by default    |
| **Celery**  | Background task queue                | 🕓 Great for long-running/queued jobs<br>🔁 Integrates with FastAPI                                                    | ❌ Not a web framework<br>Needs Redis/RabbitMQ setup           |
