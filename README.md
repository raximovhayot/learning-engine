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
- **BYOK (Bring Your Own Key)** — users supply their own Google AI Studio key; it is stored encrypted server-side

---

## How requests flow (BYOK model)

```
1. User registers / logs in
2. User enters API key in Settings → POST /api/keys
3. Backend encrypts key (AES-256-CBC) and stores it in the database
4. Key NEVER leaves the server again

Chat request:
Browser  →  POST /api/chat (no key in body)
                    ↓
            Server resolves key:
              1. GOOGLE_GENERATIVE_AI_API_KEY env var (optional host override)
              2. User's encrypted key from DB
                    ↓
            Google Gemini API  (server-side only)
                    ↓
          Streaming response back to browser
```

The browser **never sends or receives the API key** after the initial save. All LLM calls are made server-side.

---

## Production setup

### 1. Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Docker (for local Supabase)

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

Edit `.env.local` and fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Optional | Host-level key override. If set, all users share this key and no per-user key is needed. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service-role key (server-side only) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (with pgvector) |
| `API_KEY_ENCRYPTION_SECRET` | Yes | 64-char hex string for encrypting user API keys at rest |

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

### 6. User onboarding (BYOK)

1. User registers at `/register`
2. User navigates to **Settings** → enters their Google AI Studio key ([get one free](https://aistudio.google.com/apikey))
3. The key is sent once to `POST /api/keys`, encrypted, and stored in the DB
4. All subsequent chat requests use the stored key — no key ever travels in a chat request body

---

## Deployment notes

- Set all environment variables in your hosting provider's dashboard (Vercel, Railway, Fly.io, etc.).
- If `GOOGLE_GENERATIVE_AI_API_KEY` is provided as an env var, it acts as a host-level override and users don't need to supply their own key. It is a **server-side** secret — never prefix it with `NEXT_PUBLIC_`.
- `API_KEY_ENCRYPTION_SECRET` must be a 64-character hex string; it encrypts user keys stored in the database.
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
| State | Zustand (no secrets persisted) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |

---

## Security

- **API keys never touch the browser after the initial save.** The save request goes to `POST /api/keys` (authenticated, HTTPS) and the key is immediately encrypted server-side.
- Keys are encrypted with AES-256-CBC using `API_KEY_ENCRYPTION_SECRET` before being written to the database.
- No API key is stored in `localStorage`, cookies, or any client-accessible storage.
- All LLM provider calls are made in Next.js Route Handlers (server-side).
- Rate limiting is applied to the `/api/chat` endpoint (20 requests/minute per IP).
