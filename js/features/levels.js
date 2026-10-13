/* ---------- Szintek: Csak a lényeg (1), Ajánlott (2), Minden (3) ----------
   A szint a LÁTHATÓ tartalmat szabja (menü, Kezdőlap-kártyák, részek a képernyőkön); adat nem vész el, a funkció szintjét a
   nyilvántartás (registry.js) adja. Terv: docs/UI-IMPLEMENTATION.md 5. fejezet.
   opt.lvl = a választott szint, opt.lvlSet = a felhasználó már választott. Amíg nem választott (meglévő felhasználók, K3),
   a Minden szint él, hogy semmi ne tűnjön el. A rejtett funkció keresésből/force-szal mindig megnyitható. */
const LEVELS=[
 [1,'Csak a lényeg','Edzés, Terv, Napló, Profil és Beállítások. A többi rejtve marad.'],
 [2,'Ajánlott','Ezen felül Étel, mérések és több részlet az edzés közben.'],
 [3,'Minden','Minden funkció látszik, semmi sincs elrejtve.']];
const lvlOf=opt=>{const o=opt||(typeof OPT!=='undefined'?OPT:null)||{};return o.lvlSet&&[1,2,3].includes(o.lvl)?o.lvl:3};
// látszik-e a funkció az aktuális szinten (force: a felhasználó kifejezetten ide navigált, pl. a menüből)
const lvlOn=(id,force)=>{const f=featById(id);return !f||!!force||f.level<=lvlOf()};
const lvlHidden=()=>FEATURES.filter(f=>f.level>lvlOf()).length;
// Kezdőlap-kártyák: a szint csak az alapot adja (K4): Csak a lényeg = napsor, Ajánlott = + az irány fő kártyája, Minden = az összes
const HOME_MAIN={pro:'home.volume',gym:'home.groups',family:'home.easy'};
const homeOn=(id,ui)=>{const l=lvlOf();return l>=3||id==='home.week'||(l===2&&HOME_MAIN[ui]===id)};
