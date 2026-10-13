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

## 2. fázis: szintek (Csak a lényeg / Ajánlott / Minden)
- Ág: `feature/ui-szintek` (az 1. fázis ágából). Build: 13okt-1.
- Új: `js/features/levels.js` (szint-állapot és szűrők: `lvlOf`, `lvlOn(id, force)`, `lvlHidden`, `homeOn`), `tests/levels.check.js` (npm run check:levels), a Beállítások › **Szint** kártya (`LevelPick`, hu és en), a menü alján a „Még N funkció rejtve" sor (a Beállítások › Szintre visz).
- Szűrés a szint szerint: főmenü (Lényeg: Edzés, Terv, Napló, Profil, Beállítások; Ajánlott: + Étel, Test és mérések; Minden: mind a 13), Kezdőlap-kártyák (Lényeg: napsor; Ajánlott: + az irány fő kártyája; Minden: az összes), aktív edzés (sorozat hozzáadása, pihenő ±15, eltelt idő: Ajánlott; RPE, tárcsa-ábra: Minden), Napló (rekordok és grafikon: Ajánlott), Terv (értesítések, naptár: Minden), Étel (víz, 7 napos grafikon, receptjavaslat, Receptek fül: Minden), Test (Fotók fül: Minden), Számolók (Minden), Beállítások (Edzés kártya: Ajánlott; Ciklus-kapcsoló és Adatok: Minden).
- Meglévő felhasználók (K3): amíg nem választanak (`opt.lvlSet` hiányzik), a **Minden** szint él, tehát semmi nem tűnik el. A szint-választó képernyő az első belépés/meglévők számára a 7. fázisban (onboarding) jön; addig a Beállítások › Szint és a menü alsó sora az elérés.
- A szint az `opt` része (`lvl`, `lvlSet`), így a többi beállítással együtt szinkronizál.
- Változott: a Rezgés kapcsoló a Megjelenés kártyába költözött (az 1. szinten is kell, az Edzés kártya pedig csak Ajánlottól látszik). A nyilvántartásban a szintek igazodtak a döntésekhez (Kezdőlap-kártyák K4 szerint; sorozat hozzáadása Ajánlott).
- A paritás-teszt: `opt.level` megvan mindhárom irányban (ismert hiány 48 → 45).
- Tesztek: `npm run check` zöld (az új szintek-teszttel), `node --check` minden JS-en. Böngészőpanelben (Pro, Gym, Family, 3 szint): a menü sorai, a Kezdőlap-kártyák, az Edzés elemei, a Napló, Terv, Étel, Test, Beállítások szűrése az elvártak szerint; angolul is; 360 és 430 px-en nincs vízszintes túllógás. A Gym tárcsa-ábra szűrését nem néztem meg élőben (a tesztedzés gyakorlata nem rudas), csak a kód és az azonosító-teszt védi.
- Kézi teszt telefonra: lásd a jelentést (Beállítások › Szint váltása, a menü és a Kezdőlap változik, visszaváltva minden visszajön; adat nem vész el). Valódi telefonon nem tudtam tesztelni.

