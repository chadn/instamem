# InstaMem — Instantly Remember Important Details

InstaMem (Instant Memory) is a simple, fast, and personal memory assistant. Just type a word, or even part of a word, and instantly surface memories connected to people, places, events, or ideas — all organized by tags you define.

1. **INSTANT Search** — Zero-latency results and **Offline use**, uses local data storage sync'd with Supabase DB when online [implemented 0.2.0]
2. **Customizable Memories** — Users define content and **custom tag categories** [implemented 0.2.0]
3. **AI Assisted Memory Management** — Users can use natural language to update or create memories [planned 0.5.0]
4. **Advanced Tag Handling** — Smart tag management and search refinement [planned 0.3.0]

Learn more in [Usage Doc](docs/usage.md#instamem-usage-guide)


## Technical Stack

-   **Framework:** React 19, Next.js 15 with App Router
-   **Languages:** Typescript, shell/bash
-   **UI:** ShadCN UI + Tailwind CSS
-   **Database:** Supabase (PostgreSQL) on the cloud, sync'd locally for Offline use.
-   **Offline Support:** PWA + IndexedDB + [localforage](https://github.com/localForage/localForage) + Fuse.js search
-   **Authentication:** Supabase Auth, RLS, Github + Google Login
-   **Deployment:** Vercel

## Status

WIP - see [Roadmap](docs/roadmap.md)

## Quick Start

```bash
npm install
npm run db setup
npm run dev
```

**For complete setup instructions, development commands, and workflow details,** see [Development Guide](docs/technical/development.md).

## Architecture

_See [Architecture Documentation](docs/technical/architecture.md) for detailed system design_

This repository contains the React frontend. The backend (InstaMem server) will be a separate Python repository using LangChain for AI-powered memory processing.

## Documentation

📚 **[Complete Documentation Index](docs/README.md)** - Comprehensive guide to all project documentation

**Quick Links:**

-   [Feature Roadmap](docs/roadmap.md) - What's built and what's planned
-   [Development Guide](docs/technical/development.md) - Complete setup and workflow
-   [System Architecture](docs/technical/architecture.md) - Technical design overview
