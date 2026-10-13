# Közösségi funkciók: kézi tesztlista két fiókkal

Valódi eszközön és éles Supabase-en kell végigpróbálni, ezt a kódból nem lehet kiváltani. Két fiók kell: **A** (a telefonod) és **B** (egy másik e-mail cím, pl. böngészőben vagy a barátodé). A tesztet külön böngészőprofilban vagy privát ablakban érdemes B-vel végezni.

## 0. Előkészület
Futtasd le a Supabase SQL Editorban, ebben a sorrendben (mind többször is futtatható):
1. `social_1_profiles.sql`
2. `social_2_follows.sql`
3. `social_2b_activities.sql`
4. `social_4_groups.sql`
5. `progress_photos.sql`
6. `social_3_moderation.sql`

Ha egy lépés hibát ír, állj meg, és küldd el a hibaüzenetet.

## 1. Profil
- [ ] A: Közösség → profil létrehozása (felhasználónév `teszt_a`, név, avatar). Elfogadod a szabályokat.
- [ ] A: tiltott név (pl. `kurva`) → hibaüzenet, nem menthető.
- [ ] B: ugyanígy `teszt_b`.
- [ ] A: a felhasználónév módosítása 30 napon belül → tiltja.

## 2. Követés és barátság
- [ ] A: Kapcsolatok → keresés `teszt_b` → Követés. B: a Követők közt megjelenik A.
- [ ] A: Barátkérés B-nek. B: a Barátkérések közt látja, Elfogad. Mindkettőnél a Barátok közt a másik.
- [ ] B: Elutasít egy új kérést → A 7 napig nem küldhet újat ("A kérésed elutasítva").
- [ ] Idegen (egy harmadik fiók vagy kijelentkezve nem érhető el): privát profilnál csak a nevet és az avatart látja.

## 3. Aktivitás és hírfolyam
- [ ] A: Profil → "Edzéseim megosztása" be. Fejezz be egy edzést. B hírfolyamában megjelenik (ha A nyilvános vagy barátok).
- [ ] A: privát profil, B nem barát → B nem látja az aktivitást. Barátság után látja.
- [ ] A: egy aktivitás törlése, majd az összes törlése → B-nél is eltűnik.

## 4. Csoportok és kihívások
- [ ] A: Csoportok → Új csoport (név `Reggeli`). Látszik a meghívó kód, csak A-nál.
- [ ] B: Csatlakozás kóddal → tag lesz. Rossz kód → "Nincs ilyen meghívó kód."
- [ ] B: nem látja a kódot, nem tud kihívást indítani.
- [ ] A: Új kihívás (Edzések száma, 1 hét). Mindketten fejezzetek be egy megosztott edzést → a ranglista mindkettőtöknél frissül (újratöltés után).
- [ ] B: "Edzéseim megosztása" ki → B értéke nem nő; a csoportban jön a figyelmeztetés a bekapcsoláshoz.
- [ ] A: Új kód → a régi kód már nem működik. A: B eltávolítása → B listájából eltűnik a csoport.
- [ ] B: kilépés a csoportból működik, A nem tud kilépni (csak törölni).

## 5. Haladási fotók
- [ ] A: Test és mérések → Fotók → Fotó hozzáadása (kamera vagy galéria). Mentés után a rácson megjelenik.
- [ ] A: két fotó kiválasztása → Összehasonlítás → egymás mellett látszik, a napok különbségével.
- [ ] B: A fotói nem látszanak (privát).
- [ ] A: egy fotó megosztása be → B az A profilján látja a Haladási fotók között (barátként, vagy ha A nyilvános).
- [ ] A: megosztás ki → B-nél eltűnik. Törlés → eltűnik.
- [ ] Megosztás profil nélkül nem kapcsolható be ("Megosztáshoz előbb hozz létre közösségi profilt.").

## 6. Jelentés és tiltás
- [ ] B: A egy aktivitását jelenti (ok: Spam) → a kártya azonnal eltűnik B-nél. Ugyanazt másodszor nem lehet jelenteni.
- [ ] B: A egy megosztott fotóját jelenti → eltűnik B-nél.
- [ ] B: A csoportját jelenti (tagként) → működik.
- [ ] Supabase SQL Editor: `select * from public.reports order by created_at desc;` → látszanak a jelentések. Lezárás: `update public.reports set status='reviewed' where id='...';`
- [ ] A: B profilján Tiltás → "Biztosan tiltod?" → tiltva.
  - [ ] A: B nem található a keresésben, B profilja "nem található".
  - [ ] B: A profilja "nem található", nem tud követni vagy barátkérést küldeni.
  - [ ] A korábbi követés és barátság megszűnt.
  - [ ] Ha közös csoportban voltak, a tiltott tag kikerült (a tiltó csoportjából), és nem látszik a ranglistán.
- [ ] A: Közösség → Profil → Tiltott felhasználók → Feloldás → B újra megtalálható.

## 7. Fiók törlése
- [ ] A: Beállítások → Fiók törlése. Utána B-nél A nem látszik, és a Supabase Storage-ban nincsenek A fotói (`progress-photos` tároló).

Ha valami nem a leírás szerint működik, írd le a lépés számát és mit láttál.
