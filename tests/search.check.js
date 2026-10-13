// Menü-keresés: találatok, ékezet-függetlenség, rejtett funkciók, elérési út. Futtatás: node tests/search.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let dict;new Function('setDict',rd('js/i18n-en.js'))(d=>{dict=d});
const mk=(opt,lang)=>new Function('OPT','tr',rd('js/features/registry.js')+';'+rd('js/features/levels.js')+';'+rd('js/features/search.js')+';return{FEATURES,featSearch,featFindable,featNav,featPath,lvlHidden,sNorm}')(opt,x=>lang==='en'&&dict[x]!==undefined?dict[x]:x);
const S=mk({lvl:1,lvlSet:true}),A=mk({});
const ids=(m,q,cyc)=>m.featSearch(q,cyc).map(r=>r.id);
// 1. alapok: üres keresés nincs, ékezet- és kisbetű-független, minden szónak kell egyeznie
assert.deepStrictEqual(S.featSearch('  '),[]);
assert.ok(ids(S,'foto').includes('body.photos'),'ékezet nélkül is megtalálja a fotót');
assert.ok(ids(S,'FOTÓ').includes('body.photos'));
assert.ok(ids(S,'víz').includes('food.water')&&ids(S,'viz').includes('food.water'));
assert.ok(!ids(S,'foto zzz').length,'minden szónak egyeznie kell');
// 2. a címben kezdődő találat előrébb van a kulcsszavas találatnál
const r=S.featSearch('terv');assert.strictEqual(r[0].id,'plan.week','a "terv" elsőként a Tervet adja');
// 3. a rejtett funkciót is megtalálja, jelzi, és a navigáció helyes
const ph=S.featSearch('foto').find(x=>x.id==='body.photos');
assert.strictEqual(ph.hidden,true,'a Lényeg szinten a fotó rejtett');assert.strictEqual(ph.tab,'tools');assert.strictEqual(ph.sub,'b');
assert.strictEqual(A.featSearch('foto').find(x=>x.id==='body.photos').hidden,false,'a Minden szinten nem rejtett');
// 4. a Számolók a fülre nyílnak (kalória -> k), a Tervszerkesztő a saját képernyőre
const kc=S.featSearch('tdee').find(x=>x.id==='tools.kcal');assert.strictEqual(kc.tab,'tools');assert.strictEqual(kc.sub,'k');
assert.strictEqual(S.featSearch('tervszerkeszto')[0].tab,'edit');
// 5. nem kereshető: Kezdőlap-kártya, edzés közbeni elem, súgó (4. fázis), Ciklus bekapcsolás nélkül
for(const q of ['rpe','tarcsa','streak','heti volumen kezdolap'])for(const x of S.featSearch(q))assert.ok(!/^(home|workout)\./.test(x.id)||x.id==='workout.pick','nem kereshető elem: '+x.id);
assert.ok(!ids(S,'ciklus').includes('cycle.main')&&ids(S,'ciklus',true).includes('cycle.main'));
// 6. elérési út: szülő menüsor › funkció; menüsor = csoport
assert.strictEqual(S.featSearch('foto').find(x=>x.id==='body.photos').path,'Test és mérések › Haladási fotók');
assert.strictEqual(S.featSearch('edzes')[0].path.length>0,true);
assert.strictEqual(mk({lvl:1,lvlSet:true},'en').featSearch('photos').find(x=>x.id==='body.photos').path.includes('›'),true);
// 7. angol nyelven az angol cím és a kulcsszó is keres
const E=mk({lvl:3,lvlSet:true},'en');assert.ok(ids(E,'weekly volume').includes('stats.volume'),'angol címre keres');assert.ok(ids(E,'records').includes('stats.main'));
// 8. legfeljebb 8 találat; minden találatnak van ikonja és úthelye
for(const q of ['a','e','s'])assert.ok(A.featSearch(q).length<=8);
for(const x of A.featSearch('e')){assert.ok(x.ic&&x.path&&x.tab,x.id+': hiányos találat')}
// 9. a kereshető funkciók mind elérhetők: a képernyőt az App kezeli, és van hozzá menüsor vagy via
const app=rd('js/app.js'),menu=A.FEATURES.filter(f=>f.m);
for(const f of A.FEATURES.filter(f=>A.featFindable(f,true))){assert.ok(app.includes("tab==='"+f.tab+"'"),f.id+': az App nem kezeli: '+f.tab);assert.ok(menu.some(m=>m.tab===f.tab||m.tab===f.via),f.id+': nincs menüsor a képernyőhöz')}
// 10. a rejtett szám csak kereshető funkciókat számol, és szintenként csökken
const h=l=>mk({lvl:l,lvlSet:true}).lvlHidden();assert.ok(h(1)>h(2)&&h(2)>h(3)&&h(3)===0,'rejtett: '+[h(1),h(2),h(3)]);
// 11. a szövegek angolul is megvannak
for(const t of ['Keress funkciót…','Nincs találat. Próbálj másik szót.','Nem látszik a szinteden','Statisztikák és rekordok','Statisztikák','Heti volumen, utolsó 8 hét'])assert.ok(dict[t]!==undefined,'hiányzó angol szöveg: '+t);
console.log('rendben: menü-keresés (rejtett funkciók szintenként '+[h(1),h(2),h(3)].join('/')+')');
