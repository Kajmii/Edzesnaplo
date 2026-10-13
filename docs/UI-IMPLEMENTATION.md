# UI-egységesítés: terv (2. szakasz)

Állapot: **terv, jóváhagyásra vár. Kód még nincs.** A 3 irány (Pro, Gym, Family) kinézete jóváhagyott és marad. Ez a terv a funkciókat, a szinteket, a menüt, a súgót és az onboardingot egységesíti. Az előző szakasz (az irányok és a képernyők megépítése) leírása: [UI-IMPLEMENTATION-1-fazis.md](UI-IMPLEMENTATION-1-fazis.md).

## 0. Eltérések a kiadott feladattól (nem csendben)

| # | Mit írt a feladat | Mi a valóság / mit javaslok | Miért |
|---|---|---|---|
| 1 | „Olvasd el a docs/ROADMAP.md-t” | Nincs ilyen fájl. A közösségi terv a `docs/ROADMAP-social.md`, a UI-terv az előző szakasz doksija. | A hivatkozott fájl nem létezik, a többit elolvastam. |
| 2 | „Bontsd szét az index.html-t (ROADMAP 2. fázis)” | **Ez már megtörtént.** Az `index.html` csak a héj (stílus- és script-hivatkozások), a kód 40+ külön `js/*.js` és `css/*.css` fájlban van, build nélkül. Ami hiányzik, az a **funkció-nyilvántartás** (feature registry) és a kinézet–funkció szétválasztás. | Felesleges újra szétbontani. A fázis 1 a nyilvántartást építi. |
| 3 | „Az alapérték a jelenlegi sötét kinézet” | Az alap **Pro / Papír** (világos). Az eredeti sötét-üveg kinézetet a korábbi döntésed szerint kivettük az appból. | Korábbi jóváhagyott döntés. |
| 4 | „Vissza az eredeti kinézetre” gomb | **„Alapértékek visszaállítása”**: Pro / Papír, Ajánlott szint, normál betűméret, animáció be, nagy kontraszt ki. Az eredeti kinézethez nincs út vissza. | Ugyanaz a döntés. |
| 5 | Grafit akcent szövegként `#E2622B` | **`#EC7344` marad.** Mért kontraszt Grafit alapon: `#E2622B` 4,88:1 a háttéren, de **4,45:1 a felületen** és 3,94:1 a felület2-n (4,5 alatt). `#EC7344`: 5,76 / 5,25 / 4,65. | A kontrasztteszt (`tests/ui.check.js`) ezt kényszeríti. |
| 6 | Family alap betűméret 20 px | **16 px**, a többi irányhoz igazítva. A Family nagyobb gombokat és kártyákat kap, de nem nagyobb betűt. | Korábbi jóváhagyott döntésed. |
| 7 | „Bejelentkezés (vagy vendég)” | **Vendég mód nincs**, az app fiókhoz kötött (szinkron, közösség, Google). Lásd a 10. pontot (K1). | Új funkció, külön döntés kell. |
| 8 | Tesztelés „DevTools eszközemulációval, 4× CPU-lassítással” | A beépített böngészőpanelben tudok **viewport-emulációt** (360 / 390 / 430) és `prefers-reduced-motion`-t használni. **CPU-lassítást nem tudok állítani**, és a panel a mozgáscsökkentést emulálja, így az animációkat futás közben nem látom. A tesztlistában „csak telefonon ellenőrizhető” jelölést kapnak. | Eszközkorlát, nem becslek értéket. |
| 9 | A feladat szövege a **6. pont (menü) közepén ér véget** | A 7. (súgó) és az utána következő pontok hiányoznak, pedig a feladat hivatkozik rájuk (a 2. pont „lásd 7. pont”). A súgót a 2. pont leírása szerint terveztem meg (7. fejezet). Ha volt további szöveg, kérlek küldd el. | Ne találjak ki követelményt. |
| 10 | Google Fonts, Supabase élő adat | A betűk Google Fonts-ról töltődnek (offline fallback: a rendszerbetű). Supabase élő adatot nem becsülök: a szint és a UI-beállítás az `opt` dokumentumban szinkronizál, külön SQL nem kell. | Nincs szerveroldali változás ebben a szakaszban. |

## 1. Funkciólista-mátrix

Jelölés: ✓ van, ✗ **hiányzik** (javítandó), ~ részleges. **Szint**: 1 = Csak a lényeg, 2 = Ajánlott, 3 = Minden. A szint csak a *látható* tartalmat szabja, a funkciók keresésen át mindig elérhetők (4. és 6. fejezet).
Az „Elérés” oszlop a legrövidebb út Kezdőlapról (koppintások száma, szabály: ≤ 2).

### 1.1 Ma (Edzés, Terv, Napló)

