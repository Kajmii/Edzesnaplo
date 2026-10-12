-- Edzésnapló: Google-belépés átadása a Chrome-ból az APK-nak (handoff)
-- Supabase -> SQL Editor -> illeszd be az egészet -> Run.
-- A "destruktív művelet" figyelmeztetésnél nyugodtan Run query: csak a saját
-- handoff függvényeket és táblát cseréli le.

-- 1) Régi put_handoff / take_handoff függvények törlése (bármilyen paraméterezéssel)
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('put_handoff', 'take_handoff')
  loop
    execute 'drop function if exists ' || r.sig || ' cascade';
  end loop;
end $$;

-- 2) Ideiglenes tábla az átadáshoz (RLS be, szabály nélkül: közvetlenül nem érhető el)
drop table if exists public.app_handoffs;
create table public.app_handoffs (
  code text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.app_handoffs enable row level security;
revoke all on public.app_handoffs from anon, authenticated;

-- 3) A Chrome-oldal ezzel adja át a tokent (a kód 48 hex karakter, véletlen)
create function public.put_handoff(p_code text, p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_code is null or p_code !~ '^[0-9a-f]{32,128}$' then
    raise exception 'bad code';
  end if;
  delete from public.app_handoffs where created_at < now() - interval '10 minutes';
  insert into public.app_handoffs(code, payload) values (p_code, p_payload)
  on conflict (code) do update set payload = excluded.payload, created_at = now();
end $$;

-- 4) Az APK ezt kérdezgeti: egyszer kiadja a tokent, utána törli (10 percig érvényes)
create function public.take_handoff(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v jsonb;
begin
  if p_code is null or p_code !~ '^[0-9a-f]{32,128}$' then
    return null;
  end if;
  delete from public.app_handoffs
  where code = p_code and created_at > now() - interval '10 minutes'
  returning payload into v;
  return v;
end $$;

revoke all on function public.put_handoff(text, jsonb) from public;
revoke all on function public.take_handoff(text) from public;
grant execute on function public.put_handoff(text, jsonb) to anon, authenticated;
grant execute on function public.take_handoff(text) to anon, authenticated;

notify pgrst, 'reload schema';
