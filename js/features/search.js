/* ---------- Funkció-keresés a menüben ----------
   A nyilvántartásból (registry.js) keres: cím (az aktuális nyelven és magyarul), kulcsszavak. Ékezet- és kisbetű-független,
   minden szónak szerepelnie kell. A rejtett (a szintre nem látszó) funkciót is megtalálja, jelzi, és megnyitva a kért rész látszik
   (levels.js: lvlForce). Terv: docs/UI-IMPLEMENTATION.md 6. fejezet. Tiszta függvények, a tests/search.check.js ellenőrzi. */
const FEAT_GROUP_LBL={today:'Ma',meal:'Étkezés',progress:'Fejlődés',social:'Közösség',me:'Fiók és beállítások'};
// Kereshető: képernyő-szintű funkciók. A Kezdőlap-kártyák (testreszabás: 7. fázis) és az edzés közbeni elemek nem; a Ciklus csak bekapcsolva
const featFindable=(f,cyc)=>!/^(home|workout)\./.test(f.id)&&f.id!=='nav.search'&&(f.id!=='cycle.main'||!!cyc);
const sNorm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
// hová visz: a Számolók a "focus" fülre nyílnak, a többi a képernyőre és almenüre
const featNav=f=>({tab:f.tab,sub:f.tab==='tools'&&f.sub==='c'?f.focus:f.sub});
// fiókhoz kötött funkció (vendég módban nem érhető el): a közösségi funkciók és a fotók
const featNeedsAcct=id=>/^social\./.test(id)||id==='body.photos';
// "Test és mérések › Haladási fotók": a szülő menüsor és a funkció; a menüsornál a csoport neve
const featPath=f=>{
 if(f.m)return tr(FEAT_GROUP_LBL[f.group]);
 const menu=FEATURES.filter(x=>x.m),p=menu.find(m=>m.tab===f.tab&&m.sub===f.sub)||menu.find(m=>m.tab===f.tab||m.tab===f.via);
 return p?tr(p.m.t)+' › '+tr(f.t):tr(FEAT_GROUP_LBL[f.group]);
};
// találatok: legfeljebb 8, a cím elején egyezők előre. Üres keresés = nincs találat.
const featSearch=(q,cyc)=>{
 const ws=sNorm(q).split(/\s+/).filter(Boolean);if(!ws.length)return[];
 return FEATURES.map((f,i)=>({f,i})).filter(x=>featFindable(x.f,cyc)).map(({f,i})=>{
  const t=sNorm(tr(f.t)+' '+f.t),words=t.split(' '),hay=t+' '+sNorm(f.kw.join(' '));
  if(!ws.every(w=>hay.includes(w)))return null;
  return{f,i,s:ws.every(w=>words.some(x=>x.startsWith(w)))?0:ws.every(w=>t.includes(w))?1:2}})
  .filter(Boolean).sort((a,b)=>a.s-b.s||a.i-b.i).slice(0,8)
  .map(({f})=>({id:f.id,t:f.t,ic:f.ic,tab:featNav(f).tab,sub:featNav(f).sub,path:featPath(f),hidden:!lvlOn(f.id)}));
};