| Azonosító | Funkció | Szint | Pro | Gym | Family | Elérés | Megjegyzés |
|---|---|---|---|---|---|---|---|
| `home.hero` | Kezdőlap: mai edzés és indítás/folytatás | 1 | ✓ | ✓ | ✓ | 0 | |
| `home.week` | Heti napsor (kész / ma / tervezett) | 1 | ✓ | ✓ | ✓ | 0 | |
| `home.easy` | Könnyű mozdulatok ajánlása, ha nincs tervezett edzés | 1 | ✗ | ✗ | ✓ | 0 | minden irányba |
| `home.profile` | Profil-gomb a Kezdőlapon | 1 | ✓ | ✓ | ✗ | 1 | Family: a menüben van, a Kezdőlapon nem |
| `home.fontsize` | Gyors betűméret-kapcsoló a Kezdőlapon | 2 | ✗ | ✗ | ✓ | 0 | minden irányba (a Beállításokban már mind) |
| `home.volume` | Heti volumen, 8 hét grafikon és változás | 2 | ✓ | ✗ | ✗ | 0 | |
| `home.records` | Rekordok (becsült 1RM, top 3) | 2 | ✓ | ✗ | ✗ | 0 | |
| `home.pr` | Legutóbbi új rekord (21 napon belül) | 2 | ✗ | ✓ | ✗ | 0 | |
| `home.streak` | Hetes széria | 2 | ✗ | ✓ | ✗ | 0 | |
| `home.groups` | Heti sorozatok izomcsoportonként | 3 | ✗ | ✓ | ✗ | 0 | |
| `workout.pick` | Tervválasztó, ismétlés, üres edzés | 1 | ✓ | ✓ | ✓ | 2 | közös (LogPick) |
| `workout.sets` | Súly × ismétlés, sorozat kész | 1 | ✓ | ✓ | ✓ | 2 | |
| `workout.lastline` | „Legutóbb: 80 kg × 8, rekord …” egy sor | 1 | ✓ | ✓ | ✗ | – | |
| `workout.prevsets` | **Az előző alkalmak sorozatai** a gyakorlatnál (utolsó 3 edzés, dátummal) | 2 | ✗ | ✗ | ✗ | – | **új** (a feladat példája) |
| `workout.addset` | Sorozat hozzáadása | 1 | ✓ | ✓ | ✗ | – | |
| `workout.rpe` | RPE oszlop | 3 | ✓ | ✗ | ✗ | – | |
| `workout.rest` | Pihenő-időzítő (automatikus, elnémítható) | 1 | ✓ | ✓ | ✓ | – | |
| `workout.restadj` | Pihenő ±15 mp | 2 | ✓ | ✓ | ✗ | – | |
| `workout.clock` | Eltelt idő az edzésben | 2 | ✓ | ✓ | ✗ | – | |
| `workout.finish` | Edzés befejezése gomb a fejlécben | 1 | ✓ | ✓ | ~ | – | Family: csak az utolsó sorozat után |
| `workout.list` | Gyakorlat-lista, váltás, törlés, hozzáadás | 1 | ✓ | ✓ | ✓ | – | |
| `workout.info` | Gyakorlat-leírás és videókereső | 1 | ✓ | ✓ | ✓ | – | |
| `workout.plates` | Rúd és tárcsák ábra | 3 | ✗ | ✓ | ✗ | – | rudas gyakorlatnál, minden irányba |
| `plan.week` | Heti terv és célsúlyok | 2 | ✓ | ✓ | ✓ | 1 | közös |
| `plan.notify` | Értesítések, naptár (Google, .ics) | 3 | ✓ | ✓ | ✓ | 2 | |
| `plan.editor` | Tervszerkesztő (saját tervek) | 3 | ✓ | ✓ | ✓ | 2 | most a menüben, ezután a Terv képernyőről |
| `log.list` | Napló: edzések, törlés | 1 | ✓ | ✓ | ✓ | 1 | |
| `log.progress` | Fejlődés-grafikon gyakorlatonként | 2 | ✓ | ✓ | ✓ | 1 | |
| `log.records` | Rekordok és izomcsoport-sávok | 2 | ✓ | ✓ | ✓ | 1 | |

### 1.2 Étkezés

| Azonosító | Funkció | Szint | P | G | F | Elérés |
|---|---|---|---|---|---|---|
| `food.log` | Napló: kalória, makrók, étkezések | 2 | ✓ | ✓ | ✓ | 1 |
| `food.water` | Vízbevitel | 3 | ✓ | ✓ | ✓ | 1 |
| `food.week` | Kalória, utolsó 7 nap | 3 | ✓ | ✓ | ✓ | 1 |
| `food.fav` | Kedvencek (csillag) | 2 | ✓ | ✓ | ✓ | 2 |
| `food.suggest` | Receptjavaslat a hátralévő keretre | 3 | ✓ | ✓ | ✓ | 1 |
| `recipes.list` | Receptek: keresés, szűrők, adag | 3 | ✓ | ✓ | ✓ | 1 |

### 1.3 Fejlődés

| Azonosító | Funkció | Szint | P | G | F | Elérés |
|---|---|---|---|---|---|---|
| `body.measure` | Mérések: súly, méretek, grafikon | 2 | ✓ | ✓ | ✓ | 1 |
| `body.photos` | Haladási fotók, összehasonlítás, megosztás | 3 | ✓ | ✓ | ✓ | 2 |
| `tools.cardio` | Kardió-számoló | 3 | ✓ | ✓ | ✓ | 2 |
| `tools.kcal` | Kalória és makró (TDEE) | 2 | ✓ | ✓ | ✓ | 2 |
| `tools.strength` | 1RM, százalékok, tárcsák, bemelegítés | 3 | ✓ | ✓ | ✓ | 2 |
| `tools.interval` | Intervall-időzítő (Tabata, HIIT, EMOM) | 3 | ✓ | ✓ | ✓ | 2 |
| `cycle.main` | Ciklus-követés (csak ha bekapcsolva) | 3 | ✓ | ✓ | ✓ | 1 |

