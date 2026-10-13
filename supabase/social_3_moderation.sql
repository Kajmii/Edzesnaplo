-- Edzésnapló, közösségi funkció: jelentés és tiltás
-- Supabase -> SQL Editor -> illeszd be az egészet -> Run. Többször is lefuttatható.
-- ELŐFELTÉTEL: social_1_profiles, social_2_follows, social_2b_activities, social_4_groups és (ha használod) progress_photos.
-- Sorrend: social_1 -> social_2 -> social_2b -> social_4_groups -> progress_photos -> social_3_moderation
-- Terv: docs/social-1-adatmodell.md
--
-- Mit csinál:
--   public.blocks        tiltás (csak a tiltó látja és kezeli)
--   social_is_blocked    a valódi változat: igaz, ha a két fél közül bármelyik tiltotta a másikat. Ez cseréli az eddigi ideiglenes
--                        (mindig hamis) függvényt, ezért a profil, a követés, a barátkérés, az aktivitás, a fotó és a csoport
--                        szabályai ettől élnek: a tiltott fél számára a tiltó "nem található".
--   public.reports       jelentés (profil, aktivitás, fotó vagy csoport). A jelentő csak a sajátját látja; az ügyeket SQL-ből kezeled.
--   Tiltáskor törlődnek a két fél közti követések, barátkérések és a közös csoport-tagságok (a másik csoportjából).
--   A csoportok tag-listájából és ranglistájából eltűnnek a tiltott kapcsolatok.
--
-- Nincs automatikus rejtés és admin felület: a jelentések a lap alján lévő lekérdezésekkel kezelhetők.

-- 1) Tiltások
create table if not exists public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);
create index if not exists blocks_blocked_idx on public.blocks (blocked_id);
alter table public.blocks enable row level security;
revoke all on public.blocks from anon, authenticated;
grant select, insert, delete on public.blocks to authenticated;
drop policy if exists blocks_select on public.blocks;
drop policy if exists blocks_insert on public.blocks;
drop policy if exists blocks_delete on public.blocks;
create policy blocks_select on public.blocks for select to authenticated using (blocker_id = (select auth.uid()));
create policy blocks_insert on public.blocks for insert to authenticated with check (blocker_id = (select auth.uid()));
create policy blocks_delete on public.blocks for delete to authenticated using (blocker_id = (select auth.uid()));

-- 2) A valódi tiltás-ellenőrzés (a social_1_profiles.sql ideiglenes változatát cseréli)
create or replace function public.social_is_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
     where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  )
$$;
revoke all on function public.social_is_blocked(uuid, uuid) from public, anon;
grant execute on function public.social_is_blocked(uuid, uuid) to authenticated;

-- 3) Tiltáskor: korlát és takarítás (követések, barátkérések, közös csoport-tagság)
create or replace function public.blocks_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.social_check_rate('block', 30, interval '1 hour');
  end if;
  return new;
end $$;
revoke all on function public.blocks_guard() from public, anon, authenticated;
drop trigger if exists blocks_guard on public.blocks;
create trigger blocks_guard before insert on public.blocks
  for each row execute function public.blocks_guard();

create or replace function public.blocks_cleanup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.follows
   where (follower_id = new.blocker_id and followee_id = new.blocked_id)
      or (follower_id = new.blocked_id and followee_id = new.blocker_id);
  delete from public.friend_requests
   where (from_id = new.blocker_id and to_id = new.blocked_id)
      or (from_id = new.blocked_id and to_id = new.blocker_id);
  -- ki-ki csoportjából: a tulajdonos csoportjából a másik tag kikerül
  delete from public.social_group_members m
   using public.social_groups g
   where m.group_id = g.id
     and ((g.owner_id = new.blocker_id and m.user_id = new.blocked_id)
       or (g.owner_id = new.blocked_id and m.user_id = new.blocker_id));
  return new;
end $$;
revoke all on function public.blocks_cleanup() from public, anon, authenticated;
drop trigger if exists blocks_cleanup on public.blocks;
create trigger blocks_cleanup after insert on public.blocks
  for each row execute function public.blocks_cleanup();

-- A tiltott felhasználók listája a tiltónak (a profiljukat a tiltás miatt a normál lekérdezés már nem adja vissza)
create or replace function public.social_my_blocks()
returns table (user_id uuid, username text, display_name text, avatar_color text, avatar_icon text)
language sql
stable
security definer
set search_path = public
as $$
  select p.user_id, p.username, p.display_name, p.avatar_color, p.avatar_icon
    from public.blocks b join public.profiles p on p.user_id = b.blocked_id
   where b.blocker_id = auth.uid()
   order by b.created_at desc
$$;
revoke all on function public.social_my_blocks() from public, anon;
grant execute on function public.social_my_blocks() to authenticated;

