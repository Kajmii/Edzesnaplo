-- Edzésnapló, közösségi funkció: csoportok és heti kihívások
-- Supabase -> SQL Editor -> illeszd be az egészet -> Run. Többször is lefuttatható.
-- ELŐFELTÉTEL: social_1_profiles.sql, social_2_follows.sql, social_2b_activities.sql (ebben a sorrendben).
-- Sorrend: social_1 -> social_2 -> social_2b -> social_4_groups -> (később) social_3_moderation
--
-- Szabályok:
--   * Csoportot csak meghívó kóddal lehet elérni. A kódot csak a tulajdonos látja (RPC), a tagok nem.
--   * Legfeljebb 30 tag / csoport, legfeljebb 10 csoport / felhasználó, legfeljebb 5 saját csoport.
--   * A tulajdonos eltávolíthat tagot és törölheti a csoportot; a tag bármikor kiléphet. A tulajdonos nem léphet ki, csak törölhet.
--   * Kihívás: a csoport tulajdonosa hozza létre (edzések száma, összes súly vagy sorozatok), legfeljebb 3 futó egyszerre, legfeljebb 31 nap.
--   * A ranglistán csak a MEGOSZTOTT edzések (public.activities) számítanak, és csak az összesítés látszik (nem a címek vagy gyakorlatok).
--     A csoport tagjai így a profil láthatóságától függetlenül egymás összesítő számát látják, de semmi mást.
--   * A név ugyanazt a trágárság-szűrőt kapja (social_name_ok), mint a profilnevek.
--   * A profil törlésekor a tagságok és a saját csoportok is törlődnek.

-- 1) Segédfüggvények (security definer, hogy az RLS ne hivatkozzon önmagára)
create or replace function public.social_in_group(g uuid, u uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.social_group_members where group_id = g and user_id = u) $$;
revoke all on function public.social_in_group(uuid, uuid) from public, anon;
grant execute on function public.social_in_group(uuid, uuid) to authenticated;

create or replace function public.social_is_group_owner(g uuid, u uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.social_groups where id = g and owner_id = u) $$;
revoke all on function public.social_is_group_owner(uuid, uuid) from public, anon;
grant execute on function public.social_is_group_owner(uuid, uuid) to authenticated;

