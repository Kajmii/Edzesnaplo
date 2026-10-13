-- Edzésnapló: haladási fotók (privát tároló + megosztás)
-- Supabase -> SQL Editor -> illeszd be az egészet -> Run. Többször is lefuttatható.
-- ELŐFELTÉTEL: a social_1_profiles.sql, social_2_follows.sql és social_2b_activities.sql már lefutott (a láthatóság
-- ugyanazt a social_can_view() függvényt használja, mint az aktivitások).
--
-- Szabály (a jóváhagyott döntés szerint):
--   * Minden fotó alapból privát: csak a tulajdonos látja.
--   * A fotónál külön be lehet kapcsolni a megosztást. Megosztott fotót az láthat, aki a tulajdonos profilját láthatja:
--     privát profilnál csak a barátok, nyilvános profilnál bárki, akit a tulajdonos nem tiltott (social_can_view).
--   * Megosztást csak az kapcsolhat be, akinek van közösségi profilja. Profil törlésekor a fotók privátra váltanak.
--
-- Mit hoz létre:
--   storage bucket  progress-photos   privát, legfeljebb 1,5 MB / fájl, csak JPEG
--   public.progress_photos            a fotó adatai (dátum, megjegyzés, megosztva-e); a fájl: <user_id>/<id>.jpg és <user_id>/<id>_t.jpg (bélyegkép)
--   RLS a táblán és a storage.objects-en
--
-- A kliens csak az anon kulcsot és a belépett felhasználó tokenjét használja, service role nincs.

-- 1) Tároló (privát)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-photos', 'progress-photos', false, 1572864, array['image/jpeg'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) Tábla
create table if not exists public.progress_photos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  taken_on   date not null default current_date,
  note       text not null default '',
  shared     boolean not null default false,
  created_at timestamptz not null default now(),
  constraint progress_photos_note_len check (char_length(note) <= 200)
);
create index if not exists progress_photos_user_idx on public.progress_photos (user_id, taken_on desc);
alter table public.progress_photos enable row level security;
revoke all on public.progress_photos from anon;
grant select, insert, delete on public.progress_photos to authenticated;
grant update (taken_on, note, shared) on public.progress_photos to authenticated;

drop policy if exists progress_photos_select on public.progress_photos;
drop policy if exists progress_photos_insert on public.progress_photos;
drop policy if exists progress_photos_update on public.progress_photos;
drop policy if exists progress_photos_delete on public.progress_photos;
-- Olvasás: a sajátom, vagy a megosztott fotó, ha láthatom a tulajdonos profilját
create policy progress_photos_select on public.progress_photos for select to authenticated
  using (user_id = (select auth.uid()) or (shared and public.social_can_view(user_id)));
-- Feltöltés: csak a saját nevemben; megosztva csak akkor, ha van közösségi profilom
create policy progress_photos_insert on public.progress_photos for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (not shared or exists (select 1 from public.profiles p where p.user_id = (select auth.uid())))
  );
create policy progress_photos_update on public.progress_photos for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (not shared or exists (select 1 from public.profiles p where p.user_id = (select auth.uid())))
  );
create policy progress_photos_delete on public.progress_photos for delete to authenticated
  using (user_id = (select auth.uid()));

-- Védelem: napi 20 feltöltés, összesen legfeljebb 300 fotó, a dátum nem lehet a jövőben
create or replace function public.progress_photos_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.social_check_rate('photo', 20, interval '1 day');
    if (select count(*) from public.progress_photos where user_id = new.user_id) >= 300 then
      raise exception 'photo_limit' using errcode = 'P0001';
    end if;
  end if;
  new.taken_on := least(new.taken_on, current_date);
  new.note := left(btrim(new.note), 200);
  return new;
end $$;
revoke all on function public.progress_photos_guard() from public, anon, authenticated;
drop trigger if exists progress_photos_guard on public.progress_photos;
create trigger progress_photos_guard before insert or update on public.progress_photos
  for each row execute function public.progress_photos_guard();

-- Közösségi profil törlésekor a megosztott fotók privátra váltanak
create or replace function public.progress_photos_unshare()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.progress_photos set shared = false where user_id = old.user_id and shared;
  return old;
end $$;
revoke all on function public.progress_photos_unshare() from public, anon, authenticated;
drop trigger if exists progress_photos_unshare on public.profiles;
create trigger progress_photos_unshare after delete on public.profiles
  for each row execute function public.progress_photos_unshare();

-- 3) Tároló-jogosultságok. A fájl neve: <user_id>/<fotó id>.jpg (és _t.jpg a bélyegkép).
drop policy if exists progress_photos_obj_select on storage.objects;
drop policy if exists progress_photos_obj_insert on storage.objects;
drop policy if exists progress_photos_obj_delete on storage.objects;
create policy progress_photos_obj_select on storage.objects for select to authenticated
  using (
    bucket_id = 'progress-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1 from public.progress_photos p
        where p.shared
          and public.social_can_view(p.user_id)
          and name in (p.user_id::text || '/' || p.id::text || '.jpg', p.user_id::text || '/' || p.id::text || '_t.jpg')
      )
    )
  );
create policy progress_photos_obj_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy progress_photos_obj_delete on storage.objects for delete to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
