# UI-mockupok: Pro, Gym, Family

Ez a mappa a három jóváhagyott UI-irány referenciája. A stílus kötött: a megvalósítás ezeket kövesse.

- `forras/`: a mockupok forrása (`.dc.html`). Pontos színek, betűk, méretek és animációk innen olvashatók. A `{{accent}}` helyőrző a kiemelőszín, az alapértéke a fájl végén lévő `data-props` „default” mezőjében van.
- `kepek/`: 390 px széles renderek, 2× felbontásban. **A betűtípusok helyettesítők** (a renderelő gép nem érte el a Google Fonts-ot). Az elrendezés és a tördelés jó, a betűformák nem pontosak. A pontos betűk a forrásban vannak.
- `eszkoz/check_overflow.py`: Playwright-szkript. 360, 390 és 430 px-en jelzi a kilógó elemeket, a levágott szöveget és a két sorra tört szavakat.

## Képernyők

| Irány | Képernyő | Forrás | Kép |
|---|---|---|---|
| Pro | Kezdőlap (összecsukott menüvel) | `forras/Main.dc.html` | `kepek/pro-1-kezdolap.png` |
| Pro | Kezdőlap, nyitott menü | `forras/ProMenu.dc.html` | `kepek/pro-2-menu.png` |
| Pro | Edzés | `forras/ProWorkout.dc.html` | `kepek/pro-3-edzes.png` |
| Pro | Beállítások | `forras/ProSettings.dc.html` | `kepek/pro-4-beallitasok.png` |
| Pro | Töltés | `forras/ProLoader.dc.html` | `kepek/pro-5-toltes.png` |
| Gym | Kezdőlap (összecsukott menüvel) | `forras/GymHome.dc.html` | `kepek/gym-1-kezdolap.png` |
| Gym | Kezdőlap, nyitott menü | `forras/GymMenu.dc.html` | `kepek/gym-2-menu.png` |
| Gym | Edzés | `forras/GymWorkout.dc.html` | `kepek/gym-3-edzes.png` |
| Gym | Beállítások | `forras/GymSettings.dc.html` | `kepek/gym-4-beallitasok.png` |
| Gym | Töltés | `forras/GymLoader.dc.html` | `kepek/gym-5-toltes.png` |
| Family | Kezdőlap (összecsukott menüvel) | `forras/FamilyHome.dc.html` | `kepek/family-1-kezdolap.png` |
| Family | Kezdőlap, nyitott menü | `forras/FamilyMenu.dc.html` | `kepek/family-2-menu.png` |
| Family | Edzés | `forras/FamilyWorkout.dc.html` | `kepek/family-3-edzes.png` |
| Family | Beállítások | `forras/FamilySettings.dc.html` | `kepek/family-4-beallitasok.png` |
| Family | Töltés | `forras/FamilyLoader.dc.html` | `kepek/family-5-toltes.png` |

## Menü

Az alsó füles navigáció megszűnik. Helyén a kezdőlap alján egy **menüsáv** van (összecsukva). Rákoppintva alulról **felnyíló lap** jön fel a kezdőlap fölé, elsötétített háttérrel. A lap teteje ugyanaz a vezérlő, nyitott állapotban.

- Tíz pont, ebben a sorrendben: Edzés, Terv, Napló, Étel, Receptek, Test és mérések, Közösség, Ciklus (csak ha be van kapcsolva), Profil, Beállítások.
- Minden sor: SVG ikon, cím, egysoros leírás. A leírások irányonként eltérnek, a forrásban vannak.
- A mockupban a vezérlő `<a role="button">`, hogy a vásznon kattintható legyen. **A megvalósításban valódi `<button aria-expanded aria-controls>`.**
- A lista görgethető (`overflow-y: auto`), a vezérlő fix marad. Alul `padding-bottom: calc(16px + env(safe-area-inset-bottom))`.
- Bezárás: a vezérlő, a háttérre koppintás és az Esc. Nyitáskor a fókusz az első menüpontra kerül, záráskor vissza a menüsávra.