### 1.4 Közösség

| Azonosító | Funkció | Szint | P | G | F | Elérés |
|---|---|---|---|---|---|---|
| `social.feed` | Hírfolyam | 3 | ✓ | ✓ | ✓ | 1 |
| `social.conn` | Kapcsolatok: követés, barátkérés, keresés | 3 | ✓ | ✓ | ✓ | 2 |
| `social.groups` | Csoportok és kihívások | 3 | ✓ | ✓ | ✓ | 2 |
| `social.profile` | Közösségi profil, adatvédelem, tiltottak | 3 | ✓ | ✓ | ✓ | 2 |
| `social.report` | Jelentés és tiltás | 3 | ✓ | ✓ | ✓ | – |

### 1.5 Fiók és beállítások

| Azonosító | Funkció | Szint | P | G | F | Elérés | Megjegyzés |
|---|---|---|---|---|---|---|---|
| `me.profile` | Profil: adatok, napi célok | 1 | ✓ | ✓ | ✓ | 1 | |
| `opt.ui` | Felület és színséma váltó, élő előnézettel | 1 | ✓ | ✓ | ✓ | 2 | |
| `opt.lang` | Nyelv | 1 | ✓ | ✓ | ✓ | 2 | |
| `opt.fontsize` | Betűméret | 1 | ✓ | ✓ | ✓ | 2 | |
| `opt.motion` | Animációk ki/be | 1 | ✓ | ✓ | ✓ | 2 | |
| `opt.vibrate` | Rezgés | 1 | ✓ | ✓ | ✓ | 2 | |
| `opt.level` | **Szint-választó** | 1 | ✗ | ✗ | ✗ | 2 | **új** |
| `opt.contrast` | **Nagy kontrasztú mód** | 2 | ✗ | ✗ | ✗ | 2 | **új** |
| `opt.quiet` | **Értesítések és csendes órák** | 3 | ✗ | ✗ | ✗ | 2 | **új** (az emlékeztetők már vannak a Tervben) |
| `opt.workout` | Edzés-beállítások (heti cél, pihenő, lépcső) | 2 | ✓ | ✓ | ✓ | 2 | |
| `opt.export` | Export: CSV, PDF, mentés másolása, **JSON** | 3 | ✓ | ✓ | ✓ | 2 | JSON új |
| `opt.account` | Fiók, szinkron, kilépés, fiók törlése | 1 | ✓ | ✓ | ✓ | 2 | |
| `opt.reset` | **Alapértékek visszaállítása** | 2 | ✗ | ✗ | ✗ | 2 | **új** |
| `help.main` | **Súgó** | 1 | ✗ | ✗ | ✗ | 1 | **új** |
| `nav.search` | **Funkció-keresés a menüben** | 1 | ✗ | ✗ | ✗ | 1 | **új** |

**Hiányok összesen (a mátrixból számolva):** a meglévő funkciókban Pro 6, Gym 5, Family 12 hiány (+1 részleges), vagyis 23. Ehhez jön az új `workout.prevsets` (mindhárom irányból hiányzik), és 6 másik új funkció (`opt.level`, `opt.contrast`, `opt.quiet`, `opt.reset`, `help.main`, `nav.search`), valamint a JSON-export. A paritás-teszt (3. fejezet) ezt a mátrixot gépi formában is tartalmazza.

## 2. Fájlszerkezet a szétbontás után

Az `index.html` marad héj. A betöltési sorrend ma is a `<script>` sorrend (klasszikus scriptek, közös globális tér, build nélkül). **A szabály nem változik:** új globális neveket nem ütköztetünk, a `?v=` a `BUILD`-et követi.

```
js/
  features/            ÚJ  a funkció-nyilvántartás (nézet nélkül)
    registry.js        az összes funkció: azonosító, csoport, szint, útvonal, ikon, kulcsszavak, súgó-kulcs
    levels.js          a szintek definíciója és a szűrés (uiVisible(id, level))
    help.js            súgó-bejegyzések (hu/en) a funkció-azonosítók szerint
    parity.js          irányonkénti megvalósítási tábla (melyik komponens rendereli a funkciót)
  ui/                  A MOST KÜLÖN "ui-*.js" FÁJLOK ÁTKÖLTÖZNEK IDE (átnevezés, tartalom nem változik)
    core.js (ui-core), kit.js, menu.js, home.js, workout.js, loader.js, picker.js, settings.js, previews.js
    onboarding.js      ÚJ  szint-választó + bemutató
    help-ui.js         ÚJ  súgó-lap, első-látogatás tipp
    search.js          ÚJ  menü-keresés
  (a meglévő: workout.js, tools.js, food.js, recipes*.js, cycle.js, social*.js, photos.js, settings.js, auth.js, util.js, data.js, app.js)
css/
  tokens.css  base.css  motion.css  ui-kit.css  (a mostaniak)
  ui-onboarding.css  ui-help.css  ui-search.css  ÚJ
tests/
  parity.check.js      ÚJ  funkció × irány × súgó
  features.check.js    ÚJ  a nyilvántartás belső egyezései (egyedi azonosító, érvényes útvonal, szint)
  levels.check.js      ÚJ  a szintek tartalma képernyőnként
docs/
  UI-IMPLEMENTATION.md (ez), CHANGES.md (ÚJ, fázisonként)
```

