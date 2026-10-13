# Edzésnapló

React + htm + Tailwind CDN-ről, build nélkül. Az `index.html` csak a héj, a kód klasszikus `<script src>` fájlokban van.

## Fájlszerkezet

A fájlok közös globális scope-ban futnak (nem modulok), a betöltési sorrend az `index.html`-ben számít:
`vendor` (React, ReactDOM, htm) → `i18n` → `i18n-en` (a `setDict` szótár) → `icons` → `data` (gyakorlatok, tervek) → `util` → `auth` (Supabase, session, handoff, szinkron, `Root`) → `workout` (kezdőlap, edzés, előzmények, terv, szint, szerkesztő, export) → `tools` (kardió, kalória, erő, intervall, test) → `settings` → `food` → `app` (`App` + render). A stílus a `css/style.css`-ben van.

- Téma: a sötét az alap. A világos mód az `html.lt` osztály (`opt.mode`, `localStorage` `en_mode`), a kinézete a `css/style.css` végi `.lt` szabályokból jön; új szín-osztály vagy keménykódolt szín esetén ott is kell hozzá szabály.
- Új függvény a témájához illő fájlba kerüljön. Ugyanazt a nevet két fájlban nem szabad `const`/`let`-tel deklarálni.
- A `<script>` és a `<link>` címekben a `?v=` a `BUILD` értékét követi (`js/auth.js`). A `BUILD` emelésekor az `index.html` összes `?v=` értékét is frissíteni kell.

## Backend

Supabase. Az URL és az anon kulcs a `js/auth.js`-ben van (ez publikus, nem titok).

- Belépés: e-mail + jelszó, Google.
- Adattábla: `user_data`.
- RPC-k: `delete_my_account`, `put_handoff`, `take_handoff`.

## Kiadás

- GitHub Pages: kajmii.github.io/Edzesnaplo/
- Android APK: Capacitor, a `server.url` a Pages-re mutat, ezért a Pages-re feltöltött fájlok frissítése elég.
- Windows: Electron (`build-exe.yml`).

## Munkafolyamat

- Minden új funkciót külön ágon készíts (`feature/...`). A fő ágat (`main`) ne módosítsd, amíg a felhasználó nem hagyja jóvá.
- A felhasználó telefonon teszteli. Az előnézeti linket vagy a helyi szervert a felhasználó kéri, te ne próbálj publikálni.
- Push és merge csak a felhasználó kérésére történhet, mert a GitHub Pages és az APK azonnal frissül.
- Supabase-változtatás csak SQL-fájlban legyen (`supabase/*.sql`), és csak utána kerülhet élesbe a kód. A felhasználó engedélyezte (2026-10-14), hogy az új vagy módosított SQL-t én futtassam a beépített böngészőben megnyitott Supabase SQL Editorban: új lekérdezés (+), tartalom betöltése (Monaco: `window.monaco.editor.getModels()[0].setValue(...)`), Save, Run, a "destructive operations" figyelmeztetésnél Run query (csak ha a szkript nem töröl adatot, csak a saját szabályait építi újra), végül csak-olvasó ellenőrző lekérdezés. Csak a projektben lévő, a felhasználó által látott `supabase/*.sql` fájlokat futtasd, mást ne.
- Minden működő funkció után javasolj commitot. A commit üzenete legyen rövid, magyarul.
- Ha egy funkció nem működik, ne próbálj több változtatást egyszerre javítani. Írd le a hibát, és kérdezd meg, mit csináljunk.

## Szabályok

