## Cursor Cloud specific instructions

### Overview

Learning Engine is a Next.js 16 AI-powered interactive learning platform with multi-agent orchestration. It uses the Vercel AI SDK (`ai` + `@ai-sdk/google`) with BYOK (Bring Your Own Key) for Google AI Studio / Gemini models.

### Key commands

- **Dev server:** `pnpm dev` (runs on port 3000 with Turbopack)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint` (uses ESLint flat config directly, NOT `next lint` which was removed in Next.js 16)
- **Full roadmap:** See `docs/ROADMAP.md` for implementation status and planned features

### Architecture notes

- **AI SDK v5**: Uses `DefaultChatTransport` (not the old `api`/`body` options) in `useChat`. Uses `sendMessage({ text })` instead of `append`, `status` instead of `isLoading`, `toUIMessageStreamResponse` instead of `toDataStreamResponse`, `maxOutputTokens` instead of `maxTokens`, and `convertToModelMessages()` to convert UIMessages to ModelMessages in the API route.
- **BYOK**: The `GOOGLE_GENERATIVE_AI_API_KEY` env var takes priority over user-provided keys. Users can enter a key in the Settings page (`/settings`) which is stored in localStorage via Zustand persist. The provider in `src/lib/ai/provider.ts` resolves keys with env var first, then user key.
- **Multi-agent**: The orchestrator (a lightweight Gemini call) routes user messages to specialist agents (Math/Euler, Physics/Newton, Code/Ada, General/Sage). Agent definitions live in `src/lib/ai/agents.ts`.
- **Models**: Uses `gemini-3.1-flash-lite-preview` as the default model for all agents.
- **Rich chat (Phase 2)**: Assistant messages render markdown via `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex`. Code blocks use `react-syntax-highlighter` (Prism + oneDark). Per-message agent attribution uses AI SDK v5 `messageMetadata` in `toUIMessageStreamResponse`; the client reads `message.metadata` (typed as `unknown`, cast to `AgentMetadata`).

### Database & Auth (Phase 3)

- **Local Supabase**: Requires Docker. Start with `./node_modules/supabase/bin/supabase start` from the workspace root. The `supabase/` directory contains the Supabase config and auth trigger migration.
- **Drizzle ORM**: Schema in `src/lib/db/schema.ts`. Run migrations with `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres npx drizzle-kit migrate`. Generate new migrations with `npx drizzle-kit generate`.
- **Auth flow**: Registration auto-creates a profile row via a Postgres trigger on `auth.users`. Middleware in `src/middleware.ts` protects non-public routes (redirects unauthenticated users to `/login`).
- **Hydration guard**: Pages check `hydrated` from the Zustand store before redirecting, to avoid a race condition where `user` is null before localStorage rehydrates.
- **API key encryption**: Uses AES-256-CBC via `src/lib/crypto.ts`. The `API_KEY_ENCRYPTION_SECRET` env var must be a 64-char hex string.

### Memory System (Phase 4)

- **Extraction**: After each chat response finishes (`onFinish` callback in `streamText`), the system calls `generateObject()` with a Zod schema to extract facts, preferences, goals, skill levels, and episodic memories from the conversation turn.
- **Embeddings**: Uses `gemini-embedding-001` with `outputDimensionality: 768` (passed via `providerOptions.google`). The pgvector column is `vector(768)` with an IVFFlat index.
- **Retrieval**: Before each agent response, the system embeds the user's query, performs cosine similarity search on the memories table, and injects the top-8 relevant memories into the agent's system prompt.
- **Memory panel**: Expandable sidebar component (`src/components/sidebar/memory-panel.tsx`) that fetches from `/api/memories`.

### Caveats

- Chat functionality requires a valid `GOOGLE_GENERATIVE_AI_API_KEY` env var OR a user-provided key via the Settings UI. Without it, chat requests return 401.
- The `eslint-config-next` package is installed but the ESLint config (`eslint.config.mjs`) uses the flat config format with `@next/eslint-plugin-next` directly, since `next lint` was removed in Next.js 16.
- When restarting the dev server, ensure no stale `next-server` processes are holding port 3000 and remove `.next/dev/lock` if it exists.
- The Settings UI requires any non-empty string saved to enable the chat input. When `GOOGLE_GENERATIVE_AI_API_KEY` is set as an env var, the actual key value entered in the UI doesn't matter — the env var is used for all API calls.