**Átköltöztetés kockázata:** a fájlok átnevezése minden `?v=` hivatkozást és a CLAUDE.md-t érinti. Javaslat: **az átnevezést csak a fázis 1 végén és külön commitban** végezzük, hogy a diff olvasható maradjon (kérdés: K6).

### A funkció-nyilvántartás szerkezete

Egy bejegyzés (a megjelenítés nélkül):

```js
{id:'food.water', group:'meal', level:3, route:['food',''], deep:{tab:'food',sub:'',focus:'water'},
 ic:'drop', t:'Vízbevitel', kw:['víz','ivás','folyadék','water'], help:'food.water', needs:null}
```

- `group`: `today` | `meal` | `progress` | `social` | `me`.
- `route`/`deep`: hová visz a koppintás (képernyő, almenü, és a fókuszálandó rész).
- `needs`: feltétel (pl. a Ciklus csak bekapcsolva látszik; a Közösség csak bejelentkezve).
- `kw`: a keresés kulcsszavai, magyar és angol.
- A **megjelenítést** a három irány adja (`parity.js`): `{pro:'HomePro.volume', gym:'—', family:'—'}`. Az új funkció akkor „kész”, ha mindhárom irányban van megvalósítás, vagy egy közös komponens (kit).
- A három irány menüje, kezdőlapja és keresése **a nyilvántartásból** épül. Új funkció felvétele = egy bejegyzés + a három irány komponense. A paritás-teszt nem enged zöldet, amíg valamelyik hiányzik.

**Szabály: legfeljebb két koppintás.** A teszt gráfként bejárja a `deep` útvonalakat a Kezdőlaptól, és hibát ad, ha egy funkció 2-nél több lépésre van.

## 3. Paritás-teszt (`npm run check:parity` és `node tests/parity.check.js`)

Nincs CI, ezért **npm script** (a `package.json` már van; `check:parity`, `check:features`, `check:levels`) és közvetlenül a `tests/` mappából futtatható. Ellenőrzi:
1. Minden nyilvántartott funkcióhoz mindhárom irányban van megvalósítás (`parity.js`) vagy közös komponens.
2. Minden funkcióhoz van súgó-bejegyzés (hu és en), és minden **látható elemhez** (a nyilvántartás „elemei”: menüsor, kezdőlapi kártya, edzés-oszlop, gomb) van `help` kulcs.
3. Minden szöveg-kulcs létezik a `setDict`-ben (a meglévő `tests/ui.check.js` bővítve).
4. Szint-konzisztencia: egy funkció szintje nem lehet kisebb, mint a szülő képernyőé.
5. Két koppintás szabály (gráf-bejárás).
6. Az angol szöveg nem hosszabb, mint a `max` mező (rövid menüleírásoknál, a mockup 7. szabálya).

## 4. Tokenek, témák, színsémák

**A tokenek már megvannak** (`css/tokens.css`), ez a terv nem módosítja őket, kivéve a nagy kontraszt módot. Összefoglaló (a mockup README és a `tests/ui.check.js` szerint):

| Token | Pro | Gym | Family |
|---|---|---|---|
| betűcsalád (szöveg / cím) | IBM Plex Sans / Plex Sans 600 (számok: Plex Mono) | Archivo / Anton | Atkinson Hyperlegible 400/700 |
| alap betűméret | 16 px | 15 px | 16 px |
| betűskála (azonos mindháromban) | 12 / 13 / 14 / 16 / 20 / 28 | ugyanaz | ugyanaz |
| sarok | 4 px | 0 | 14 / 16 / 20 px |
| min. érintési méret | 44 px | 48 px | 48 px (gombok 52+) |
| mozgás | finom, 120–280 ms | gyors, csapódó, 80–200 ms | lassú, 250–450 ms |

A betűméret a Beállításokban (Kicsi 14, Normál 16, Nagy 18, Nagyon nagy 20) mindhárom irányban skáláz (a Kezdőlap gyorskapcsolója is, F2).

**Színsémák** (9 db, mért kontraszt: normál szöveg ≥ 4,5:1, vezérlő ≥ 3:1; a `tests/ui.check.js` minden build előtt számolja):

