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
// A keresésből megnyitott funkció az aktuális szinttől függetlenül látszik, amíg az a képernyő nyitva van (go2 állítja)
let LVL_FORCE='';
const lvlForce=id=>{LVL_FORCE=id||''};
// a kényszerített funkció almenü-fókusza az adott képernyőn (pl. Közösség › Csoportok), különben ''
const navFocus=tab=>{const f=featById(LVL_FORCE);return f&&f.tab===tab?f.focus:''};
// látszik-e a funkció az aktuális szinten (force: a hívó már tudja, hogy ide navigáltak)
const lvlOn=(id,force)=>{const f=featById(id);return !f||!!force||id===LVL_FORCE||f.level<=lvlOf()};
// hány keresésből elérhető funkció rejtett az aktuális szinten
const lvlHidden=()=>FEATURES.filter(f=>featFindable(f)&&f.level>lvlOf()).length;
// Kezdőlap-kártyák: a szint csak az alapot adja (K4): Csak a lényeg = napsor, Ajánlott = + az irány fő kártyája, Minden = az összes
const HOME_MAIN={pro:'home.volume',gym:'home.groups',family:'home.easy'};
const homeOn=(id,ui)=>{const l=lvlOf();return l>=3||id==='home.week'||(l===2&&HOME_MAIN[ui]===id)};
