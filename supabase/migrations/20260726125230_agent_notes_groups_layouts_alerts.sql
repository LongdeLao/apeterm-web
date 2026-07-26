-- Agent convenience features: research notes, named watchlists, saved layouts, alerts.
-- Follows the RLS shape already used by public.profiles / public.watchlists.

-- ── notes ────────────────────────────────────────────────────────────────────
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null default '—',
  body text not null check (char_length(body) between 1 and 2000),
  starred boolean not null default false,
  source text not null default 'manual' check (source in ('manual', 'agent', 'filing', 'headline')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notes_user_created_idx on public.notes (user_id, created_at desc);
create index notes_user_symbol_idx on public.notes (user_id, symbol);

-- ── named watchlists ─────────────────────────────────────────────────────────
-- public.watchlists stays as the single default list so existing sessions keep
-- working; groups are additive and carry their own name.
create table public.watchlist_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  symbols text[] not null default array[]::text[],
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint watchlist_groups_symbol_limit check (cardinality(symbols) <= 50),
  constraint watchlist_groups_unique_name unique (user_id, name)
);
create index watchlist_groups_user_idx on public.watchlist_groups (user_id, position);

-- ── saved layouts ────────────────────────────────────────────────────────────
create table public.layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint layouts_unique_name unique (user_id, name)
);

-- ── alerts ───────────────────────────────────────────────────────────────────
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('price_above', 'price_below', 'percent_move', 'filing', 'digest')),
  symbol text,
  filer text,
  threshold numeric,
  schedule text,
  note text,
  active boolean not null default true,
  triggered_at timestamptz,
  last_value numeric,
  created_at timestamptz not null default now()
);
create index alerts_user_active_idx on public.alerts (user_id, active);

-- ── row level security ───────────────────────────────────────────────────────
alter table public.notes enable row level security;
alter table public.watchlist_groups enable row level security;
alter table public.layouts enable row level security;
alter table public.alerts enable row level security;

grant select, insert, update, delete on table public.notes to authenticated;
grant select, insert, update, delete on table public.watchlist_groups to authenticated;
grant select, insert, update, delete on table public.layouts to authenticated;
grant select, insert, update, delete on table public.alerts to authenticated;

do $$
declare
  target text;
begin
  foreach target in array array['notes', 'watchlist_groups', 'layouts', 'alerts'] loop
    execute format(
      'create policy "Users read own %1$s" on public.%1$I for select to authenticated using ((select auth.uid()) = user_id)',
      target
    );
    execute format(
      'create policy "Users insert own %1$s" on public.%1$I for insert to authenticated with check ((select auth.uid()) = user_id)',
      target
    );
    execute format(
      'create policy "Users update own %1$s" on public.%1$I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      target
    );
    execute format(
      'create policy "Users delete own %1$s" on public.%1$I for delete to authenticated using ((select auth.uid()) = user_id)',
      target
    );
  end loop;
end $$;
