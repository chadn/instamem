# InstaMem — Instantly Remember Important Details

A simple app that lets you enter a single word to find "memories" that match.

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
- **Deployment:** Vercel

## Architecture

*See [Architecture Documentation](docs/technical/architecture.md) for detailed system design*

## Status

WIP - see [Roadmap](docs/roadmap.md)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create new supabase project under your supabase org**
   - note supabase project id
   - note supabase project password
   - copy your anon public key https://supabase.com/dashboard/project/_/settings/api-keys
   - Enable Email Provider (login by email+passwd).  
     Make sure "Confirm email" and other switches are off. 
     Then click "Save" in bottom right.
     https://supabase.com/dashboard/project/_/auth/providers
   - In https://supabase.com/dashboard/project/_/auth/url-configuration
     make sure site url is  http://localhost:3000/
     make sure Redirect URLs includes  http://localhost:3000/auth/callback

3. **Configure environment variables:**
   Do the following and then add your Supabase credentials.
   ```
   cat <<EOF > .env.local
   SUPABASE_PROJECT_ID=__your_project_id_here__
   SUPABASE_PROJECT_PASSWD=__your_project_password_here__
   # NEXT_PUBLIC_ prefix tells next.js to make accessible everywhere
   NEXT_PUBLIC_SUPABASE_URL=https://__your_project_id_here__.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=__your_anon_key_here__
   EOF
   ```

4. **Set up database:**
   
   **Automated Setup:**
   ```bash
   npm run db setup
   ```
   
   This will:
   - Create all tables, indexes, and RLS policies
   - Seed initial tag data
   - Complete setup in one command
   
   **Database Management Commands:**
   ```bash
   npm run db check   # Check database status
   npm run db reset   # Reset database (drops all tables)
   npm run db seed    # Seed data only
   npm run db seed-test-user # needed to run auth tests
   ```

5. **Configure OAuth providers in Supabase:**
   
   Go to your Supabase project dashboard → **Authentication** → **Providers**
   https://supabase.com/dashboard/project/_/auth/providers
   
   **Google OAuth:**
   - Enable the Google provider
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create/select project → Dashboard → APIs & Services → Create Credentials → Create OAuth client ID
   - Set Authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase
   
   **GitHub OAuth:**
   - Enable the GitHub provider  
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create new OAuth App with callback: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase
   
   **Site URL Settings:**
   - Set Site URL to `http://localhost:3001` (development)
   - Add `http://localhost:3001/auth/callback` to Redirect URLs

6. **Start development server:**
   ```bash
   npm run dev
   ```

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run db           # Database management commands
npm run add-memories # CLI tool to add memories
```

## Architecture

*See [Architecture Documentation](docs/technical/architecture.md) for detailed system design*

This repository contains the React frontend. The backend (InstaMem server) will be a separate Python repository using LangChain for AI-powered memory processing.

## Documentation

- [Feature Roadmap](docs/roadmap.md) - What's being built when
- [Documentation Index](docs/README.md) - Full documentation navigation
- [Development Setup](docs/technical/development.md) - Getting started guide