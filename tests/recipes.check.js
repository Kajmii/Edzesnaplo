// Futtatás: node tests/recipes.check.js — a receptadatok ellenőrzése (hivatkozások, kétnyelvűség, makró-egyezés, címkék, darabszám)
const fs = require('fs'), path = require('path');
const errs = [], assert = (c, m) => { if (!c) errs.push(m); }; // minden hibát összegyűjtünk
const files = ['recipes', 'recipes-1', 'recipes-2', 'recipes-3', 'recipes-4', 'recipes-5'].filter(f => fs.existsSync(path.join(__dirname, '..', 'js', f + '.js')));
const src = files.map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8')).join('\n');
const M = new Function('LANG', src + ';return{ING,REC,recMac,recTags,recFits,suggest}')('hu');
const { ING, REC, recMac, recTags } = M;

// alapanyagok: van mindkét nyelvű név, az értékek számok, a kalória nagyjából egyezik 4F+4Sz+9Zs-vel (a rost miatt némi eltérés belefér)
for (const [id, i] of Object.entries(ING)) {
  assert(i.hu && i.en, id + ': hiányzó név');
  for (const k of ['k', 'p', 'c', 'f']) assert(Number.isFinite(i[k]) && i[k] >= 0, id + ': hibás ' + k);
  const est = 4 * i.p + 4 * i.c + 9 * i.f;
  assert(id === 'kakao' || Math.abs(est - i.k) <= Math.max(25, .16 * i.k), `${id}: a kalória (${i.k}) és a makrók (${est.toFixed(0)}) nem egyeznek`);
  assert(/^[MALG]*$/.test(i.fl), id + ': hibás jelző');
}
// receptek
const ids = new Set(), cats = ['reggeli', 'ebed', 'vacsora', 'snack', 'desszert', 'shake'], cnt = {}, tg = { vegan: 0, vegetarian: 0, glutenfree: 0, lactosefree: 0 };
for (const r of REC) {
  assert(!ids.has(r.id), 'ismétlődő azonosító: ' + r.id); ids.add(r.id);
  assert(/^[a-z0-9-]+$/.test(r.id), 'az azonosító legyen ASCII: ' + r.id);
  assert(cats.includes(r.cat), r.id + ': ismeretlen kategória');
  assert(r.sv >= 1 && r.min > 0 && r.hu && r.en, r.id + ': hiányzó alapadat');
  assert(r.ing.length >= 1, r.id + ': nincs alapanyag');
  for (const [i, g] of r.ing) { assert(ING[i], r.id + ': ismeretlen alapanyag ' + i); assert(g > 0, r.id + ': hibás gramm'); }
  if (r.ing.some(x => !ING[x[0]])) continue;
  assert(r.sh.length >= 3 && r.sh.length === r.se.length, r.id + ': a magyar és angol lépések száma nem egyezik (' + r.sh.length + ' / ' + r.se.length + ')');
  assert(r.sh.every(s => s.length >= 5) && r.se.every(s => s.length >= 5), r.id + ': üres lépés');
  assert(!/orvos|beteg|gyógy|fogyás|diéta|doctor|medical|cure|disease|diet\b/i.test(r.hu + r.en + r.sh.join('') + r.se.join('')), r.id + ': egészségügyi kifejezés');
  const m = recMac(r);
  assert(m.k >= 60 && m.k <= 1100, `${r.id}: szokatlan kalória egy adagra (${m.k.toFixed(0)})`);
  const est = 4 * m.p + 4 * m.c + 9 * m.f;
  assert(Math.abs(est - m.k) <= .14 * m.k + 20, `${r.id}: kalória/makró eltérés (${m.k.toFixed(0)} / ${est.toFixed(0)})`);
  cnt[r.cat] = (cnt[r.cat] || 0) + 1;
  const t = recTags(r); for (const k in tg) if (t[k]) tg[k]++;
}
assert(REC.length >= 120, 'kevés recept: ' + REC.length);
for (const c of cats) assert(cnt[c] >= 8, 'kevés recept ebben: ' + c + ' (' + (cnt[c] || 0) + ')');
for (const k in tg) assert(tg[k] >= 20, 'kevés ' + k + ' recept: ' + tg[k]);
if (errs.length) { console.log(errs.length + ' hiba:' + String.fromCharCode(10) + errs.join(String.fromCharCode(10))); process.exit(1); }
// javaslat: a fehérjét hiányzó nap magas fehérjés, beleférő receptet ad
const sg = M.suggest({ k: 700, p: 60, c: 70, f: 25 }, 3);
assert(sg.length === 3 && sg.every(x => x.m.k <= 721), 'a javaslat nem illeszkedik');
assert(M.suggest({ k: 80, p: 5, c: 5, f: 2 }, 3).length === 0, 'kis keretnél ne legyen javaslat');
console.log('rendben:', Object.keys(ING).length, 'alapanyag,', REC.length, 'recept', JSON.stringify(cnt), JSON.stringify(tg));