## Beállítások

- **Felület:** három kártya (Pro, Gym, Family), mindegyiken a kezdőlap kicsinyített képe. A forrásban kézzel rajzolt kicsinyítés van `container-type: inline-size` és `cqw` egységek használatával, így bármilyen szélességen arányos marad. Választáskor azonnal vált.
- **Színséma:** irányonként három (lent).
- **„Vissza az eredeti kinézetre”:** amíg nincs választás, a jelenlegi sötét kinézet marad. Ez a gomb oda állít vissza.
- Mentés: Supabase profil, ha be van jelentkezve, különben localStorage. Minden olvasás és írás try/catch-ben.

## Tokenek

| Token | Pro | Gym | Family |
|---|---|---|---|
| háttér | `#ECEAE5` | `#0F0F0D` | `#F2F4F0` |
| felület | `#F7F6F3` | `#1C1C19` | `#FFFFFF` |
| felület 2 | – | `#2B2B27` | `#E6EEEA` (ikonkör) |
| szöveg | `#16171A` | `#F3F0E8` | `#1A2420` |
| halvány szöveg | `#5B5C60` | `#A8A49A` | `#46524D` |
| vonal | `#CFCCC4` | `#3A3A35` | `#CDD5D0` |
| halvány vonal | `#E2DFD8` | `#6E6B65` | `#9AA6A0` |
| akcent (alap) | `#C2410C` | `#FFC93C` | `#0E6B5E` |
| betű | IBM Plex Sans 400/500/600 + IBM Plex Mono 400/500 | Anton + Archivo 400/600/800 | Atkinson Hyperlegible 400/700 |
| alap betűméret | 15–16 px | 15 px, címek Anton | 20 px |
| sarok | 4 px | 0 | 14–20 px |
| min. érintési méret | 44 px | 48 px | 56–64 px |

## Színsémák

Mért WCAG-kontraszt. A cél: normál szöveg 4,5:1, nagy szöveg és UI-elem 3:1.

**Pro** (egy akcent, `#C2410C`; fehér szöveg rajta 5,2:1)

| Séma | Háttér / szöveg | Szöveg | Halvány szöveg |
|---|---|---|---|
| Papír (alap) | `#ECEAE5` / `#16171A` | 14,9:1 | 5,6:1 |
| Kő | `#E6E0D4` / `#221E18` | 12,6:1 | 5,1:1 |
| Grafit (sötét) | `#1B1C1F` / `#ECEAE5` | 14,2:1 | 6,8:1 (`#A3A4A8` javasolt) |

Figyelem: Grafiton az akcent **szövegként csak 3,3:1**. Gombkitöltésnek fehér felirattal jó, de akcentszínű szövegre és vékony vonalra Grafiton `#E2622B` kell (4,9:1). A Grafit felület- és vonalszíneihez nincs külön mockup, ezeket a tervben kell javasolni.

**Gym** (kiemelőszín; sötét szöveg rajta)

| Séma | Szín | `#0F0F0D` rajta |
|---|---|---|
| Sárga (alap) | `#FFC93C` | 12,5:1 |
| Narancs | `#FF5A1F` | 6,2:1 |
| Zöld | `#7CFF4F` | 14,9:1 |

**Family** (meleg vagy hűvös; fehér szöveg az akcenten)

| Séma | Háttér / akcent | Fehér az akcenten | Akcent mint link | Halvány szöveg |
|---|---|---|---|---|
| Zöld (alap) | `#F2F4F0` / `#0E6B5E` | 6,4:1 | 5,8:1 | 7,4:1 |
| Meleg | `#F5EEE4` / `#A8481F` | 5,8:1 | 5,0:1 | 7,1:1 |
| Hűvös | `#EEF2F7` / `#1F4E99` | 8,1:1 | 7,2:1 | 7,3:1 |

## Animációk

