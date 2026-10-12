-- Edzésnapló, közösségi funkció 1. lépés: profilok és felhasználónév
-- Supabase -> SQL Editor -> illeszd be az egészet -> Run. Többször is lefuttatható.
-- Terv: docs/social-1-adatmodell.md
--
-- Mit hoz létre:
--   public.social_rate_log      belső rate-limit napló (a kliens nem éri el)
--   public.profiles             azonosító: felhasználónév, név, avatar
--   public.profile_settings     privát beállítások (nyilvános-e a profil, megosztás, feltételek)
--   függvények: social_check_rate, social_is_blocked (ideiglenes), social_is_public
--   triggerek: rate limit, updated_at, felhasználónév-váltás korlátja
--
-- Minden tábla RLS-sel védett, az anon szerepkörnek nincs joga. A service role kulcs
-- sehol nem szerepel, és nem is kell hozzá.

-- 1) Rate-limit napló: RLS be, szabály nélkül, így közvetlenül senki nem éri el
create table if not exists public.social_rate_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  action  text not null,
  at      timestamptz not null default now()
);
create index if not exists social_rate_log_idx on public.social_rate_log (user_id, action, at);
alter table public.social_rate_log enable row level security;
revoke all on public.social_rate_log from anon, authenticated;

-- 2) Rate limit: a hívó (auth.uid()) legfeljebb p_max műveletet végezhet p_window alatt
create or replace function public.social_check_rate(p_action text, p_max int, p_window interval)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n int;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  -- alkalmankénti takarítás: a 2 napnál régebbi sorokra nincs szükség
  if random() < 0.02 then
    delete from public.social_rate_log where at < now() - interval '2 days';
  end if;
  select count(*) into n from public.social_rate_log
   where user_id = uid and action = p_action and at > now() - p_window;
  if n >= p_max then
    raise exception 'rate_limit' using errcode = 'P0001', hint = p_action;
  end if;
  insert into public.social_rate_log (user_id, action) values (uid, p_action);
end $$;
revoke all on function public.social_check_rate(text, int, interval) from public, anon, authenticated;

-- 3) Tiltás-ellenőrzés. Ideiglenes változat: a tiltás-tábla a 3. lépésben (social_3_moderation.sql)
--    készül el, az `create or replace`-szel lecseréli ezt a függvényt.
create or replace function public.social_is_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select false $$;
revoke all on function public.social_is_blocked(uuid, uuid) from public, anon;
grant execute on function public.social_is_blocked(uuid, uuid) to authenticated;

-- 4) Privát beállítások: alapból privát profil, megosztás kikapcsolva
create table if not exists public.profile_settings (
  user_id           uuid primary key references auth.users (id) on delete cascade,
  is_public         boolean not null default false,
  share_activity    boolean not null default false,
  terms_accepted_at timestamptz,
  updated_at        timestamptz not null default now()
);
alter table public.profile_settings enable row level security;
revoke all on public.profile_settings from anon;
grant select, insert, update, delete on public.profile_settings to authenticated;

drop policy if exists profile_settings_select on public.profile_settings;
drop policy if exists profile_settings_insert on public.profile_settings;
drop policy if exists profile_settings_update on public.profile_settings;
drop policy if exists profile_settings_delete on public.profile_settings;
create policy profile_settings_select on public.profile_settings for select to authenticated
  using (user_id = (select auth.uid()));
create policy profile_settings_insert on public.profile_settings for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy profile_settings_update on public.profile_settings for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy profile_settings_delete on public.profile_settings for delete to authenticated
  using (user_id = (select auth.uid()));

-- Mások beállításait nem olvashatjuk, csak ezen a függvényen át azt, hogy nyilvános-e a profil.
-- Ha nincs beállítás-sor, a profil privát.
create or replace function public.social_is_public(u uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select coalesce((select is_public from public.profile_settings where user_id = u), false) $$;
revoke all on function public.social_is_public(uuid) from public, anon;
grant execute on function public.social_is_public(uuid) to authenticated;

-- 4b) Trágár, sértő vagy diszkriminatív név kiszűrése (felhasználónév és megjelenített név).
--     Normalizálás: kisbetű, ékezetek le, számok/jelek betűnek olvasva (0=o 1=i 3=e 4=a 5=s 7=t 8=b @=a $=s !=i),
--     nem betű karakterek kihagyva, ismétlődő betűk egyre vonva. A szavak listája nem teljes, a kliens (js/social.js)
--     ugyanezt a listát használja, az eltérést a tests/social.check.js jelzi.
create or replace function public.social_name_ok(p text)
returns boolean
language plpgsql
immutable
set search_path = public
as $fn$
declare
  strong text[] := array['kurva','picsa','fasz','geci','buzeran','szopd','baszd','baszki','baszod','baszott','kibasz','bazdmeg','bazmeg','anyadat','rohadek','ribanc','szarhazi','neger','nyomorek','fuck','bitch','whore','nigger','nigga','faggot','retard','pedophile','paedophile','pedofil','asshole','dickhead','cocksucker','bullshit','shithead','dipshit','wanker','bastard','pussy','dildo','blowjob','handjob','rapist','porn','tranny','wetback','killyourself','hitler','neonazi','heilhitler','siegheil','swastika','auschwitz'];
  exact text[] := array['szar','basz','pina','anyad','kocsog','csicska','buzi','mongol','debil','homo','shit','dick','cock','cunt','cunts','slut','sluts','pedo','rape','raped','ass','arse','twat','tits','cum','penis','vagina','jizz','boner','milf','xxx','anal','nazi','kkk','kys','chink','paki','spic','kike','dyke','coon','gook','beaner','negro','fag','fags'];
  n text; cs text; toks text[]; w text; c text; t text;
