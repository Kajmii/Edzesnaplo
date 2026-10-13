// A közös elemkészlet ellenőrzése. Futtatás: node tests/ui-kit.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const css=rd('css/ui-kit.css'),js=rd('js/ui-kit.js'),idx=rd('index.html');
// 1. minden, a JS-ben használt k- osztály létezik a CSS-ben
const used=new Set([...js.matchAll(/\bk-[a-z]+(?:-[a-z]+)*/g)].map(m=>m[0]));
const miss=[...used].filter(c=>!new RegExp('\.'+c+'(?![\w-])').test(css));
assert.deepStrictEqual(miss,[],'hiányzó CSS osztály: '+miss);
// 2. színek csak tokenből (kivétel: a Gym töltés három tárcsa-színe és a Google-gomb márkaszínei)
const hex=[...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m=>m[0].toUpperCase()).filter(x=>!['#D7372B','#2F62D0','#2E9E5B','#FFF','#27272A','#DADCE0'].includes(x));
assert.deepStrictEqual(hex,[],'kemény szín a kitben: '+hex);
// 3. a Family betűméretei nem nagyobbak a többi irányénál (legfeljebb 20 px, az alap 16)
for(const m of css.matchAll(/html\[data-ui="family"\][^{]*\{([^}]*)\}/g)){for(const f of m[1].matchAll(/font-size:(\d+)px/g))assert.ok(+f[1]<=20,'a Family túl nagy betű: '+f[1])}
// 4. a mozgás tokenekből jön (nincs kemény ms érték a átmenetekben, kivétel a töltő ciklusai)
for(const m of css.matchAll(/transition:([^;}]*)/g))assert.ok(!/\d(ms|s)\b/.test(m[1]),'kemény átmenet-idő: '+m[1]);
// 5. betöltési sorrend: a kit a util.js és a settings.js előtt van, a CSS be van kötve
assert.ok(idx.indexOf('js/ui-kit.js')<idx.indexOf('js/util.js'),'a ui-kit.js a util.js előtt kell');
assert.ok(idx.includes('css/ui-kit.css'));
// 6. a régi elemek a kitre épülnek
assert.ok(/const Sg=KSeg;/.test(rd('js/util.js'))&&/const Sw=KSw;/.test(rd('js/settings.js')));
// 7. nincs szórás a sablonban
assert.ok(!/\.\.\.\$\{/.test(js));
console.log('rendben: közös elemkészlet ('+used.size+' osztály)');