-- 2) Táblák
create table if not exists public.social_groups (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  invite_code text not null unique,
  created_at  timestamptz not null default now(),
  constraint social_groups_name_len check (char_length(btrim(name)) between 3 and 40)
);
create table if not exists public.social_group_members (
  group_id  uuid not null references public.social_groups (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists social_group_members_user_idx on public.social_group_members (user_id);
create table if not exists public.social_challenges (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.social_groups (id) on delete cascade,
  title      text not null default '',
  kind       text not null,
  starts_on  date not null,
  ends_on    date not null,
  created_at timestamptz not null default now(),
  constraint social_challenges_kind check (kind in ('workouts', 'volume', 'sets')),
  constraint social_challenges_span check (ends_on >= starts_on and ends_on - starts_on <= 31),
  constraint social_challenges_title_len check (char_length(title) <= 60)
);
create index if not exists social_challenges_group_idx on public.social_challenges (group_id, ends_on desc);

alter table public.social_groups enable row level security;
alter table public.social_group_members enable row level security;
alter table public.social_challenges enable row level security;
revoke all on public.social_groups, public.social_group_members, public.social_challenges from anon, authenticated;
-- a meghívó kód oszlop NINCS megadva: azt csak az RPC adja a tulajdonosnak
grant select (id, owner_id, name, created_at) on public.social_groups to authenticated;
grant delete on public.social_groups to authenticated;
grant select, delete on public.social_group_members to authenticated;
grant select, insert, delete on public.social_challenges to authenticated;

drop policy if exists social_groups_select on public.social_groups;
drop policy if exists social_groups_delete on public.social_groups;
create policy social_groups_select on public.social_groups for select to authenticated
  using (public.social_in_group(id, (select auth.uid())));
create policy social_groups_delete on public.social_groups for delete to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists social_group_members_select on public.social_group_members;
drop policy if exists social_group_members_delete on public.social_group_members;
create policy social_group_members_select on public.social_group_members for select to authenticated
  using (public.social_in_group(group_id, (select auth.uid())));
-- kilépés (kivéve a tulajdonos) vagy a tulajdonos eltávolít valakit
create policy social_group_members_delete on public.social_group_members for delete to authenticated
  using (
    (user_id = (select auth.uid()) and not public.social_is_group_owner(group_id, user_id))
    or (public.social_is_group_owner(group_id, (select auth.uid())) and user_id <> (select auth.uid()))
  );

drop policy if exists social_challenges_select on public.social_challenges;
drop policy if exists social_challenges_insert on public.social_challenges;
drop policy if exists social_challenges_delete on public.social_challenges;
create policy social_challenges_select on public.social_challenges for select to authenticated
  using (public.social_in_group(group_id, (select auth.uid())));
create policy social_challenges_insert on public.social_challenges for insert to authenticated
  with check (public.social_is_group_owner(group_id, (select auth.uid())));
create policy social_challenges_delete on public.social_challenges for delete to authenticated
  using (public.social_is_group_owner(group_id, (select auth.uid())));

-- Kihívás-védelem: legfeljebb 3 futó egyszerre, a kezdés nem lehet régebbi tegnapnál, a cím szóközmentes
create or replace function public.social_challenges_guard()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.starts_on < current_date - 1 then
    raise exception 'challenge_date' using errcode = 'P0001';
  end if;
  if (select count(*) from public.social_challenges where group_id = new.group_id and ends_on >= current_date) >= 3 then
    raise exception 'challenge_limit' using errcode = 'P0001';
  end if;
  perform public.social_check_rate('challenge', 20, interval '1 day');
  new.title := left(btrim(new.title), 60);
  return new;
end $$;
revoke all on function public.social_challenges_guard() from public, anon, authenticated;
drop trigger if exists social_challenges_guard on public.social_challenges;
create trigger social_challenges_guard before insert on public.social_challenges
  for each row execute function public.social_challenges_guard();

-- 3) Csoport létrehozása: név-ellenőrzés, korlátok, kód. Visszaadja a sort a kóddal (csak a tulajdonos kapja).
create or replace function public.social_create_group(p_name text)
returns table (id uuid, name text, invite_code text, created_at timestamptz)
language plpgsql volatile security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  n text := btrim(coalesce(p_name, ''));
  g public.social_groups%rowtype;
  code text;
  tries int := 0;
begin
  if me is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from public.profiles where user_id = me) then raise exception 'no_profile' using errcode = 'P0001'; end if;
  if char_length(n) < 3 or char_length(n) > 40 then raise exception 'name_invalid' using errcode = 'P0001'; end if;
  if not public.social_name_ok(n) then raise exception 'name_blocked' using errcode = 'P0001'; end if;
  perform public.social_check_rate('group_create', 10, interval '1 day');
  if (select count(*) from public.social_groups where owner_id = me) >= 5 then raise exception 'group_limit' using errcode = 'P0001'; end if;
  if (select count(*) from public.social_group_members where user_id = me) >= 10 then raise exception 'group_limit' using errcode = 'P0001'; end if;
  loop
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    begin
      insert into public.social_groups (owner_id, name, invite_code) values (me, n, code) returning * into g;
      exit;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 5 then raise; end if;
    end;
  end loop;
  insert into public.social_group_members (group_id, user_id) values (g.id, me);
  return query select g.id, g.name, g.invite_code, g.created_at;
end $$;
revoke all on function public.social_create_group(text) from public, anon;
grant execute on function public.social_create_group(text) to authenticated;

-- 4) Csatlakozás kóddal (óránként legfeljebb 20 próba: a kód nem találgatható)
create or replace function public.social_join_group(p_code text)
returns uuid
language plpgsql volatile security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  g public.social_groups%rowtype;
begin
  if me is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform public.social_check_rate('group_join', 20, interval '1 hour');
  if not exists (select 1 from public.profiles where user_id = me) then raise exception 'no_profile' using errcode = 'P0001'; end if;
  select * into g from public.social_groups where invite_code = upper(btrim(coalesce(p_code, '')));
  if not found or public.social_is_blocked(g.owner_id, me) or public.social_is_blocked(me, g.owner_id) then
    raise exception 'group_not_found' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.social_group_members where group_id = g.id and user_id = me) then return g.id; end if;
  if (select count(*) from public.social_group_members where group_id = g.id) >= 30 then raise exception 'group_full' using errcode = 'P0001'; end if;
  if (select count(*) from public.social_group_members where user_id = me) >= 10 then raise exception 'group_limit' using errcode = 'P0001'; end if;
  insert into public.social_group_members (group_id, user_id) values (g.id, me);
  return g.id;
