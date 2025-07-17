# InstaMem — Instantly Remember the Details of Your Life

A simple app that lets you enter a single word to find "memories" that match or relate.

InstaMem is a simple, fast, and personal memory assistant. Just type a word, and instantly surface memories connected to people, places, events, or ideas — all organized by tags you define.

🔍 Recall at a Glance

-   Instantly search through memories using a single keyword
-   Find details about people, experiences, career moments, or emotions
-   Custom tagging system — create your own categories (e.g. person:Alex, place:NYC, feeling:inspired)
-   Lightning-fast UI designed for effortless, frequent use

📝 Add or Update Memories (Like ChatGPT)

-   A conversational interface makes adding memories feel natural
-   Enter plain text — AI helps structure it automatically
-   Link each memory to tags, timestamps, and more

## Architecture

```
                   🧠 InstaMem System Architecture

┌───────────────────────────┐                    ┌──────────────────────────┐
│       React Frontend      │ ───── Auth ──────▶ │      Supabase DB         │
│     (Runs in Browser)     │ ◀───── JWT ─────── │ (Postgres + Auth + RLS)  │
│      JWT used for auth    │                    │                          │
│     in reads and udpates  │ ────── read ─────▶ │                          │
└────────────┬──────────────┘                    └──────────┬───────────────┘
             │  update                                      ▲
             ▼                                              │
     ┌─────────────────────────────┐                        │
     │    LangChain API Server     │                        │
     │ (Node.js or Python backend) │                        │
     └────────┬───────────┬────────┘                        │
              │           │                                 │
              │           └──▶ Second, Update DB via Tool ──┘
              │ First,
              │ Parse Text to Structured Data via Tool Function
              │      ┌──────────────────────────────┐
              └─────▶│     OpenAI/Gemini/etc API    │
                     │   (Calls Tool Functions to   │
                     │      update Supabase DB)     │
                     └──────────────────────────────┘
```
## Status

WIP - see [todo](docs/todo.md)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create new supabase project under your supabase org**
   - note supabase project id
   - note supabase project password

3. **Configure environment variables:**
   `cp env.example .env.local` and update your Supabase credentials.

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
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run db       # Database management commands
```

## Technical Stack

- **Framework:** Next.js 14 with App Router
- **UI:** ShadCN UI + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## Architecture

This repository contains the React frontend. The backend (InstaMem server) will be a separate Python repository using LangChain for AI-powered memory processing.

## Documentation

- [Detailed Spec](docs/Spec.md)
- [Implementation Todo](docs/todo.md)
