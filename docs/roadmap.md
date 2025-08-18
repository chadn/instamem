# InstaMem Feature Roadmap

## Feature Status Table

| Name                                              | 0.1.0 | 0.2.0 | 0.5.0 | 1.0.0 | Priority |
| ------------------------------------------------- | ----- | ----- | ----- | ----- | -------- |
| [Authentication](#authentication)                 | ✅    | ✅    | 📋    |       | P0       |
| [Memory Search](#memory-search)                   | ✅    | ✅    | 💭    |       | P0       |
| [Add Edit Memories](#add-edit-memories)           | ✅    | ✅    | 💭    |       | P0       |
| [Basic UI](#basic-ui)                             | ✅    | ✅    |       |       | P0       |
| [Offline Support](#offline-support)               |       | ✅    | 📋    |       | P1       |
| [Testing Infrastructure](#testing-infrastructure) |       | ✅    | 📋    |       | P1       |
| [Tag Management](#tag-management)                 |       | ✅    | 📋    |       | P1       |
| instamem-server repo                              |       |       | 📋    |       | P2       |
| [Semantic Search](#semantic-search)               |       |       | 💭    |       | P2       |
| [Multi-device Sync](#multi-device-sync)           |       |       |       | 💭    | P2       |
| [Dark Mode](#dark-mode)                           |       |       |       | 📋    | P3       |
| [Keyboard Shortcuts](#keyboard-shortcuts)         |       |       |       | 📋    | P2       |
| [Performance Monitoring](#performance-monitoring) |       |       |       | 📋    | P2       |
| [Data Visualization](#data-visualization)         |       |       |       | 💭    | P2       |
| [Advanced Analytics](#advanced-analytics)         |       |       |       | 💭    | P2       |
| [API Access](#api-access)                         |       |       |       | 💭    | P2       |

✅ Done  
🟡 IN PROGRESS  
📋 TODO  
💭 CONCEPT

**Versions:**

-   **0.1.0 (MVP):** Core functionality, basic implementations
-   **0.2.0 (Enhanced):** Better UX, AI features, basic offline
-   **0.5.0 (AI updates db):** Create instamem-server with Langchain
-   **1.0.0 (Advanced):** Sophisticated features, full offline
-   **2.0.0 (Production):** Enterprise-ready, multi-device, security

**Priority:** P0 = Must have, P1 = Important Sooner, P2 = Important, P3 = Nice to have

## Feature Details

### [Authentication](features/authentication.md)

-   **0.1.0:** User login via Google/GitHub using Supabase Auth
-   **0.2.0:** Special email login via /login-email for manual test accounts
-   **0.5.0:** User login via Linkedin/Apple/etc using Supabase Auth
-   **Learning:** OAuth flows, JWT tokens, Row-Level Security policies

### [Memory Search](features/memory-search.md)

-   **0.1.0:** Basic keyword search with real-time results
-   **0.2.0:** Added search term highlighting in results
-   **0.5.0:** Search results should include popular tags that match, then clicking on that tag will show memories with that tag
-   **Learning:** Full-text search, PostgreSQL performance, real-time UI patterns

### Add Edit Memories

-   **0.1.0:** Simple CLI-based memory creation (direct database insert), UI lists memories.
-   **0.2.0:** CLI-based tool to List/Add/Edit/Delete memory.
-   **0.2.0:** CLI-based tool to Bulk Edit. Can export all memories in json for editing, delete all memories for a user, then add edited memories.
-   **0.2.0:** UI-based memory creating and deleting
-   **0.2.0:** UI-based memory editing with sophisticated tag editing, dedicated edit pages, and advanced tag input with autocomplete
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
-   **0.2.0:** When creating or editing memory in UI, and typing in tag box, tag suggestions or shown (autocomplete) nudging users towards using same tags.
-   **0.2.0:** When typing a "feeling:" tag, shows feeling name and definition, nudging users to using feelings more accurately.
-   **0.5.0:** Consider tag clouds, or usage counts for tags, to nudge tag reuse.
-   **0.5.0:** Search should include number or memories connected tag clouds, or usage counts for tags, to nudge tag reuse.
-   **Learning:** Data relationships, UI for hierarchical data, search UX

### Dark Mode

-   Theme switching with system preference detection
-   **Learning:** CSS variables, theme architecture, user preferences

### Keyboard Shortcuts

-   Hotkeys for search, navigation, memory creation
-   **Learning:** Browser event handling, accessibility, power user features

### Testing Infrastructure

-   **0.2.0:** ✅ unit and end-to-end (e2e) tests to test data and core functionality - see [tests](tests.md) for details.
-   **0.?:** 📋 Consider create github actions that runs new playwright tests against instamem-dev.vercel.app whenever dev branch is updated. Needs to wait till vercel builds.
-   **0.?** Lighthouse - audits web applications for performance, accessibility, SEO, and PWA readiness
-   **Learning:** Testing patterns, mocking strategies, CI/CD integration

### Performance Monitoring

-   **1.0.0:** Lighthouse audits, error tracking, performance metrics
-   **Learning:** Web vitals, monitoring tools, performance optimization

### Data Visualization

-   **2.0.0:** Charts for memory patterns, tag usage, timeline views
-   **Learning:** D3.js or charting libraries, data aggregation, visual design

### Advanced Analytics

-   **2.0.0:** Usage patterns, memory insights, personal dashboards
-   **Learning:** Data visualization, analytics patterns, privacy-preserving metrics

### API Access

-   **2.0.0:** REST API for external integrations and mobile apps
-   **Learning:** API design, authentication, rate limiting, documentation

## TODO

Stuff that needs to be addressed or fleshed out

-   "resum" search term has a result that does not contain "resum" - need a debug mode or tool to explain why. Ideally CLI memories search uses same code as browser, but with debug flag option to explain non exact matches.
-   IMPROVEMENT: should sync before and after every edit or create memory.
-   IMPROVEMENT: browser warning: A form field element should have an id or name attribute (violator is input for tags, label for tags also should be fixed, see TagInput)
-   BUG: (COMPLEX, DO LATER) Switching from online to offline on main page works, can continue to search. If in create/edit page, and go to offline, going back to homepage to search does not work, just shows blank page (/ or /login are both blank)
-   IMPROVEMENT: search results sorting - need to document. Most recently updated first?  Maybe create sort link that shows sort options: newest|oldest|updated|best 
-   IMPROVEMENT: on search results, click on tag to do a search on that tag
-   BUG: "feeling:excited" search does not match memories with tag "feeling:excited"  but should.
