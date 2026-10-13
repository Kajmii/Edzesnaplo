// Paritás: minden funkció mindhárom irányban megvan (vagy ismert hiányként, célfázissal nyilvántartva). Futtatás: node tests/parity.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const dir=path.join(__dirname,'..');
const rd=f=>fs.readFileSync(path.join(dir,f),'utf8');
const{FEATURES}=new Function(rd('js/features/registry.js')+';return{FEATURES}')();
const IMPL=new Function(rd('js/features/parity.js')+';return FEAT_IMPL')();
const UIS=['pro','gym','family'];
// a forrás: minden js/*.js, a nyilvántartási fájlok kivételével (azokban maguk a jelölők szerepelnek)
const files=fs.readdirSync(path.join(dir,'js')).filter(f=>f.endsWith('.js')&&f!=='vendor.js'&&f!=='i18n-en.js');
const src=Object.fromEntries(files.map(f=>[f,rd('js/'+f)]));
const all=Object.values(src).join('\n');
const body=name=>{for(const s of Object.values(src)){const i=s.indexOf('function '+name+'(');if(i<0)continue;const j=s.indexOf('\n}',i);return s.slice(i,j<0?undefined:j+2)}return null};
const has=m=>{
 const k=/^[A-Za-z0-9_]+:/.exec(m);
 if(k){const b=body(k[0].slice(0,-1));return !!b&&b.includes(m.slice(k[0].length))}
 return all.includes(m)};
// 1. a két nyilvántartás egyezik
const ids=FEATURES.map(f=>f.id);
for(const id of ids)assert.ok(IMPL[id],'a megvalósítási táblából hiányzik: '+id);
for(const id of Object.keys(IMPL))assert.ok(ids.includes(id),'a megvalósítási tábla ismeretlen funkciót tartalmaz: '+id);
// 2. irányonként: a jelölő létezik a kódban, vagy ismert hiány célfázissal
const gaps={pro:[],gym:[],family:[]},phases={};
for(const id of ids){
 const row=IMPL[id];assert.strictEqual(row.length,3,id+': három irány kell');
 row.forEach((m,i)=>{
  if(m&&m.gap){assert.ok(/^F[1-8]$/.test(m.gap),id+': érvénytelen célfázis '+m.gap);gaps[UIS[i]].push(id);phases[m.gap]=(phases[m.gap]||0)+1;return}
  assert.strictEqual(typeof m,'string',id+' '+UIS[i]+': a jelölő szöveg vagy hiány legyen');
  assert.ok(has(m),id+' ('+UIS[i]+'): a jelölő nincs a kódban: '+m)})}
// 3. a szint és a hiány összhangja: 1. szintű funkcióból legfeljebb a tervezett (F2-F7) hiányok lehetnek, és minden hiány dokumentált
const doc=rd('docs/UI-IMPLEMENTATION.md');
for(const ui of UIS)for(const id of gaps[ui])assert.ok(doc.includes('`'+id+'`'),'a hiány nincs a docs/UI-IMPLEMENTATION.md mátrixában: '+id);
// 4. összegzés
const total=UIS.reduce((a,u)=>a+gaps[u].length,0);
console.log('rendben: paritás, '+ids.length+' funkció, ismert hiány: Pro '+gaps.pro.length+', Gym '+gaps.gym.length+', Family '+gaps.family.length+' (összesen '+total+'; fázisonként '+JSON.stringify(phases)+')');
if(process.argv.includes('--strict')){assert.strictEqual(total,0,'a --strict módban nem maradhat hiány ('+total+')');}
