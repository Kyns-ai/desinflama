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

-- ============================================================================
-- ONDA 2 (03/08/2026) — o que o app ganhou depois deste schema:
-- Prato/Nota Desinflama, Prazeres, sementes com dois contadores e cardápio
-- pessoal. Sem estas tabelas o admin consegue contar usuárias, mas não
-- consegue responder as perguntas que interessam: o que elas estão comendo,
-- o que estão trocando por prazer e onde o cardápio não serve.
-- ============================================================================

-- Refeições fotografadas e pontuadas (aba Prato).
-- A NOTA é gravada junto: ela é calculada no aparelho com o Mapa de Tolerância
-- daquele momento, então recalcular depois daria um número diferente do que a
-- cliente viu. Histórico tem que refletir o que ela viu.
create table if not exists public.meals (
  id text primary key,
  user_id uuid references public.profiles on delete cascade,
  date date not null,
  momento text not null,             -- cafe | almoco | jantar | lanche
  nome text,
  itens jsonb default '[]',          -- [{nome, grupo, marcadores}]
  nota int not null,                 -- 0–100, como exibida à cliente
  troca text,
  created_at timestamptz default now()
);
create index if not exists meals_user_idx on public.meals(user_id, date);
create index if not exists meals_nota_idx on public.meals(nota);

-- Sementes: saldo e acumulado. Duas colunas, não uma —
-- gastar na loja NUNCA pode rebaixar o nível do Broto.
create table if not exists public.seeds (
  user_id uuid primary key references public.profiles on delete cascade,
  balance int default 0,             -- gastável
  lifetime int default 0,            -- só sobe; define o nível
  updated_at timestamptz default now()
);

-- Resgates da loja de Prazeres.
-- `preco` é gravado junto de propósito: se a tabela de preços mudar, o
-- histórico dela não pode mudar junto.
create table if not exists public.rewards_redeemed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  prazer_id text not null,
  nome text not null,
  preco int not null,
  reacao int,                        -- 0–3, respondida no check-in seguinte
  date date not null,
  created_at timestamptz default now()
);
create index if not exists rewards_user_idx on public.rewards_redeemed(user_id, date);

-- Mapa de Tolerância: cada teste de reintrodução.
create table if not exists public.tolerance_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  grupo text not null,               -- lactose | frutose | frutanos | gos | polioles
  reacao int not null,               -- 0 tolerou … 3 forte
  dia int,
  date_tested date not null,
  created_at timestamptz default now()
);
create index if not exists tolerance_user_idx on public.tolerance_results(user_id);

-- Preferências de comida ("gosto / não é pra mim") — o que monta o cardápio.
-- É a tabela mais valiosa do lote para produto: o que aparece muito em `evita`
-- é receita que precisa de alternativa, e o que aparece em `gosta` e não tem
-- receita é buraco de catálogo.
create table if not exists public.food_preferences (
  user_id uuid primary key references public.profiles on delete cascade,
  gosta text[] default '{}',
  evita text[] default '{}',
  updated_at timestamptz default now()
);

alter table public.meals             enable row level security;
alter table public.seeds             enable row level security;
alter table public.rewards_redeemed  enable row level security;
alter table public.tolerance_results enable row level security;
alter table public.food_preferences  enable row level security;

create policy "own meals"       on public.meals             for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own seeds"       on public.seeds             for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rewards"     on public.rewards_redeemed  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tolerance"   on public.tolerance_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own preferences" on public.food_preferences  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