- Minden új magyar szöveghez angol fordítás kell a `setDict(...)`-ben.
- Módosítás után `node --check` minden módosított `js/*.js` fájlon.
- Supabase-változtatás csak SQL-fájlban (`supabase/*.sql`) legyen; a futtatásról lásd a Backend szakaszt (a böngészős SQL Editorban én futtatom).
- Commit és push csak kérésre.
- A felhasználó magyarul ír, Androidon (Galaxy S26 Ultra) teszteli. A lépések legyenek egyszerűek.
- Valódi eszközön nem tudsz tesztelni, ezt mindig jelezd.
- A Google-belépés APK-ban Chrome-on és adatbázisos átadáson (handoff) keresztül működik. Ezt ne bontsd le, amíg nincs jó ok.
- Aktuális build: 13okt-3, a belépés működik.
- Receptek: adatok a js/recipes*.js fájlokban (alapanyagok `ig(...)`, receptek `rc(...)`, a makrók az alapanyag-grammokból számolódnak, nyers tömegekkel), felület a js/recipes-ui.js-ben. Új recept után: `node tests/recipes.check.js`.
- Ciklus-követés (js/cycle.js): csak nőknek (`prof.sexSel` + `prof.sex==='f'`), alapból kikapcsolva, az adat csak helyben van (`cyc` kulcs), NEM megy a szinkronba/Supabase-be; eszközök közt export/import fájl viszi át. Teszt: `node tests/cycle.check.js`.
- Közösség (js/social.js, supabase/social_*.sql, terv: docs/social-1-adatmodell.md): a jogosultságot az RLS adja, a kliens csak anon kulcsot használ. A Supabase SQL-t a felhasználó futtatja, előbb az SQL, csak utána kerülhet élesbe a kód. Teszt: `node tests/social.check.js`.
- UI-irányok (Pro, Gym, Family): terv docs/UI-IMPLEMENTATION.md, mockupok docs/mockups/. Tokenek: css/tokens.css (R G B hármasok, a tests/ui.check.js a kontrasztot is számolja), css/base.css, css/motion.css, css/ui-switch.css; állapot js/ui/core.js (opt.ui, opt.schemes), váltó js/ui/settings.js, előnézetek js/ui/previews.js (generált a mockupból). Elrendezés-ellenőrző: tests/ui-check.js (böngészőben, uiCheck(), 360/390/430 px). A korai script az index.html-ben függvénybe van zárva (a globális var ütközne a util.js const-jaival).
- Haladási fotók (js/photos.js, supabase/progress_photos.sql): privát Supabase Storage tároló, a fotó alapból csak a tulajdonosé; fotónként megosztható (privát profilnál a barátoknak, nyilvánosnál a profilt láthatóknak, social_can_view). A kliens kicsinyít (1280 px + 320 px bélyeg). Teszt: node tests/photos.check.js. A SQL-t a felhasználó futtatja. Mentett ételek: prof.fav (a prof része, szinkronizál), js/food.js.
- Csoportok és kihívások (js/social-groups.js, supabase/social_4_groups.sql): meghívó kódos csoport (a kódot csak a tulajdonos kapja RPC-vel), 30 tag, ranglista a tagok megosztott edzéseinek összesítéséből (security definer RPC). Sorrend: social_1 -> social_2 -> social_2b -> social_4_groups -> (később) social_3_moderation; a moderáció a social_is_blocked-ot cseréli. Teszt: node tests/groups.check.js.
- Jelentés és tiltás (js/social-mod.js, supabase/social_3_moderation.sql): a tiltás kétirányú és a szerver őrzi (social_is_blocked), a tiltott fél számára a tiltó "nem található"; a jelentett tartalmat a jelentő nem látja (helyben tárolt lista + saját jelentések); a jelentéseket SQL-ből kezeli az üzemeltető. Kézi tesztlista két fiókkal: docs/social-teszt.md. Teszt: node tests/moderation.check.js.
- Navigáció: az alsó dock megszűnt; a Kezdőlapon menüsáv (js/ui/menu.js, css/ui-menu.css), más képernyőn UiHeader (vissza = Kezdőlap nyitott menüvel). Az eredeti kinézet kikerült: opt.ui alapja a Pro (Papír). A menüpontok a UI_MENU-ben vannak (a nyilvántartásból, csoportokra bontva, fix lábsorral és kereséssel: js/features/search.js, teszt tests/search.check.js), a tests/ui.check.js ellenőrzi a fordításokat és a hosszakat (leírás: Pro 40, Gym 38, Family 28 karakter).
- Szintek (js/features/levels.js, Beállítások › Szint): `opt.lvl` + `opt.lvlSet`; a szint csak a látható tartalmat szabja (a funkció szintje a js/features/registry.js-ben), adat nem törlődik. Új szűrt rész: `lvlOn('funkció.azonosító')`; Kezdőlap-kártya: `homeOn(id, ui)`. Amíg a felhasználó nem választott, a Minden szint él. Teszt: node tests/levels.check.js.
- Súgó (js/features/help.js, js/ui/help.js, css/ui-help.css): minden funkcióhoz bejegyzés (kulcs: a nyilvántartás azonosítója, mezők: mi ez, hogyan, tipp, megnyugtató mondat); az angol a js/i18n-en.js-ben. Fejléc "?", HelpI ("i"), HelpCalm, HelpTip, Súgó-képernyő. Új funkció = nyilvántartás + súgó-bejegyzés + angol szöveg. Teszt: node tests/help.check.js.
- Közös elemkészlet (js/ui/kit.js, css/ui-kit.css, teszt: node tests/ui-kit.check.js): KSec, KCard, KRow, KBtn, KField/KSel, KSeg, KSw, KStat, KChip, KTabs, KStep, KEmpty, KBusy (töltés animációval), KSheet (alsó lap), KDel (kétlépcsős törlés). Új képernyő ezekből épüljön, ne Tailwind-színosztályokból; a régi Cd, Lb, Sw, Sg, F, Sl, R is ezekre épül. A betűméretek az irányok közt azonosak, a színek csak tokenekből jönnek.
- Kezdőlap és Edzés (Pro, Gym, Family): js/ui/home.js, js/ui/workout.js, számítások js/ui/data.js (tests/ui-data.check.js), töltők js/ui/loader.js. A vendor htm-szerű sablon NEM támogatja a ...${props} szórást: komponenst h(Komp,props)-szal hívj.
