# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InstaMem is a personal memory assistant that lets users instantly search memories using keywords. It consists of two separate repositories:

1. **instamem-frontend** (React Next.js on Vercel)
   - Supabase auth with JWT tokens
   - Direct Supabase reads for search functionality
   - Calls instamem-server for memory updates
   - Uses ShadCN UI components

2. **instamem-server** (Python FastAPI on Render)
   - LangChain + OpenAI for text-to-structured-data conversion
   - Uses JWT from frontend to authenticate Supabase updates
   - Converts free-form text into structured memories with tags

## Architecture

The system uses a two-tier architecture:
- **Frontend**: React app handles auth, search (direct Supabase), and UI
- **Backend**: Python LangChain server processes natural language memory updates
- **Database**: Supabase PostgreSQL with RLS policies for user isolation

## Database Schema

Key tables:
- `memories`: User content with full-text search indexes
- `tag_keys`: Tag categories (person, place, feeling, etc.)
- `tag_values`: Specific tag instances linked to keys
- `memory_tag`: Many-to-many relationship between memories and tags

Search capabilities:
- `ILIKE` for partial matches
- `to_tsvector` for full-text search
- `pg_trgm` for fuzzy search (planned)
- `pgvector` for semantic search (planned)

## Development Status

This is currently a specification/planning repository. The actual implementation will be split across:
- Frontend repo: React/Next.js with Supabase integration
- Backend repo: Python FastAPI with LangChain

## Key Implementation Details

- **Authentication**: Supabase Auth with Google/GitHub OAuth
- **Search**: Real-time search with debouncing (~500-1000ms)
- **Memory Entry**: AI-powered conversion of free-form text to structured data
- **Security**: Row-Level Security (RLS) policies ensure user data isolation
- **Hosting**: Vercel (frontend) + Render (backend) + Supabase (database)

## Development Commands

Since this is a specification repository, no build/test commands are currently available. When implementing:

**Frontend** (expected):
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run tests

**Backend** (expected):
- `pip install -r requirements.txt` - Install dependencies
- `uvicorn main:app --reload` - Start FastAPI development server
- `pytest` - Run tests

## Notes for Implementation

- Follow the two-repository pattern outlined in the specification
- Implement proper error handling for AI model failures
- Consider fallback mechanisms when OpenAI API is unavailable
- Ensure JWT token validation on all backend endpoints
- Use the detailed database schema provided in docs/Spec.md