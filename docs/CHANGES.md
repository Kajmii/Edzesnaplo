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
