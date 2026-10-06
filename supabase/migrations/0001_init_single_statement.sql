DO $mig$
BEGIN
-- Heike Schaub: Admin-Bereich (Nachrichten, Blog, Einstellungen, Rate-Limits)
-- Alle Tabellen haben RLS ohne Policies: erreichbar nur über den Service-Key im Server.

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  message text not null,
  wants_questions boolean not null default false,
  status text not null default 'new' check (status in ('new', 'read', 'answered', 'archived')),
  questions_sent_at timestamptz,
  note text not null default ''
);
create index if not exists submissions_created_idx on public.submissions (created_at desc);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'article' check (type in ('event', 'announcement', 'article')),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  cover_image_url text,
  cover_image_alt text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  event_date text,
  event_time text,
  event_location text,
  event_cta_label text,
  event_cta_href text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz not null default now(),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_status_published_idx on public.posts (status, published_at desc);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  key text primary key,
  window_start bigint not null,
  count integer not null,
  expires_at timestamptz not null
);

alter table public.submissions enable row level security;
alter table public.posts enable row level security;
alter table public.settings enable row level security;
alter table public.rate_limits enable row level security;

-- Atomarer Zähler: erhöht den Zähler im laufenden Zeitfenster (oder startet ein neues)
-- und gibt den neuen Stand zurück.
create or replace function public.rl_hit(p_key text, p_window_ms bigint)
returns integer
language plpgsql
set search_path = public
as $$
declare
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  result integer;
begin
  delete from public.rate_limits where expires_at < now();

  insert into public.rate_limits as r (key, window_start, count, expires_at)
  values (p_key, now_ms, 1, now() + (p_window_ms * 2 || ' milliseconds')::interval)
  on conflict (key) do update set
    window_start = case when now_ms - r.window_start >= p_window_ms then now_ms else r.window_start end,
    count = case when now_ms - r.window_start >= p_window_ms then 1 else r.count + 1 end,
    expires_at = now() + (p_window_ms * 2 || ' milliseconds')::interval
  returning count into result;

  return result;
end;
$$;

-- Aktueller Stand im Zeitfenster, ohne zu zählen.
create or replace function public.rl_peek(p_key text, p_window_ms bigint)
returns integer
language sql
stable
set search_path = public
as $$
  select coalesce(
    (select case
       when ((extract(epoch from clock_timestamp()) * 1000)::bigint - window_start) >= p_window_ms then 0
       else count end
     from public.rate_limits where key = p_key),
    0);
$$;

revoke all on function public.rl_hit(text, bigint) from public, anon, authenticated;
revoke all on function public.rl_peek(text, bigint) from public, anon, authenticated;
grant execute on function public.rl_hit(text, bigint) to service_role;
grant execute on function public.rl_peek(text, bigint) to service_role;

-- Öffentlicher Speicher für Bilder aus dem Blog
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;
END
$mig$;
