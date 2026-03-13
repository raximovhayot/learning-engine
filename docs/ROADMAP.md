# Learning Engine — Roadmap & Implementation Status

> AI-powered interactive learning platform with multi-agent orchestration, BYOK (Gemini 3.1), and rich STEM visualizations.

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented |
| 🔧 | Partially implemented |
| ❌ | Not yet started |

---

## 1. Foundation & Infrastructure

| Feature | Status | Details |
|---------|--------|---------|
| Next.js 16 App Router + Turbopack | ✅ | `next@16.1.6`, TypeScript strict, `pnpm dev --turbopack` |
| Tailwind CSS 4 | ✅ | `@tailwindcss/postcss@4`, dark theme with CSS variables |
| ESLint (flat config) | ✅ | `eslint.config.mjs` with `@next/eslint-plugin-next` (Next.js 16 removed `next lint`) |
| Vercel AI SDK v5 | ✅ | `ai`, `@ai-sdk/google`, `@ai-sdk/react` |
| Gemini 3.1 models | ✅ | `gemini-3.1-flash-lite-preview` as default for all agents |
| **Database (Supabase + pgvector)** | ✅ | PostgreSQL via local Supabase. Drizzle ORM with profiles, api_keys, conversations, messages, orchestrator_logs tables. pgvector for Phase 4 |
| **Drizzle ORM** | ✅ | Type-safe ORM with migration support. Schema in `src/lib/db/schema.ts`, migrations in `drizzle/` |
| **Authentication (Supabase Auth)** | ✅ | Sign up / login pages. Middleware protects routes. Auto-creates profile on registration via DB trigger |
| **API key encryption** | ✅ | AES-256-CBC server-side encryption. Keys stored encrypted in `api_keys` table with separate IV |

---

## 2. BYOK (Bring Your Own Key) System

| Feature | Status | Details |
|---------|--------|---------|
| Google AI Studio key input | ✅ | Settings page at `/settings` with save and test connection |
| Key stored in Zustand + localStorage | ✅ | Sent to server via `DefaultChatTransport` body |
| Key passed to AI SDK provider | ✅ | `createProvider(apiKey)` in `src/lib/ai/provider.ts` |
| **Multi-provider support** | ❌ | Planned: OpenAI, Anthropic, Mistral alongside Google. Provider factory should support switching |
| **Per-user model selection** | ❌ | Planned: user picks model in settings (Flash Lite, Flash, Pro). Currently hardcoded to `gemini-3.1-flash-lite-preview` |
| **Usage/cost tracking** | ❌ | Planned: log token usage per request, show user their costs |
| **AI SDK middleware stack** | ❌ | Planned: auth middleware, cost tracking, subject prompt injection, safety filtering |

---

## 3. Multi-Agent Orchestrator

| Feature | Status | Details |
|---------|--------|---------|
| Orchestrator agent | ✅ | Lightweight Gemini call that returns agent ID (`math`, `physics`, `code`, `general`) |
| Agent definitions | ✅ | 4 specialists with system prompts, personalities, domains in `src/lib/ai/agents.ts` |
| Auto-routing from user message | ✅ | `routeToAgent()` in `src/lib/ai/orchestrator.ts` |
| Agent attribution in UI | 🔧 | Header bar shows agent name/avatar, but not per-message attribution |
| **Direct agent invocation (`@math`)** | ❌ | Planned: `@agent` syntax in input bar to bypass orchestrator |
| **Agent-to-agent delegation** | ❌ | Planned: physics agent calls math agent for derivations via shared bus |
| **Shared context bus** | ❌ | Planned: all agents share memory, user model, learning progress |
| **User-customizable agents** | ❌ | Planned: rename, adjust personality, set per-agent model, create custom agents |
| **Agent enable/disable toggle** | ❌ | Planned: toggle agents on/off in sidebar/settings |
| **Additional specialist agents** | ❌ | Planned: Chemistry (Curie), Biology, History, Language, Writing (Hemingway) |

---

## 4. Chat Interface

