// Ciklus-számítás ellenőrzése: node tests/cycle.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const src=fs.readFileSync(path.join(__dirname,'../js/cycle.js'),'utf8');
const pad=n=>String(n).padStart(2,'0'),dk=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,pd=k=>{const[a,b,c]=k.split('-');return new Date(+a,b-1,+c)};
const m=new Function('P','gj','sj','pd','dk','useState','useEffect',src+';return{cycPhase,cycLen,cycNext,cycParse,cycMerge,cycExport,addD,dd,CYC0}')({},()=>0,()=>0,pd,dk,()=>0,()=>0);
const c=(o)=>({...m.CYC0,on:true,...o}),ph=(cc,k)=>{const f=m.cycPhase(cc,k);return f&&f.p+f.day};
const a=c({starts:['2025-01-01'],len:28,per:5});
assert.strictEqual(ph(a,'2024-12-31'),null);
assert.strictEqual(ph(a,'2025-01-01'),'mens1');
assert.strictEqual(ph(a,'2025-01-05'),'mens5');
assert.strictEqual(ph(a,'2025-01-06'),'foll6');
assert.strictEqual(ph(a,'2025-01-12'),'foll12');
assert.strictEqual(ph(a,'2025-01-13'),'ovul13');
assert.strictEqual(ph(a,'2025-01-15'),'ovul15');
assert.strictEqual(ph(a,'2025-01-16'),'lut16');
assert.strictEqual(ph(a,'2025-01-28'),'lut28');
assert.strictEqual(ph(a,'2025-01-29'),'mens1');            // vetített következő ciklus
assert.strictEqual(ph(a,'2025-06-01'),null);               // túl régi utolsó bejegyzés
// automatikus hossz: a rögzített ciklusok mediánja, a kiugró érték kimarad
assert.strictEqual(m.cycLen(c({starts:['2025-01-01','2025-01-29','2025-02-28','2025-03-26']})),28);
assert.strictEqual(m.cycLen(c({starts:['2025-01-01','2025-01-29','2025-06-01']})),28);
assert.strictEqual(m.cycLen(c({starts:[]})),28);
// két rögzített kezdet között a tényleges hossz számít
const b=c({starts:['2025-01-01','2025-01-31'],per:5});
assert.strictEqual(ph(b,'2025-01-30'),'lut30');
// rövid ciklusnál is marad tüszőfázis/ovuláció sorrend és érvényes fázis
for(const L of [21,24,35,45])for(let i=0;i<L;i++){const f=m.cycPhase(c({starts:['2025-01-01'],len:L,per:5}),m.addD('2025-01-01',i));assert.ok(f&&f.day===i+1&&['mens','foll','ovul','lut'].includes(f.p),L+' '+i)}
// következő menstruáció / ovuláció
const n=m.cycNext(a,'2025-01-10');
assert.strictEqual(n.per,'2025-01-29');assert.strictEqual(n.ovu,'2025-01-14');
assert.strictEqual(m.cycNext(c({}),'2025-01-10'),null);
// export / import / összefésülés
const x=m.cycParse(m.cycExport(c({starts:['2025-01-29','2025-01-01','2025-01-01'],len:30,per:4,ts:5})));
assert.deepStrictEqual(x.starts,['2025-01-01','2025-01-29']);assert.strictEqual(x.len,30);
for(const bad of ['nem json','{}','{"app":"edzesnaplo-cycle","v":1,"data":{"starts":["2025-02-30"]}}','{"app":"edzesnaplo-cycle","v":1,"data":{"starts":["x"]}}','{"app":"edzesnaplo-cycle","v":1,"data":{"starts":[],"len":99}}','{"app":"masik","data":{"starts":[]}}'])assert.throws(()=>m.cycParse(bad),bad);
const mg=m.cycMerge(c({starts:['2025-01-01'],len:28,per:5,ts:1}),{starts:['2025-01-29'],len:30,per:4,ts:9});
assert.deepStrictEqual(mg.starts,['2025-01-01','2025-01-29']);assert.strictEqual(mg.len,30);assert.strictEqual(mg.on,true);
const mg2=m.cycMerge(c({starts:[],len:28,per:5,ts:9}),{starts:['2025-01-29'],len:30,per:4,ts:1});
assert.strictEqual(mg2.len,28);
console.log('rendben: ciklus-számítás');
