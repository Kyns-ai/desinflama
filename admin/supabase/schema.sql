-- Desinflama — schema Supabase (consumidor + admin)
-- Aplique no SQL editor do Supabase. O app da usuária sincroniza nestas tabelas;
-- o admin lê via service-role (ignora RLS).

-- Perfis (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  email text,
  onboarding jsonb,
  created_at timestamptz default now(),
  last_active_at timestamptz default now()
);

-- Assinatura (espelho do entitlement do RevenueCat; atualizada por webhook)
create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles on delete cascade,
  is_premium boolean default false,
  plan text default 'free',         -- free | trial | monthly | annual
  source text default 'none',       -- web | ios | android
  renews_at timestamptz,
  updated_at timestamptz default now()
);

-- Progresso da jornada
create table if not exists public.journey_progress (
  user_id uuid primary key references public.profiles on delete cascade,
  current_day int default 1,
  phase text,
  challenge_type text default 'main14',
  completed_days int[] default '{}',
  started_at timestamptz default now()
);

-- Registros diários
create table if not exists public.daily_logs (
  id text primary key,
  user_id uuid references public.profiles on delete cascade,
  date date not null,
  meals jsonb default '[]',
  symptoms jsonb default '{}',
  mood int,
  created_at timestamptz default now()
);
create index if not exists daily_logs_user_idx on public.daily_logs(user_id, date);

-- Índice Intestinal por dia
create table if not exists public.gut_scores (
  user_id uuid references public.profiles on delete cascade,
  date date not null,
  value int not null,
  delta int default 0,
  primary key (user_id, date)
);

-- Leads de acompanhamento individual
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete set null,
  type text default 'acompanhamento',
  status text default 'novo',        -- novo | contatado | fechado | perdido
  context text,
  created_at timestamptz default now()
);

-- Conteúdo (CMS — opcional; permite a nutri editar sem deploy)
create table if not exists public.content (
  id text primary key,
  tipo text not null,                -- dia | aula | receita | gatilho | troca
  titulo text not null,
  fase text,
  status text default 'rascunho',    -- rascunho | em_revisao | publicado
  body jsonb,
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- RLS: cada usuária só acessa os próprios dados. O admin usa service-role
-- (que ignora RLS), então não precisa de policy de admin aqui.
-- ----------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.journey_progress  enable row level security;
alter table public.daily_logs        enable row level security;
alter table public.gut_scores        enable row level security;
alter table public.leads             enable row level security;

create policy "own profile"     on public.profiles         for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own subscription" on public.subscriptions   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress"    on public.journey_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logs"        on public.daily_logs       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own scores"      on public.gut_scores       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "insert own lead" on public.leads            for insert with check (auth.uid() = user_id);

-- Conteúdo publicado é legível por qualquer usuária autenticada
alter table public.content enable row level security;
create policy "read published content" on public.content for select using (status = 'publicado');
