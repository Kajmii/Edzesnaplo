// UI-tokenek ellenőrzése: kontraszt (WCAG), a tokenek és a JS táblák egyezése. Futtatás: node tests/ui.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const css=rd('css/tokens.css'),core=rd('js/ui/core.js'),idx=rd('index.html');

// --- tokenek beolvasása: html[data-ui="x"][data-scheme="y"]{...} blokkok az irány-alapokkal összefésülve
const blocks=[...css.matchAll(/html\[data-ui="(\w+)"\](?:\[data-scheme="(\w+)"\])?\{([^}]*)\}/g)].map(m=>({ui:m[1],sc:m[2]||'',body:m[3]}));
const vars=b=>Object.fromEntries([...b.matchAll(/--(ui-[\w-]+):([^;]+);?/g)].map(m=>[m[1],m[2].trim()]));
const tokens={};
for(const b of blocks){const k=b.ui;tokens[k]=tokens[k]||{base:{},schemes:{}};if(b.sc)tokens[k].schemes[b.sc]={...tokens[k].schemes[b.sc],...vars(b.body)};else Object.assign(tokens[k].base,vars(b.body))}
const resolved=(ui,sc)=>({...tokens[ui].base,...tokens[ui].schemes[sc]});
const rgb=t=>t.split(/\s+/).map(Number);
const hex=t=>'#'+rgb(t).map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();
const lum=t=>{const c=rgb(t).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};

const UI={pro:['paper','stone','graphite'],gym:['yellow','orange','green'],family:['green','warm','cool']};
const NEED=['bg','surface','surface2','text','muted','line','line2','control','field','accent','on-accent','accent-text','danger','warn'];
let rows=0;
for(const [ui,list] of Object.entries(UI))for(const sc of list){
 const t=resolved(ui,sc),n=ui+'/'+sc;
 for(const k of NEED)assert.ok(t['ui-'+k],n+': hiányzó token '+k);
 const g=(a,b)=>cr(t['ui-'+a],t['ui-'+b]),ok=(label,v,min)=>assert.ok(v>=min,n+': '+label+' '+v.toFixed(2)+':1 < '+min);
 // normál szöveg 4,5:1
 for(const bg of ['bg','surface','surface2']){ok('text/'+bg,g('text',bg),4.5);ok('muted/'+bg,g('muted',bg),4.5);ok('accent-text/'+bg,g('accent-text',bg),4.5);ok('danger/'+bg,g('danger',bg),4.5);ok('warn/'+bg,g('warn',bg),4.5)}
 ok('text/field',g('text','field'),4.5);ok('muted/field',g('muted','field'),4.5);
 ok('on-accent/accent',g('on-accent','accent'),4.5);
 // vezérlő-keret (UI-elem) 3:1 a háttéren, a felületen és a mezőn
 for(const bg of ['bg','surface','field'])ok('control/'+bg,g('control',bg),3);
 rows++;
}
// --- a JS tábla (UI_DEF) egyezik a tokenekkel
const def=new Function(core.split('const UI_ORDER')[0]+';return UI_DEF')();
for(const [ui,list] of Object.entries(UI)){
 assert.deepStrictEqual(def[ui].schemes.map(s=>s[0]),list,ui+': a sémák sorrendje eltér');
 for(const s of def[ui].schemes){const t=resolved(ui,s[0]),d=s[3];
  assert.strictEqual(d.bg,hex(t['ui-bg']),ui+'/'+s[0]+': bg');assert.strictEqual(d.ink,hex(t['ui-text']),ui+'/'+s[0]+': ink');
  assert.strictEqual(d.acc,hex(t['ui-accent']),ui+'/'+s[0]+': acc');assert.strictEqual(d.txt,hex(t['ui-accent-text']),ui+'/'+s[0]+': txt')}
 // alap betűméret és betű-hivatkozás
 assert.strictEqual(def[ui].fs+'px',tokens[ui].base['ui-fs'],ui+': betűméret');
}
// --- az index.html korai scriptje ugyanazt tudja (betűk, háttérszínek)
for(const [ui,d] of Object.entries(def)){
 assert.ok(idx.includes(d.fonts.replace(/&/g,'&')),ui+': a korai script betűlistája eltér');
 for(const s of d.schemes)assert.ok(idx.includes(s[0]+':"'+s[3].bg+'"'),ui+'/'+s[0]+': a korai script háttérszíne eltér');
}
// --- mozgás-tokenek minden irányban megvannak
const motion=rd('css/motion.css');
for(const ui of Object.keys(UI)){
 const m=motion.slice(motion.indexOf('html[data-ui="'+ui+'"]{'));
 for(const k of ['dur-page','ease-page','page-dy','dur-scrim','dur-sheet','sheet-dy','dur-row','row-step','row-dx','row-dy','dur-arrow','dur-press','dur-count','dur-draw','dur-check','dur-switch'])assert.ok(m.slice(0,900).includes('--'+k+':'),ui+': hiányzó mozgás-token '+k);
}
assert.ok(/prefers-reduced-motion:reduce/.test(motion),'reduced-motion szabály hiányzik');
// --- előnézetek: a generált fájl szintaktikailag rendben van és mindhárom irányhoz van előnézet
const prev=rd('js/ui/previews.js');
for(const n of ['UiPrevPro','UiPrevGym','UiPrevFamily'])assert.ok(prev.includes('const '+n+'='),'hiányzik: '+n);
console.log('rendben: UI-tokenek, '+rows+' színséma, kontraszt és JS-tábla egyezik');