end $$;
revoke all on function public.social_join_group(text) from public, anon;
grant execute on function public.social_join_group(text) to authenticated;

-- 5) A tulajdonos lekérdezheti a meghívó kódot, és újat kérhet (a régi érvényét veszti)
create or replace function public.social_group_code(p_group uuid)
returns text language sql stable security definer set search_path = public
as $$ select invite_code from public.social_groups where id = p_group and owner_id = auth.uid() $$;
revoke all on function public.social_group_code(uuid) from public, anon;
grant execute on function public.social_group_code(uuid) to authenticated;

create or replace function public.social_regen_code(p_group uuid)
returns text
language plpgsql volatile security definer set search_path = public
as $$
declare code text; tries int := 0;
begin
  if not public.social_is_group_owner(p_group, auth.uid()) then raise exception 'forbidden' using errcode = '42501'; end if;
  perform public.social_check_rate('group_code', 10, interval '1 day');
  loop
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    begin
      update public.social_groups set invite_code = code where id = p_group;
      return code;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 5 then raise; end if;
    end;
  end loop;
end $$;
revoke all on function public.social_regen_code(uuid) from public, anon;
grant execute on function public.social_regen_code(uuid) to authenticated;

-- 6) Ranglista: csak a csoport tagjai kérhetik; a tagok megosztott edzéseinek összesítése a kihívás napjaira.
--    Az időhatár UTC napok (a created_at időbélyeg alapján).
create or replace function public.social_challenge_board(p_challenge uuid)
returns table (user_id uuid, workouts bigint, sets bigint, volume bigint)
language plpgsql volatile security definer set search_path = public
as $$
declare c public.social_challenges%rowtype;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into c from public.social_challenges where id = p_challenge;
  if not found or not public.social_in_group(c.group_id, auth.uid()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  perform public.social_check_rate('challenge_board', 240, interval '1 hour');
  return query
    select m.user_id,
           count(a.id)::bigint,
           coalesce(sum(case when (a.summary ->> 'sets') ~ '^[0-9]{1,6}$' then (a.summary ->> 'sets')::bigint end), 0)::bigint,
           coalesce(sum(case when (a.summary ->> 'volume') ~ '^[0-9]{1,9}$' then (a.summary ->> 'volume')::bigint end), 0)::bigint
      from public.social_group_members m
      left join public.activities a
        on a.user_id = m.user_id and a.kind = 'workout'
       and a.created_at >= c.starts_on::timestamptz
       and a.created_at < (c.ends_on + 1)::timestamptz
     where m.group_id = c.group_id
     group by m.user_id;
end $$;
revoke all on function public.social_challenge_board(uuid) from public, anon;
grant execute on function public.social_challenge_board(uuid) to authenticated;

-- 7) A közösségi profil törlésekor a tagságok és a saját csoportok is törlődnek
create or replace function public.social_groups_cleanup()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  delete from public.social_groups where owner_id = old.user_id;
  delete from public.social_group_members where user_id = old.user_id;
  return old;
end $$;
revoke all on function public.social_groups_cleanup() from public, anon, authenticated;
drop trigger if exists social_groups_cleanup on public.profiles;
create trigger social_groups_cleanup after delete on public.profiles
  for each row execute function public.social_groups_cleanup();

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Ellenőrzés futtatás után (opcionális, csak olvas):
--   1) RLS be van kapcsolva mindhárom táblán? (true, true, true)
--      select relname, relrowsecurity from pg_class
--       where relname in ('social_groups', 'social_group_members', 'social_challenges');
--   2) Az anon szerepkörnek nincs joga (nulla sort ad vissza):
--      select table_name, privilege_type from information_schema.role_table_grants
--       where grantee = 'anon' and table_name like 'social_group%';
--   3) A meghívó kód oszlop nem olvasható közvetlenül (nulla sor):
--      select column_name from information_schema.column_privileges
--       where grantee = 'authenticated' and table_name = 'social_groups' and column_name = 'invite_code';
-- ---------------------------------------------------------------------------
