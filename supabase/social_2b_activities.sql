-- Edzésnapló, közösségi funkció 4. lépés: aktivitások, profil nézet, feed
-- Supabase -> SQL Editor -> illeszd be az egészet -> Run. Többször is lefuttatható.
-- ELŐFELTÉTEL: előbb a social_1_profiles.sql, utána a social_2_follows.sql kell.
-- Sorrend: social_1_profiles -> social_2_follows -> social_2b_activities -> (később) social_3_moderation
-- Terv: docs/social-1-adatmodell.md
--
-- Mit hoz létre:
--   public.activities        megosztott aktivitás (egy befejezett edzés összefoglalója)
--   social_can_view(u)       láthatja-e a hívó u aktivitásait
--   social_profile(username) profil-fejléc számokkal (a számokat csak az látja, aki láthatja a profilt)
--   social_feed(limit,before) a követettek aktivitásai (az RLS szűri, nem a függvény)
--
-- A `user_data` (nyers edzésadat) érintetlen: csak egy szándékosan közzétett összefoglaló kerül ide.

-- 1) Ki láthatja u aktivitásait: saját magam, vagy (nincs tiltás ÉS (nyilvános profil VAGY barátok))
create or replace function public.social_can_view(u uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and (
    u = auth.uid()
    or (
      not public.social_is_blocked(auth.uid(), u)
      and (public.social_is_public(u) or public.social_is_friend(auth.uid(), u))
    )
  )
$$;
revoke all on function public.social_can_view(uuid) from public, anon;
grant execute on function public.social_can_view(uuid) to authenticated;

-- 2) Aktivitások
create table if not exists public.activities (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null default 'workout',
  title      text not null,
  summary    jsonb not null default '{}'::jsonb,
  workout_id text,
  created_at timestamptz not null default now(),
  constraint activities_kind check (kind in ('workout')),
  constraint activities_title_len check (char_length(btrim(title)) between 1 and 80),
  constraint activities_summary_obj check (jsonb_typeof(summary) = 'object' and pg_column_size(summary) <= 2048)
);
-- Ugyanazt az edzést nem lehet kétszer közzétenni (pl. újrapróbálkozásnál)
create unique index if not exists activities_workout_key on public.activities (user_id, workout_id) where workout_id is not null;
create index if not exists activities_user_time_idx on public.activities (user_id, created_at desc);
alter table public.activities enable row level security;
revoke all on public.activities from anon;
grant select, insert, delete on public.activities to authenticated;

drop policy if exists activities_select on public.activities;
drop policy if exists activities_insert on public.activities;
drop policy if exists activities_delete on public.activities;
-- Olvasás: a sajátom, vagy amit a profil láthatósága és a kapcsolataim engednek
create policy activities_select on public.activities for select to authenticated
  using (user_id = (select auth.uid()) or public.social_can_view(user_id));
-- Közzététel: csak a saját nevemben, és csak ha a megosztás be van kapcsolva
create policy activities_insert on public.activities for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profile_settings s
                where s.user_id = (select auth.uid()) and s.share_activity)
    and exists (select 1 from public.profiles p where p.user_id = (select auth.uid()))
  );
-- Törlés: csak a tulajdonos. Szerkesztés nincs.
create policy activities_delete on public.activities for delete to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.activities_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.social_check_rate('activity', 30, interval '1 day');
  -- az időpontot a kliens adhatja meg, de a jövőbe nem mutathat
  new.created_at := least(coalesce(new.created_at, now()), now());
  return new;
end $$;
revoke all on function public.activities_guard() from public, anon, authenticated;
drop trigger if exists activities_guard on public.activities;
create trigger activities_guard before insert on public.activities
  for each row execute function public.activities_guard();

-- 3) Profil-fejléc: a követő/követett/aktivitás számokat csak az kapja meg, aki láthatja a profilt.
--    Tiltás esetén (és ha nincs ilyen felhasználó) nem ad vissza sort, ez a kliensnek "nem található".
--    Rate limit: 120 lekérdezés / óra.
create or replace function public.social_profile(p_username text)
returns table (
  user_id uuid, username text, display_name text, avatar_color text, avatar_icon text,
  can_view boolean, followers bigint, following bigint, activities bigint
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  p public.profiles%rowtype;
  v boolean;
begin
  if me is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  perform public.social_check_rate('profile_view', 120, interval '1 hour');
  select * into p from public.profiles where profiles.username = lower(btrim(p_username));
  if not found then
    return;
  end if;
  if p.user_id <> me and public.social_is_blocked(me, p.user_id) then
    return;
  end if;
  v := public.social_can_view(p.user_id);
  return query select
    p.user_id, p.username, p.display_name, p.avatar_color, p.avatar_icon, v,
    case when v then (select count(*) from public.follows f where f.followee_id = p.user_id) end,
    case when v then (select count(*) from public.follows f where f.follower_id = p.user_id) end,
    case when v then (select count(*) from public.activities a where a.user_id = p.user_id) end;
end $$;
revoke all on function public.social_profile(text) from public, anon;
grant execute on function public.social_profile(text) to authenticated;

-- 4) Feed: az általam követettek aktivitásai, időrendben. SECURITY INVOKER: a hívó RLS-e érvényes,
--    vagyis csak azt kapom, amit az activities_select szabály engedne (nyilvános profil vagy barát).
create or replace function public.social_feed(p_limit int default 30, p_before timestamptz default null)
returns setof public.activities
language sql
stable
security invoker
set search_path = public
as $$
  select a.*
    from public.activities a
   where a.user_id in (select f.followee_id from public.follows f where f.follower_id = auth.uid())
     and (p_before is null or a.created_at < p_before)
   order by a.created_at desc
   limit least(greatest(coalesce(p_limit, 30), 1), 50)
$$;
revoke all on function public.social_feed(int, timestamptz) from public, anon;
grant execute on function public.social_feed(int, timestamptz) to authenticated;

-- 5) A profil törlésekor az aktivitások is törlődnek (a social_2_follows.sql függvényét bővítjük)
create or replace function public.profiles_cleanup_social()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.follows where follower_id = old.user_id or followee_id = old.user_id;
  delete from public.friend_requests where from_id = old.user_id or to_id = old.user_id;
  delete from public.activities where user_id = old.user_id;
  return old;
end $$;
revoke all on function public.profiles_cleanup_social() from public, anon, authenticated;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Ellenőrzés futtatás után (opcionális, csak olvas):
--   1) RLS be van kapcsolva? (true)
--      select relname, relrowsecurity from pg_class where relname = 'activities';
--   2) Szabályok (activities: 3 sor: select, insert, delete):
--      select policyname, cmd from pg_policies where tablename = 'activities' order by 1;
--   3) Az anon szerepkörnek nem lehet joga (nulla sort ad vissza):
--      select table_name, privilege_type from information_schema.role_table_grants
--       where grantee = 'anon' and table_name = 'activities';
-- ---------------------------------------------------------------------------
