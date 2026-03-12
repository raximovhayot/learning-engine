## Cursor Cloud specific instructions

### Overview

Learning Engine is a Next.js 16 AI-powered interactive learning platform with multi-agent orchestration. It uses the Vercel AI SDK (`ai` + `@ai-sdk/google`) with BYOK (Bring Your Own Key) for Google AI Studio / Gemini models.

### Key commands

- **Dev server:** `pnpm dev` (runs on port 3000 with Turbopack)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint` (uses ESLint flat config directly, NOT `next lint` which was removed in Next.js 16)

### Architecture notes

- **AI SDK v5**: Uses `DefaultChatTransport` instead of the old `api`/`body` options in `useChat`. Uses `sendMessage({ text })` instead of `append`, `status` instead of `isLoading`, `toUIMessageStreamResponse` instead of `toDataStreamResponse`, and `maxOutputTokens` instead of `maxTokens`.
- **BYOK**: Users enter their Google AI Studio API key in the Settings page (`/settings`). The key is stored in localStorage via Zustand persist and sent to the server via the `DefaultChatTransport` body.
- **Multi-agent**: The orchestrator (a lightweight Gemini call) routes user messages to specialist agents (Math/Euler, Physics/Newton, Code/Ada, General/Sage). Agent definitions live in `src/lib/ai/agents.ts`.
- **Models**: Uses `gemini-3.1-flash-lite-preview` as the default model for all agents.

### Caveats

- Chat functionality requires a valid `GOOGLE_GENERATIVE_AI_API_KEY` env var OR a user-provided key via the Settings UI. Without it, chat requests return 401.
- The `eslint-config-next` package is installed but the ESLint config (`eslint.config.mjs`) uses the flat config format with `@next/eslint-plugin-next` directly, since `next lint` was removed in Next.js 16.
