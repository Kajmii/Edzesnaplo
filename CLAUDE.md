# Edzésnapló

Egyetlen `index.html`, React + htm + Tailwind CDN-ről, build nélkül.

## Backend

Supabase. Az URL és az anon kulcs az `index.html`-ben van (ez publikus, nem titok).

- Belépés: e-mail + jelszó, Google.
- Adattábla: `user_data`.
- RPC-k: `delete_my_account`, `put_handoff`, `take_handoff`.

## Kiadás

- GitHub Pages: kajmii.github.io/Edzesnaplo/
- Android APK: Capacitor, a `server.url` a Pages-re mutat, ezért az `index.html` frissítése elég.
- Windows: Electron (`build-exe.yml`).

## Szabályok

- Minden új magyar szöveghez angol fordítás kell a `setDict(...)`-ben.
- Módosítás után `node --check` a script-blokkon.
- Supabase-változtatás csak SQL-fájlban (`supabase/*.sql`) legyen. A felhasználó maga futtatja a Supabase SQL Editorban, te ne próbáld futtatni.
- Commit és push csak kérésre.
- A felhasználó magyarul ír, Androidon (Galaxy S26 Ultra) teszteli. A lépések legyenek egyszerűek.
- Valódi eszközön nem tudsz tesztelni, ezt mindig jelezd.
- A Google-belépés APK-ban Chrome-on és adatbázisos átadáson (handoff) keresztül működik. Ezt ne bontsd le, amíg nincs jó ok.
- Aktuális build: 12okt-8, a belépés működik.
