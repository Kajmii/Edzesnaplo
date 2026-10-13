# Változásnapló: UI-egységesítés

Fázisonként egy bejegyzés. Minden bejegyzés: mi változott, képernyőképek (360 / 390 / 430 px, magyarul és angolul), kézi tesztlista telefonra, és hogy mit nem lehetett tesztelni. A terv: [UI-IMPLEMENTATION.md](UI-IMPLEMENTATION.md).

## Terv (nincs kód)
- Ág: `feature/ui-egysegesites`
- Új: `docs/UI-IMPLEMENTATION.md` (a terv), `docs/CHANGES.md` (ez a fájl). Az előző szakasz doksija átkerült a `docs/UI-IMPLEMENTATION-1-fazis.md` névre.
- Kód nem változott, képernyőkép és kézi teszt ezért nincs. A terv jóváhagyva, a nyitott kérdések megválaszolva (K1–K6, a 10. fejezetben). Új: vendég mód (K1), Kezdőlap-testreszabás (K4), a meglévő felhasználók is megkapják a szint-választót (K3).

## 0. fázis: mockupok
- Ág: `feature/ui-egysegesites` (a tervvel együtt)
- Új: `docs/mockups/uj/` (`pro.html`, `gym.html`, `family.html`, `index.html`, `uj.css`, `build.js`): 16 képernyő mindhárom irányban. Az app kódja nem változott.
- Tesztelve: a böngészőpanelben 375 px-es emulációval megnéztem a Pro, a Gym és a Family oldalt (szint-választó, menü, súgó, kezdőlap, edzés). Képernyőképek 360 / 390 / 430 px-en és angolul **ennél a fázisnál nincsenek**, mert a mockupok magyarul vannak, és nem az app részei. Ezek a 1. fázistól kötelezők.
- Kézi teszt telefonra: nyisd meg a három oldalt a helyi tesztszerveren, görgesd végig, és nézd meg az olvashatóságot, az érintési méreteket és a három irány hangulatát. Csak telefonon ellenőrizhető: a valódi betűrajz és a sebesség.

## 1. fázis: funkció-nyilvántartás és paritás-teszt
- Ág: `feature/ui-egysegesites` (commitok: nyilvántartás + teszt, majd a fájl-átnevezés külön).
- Új: `js/features/registry.js` (63 funkció: azonosító, csoport, szint, útvonal, ikon, cím, kulcsszavak, súgó-kulcs, főmenü-adat), `js/features/parity.js` (irányonkénti megvalósítási jelölők és az ismert hiányok célfázissal), `tests/features.check.js`, `tests/parity.check.js`, npm scriptek (`npm run check`, `check:features`, `check:parity`, `check:parity:strict`).
- Változott: a főmenü (`UI_MENU`) mostantól a nyilvántartásból épül. A menü **kinézete és tartalma nem változott** (13 sor, ugyanaz a sorrend és szöveg, ellenőrizve a böngészőpanelben és a `tests/ui.check.js`-szel). A Számolók (Kalória és makró) szintje a nyilvántartásban 3 (a menüsorával egyezően).
- Átnevezés (K6, külön commit): `js/ui-*.js` → `js/ui/*.js` (11 fájl), minden hivatkozás (index.html, tesztek, CLAUDE.md, doksik) átírva; a `parity` teszt a `js/ui/` mappát is olvassa.
- A paritás-teszt állása: ismert hiány Pro 14, Gym 13, Family 21 (összesen 48; fázisonként F2: 3, F3: 3, F4: 3, F5: 12, F6: 12, F7: 15). A `--strict` mód akkor lesz zöld, ha ez 0.
- Megnyugtató mikroszövegek: a terv új 7b fejezete (a felhasználó kérésére), megvalósítás a súgó és a szintek fázisaiban.
- Tesztek: az összes meglévő teszt zöld, az új tesztek zöldek, `node --check` minden JS-en. Elrendezés-ellenőrzés és képernyőkép: **nem kellett**, a kinézet nem változott (a menü sorait böngészőben 13 sorral ellenőriztem).
- Kézi teszt telefonra: nyisd meg az appot, a Menü nyitása után ugyanazt a 13 pontot lásd (Ciklus csak bekapcsolva), minden pont a régi helyre vigyen; a Google-belépés érintetlen. Csak telefonon ellenőrizhető: a valódi eszközön a betöltési sebesség az új fájlszerkezettel.
