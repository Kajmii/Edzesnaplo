# Közösségi funkció: 1. lépés, terv és adatmodell

Állapot: **jóváhagyásra vár**. Ez csak terv, kód és SQL még nincs. A jóváhagyás után a 2. lépés (`supabase/social_1_profiles.sql` és a profil-szerkesztő) következik.

## Alapelvek

- **Közösségi adat külön táblákban van.** A `user_data` (edzések, étel, terv, mérések, ciklus) nem érintett, az továbbra is privát. A közösségi felület egy edzésről csak egy szándékosan közzétett összefoglalót (`activities`) mutat, a nyers adatot soha.
- **Mindent az RLS véd.** Minden közösségi táblán be van kapcsolva az RLS, és `anon` szerepkörnek nincs joga. A kliens csak az anon kulcsot és a felhasználó saját tokenjét használja, a service role kulcs nem kerül a kliensbe.
- **Alapból zárt.** Új profil privát, az aktivitás-megosztás ki van kapcsolva.
- **A jogosultsági logika az adatbázisban él, nem a kliensben.** Az RLS-szabályok néhány kis segédfüggvényt hívnak (`SECURITY DEFINER`, rögzített `search_path`, csak `authenticated` hívhatja).
- **Az állapotváltások szabályait az adatbázis őrzi.** Például a barátkérést csak a címzett fogadhatja el, a tiltás megszünteti a kapcsolatokat. Ezt függvények és triggerek biztosítják, mert az RLS oszlopokat nem tud korlátozni.

## Táblák

Minden tábla `user_id`-jai az `auth.users(id)`-re mutatnak `on delete cascade` szabállyal, így egy fiók törlésekor a közösségi adat is eltűnik. A fióktörlés meglévő RPC-jét (`delete_my_account`) nem látjuk a repóban, ezért a kliens biztonságból előbb a saját közösségi sorait is törli.

### `profiles` (azonosító, mindenki számára kereshető)
| Oszlop | Típus / szabály |
|---|---|
| `user_id` | uuid, elsődleges kulcs |
| `username` | text, egyedi, `^[a-z0-9_]{3,20}$`, foglalt nevek tiltva (`admin`, `support` stb.) |
| `display_name` | text, legfeljebb 40 karakter |
| `avatar_color`, `avatar_icon` | előre megadott lista elemei (nincs képfeltöltés, lásd a döntéseket) |
| `created_at`, `updated_at` | timestamptz |

Csak ez látszik egy privát profilból idegeneknek: felhasználónév, megjelenített név, avatar. Bio nincs az első változatban.

### `profile_settings` (csak a tulajdonos látja)
| Oszlop | Típus / szabály |
|---|---|
| `user_id` | uuid, elsődleges kulcs |
| `is_public` | boolean, **alapból false** |
| `share_activity` | boolean, **alapból false** |
| `terms_accepted_at` | timestamptz (a Play Store UGC-szabályai miatt a felhasználási feltételek elfogadása kell) |

Más felhasználó ezt a táblát nem olvashatja. A nyilvánosság állapotát csak a segédfüggvényeken keresztül, igen/nem válaszként lehet lekérdezni.

### `follows` (követés, kölcsönös kérés nélkül)
`follower_id`, `followee_id`, `created_at`. Elsődleges kulcs: (`follower_id`, `followee_id`). Nem követheted önmagad. Egy követés mindig azonnal él, nincs jóváhagyás.

### `friend_requests` (barátkérés)
| Oszlop | Szabály |
|---|---|
| `id` | uuid |
| `from_id`, `to_id` | nem lehetnek azonosak |
| `status` | `pending`, `accepted`, `declined` |
| `created_at`, `responded_at` | timestamptz |

Egy két fél közötti kapcsolat egyszerre csak egy sorban élhet: egyedi index a (`least(from_id,to_id)`, `greatest(from_id,to_id)`) párra. Az `accepted` sor jelenti a barátságot, nincs külön barát-tábla. Elutasítás után a feladó 7 napig nem küldhet újat.

### `activities` (közzétett aktivitás)
| Oszlop | Szabály |
|---|---|
| `id` | uuid |
| `user_id` | a tulajdonos |
| `kind` | első változatban csak `workout` |
| `title` | legfeljebb 80 karakter (az edzés neve) |
| `summary` | jsonb, legfeljebb 2 KB: gyakorlatok és sorozatok száma, térfogat, rekordok száma |
| `created_at` | az edzés időpontja |

