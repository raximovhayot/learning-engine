-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Memories table with vector embeddings
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'fact',
  content text not null,
  embedding vector(768),
  source_conversation_id uuid references public.conversations(id) on delete set null,
  confidence real not null default 0.8,
  access_count integer not null default 0,
  last_accessed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for vector similarity search
create index if not exists memories_embedding_idx
  on public.memories using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Index for user lookups
create index if not exists memories_user_id_idx on public.memories (user_id);

-- RLS policies
alter table public.memories enable row level security;

create policy "Users can read own memories"
  on public.memories for select
  using (auth.uid() = user_id);

create policy "Users can insert own memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own memories"
  on public.memories for update
  using (auth.uid() = user_id);

create policy "Users can delete own memories"
  on public.memories for delete
  using (auth.uid() = user_id);