| Irány | Séma | Háttér | Szöveg | Akcent (kitöltés) | Akcent mint szöveg | Megjegyzés |
|---|---|---|---|---|---|---|
| Pro | Papír (alap) | `#ECEAE5` | `#16171A` | `#C2410C` | `#A63608` | fehér az akcenten 5,18:1 |
| Pro | Kő | `#E6E0D4` | `#221E18` | `#C2410C` | `#A63608` | |
| Pro | Grafit | `#1B1C1F` | `#ECEAE5` | `#C2410C` | **`#EC7344`** | 5,76 / 5,25 / 4,65:1 (lásd 0/5) |
| Gym | Sárga (alap) | `#0F0F0D` | `#F3F0E8` | `#FFC93C` | ugyanaz | 12,5:1 |
| Gym | Narancs | `#0F0F0D` | `#F3F0E8` | `#FF5A1F` | ugyanaz | 6,2:1 |
| Gym | Zöld | `#0F0F0D` | `#F3F0E8` | `#7CFF4F` | ugyanaz | 14,9:1 |
| Family | Zöld (alap) | `#F2F4F0` | `#1A2420` | `#0E6B5E` | ugyanaz | 6,4:1 |
| Family | Meleg | `#F5EEE4` | `#1A2420` | `#A8481F` | ugyanaz | 5,8:1 |
| Family | Hűvös | `#EEF2F7` | `#1A2420` | `#1F4E99` | ugyanaz | 8,1:1 |

**Nagy kontrasztú mód (új, F6):** egy kapcsoló, amely irányonként a szöveget és a vonalakat a legnagyobb kontrasztra állítja (szöveg ≥ 7:1, vezérlő-keret ≥ 4,5:1, a halvány szöveg a szöveg színe, a díszítő vonalak vastagabbak, az akcent mint szöveg is ≥ 7:1). Tokenekkel: `html[data-contrast="high"]` felülírja a `muted`, `line`, `line2`, `control` és `accent-text` értékeit az aktív sémára. A teszt mindkét módot méri (9 séma × 2).

## 5. Szintek tartalma képernyőnként

A szint a **látható** tartalmat szabályozza (menü, kezdőlap-kártyák, képernyőn belüli fülek és oszlopok). Szint váltásakor adat nem vész el, csak elrejtődik. A rejtett funkció a **keresésben** mindig megtalálható, és megnyitva a kért rész látszik, az adott képernyő többi része a szintjének megfelelően.

| Képernyő | Csak a lényeg (1) | Ajánlott (2) | Minden (3) |
|---|---|---|---|
| **Menü** | Edzés, Napló, Profil, Beállítások | + Terv, Étel, Test és mérések | + Receptek, Közösség, Ciklus, Számolók, Tervszerkesztő, Export |
| **Kezdőlap** | mai edzés, indítás, heti napsor, „Terv megnyitása” ha van terv | + heti volumen / rekordok / széria (irányonként a saját kártyája, **de mindhárom irányban elérhető**), profil-gomb | + izomcsoport-sorozatok, könnyű mozdulatok, gyors betűméret |
| **Edzés (aktív)** | kg × ism, kész, pihenő, következő, befejezés, legutóbbi alkalom egy sor | + előző alkalmak sorozatai, pihenő ±15, eltelt idő, sorozat hozzáadása | + RPE, tárcsák, gyakorlat-leírás gyorsgomb |
| **Terv** | – (nem látszik) | heti terv, mai célsúlyok | + értesítések, naptár, .ics, Tervszerkesztő |
| **Napló** | edzés-lista | + fejlődés-grafikon, rekordok | + izomcsoport-sávok, részletes sorozatok |
| **Étel** | – | kalória és makrók, étkezések, kedvencek | + víz, 7 napos grafikon, receptjavaslat |
| **Test és mérések** | – | súly és méretek | + fotók, összehasonlítás, megosztás |
| **Közösség** | – | – | hírfolyam, kapcsolatok, csoportok, profil |
| **Beállítások** | Felület, nyelv, betűméret, animáció, rezgés, szint, fiók | + edzés-beállítások, alapértékek visszaállítása, nagy kontraszt | + értesítések és csendes órák, export, ciklus-kapcsoló, haladó |

Megjegyzés: a feladat javaslata szerint a „Csak a lényeg” szinten a Terv nem látszik. Ez a Kezdőlapon egy „Terv” gombbal pótolható, ha tervet állítottak be (kérdés K2).

**Alapértelmezés:** Ajánlott. Meglévő felhasználók (akiknél nincs `opt.level`) **Minden** szintet kapnak, hogy semmi ne tűnjön el a frissítéstől. Ezt a migrációt a fázis 2 végzi (K3).

## 6. Menü szerkezete (mindhárom irányban)

A mockup stílusa marad (felnyíló lap, sorszám, ikon, cím, egysoros leírás). A tartalom négy csoport, a lap tetején kereső:

```
[ Keresés… ]                                   (nav.search, a rejtett funkciókat is megtalálja)
MA              Edzés · Terv · Napló
ÉTKEZÉS         Étel · Receptek
FEJLŐDÉS        Test és mérések · Statisztikák és rekordok · Számolók · Ciklus (ha be van kapcsolva)
KÖZÖSSÉG        Közösség
────────────────
Profil · Beállítások · Súgó                    (fix lábsor, minden szinten)
```

Hova kerültek azok a funkciók, amelyek a feladat négy csoportjában nem szerepeltek (ésszerű besorolás, jóváhagyásra):

