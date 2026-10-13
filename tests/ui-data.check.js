// A Kezdőlap és az Edzés képernyők számításai. Futtatás: node tests/ui-data.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
// a util.js dátumsegédjei ugyanúgy, ahogy az app használja
const util=rd('js/util.js').split('\n').filter(l=>/^const (pad|dk|pd|weekOf)=/.test(l)).join('\n');
const GOF={'Fekvenyomás':'Mell','Ferde nyomás':'Mell','Lat húzás':'Hát','Guggolás':'Láb','Vállnyomás':'Váll'};
const m=new Function('GOF',util+'\n'+rd('js/ui/data.js')+';return{uiIsoWeek,uiAgo,uiShort,uiWeek,uiVolWeeks,uiRecs,uiLatestPR,uiGroupSets,uiStreak,uiDayOf,uiPlates,uiFirstName,uiMins,uiE1}')(GOF);
const W=(date,name,ex,vol)=>({id:date,date,name,ex,vol:vol==null?ex.reduce((a,e)=>a+e.sets.reduce((b,s)=>b+(+s.kg||0)*(+s.reps||0),0),0):vol});
const S=(kg,reps,pr)=>({kg,reps,done:true,pr:!!pr});
// ISO hét: 2026-10-13 a 42. hét
assert.strictEqual(m.uiIsoWeek(new Date(2026,9,13)),42);
assert.strictEqual(m.uiIsoWeek(new Date(2026,0,1)),1);
assert.strictEqual(m.uiIsoWeek(new Date(2020,11,31)),53);
assert.strictEqual(m.uiAgo('2026-10-09','2026-10-13'),4);
assert.strictEqual(m.uiShort('Nyomó (Push)'),'Nyomó');assert.strictEqual(m.uiShort('Szabad edzés'),'Szabad edzés');
// hét: 2026-10-13 kedd; hétfő kész, kedd ma, csütörtök tervezett, vasárnap pihenő
const plan={days:{1:'a',2:'a',4:'b'}};
const hist=[W('2026-10-12','Nyomó',[{n:'Fekvenyomás',sets:[S(80,8),S(80,8),S(80,6)]}]),W('2026-10-05','Nyomó',[{n:'Fekvenyomás',sets:[S(77.5,8,true)]},{n:'Guggolás',sets:[S(100,5)]}]),W('2026-09-28','Húzó',[{n:'Lat húzás',sets:[S(60,10)]}])];
const wk=m.uiWeek(hist,plan,'2026-10-13');
assert.deepStrictEqual(wk.map(x=>x.st),['done','today','rest','plan','rest','rest','rest']);
assert.strictEqual(wk[0].k,'2026-10-12');assert.strictEqual(wk.length,7);
// heti volumen: ezen a héten 80*8+80*8+80*6=1760, előző héten 77.5*8+500=1120
const v=m.uiVolWeeks(hist,'2026-10-13',8);
assert.strictEqual(v.vals.length,8);assert.strictEqual(v.cur,1760);assert.strictEqual(v.vals[6],1120);
assert.ok(Math.abs(v.delta-(1760-1120)/1120*100)<1e-9);
assert.strictEqual(m.uiVolWeeks([],'2026-10-13').delta,null);
// rekordok: legjobb becsült 1RM gyakorlatonként
const r=m.uiRecs(hist,3);
assert.strictEqual(r[0].n,'Guggolás');assert.ok(Math.abs(r[0].m-100*(1+5/30))<1e-9);
assert.strictEqual(r.length,3);
// legutóbbi rekord (pr jelzős sorozat), 8 napja
const pr=m.uiLatestPR(hist,'2026-10-13');assert.strictEqual(pr.n,'Fekvenyomás');assert.strictEqual(pr.ago,8);
assert.strictEqual(m.uiLatestPR(hist,'2026-12-13'),null);
// izomcsoportok: ezen a héten 3 mell sorozat
const g=m.uiGroupSets(hist,'2026-10-13',['Mell','Hát','Láb','Váll']);
assert.deepStrictEqual(g,{Mell:3,Hát:0,Láb:0,Váll:0});
// széria: a mai és az előző hét + a 2 hete is volt edzés = 3
assert.strictEqual(m.uiStreak(hist,'2026-10-13'),3);
assert.strictEqual(m.uiStreak([],'2026-10-13'),0);
// ha a mai hétnek még nincs edzése, az előző hetektől számol
assert.strictEqual(m.uiStreak(hist.slice(1),'2026-10-13'),2);
// NAP x/y
assert.deepStrictEqual(m.uiDayOf(plan,'2026-10-13'),{n:2,of:3});
assert.deepStrictEqual(m.uiDayOf({days:{}},'2026-10-13'),{n:1,of:1});
// tárcsák: 100 kg = 20 + 2*(25+10+5) -> egy oldalra 40 kg = 25 + 15
assert.deepStrictEqual(m.uiPlates(100,20).list,[{w:25,c:1},{w:15,c:1}]);assert.strictEqual(m.uiPlates(100,20).rest,0);
assert.deepStrictEqual(m.uiPlates(20,20).list,[]);assert.deepStrictEqual(m.uiPlates(10,20).list,[]);
assert.deepStrictEqual(m.uiPlates(60,20).list,[{w:20,c:1}]);
assert.deepStrictEqual(m.uiPlates(82.5,20).list,[{w:25,c:1},{w:5,c:1},{w:1.25,c:1}]);
assert.strictEqual(m.uiPlates(21,20).rest,0.5);        // 0,5 kg-ot a készlet nem tud kirakni
assert.deepStrictEqual(m.uiPlates('x'),{list:[],rest:0});
assert.strictEqual(m.uiFirstName('drong.matyas'),'Drong');assert.strictEqual(m.uiFirstName('anna92@x.hu'),'Anna92');assert.strictEqual(m.uiFirstName(''),'');
assert.strictEqual(m.uiMins(6),55);assert.strictEqual(m.uiMins(1),10);
console.log('rendben: Kezdőlap- és Edzés-számítások');
