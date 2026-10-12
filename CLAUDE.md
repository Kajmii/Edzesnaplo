# Edzésnapló

React + htm + Tailwind CDN-ről, build nélkül. Az `index.html` csak a héj, a kód klasszikus `<script src>` fájlokban van.

## Fájlszerkezet

A fájlok közös globális scope-ban futnak (nem modulok), a betöltési sorrend az `index.html`-ben számít:
`vendor` (React, ReactDOM, htm) → `i18n` → `i18n-en` (a `setDict` szótár) → `icons` → `data` (gyakorlatok, tervek) → `util` → `auth` (Supabase, session, handoff, szinkron, `Root`) → `workout` (kezdőlap, edzés, előzmények, terv, szint, szerkesztő, export) → `tools` (kardió, kalória, erő, intervall, test) → `settings` → `food` → `app` (`App` + render). A stílus a `css/style.css`-ben van.

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

## Szabályok

- Minden új magyar szöveghez angol fordítás kell a `setDict(...)`-ben.
- Módosítás után `node --check` minden módosított `js/*.js` fájlon.
- Supabase-változtatás csak SQL-fájlban (`supabase/*.sql`) legyen. A felhasználó maga futtatja a Supabase SQL Editorban, te ne próbáld futtatni.
- Commit és push csak kérésre.
- A felhasználó magyarul ír, Androidon (Galaxy S26 Ultra) teszteli. A lépések legyenek egyszerűek.
- Valódi eszközön nem tudsz tesztelni, ezt mindig jelezd.
- A Google-belépés APK-ban Chrome-on és adatbázisos átadáson (handoff) keresztül működik. Ezt ne bontsd le, amíg nincs jó ok.
- Aktuális build: 12okt-8, a belépés működik.