| Funkció | Hová | Indok |
|---|---|---|
| Tervszerkesztő | a **Terv** képernyőn gomb (és a keresés) | a Terv része, 2 koppintás |
| Számolók (kardió, kalória, erő, intervall) | **Fejlődés** | mérés és kalkuláció |
| Ciklus | **Fejlődés** (csak ha be van kapcsolva) | testi követés |
| Rekordok, grafikonok | **Fejlődés › Statisztikák és rekordok** (a Napló rekordjait és grafikonjait összefogó nézet) | a feladat „statisztikák, rekordok” pontja |
| Export és adatok | **Beállítások › Adatok** (a menüből kikerül) | adatkezelés |
| Profil, Beállítások, Súgó | fix lábsor | fiók-szintű, mindig kell |
| Kedvencek, Víz, Fotók | a szülő képernyő fülei (Étel, Test és mérések) | alfunkciók |

A „Statisztikák és rekordok” új, **gyűjtő** nézet: nem új adat, a meglévő rekord-lista, fejlődés-grafikon és izomcsoport-sáv egy helyen (a Napló „Fejlődés” és „Rekordok” része ide költözik, a Napló az edzések listája marad). Ennek mockupja a 11. pontban szerepel.

**Menü a szinteken:** a csoportok és sorok az 5. fejezet táblája szerint rejtettek vagy láthatók. Egy üres csoport nem jelenik meg. A lap alján, ha van rejtett funkció: „Még N funkció elérhető a Beállításokban (Szint)” sor.

**Menü-keresés:** gépelés közben szűri a nyilvántartást (cím, kulcsszó, magyarul és angolul). Egy találat egy koppintással a funkcióra visz, a rejtett funkciónál a találat mellett „Nem látszik a szinteden” jelzés van, és a koppintás megnyitja. Üres keresésnél a legutóbb használt három funkció látszik.

## 7. Súgó rendszer terve

(A feladat 7. pontja nem érkezett meg, ez a 2. pont leírásából és a „minden látható elemhez súgó-bejegyzés” szabályból készült. Kérlek jelezd, ha más volt a szándék.)

- **Egyetlen forrás:** `js/features/help.js`, kulcsa a funkció-azonosító. Egy bejegyzés: cím, 1–2 mondat „mi ez”, 1–3 pont „hogyan használd”, opcionálisan „tipp”. Magyarul és angolul, a `setDict`-ben is.
- **Hol jelenik meg:**
  1. **„?” gomb** minden képernyő fejlécében (a „Menü” és a cím mellett), megnyitja az adott képernyő súgólapját (KSheet, a közös lap).
  2. **Elemi súgó:** hosszú nyomás / a „i” ikon az olyan elemeken, amelyek nem magától értetődőek (RPE, becsült 1RM, hetes széria, nagy kontraszt…). A hosszú nyomás helyett **mindig van látható „i”** is (nem csak kézmozdulat).
  3. **Első-látogatás tipp:** egy képernyő első megnyitásakor egy kis, bezárható buborék (egyszer), a szinttől függően: Csak a lényeg szinten mutatja, Minden szinten nem.
  4. **Súgó a menüben és a keresésben:** „Súgó” a lábsorban, a keresés a súgó-címeket is találja.
- **Tartalom-szabály:** minden nyilvántartott funkcióhoz és minden „látható elemhez” (menüsor, kártya, oszlopfej, gomb) van bejegyzés. A paritás-teszt ellenőrzi (3. fejezet).
- **Hossz:** a cím és a „mi ez” 360 px-en két sorban elférjen, az angol is.
- **Akadálymentesség:** a súgólap fókuszt csapdáz, Esc zár, a „?” gomb `aria-haspopup='dialog'`.

## 8. Animációs táblázat

Az irányok alap-animációi változatlanok (lásd a mockup README és `css/motion.css`). **Új** elemek:

| Esemény | Pro | Gym | Family | Reduced-motion / „Animációk ki” |
|---|---|---|---|---|
| Onboarding kártyák belépése (lépcsős) | translateY 8 px + opacity, 220 ms, 25 ms lépcső | translateX −24 px, 140 ms, 20 ms lépcső | translateY 6 px, 320 ms, 50 ms lépcső | nincs mozgás, azonnal látszik |
| Kiválasztott kártya kiemelése | keret-szín 120 ms | keret + 80 ms csapódó scale 1.02 | keret + 250 ms scale 1.01 | csak keret-szín |
| Onboarding › Kezdőlap átmenet | áthalványítás, 240 ms | gyors csapódó csúszás, 180 ms | lassú csúszás, 450 ms | nincs |
| Menü-keresés találati lista | opacity 120 ms | translateX −12 px, 100 ms | opacity + translateY 4 px, 250 ms | nincs |
| Súgólap nyitás | a KSheet saját animációja (irányonként) | | | a KSheet szabálya |
| Első-látogatás tipp | opacity 200 ms | 100 ms | 400 ms | nincs |
| Szint váltásakor a tartalom (elrejt/megjelenik) | opacity 160 ms | 100 ms | 300 ms | azonnali |
| Nagy kontraszt kapcsoló | azonnali (színváltás átmenet nélkül) | | | azonnali |