## 3. fázis: csoportos menü, kereső, Statisztikák és rekordok
- Ág: `feature/ui-menu` (a 2. fázis ágából). Build: 13okt-2.
- Menü: a felnyíló lap csoportokra bomlik (Ma: Edzés, Terv, Napló; Étkezés: Étel, Receptek; Fejlődés: Test és mérések, Statisztikák és rekordok, Számolók, Ciklus; Közösség), a Profil és a Beállítások fix lábsorban van. Üres csoport nem látszik, a szintek szerint szűrt (2. fázis). A sorszám folyamatos. Mindhárom irányban a meglévő sorstílus, csak új csoportcímek.
- Kereső (`js/features/search.js`, `tests/search.check.js`): a menü tetején; ékezet- és kisbetű-független, magyarul és angolul keres cím és kulcsszó szerint, legfeljebb 8 találat, a cím elején egyezők elöl. A rejtett (a szintre nem látszó) funkciót is megtalálja, „Nem látszik a szinteden” jelzéssel, és megnyitva a kért rész látszik (`lvlForce`/`navFocus`, pl. a Haladási fotók a Fotók fülre, a Kalória-számoló a Kalória fülre, a Közösség › Csoportok a Csoportok fülre nyílik). Enter az első találatot nyitja. Út: `Test és mérések › Haladási fotók`.
- Új képernyő: **Statisztikák és rekordok** (Ajánlott szinttől): heti volumen (8 hét, változás, hetes széria), rekordok és izomcsoportok, fejlődés-grafikon. A Napló mostantól az edzések listája; a rekordok és a grafikon innen ide költöztek.
- Tervszerkesztő: a Terv képernyőről nyílik („Saját edzések szerkesztése”, Minden szint; a keresés a rejtettet is megnyitja), a visszalépés a Tervre visz. Az Export és adatok kikerült a menüből: Beállítások › Adatok (Minden szint, a keresés megtalálja). A menü 13 sorról 12-re változott.
- Megnyugtató szöveg (7b): a menü alján „A keresés mindent megtalál. Szint váltása: Beállítások › Szint.” A „Még N funkció rejtve” szám mostantól csak a keresésből elérhető funkciókat számolja (Kezdőlap-kártyák és edzés közbeni elemek nélkül).
- Nyilvántartás: új `stats.main`, `stats.volume`; a `log.progress`/`log.records` a Statisztikák képernyőre költözött; a `plan.editor` és `opt.export` már nem menüsor (`via`: a Terv nyitja). `nav.search` kész (ismert hiány 45 → 42).
- Eltérés a tervtől: az „utoljára használt három funkció” az üres keresésnél kimaradt (a menüt letisztultnak szántuk; a csoportos lista már így is rövid). Ha kéred, pótolható. A Súgó sor a lábsorban a 4. fázisban kerül be.
- Tesztek: `npm run check` zöld (új: search; frissítve: ui, features, levels, parity), `node --check` minden JS-en. Böngészőpanelben (Pro, Gym, Family; hu/en; 360 és 430 px): a menü csoportjai és lábsora, a keresés (találat, nincs találat, rejtett jelzés, megnyitás), Statisztikák, Napló, Tervszerkesztő gomb és visszalépés; nincs vízszintes túllógás. A Közösség fül-fókuszt (Csoportok) a tesztkeretben nem lehetett élőben kipróbálni (belépés kell), azt a kód és a teszt védi.
- Kézi teszt telefonra: lásd a jelentést. Valódi telefonon nem tudtam tesztelni.