// --- menü: minden pont megvan, minden szövegnek van angol fordítása, a céljaikat az App kezeli
const menuSrc=rd('js/ui/menu.js'),app=rd('js/app.js'),dictSrc=rd('js/i18n-en.js');
let dict;new Function('setDict',dictSrc)(d=>{dict=d});
const MENU=new Function(rd('js/features/registry.js')+';'+menuSrc.slice(menuSrc.indexOf('const UI_MENU='),menuSrc.indexOf('const uiMenuItems'))+';return UI_MENU')();
assert.strictEqual(MENU.length,13,'a menünek 13 pontja van');
assert.deepStrictEqual(MENU.slice(0,10).map(m=>m.k),['log','plan','hist','food','recipes','body','social','cycle','profile','opt'],'az első tíz pont sorrendje a mockup szerinti');
assert.strictEqual(new Set(MENU.map(m=>m.k)).size,13,'a menüpont-azonosítók egyediek');
const icons=new Function(menuSrc.slice(menuSrc.indexOf('const UI_ICO='),menuSrc.indexOf('const UiIco'))+';return UI_ICO')();
for(const m of MENU){
 assert.ok(icons[m.ic],m.k+': hiányzó ikon');
 assert.ok(dict[m.t]!==undefined,m.k+': nincs angol név: '+m.t);
 for(const ui of Object.keys(UI)){
  assert.ok(m.d[ui],m.k+'/'+ui+': hiányzó leírás');
  assert.ok(dict[m.d[ui]]!==undefined,m.k+'/'+ui+': nincs angol leírás: '+m.d[ui]);
  // az egysoros leírás 360 px-en sem törhet el: az irányonkénti szélesség szerinti karakterkorlát (mindkét nyelven)
  const lim={pro:40,gym:38,family:28}[ui];
  for(const t of [m.d[ui],dict[m.d[ui]]])assert.ok(t.length<=lim,m.k+'/'+ui+': a leírás túl hosszú ('+t.length+'>'+lim+'): '+t);
 }
 assert.ok(app.includes("tab==='"+m.tab+"'"),m.k+': az App nem kezeli a tab-ot: '+m.tab);
}
for(const k of ['Menü bezárása','Bezár','Napló, étel és a többi','Menü'])assert.ok(dict[k]!==undefined,'nincs angol: '+k);
console.log('rendben: menü, 13 pont, minden szöveg lefordítva');

// --- első bejelentkezés: a felület-választó szövegei lefordítva, a három irányhoz van ajánlás
const pk=rd('js/ui/picker.js');
const who=new Function(pk.slice(pk.indexOf('const UI_WHO='),pk.indexOf('function UiPicker'))+';return UI_WHO')();
for(const ui of Object.keys(UI)){assert.ok(who[ui]&&who[ui].w,ui+': hiányzó ajánlás');assert.ok(dict[who[ui].w]!==undefined,ui+': nincs angol ajánlás')}
for(const k of ['Válaszd ki a kinézetet','Ezt választom','Ezt egyszer kell kiválasztanod. A Beállításokban később bármikor módosíthatod.'])assert.ok(dict[k]!==undefined,'nincs angol: '+k);
assert.ok(app.includes('<${UiPicker}')&&app.includes('opt.uiChosen'),'az App nem mutatja a felület-választót');
console.log('rendben: felület-választó');

// --- az új képernyők tr('...') szövegei mind le vannak fordítva (a rövid, nem szöveges értékeket kivéve)
for(const f of ['js/ui/home.js','js/ui/workout.js','js/ui/loader.js','js/ui/picker.js','js/ui/profile.js']){
 const src=rd(f),miss=[];
 for(const m of src.matchAll(/tr\('([^']+)'\)/g))if(/[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]/.test(m[1])&&dict[m[1]]===undefined)miss.push(m[1]);
 assert.deepStrictEqual([...new Set(miss)],[],f+': nincs angol fordítás: '+miss.join(' | '));
}
for(const s of ['Séta, 20 perc','Lábemelés ülve, 2 × 10','Fekvőtámasz a falnál, 2 × 8','Nyújtás, 5 perc'])assert.ok(dict[s]!==undefined,'nincs angol: '+s);
for(const f of ['css/ui-home.css','css/ui-workout.css','css/ui-loader.css','css/ui-picker.css','css/ui-menu.css','css/ui-switch.css','css/tokens.css','css/base.css','css/motion.css'])assert.ok(idx.includes(f),'az index.html nem tölti be: '+f);
for(const f of ['js/ui/data.js','js/ui/home.js','js/ui/workout.js','js/ui/loader.js','js/ui/picker.js','js/ui/profile.js','js/ui/menu.js','js/ui/core.js'])assert.ok(idx.includes(f),'az index.html nem tölti be: '+f);
console.log('rendben: új képernyők fordításai és betöltésük');
