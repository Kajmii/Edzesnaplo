// Beállítások (6. fázis): csendes órák, alapértékek visszaállítása, JSON-export bekötése. Futtatás: node tests/settings.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const q=new Function(rd('js/features/quiet.js')+';return{quietMin,quietAt}')();
const at=(h,m)=>new Date(2026,9,13,h,m);
// 1. csendes órák: éjszakába nyúló sáv (22:00–07:00), napközi sáv, határok
const N={on:true,from:'22:00',to:'07:00'};
for(const[h,m,e]of [[21,59,false],[22,0,true],[23,30,true],[0,0,true],[6,59,true],[7,0,false],[12,0,false]])assert.strictEqual(q.quietAt(N,at(h,m)),e,h+':'+m);
const D={on:true,from:'13:00',to:'15:00'};assert.strictEqual(q.quietAt(D,at(14,0)),true);assert.strictEqual(q.quietAt(D,at(15,0)),false);assert.strictEqual(q.quietAt(D,at(12,59)),false);
// 2. kikapcsolva, hiányzó vagy egyenlő időpontok: nincs csendes óra
for(const x of [undefined,null,{},{on:false,from:'22:00',to:'07:00'},{on:true,from:'08:00',to:'08:00'},{on:true,from:'',to:'07:00'}])assert.strictEqual(q.quietAt(x,at(23,0)),false);
assert.strictEqual(q.quietMin(N,22*60),true);
// 3. alapértékek: a beállítások visszaállnak, az irány, nyelv, szint, fiók-jelzők és az adat marad
const src=rd('js/settings.js');
const r=new Function('KSw',src.slice(src.indexOf('const OPT_RESET='),src.indexOf('// JSON-export'))+';return{OPT_RESET,optReset}')(()=>null);
const o={ui:'gym',schemes:{pro:'graphite',gym:'orange',family:'cool'},uiChosen:true,lang:'en',lvl:1,lvlSet:true,fs:20,hc:true,wg:5,rest:180,auto:false,snd:false,vib:false,wake:false,step:2.5,pct:5,an:false,qh:{on:true,from:'20:00',to:'06:00'},ac:'cyan',th:'kek',mode:'light',x:1};
const n=r.optReset(o);
for(const k of ['ui','uiChosen','lang','lvl','lvlSet','ac','th','mode','x'])assert.deepStrictEqual(n[k],o[k],k+' marad');
assert.deepStrictEqual([n.fs,n.hc,n.wg,n.rest,n.auto,n.snd,n.vib,n.wake,n.step,n.pct,n.an],[16,false,3,90,true,true,true,true,1.25,2.5,true]);
assert.deepStrictEqual(n.schemes,{pro:'paper',gym:'yellow',family:'green'});assert.deepStrictEqual(n.qh,{on:false,from:'22:00',to:'07:00'});
assert.notStrictEqual(n.qh,r.OPT_RESET.qh,'az alap nem osztozik a visszaadott objektummal');assert.strictEqual(o.fs,20,'az eredeti objektum nem módosul');
for(const k of ['hist','plan','ct','food','bw','prof'])assert.ok(!(k in r.OPT_RESET),'az adat nem része az alapértékeknek: '+k);
// 4. JSON-export: az összes szinkronizált adat benne van (docNow), fájlnév és letöltés, angol szövegek
const auth=rd('js/auth.js'),doc=/const docNow=\(\)=>\(\{([^}]*)\}\)/.exec(auth)[1];
for(const k of ['hist','plan','opt','ct','food','prof','bw'])assert.ok(new RegExp('\\b'+k+':').test(doc),'a docNow nem tartalmazza: '+k);
assert.ok(/\.\.\.docNow\(\)/.test(src)&&/edzesnaplo-'\+dk\(new Date\(\)\)\+'\.json/.test(src)&&/type:'application\/json'/.test(src),'a jsonExport nincs jól bekötve');
// 5. bekötések: csendes órák az értesítéseknél és a hangnál, a beállítások szint-szűrése
const app=rd('js/app.js'),util=rd('js/util.js'),wk=rd('js/workout.js');
assert.ok(/quietMin\(opt\.qh,hh\*60\+mm\)/.test(app)&&/quietAt\(opt\.qh,new Date\(\)\)\)return;const d=new Date\(\)/.test(app)&&/!quietAt\(opt\.qh,new Date\(Date\.now\(\)\+rd\*1000\)\)/.test(app),'az App értesítései nincsenek bekötve');
assert.ok(/quietAt\(OPT\.qh,new Date\(\)\)\)return;/.test(util)&&/quietAt\(OPT\.qh,new Date\(\)\)&&navigator\.vibrate/.test(wk),'a hang és a rezgés nincs bekötve');
for(const id of ['opt.contrast','opt.quiet','opt.reset','opt.export'])assert.ok(src.includes("lvlOn('"+id+"'"),'hiányzó szint-szűrés: '+id);
let dict;new Function('setDict',rd('js/i18n-en.js'))(x=>{dict=x});
for(const t of ['Nagy kontraszt','Erősebb szöveg és vonalak','Csendes órák','Ilyenkor nem szól az app és nem küld értesítést','Tól','Ig','Alapértékek','Alapértékek visszaállítása','Biztosan visszaállítod?','Alapértékek visszaállítva','JSON-export (teljes mentés)','JSON mentés letöltve','A kinézet és a beállítások visszaállnak az alapra.'])assert.ok(dict[t]!==undefined,'nincs angol: '+t);
console.log('rendben: beállítások (csendes órák, alapértékek, JSON-export)');
