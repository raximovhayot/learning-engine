# Learning Engine

AI-powered interactive learning platform with multi-agent orchestration. Questions are routed to specialist agents (Math/Euler, Physics/Newton, Programming/Ada, General/Sage) that respond with rich Markdown, LaTeX math, syntax-highlighted code, and interactive visualizations.

---

## Features

- **Multi-agent routing** — lightweight orchestrator sends each question to the right specialist
- **10 interactive STEM visualizations** — function plotter, unit circle, projectile motion, wave physics, sorting algorithms, and more
- **Memory system** — extracts and stores facts about the user, personalizing future responses
- **Spaced repetition** — daily challenges and review sessions (SM-2 algorithm)
- **Streaming chat** — real-time AI responses with Markdown + KaTeX + code highlighting
- **Auth & persistence** — Supabase Auth, conversation history, and pgvector memory store

---

## How requests flow

```
Browser  →  POST /api/chat  →  Server (Next.js Route Handler)
                                      ↓
                             Google Gemini API  (server-side only)
                                      ↓
                           Streaming response back to browser
```

The browser **never** sends or receives the API key. All LLM calls are made server-side using the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable.

---

## Production setup

### 1. Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Docker (for local Supabase)
- A Google AI Studio API key — [get one free](https://aistudio.google.com/apikey)

### 2. Clone & install

```bash
git clone https://github.com/raximovhayot/learning-engine.git
cd learning-engine
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in **all** required values:

| Variable | Description |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | **Required.** Your Google AI Studio key. Never expose this to the client. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) |
| `DATABASE_URL` | PostgreSQL connection string (with pgvector) |
| `API_KEY_ENCRYPTION_SECRET` | 64-char hex string for data-at-rest encryption |

Generate the encryption secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start local Supabase

```bash
./node_modules/supabase/bin/supabase start
```

Then run the database migration:
```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres npx drizzle-kit migrate
```

### 5. Run the app

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

---

## Deployment notes

- Set all environment variables in your hosting provider's dashboard (Vercel, Railway, Fly.io, etc.).
- `GOOGLE_GENERATIVE_AI_API_KEY` must be a **server-side** secret — never prefix it with `NEXT_PUBLIC_`.
- Use a managed Postgres with the `pgvector` extension enabled for the memory system.
- The in-memory rate limiter (20 req/min per IP) is suitable for single-instance deployments. For multi-instance/serverless, replace `src/lib/rate-limit.ts` with a Redis-backed solution such as [Upstash Ratelimit](https://github.com/upstash/ratelimit).

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| AI | Vercel AI SDK v5 + Google Gemini (`gemini-3.1-flash-lite-preview`) |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL + pgvector |
| ORM | Drizzle ORM |
| State | Zustand (no secrets stored) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |

---

## Security

- API keys are **read from server environment variables only** and are never sent to or stored by the browser.
- No API key input is present in the UI.
- All AI provider calls are made in Next.js Route Handlers (server-side).
- Rate limiting is applied to the `/api/chat` endpoint (20 requests/minute per IP).
- Sensitive data stored at rest (database) is encrypted using AES-256-CBC.