Szabály marad: csak `transform` és `opacity` animálódik (kivétel az SVG `stroke-dashoffset`). Az **„Animációk” kapcsoló** (`opt.an`) a rendszerbeállítástól függetlenül kikapcsol minden mozgást (ma is így van, a `noanim` osztállyal).

## 9. Tesztlista

Minden fázisnál: (a) `node --check` minden módosított JS-en, (b) a meglévő tesztek zöldek (`ui`, `ui-kit`, `ui-data`, `cycle`, `social`, `photos`, `groups`, `moderation`, `recipes`), (c) az új tesztek zöldek.

| Teszt | Mit | Hogyan | Hol futtatható |
|---|---|---|---|
| T1 | Kontraszt, 9 séma × normál és nagy kontraszt | `tests/ui.check.js` | node |
| T2 | Paritás: funkció × irány × súgó | `tests/parity.check.js` | node |
| T3 | Szint-szűrés: minden szinten a várt menüsorok és kártyák | `tests/levels.check.js` | node |
| T4 | Két koppintás szabály | `tests/features.check.js` | node |
| T5 | Szövegek: hu és en, hossz-limitek | `tests/ui.check.js` | node |
| T6 | Elrendezés: túlcsordulás, levágás, érintési méret 360 / 390 / 430 px, magyarul és angolul, 3 irány, mind a képernyők, mind a szint | böngészőpanel, `uiCheck()` | **emuláció** |
| T7 | Képernyőképek fázisonként 360 / 390 / 430, hu és en | böngészőpanel | emuláció |
| T8 | Billentyűzet és fókusz: menü, keresés, súgólap, szint-választó (Tab, Esc, fókuszcsapda) | böngészőpanel | emuláció |
| T9 | Meglévő felhasználó frissítése: nincs `opt.level` → Minden, semmi nem tűnik el | node + böngészőpanel | emuláció |
| T10 | Onboarding: első bejelentkezés (új fiók), kihagyás, „Később” = Ajánlott | böngészőpanel hamis munkamenettel | emuláció |
| T11 | Mozgás: a beállított időtartamok, `prefers-reduced-motion` és az „Animációk ki” | a CSS tokenek és a Web Animations API vizsgálata | emuláció (futás közben a panel nem rajzol mozgást) |
| T12 | **CPU-lassítás (4×), valódi érintés, rezgés, értesítés, kamera** | – | **csak telefonon ellenőrizhető**, a kézi tesztlistában |

Kézi tesztlista telefonra (minden fázis végére a `docs/CHANGES.md` mellé): a fenti „csak telefonon” elemek, plusz a Galaxy S26 Ultra-n a három irány × három szint végigpróbálása, az APK-ban a Google-belépés érintetlensége.

## 10. Nyitott kérdések (egy kör)

Mindegyiknél 2–3 opció, az ajánlott első helyen.

**K1. Vendég mód.** Az onboarding „bejelentkezés vagy vendég” lépésében vendég = ?
 1. **Nincs vendég mód ebben a szakaszban** (ajánlott): az app fiókhoz kötött, a vendég külön feladat.
 2. Helyi vendég: minden adat csak a készüléken, szinkron és közösség nélkül, később fiókhoz köthető.
 3. Csak „Kipróbálom” demó-adatokkal, mentés nélkül.

**K2. Terv a „Csak a lényeg” szinten.** A feladat szerint a Terv itt nem látszik.
 1. **Marad rejtett, de ha van beállított terv, a Kezdőlapon megjelenik egy „Terv” gomb** (ajánlott).
 2. A Terv is látszik a lényeg szinten (a menüben 5 sor).
 3. Teljesen rejtett, csak keresés.

**K3. Meglévő felhasználók szintje a frissítéskor.**
 1. **Minden szint** (ajánlott): semmi sem tűnik el, a felhasználó szűkíthet.
 2. Ajánlott: egységes, de egyesek elveszítenek látható funkciót.
 3. Egyszer megkérdezzük a következő indításkor (a szint-választó lapot kapják meg).

**K4. Szintenkénti „Kezdőlap-kártyák” irányonként eltérőek (Pro: volumen+rekord, Gym: gyűrűk+széria, Family: könnyű mozdulatok).** A mátrix szerint mindhárom irányban elérhető kell legyen minden.
 1. **A kezdőlapon a saját irány kártyái maradnak, a hiányzók a „Fejlődés › Statisztikák és rekordok” nézetben vannak mindhárom irányban** (ajánlott: a mockupokhoz nem kell új kezdőlap).
 2. Mindhárom kezdőlapra mindhárom kártya kerül, szint szerint rejtve (a mockupok módosulnak).
 3. Kezdőlap-kártyák beállítása a felhasználóra bízva (testreszabható, nagyobb munka).

**K5. Az edzésnézetek hiányai (RPE, sorozat hozzáadása, ±15, óra, tárcsák, előző sorozatok).**
 1. **Mindhárom irányban elérhetők, a szint szerint** (ajánlott), az új elemek a meglévő nézetek stílusában (a Family-ben a sorozat-hozzáadás és az előző sorozatok a lap alján, nagy gombbal).
 2. Az edzésnézetek mockupját módosítjuk, és új mockupot kérünk.
 3. Csak az „előző sorozatok” új, a többi irányonkénti marad.