-- 4) Jelentések
create table if not exists public.reports (
  id             uuid primary key default gen_random_uuid(),
  reporter_id    uuid not null references auth.users (id) on delete cascade,
  target_user_id uuid not null references auth.users (id) on delete cascade,
  target_type    text not null,
  target_id      uuid not null,   -- profilnál a felhasználó azonosítója, egyébként az aktivitás / fotó / csoport azonosítója
  reason         text not null,
  details        text not null default '',
  status         text not null default 'open',
  created_at     timestamptz not null default now(),
  constraint reports_type check (target_type in ('profile', 'activity', 'photo', 'group')),
  constraint reports_reason check (reason in ('spam', 'harassment', 'inappropriate', 'other')),
  constraint reports_status check (status in ('open', 'reviewed', 'actioned')),
  constraint reports_details_len check (char_length(details) <= 500),
  constraint reports_not_self check (reporter_id <> target_user_id)
);
-- ugyanazt a célt egy jelentő csak egyszer jelentheti
create unique index if not exists reports_once on public.reports (reporter_id, target_type, target_id);
create index if not exists reports_status_idx on public.reports (status, created_at desc);
alter table public.reports enable row level security;
revoke all on public.reports from anon, authenticated;
grant select, insert on public.reports to authenticated;
drop policy if exists reports_select on public.reports;
drop policy if exists reports_insert on public.reports;
create policy reports_select on public.reports for select to authenticated using (reporter_id = (select auth.uid()));
create policy reports_insert on public.reports for insert to authenticated with check (reporter_id = (select auth.uid()));

-- Csak olyat lehet jelenteni, amit a jelentő lát (a "nem látható" tartalom jelentése hibát ad)
create or replace function public.reports_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  ok boolean := false;
begin
  perform public.social_check_rate('report', 10, interval '1 hour');
  new.status := 'open';
  new.details := left(btrim(new.details), 500);
  if new.target_user_id = me or public.social_is_blocked(me, new.target_user_id) then
    raise exception 'report_target' using errcode = 'P0001';
  end if;
  if new.target_type = 'profile' then
    ok := new.target_id = new.target_user_id and exists (select 1 from public.profiles where user_id = new.target_user_id);
  elsif new.target_type = 'activity' then
    ok := exists (select 1 from public.activities a where a.id = new.target_id and a.user_id = new.target_user_id)
          and public.social_can_view(new.target_user_id);
  elsif new.target_type = 'photo' then
    ok := exists (select 1 from public.progress_photos p where p.id = new.target_id and p.user_id = new.target_user_id and p.shared)
          and public.social_can_view(new.target_user_id);
  elsif new.target_type = 'group' then
    ok := exists (select 1 from public.social_groups g where g.id = new.target_id and g.owner_id = new.target_user_id)
          and public.social_in_group(new.target_id, me);
  end if;
  if not ok then
    raise exception 'report_target' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke all on function public.reports_guard() from public, anon, authenticated;
drop trigger if exists reports_guard on public.reports;
create trigger reports_guard before insert on public.reports
  for each row execute function public.reports_guard();

-- 5) Csoportok: a tiltott kapcsolat ne látszódjon a tag-listában és a ranglistán
drop policy if exists social_group_members_select on public.social_group_members;
create policy social_group_members_select on public.social_group_members for select to authenticated
  using (public.social_in_group(group_id, (select auth.uid())) and not public.social_is_blocked((select auth.uid()), user_id));

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
       and not public.social_is_blocked(auth.uid(), m.user_id)
     group by m.user_id;
end $$;
revoke all on function public.social_challenge_board(uuid) from public, anon;
grant execute on function public.social_challenge_board(uuid) to authenticated;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Jelentések kezelése (a Supabase SQL Editor megkerüli az RLS-t):
--   Nyitott jelentések, legrégebbi elöl:
--     select r.id, r.created_at, r.target_type, r.reason, r.details, r.target_user_id, p.username, r.target_id
--       from public.reports r left join public.profiles p on p.user_id = r.target_user_id
--      where r.status = 'open' order by r.created_at;
--   Ügy lezárása (reviewed = megnéztem, actioned = intézkedtem):
--     update public.reports set status = 'reviewed' where id = '...';
--   Aktivitás / fotó eltávolítása:
--     delete from public.activities where id = '...';
--     update public.progress_photos set shared = false where id = '...';
--   Felhasználó szabályt sértő profiljának törlése (a közösségi adatai is törlődnek):
--     delete from public.profiles where user_id = '...';
--   Ellenőrzés futtatás után (csak olvas):
--     select relname, relrowsecurity from pg_class where relname in ('blocks', 'reports');   -- true, true
--     select table_name, privilege_type from information_schema.role_table_grants
--      where grantee = 'anon' and table_name in ('blocks', 'reports');                       -- nulla sor
-- ---------------------------------------------------------------------------
