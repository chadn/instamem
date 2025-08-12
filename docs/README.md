# InstaMem Documentation

## 📋 Core Documentation

-   🗺️ [**Feature Roadmap**](roadmap.md) - Feature status table and development timeline
-   📋 [**Changelog**](CHANGELOG.md) - Version history and release notes  
-   📜 [**Original Specifications**](Spec.md) - Legacy specification document (replaced by current docs)

## 🏗️ Technical Documentation

-   🏗️ [**System Architecture**](technical/architecture.md) - Two-tier architecture, components, data flow, security
-   🗄️ [**Database Design**](technical/database.md) - Schema, query patterns, performance considerations
-   🚀 [**Development Guide**](technical/development.md) - Setup, commands, workflow, debugging, contributing

## ⚡ Feature Documentation

-   🔐 [**Authentication**](features/authentication.md) - OAuth implementation, JWT tokens, RLS policies
-   🔍 [**Memory Search**](features/memory-search.md) - Real-time search, highlighting, architecture decisions
-   📴 [**Offline Support**](features/offline-support.md) - PWA, IndexedDB, Fuse.js search, sync planning
-   📝 [**Feature Template**](features/template.md) - Template for documenting new features

## 🧪 Testing Documentation

-   🧪 [**Testing Strategy**](tests.md) - Test types, commands, development workflow, detailed coverage breakdown
-   📖 [**Testing History**](tests-history.md) - Implementation breakthroughs and technical challenges


## 📁 Project Structure

```
docs/
├── README.md                    # This file - documentation navigation
├── roadmap.md                   # Feature status table and timeline 
├── CHANGELOG.md                 # Version history and release notes
├── Spec.md                      # Legacy specification document
├── features/                    # Feature-specific documentation
│   ├── template.md              # Template for new feature docs
│   ├── authentication.md        # OAuth, JWT, RLS implementation
│   ├── memory-search.md         # Real-time search functionality  
│   └── offline-support.md       # PWA and offline capabilities
├── technical/                   # System architecture and development
│   ├── architecture.md          # System design and components
│   ├── database.md              # Schema and query patterns
│   └── development.md           # Setup and development guide
├── tests.md                     # Testing strategy, commands, and coverage breakdown
└── tests-history.md             # Implementation breakthroughs and challenges
```

## 🚀 Quick Navigation

**New to InstaMem?**
1. Start with [**Feature Roadmap**](roadmap.md) - See what's built and what's planned
2. Follow [**Development Guide**](technical/development.md) - Get up and running
3. Review [**System Architecture**](technical/architecture.md) - Understand the design

**Working on Features?**
- Use [**Feature Template**](features/template.md) for new feature documentation
- Update [**Feature Roadmap**](roadmap.md) status when complete
- Add details to [**Changelog**](CHANGELOG.md) when releasing

**Testing?**
- See [**Testing Strategy**](tests.md) for commands, workflow, and detailed coverage
- Check [**Testing History**](tests-history.md) for implementation breakthroughs
