## Közösségi funkció: célok

- Profilok egyedi felhasználónévvel (3–20 karakter, kisbetű, szám, aláhúzás).
- Követés: egy felhasználó követhet másokat, kölcsönös kérés nélkül.
- Barátkérés: külön `friend_requests` tábla, elfogadás és elutasítás.
- Instagram-szerű profil: fejléc avatarral, követők és követettek száma, aktivitás-lista. Az edzés megosztása opcionális, alapértelmezetten kikapcsolt.
- Aktivitás-feed: az általam követett felhasználók megosztott aktivitásai, időrendben.
- Jelentés és tiltás: a közösségi tartalmak jelenthetők és a felhasználók tiltathatók (a Play Store miatt kötelező). A jelentések a `reports` táblába kerülnek, RLS-szel. Egyelőre elég, ha SQL-ből kezelhetők.
- Alapértelmezett adatvédelem: a profil privát, amíg a felhasználó nem kapcsolja nyilvánosra.

## Kötelező szabályok

- Minden tábla RLS-szel védett. Egy idegen felhasználó csak azt láthatja, amit a profil láthatósága és a kapcsolatai engedik.
- A service role kulcs soha nem kerülhet a kliensbe.
- Minden írási művelethez rate limit (spam ellen).
- Supabase-változás kizárólag SQL-fájlban legyen (`supabase/social_*.sql`). Te nem futtatod, a felhasználó futtatja a Supabase SQL Editorban.
- Minden új magyar szöveghez angol fordítás kell a setDict-ben.
- Módosítás után `node --check`.
- Külön `feature/social` ágon dolgozz. A `main`-t ne módosítsd, push és merge csak kérésre.
- Valódi eszközön nem tudsz tesztelni, ezt jelezd, és írd le a kézi tesztlépéseket két fiókkal (egy követő és egy idegen).

## Lépések (mindegyik külön jóváhagyással)

1. Terv és adatmodell: táblák, kapcsolatok, RLS-szabályok, és egy jogosultsági táblázat (ki mit lát, ki mit módosíthat). Csak ezt írd meg, kódot még ne.
2. Profilok és felhasználónév: `supabase/social_1_profiles.sql`, és a profil-szerkesztő.
3. Követés és barátkérés: `supabase/social_2_follows.sql`, és a gombok.
4. Profil nézet és aktivitás-feed: a kliens csak az RLS által engedett adatot jelenítse meg.
5. Jelentés és tiltás: `supabase/social_3_moderation.sql`, és a gombok.
6. Tesztlista: a végigpróbálandó lépések, két fiókkal.

Az 1. lépés után állj meg, és kérdezz rá a döntésekre, amelyeket csak a felhasználó hozhat meg:
- A profil alapértelmezetten privát legyen-e (javasolt: igen).
- Az aktivitás-megosztás alapértelmezetten kikapcsolt legyen-e (javasolt: igen).
- Ki jelenthet tartalmat: bármelyik bejelentkezett felhasználó (javasolt), vagy csak a barátok.

Az 1. lépés jóváhagyása után indulhat a 2. lépés.