A mockupokban szereplő értékek. Mindegyik `@media (prefers-reduced-motion: reduce)` alatt kikapcsol: állapotváltás van, mozgás nincs.

| Elem | Pro | Gym | Family |
|---|---|---|---|
| Karakter | finom, pontos | gyors, csapódó | lassú, egyenletes |
| Oldalváltás | áthalványítás + 8–12 px elmozdulás, ~240 ms, `cubic-bezier(.2,.7,.2,1)` | 160–200 ms, túllendülő `cubic-bezier(.3,1.5,.5,1)` | 400–450 ms csúszás, `cubic-bezier(.4,0,.2,1)`, nincs túllendülés |
| Menü háttér | opacity, 200 ms | opacity, 100 ms | opacity, 400 ms |
| Menülap | translateY 12 px + opacity, 280 ms | translateY 48 px, 200 ms, túllendül | translateY 40 px + opacity, 450 ms |
| Menüsorok (lépcsőzetes) | translateY 8 px, 220 ms, 25 ms lépcső | translateX −24 px, 140 ms, 20 ms lépcső | translateY 6 px, 320 ms, 50 ms lépcső |
| Nyíl | 180° forgás, 240 ms | 180° forgás, 200 ms, túllendül | 180° forgás, 500 ms |
| Gombnyomás | scale .97, 120 ms | scale .97, 80 ms + `navigator.vibrate(10)`, ha van | scale .97, 250 ms |
| Lista hover | translateX 4 px | – | – |
| Töltő | vonal kirajzolódik, 1,8 s ciklus | tárcsák becsúsznak, 2,4 s ciklus | lélegző kör, 4 s ciklus |

**Döntés kell:** a „csak transform és opacity” szabály nem teljesíthető a vonal kirajzolásánál és a körgyűrű feltöltésénél. A jóváhagyott Pro töltő is `stroke-dashoffset`-et használ. Javaslat: kivétel az SVG `stroke-dashoffset`-re kis grafikonokon, mert ez nem okoz újraelrendezést.

## Szabályok, amelyek az ellenőrzésből jöttek

Ezek a hibák a mockupok ellenőrzésekor tényleg előjöttek, és javítva vannak. A megvalósításban is figyelni kell rájuk.

1. **`overflow-wrap: anywhere` ikon vagy pipa mellett szétvágja a szót** („Famil / y”), mert a flexbox összenyomja. Címekhez `overflow-wrap: break-word` és `min-width: 0` kell. Az `anywhere` csak olyan helyen jó, ahol tényleg nagyon hosszú szó állhat.
2. **Szám és mértékegység nem válhat el:** `2&nbsp;×&nbsp;8`, `20&nbsp;perc`, `102,5&nbsp;kg`. A „2-ből” típusú alakokban nem törő kötőjel kell (`&#8209;`), különben „2- / ből” lesz belőle. Ez a fordításokban is így legyen.
3. **Fix szélességű SVG (pl. `width="326"`) 360 px-en kilóg.** A grafikonok `viewBox` mellett `width: 100%; height: auto` beállítással méreteződjenek.
4. **`<a>` és `<button>` eltérő box-sizing:** a gomb alapból `border-box`, a link nem. 100% szélesség és belső margó esetén `box-sizing: border-box` kell, különben kilóg.
5. **Safe-area:** az `env(safe-area-inset-*)` csak akkor működik, ha a viewport-meta tartalmazza: `viewport-fit=cover`. Ezt ellenőrizni kell az `index.html`-ben.
6. **Family 360 px-en szoros:** a tartalom görgessen, a fix elemek (menüsáv, alsó gombok) ne nőjenek. Az illusztráció rugalmas magasságú (`flex: 0 1 180px; min-height: 120px`).
7. **Rövid kiírások:** a leírások irányonként rövidítve vannak, a Family a legrövidebb. Az angol fordítás se legyen hosszabb, különben 360 px-en eltörik.
