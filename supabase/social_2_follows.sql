-- Edzésnapló, közösségi funkció 3. lépés: követés és barátkérés
-- Supabase -> SQL Editor -> illeszd be az egészet -> Run. Többször is lefuttatható.
-- ELŐFELTÉTEL: előbb a supabase/social_1_profiles.sql-t kell lefuttatni.
-- Terv: docs/social-1-adatmodell.md
--
-- Mit hoz létre:
--   public.follows           követés (azonnali, kölcsönös kérés nélkül)
--   public.friend_requests   barátkérés (pending / accepted / declined)
--   public.social_is_friend  segédfüggvény (a 4. lépés aktivitás-szabályai használják)
--   triggerek: rate limit, állapotváltás-védelem, kapcsolatok törlése profil törlésekor
--
-- Minden tábla RLS-sel védett, az anon szerepkörnek nincs joga.

-- 1) Követés
create table if not exists public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  followee_id uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint follows_not_self check (follower_id <> followee_id)
);
create index if not exists follows_followee_idx on public.follows (followee_id);
alter table public.follows enable row level security;
revoke all on public.follows from anon;
grant select, insert, delete on public.follows to authenticated;

drop policy if exists follows_select on public.follows;
drop policy if exists follows_insert on public.follows;
drop policy if exists follows_delete on public.follows;
-- Olvasás: csak a saját követéseim és a saját követőim
create policy follows_select on public.follows for select to authenticated
  using (follower_id = (select auth.uid()) or followee_id = (select auth.uid()));
-- Követni csak a saját nevemben lehet, tiltott felhasználót nem, és csak olyat, akinek van profilja
create policy follows_insert on public.follows for insert to authenticated
  with check (
    follower_id = (select auth.uid())
    and not public.social_is_blocked((select auth.uid()), followee_id)
    and exists (select 1 from public.profiles p where p.user_id = followee_id)
  );
-- Törölni a követő (kikövetés) és a követett (követő eltávolítása) is tud
create policy follows_delete on public.follows for delete to authenticated
  using (follower_id = (select auth.uid()) or followee_id = (select auth.uid()));

create or replace function public.follows_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.social_check_rate('follow', 60, interval '1 hour');
  new.created_at := now();
  return new;
end $$;
revoke all on function public.follows_guard() from public, anon, authenticated;
drop trigger if exists follows_guard on public.follows;
create trigger follows_guard before insert on public.follows
  for each row execute function public.follows_guard();

-- 2) Barátkérés
create table if not exists public.friend_requests (
  id           uuid primary key default gen_random_uuid(),
  from_id      uuid not null references auth.users (id) on delete cascade,
  to_id        uuid not null references auth.users (id) on delete cascade,
  status       text not null default 'pending',
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  constraint friend_requests_not_self check (from_id <> to_id),
  constraint friend_requests_status check (status in ('pending', 'accepted', 'declined'))
);
-- Két fél között egyszerre csak egy sor élhet, bármelyik irányból indult is
create unique index if not exists friend_requests_pair_key
  on public.friend_requests (least(from_id, to_id), greatest(from_id, to_id));
create index if not exists friend_requests_to_idx on public.friend_requests (to_id);
alter table public.friend_requests enable row level security;
revoke all on public.friend_requests from anon;
grant select, insert, update, delete on public.friend_requests to authenticated;

drop policy if exists friend_requests_select on public.friend_requests;
drop policy if exists friend_requests_insert on public.friend_requests;
drop policy if exists friend_requests_update on public.friend_requests;
drop policy if exists friend_requests_delete on public.friend_requests;
create policy friend_requests_select on public.friend_requests for select to authenticated
  using (from_id = (select auth.uid()) or to_id = (select auth.uid()));
create policy friend_requests_insert on public.friend_requests for insert to authenticated
  with check (
    from_id = (select auth.uid())
    and status = 'pending'
    and not public.social_is_blocked((select auth.uid()), to_id)
    and exists (select 1 from public.profiles p where p.user_id = to_id)
  );
-- Válaszolni csak a címzett tud, csak függő kérésre: elfogadás vagy elutasítás
create policy friend_requests_update on public.friend_requests for update to authenticated
  using (to_id = (select auth.uid()) and status = 'pending')
  with check (to_id = (select auth.uid()) and status in ('accepted', 'declined'));
-- Törlés:
--   a címzett bármikor (elutasított vagy elfogadott kapcsolat eltávolítása),
--   a feladó a függő kérését visszavonhatja, az elfogadott barátságot megszüntetheti,
--   az elutasított kérést a feladó csak 7 nap után törölheti (így küldhet újat)
create policy friend_requests_delete on public.friend_requests for delete to authenticated
  using (
    to_id = (select auth.uid())
    or (from_id = (select auth.uid()) and status in ('pending', 'accepted'))
    or (from_id = (select auth.uid()) and status = 'declined' and responded_at < now() - interval '7 days')
  );

create or replace function public.friend_requests_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.social_check_rate('friend_request', 20, interval '1 hour');
    new.status := 'pending';
    new.created_at := now();
    new.responded_at := null;
  else
    -- az RLS oszlopokat nem tud korlátozni, ezért itt őrizzük, hogy csak a státusz változhat
    if new.from_id is distinct from old.from_id or new.to_id is distinct from old.to_id
       or new.created_at is distinct from old.created_at or new.id is distinct from old.id then
      raise exception 'immutable_columns' using errcode = 'P0001';
    end if;
    new.responded_at := now();
  end if;
  return new;
end $$;
revoke all on function public.friend_requests_guard() from public, anon, authenticated;
drop trigger if exists friend_requests_guard on public.friend_requests;
create trigger friend_requests_guard before insert or update on public.friend_requests
  for each row execute function public.friend_requests_guard();

-- 3) Segédfüggvény: van-e elfogadott barátság a két felhasználó között
create or replace function public.social_is_friend(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friend_requests
     where status = 'accepted'
       and ((from_id = a and to_id = b) or (from_id = b and to_id = a))
  )
$$;
revoke all on function public.social_is_friend(uuid, uuid) from public, anon;
grant execute on function public.social_is_friend(uuid, uuid) to authenticated;

-- 4) A profil törlésekor a kapcsolatai is törlődnek (mindkét irányban)
create or replace function public.profiles_cleanup_social()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.follows where follower_id = old.user_id or followee_id = old.user_id;
  delete from public.friend_requests where from_id = old.user_id or to_id = old.user_id;
  return old;
end $$;
revoke all on function public.profiles_cleanup_social() from public, anon, authenticated;
drop trigger if exists profiles_cleanup_social on public.profiles;
create trigger profiles_cleanup_social after delete on public.profiles
  for each row execute function public.profiles_cleanup_social();

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Ellenőrzés futtatás után (opcionális, csak olvas):
--   1) Be van-e kapcsolva az RLS? (mindkét sor: true)
--      select relname, relrowsecurity from pg_class where relname in ('follows','friend_requests');
--   2) Szabályok (follows: 3, friend_requests: 4):
--      select tablename, policyname, cmd from pg_policies
--       where tablename in ('follows','friend_requests') order by 1, 2;
--   3) Az anon szerepkörnek nem lehet joga (nulla sort ad vissza):
--      select table_name, privilege_type from information_schema.role_table_grants
--       where grantee = 'anon' and table_name in ('follows','friend_requests');
-- ---------------------------------------------------------------------------