| Feature | Status | Details |
|---------|--------|---------|
| Message list with streaming | ✅ | `useChat` + `DefaultChatTransport` + `toUIMessageStreamResponse` |
| User/assistant message bubbles | ✅ | Different styles, avatar, agent name |
| Input bar with Enter-to-send | ✅ | Auto-growing textarea, Shift+Enter for newlines |
| Suggested prompts on empty chat | ✅ | 4 starter questions per domain |
| Typing indicator | ✅ | Animated dots while streaming |
| Error display | ✅ | Red banner with error message |
| Conversation CRUD | ✅ | Create, list, switch, delete in sidebar |
| Auto-title from first message | ✅ | First user message becomes conversation title |
| **Markdown rendering** | ✅ | `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` for rich text, code, and LaTeX |
| **Inline tool results** | ❌ | Planned: render tool call outputs (exercises, visualizations, code) inline in chat |
| **`streamUI` components** | ❌ | Planned: stream React components from server (exercises, diagrams) |
| **File upload / image input** | ❌ | Planned: photograph a math problem, AI parses and teaches |
| **Message editing / regeneration** | ❌ | Planned: edit past messages, regenerate responses |
| **Per-message agent attribution** | ✅ | Each assistant message shows agent name, avatar, and domain badge via stream `messageMetadata` |

---

## 5. Memory System (Core Differentiator)

> The entire memory system is **❌ not yet implemented**. This is the single most important feature to build next.

| Feature | Status | Details |
|---------|--------|---------|
| **Memory extraction pipeline** | ✅ | After each conversation turn, `generateObject()` with Zod schema extracts facts, preferences, goals, skill_levels, episodic memories |
| **Memory types** | ✅ | Facts, preferences, goals, skill_level, episodic |
| **Vector storage (pgvector)** | ✅ | `gemini-embedding-001` (768-dim) with pgvector IVFFlat index for cosine similarity search |
| **Memory retrieval** | ✅ | Before each response, embed query → cosine search → top-8 → inject into system prompt |
| **Memory CRUD** | ✅ | Store, list, delete individual, delete all — via REST API `/api/memories` |
| **Memory consolidation** | ❌ | Periodic reflection to merge and summarize memories |
| **Memory panel in sidebar** | ✅ | Expandable panel shows all memories with type icons, delete buttons, refresh, clear all |
| **User model** | ❌ | Structured understanding of user: knowledge level, preferences, learning style |
| **Memory-aware system prompts** | ✅ | Relevant memories injected into agent system prompts with instructions to personalize |

---

## 6. Learning Capability

> The interactive learning system is **✅ implemented** in Phase 5.

| Feature | Status | Details |
|---------|--------|---------|
| **Exercise generation** | ✅ | `generateObject()` with Zod schemas: `{ type, prompt, options, correctAnswer, hints }` in `src/lib/ai/schemas.ts` |
| **Exercise types** | ✅ | MCQ, fill-in-blank, free-text — rendered by `ExerciseWidget` component |
| **Answer checking with AI** | ✅ | AI evaluates free-form answers via `/api/exercises/check`, gives detailed feedback |
| **Progressive hints** | ✅ | `/api/exercises/hint` returns hints by index (3 hints per exercise) |
| **Lesson player** | ✅ | Step-through UI in `LessonPlayer` component with progress bar and XP reward screen |
| **Lesson structure** | ✅ | Courses → Units → Lessons → Steps (content + exercises) in DB schema |
| **AI course generator** | ✅ | `POST /api/courses` generates full course structure with `generateObject` from topic input |
| **Pre-built courses** | ✅ | 3 seed courses (Math Fundamentals, Python Basics, Science Basics) in `src/lib/db/seeds/courses.ts` |
| **Spaced repetition** | ✅ | SM-2 algorithm in `src/lib/gamification/spaced-repetition.ts`, review queue via `/api/review` |
| **Progress tracking** | ✅ | Per-lesson completion and scores via `learning_progress` table and `/api/progress` |
| **Learning dashboard** | ✅ | `/learn` page with daily challenge, review queue, and course grid |
| **Daily challenges** | ✅ | AI-generated daily challenge via `/api/daily-challenge` (deterministic per day) |

---

## 7. STEM Visualization Engine

> The visualization system is **❌ not yet implemented**. `framer-motion` and `katex` are installed but unused.

### Renderer Stack (All ❌)

| Renderer | Tech | Use Cases |
|----------|------|-----------|
| **Graph2D** | D3.js / Recharts | Function plots, data charts, bar/line/scatter |
| **Graph3D** | Three.js | 3D surfaces, vector fields, molecular structures |
| **Geometry** | Custom Canvas / SVG | Geometric constructions, proofs, transformations |
| **Physics Sim** | Matter.js (2D) / Cannon.js (3D) | Projectile motion, collisions, pendulums, springs |
| **Field Viz** | Custom WebGL / D3 | Electric/magnetic fields, gravitational fields |
| **Molecule** | 3Dmol.js | 3D molecular structures, orbitals |
| **Math Anim** | Custom React + Framer Motion | Step-by-step equation solving, matrix operations |
| **Code Viz** | Custom React | Algorithm step-throughs, tree/graph traversals |
| **Diagram** | Mermaid / Excalidraw | Flowcharts, system diagrams, mind maps |

