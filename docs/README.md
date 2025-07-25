# InstaMem Documentation

## Quick Links

-   🗺️ [Feature Roadmap](roadmap.md) - What's being built when, feature summary
-   📋 [Changelog](CHANGELOG.md) - Version history and release notes
-   🏗️ [Architecture](technical/architecture.md) - System design
-   🗄️ [Database](technical/database.md) - Schema and queries
-   🚀 [Development Setup](technical/development.md) - Getting started
-   [Original Specifications](Spec.md) - Before coding generated this legacy doc, replaced by files above.

## Project Structure

```
docs/
├── README.md           # This file - navigation and current status
├── CHANGELOG.md        # Detailed List what was part of each version with date released.
├── roadmap.md          # Feature matrix across versions, High level.
├── Spec.md             # Legacy doc containing original specifications.
├── features/           # Individual feature documentation
│   ├── template.md     # Template for new feature docs
│   └── [feature].md    # Created when actively working on features
└── technical/          # System-level documentation
    ├── architecture.md # High-level system design
    ├── database.md     # Schema and query patterns
    └── development.md  # Setup and development workflow
```

## Process

TODO: describe here

-   how to track bugs - added to roadmap and to corresponding feature if appropriate
-   how to note what is done (see CHANGELOG.md)
-   how new features should be added
-   how to modify/expand what is involved in a feature

## TODO

Here contains things that need to be done soon but are not yet organized
Eventually stuff here should be in roadmap

-   get AI to move feelings from roadmap.md to a new file, db/seed-feelings.sql
