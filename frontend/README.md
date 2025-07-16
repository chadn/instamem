# InstaMem Frontend

A React/Next.js frontend for the InstaMem personal memory assistant.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.local` and update with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Set up database:**
   ```bash
   # Check if database is set up
   npm run db check
   
   # Set up database schema and seed data
   npm run db setup
   
   # Reset database (if needed)
   npm run db reset-and-setup
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Database Management

The service role key is used for database setup and management:

### Available Commands

```bash
# Set up database schema and seed initial data
npm run db setup

# Check if database is properly configured
npm run db check

# Reset database (drops all tables)
npm run db reset

# Reset and set up from scratch
npm run db reset-and-setup
```

### What the Setup Does

1. **Creates tables:**
   - `tag_keys` - Tag categories (person, place, event, etc.)
   - `tag_values` - Specific tag instances
   - `memories` - User memory entries
   - `memory_tag` - Links memories to tags

2. **Creates indexes:**
   - Full-text search on memory content
   - Trigram indexes for fuzzy search
   - Performance indexes for common queries

3. **Sets up Row Level Security (RLS):**
   - Users can only access their own memories
   - Shared tag system for all users
   - Secure authentication-based policies

4. **Seeds initial data:**
   - Common tag categories (person, place, event, etc.)
   - Ready-to-use tag system

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

- **Framework:** Next.js 14 with App Router
- **UI:** ShadCN UI + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **State Management:** React Context + React Query

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # Reusable UI components
├── lib/           # Utilities and configurations
├── types/         # TypeScript type definitions
├── hooks/         # Custom React hooks
├── providers/     # Context providers
└── scripts/       # Database setup scripts
```