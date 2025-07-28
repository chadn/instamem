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
    - To feel more instant on search, update results after every key press after very short (100ms) wait
    - Read-only offline experience (no memory creation)

## Implementation Ideas (0.5.0) - Full Offline Support

**Offline Writes:**
- Queue simple edits (text updates, tag changes) for sync when online
- Disable AI-powered memory creation (requires LangChain + OpenAI)
- Background sync to maintain local/remote data consistency
- Conflict resolution with "last write wins" or user intervention

**Advanced Sync:**
- **CRDTs**: Consider for multi-device scenarios (though single-device is primary use case)
- **Tombstone records**: Track deletions for proper sync
- **Incremental sync**: Only transfer changed data since last sync
- **Device fingerprinting**: Track which device made which changes

**References:**
- [CRDTs for Local-First Development](https://dev.to/charlietap/synking-all-the-things-with-crdts-local-first-development-3241)


## Open Questions

### For 0.2.0 Implementation:
- **Storage approach**: Full data copy vs. recent subset (1000 memories)?
- **Sync timing**: On app startup vs. background intervals vs. user-triggered?
- **Fuse.js configuration**: What search options provide best offline experience?
- **iOS Safari**: How to handle 50MB limit gracefully (warn user, selective sync)?

### For 0.5.0 Planning:
- **Conflict resolution**: Last write wins vs. merge strategies vs. user choice?
- **Multi-device sync**: Is CRDT complexity justified for InstaMem's use case?
- **Background sync**: Worth the browser compatibility issues?
- **Data encryption**: Should cached memories be encrypted client-side?

### UX Decisions:
- **Offline indicators**: Persistent status bar vs. toast notifications?
- **Sync progress**: Show detailed progress vs. simple loading state?
- **Cache management**: Automatic vs. user-controlled cache clearing?

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
    - Not needed for 0.2.0 read-only implementation
    - Save for 0.5.0 when offline writes are required

3. **Storage Management**
    - Use `localForage` for IndexedDB abstraction
    - Simple full sync on app startup
    - Clear cache option for debugging

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

**Background Sync Support:**
- ✅ Chrome/Edge: Full support for Background Sync API
- ❌ Firefox/Safari: Limited or no background sync support
- **Fallback**: Manual sync when app regains connectivity

**iOS Safari Restrictions:**
- 50MB IndexedDB limit with user prompts at 10MB
- More aggressive storage eviction policies
- PWA limitations compared to native apps

**Compatibility Strategy:**
- Progressive enhancement: works better on Chrome, degrades gracefully
- Feature detection for Service Worker and IndexedDB support
- Clear fallback messaging for unsupported browsers

## Dependencies

- **Service Worker support**: Required for offline caching
- **IndexedDB**: For local data storage (with localForage fallback)
- **Fuse.js**: For offline fuzzy search functionality
- **Network detection**: Online/offline status monitoring

## Integration Points

- **Memory Search component**: Switch between online/offline search modes
- **Authentication system**: Sync only authenticated user's data
- **Database schema**: Add sync metadata columns for conflict resolution, See [Enhanced Schema for Sync (0.5.0)](#enhanced-schema-for-sync-050)
- **UI indicators**: Show offline status and sync progress

## Why This Version/Priority

**0.2.0 Priority Rationale:**
- Personal memory apps benefit greatly from offline access
- Read-only offline experience provides 80% of value with 20% complexity
- Validates user demand before investing in complex sync infrastructure
- Natural progression after basic search functionality

**User Value:**
- Instant search during poor connectivity (planes, trains, underground)
- Reduced data usage for frequent searches
- Better perceived performance with cached results

## Success Criteria

- [ ] **Performance**: Search responds within 200ms on cached data
- [ ] **Reliability**: <5% cache corruption/eviction issues across browsers
- [ ] **Compatibility**: Graceful degradation on Safari iOS 50MB limit
- [ ] **User adoption**: >20% of users engage with offline features
- [ ] **Data integrity**: Perfect sync accuracy when connectivity returns

## Implementation Notes

*This section will be updated with insights and learnings as the feature is built.*

### What I Learned
*TODO: Fill in after 0.2.0 implementation*

### What Worked Well  
*TODO: Fill in after 0.2.0 implementation*

### What I'd Do Differently
*TODO: Fill in after 0.2.0 implementation*

### Discussion Points for Others
*TODO: Fill in after 0.2.0 implementation*

---

## Database Sync Schema

When implementing offline sync, we need to extend the current database schema with metadata columns to handle conflict resolution and sync tracking.

### Current Schema (0.1.0)

The existing `memories` table structure:
```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  content TEXT NOT NULL,
  memory_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  url TEXT
);
```

### Enhanced Schema for Sync (0.5.0)

Add sync metadata columns to support conflict resolution:

```sql
-- Add sync columns to existing memories table
ALTER TABLE memories ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP DEFAULT now();
ALTER TABLE memories ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE memories ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;
ALTER TABLE memories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Create sync metadata table
CREATE TABLE IF NOT EXISTS sync_metadata (
  table_name TEXT NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  last_sync_timestamp TIMESTAMP DEFAULT now(),
  device_id TEXT NOT NULL,
  sync_token TEXT,
  PRIMARY KEY (table_name, user_id, device_id)
);

-- Create tombstone table for deleted items
CREATE TABLE IF NOT EXISTS deleted_memories (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  deleted_at TIMESTAMP DEFAULT now(),
  device_id TEXT,
  last_content TEXT -- For recovery if deletion was accidental
);
```

### Column Explanations

**Sync Tracking Columns:**
- **`last_modified`**: Timestamp of the last change (used for conflict detection)
- **`device_id`**: Identifies which device made the change (UUID generated per device)
- **`sync_version`**: Incremental counter for optimistic locking
- **`is_deleted`**: Soft delete flag to avoid immediate removal during sync

**Conflict Resolution Strategy:**
```sql
-- Example conflict resolution query
WITH conflicts AS (
  SELECT 
    local.id,
    local.last_modified as local_time,
    remote.last_modified as remote_time,
    local.device_id as local_device,
    remote.device_id as remote_device
  FROM local_memories local
  JOIN remote_memories remote ON local.id = remote.id
  WHERE local.last_modified != remote.last_modified
)
SELECT 
  id,
  CASE 
    WHEN local_time > remote_time THEN 'local_wins'
    WHEN remote_time > local_time THEN 'remote_wins'
    WHEN local_device = current_device_id THEN 'local_wins' -- Tie-breaker
    ELSE 'remote_wins'
  END as resolution
FROM conflicts;
```

### Sync Process Flow

**1. Initial Sync (0.2.0 - Read Only):**
```sql
-- Download all user memories to IndexedDB
SELECT id, content, memory_date, url, created_at, last_modified
FROM memories 
WHERE user_id = auth.uid()
ORDER BY last_modified DESC;
```

**2. Incremental Sync (0.5.0 - With Writes):**
```sql
-- Get changes since last sync
SELECT * FROM memories 
WHERE user_id = auth.uid() 
  AND last_modified > $last_sync_timestamp
  AND is_deleted = false;

-- Get deletions since last sync  
SELECT id, deleted_at FROM deleted_memories
WHERE user_id = auth.uid()
  AND deleted_at > $last_sync_timestamp;
```

**3. Conflict Detection:**
```sql
-- Find records that changed on both sides
SELECT m1.id, m1.last_modified, m1.device_id, m1.content
FROM memories m1
WHERE EXISTS (
  SELECT 1 FROM local_pending_changes lpc 
  WHERE lpc.memory_id = m1.id 
    AND lpc.last_modified > $last_sync_timestamp
    AND m1.last_modified > $last_sync_timestamp
    AND m1.device_id != $current_device_id
);
```

### Implementation Phases

**Phase 1 (0.2.0): Simple Download**
- Only `last_modified` column needed
- Full sync on app startup
- No conflict resolution (read-only)

**Phase 2 (0.5.0): Full Sync**
- All sync columns implemented
- Incremental sync with conflict resolution
- Tombstone records for deletions
- Device tracking and attribution

### Browser Storage Considerations

**IndexedDB Schema:**
```javascript
// Local storage structure matching server schema
const memoryStore = {
  keyPath: 'id',
  indexes: {
    'user_id': 'user_id',
    'last_modified': 'last_modified',
    'memory_date': 'memory_date'
  }
};

const syncMetadataStore = {
  keyPath: ['table_name', 'device_id'],
  indexes: {
    'last_sync': 'last_sync_timestamp'
  }
};
```

This schema extension enables robust offline sync while maintaining backward compatibility with the existing 0.1.0 implementation.
