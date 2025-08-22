# Demo Data Strategy

_See [roadmap.md](../roadmap.md) for version, priority, status, and effort estimates_

**Learning Focus:** Content strategy, user onboarding, example-driven feature demonstration

## What It Does

Rich demo accounts with diverse memory types to showcase InstaMem's search capabilities and customizable memory organization across different use cases.

## Implementation Approach

### 0.5.0: Demo Account Creation

Create specialized demo accounts that highlight InstaMem's core principles:
- **INSTANT Search** across large datasets
- **Customizable Memories** for various content types
- **Advanced Tag Handling** with real-world tag patterns

## Demo Content Categories

### DJ/Music Collections
- **Content**: Song names, artists, album information, personal notes
- **Tags**: 200+ unique tags including `genre:house`, `subgenre:tech-house`, `year:2023`, `bpm:128`, `mood:energetic`, `key:Am`, `energy:7`, `venue:club-fabric`, `set:closing-track`, `crowd-reaction:amazing`
- **Use Case**: Professional DJs organizing massive music libraries (1000+ tracks)
- **Search Examples**: "Find all tech-house tracks from 2023 with high energy for club venues" or "Show closing tracks in A minor that got amazing crowd reactions"
- **Customization Showcase**: Demonstrates custom tag hierarchies (genre → subgenre), numerical tags (bpm, energy), location tags, and emotional response tracking
- **Reference**: Inspired by [Rekordbox to Mixo workflows](https://support.mixo.dj/guide/rekordbox-to-mixo)

### Curated Best-of Lists  
- **Content**: Movie titles, restaurant names, book recommendations
- **Tags**: `list:imdb-top-100`, `category:sci-fi`, `rating:5-stars`, `location:nyc`
- **Use Case**: Personal recommendations and favorites tracking
- **Search Examples**: "Show 5-star restaurants in NYC" or "Find sci-fi from top 100 list"

### Professional Use Cases
- **Content**: Career moments, project notes, learning resources
- **Tags**: `project:instamem`, `skill:typescript`, `person:mentor`, `company:previous-job`
- **Use Case**: Career development and professional networking
- **Search Examples**: "Find TypeScript learning resources" or "Show InstaMem project notes"

### Personal Life Memories
- **Content**: Life events, relationships, achievements, experiences  
- **Tags**: `person:family`, `event:wedding`, `feeling:proud`, `place:paris`
- **Use Case**: Personal memory keeping and life documentation
- **Search Examples**: "Find proud moments with family" or "Show Paris experiences"

## Success Criteria

- **Diverse Content**: 4+ distinct use case categories with 200+ memories each (800+ total memories)
- **Extreme Customization**: 1000+ unique tags across all demo accounts demonstrating maximum flexibility
- **Rich Tagging**: Average 5-8 tags per memory with hierarchical naming patterns
- **Search Showcase**: Demonstrates both simple ("house music") and complex ("high-energy tech-house closing tracks") search scenarios
- **Tag Cloud Value**: Shows visual organization benefits for massive tag collections
- **UX Experimentation**: Enables testing search workflows and interface with realistic large datasets
- **Onboarding Impact**: New users immediately understand InstaMem's scalability and potential

## Integration Points

- **Search Feature**: Provides realistic test data for search performance
- **Tag Management**: Demonstrates advanced tag patterns and organization
- **User Onboarding**: Examples guide new users toward effective memory creation
- **Feature Demos**: Showcases customizable memory types beyond basic personal notes

## Dependencies

- Tag Management system (0.2.0 ✅)
- Advanced Tag Handling features (0.5.0)
- Demo account creation workflow
- Data seeding scripts for consistent demo content

---

## What This Enables

**For New Users:**
- Immediate understanding of InstaMem's capabilities
- Real examples of effective tagging strategies  
- Inspiration for organizing their own memories

**For Development:**
- Realistic test data for performance optimization
- User experience validation with diverse content types
- Tag cloud and advanced search feature demonstration