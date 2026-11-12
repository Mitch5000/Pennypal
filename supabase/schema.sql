-- Pennypal backend schema for Supabase (Postgres)
-- Personal finance data is PRIVATE per user: RLS scopes every row to its owner.
-- Run this once in the Supabase SQL Editor.

create table if not exists public.transactions (
  id          text primary key default gen_random_uuid()::text,
  user_id     text not null,
  amount      double precision not null default 0,
  type        text not null default 'expense',          -- 'income' | 'expense'
  category    text not null default '',
  description text not null default '',
  date        text not null default '',                  -- YYYY-MM-DD
  created_at  text not null default ''
);

create table if not exists public.budgets (
  id           text primary key default gen_random_uuid()::text,
  user_id      text not null,
  category     text not null default '',
  limit_amount double precision not null default 0,
  month        text not null default '',                 -- YYYY-MM
  created_at   text not null default ''
);

create index if not exists transactions_user_date_idx on public.transactions(user_id, date desc);
create index if not exists budgets_user_month_idx     on public.budgets(user_id, month);

-- Row Level Security: each user sees/writes ONLY their own rows.
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;

do $$ begin
  create policy "own_transactions" on public.transactions
    for all to authenticated
    using (auth.uid()::text = user_id)
    with check (auth.uid()::text = user_id);
  create policy "own_budgets" on public.budgets
    for all to authenticated
    using (auth.uid()::text = user_id)
    with check (auth.uid()::text = user_id);
exception when duplicate_object then null; end $$;

-- Realtime: keeps multiple devices/tabs in sync for the signed-in user.
do $$ begin alter publication supabase_realtime add table public.transactions; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.budgets;      exception when duplicate_object then null; end $$;
