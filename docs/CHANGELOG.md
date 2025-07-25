# Changelog

All notable changes to InstaMem will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-??

### In Progress

-   Offline local storage use
-   Testing infrastructure

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