begin
  n := translate(lower(coalesce(p, '')), 'áàâäãåéèêëíìîïóòôöőõúùûüűñç0134578@$!', 'aaaaaaeeeeiiiioooooouuuuuncoieastbasi');
  cs := regexp_replace(regexp_replace(n, '[^a-z]', '', 'g'), '(.)\1+', '\1', 'g');
  toks := regexp_split_to_array(n, '[^a-z]+');
  if regexp_replace(coalesce(p, ''), '\D', '', 'g') like '%1488%' then
    return false;
  end if;
  foreach w in array strong loop
    if position(regexp_replace(w, '(.)\1+', '\1', 'g') in cs) > 0 then
      return false;
    end if;
  end loop;
  foreach w in array exact loop
    c := regexp_replace(w, '(.)\1+', '\1', 'g');
    if cs = c then
      return false;
    end if;
    foreach t in array toks loop
      if regexp_replace(t, '(.)\1+', '\1', 'g') = c then
        return false;
      end if;
    end loop;
  end loop;
  return true;
end $fn$;
revoke all on function public.social_name_ok(text) from public, anon;
grant execute on function public.social_name_ok(text) to authenticated;

-- 5) Profilok: mindenki számára kereshető azonosító-adatok
create table if not exists public.profiles (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  username            text not null,
  display_name        text not null,
  avatar_color        text not null default 'lime',
  avatar_icon         text not null default 'initial',
  username_changed_at timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  constraint profiles_username_reserved check (username <> all (array[
    'admin','administrator','support','help','moderator','mod','root','system',
    'edzesnaplo','official','staff','null','undefined','anonymous','deleted'])),
  constraint profiles_display_name_len check (char_length(btrim(display_name)) between 1 and 40),
  constraint profiles_avatar_color check (avatar_color in ('lime','cyan','violet','orange','pink','red')),
  constraint profiles_avatar_icon check (avatar_icon in ('initial','dumbbell','flame','timer','apple','chart','user'))
);
create unique index if not exists profiles_username_key on public.profiles (username);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, insert, update, delete on public.profiles to authenticated;

drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists profiles_delete on public.profiles;
-- Olvasás: a saját sor, vagy bárki, akivel nincs tiltás
create policy profiles_select on public.profiles for select to authenticated
  using (user_id = (select auth.uid())
         or not public.social_is_blocked((select auth.uid()), user_id));
-- Profil csak akkor jöhet létre, ha a felhasználó előbb elfogadta a feltételeket
create policy profiles_insert on public.profiles for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profile_settings s
                where s.user_id = (select auth.uid()) and s.terms_accepted_at is not null)
  );
create policy profiles_update on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy profiles_delete on public.profiles for delete to authenticated
  using (user_id = (select auth.uid()));

-- 6) Triggerek (security definer: így a rate limit függvényt a kliens közvetlenül nem hívhatja)
create or replace function public.profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.username is distinct from old.username or new.display_name is distinct from old.display_name then
    if not public.social_name_ok(new.username) or not public.social_name_ok(new.display_name) then
      raise exception 'name_blocked' using errcode = 'P0001';
    end if;
  end if;
  if tg_op = 'INSERT' then
    perform public.social_check_rate('profile_write', 10, interval '1 hour');
    new.username_changed_at := null;
    new.created_at := now();
  else
    if new.username is distinct from old.username then
      if old.username_changed_at is not null and old.username_changed_at > now() - interval '30 days' then
        raise exception 'username_cooldown' using errcode = 'P0001';
      end if;
      perform public.social_check_rate('username_change', 3, interval '1 day');
      new.username_changed_at := now();
    else
      new.username_changed_at := old.username_changed_at;
    end if;
    new.created_at := old.created_at;
    perform public.social_check_rate('profile_write', 10, interval '1 hour');
  end if;
  new.updated_at := now();
  return new;
end $$;
revoke all on function public.profiles_guard() from public, anon, authenticated;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before insert or update on public.profiles
  for each row execute function public.profiles_guard();

create or replace function public.profile_settings_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.social_check_rate('profile_write', 10, interval '1 hour');
  new.updated_at := now();
  -- a feltételek elfogadásának idejét a szerver állítja, a kliens nem hamisíthatja
  if tg_op = 'INSERT' then
    if new.terms_accepted_at is not null then new.terms_accepted_at := now(); end if;
  else
    new.terms_accepted_at := old.terms_accepted_at;
  end if;
  return new;
end $$;
revoke all on function public.profile_settings_guard() from public, anon, authenticated;
drop trigger if exists profile_settings_guard on public.profile_settings;
create trigger profile_settings_guard before insert or update on public.profile_settings
  for each row execute function public.profile_settings_guard();

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Ellenőrzés futtatás után (opcionális, csak olvas):
--   1) Minden közösségi táblán be van-e kapcsolva az RLS? (mindhárom sor: true)
--      select relname, relrowsecurity from pg_class
--       where relname in ('profiles','profile_settings','social_rate_log');
--   2) Milyen szabályok vannak? (profiles: 4, profile_settings: 4, social_rate_log: 0)
--      select tablename, policyname, cmd from pg_policies
--       where tablename in ('profiles','profile_settings','social_rate_log') order by 1, 2;
--   3) Az anon szerepkörnek nem lehet joga a táblákhoz (nulla sort ad vissza):
--      select table_name, privilege_type from information_schema.role_table_grants
--       where grantee = 'anon' and table_name in ('profiles','profile_settings','social_rate_log');
-- ---------------------------------------------------------------------------
