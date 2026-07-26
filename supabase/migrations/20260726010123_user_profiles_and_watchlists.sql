create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  language text not null default 'english' check (language in ('english', 'german')),
  theme text not null default 'dark' check (theme in ('dark', 'light', 'transparent', 'bloomberg')),
  experience text not null default 'pro' check (experience in ('simple', 'pro')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.watchlists (
  user_id uuid primary key references auth.users (id) on delete cascade,
  symbols text[] not null default array['SPY','QQQ','NVDA','AAPL','MSFT','AMZN','META','GOOGL','TSLA','JPM','NFLX']::text[],
  updated_at timestamptz not null default now(),
  constraint watchlists_symbol_limit check (cardinality(symbols) <= 25)
);

alter table public.profiles enable row level security;
alter table public.watchlists enable row level security;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.watchlists to authenticated;

create policy "Users can read their profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can create their profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can read their watchlist"
on public.watchlists for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their watchlist"
on public.watchlists for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their watchlist"
on public.watchlists for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
