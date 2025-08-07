# InstaMem Feature Roadmap

## Feature Status Table

| Name                                              | 0.1.0 | 0.2.0 | 0.5.0 | 1.0.0 | Priority |
| ------------------------------------------------- | ----- | ----- | ----- | ----- | -------- |
| [Authentication](#authentication)                 | ✅    |       | 📋    |       | P0       |
| [Memory Search](#memory-search)                   | ✅    | ✅    |       |       | P0       |
| [Add Edit Memories](#add-edit-memories)           | ✅    | ✅    |       |       | P0       |
| [Basic UI](#basic-ui)                             | ✅    | ✅    |       |       | P0       |
| [Offline Support](#offline-support)               |       | ✅    | 📋    |       | P1       |
| [Memory Export](#memory-export)                   |       |       | 📋    |       | P2       |
| [Testing Infrastructure](#testing-infrastructure) |       | ✅    | 📋    |       | P1       |
| [Tag Suggestion](#tag-suggestion)                 |       | 📋    |       |       | P1       |
| [Tag Management](#tag-management)                 |       |       | 📋    |       | P1       |
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
-   **Learning:** OAuth flows, JWT tokens, Row-Level Security policies

### [Memory Search](features/memory-search.md)

-   **0.1.0:** Basic keyword search with real-time results
-   **0.2.0:** Added search term highlighting in results
-   **Learning:** Full-text search, PostgreSQL performance, real-time UI patterns

### Add Edit Memories

-   **0.1.0:** Simple CLI-based memory creation (direct database insert), UI lists memories.
-   **0.2.0:** CLI-based tool to List/Add/Edit/Delete memory
-   **0.2.0:** UI-based memory editing with sophisticated tag editing, dedicated edit pages, and advanced tag input with autocomplete
-   **0.5.0** AI-powered natural language parsing with LangChain, part of instamem-server repo

### Basic UI

-   **0.1.0:** Clean, responsive interface with ShadCN components
-   **0.2.0:** Looks good and works on mobile
-   **Learning:** Modern React patterns, Tailwind CSS, component design

### [Offline Support](features/offline-support.md)

-   **0.2.0:** Read-only cached memories, basic PWA, offline search with Fuse.js
-   **0.5.0:** Offline writes with sync queue
-   **1.0.0:** Multi-device sync with conflict resolution
-   **Learning:** 0.2.0=PWA/IndexedDB basics, 1.0.0=Sync patterns, 2.0.0=CRDTs

### Memory Export

-   **0.5.0:** JSON/CSV export of user memories
-   **Learning:** Data formats, file handling in browser

### Semantic Search

-   **1.0.0:** Vector similarity search using embeddings
-   **Learning:** Vector databases, semantic similarity, embedding models

### Multi-device Sync

-   **2.0.0:** Real-time sync across devices with conflict resolution
-   **Learning:** CRDTs, WebSocket/Server-Sent Events, distributed systems

### Tag Suggestion

-   Tags shown in search results. Ex: search for "per" will show all matching tags, like ones starting with "person:" in an overlay below search box. User can use arrow keys to go up/down matching tags, enter to select. They can also click on one.
-   Tags with definitions (feeling) will show feeling and definition, in a similar overlay.
-   **Learning:** Data relationships, UI for hierarchical data, search UX

### Tag Management

-   Tag browsing interface, creation, editing, usage statistics
-   **Learning:** Data relationships, UI for hierarchical data, search UX

### Dark Mode

-   Theme switching with system preference detection
-   **Learning:** CSS variables, theme architecture, user preferences

### Keyboard Shortcuts

-   Hotkeys for search, navigation, memory creation
-   **Learning:** Browser event handling, accessibility, power user features

### Testing Infrastructure

-   **0.2.0:** Minimum to test data and core functionality - see [tests](tests.md) for strategy.
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

-   mobile view is bad - nav bar needs work
