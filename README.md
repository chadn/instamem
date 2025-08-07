# InstaMem — Instantly Remember Important Details

A simple app that lets you enter a single word to find matching "memories".

InstaMem is a simple, fast, and personal memory assistant. Just type a word, or even part of a word, and instantly surface memories connected to people, places, events, or ideas — all organized by tags you define.

🔍 Recall at a Glance

-   Instantly search through memories using a single keyword
-   Find details about people, experiences, career moments, or emotions
-   Custom tagging system — create your own categories (e.g. person:Alex, place:NYC, feeling:inspired)
-   **Offline-ready**: Search cached memories without internet connection
-   Lightning-fast UI designed for effortless, frequent use

📝 Add or Update Memories (Like ChatGPT)

-   A conversational interface makes adding memories feel natural
-   Enter plain text — AI helps structure it automatically
-   Link each memory to tags, timestamps, and more


## Technical Stack

- **Framework:** Next.js 14 with App Router
- **UI:** ShadCN UI + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth, RLS, Github + Google Login
- **Offline Support:** PWA + IndexedDB + localforage + Fuse.js search
- **Deployment:** Vercel

## Architecture

*See [Architecture Documentation](docs/technical/architecture.md) for detailed system design*

## Status

WIP - see [Roadmap](docs/roadmap.md)

## Quick Start

```bash
npm install
npm run db setup
npm run dev
```

**For complete setup instructions** including Supabase configuration, OAuth setup, and database management, see [Development Guide](docs/technical/development.md).

## Development

**Basic Commands:**
```bash
npm run dev     # Start development server  
npm run build   # Build for production
npm run db      # Database management
```

**For comprehensive development guide,** including debugging, testing, code style, and deployment, see [Development Documentation](docs/technical/development.md).

## Architecture

*See [Architecture Documentation](docs/technical/architecture.md) for detailed system design*

This repository contains the React frontend. The backend (InstaMem server) will be a separate Python repository using LangChain for AI-powered memory processing.

## Documentation

📚 **[Complete Documentation Index](docs/README.md)** - Comprehensive guide to all project documentation

**Quick Links:**
- [Feature Roadmap](docs/roadmap.md) - What's built and what's planned
- [Development Guide](docs/technical/development.md) - Complete setup and workflow  
- [System Architecture](docs/technical/architecture.md) - Technical design overview
