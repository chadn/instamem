# Offline Support

_See [roadmap.md](../roadmap.md) for version, priority, status, and effort estimates_

**Learning Focus:** PWA/IndexedDB basics, Sync patterns, CRDTs

## What It Does

Cached memory search when offline, with sync when connectivity returns.

## Learning Goals

-   [Service Workers](https://caniuse.com/serviceworkers) patterns for offline-first apps
-   IndexedDB for structured data storage
-   Background sync for reliable data updates
-   How much data can browsers store locally (appears to be 500MB-1GB)

## Implementation Ideas (0.2.0) Partial Offline Support

-   Sync
    - Full data copy on local storage, in IndexedDB, since full data copy will be less than a few MB.
    - Network detection with graceful degradation
-   Offline search
    - with Fuse.js on cached data
    - better for instant search - results change after every key press after small (100ms) wait
    - Read-only offline experience (no memory creation)

## Implementation Ideas (0.5.0)

-   Writes
    - 0.5.0 includes langchain + AI support of creating memories, cannot do this offline. 
    - need to support background sync to ensure local copy is full copy of remote.
    - need to support simple edits - consider option to edit offline then sync when able to.
    - CRDTs - less important becuase most common case will just be one device (phone) per user that needs to be in sync with remote.
    more https://dev.to/charlietap/synking-all-the-things-with-crdts-local-first-development-3241


## Open Questions

-   Should sync be automatic or user-controlled?  start with automatic
-   How to handle conflicts when back online?
-   What's the minimum viable offline experience?

# Details

## Storage Capacity Analysis

**Realistic Capacity for InstaMem:** 100MB-1GB safely supported on most devices.

**Browser Storage Limits (2025):**

-   **Chrome/Edge:** Up to 60% of total disk space per origin
-   **Firefox:** 10GB max per origin (10% of disk or group limit)
-   **Safari Desktop:** Unlimited Cache API, 500MB IndexedDB limit
-   **Safari iOS:** 50MB Cache API, 500MB IndexedDB (with user prompts at 10MB)

**Data Size Estimates:**

-   Average memory: 1-10KB (text content + metadata)
-   10,000 memories ≈ 10-100MB total
-   Tag reference data: ~1KB (minimal overhead)
-   Well within storage constraints

### Architecture for 0.2.0 Partial Offline Support

1. **Cache Strategy**

    - Store all data (memories, tags) for a user in IndexedDB
    - Use Service Worker to keep in sync
    - No writes in the app at this stage

2. **Sync Queue Pattern**

3. **Storage Management**

### Technical Implementation

**Frontend Changes:**

-   Add IndexedDB layer for local memory/tag storage
-   Implement search functionality with `Fuse.js` for offline fuzzy search
-   Create sync status UI indicators 
-   Add offline detection and queue management

**Service Worker Features:**

-   Cache memory content and search indexes
-   Background sync for queued updates
-   Periodic sync for fresh content (Chrome only, ~daily frequency)

**Database Considerations:**

-   Add `last_modified` timestamps to all tables for sync conflict resolution
-   Consider tombstone records for deleted items
-   Implement incremental sync to minimize data transfer

### Browser Support & Limitations

