// A funkció-nyilvántartás belső egyezései. Futtatás: node tests/features.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const reg=rd('js/features/registry.js'),menuSrc=rd('js/ui-menu.js'),app=rd('js/app.js'),dictSrc=rd('js/i18n-en.js');
const R=new Function(reg+';return{FEATURES,FEAT_GROUPS,FEAT_TABS,featById}')();
const{FEATURES,FEAT_GROUPS,FEAT_TABS}=R;
let dict;new Function('setDict',dictSrc)(d=>{dict=d});
const icons=new Function(menuSrc.slice(menuSrc.indexOf('const UI_ICO='),menuSrc.indexOf('const UiIco'))+';return UI_ICO')();
const UIS=['pro','gym','family'];
// 1. szerkezet
assert.ok(FEATURES.length>=60,'a nyilvántartás túl rövid: '+FEATURES.length);
assert.strictEqual(new Set(FEATURES.map(f=>f.id)).size,FEATURES.length,'az azonosítók egyediek legyenek');
for(const f of FEATURES){
 assert.ok(/^[a-z]+\.[a-z0-9]+$/.test(f.id),'az azonosító alakja csoport.név: '+f.id);
 assert.ok(FEAT_GROUPS.includes(f.group),f.id+': ismeretlen csoport '+f.group);
 assert.ok([1,2,3].includes(f.level),f.id+': a szint 1, 2 vagy 3');
 assert.ok(FEAT_TABS.includes(f.tab),f.id+': ismeretlen képernyő '+f.tab);
 if(f.tab!=='home')assert.ok(app.includes("tab==='"+f.tab+"'"),f.id+': az App nem kezeli a képernyőt: '+f.tab);
 assert.ok(icons[f.ic],f.id+': hiányzó ikon '+f.ic);
 assert.ok(f.kw.length>=2,f.id+': kevés kulcsszó a kereséshez');
 assert.ok(f.help===f.id,f.id+': a súgó-kulcs a funkció azonosítója');
 // 2. szövegek: a cím angolul is megvan (a menü-cím és a leírások a tests/ui.check.js-ben)
 assert.ok(dict[f.t]!==undefined,f.id+': nincs angol cím: '+f.t);
}
// 3. a főmenü sorai: egyedi kulcs és sorrend, minden irányban van leírás
const menu=FEATURES.filter(f=>f.m);
assert.strictEqual(menu.length,13,'a főmenünek 13 sora van');
assert.strictEqual(new Set(menu.map(f=>f.m.k)).size,13);assert.strictEqual(new Set(menu.map(f=>f.m.o)).size,13,'a menü-sorrend egyedi');
for(const f of menu){for(const u of UIS)assert.ok(f.m.d[u]&&f.m.d[u].length>2,f.id+': hiányzó menü-leírás '+u);assert.ok(dict[f.m.t]!==undefined,f.id+': nincs angol menü-cím')}
// 4. szint-konzisztencia: egy funkció szintje nem lehet kisebb, mint az ugyanazon a képernyőn lévő főmenü-funkcióé
for(const f of FEATURES){const p=menu.find(m=>m.tab===f.tab&&m.sub===f.sub&&m.id!==f.id);if(p)assert.ok(f.level>=p.level,f.id+': a szintje ('+f.level+') kisebb, mint a szülőé ('+p.id+': '+p.level+')')}
// 5. legfeljebb két koppintás a menü megnyitása után: főmenü-sor = 1, a képernyőn belüli funkció = 2 (menüsor + fül/rész). A Kezdőlap elemei 0.
const taps=f=>f.tab==='home'?0:f.m?1:menu.some(m=>m.tab===f.tab)?2:Infinity;
for(const f of FEATURES)assert.ok(taps(f)<=2,f.id+': több mint két koppintás a menüből ('+f.tab+')');
// 6. csoportonként van funkció, és mind az öt csoport él
for(const g of FEAT_GROUPS)assert.ok(FEATURES.some(f=>f.group===g),'üres csoport: '+g);
console.log('rendben: funkció-nyilvántartás ('+FEATURES.length+' funkció, '+menu.length+' menüsor)');
