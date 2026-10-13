// Onboarding (7. fázis): szint-választó, bemutató, Kezdőlap tartalma. Futtatás: node tests/onboarding.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let dict;new Function('setDict',rd('js/i18n-en.js'))(d=>{dict=d});
const ob=rd('js/ui/onboarding.js'),app=rd('js/app.js'),home=rd('js/ui/home.js'),idx=rd('index.html');
const mk=OPT=>new Function('OPT',rd('js/features/registry.js')+';'+rd('js/features/levels.js')+';'+ob.slice(ob.indexOf('const LEVEL_SUB'),ob.indexOf('// teljes képernyős réteg'))+';'+ob.slice(ob.indexOf('const HOME_CARDS'),ob.indexOf('const homeCardsOpen'))+';return{FEATURES,LEVELS,LEVEL_SUB,LEVEL_PTS,lvLater,TOUR,HOME_CARDS,homeOn}')(OPT);
const A=mk({});
// 1. "Később": új felhasználónak Ajánlott, meglévőnek Minden (semmi nem tűnik el, K3)
assert.strictEqual(A.lvLater(true),2);assert.strictEqual(A.lvLater(false),3);
// 2. a szint-kártyák: mindhárom szintnek van mondata és 4 pontja, angolul is; a bemutató 3 lépés
for(const[v]of A.LEVELS){assert.ok(dict[A.LEVEL_SUB[v]]!==undefined,'nincs angol mondat: '+v);assert.strictEqual(A.LEVEL_PTS[v].length,4);for(const t of A.LEVEL_PTS[v]){assert.ok(dict[t]!==undefined,'nincs angol pont: '+t);assert.ok(t.length<=45&&dict[t].length<=50,'túl hosszú pont: '+t)}}
assert.strictEqual(A.TOUR.length,3);for(const[ic,t,p]of A.TOUR){assert.ok(dict[t]!==undefined&&dict[p]!==undefined,'nincs angol bemutató-szöveg: '+t);assert.ok(/^[a-z]+$/.test(ic));assert.ok(p.length<=130&&dict[p].length<=140,'túl hosszú bemutató-szöveg: '+t)}
for(const t of ['Mennyi funkciót szeretnél látni?','Válaszd ki, mennyit szeretnél látni','Eddig minden látszott. Szűkítheted az appot, semmi nem törlődik, és bármikor visszaállíthatod.','Újdonság','Ezt választom','Később','Később (mindent mutat)','Tovább','Kezdjük','Átugrom','Kezdőlap tartalma','Kezdőlap testreszabása','Válaszd ki, mit lássál itt','Napsor, volumen, rekordok…','A szint adja az alapot, bármelyik kártyát be- vagy kikapcsolhatod.','Kész','Alapértelmezés','Koppints a váltáshoz'])assert.ok(dict[t]!==undefined,'nincs angol: '+t);
// 3. Kezdőlap-kártyák: a lista a nyilvántartás home.* kártyái a Profil és az indítás nélkül; a szint az alap, az opt.home felülírja
const cards=A.FEATURES.filter(f=>/^home\./.test(f.id)&&!['home.hero','home.profile'].includes(f.id)).map(f=>f.id).sort();
assert.deepStrictEqual([...A.HOME_CARDS].sort(),cards,'a HOME_CARDS a nyilvántartás Kezdőlap-kártyái');
const on=(o,ui)=>A.HOME_CARDS.filter(id=>mk(o).homeOn(id,ui));
assert.deepStrictEqual(on({lvl:1,lvlSet:true},'pro'),['home.week'],'a lényeg szint: csak a napsor');
assert.deepStrictEqual(on({lvl:2,lvlSet:true,home:null},'gym'),['home.week','home.groups'],'null = a szint alapja');
assert.deepStrictEqual(on({lvl:1,lvlSet:true,home:['home.volume','home.pr']},'family'),['home.volume','home.pr'],'a saját választás felülírja a szintet');
assert.deepStrictEqual(on({lvl:3,lvlSet:true,home:[]},'pro'),[],'üres választás: egyik kártya sem (a mai edzés és az indítás marad)');
assert.strictEqual(on({},'pro').length,8,'választás nélkül a Minden szint mind a 8 kártyát mutatja');
// 4. a Kezdőlap minden iránya a közös kártya-kapcsolót használja, és a napsor is kapcsolható
assert.ok(/homeOn\('home\.week','pro'\)/.test(home)&&/homeOn\('home\.week','family'\)/.test(home),'a napsor nem kapcsolható');
for(const ui of ['pro','gym','family'])assert.ok(new RegExp("<\\$\\{HomeX\\} [^>]*ui='"+ui+"'").test(home),ui+': hiányzik a HomeX');
assert.ok(/homeCardsOpen/.test(home)&&/homeCardsOpen/.test(rd('js/settings.js')),'a Kezdőlap testreszabása sor és a Beállítások sor is megnyitja a lapot');
// 5. bekötés: a szint-választó az első szinkron után jelenik meg (a felhőből jövő választás ne villanjon), csak ha nincs választás és a felület már kész; a bemutató csak új felhasználónak
assert.ok(/opt\.uiChosen&&!opt\.lvlSet&&\((isGuest\(\)\|\|)?sy\.s==='ok'\|\|sy\.s==='err'\|\|sy\.s==='off'\)\)setLvShown\(true\)/.test(app),'a szint-választó feltétele');
assert.ok(/opt\.uiChosen&&!opt\.lvlSet&&lvShown&&html`<\$\{LevelScreen\}/.test(app));
assert.ok(/\[fresh\]=useState\(\(\)=>!gj\('opt',\{\}\)\.uiChosen\)/.test(app)&&/if\(fresh\)setTour\(0\)/.test(app),'a bemutató csak új felhasználónak indul');
assert.ok(/window\.addEventListener\('homecards'/.test(app)&&/HomeCardsSheet/.test(app));
// 6. betöltés: a JS és a CSS be van kötve, a bemutató fájl a súgó után
assert.ok(idx.includes('js/ui/onboarding.js')&&idx.includes('css/ui-onboarding.css'));
assert.ok(idx.indexOf('js/ui/onboarding.js')>idx.indexOf('js/ui/help.js'));
// 7. a Kezdőlap tartalma lap: minden kártyához kapcsoló, alapértelmezésre állítás (null), megnyugtató mondat
assert.ok(/o\(\{home:null\}\)/.test(ob)&&/HelpCalm\} id='opt\.home'/.test(ob)&&/KSw/.test(ob));
console.log('rendben: onboarding és Kezdőlap tartalma ('+A.HOME_CARDS.length+' kártya)');