## 4. fázis: súgó rendszer
- Ág: `feature/ui-sugo` (a 3. fázis ágából). Build: 13okt-3.
- Tartalom: `js/features/help.js` (egy forrás, kulcsa a funkció azonosítója): mind a 65 funkcióhoz „mi ez”, 1–2 „hogyan használd” pont, tipp és/vagy megnyugtató mondat; az angol a `setDict`-ben (+168 szöveg). `tests/help.check.js` (npm run check:help): minden funkciónak van bejegyzése, minden szövegnek angol párja, hosszkorlát (mi ez 110, pont 80, tipp és megnyugtató 90 karakter), a megnyugtató mondatok a terv 7b fejezetéből valók, minden képernyőnek van súgó-témája.
- „?” gomb minden képernyő fejlécében (mindhárom irányban a saját formájában): megnyitja az adott képernyő súgólapját (közös alsó lap: mi ez, hogyan használd, tipp, megnyugtató mondat; „Értem” és „Minden súgótéma”). Esc zár, `aria-haspopup='dialog'`.
- Súgó-képernyő (`js/ui/help.js`): a menü fix lábsorában a Profil és Beállítások mellett; keresőmező és az összes téma csoportonként, egy sor megnyitja a súgólapot. A menüsorok 12-ről 13-ra nőttek (Súgó, Minden szinten látszik); a menükereső a Súgót is megtalálja.
- Elemi súgó: mindig látható „i” gomb a nem magától értetődő elemeknél: RPE oszlop (Pro), Heti volumen és Rekordok (becsült 1RM) a Statisztikák képernyőn.
- Első-látogatás tipp: képernyőnként egyszer jelenik meg, bezárható („Mi ez a képernyő?”), csak a Csak a lényeg és az Ajánlott szinten; a bezárás helyben tárolódik (`tips`), nem szinkronizál.
- Megnyugtató sorok (7b) a képernyőkön: Terv, Edzés-választó (az első három edzésig), Napló (a törlésről), Étel, Számolók, Közösség. A többi (Export, Alapértékek, Nagy kontraszt, Tervszerkesztő, RPE, Kezdőlap tartalma, Vendég) a súgólapon már szerepel, a képernyőn a saját fázisában jelenik meg.
- Nyilvántartás: `help.main` menüsor (tab: help); a paritás-teszt ismert hiánya 42 → 39.
- Eltérés a tervtől: a menükereső a súgó-témákat nem listázza külön szekcióban (a Súgó-képernyő saját keresővel rendelkezik); az „i” gomb csak 3 helyen van (RPE, rekordok, heti volumen), a többi elemhez a képernyő „?” gombja tartozik.
- Tesztek: `npm run check` zöld (új: help), `node --check` minden JS-en. Böngészőpanelben (Pro, Gym, Family; hu/en; 360 és 430 px): „?” és súgólap, tipp megjelenik és bezárás után nem tér vissza, Minden szinten nincs tipp, Súgó-képernyő és keresés, „i” gomb, megnyugtató sorok; nincs vízszintes túllógás. A Közösség megnyugtató sorát a tesztkeretben nem lehetett élőben megnézni (belépés kell), a kódban és a teszt használat-ellenőrzésében szerepel.
- Kézi teszt telefonra: lásd a jelentést. Valódi telefonon nem tudtam tesztelni.

## 5. fázis: paritás az edzés-nézetekben (Pro, Gym, Family)
- Ág: `feature/ui-paritas` (a 4. fázis ágából). Build: 13okt-4.
- Minden edzés-funkció mostantól mindhárom irányban megvan (K5: a meglévő nézetek stílusában, új mockup nélkül). Pótolt elemek:
  - **Előző alkalmak** (`workout.prevsets`, új, Ajánlott szinttől): a gyakorlat utolsó három edzésének sorozatai dátummal (pl. „okt. 9.  80×8 · 80×8 · 80×6"), közös `PrevSets` komponens; az adat `uiPrevSets` (js/ui/data.js, tesztelt).
  - **RPE** (Minden szint): a Gym-ben és a Family-ben 6–10 közti gyorsválasztó (`RpeRow`, ugyanarra koppintva törlődik, mellette „i" súgó); a Pro-ban az oszlop marad.
  - **Rúd és tárcsák ábra** (Minden szint): a Gym ábráját most a Pro és a Family is mutatja rudas gyakorlatnál.
  - **Family:** legutóbbi alkalom egy sorban, eltelt idő a fejlécben, „Sorozat hozzáadása", „−15 / +15" a pihenőnél (futó pihenő alatt), mindig elérhető „Edzés befejezése" (az első kipipált sorozat után aktív).
- Szintek: a meglévő szint-szűrés (2. fázis) érvényes az új elemekre (Ajánlott: előző alkalmak, sorozat hozzáadása, ±15, idő; Minden: RPE, tárcsák).
- Paritás-teszt: ismert hiány 39 → 27 (csak F6 és F7 maradt: beállítások, onboarding és Kezdőlap-testreszabás). A terv mátrixában a sorok ✓-ek.
- Tesztek: `npm run check` zöld (új: `uiPrevSets` az ui-data teszten), `node --check` minden JS-en. Böngészőpanelben (Pro, Gym, Family × 3 szint): az elemek a szint szerint jelennek meg és tűnnek el, az RPE-választó menti az értéket, nincs vízszintes túllógás 360 és 430 px-en, hu és en.
- Megjegyzés: a Gym nézet görgetős (a pihenő-sáv alul ragad), Minden szinten az új sorok (RPE, előző alkalmak) görgetéssel érhetők el. Valódi telefonon nem tudtam tesztelni.