**K6. Fájlok átnevezése (`ui-*.js` → `js/ui/*.js`).**
 1. **Fázis 1 végén, külön commitban** (ajánlott).
 2. Nem nevezzük át, a `features/` mappa új, a többi marad.
 3. Azonnal, a fázis 1 elején.

## 11. Új mockupok (kódolás előtt jóváhagyás kell, mindhárom irányban)

| # | Mockup | Irányok | Mit mutat |
|---|---|---|---|
| M1 | Onboarding › szint-választó | Pro, Gym, Family | három kártya (név, mondat, 3–4 pont), a középső „Ajánlott” címkével, „Később” gomb |
| M2 | Onboarding › UI-választó (a meglévő) és a **rövid bemutató** (3 lépés, átugorható) | Pro, Gym, Family | a bemutató lépései |
| M3 | Menü csoportokkal és kereséssel | Pro, Gym, Family | 4 csoport, kereső, fix lábsor, „Még N funkció” sor, a keresési találatok |
| M4 | Súgó-átfedés | Pro, Gym, Family | a „?” gomb, a súgólap, az első-látogatás tipp |
| M5 | Statisztikák és rekordok (gyűjtő nézet) | Pro, Gym, Family | rekordok, fejlődés, izomcsoportok egy képernyőn |
| M6 | Edzés: az új elemek (előző sorozatok, RPE, sorozat hozzáadása, ±15) a hiányzó irányokban | Gym (előző sorozatok, RPE), Family (mind) | a meglévő nézetekbe illesztve |
| M7 | Beállítások: Szint, Nagy kontraszt, Csendes órák, Alapértékek | Pro, Gym, Family | az új sorok a Beállítások mockupban |

A mockupokat a `docs/mockups/forras/` mappába, a meglévő `.dc.html` formátumban készítem el a terv jóváhagyása után, és külön jóváhagyást kérek, mielőtt kódolnék.

## 12. Fázisok (egy fázis = egy ág, a `main` érintetlen, fázis végén megállás)

| Fázis | Ág | Tartalom | Kimenet |
|---|---|---|---|
| 0 | `feature/ui-mockupok` | M1–M7 mockupok | jóváhagyás |
| 1 | `feature/ui-regiszter` | funkció-nyilvántartás, a menü a nyilvántartásból épül (kinézet változatlan), `parity`, `features` tesztek, (K6 szerint) fájl-átnevezés | `CHANGES.md`, képernyőképek |
| 2 | `feature/ui-szintek` | szintek, Beállítások › Szint, szűrés minden képernyőn, meglévő felhasználók migrációja | |
| 3 | `feature/ui-menu` | csoportos menü, kereső, „Statisztikák és rekordok” nézet, Tervszerkesztő a Tervből | |
| 4 | `feature/ui-sugo` | súgó: „?”, elemi súgó, első-látogatás tipp, tartalom hu/en | |
| 5 | `feature/ui-paritas` | a hiányzó funkciók pótlása a Gym és Family nézetekben (K5), az `workout.prevsets` | |
| 6 | `feature/ui-beallitasok` | nagy kontraszt, csendes órák, JSON export, alapértékek visszaállítása, Kezdőlap gyors betűméret mindenhol | |
| 7 | `feature/ui-onboarding` | szint-választó az első bejelentkezés után, rövid bemutató, a már meglévő UI-választó előtt-után sorrend | |

**Függőségek:** 1 → 2 → 3, 4 és 5 párhuzamos lehetne, de egyszerre egy fázist csinálok. 7 az 1 és 2 után bármikor jöhet. A fázis 5 közben a nyilvántartás „✗” sorai fogynak, a paritás-teszt a végén zöld.

Minden fázis végén: `docs/CHANGES.md` bejegyzés, képernyőképek (360 / 390 / 430, hu és en), a kézi tesztlista telefonra (a T12 pontokkal), megállás és jóváhagyás. Valódi telefont nem tudok tesztelni, ezt minden fázisban jelzem.

## 13. Kockázatok

- **Nagy átnevezés (K6):** minden `?v=` és a CLAUDE.md érintett. Külön commit, a tesztek futtatása előtt és után.
- **Szint-szűrés és meglévő képernyők:** a Közösség, Fotók, Csoportok mind külön képernyőn belüli fülek. A szűrés **fülszinten** is kell (pl. Test és mérések › Fotók csak a 3. szinten látszik), különben a szint nem működik. A nyilvántartás `deep` mezője ezt a fókuszt hordozza.
- **Súgó-szövegek mennyisége:** ~70 funkció × 2 nyelv. A teszt hiányt jelez, de a szöveg-írás (különösen az angol rövid hossz-limit) külön munka.
- **A „két koppintás” szabály és a szint:** a rejtett funkció keresésen át 2 koppintás (menü, találat), de a szint-váltás maga több.
- **Szinkron:** az `opt.level`, `opt.contrast` és társai az `opt` dokumentumban szinkronizálnak (latest-ts wins); két eszközön eltérő szintnél a későbbi nyer. Elfogadott.
