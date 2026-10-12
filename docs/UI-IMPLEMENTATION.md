# UI-implementáció terv: Pro, Gym, Family

Állapot: **jóváhagyásra vár**. Ez csak terv, kódot a jóváhagyás után írok. Minden lépés végén megállok, és megvárom a jóváhagyásodat.

Forrás: `docs/mockups/` (README, `forras/*.dc.html`, `kepek/*.png`, `eszkoz/check_overflow.py`). A stílus kötött: a mockupok maradnak az irányadók.

## 0. Mit találtam (eltérések a feladat leírásától)

1. **A `docs/ROADMAP.md` nincs a repóban**, egyik ágon sincs. A feladat erre hivatkozik (pl. „ROADMAP fázis 2"), de el nem tudtam olvasni. Ha van, add meg vagy másold be, és ellenőrzöm a tervet vele.
2. **Az `index.html` szétbontása már megtörtént** (commit `db93902`): az `index.html` csak a héj (2,4 KB), a stílus a `css/style.css`-ben, a kód 18 klasszikus `js/*.js` fájlban van. A 2. lépés ezért a **meglévő szétbontás ellenőrzése és a témarendszerhez szükséges további bontás** (lásd 3. fejezet), nem újrabontás.
3. **A viewport-meta már tartalmazza a `viewport-fit=cover`-t**, a `css/style.css` pedig már használ `env(safe-area-inset-*)`-t.
4. **A mockupok nem csak megjelenést, hanem tartalmat és működést is mutatnak**, ami most nincs az appban. Ezeket a 9. fejezetben, a nyitott kérdéseknél jelöltem.
5. **A géped nem rendelkezik Pythonnal és Playwrighttal**, ezért a `check_overflow.py` itt nem futtatható. A tervezett ellenőrző böngészőben futó JS (lásd 11. fejezet).
6. **Kontraszt-eltérések a README-hez képest** (általam mérve, WCAG-képlettel):
   - Pro: az akcent `#C2410C` **szövegként** Papíron 4,31:1, Kőn 3,94:1, tehát a 4,5:1 alatt van. A mockupban a menü sorszámai (12 px, akcent színű) emiatt nem felelnek meg. Javaslat: kis akcent-szövegnek külön token, `#A63608` (Papír 5,54:1, Kő 5,07:1, felület 6,16:1). A gombkitöltés (fehér szöveg `#C2410C`-n, 5,18:1) marad.
   - Family: az üres jelölőkör kerete (`#9AA6A0`) a háttéren csak 2,28:1, az UI-elemekre kért 3:1 alatt. Javaslat: `#6F7C76` (3,94:1 a háttéren, 4,36:1 fehéren).
   - A díszítő elválasztók (Pro `#CFCCC4` 1,33:1, Family kártyakeret `#CDD5D0` 1,35:1, Gym `#3A3A35` 1,68:1) nem vezérlők, ezeket nem érinti a 3:1 szabály. A bevitelek, pipák, kapcsolók és gombkeretek igen.

## 1. Kiinduló állapot

- **Megjelenés:** a sötét kinézet az alap. A beállításokban van Kinézet (sötét/világos, `opt.mode`), Téma (4 sötét háttér, `opt.th`) és Kiemelő szín (6 szín, `opt.ac`). Ezek az `html` CSS-változóit (`--a3 --a4 --z7 --z8 --z9 --bg`) és a `.lt` osztályt állítják.
- **Tailwind CDN (3.4.17):** a `zinc-700/800/900/950` és `lime-300/400` színeket a változók adják, a többi Tailwind-szín fix. A képernyők zömmel ezekkel az osztályokkal készültek (`bg-zinc-900`, `border-zinc-800`, `text-lime-400`, `rounded-2xl` stb.).
- **Navigáció:** alsó 5 fülű dock, plusz a „Menü" fül egy 3 oszlopos csempés lap (`MENU` tömb, `go2`). Az `App` komponens egyetlen `tab` állapottal vált képernyőt.
- **Betűk:** Barlow Condensed (címek, `.fd`) és Outfit (szöveg) a Google Fontsról. A service worker (`sw.js`) a hálózat-első stratégiával a fontokat is gyorsítótárazza.
- **Mentés:** az `opt` objektum a `user_data` dokumentum része, ezért **már most szinkronban van a Supabase-szel és a localStorage-ban**. Új adatbázis-változás a megjelenés mentéséhez **nem kell** (lásd 7. fejezet).

## 2. Hatókör

**15 jóváhagyott mockup-képernyő:** minden irányból (Pro, Gym, Family) Kezdőlap, Nyitott menü, Edzés, Beállítások, Töltés. Ezekhez irányonként saját komponens készül.

**Az összes többi képernyő** (Terv, Napló, Étel, Receptek, Test és mérések, Közösség, Ciklus, Profil, Tervszerkesztő, bejelentkezés) nem kap külön mockupot. Ezek a **tokenekből** öröklik a színt, betűt, sarkot, térközt és mozgást, a szerkezetük nem változik. Ezt a hatókört jelöltem nyitott kérdésként is (9. fejezet), mert a végeredményük nem a jóváhagyott mockupok.

| Képernyő | Pro | Gym | Family |
|---|---|---|---|
| Kezdőlap | mockup | mockup | mockup |
| Menü | mockup | mockup | mockup |
| Edzés (`Log`) | mockup | mockup | mockup |
| Beállítások | mockup (felület + színséma), a többi kártya tokenekből | ugyanez | ugyanez |
| Töltés | mockup | mockup | mockup |
| Napló, Terv, Étel, Receptek, Test, Közösség, Ciklus, Profil, Szerkesztő, Bejelentkezés | tokenekből | tokenekből | tokenekből |

## 3. Fájlszerkezet

A mostani szerkezetet megtartom. Új és módosuló fájlok:

```
index.html                 (korai téma-script, betöltési sorrend, a betűk csak a kiválasztott irányhoz töltődnek)
css/style.css              (marad: az "eredeti" kinézet, nem módosul szerkezetében)
css/tokens.css             ÚJ  irányonként és sémánként a változók (szín, betű, sarok, méret, mozgás)
css/base.css               ÚJ  tokenekből alapstílus, Tailwind-osztályok átképzése irányonként
css/motion.css             ÚJ  kulcskeretek, mozgás-tokenek, reduced-motion
css/ui-pro.css             ÚJ  csak a Pro-specifikus (szerkesztőségi lista, tábla)
css/ui-gym.css             ÚJ  csak a Gym-specifikus (csíkos sáv, blokkok, tárcsák)
css/ui-family.css          ÚJ  csak a Family-specifikus (nagy sorok, kerekítés)
js/ui-core.js              ÚJ  UI és színséma állapot, alkalmazás az html elemre, mentés, korai olvasás
js/ui-motion.js            ÚJ  Cnt (count-up), DrawRing/DrawLine (stroke-dashoffset), Check (pipa), stagger segéd, rezgés
js/ui-menu.js              ÚJ  lenyitható menü: sáv + lap, hozzáférhetőség
js/ui-settings.js          ÚJ  UI-váltó kártyák élő előnézettel, színséma-lista, "Vissza az eredeti kinézetre"
js/ui-loader.js            ÚJ  három töltő-animáció
js/ui-pro.js, ui-gym.js, ui-family.js   ÚJ  irányonként Kezdőlap és Edzés komponens (HomePro, LogPro, ...)
js/app.js, workout.js      MÓD a dock és a MENU helyett az új menü, a Home/Log az aktív irány komponensét hívja
js/settings.js             MÓD az új "Felület" kártya a Megjelenés fölé, a régi Kinézet/Téma/Szín az "eredeti" irányban marad
js/i18n-en.js              MÓD minden új szöveg
js/auth.js                 MÓD BUILD
sw.js                      MÓD gyorsítótár-név emelése az új fájlok miatt (nincs előre gyorsítótárazott lista)
```

**A 2. lépés („Szétbontás") konkrétan:** az `index.html`-t nem kell újra bontani. Ellenőrzöm, hogy minden meglévő teszt zöld (`recipes`, `cycle`, `social`), a `node --check` minden `js/*.js`-en átmegy, és az `index.html` betöltési sorrendje helyes. A témarendszerhez a `css/style.css` **tartalmát** kétfelé választom: ami tokenekből jön (szín, betű, sarok), az átkerül a `tokens.css`/`base.css`-be, ami a régi kinézet kiegészítése, az marad. Ezt a 3. lépéssel együtt, a `feature/settings-switch` ágon csinálom, és a végén a régi kinézetnek pixelre azonosnak kell lennie (képernyőkép-összevetés).

## 4. Tokenek

Az irány egy attribútum az `html` elemen: `data-ui="pro|gym|family"` (nincs attribútum = eredeti kinézet), a séma `data-scheme="..."`. A tokenek CSS-változók.

**Szín** (a README táblázata szerint):

| Token | Pro (Papír) | Gym (Sárga) | Family (Zöld) |
|---|---|---|---|
| `--bg` háttér | `#ECEAE5` | `#0F0F0D` | `#F2F4F0` |
| `--surface` | `#F7F6F3` | `#1C1C19` | `#FFFFFF` |
| `--surface2` | `#F7F6F3` (nincs mockup) | `#2B2B27` | `#E6EEEA` |
| `--text` | `#16171A` | `#F3F0E8` | `#1A2420` |
| `--muted` | `#5B5C60` | `#A8A49A` | `#46524D` |
| `--line` | `#CFCCC4` | `#3A3A35` | `#CDD5D0` |
| `--line2` | `#E2DFD8` | `#6E6B65` | `#9AA6A0` |
| `--control-line` (üres jelölő, bevitel, gombkeret) | `#16171A` | `#6E6B65` | `#6F7C76` (javaslat) |
| `--accent` | `#C2410C` | `#FFC93C` | `#0E6B5E` |
| `--on-accent` | `#FFFFFF` | `#0F0F0D` | `#FFFFFF` |
| `--accent-text` (kis szöveg, link) | `#A63608` (javaslat) | = `--accent` | = `--accent` |

**Betű, méret, sarok, érintés:**

| Token | Pro | Gym | Family |
|---|---|---|---|
| `--font-body` | IBM Plex Sans 400/500/600 | Archivo 400/600/800 | Atkinson Hyperlegible 400/700 |
| `--font-head` | IBM Plex Sans 600 | Anton | Atkinson Hyperlegible 700 |
| `--font-mono` | IBM Plex Mono 400/500 | – (Anton a számokhoz) | – |
| `--fs` alap | 15–16 px | 15 px | 20 px |
| `--r-s / --r-m / --r-l` | 4 / 4 / 4 px | 0 | 14 / 16 / 20 px |
| `--tap` min. érintési méret | 44 px | 48 px | 56–64 px |

**A meglévő képernyők átképzése:** a Tailwind-osztályokat nem írom át. A `base.css` irányonként átképzi őket változókra: `bg-zinc-800/900`, `border-zinc-800`, `text-zinc-300/400/500`, `text-lime-300/400`, `bg-lime-400` (a szöveg `--on-accent`), `rounded-xl/2xl/3xl` (`--r-*`), `.fd` (`--font-head`), a `body` (`--font-body`, `--fs`). Az `html{font-size}` a Tailwind `rem` miatt az irány `--fs` értéke, a „Betűméret" beállítással szorozva.

**Mozgás-tokenek** (a 6. fejezet táblázata szerint): `--dur-page --ease-page --page-dy --dur-scrim --dur-sheet --ease-sheet --sheet-dy --dur-row --row-step --row-dx --row-dy --dur-arrow --ease-arrow --dur-press --dur-count --dur-draw --dur-check`. Egyetlen kulcskeret-készlet van, az irányok csak a tokenekben térnek el. Így az animáció nyelve egy helyen állítható.

## 5. Témák és színsémák

Három irány, mindegyikben három séma, plusz az „Eredeti" (a mostani sötét kinézet, ez marad az alap, amíg nincs más kiválasztva).

| Irány | Séma | Háttér | Szöveg | Akcent | Megjegyzés |
|---|---|---|---|---|---|
| Pro | **Papír** (alap) | `#ECEAE5` | `#16171A` | `#C2410C` | szöveg 14,9:1, halvány 5,6:1 |
| Pro | Kő | `#E6E0D4` | `#221E18` | `#C2410C` | szöveg 12,6:1, halvány 5,1:1 |
| Pro | Grafit | `#1B1C1F` | `#ECEAE5` | gomb `#C2410C`, szöveg `#E2622B` | lásd lent |
| Gym | **Sárga** (alap) | `#0F0F0D` | `#F3F0E8` | `#FFC93C` | sötét szöveg rajta 12,5:1 |
| Gym | Narancs | `#0F0F0D` | `#F3F0E8` | `#FF5A1F` | sötét szöveg rajta 6,2:1 |
| Gym | Zöld | `#0F0F0D` | `#F3F0E8` | `#7CFF4F` | sötét szöveg rajta 14,9:1 |
| Family | **Zöld** (alap) | `#F2F4F0` | `#1A2420` | `#0E6B5E` | fehér rajta 6,4:1 |
| Family | Meleg | `#F5EEE4` | `#1A2420` | `#A8481F` | fehér rajta 5,8:1, link 5,05:1 |
| Family | Hűvös | `#EEF2F7` | `#1A2420` | `#1F4E99` | fehér rajta 8,1:1, link 7,16:1 |

**Grafit felületek javaslata** (nincs mockup, ezeket én mértem, jóváhagyásra):

| Token | Érték | Mért kontraszt |
|---|---|---|
| `--bg` | `#1B1C1F` | szöveg `#ECEAE5` rajta 14,17:1 |
| `--surface` | `#232427` | szöveg 12,91:1 |
| `--surface2` | `#2C2D31` | halvány szöveg 5,52:1 |
| `--muted` | `#A3A4A8` | háttéren 6,84:1, felületen 6,23:1 |
| `--line` (díszítő) | `#3A3B40` | 1,52:1 (nem vezérlő) |
| `--control-line` | `#75767C` | háttéren 3,76:1, felületen 3,43:1 |
| `--accent-text` | `#E2622B` | háttéren 4,88:1, **felületen 4,45:1** |

Figyelem: a `#E2622B` akcent-szöveg a `#232427` felületen 4,45:1, a 4,5:1 alatt. Ezért Grafiton kis akcent-szöveg csak a háttéren (`--bg`) állhat, felületen a `--text` színt használom, vagy a szöveg 14 px fölötti és félkövér (nagy szöveg, 3:1 elég). Ezt az ellenőrző is vizsgálja.

**Séma-mentés:** minden irányhoz külön séma tárolódik, az irányváltáskor az adott irány utoljára használt sémája tér vissza.

## 6. Animációk

### Alapelvek (a feladatod szerint)
Eseményhez kötött, képernyőnként legfeljebb egy „hős" animáció, nem blokkolja az érintést, megszakítható, gépelés közben nincs mozgás a beviteli mezőn, csak `transform` és `opacity` (kivétel: SVG `stroke-dashoffset`), `prefers-reduced-motion` alatt nincs mozgás, de az állapot változik.

**Megvalósítás:** CSS-változókkal paraméterezett kulcskeretek (`transform: translateY(var(--page-dy))`), így egy kulcskeret-készlet szolgál mindhárom irányt. A JS-nek csak a count-up (`requestAnimationFrame`) és az osztályváltások maradnak. A megszakíthatóság a `transition`/`animation` természetes viselkedése: új esemény azonnal átveszi. A `pointer-events` sosem kapcsol ki animáció alatt. A menülap nyitás- és zárásához a lap közvetlenül `transform`-ot állít, nem `height`-ot.

### Animációs táblázat

Az „(R)" jelű értékek a README-ből vannak, a többi az én javaslatom, jóváhagyásra.

| Esemény | Pro | Gym | Family | Reduced-motion |
|---|---|---|---|---|
| Karakter | finom, pontos | gyors, csapódó | lassú, egyenletes | – |
| Oldalváltás | opacity + 10 px, 240 ms, `cubic-bezier(.2,.7,.2,1)` (R) | 180 ms, `cubic-bezier(.3,1.5,.5,1)` (R) | 420 ms csúszás, `cubic-bezier(.4,0,.2,1)`, nincs túllendülés (R) | azonnali csere, nincs mozgás |
| Menü háttér | opacity 200 ms (R) | opacity 100 ms (R) | opacity 400 ms (R) | azonnal |
| Menülap nyitás | translateY 12 px + opacity, 280 ms (R) | translateY 48 px, 200 ms, túllendül (R) | translateY 40 px + opacity, 450 ms (R) | azonnal |
| Menülap zárás | fordítva, 180 ms | 140 ms | 300 ms | azonnal |
| Menüsorok | translateY 8 px, 220 ms, 25 ms lépcső (R) | translateX −24 px, 140 ms, 20 ms lépcső (R) | translateY 6 px, 320 ms, 50 ms lépcső (R) | azonnal |
| Menü nyíl | 180° forgás, 240 ms (R) | 180°, 200 ms, túllendül (R) | 180°, 500 ms (R) | fordított állapot, nincs forgás |
| Gombnyomás | scale .97, 120 ms (R) | scale .97, 80 ms + `navigator.vibrate(10)`, ha van (R) | scale .97, 250 ms (R) | nincs scale, a rezgés marad |
| Lista hover | translateX 4 px (R) | – (R) | – (R) | nincs |
| Focus-visible | 2 px akcent kontúr, 2 px távolság | 3 px, 2 px távolság | 3 px, 3 px távolság | nincs átmenet (kontúr marad) |
| UI-váltás | finom áthalványítás, 240 ms | gyors csapódó, 180 ms, túllendül | lassú egyenletes csúszás, 450 ms | azonnali csere |
| Számok (count-up) | 750 ms, ease-out | 600 ms | 900 ms | azonnal a végérték |
| Körgyűrű és grafikon (vonal, `stroke-dashoffset`) | 700 ms, `cubic-bezier(.2,.7,.2,1)` | 500 ms, `cubic-bezier(.2,.9,.2,1)` | 900 ms, `cubic-bezier(.4,0,.2,1)` | azonnal teljes |
| Sorozat kész (pipa) | pipa kirajzolódik 200 ms | 150 ms + scale 1,15 pop | 400 ms, a kör kitöltődik | azonnal kész állapot, visszajelzés szöveggel |
| Lista belépés (lépcsős) | 8 px, 220 ms, 25 ms lépcső | −24 px X, 140 ms, 20 ms | 6 px, 320 ms, 50 ms | azonnal |
| Töltő | vonal kirajzolódik, 1,8 s ciklus (R) | tárcsák becsúsznak, 2,4 s ciklus (R) | lélegző kör, 4 s ciklus (R) | álló kép, felirat marad |
| Pihenő-visszaszámlálás sáv | lineáris, 1 s lépés | lineáris, csíkos sáv | lineáris | lineáris (ez állapot, nem dekoráció) |

### Teljesítmény
Csak `transform` és `opacity` (a `stroke-dashoffset` kivételével), `will-change` csak aktív animáció alatt. A count-up egyetlen `requestAnimationFrame`-ciklus, a szöveg frissítése `textContent`. Gépelés közben a beviteli mezőn nincs animáció (`input:focus` mezőre `transition: none`).

**Amit nem tudok itt mérni:** a „CPU 4× lassítás melletti folyamatos" működést a beépített böngészőből nem lehet szimulálni. Ezt a Chrome DevTools-ban (Performance → CPU: 4× slowdown) vagy a telefonon kell megnézned, a lépésenként megadott kézi lépések szerint.

## 7. Menü (lenyitható)

**Szerkezet:** `UiMenu` komponens. Az összecsukott sáv valódi `<button aria-expanded aria-controls="ui-menu-list">`, a lap `<section role="dialog" aria-label="Menü">`, a lista `<ul id="ui-menu-list" role="list">`. Az alsó dock és a `MENU` csempés lap megszűnik. A sáv a **Kezdőlapon** látszik, más képernyőn a fejlécben lévő vissza-gomb visz haza (a mockupok szerint a menü a kezdőlapról nyílik).

**Hozzáférhetőség:** nyitáskor a fókusz az első pontra kerül, záráskor vissza a sávra, Esc és háttérkoppintás zár, Tab a lapon belül marad (fókuszcsapda), a háttér `inert`/`aria-hidden`. A lista görgethető, a vezérlő fix. `padding-bottom: calc(16px + env(safe-area-inset-bottom))`.

**Méretek irányonként:** Pro: lap teteje 168 px, 42% sötét háttér, számozás 01–10 monospace. Gym: összecsukva 72 px, nyitva 112 px-től, 60% sötét háttér, 56 px-es blokk-sorok, bal oldali színes sáv. Family: összecsukva 80 px, nyitva 52 px-től, 24 px-es felső sarok, minimum 60 px-es sorok, 2 px keret, kör alakú ikonháttér.

**A tíz pont és hova visznek** (a meglévő képernyőkre):

| # | Pont | Meglévő képernyő |
|---|---|---|
| 1 | Edzés | `Log` (az edzés rögzítése) |
| 2 | Terv | `Plan` |
| 3 | Napló | `Hist` |
| 4 | Étel | `Food` (Napló fül) |
| 5 | Receptek | `Food`, Receptek fül (közvetlenül) |
| 6 | Test és mérések | `Tools` (a Kardió/Kalória/Erő/Intervall fülekkel együtt) |
| 7 | Közösség | `Social` |
| 8 | Ciklus | `Cycle`, **csak ha** `cycAvail()` és a funkció be van kapcsolva (`cyc.on`) |
| 9 | Profil | új „Profil" képernyő (lásd nyitott kérdések) |
| 10 | Beállítások | `Opts` |

A Kardió, Kalória, Erő, Intervall, Tervszerkesztő és Export csempék **nem kerülnek a tíz pont közé**. Javaslat: a számolók a „Test és mérések" fülsávjában maradnak, a Tervszerkesztő gombként a Terv képernyőre kerül, az Export már megvan a Beállítások „Adatok" kártyáján.

**Szövegek** (magyar a feladatból, angol az én javaslatom, nyitott kérdés). Az angol leírások nem hosszabbak a magyarnál.

| Pont | Pro (HU / EN) | Gym (HU / EN) | Family (HU / EN) |
|---|---|---|---|
| Edzés | Mai edzés és a gyakorlatok / Today's workout and exercises | Mai edzés, gyakorlatok / Today's workout, exercises | A mai mozgás / Today's movement |
| Terv | Heti és havi terv / Weekly and monthly plan | Heti és havi ciklus / Weekly and monthly cycle | Mi jön a héten / What's coming this week |
| Napló | Korábbi edzések és sorozatok / Past workouts and sets | Mit és mennyit emeltél / What and how much you lifted | Amit már megcsináltál / What you've already done |
| Étel | Kalória és makrók / Calories and macros | Kalória és fehérje / Calories and protein | Mit ettél ma / What you ate today |
| Receptek | Mentett ételek és ötletek / Saved meals and ideas | Mentett ételek / Saved meals | Mentett ételek / Saved meals |
| Test és mérések | Súly, méretek, fotók / Weight, measures, photos | Súly, méretek, rekordok / Weight, measures, records | Súly és méretek / Weight and measures |
| Közösség | Csoportok és kihívások / Groups and challenges | Csoportok, kihívások / Groups, challenges | Barátok, csoportok / Friends, groups |
| Ciklus | Csak ha be van kapcsolva / Only when turned on | Csak ha bekapcsoltad / Only if you turned it on | Ha bekapcsoltad / If you turned it on |
| Profil | Adatok és célok / Details and goals | Adatok és célok / Details and goals | Adataid / Your details |
| Beállítások | Felület, színséma, fiók / Look, color scheme, account | Felület, színek, fiók / Look, colors, account | Betűméret, színek / Text size, colors |

**Ikonok:** a forrásban lévő SVG-útvonalak (`ProMenu`, `GymMenu`, `FamilyMenu`), `viewBox` 24×24, `overflow: visible` csak tesztelve, emoji nincs. Az útvonalakat az `icons.js` mintájára egy `UI_ICONS` objektumba teszem.

## 8. Beállítások

**Felület:** három kártya (Pro, Gym, Family), mindegyiken a **Kezdőlap kicsinyített, valódi renderelése**. Technika: a kártya `container-type: inline-size`, benne a Kezdőlap-komponens egy fix 390 px széles elrendezésben, `transform: scale(...)`-lel a kártya szélességéhez igazítva, vagy a forrásban lévő `cqw`-alapú méretezéssel. Előnézetben nincs interakció (`inert`), nincs animáció és nincs hálózat (mintaadatokkal renderel, a saját adataidat nem használja). Kiválasztáskor azonnali váltás, az átmenet a 6. fejezet szerint.

**Színséma:** az aktív irány három sémája listában, színmintákkal és pipával (a `ProSettings` szerint).

**„Vissza az eredeti kinézetre":** az `ui` és a `scheme` törlése, az eredeti sötét kinézet tér vissza. Amíg nincs választás, az eredeti marad.

**A régi beállítások sorsa:** a Kinézet (sötét/világos), a Téma és a Kiemelő szín az **eredeti** kinézethez tartozik, új irány aktív esetén a színsémák veszik át a szerepüket, ezért ezek a kártyák elrejtődnek. A Nyelv, Betűméret, Animációk és az Edzés kártyák minden irányban megmaradnak. Family-ben a „Betűméret" a menüleírásnak megfelelően hangsúlyos (alap 20 px).

**Mentés:** az `opt` objektumba kerül (`opt.ui`, `opt.scheme`), tehát bejelentkezve a meglévő szinkronnal a Supabase-be (`user_data.opt`) kerül, **nincs szükség SQL-re**. Ezen felül minden változtatáskor tükrözöm a localStorage-ba (`en_ui`, `en_scheme`), hogy a korai script az első festés előtt alkalmazza (nincs villanás), és hogy bejelentkezés előtt (töltő, belépő képernyő) is a választott irány látszódjon. Minden olvasás és írás `try/catch`-ben, letiltott localStorage esetén az alap marad.

## 9. Ikonok és szövegek: védelem a levágás ellen

Ezek a szabályok a mockupok ellenőrzéséből jönnek, és a kódba is bekerülnek:

- **Nem törő szóköz:** egy segéd (`nb()`) a számokhoz és mértékegységekhez („2 × 8", „20 perc", „102,5 kg") és `&#8209;` a „2-ből" alakokhoz, a magyar és angol szövegben is. Az `i18n-en.js` fordításai is ezt használják.
- **Címek:** `overflow-wrap: break-word; min-width: 0`. Az `anywhere` csak olyan helyen, ahol valóban nagyon hosszú szó állhat (pl. felhasználónév).
- **SVG:** minden ikonnak `viewBox` és belső margó a vonalvastagság miatt. A grafikonok `width: 100%; height: auto`.
- **Gombok és linkek:** `box-sizing: border-box` mindkettőre globálisan.
- **Safe-area:** minden fix elemnél (menüsáv, alsó gombok) `env(safe-area-inset-*)`.
- **Family 360 px-en:** a tartalom görgessen, a fix elemek nem nőnek, az illusztráció rugalmas (`flex: 0 1 180px; min-height: 120px`).
- **Szövegek hossza:** minden címnél és gombnál többsoros tördelés megengedett, és a belső térköz nem csökken. Az angol szöveg nem lehet hosszabb a magyarnál; ezt az ellenőrző is méri.

## 10. Lépések, ágak, jóváhagyási kapuk

| # | Lépés | Ág | Kapu |
|---|---|---|---|
| 1 | Ez a terv | `feature/ui-terv` (csak docs) | jóváhagyásod |
| 2 | Szétbontás ellenőrzése, `style.css` kettébontása | `feature/settings-switch` | a régi kinézet pixelre azonos, minden teszt zöld |
| 3 | Témarendszer, tokenek, beállítás-váltó, színsémák | `feature/settings-switch` | jóváhagyás képernyőképekkel |
| 4 | Lenyitható menü (mind a három irányban a tokenekből) | `feature/settings-switch` | jóváhagyás |
| 5 | Pro: Kezdőlap, Edzés, Töltés + tokenekből a többi | `feature/theme-pro` | teszt, jóváhagyás |
| 6 | Gym: ugyanez | `feature/theme-gym` | teszt, jóváhagyás |
| 7 | Family: ugyanez | `feature/theme-family` | teszt, jóváhagyás |

Az ágak a `main`-ről indulnak (az 5–7. az `feature/settings-switch`-ről, mert az alap kell hozzájuk). A `main`-t nem módosítom, push és merge csak kérésedre. Minden téma külön commit-sorozat. Minden commit után `node --check` és a három meglévő teszt.

**Minden fázis végén:** leírom a telefonos kézi tesztlépéseket, és kérek képernyőképeket (valódi eszközön nem tudok tesztelni).

## 11. Tesztlista

**Ellenőrző eszköz.** A `check_overflow.py` Playwrightot igényel, ami a gépen nincs. Írok helyette egy `tests/ui-check.js`-t: ugyanaz a logika (kilógó elem, levágott szöveg, két sorra tört szó), de böngészőben fut, a beépített böngészőpanelből, 360, 390 és 430 px-en. Ha később telepítesz Pythont és Playwrightot, a `check_overflow.py` is használható.

Minden fázisban:

1. Mind a 15 képernyő 360/390/430 px-en: nincs kilógás, nincs levágott szöveg, nincs két sorra tört szó. Magyarul és angolul.
2. Mindhárom irány és mind a 9 séma: a kontrasztok az 5. fejezet szerint (szöveg 4,5:1, nagy szöveg és UI-elem 3:1), az ellenőrző számolja.
3. Oldalváltás, menünyitás, beállítás-váltás: megszakítható (gyors egymás utáni koppintás), az érintés közben nincs blokkolva.
4. `prefers-reduced-motion` bekapcsolva: nincs mozgás, az állapot mégis változik.
5. Mentés: bejelentkezve az `opt` szinkronba kerül, kijelentkezve localStorage-ba, localStorage letiltva esetén nem hibázik.
6. Nyelvváltás magyar és angol között minden képernyőn.
7. A régi (eredeti) kinézet pixelre változatlan, amíg nincs más választva.
8. Billentyűzettel minden elérhető, a menü fókusza helyes, Esc zár.
9. A meglévő tesztek zöldek: `recipes`, `cycle`, `social`.

**Amit nem tudok vállalni:** valódi telefonos teszt, a 4× CPU-lassításos folyamatosság, és a rezgés (Vibration API) tényleges érzete.

## 12. Nyitott kérdések

**A te három kérdésed:**

1. **A Grafit séma felületei és vonalai.** A fenti javaslatot (5. fejezet) mértem, a mockup nincs. Elfogadod, vagy más árnyalatot szeretnél? Figyelem a `#E2622B` akcent-szövegre a felületen (4,45:1).
2. **A Gym és Family menüleírások angol fordítása.** A 7. fejezetben javasoltam az összeset (Pro-t is). Jó így?
3. **A transform/opacity szabály kivétele.** Javaslat: **elfogadni** az SVG `stroke-dashoffset`-et kis grafikonokra, körgyűrűre és a pipára, mert nem okoz újraelrendezést, és a jóváhagyott Pro töltő is ezt használja. Minden más animáció csak `transform` és `opacity`.

**A tervezés közben találtam, ezekhez is döntés kell:**

4. **A mockupok tartalma nem azonos a mostani appéval.** Pro: heti volumen-grafikon és rekordok (e1RM van az appban, ✓). Gym: heti sorozatok izomcsoportonként célértékkel (16/16/14/12), az appban az izomcsoportonkénti 7 napos sorozat megvan, a **cél** nincs, és „NAP 3/5" a tervből jön. Family: „A mai mozgás" pipálható lista, ez a terv mai napjának gyakorlataiból készülne. Javaslat: ezekből készítek tartalmat a meglévő adatokból, a hiányzó célértékeket állítható alapértékkel (16 sorozat) pótolom.
5. **Gym Edzés képernyő:** a tárcsák rajza az „Oldalanként" tárcsakalkulátorra épülhet (az Erő számolóban megvan). **Family Edzés képernyő:** egy gyakorlat egyszerre, illusztrációval és „Hogyan csináljam? Videó" hivatkozással. **Illusztrációk és videók az appban nincsenek.** Javaslat: első változatban illusztráció nélkül, a videó-link a meglévő gyakorlat-információs lapra mutat; a végleges illusztrációkhoz külön forrás kell. Mi legyen?
6. **A leírások olyan funkciókat említenek, amik nincsenek meg:** „fotók" (Test és mérések, Pro), „Csoportok és kihívások" (Közösség; az appban követés, barátok és hírfolyam van, csoport és kihívás nincs), „Mentett ételek" (a receptekben nincs mentés). Javaslat: a szöveg marad úgy, ahogy megadtad, és jelezd, ha át kell írni az igazsághoz, vagy ha ezek a funkciók később jönnek.
7. **Profil képernyő:** a menüben „Profil: Adatok és célok" van. Most nincs önálló Profil képernyő, a profil (nem, kor, magasság, súly, makrócélok) a Kardió/Kalória számolók kártyáján van. Javaslat: új, egyszerű Profil képernyő ugyanezekkel az adatokkal, a Kezdőlap monogram-gombja ide visz.
8. **A régi kinézet sorsa** (8. fejezet): az „eredeti" megmarad, és a régi Kinézet/Téma/Szín kártyák csak ott látszanak. Jó így?
9. **Betűk betöltése:** a mockupok Google Fontsról töltenek (IBM Plex, Anton, Archivo, Atkinson). Az app már most is Google Fontsról tölt. Javaslat: csak a kiválasztott irány betűit töltöm be. Ha szeretnéd, saját tárhelyről is szolgálható (offline és adatvédelmi okból), de az nagyobb letöltés és külön lépés.
10. **A bejelentkező és a „Fiók" képernyők** nincsenek a mockupok között. Javaslat: tokenekből öröklik a kinézetet, mint a többi.
11. **Tailwind CDN marad** (nincs build): az átképzés a `base.css`-ben történik. Kockázat: a CDN-es Tailwind futásidőben generál stílust, ezért a `base.css`-nek `!important` nélkül, magasabb specificitással kell felülírnia az osztályokat (`html[data-ui] .bg-zinc-900`).

## 13. Kockázatok

- A tokenekkel való átképzés a ~20 meglévő képernyőn **nem lesz pixelre azonos** a mockupokkal, mert azok más szerkezetűek. A jóváhagyott 15 képernyő pontos, a többi a stílushoz illeszkedő, de nem mockup-hű. Ezt a 2. fejezet táblázata és a 4. nyitott kérdés is jelzi.
- Három új Kezdőlap és három új Edzés-képernyő sok kód. Ezért menet közben, irányonként, külön ágon, külön jóváhagyással haladok.
- A Family nagy betűmérete (20 px alap) a 360 px-es szélességen tördelést okozhat a meglévő képernyőkön, ezt az ellenőrző minden fázisban méri.

## 14. Döntések és módosítások (a terv jóváhagyása után)

A válaszaid alapján a hatókör **bővül**, a terv fenti része ehhez igazodik:

| # | Döntés | Következmény |
|---|---|---|
| 1 | A mockupokon látható funkciókat meg kell csinálni, és hasznos, működő kiegészítések is jöhetnek | A Kezdőlap, az Edzés és a Beállítások tartalma a mockupokkal azonos, valódi adatokból (rekordok, heti volumen, izomcsoportonkénti heti sorozatok célértékkel, széria, tárcsakalkulátor, lépésenkénti edzésvezetés) |
| 2 | A leírásokban szereplő, de még nem létező funkciókat is meg kell csinálni | Külön **B fázis** (lent): haladási fotók, csoportok és kihívások, mentett ételek |
| 3 | Az SVG `stroke-dashoffset` kivétel elfogadva | Marad a 6. fejezet szerint |
| 4 | A menüben legyen több pont | A tíz pont után további pontok: Számolók, Tervszerkesztő, Export és adatok (lásd lent) |
| 5 | A mockupon kívüli képernyők is legyenek mockup-hűek, egy irány mindenhol ugyanúgy néz ki | A „csak tokenekből örökölnek" megoldás **nem elég**. Közös **komponens-készlet** készül (kártya, szakasz, lista-sor, gomb, bevitel, szegmens, kapcsoló, fül, cím, mutató, grafikon), amelyet minden irány saját megjelenéssel valósít meg, és minden meglévő képernyő erre épül át |
| 6 | A Közösség fül (amit eddig elkészítettünk) kerüljön be | A Közösség menüpont a meglévő Hírfolyam / Kapcsolatok / Profil képernyőkre mutat, és ezek a komponens-készletre épülnek át. Ide kerülnek a csoportok és kihívások is |
| 7 | Python és Playwright | **Nem kell telepíteni.** A `tests/ui-check.js` a beépített böngészőben fut. Ha később mégis szeretnéd a `check_overflow.py`-t, akkor érdemes, de ehhez a munkához nem szükséges |

**Új menüpontok** (a tíz pont után, a sorszámozás folytatódik, a Ciklus továbbra is feltételes):

| # | Pont | Meglévő képernyő | Pro | Gym | Family |
|---|---|---|---|---|---|
| 11 | Számolók | `Tools` (Kardió, Kalória, Erő, Intervall fülekkel) | Kardió, kalória, erő, intervall | Kardió, kalória, erő | Kalória és kardió |
| 12 | Tervszerkesztő | `Editor` | Saját edzések szerkesztése | Saját edzések | Saját edzéseid |
| 13 | Export és adatok | `Opts` Adatok kártya | CSV, PDF, mentés | Export, mentés | Adataid mentése |

Angol: *Cardio, calories, strength, interval / Cardio, calories, strength / Calories and cardio*; *Edit your workouts / Your workouts / Your workouts*; *CSV, PDF, backup / Export, backup / Save your data*.

**Komponens-készlet (a „mockup-hű mindenhol" alapja):** a közös segédkomponensek (`Cd`, `Lb`, `Sw`, `Sg`, `F`, `R`, `Ring`, `Bars`, a bevitel-stílus, a fejlécek) és a gyakori nyers Tailwind-minták (kártya, gomb, szegmens, lista-sor) egy `ui-*` osztálykészletre épülnek, amelyet a `css/ui-pro.css`, `ui-gym.css`, `ui-family.css` irányonként definiál. A mockupokból vett mintákat követem: Pro lapos szakaszok és vékony elválasztók, négyzetes sarok, mono számok. Gym tömör blokkok, csíkos jelzősáv, nagybetűs Anton cím, éles sarok. Family fehér kártya 2 px kerettel, nagy sarok, nagy érintési felület. Az átépítés képernyőnként történik, minden képernyő a saját irányában ellenőrizve (360/390/430 px).

**Fázisok (módosított sorrend):**

| Fázis | Tartalom | Ág |
|---|---|---|
| A1 | Témarendszer, tokenek, váltó, színsémák (2–3. lépés) | `feature/settings-switch` |
| A2 | Lenyitható menü (4. lépés) | `feature/settings-switch` |
| A3 | Komponens-készlet és a meglévő képernyők átépítése | `feature/settings-switch` |
| A4–A6 | Pro, Gym, Family: Kezdőlap, Edzés, Töltés a mockup szerint + a többi képernyő finomítása | `feature/theme-pro`, `-gym`, `-family` |
| B1 | Mentett ételek (kedvencek, saját étel) | `feature/mentett-etelek` |
| B2 | Haladási fotók (Supabase Storage + RLS, `supabase/progress_photos.sql`) | `feature/fotok` |
| B3 | Csoportok és kihívások (Supabase táblák + RLS, `supabase/social_4_groups.sql`) | `feature/csoportok` |

Minden fázis végén megállok, és jóváhagyást kérek. A B2 és B3 adatbázis-változása csak SQL-fájlban lesz, amit te futtatsz le. A B3 a közösségi 5. lépéshez (jelentés és tiltás) kapcsolódik: a csoportok tartalma jelenthető kell legyen, ezért javaslom, hogy az 5. lépés előbb készüljön el.
