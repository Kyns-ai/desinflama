-- Tabelas usadas pelo serviço desinflama-api.
-- Rodar uma vez no SQL Editor do Supabase.

-- Quem comprou no funil e ainda não entrou (ou já entrou) no app.
create table if not exists public.acessos (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique not null,
  nome        text not null default '',
  email       text not null default '',
  plano       text not null default 'annual',
  -- respostas que o funil já coletou, para o app não repetir as perguntas
  respostas   jsonb not null default '{}'::jsonb,
  criado_em   timestamptz not null default now(),
  ativado_em  timestamptz
);

create index if not exists acessos_email_idx on public.acessos (email);
create index if not exists acessos_criado_em_idx on public.acessos (criado_em desc);

-- Uma linha por análise de foto — é o que limita o custo diário por cliente.
create table if not exists public.analises_ia (
  id         bigserial primary key,
  acesso_id  uuid not null references public.acessos (id) on delete cascade,
  criado_em  timestamptz not null default now()
);

create index if not exists analises_acesso_dia_idx
  on public.analises_ia (acesso_id, criado_em desc);

-- Só o serviço (service role) toca nessas tabelas. O app da cliente nunca
-- fala direto com elas — ele fala com a API, que já valida o token.
alter table public.acessos enable row level security;
alter table public.analises_ia enable row level security;
