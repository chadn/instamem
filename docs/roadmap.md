# InstaMem Feature Roadmap

## Feature Status Table

| Name                                              | 0.1.0 | 0.2.0 | 0.3.0 | 0.5.0 | 1.0.0 | Priority |
| ------------------------------------------------- | ----- | ----- | ----- | ----- | ----- | -------- |
| [Authentication](#authentication)                 | ✅    | ✅    |       | 📋    |       | P0       |
| [Search](#search)                                 | ✅    | ✅    | 📋    | 📋    |       | P0       |
| [Add Edit Memories](#add-edit-memories)           | ✅    | ✅    | 📋    | 📋    |       | P0       |
| [Basic UI](#basic-ui)                             | ✅    | ✅    |       |       |       | P0       |
| [Offline Support](#offline-support)               |       | ✅    |       | 📋    |       | P0       |
| [Testing Infrastructure](#testing-infrastructure) |       | ✅    |       | 📋    |       | P1       |
| [Tag Management](#tag-management)                 |       | ✅    | 📋    | 📋    |       | P1       |
| [Demo Data](#demo-data)                           |       |       | 📋    | 📋    |       | P1       |
| [Memory Import/Export UI](#memory-importexport)   |       |       | 📋    |       |       | P1       |
| [instamem-server](#instamem-server)               |       |       |       | 📋    |       | P2       |
| [Semantic Search](#semantic-search)               |       |       |       |       | 💭    | P2       |
| [Multi-device Sync](#multi-device-sync)           |       |       |       |       | 💭    | P2       |
| [Dark Mode](#dark-mode)                           |       |       |       |       | 📋    | P3       |
| [Keyboard Shortcuts](#keyboard-shortcuts)         |       |       |       |       | 📋    | P3       |
| [Performance Monitoring](#performance-monitoring) |       |       |       |       | 📋    | P3       |
| [Data Visualization](#data-visualization)         |       |       |       |       | 💭    | P3       |
| [Advanced Analytics](#advanced-analytics)         |       |       |       |       | 💭    | P3       |
| [API Access](#api-access)                         |       |       |       |       | 💭    | P3       |

✅ Done  
🟡 IN PROGRESS  
📋 TODO  
💭 CONCEPT

**Versions:**

-   **0.1.0 (MVP):** Core functionality, basic implementations
-   **0.2.0 (Enhanced):** Better UX, offline support, comprehensive testing
-   **0.3.0 (Scale):** Large datasets, demo data, improved search UX, UI import/export
-   **0.5.0 (AI):** Create instamem-server with LangChain for AI-assisted memory management
-   **1.0.0 (Advanced):** Semantic search, multi-device sync
-   **2.0.0 (Production):** Enterprise-ready, advanced features

**Priority:** P0 = Must have, P1 = Important Sooner, P2 = Important, P3 = Nice to have

## How Features Support the 4 Goals

Each feature directly supports one or more of InstaMem's core goals:

### 🚀 Goal 1: INSTANT Search + Offline

-   **Search** - Core search functionality with zero-latency local results
-   **Offline Support** - Essential for instant offline search capability
-   **Demo Data** - Large datasets to test and showcase search performance
-   **Memory Import/Export** - Bulk operations for managing large offline datasets

### 🎯 Goal 2: Customizable Memories

-   **Add Edit Memories** - Flexible memory creation with custom content
-   **Tag Management** - Custom tag categories and organization
-   **Demo Data** - Examples of extreme customization (1000+ unique tags)

### 🤖 Goal 3: AI Assisted Memory Management

-   **instamem-server** - Backend infrastructure for AI-powered features
-   **Add Edit Memories** - AI-enhanced memory creation in 0.5.0

### 🏷️ Goal 4: Advanced Tag Handling

-   **Tag Management** - Smart tag autocomplete, relationships, and organization
-   **Search** - Tag-enhanced search results and click-to-filter functionality
-   **Demo Data** - Rich tag hierarchies and usage patterns

**Supporting Infrastructure:**

-   **Authentication, Basic UI, Testing** - Foundation for all goals
-   **Multi-device Sync, Semantic Search** - Advanced capabilities building on core goals

## Feature Details

Note some features have dedicated docs, click link to view.

### [Authentication](features/authentication.md)

-   **0.1.0:** User login via Google/GitHub using Supabase Auth
-   **0.2.0:** Special email login via /login-email for manual test accounts
-   **0.5.0:** User login via Linkedin/Apple/etc using Supabase Auth
-   **Learning:** OAuth flows, JWT tokens, Row-Level Security policies

### [Search](features/search.md)

-   **0.1.0:** Basic keyword search with real-time results of matching memories
-   **0.2.0:** **INSTANT** offline-first search using cached data + Fuse.js; added search term highlighting in results; zero-latency local search
-   **0.3.0:** **Large Dataset Creation** — Create and test with large datasets (1000+ memories) for UX experimentation
-   **0.5.0:** **Advanced Tag Handling** — Search results include matching tags for quick refinement. Clicking on a tag adds it to search bar and instantly filters results to show only memories with that tag AND matching other search terms.
-   **0.5.0:** **Large Dataset Performance** — Optimize search performance for 1000+ memories, implement efficient caching strategies
-   **0.5.0:** **Enhanced Search UX** — Configurable search result sorting (newest/oldest/updated/best), debug mode for non-exact matches, improved search result ranking
-   **Learning:** Full-text search, PostgreSQL performance, real-time UI patterns, instant local search optimization, large dataset optimization

### Add Edit Memories

-   **0.1.0:** Simple CLI-based memory creation (direct database insert), UI lists memories.
-   **0.2.0:** CLI-based tool to List/Add/Edit/Delete memory.
-   **0.2.0:** CLI-based tool to Bulk Edit. Can export all memories in json for editing, delete all memories for a user, then add edited memories.
-   **0.2.0:** UI-based memory creating, deleting, and editing with sophisticated tag editing, dedicated edit pages, and advanced tag input with autocomplete
-   **0.5.0:** AI-powered natural language parsing with LangChain, part of instamem-server repo
-   **0.5.0:** JSON/CSV export of user memories from browser

### Basic UI

-   **0.1.0:** Clean, responsive interface with ShadCN components
-   **0.2.0:** Looks good and works on mobile
-   **Learning:** Modern React patterns, Tailwind CSS, component design

### [Offline Support](features/offline-support.md)

-   **0.2.0:** Read-only cached memories, basic PWA, offline search with Fuse.js.
-   **0.2.0:** Auto-update of app (sw.js), including version number and timestamp of last update
-   **0.5.0:** Offline writes with sync queue
-   **1.0.0:** Multi-device sync with conflict resolution
-   **Learning:** 0.2.0=PWA/IndexedDB basics, 1.0.0=Sync patterns, 2.0.0=CRDTs

### Semantic Search

-   **1.0.0:** Vector similarity search using embeddings
-   **Learning:** Vector databases, semantic similarity, embedding models

### Multi-device Sync

-   **2.0.0:** Real-time sync across devices with conflict resolution
-   **Learning:** CRDTs, WebSocket/Server-Sent Events, distributed systems

### Tag Management

-   **0.1.0:** Tags are shown in search results
-   **0.2.0:** **Customizable tagging system** — When creating or editing memory in UI, tag suggestions appear (autocomplete) nudging users towards using same tags.
-   **0.2.0:** When typing a "feeling:" tag, shows feeling name and definition, nudging users to using feelings more accurately.
-   **0.5.0:** **Tag cloud management** — Visual tag clouds with usage counts to help organize and manage your tag system.
-   **0.5.0:** **Tag-enhanced search results** — Search includes relevant tags and memory counts. Click any tag to instantly filter results.
-   **0.5.0:** **Smart tag suggestions** — Tag recommendations based on your existing tag patterns and memory content.
-   **Learning:** Data relationships, UI for hierarchical data, search UX, instant tag-based filtering

### Dark Mode

-   Theme switching with system preference detection
-   **Learning:** CSS variables, theme architecture, user preferences

### Keyboard Shortcuts

-   Hotkeys for search, navigation, memory creation
-   **Learning:** Browser event handling, accessibility, power user features

### Testing Infrastructure

-   **0.2.0:** ✅ Unit and end-to-end (E2E) tests to validate core functionality - see [tests](tests.md) for details.
-   **0.?:** 📋 Consider create github actions that runs new playwright tests against instamem-dev.vercel.app whenever dev branch is updated. Needs to wait till vercel builds.
-   **0.?** Lighthouse - audits web applications for performance, accessibility, SEO, and PWA readiness
-   **Learning:** Testing patterns, mocking strategies, CI/CD integration

### [Demo Data](features/demo-data.md)

-   **0.3.0:** Rich demo accounts with extreme customization - 800+ memories with 1000+ unique tags across 4 use cases
-   **0.5.0:** Performance validation - prove INSTANT search works with large datasets
-   **Learning:** Content strategy, extreme customization examples, UX experimentation with large datasets, example-driven feature demonstration

### Memory Import/Export

-   **0.3.0:** UI-based memory import/export (JSON/CSV format) - extends existing CLI functionality to browser interface
-   **0.3.0:** Bulk memory operations via UI - drag-and-drop import, export filtered results
-   **Learning:** File handling in browser, data transformation, user experience for bulk operations

### instamem-server

-   **0.5.0:** Integrate backend that enables easier memory creation and management. Details will be in a separate repo, for now view more in [Architecture:instamem-server](architecture.md#instamem-server).

### Performance Monitoring

-   **1.0.0:** Lighthouse audits, error tracking, performance metrics
-   **Learning:** Web vitals, monitoring tools, performance optimization

### Data Visualization

-   **2.0.0:** Nice-to-have: Charts for memory patterns, tag usage, timeline views
-   **Learning:** D3.js or charting libraries, data aggregation, visual design

### Advanced Analytics

-   **2.0.0:** Nice-to-have: Usage patterns, memory insights, personal dashboards
-   **Learning:** Data visualization, analytics patterns, privacy-preserving metrics

### API Access

-   **2.0.0:** Nice-to-have: REST API for external integrations and mobile apps
-   **Learning:** API design, authentication, rate limiting, documentation

## TODO

Stuff that needs to be addressed or fleshed out

-   "resum" search term has a result that does not contain "resum" - need a debug mode or tool to explain why. Ideally CLI memories search uses same code as browser, but with debug flag option to explain non exact matches.
-   IMPROVEMENT: should sync before and after every edit or create memory.
-   IMPROVEMENT: browser warning: A form field element should have an id or name attribute (violator is input for tags, label for tags also should be fixed, see TagInput)
-   BUG: (COMPLEX, DO LATER) Switching from online to offline on main page works, can continue to search. If in create/edit page, and go to offline, going back to homepage to search does not work, just shows blank page (/ or /login are both blank)
-   IMPROVEMENT: search results sorting - need to document. Most recently updated first? Maybe create sort link that shows sort options: newest|oldest|updated|best
-   IMPROVEMENT: on search results, click on tag to do a search on that tag

-   IMPROVMENT: create demo accounts with lots of memories and tags to see how this could work
    -   focus on DJs - song name, artist, etc in content, and use tags for genre, year, or other meta data https://support.mixo.dj/guide/rekordbox-to-mixo
    -   find someone with lots of best-of lists, and add them. Best IMDB movies, top 100 songs of all time, fav restaurants, etc.