Csak akkor jön létre, ha a felhasználónál a `share_activity` be van kapcsolva. A tulajdonos bármelyik aktivitását törölheti, és van „összes aktivitás törlése" is. Szerkeszteni nem lehet.

### `blocks` (tiltás)
`blocker_id`, `blocked_id`, `created_at`. Csak a tiltó látja és kezeli. A tiltott fél nem tudja meg, hogy tiltották: számára a felhasználó egyszerűen „nem található".

### `reports` (jelentés)
| Oszlop | Szabály |
|---|---|
| `id` | uuid |
| `reporter_id` | a jelentő |
| `target_user_id` | a jelentett felhasználó |
| `target_type` | `profile` vagy `activity` |
| `target_id` | az aktivitás azonosítója (profilnál üres) |
| `reason` | `spam`, `harassment`, `inappropriate`, `other` |
| `details` | legfeljebb 500 karakter |
| `status` | `open` (alap), `reviewed`, `actioned` |
| `created_at` | timestamptz |

Egy jelentő ugyanazt a célt csak egyszer jelentheti. Az ügyeket egyelőre SQL-ből kezeljük (a Supabase SQL Editor megkerüli az RLS-t).

### `social_rate_log` (belső, a kliens nem éri el)
`user_id`, `action`, `at`. Az RLS be van kapcsolva, szabály nincs hozzá, így közvetlenül senki nem olvashatja vagy írhatja. A rate limit függvény használja.

## Segédfüggvények (az RLS-szabályok használják)

| Függvény | Mit ad vissza |
|---|---|
| `social_is_blocked(a, b)` | igaz, ha a két felhasználó közül bármelyik tiltotta a másikat |
| `social_is_friend(a, b)` | igaz, ha van `accepted` barátkérésük |
| `social_is_public(u)` | igaz, ha `u` profilja nyilvános |
| `social_can_view(u)` | igaz, ha a hívó láthatja `u` aktivitásait: önmaga, vagy (nincs tiltás **és** (`u` nyilvános **vagy** barátok)) |
| `social_check_rate(action, max, window)` | hibát dob, ha a hívó túllépte a limitet, különben naplóz |

## RLS-szabályok táblánként

| Tábla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | saját sor, vagy bárki, akivel nincs tiltás | csak a saját sora | csak a saját sora (azonosító nem változhat) | csak a saját sora |
| `profile_settings` | csak saját | csak saját | csak saját | csak saját |
| `follows` | ha a hívó a követő vagy a követett | csak `follower_id = hívó`, nincs tiltás közöttük | nincs | a követő (kikövet) vagy a követett (követő eltávolítása) |
| `friend_requests` | ha a hívó a feladó vagy a címzett | csak `from_id = hívó`, `pending`, nincs tiltás | csak a címzett, csak `pending` -> `accepted` / `declined` (függvény vagy trigger őrzi) | bármelyik fél (visszavonás, barátság megszüntetése) |
| `activities` | saját, vagy ha `social_can_view(user_id)` | csak `user_id = hívó` és bekapcsolt `share_activity` | nincs | csak a tulajdonos |
| `blocks` | csak a tiltó | csak `blocker_id = hívó` | nincs | csak a tiltó |
| `reports` | csak a jelentő a sajátját | csak `reporter_id = hívó`, nem saját magát, a célt látnia kell | nincs | nincs |
| `social_rate_log` | senki | csak a függvényen keresztül | nincs | csak a függvényen keresztül |

Tiltáskor (blocks beszúrás) egy trigger törli a két fél közötti követéseket és barátkéréseket mindkét irányban.

## Jogosultsági táblázat: ki mit lát és mit módosíthat

Szereplők: **Saját**: te a saját adatodon. **Idegen**: bejelentkezett, nem követő, nem barát. **Követő**: követ téged, de nem barát. **Barát**: elfogadott barátkérés. **Tiltott**: valamelyikőtök tiltotta a másikat.

