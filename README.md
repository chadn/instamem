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

## Repos

-   instamem or instamem-frontend
    -   react next.js deployed on vercel
    -   supabase for auth, gets JWT
    -   UX for calls supabase for reads, instantsearch UI
    -   calls instamem-server for updates, streamlit like UX using [ShadCN](https://ui.shadcn.com/)
-   instamem-server
    -   API server in python
    -   uses python langchain and openAI to do text to tool calling
    -   uses JWT from frontend to update data in supabase

## Spec

See [WIP Spec](docs/Spec.md)