### Pre-built Visualization Library (MVP target: 30-50, All ❌)

| Subject | Planned Visualizations |
|---------|----------------------|
| Algebra | Function plotter (2D), equation balance scale, number line |
| Calculus | Derivative tangent line, integral area, limit approach, Taylor series |
| Linear Algebra | Vector operations, matrix transformations (2D/3D), eigenvalue visualization |
| Trigonometry | Unit circle, wave superposition, polar plots |
| Statistics | Distribution curves, sampling, regression, probability trees |
| Mechanics | Projectile motion, free body diagrams, spring oscillation, pendulum, collisions |
| E&M | Electric/magnetic fields, circuits, wave propagation |
| Waves | Standing waves, interference, Doppler effect |
| Orbital Mechanics | Orbits, escape velocity, Kepler's laws |
| Chemistry | 3D molecules, reaction energy diagrams, orbital shapes |
| CS | Sorting visualizer, tree/graph traversal, stack/queue operations |

### Visualization Delivery (❌)

| Feature | Details |
|---------|---------|
| **Path 1: Parametric components** | Agent calls `visualize({ type, params })`, engine renders pre-built React component. Fast, reliable |
| **Path 2: AI-generated** | Agent calls `generateVisualization({ description })`, AI writes React + D3/Three.js code, sandboxed execution. Flexible, slower |
| **Inline rendering** | Visualizations appear inline in chat messages via `streamUI` |
| **Interactive controls** | Sliders, drag, zoom, play/pause on all visualizations |

---

## 8. Code Capability

| Feature | Status | Details |
|---------|--------|---------|
| Code agent (Ada) with system prompt | ✅ | Can discuss code in plain text |
| **Sandboxed code execution** | ❌ | Planned: Sandpack (browser-side) for JS/TS/Python/React |
| **Inline code blocks with syntax highlighting** | ✅ | `react-syntax-highlighter` (Prism + oneDark theme) with language labels and copy button |
| **Run button on code blocks** | ❌ | Planned: execute code inline and show output |
| **Algorithm visualization** | ❌ | Planned: step-through sorting, tree traversal, etc. |
| **Code challenges** | ❌ | Planned: AI generates coding challenges, evaluates solutions |

---

## 9. Gamification

> Gamification is **❌ entirely not implemented**.

| Feature | Status | Details |
|---------|--------|---------|
| **XP system** | ❌ | +10 per step, +50 per lesson, +25 perfect bonus, +100 daily challenge |
| **Levels** | ❌ | XP thresholds for level progression |
| **Streaks** | ❌ | Daily streak tracking, streak freezes, flame icon |
| **Achievements** | ❌ | "First Steps", "Curious Mind", "Night Owl", "Speed Demon", "Scholar", "Polymath" |
| **Leaderboards** | ❌ | Weekly leagues: Bronze → Silver → Gold → Platinum → Diamond |
| **Progress dashboard** | ❌ | Visual overview of XP, level, streak, courses, achievements |
| **Celebration animations** | ❌ | Framer Motion confetti, level-up modal, streak milestone animations |

---

## 10. Live API (Voice & Real-time)

> Live API is **❌ entirely not implemented**.

| Feature | Status | Details |
|---------|--------|---------|
| **Voice input (STT)** | ❌ | WebRTC or Web Speech API capture → transcription |
| **Voice output (TTS)** | ❌ | Stream audio chunks back from TTS API |
| **Gemini Live API** | ❌ | Real-time bidirectional voice with native tool access |
| **Voice mode toggle** | ❌ | 🎤 button in input bar to switch to voice |
| **WebSocket server** | ❌ | Persistent connections for real-time streaming |
| **Developer API (external)** | ❌ | REST + WebSocket API for third-party developers |

---

## 11. Canvas / Artifacts

> Canvas system is **❌ not implemented**.

