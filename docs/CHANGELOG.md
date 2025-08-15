# Changelog

All notable changes to InstaMem will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-?? (not done yet)

### Added

-   Special email login via /login-email for manual test accounts
-   Search term highlighting in results
-   CLI tool to list/add/edit/delete memories
-   CLI tool for bulk edit - Can export all memories in JSON for editing, delete all memories for a user, then add edited memories
-   UI-based memory creating and deleting
-   UI-based memory editing with sophisticated tag editing, dedicated edit pages, and advanced tag input with autocomplete
-   Mobile-responsive design - looks good and works on mobile
-   Read-only cached memories with offline search using Fuse.js
-   Basic PWA (Progressive Web App) functionality
-   PWA manifest and service worker for app installation
-   Network detection with automatic online/offline switching
-   IndexedDB storage via localForage abstraction
-   Unit and end-to-end (e2e) tests to test data and core functionality
-   Tag autocomplete suggestions when creating or editing memories in UI
-   Feeling tag definitions - when typing "feeling:" tags, shows feeling name and definition
-   Auto-update of offline app (sw.js), including showing version number and timestamp of last update by Sign out

## [0.1.0] - 2025-07-25

### Added

-   User authentication via Google/GitHub OAuth using Supabase Auth
-   Creates "First time using InstaMem" memory if none exists.
-   Basic memory search functionality with keyword matching
-   Database schema with memories, tags, and relationships
-   Row-Level Security (RLS) policies for user data isolation
-   Protected routes and authentication middleware
-   Database setup and seeding via scripts/

### Technical

-   Next.js 14 with App Router architecture
-   Supabase integration for database and authentication
-   TypeScript for type safety
-   Tailwind CSS + ShadCN UI for styling
-   PostgreSQL with full-text search indexes
-   Automated database migration scripts