| Mit | Saját | Idegen | Követő | Barát | Tiltott |
|---|---|---|---|---|---|
| Felhasználónév, megjelenített név, avatar | lát, szerkeszt | lát | lát | lát | nem található |
| Beállítások (`is_public`, `share_activity`) | lát, szerkeszt | nem látja | nem látja | nem látja | nem látja |
| Követők és követettek **száma** | lát | csak nyilvános profilnál | csak nyilvános profilnál | lát | nem található |
| Aktivitások, **nyilvános** profil | lát, töröl | lát | lát | lát | nem található |
| Aktivitások, **privát** profil | lát, töröl | nem lát | nem lát | **lát** | nem található |
| Követés / követés megszüntetése | – | követhet (azonnali) | kikövethet | kikövethet | nem lehet |
| Barátkérés küldése | – | küldhet | küldhet | – (már barát) | nem lehet |
| Barátkérés elfogadása vagy elutasítása | csak a címzett | – | – | – | – |
| Jelentés küldése | – | küldhet | küldhet | küldhet | nem lehet (nem látja) |
| Jelentések olvasása | csak a saját jelentései | senki más | | | |
| Tiltás | bárkit tilthat | | | | |

A **feed** annyi aktivitást tartalmaz, amennyit az RLS a hívó számára az általa követett felhasználóknál enged, vagyis a követett nyilvános profilok aktivitásait és azokét a követetteket, akikkel barátok vagyunk. Időrendben, lapozható, alapból legfeljebb 30 elem.

## Rate limit (spam ellen)

Minden írási művelethez `BEFORE INSERT` trigger hívja a `social_check_rate`-et. Javasolt limitek:

| Művelet | Limit |
|---|---|
| Követés | 60 / óra |
| Barátkérés küldése | 20 / óra |
| Aktivitás közzététele | 30 / nap |
| Jelentés | 10 / óra |
| Tiltás | 30 / óra |
| Profil módosítása (felhasználónév-váltás külön) | 10 / óra |
| Felhasználónév megváltoztatása | 1 / 30 nap |

A naplót a függvény alkalmanként takarítja (2 napnál régebbi sorok törlése). A **kereséseknek** és az olvasásoknak nincs szerveroldali limitje (az RLS-sel védett SELECT-ekre nem lehet triggert tenni), ezért a keresés legalább 3 karaktert kér és legfeljebb 20 találatot ad. Az, hogy valaki kimásolja a felhasználónevek listáját, ezzel csak lassítható, megakadályozni nem.

## Kliens

- Csak az anon kulcsot használja, ez a `js/auth.js`-ben már így van. Service role kulcs sehol sem szerepel.
- A kliens semmilyen jogosultságot nem dönt el: a lekérdezés az RLS szerint annyit ad vissza, amennyit szabad, a kliens csak megjeleníti.
- A közösségi menü (és a pop-up a felhasználónév kiválasztásához) csak bejelentkezett felhasználónak látszik. Értesítések (új követő, barátkérés) első változatban nincsenek, a lista a képernyő megnyitásakor frissül.

## Amit a terv nem old meg

- A jelentések kezelése egyelőre kézi, SQL-ből. Nincs admin felület és nincs automatikus rejtés.
- A felhasználónevek listázása nem teljesen védhető (lásd fent).
- Képfeltöltés nincs, mert az külön tárhely-szabályokat és képmoderálást igényelne.
- Tesztelni valódi eszközön és éles Supabase-szel nem tudok. A kézi tesztlépések két fiókkal a 6. lépésben készülnek.

## Döntések, amelyeket neked kell meghozni

1. **A profil alapból privát legyen-e?** Javaslat: igen. A privát profilból idegeneknek csak a felhasználónév, a név és az avatar látszik.
2. **Az aktivitás-megosztás alapból ki legyen-e kapcsolva?** Javaslat: igen. Egyetlen kapcsolóval van vezérelve: ha be van kapcsolva, a befejezett edzésből automatikusan aktivitás lesz, utólag bármelyik törölhető.
3. **Ki jelenthet tartalmat?** Javaslat: bármelyik bejelentkezett felhasználó, aki a tartalmat látja. A „csak barátok" gyakorlatilag kikapcsolná a jelentést.
4. **Mit jelent a követés privát profilnál?** A leírás szerint a követés kölcsönös kérés nélkül működik, ugyanakkor a profil alapból privát. Ezt így oldanám fel: a követés mindig azonnali, de egy **privát** profil aktivitásait csak a **barátok** látják (elfogadott barátkérés), egy nyilvánosét mindenki. A követő tehát a privát profil aktivitását addig nem látja a feedben, amíg nem barátok. Jó így?
5. **Avatar:** javaslat: előre megadott szín + ikon (vagy kezdőbetű), képfeltöltés később. Jó így?
6. **Felhasználónév-váltás:** javaslat: 30 naponta egyszer. Jó így?
