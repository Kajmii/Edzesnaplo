// Súgó: minden funkcióhoz van bejegyzés, hu és en, hosszkorlát, megnyugtató mondatok. Futtatás: node tests/help.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let dict;new Function('setDict',rd('js/i18n-en.js'))(d=>{dict=d});
const{FEATURES,FEAT_TABS,HELP,helpFor,helpSearch}=new Function('tr',rd('js/features/registry.js')+';'+rd('js/features/search.js')+';'+rd('js/features/help.js')+';return{FEATURES,FEAT_TABS,HELP,helpFor,helpSearch}')(x=>dict[x]!==undefined?dict[x]:x);
const ids=FEATURES.map(f=>f.id);
// 1. minden nyilvántartott funkcióhoz van bejegyzés, és csak azokhoz
for(const id of ids)assert.ok(HELP[id],'hiányzó súgó-bejegyzés: '+id);
for(const id of Object.keys(HELP))assert.ok(ids.includes(id),'ismeretlen funkció a súgóban: '+id);
// 2. forma, hosszkorlát (hu és en), angol szöveg
const lim={what:110,how:80,tip:90,calm:90};
const chk=(id,kind,t)=>{assert.ok(t&&t.length>=8,id+' '+kind+': túl rövid vagy üres');assert.ok(dict[t]!==undefined,id+' '+kind+': nincs angol szöveg: '+t);
 for(const s of [t,dict[t]])assert.ok(s.length<=lim[kind],id+' '+kind+': túl hosszú ('+s.length+'>'+lim[kind]+'): '+s);
 assert.ok(!/!/.test(t),id+' '+kind+': nincs felkiáltójel');assert.notStrictEqual(dict[t],t,id+' '+kind+': az angol megegyezik a magyarral')};
for(const[id,H]of Object.entries(HELP)){
 assert.strictEqual(H.length,4,id+': [mi ez, [hogyan], tipp, megnyugtató]');
 chk(id,'what',H[0]);assert.ok(Array.isArray(H[1])&&H[1].length<=3,id+': legfeljebb 3 pont');H[1].forEach(x=>chk(id,'how',x));
 if(H[2])chk(id,'tip',H[2]);if(H[3])chk(id,'calm',H[3]);
}
// 3. a megnyugtató mondatok a terv 7b fejezetéből valók (a szöveg nem sodródik el)
const doc=rd('docs/UI-IMPLEMENTATION.md');let nc=0;
for(const[id,H]of Object.entries(HELP))if(H[3]){nc++;assert.ok(doc.includes(H[3].replace(/\.$/,'')),id+': a megnyugtató mondat nincs a docs 7b fejezetében: '+H[3])}
assert.ok(nc>=12,'kevés megnyugtató mondat: '+nc);
// 4. a képernyő-témák léteznek: minden képernyőhöz van súgó-téma
for(const t of FEAT_TABS){if(t==='home')continue;assert.ok(HELP[helpFor(t,'')],t+': nincs súgó-téma a képernyőhöz')}
for(const[t,s]of [['tools','b'],['tools','k'],['food','rec'],['opt','data'],['opt','level']])assert.ok(HELP[helpFor(t,s)],t+'/'+s+': nincs súgó-téma');
// 5. a kódban használt azonosítók (HelpI, HelpCalm, helpOpen) léteznek; a HelpCalm-nak van megnyugtató mondata
const files=['js','js/ui'].flatMap(d=>fs.readdirSync(path.join(__dirname,'..',d)).filter(f=>f.endsWith('.js')).map(f=>d+'/'+f));let used=0;
for(const f of files)for(const m of rd(f).matchAll(/(HelpCalm|HelpI)\}\s+id='([a-z]+\.[a-z0-9]+)'/g)){used++;assert.ok(HELP[m[2]],f+': ismeretlen súgó-azonosító: '+m[2]);if(m[1]==='HelpCalm')assert.ok(HELP[m[2]][3],f+': a '+m[2]+' bejegyzésnek nincs megnyugtató mondata')}
assert.ok(used>=8,'kevés súgó-használat a kódban: '+used);
// 6. súgó-keresés: ékezet nélkül is, cím és leírás szerint
assert.ok(helpSearch('rpe').some(f=>f.id==='workout.rpe'));
assert.ok(helpSearch('pihenő').some(f=>f.id==='workout.rest')&&helpSearch('pihenő').length>=2);assert.ok(helpSearch('piheno').some(f=>f.id==='workout.rest'));
assert.deepStrictEqual(helpSearch('  '),[]);
// 7. felület-szövegek angolul
for(const t of ['Értem','Minden súgótéma','Hogyan használd','Tipp','Mi ez a képernyő?','A „?” jelre koppintva bármikor elolvasod.','Súgó megnyitása','Keress a súgóban…','Hogyan működik?','Segítség és tippek','Tipp bezárása','Magyarázat'])assert.ok(dict[t]!==undefined,'nincs angol: '+t);
console.log('rendben: súgó ('+ids.length+' téma, '+nc+' megnyugtató mondat, '+used+' használat a kódban)');