| Feature | Status | Details |
|---------|--------|---------|
| **Document creation** | ❌ | AI creates rich documents (like Claude's artifacts) |
| **Diagram generation** | ❌ | Mermaid / Excalidraw diagrams inline |
| **Chart generation** | ❌ | Data visualizations from conversation context |
| **Inline editing** | ❌ | Edit AI-generated content in-place |

---

## 12. Database Schema

> Schema is **✅ implemented** (Phase 3 tables: profiles, api_keys, conversations, messages, orchestrator_logs). Remaining tables are for future phases.

### Planned Tables

```
users                    — id, email, name, avatar, xp, level, streak, preferences
api_keys                 — id, user_id, provider, encrypted_key, model_preference
agents                   — id, slug, name, avatar, domain, system_prompt, tools, model, is_system
user_agent_config        — id, user_id, agent_id, custom_name, enabled, model_override
conversations            — id, user_id, title, agent_config_snapshot, created_at
conversation_agents      — id, conversation_id, agent_id, message_count
messages                 — id, conversation_id, role, agent_id, content, tool_calls, visualizations, tokens
orchestrator_logs        — id, conversation_id, message_id, routing_decision, latency_ms
memories                 — id, user_id, type, content, embedding (vector), confidence, access_count
memory_entities          — id, user_id, name, type, attributes
memory_relations         — id, from_entity_id, to_entity_id, relation_type
learning_progress        — id, user_id, subject, topic, proficiency_level, exercises_completed
review_queue             — id, user_id, subject, topic, exercise_data, next_review_at, ease_factor
courses                  — id, title, slug, subject, difficulty, author_id, is_ai_generated
units                    — id, course_id, title, order_index
lessons                  — id, unit_id, title, type, estimated_minutes, xp_reward
lesson_steps             — id, lesson_id, type, content_data, exercise_data
user_exercise_history    — id, user_id, lesson_step_id, user_answer, is_correct, ai_feedback
achievements             — id, slug, title, description, icon, criteria
user_achievements        — id, user_id, achievement_id, unlocked_at
daily_challenges         — id, date, subject, exercise_data
usage_logs               — id, user_id, provider, model, input_tokens, output_tokens, cost_estimate
visualizations           — id, message_id, type, params, renderer, interactive
```

---

## Recommended Build Order (Phases)

### Phase 1 — Foundation ✅ DONE
> Project scaffold, chat, BYOK, multi-agent routing

### Phase 2 — Rich Chat ✅ DONE
> Markdown rendering, code syntax highlighting, LaTeX math (KaTeX), per-message agent badges

### Phase 3 — Database & Auth ✅ DONE
> Supabase setup, Drizzle ORM, user accounts, encrypted API key storage, conversation persistence server-side

### Phase 4 — Memory System ✅ DONE
> Memory extraction, pgvector, retrieval, injection into context, memory panel UI

### Phase 5 — Learning Capability ✅ DONE
> Exercise generation, answer checking, lesson player, progress tracking, spaced repetition

### Phase 6 — Visualizations v1
> 10 core STEM visualizations (function plotter, projectile motion, vectors, unit circle, etc.), inline rendering

### Phase 7 — Code Capability
> Sandpack integration, inline code execution, algorithm visualization

### Phase 8 — Gamification
> XP, streaks, achievements, progress dashboard, celebration animations

### Phase 9 — Live API (Voice)
> Gemini Live API, voice mode, real-time voice + tools

### Phase 10 — Visualizations v2 + Canvas
> 20 more visualizations, AI-generated visualizations, canvas/artifacts system

### Phase 11 — Developer API
> External WebSocket + REST API for third-party developers

---

## File Structure — Current vs Planned

```
src/
├── app/
│   ├── layout.tsx                      ✅
│   ├── page.tsx                        ✅
│   ├── globals.css                     ✅
│   ├── chat/[id]/page.tsx              ✅
│   ├── settings/page.tsx               ✅
│   ├── api/chat/route.ts               ✅
│   │
│   ├── (auth)/login/                   ❌
│   ├── (auth)/register/                ❌
│   ├── explore/                        ❌  discover courses/capabilities
│   ├── memory/                         ❌  view/manage agent memories
│   ├── progress/                       ❌  learning dashboard
│   ├── settings/api-keys/              ❌  multi-provider key management
│   ├── settings/agent/                 ❌  agent customization
│   └── api/live/route.ts               ❌  WebSocket endpoint
│
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx          ✅
│   │   ├── input-bar.tsx               ✅
│   │   ├── message-bubble.tsx          ✅  (markdown/LaTeX/code rendering + agent badges)
│   │   ├── markdown-renderer.tsx       ✅  ReactMarkdown + KaTeX + syntax highlighting
│   │   ├── tool-result.tsx             ❌
│   │   └── stream-renderer.tsx         ❌
│   ├── sidebar/
│   │   └── sidebar.tsx                 ✅  (needs memory panel, capability toggles)
│   ├── capabilities/
│   │   ├── learning/                   ❌  exercise widgets, lesson card, progress ring
│   │   ├── code/                       ❌  code block, sandbox
│   │   ├── canvas/                     ❌  document view, diagram
│   │   └── voice/                      ❌  voice button, waveform, live indicator
│   ├── visualizations/                 ❌  all STEM visualization components
│   └── gamification/                   ❌  xp bar, streak counter, achievement toast
│
├── lib/
│   ├── ai/
│   │   ├── provider.ts                 ✅
│   │   ├── agents.ts                   ✅
│   │   ├── orchestrator.ts             ✅
│   │   ├── middleware.ts               ❌  AI SDK middleware stack
│   │   ├── schemas.ts                  ❌  Zod schemas for structured output
│   │   └── tools.ts                    ❌  AI SDK tool definitions
│   ├── memory/
│   │   ├── store.ts                    ❌
│   │   ├── extractor.ts               ❌
│   │   ├── retriever.ts               ❌
│   │   └── consolidator.ts            ❌
│   ├── capabilities/
│   │   ├── registry.ts                ❌
│   │   ├── learning/tools.ts          ❌
│   │   ├── code/tools.ts              ❌
│   │   ├── search/tools.ts            ❌
│   │   └── voice/                     ❌
│   ├── live/
│   │   ├── websocket.ts               ❌
│   │   └── audio.ts                   ❌
│   ├── gamification/
│   │   ├── xp.ts                      ❌
│   │   ├── streaks.ts                 ❌
│   │   └── spaced-repetition.ts       ❌
│   ├── db/
│   │   ├── schema.ts                  ❌  Drizzle schema
│   │   ├── queries.ts                 ❌
│   │   └── vector.ts                  ❌  pgvector operations
│   ├── store/
│   │   └── chat-store.ts              ✅
│   ├── types.ts                       ✅
│   └── utils.ts                       ✅
│
└── drizzle/                            ❌  migrations
```

---

## Dependencies — Installed vs Needed

### Installed but unused
| Package | Intended Use |
|---------|-------------|
| `framer-motion` | Celebration animations, lesson transitions, visualization animations |

### Installed in Phase 2
| Package | Purpose |
|---------|---------|
| `react-markdown` | Markdown rendering in chat messages |
| `remark-gfm` | GitHub Flavored Markdown (tables, strikethrough, etc.) |
| `remark-math` | Parse LaTeX math expressions in markdown |
| `rehype-katex` | Render LaTeX math via KaTeX |
| `react-syntax-highlighter` | Code block syntax highlighting (Prism + oneDark theme) |

### Not yet installed (needed for future phases)
| Package | Phase | Purpose |
|---------|-------|---------|
| `@supabase/supabase-js` | 3 | Database, auth, realtime |
| `drizzle-orm` + `drizzle-kit` | 3 | Type-safe ORM + migrations |
| `@codesandbox/sandpack-react` | 7 | In-browser code execution |
| `d3` | 6 | 2D data visualizations |
| `three` + `@react-three/fiber` + `@react-three/drei` | 6 | 3D visualizations |
| `matter-js` | 6 | 2D physics simulations |
| `zod` | 5 | Schema validation for AI structured output |
| `mermaid` | 10 | Diagram rendering |

---

## Summary

| Area | Progress |
|------|----------|
| Foundation (Next.js, Tailwind, AI SDK, BYOK) | ✅ Done |
| Multi-agent orchestrator (4 agents, auto-routing) | ✅ Done |
| Chat UI (streaming, conversations, sidebar) | ✅ Done |
| Rich chat (markdown, code, LaTeX) | ✅ Done |
| Database & Auth | ✅ Done |
| Memory System | ✅ Done |
| Learning Capability (exercises, lessons, progress) | ✅ Done |
| STEM Visualizations | ❌ Not started |
| Code Execution | ❌ Not started |
| Gamification | ❌ Not started |
| Live API / Voice | ❌ Not started |
| Canvas / Artifacts | ❌ Not started |
| Developer API | ❌ Not started |

**~40% of the planned platform is built.** The foundation, core chat loop, and rich chat rendering are solid. The next highest-impact features to implement are: **(1) Memory system**, **(2) Learning capability with exercises**, **(3) STEM visualizations**.
