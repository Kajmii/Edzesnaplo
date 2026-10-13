// Szintek: Csak a lényeg / Ajánlott / Minden. Futtatás: node tests/levels.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const mk=(opt)=>new Function('OPT','tr',rd('js/features/registry.js')+';'+rd('js/features/levels.js')+';'+rd('js/features/search.js')+';'+rd('js/ui/menu.js').slice(rd('js/ui/menu.js').indexOf('const UI_MENU='),rd('js/ui/menu.js').indexOf('// A menü: összecsukott'))+';return{FEATURES,LEVELS,lvlOf,lvlOn,lvlHidden,homeOn,uiMenuItems,uiBarSub}')(opt,x=>x);
const A=mk({});
// 1. meglévő felhasználó (nincs választás): Minden szint, semmi sem rejtett (K3)
assert.strictEqual(A.lvlOf(),3);assert.strictEqual(A.lvlHidden(),0);
assert.strictEqual(A.uiMenuItems(true).length,13,'Minden szinten mind a 13 menüsor látszik');
assert.strictEqual(A.uiMenuItems(false).length,12,'ciklus nélkül 12');
// 2. a választás érvényes értékekre szól; érvénytelen érték = Minden
assert.strictEqual(mk({lvl:1,lvlSet:true}).lvlOf(),1);assert.strictEqual(mk({lvl:2}).lvlOf(),3,'lvlSet nélkül a lvl nem számít');assert.strictEqual(mk({lvl:7,lvlSet:true}).lvlOf(),3);
// 3. menü szintenként (a terv 5. fejezete): lényeg = Edzés, Terv, Napló, Profil, Beállítások
const keys=l=>mk({lvl:l,lvlSet:true}).uiMenuItems(true).map(m=>m.k);
assert.deepStrictEqual(keys(1),['log','plan','hist','profile','opt','help']);
assert.deepStrictEqual(keys(2),['log','plan','hist','food','body','stats','profile','opt','help']);
assert.strictEqual(keys(3).length,13);
for(const l of [1,2,3])assert.ok(keys(l).includes('log')&&keys(l).includes('opt')&&keys(l).includes('plan'),'Edzés, Terv és Beállítások minden szinten elérhető');
// 4. rejtett funkciók száma csökken a szinttel; Minden szinten nulla
const hid=l=>mk({lvl:l,lvlSet:true}).lvlHidden();
assert.ok(hid(1)>hid(2)&&hid(2)>hid(3)&&hid(3)===0,'a rejtett funkciók száma szintenként csökken: '+[hid(1),hid(2),hid(3)]);
// 5. a force felülírja a szintet (a keresésből/menüből kifejezetten megnyitott rész)
const B=mk({lvl:1,lvlSet:true});assert.strictEqual(B.lvlOn('food.water'),false);assert.strictEqual(B.lvlOn('food.water',true),true);assert.strictEqual(B.lvlOn('nincs.ilyen'),true,'ismeretlen azonosító nem rejt el semmit');
// 6. Kezdőlap alapja (K4): lényeg = napsor; ajánlott = + az irány fő kártyája; minden = az összes
const cards=['home.week','home.easy','home.fontsize','home.volume','home.records','home.pr','home.streak','home.groups'];
const on=(l,ui)=>{const m=mk({lvl:l,lvlSet:true});return cards.filter(c=>m.homeOn(c,ui))};
for(const ui of ['pro','gym','family']){assert.deepStrictEqual(on(1,ui),['home.week']);assert.strictEqual(on(2,ui).length,2);assert.strictEqual(on(3,ui).length,cards.length)}
assert.ok(on(2,'pro').includes('home.volume')&&on(2,'gym').includes('home.groups')&&on(2,'family').includes('home.easy'));
// 7. a menü alsávja nem hivatkozik rejtett pontra (Gym: Edzés · Napló · Étel · +N, Family: szöveg)
const bar=l=>{const m=mk({lvl:l,lvlSet:true}),it=m.uiMenuItems(false);return[m.uiBarSub(it,'gym'),m.uiBarSub(it,'family')]};
assert.ok(!/Étel/.test(bar(1)[0])&&!/étel/.test(bar(1)[1]),'a lényeg szinten a sáv nem említi az Ételt');
assert.ok(/Étel/.test(bar(2)[0])&&/étel/.test(bar(2)[1]));
// 8. szövegek: a szintek neve és leírása angolul is megvan, a leírás rövid
let dict;new Function('setDict',rd('js/i18n-en.js'))(d=>{dict=d});
for(const[v,n,d]of A.LEVELS){assert.ok(dict[n]!==undefined&&dict[d]!==undefined,'hiányzó angol szöveg: '+n);assert.ok(d.length<=80,'túl hosszú leírás: '+n)}
for(const t of ['Szint','Bármikor átállíthatod. Semmi sem törlődik, csak elrejtjük.','A keresés mindent megtalál. Szint váltása: Beállítások › Szint.','Napló és a többi'])assert.ok(dict[t]!==undefined,'hiányzó angol szöveg: '+t);
// 9. minden lvlOn('azonosító') a kódban létező funkcióra hivatkozik
const ids=new Set(A.FEATURES.map(f=>f.id));
const files=['js','js/ui'].flatMap(d=>fs.readdirSync(path.join(__dirname,'..',d)).filter(f=>f.endsWith('.js')).map(f=>d+'/'+f));
let n=0;for(const f of files)for(const m of rd(f).matchAll(/(?:lvlOn|homeOn)\('([a-z]+\.[a-z0-9]+)'/g)){n++;assert.ok(ids.has(m[1]),f+': ismeretlen funkció-azonosító: '+m[1])}
assert.ok(n>=20,'kevés szint-szűrés a kódban: '+n);
console.log('rendben: szintek ('+n+' szűrési pont, rejtett funkció szintenként '+[hid(1),hid(2),hid(3)].join('/')+')');
