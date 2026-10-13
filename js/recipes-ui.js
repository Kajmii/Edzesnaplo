/* ---------- Receptek: felület (javaslat, lista, részletek) ---------- */
const RCAT=[['reggeli','Reggeli'],['ebed','Ebéd'],['vacsora','Vacsora'],['snack','Snack'],['desszert','Desszert'],['shake','Shake']];
const RDIET=[['vegan','Vegán'],['vegetarian','Vegetáriánus'],['glutenfree','Gluténmentes'],['lactosefree','Laktózmentes']];
const rgm=g=>g<10?Math.round(g*10)/10:Math.round(g); // gramm: 10 alatt egy tizedesjeggyel
const mline=m=>Math.round(m.k)+' kcal · P '+Math.round(m.p)+' · C '+Math.round(m.c)+' · F '+Math.round(m.f);
const catName=c=>RCAT.find(x=>x[0]===c)[1];
const mealOf=c=>c==='reggeli'?0:c==='ebed'?1:c==='vacsora'?2:3;

// Címke-chipek: a vegán a vegetáriánust is jelenti, ezért csak az erősebbet írjuk ki
function Tags({r}){
 const t=recTags(r),l=[t.vegan?'Vegán':t.vegetarian?'Vegetáriánus':null,t.glutenfree?'Gluténmentes':null,t.lactosefree?'Laktózmentes':null].filter(Boolean);
 return l.length?html`<div class='k-tags' style=${{margin:'6px 0 0'}}>${l.map(x=>html`<span key=${x} class='k-tag'>${x}</span>`)}</div>`:null;
}
function RecRow({r,open}){
 const m=recMac(r);
 return html`<button type='button' class='k-row' onClick=${()=>open(r)}><span class='k-row-tx'><span class='k-row-t'>${rname(r)}</span><span class='k-row-s'>${catName(r.cat)} · ${mline(m)}</span><${Tags} r=${r}/></span><span class='k-row-r'>${r.min} min</span></button>`;
}

// Javaslat a napló fülön: a hátralévő kalória és makrók alapján
function Sugg({rem,ok,open,all}){
 const l=suggest(rem,3,ok);
 return html`<${KSec} t='Javaslat'><${KCard}>
  <div class='k-hint' style=${{margin:0}}>Hátralévő: ${Math.round(rem.k)} kcal · P ${Math.round(rem.p)} · C ${Math.round(rem.c)} · F ${Math.round(rem.f)}</div>
  ${l.length?html`<div class='k-list k-mt'>${l.map(x=>html`<${RecRow} key=${x.r.id} r=${x.r} open=${open}/>`)}</div>`:html`<p class='k-hint'>Mára nincs elég hátralévő kalóriakeret egy étkezéshez.</p>`}
  <${KBtn} v='sec' sm=${true} full=${true} c='k-mt' onClick=${all}>Összes recept<//>
  <div class='k-hint'>Tájékoztató jellegű értékek.</div><//><//>`;
}

// Receptlista: keresés, kategória és étrendi szűrők, "beleférő"
function Recipes({rem,diet,setDiet,open,fit,setFit}){
 const[q,setQ]=useState(''),[cat,setCat]=useState('');
 const tgl=k=>setDiet(diet.includes(k)?diet.filter(x=>x!==k):[...diet,k]),ql=q.toLowerCase();
 const list=REC.filter(r=>(!cat||r.cat===cat)&&diet.every(k=>recTags(r)[k])&&(!fit||recFits(r,rem))&&(!ql||rname(r).toLowerCase().includes(ql)||r.ing.some(x=>iname(x[0]).toLowerCase().includes(ql)))).sort((a,b)=>rname(a).localeCompare(rname(b)));
 return html`<div>
  <input value=${q} onChange=${e=>setQ(e.target.value)} placeholder='Keresés a receptek és alapanyagok között' class='k-in' style=${{marginBottom:'12px'}}/>
  <div class='k-chips sc'><${KChip} on=${!cat} onClick=${()=>setCat('')}>Mind<//>${RCAT.map(([k,n])=>html`<${KChip} key=${k} on=${cat===k} onClick=${()=>setCat(cat===k?'':k)}>${n}<//>`)}</div>
  <div class='k-chips sc'>${RDIET.map(([k,n])=>html`<${KChip} key=${k} on=${diet.includes(k)} onClick=${()=>tgl(k)}>${n}<//>`)}<${KChip} on=${fit} onClick=${()=>setFit(!fit)}>Beleférő<//></div>
  <p class='k-hint' style=${{margin:'0 0 12px'}}>A jelölések az összetevők alapján készültek; csomagolt terméknél mindig ellenőrizd a címkét.</p>
  <${KSec} t=${html`${list.length} recept`}><${KCard}><div class='k-list'>${list.map(r=>html`<${RecRow} key=${r.id} r=${r} open=${open}/>`)}</div>
  ${!list.length&&html`<p class='k-hint k-center'>Nincs találat. Próbálj kevesebb szűrőt.</p>`}<//><//></div>`;
}

// Recept részletei: adagszámolás, alapanyagok, lépések, hozzáadás a naplóhoz
function RecSheet({r,onClose,add}){
 const[cs,setCs]=useState(r.sv),[es,setEs]=useState(1),[mi,setMi]=useState(mealOf(r.cat)),m=recMac(r),k=cs/r.sv,pcs=LANG==='en'?'pcs':'db';
 const name=rname(r)+' ('+es+' '+(LANG==='en'?(es===1?'serving':'servings'):'adag')+')';
 return html`<${KSheet} t=${rname(r)} onClose=${onClose} foot=${html`<${KBtn} full=${true} onClick=${()=>add(mi,name,{k:m.k*es,p:m.p*es,c:m.c*es,f:m.f*es})}>Hozzáadás<//>`}>
  <div class='k-row-s'>${catName(r.cat)} · ${r.min} min</div><${Tags} r=${r}/>
  <div class='k-stats c4 k-mt'>${[['kcal',m.k],['P',m.p],['C',m.c],['F',m.f]].map(([l,v])=>html`<div key=${l} class='k-stat'><div class='k-stat-v'>${Math.round(v)}</div><div class='k-stat-l'>${l}</div></div>`)}</div>
  <div class='k-hint' style=${{margin:'0 0 12px'}}>Értékek egy adagra, nyers alapanyag-tömegekkel számolva.</div>
  <div class='k-wh' style=${{alignItems:'center',marginBottom:0}}><span class='k-row-t'>Főzök</span><${KStep} v=${cs} on=${setCs} min=${1} step=${1}/></div>
  <div class='k-hint' style=${{margin:'0 0 16px'}}>adag, az alapanyagok ehhez igazodnak</div>
  <${KSec} t='Alapanyagok'>${r.ing.map(([id,g])=>{const i=ING[id],n=i.pc?g*k/i.pc:0;return html`<div key=${id} class='k-tr k-tr2'><span>${iname(id)}</span><span class='k-r'>${rgm(g*k)} g${n>=.75?html`<span class='k-row-s'> (~${Math.round(n*2)/2} ${pcs})</span>`:''}</span></div>`})}<//>
  <${KSec} t='Elkészítés'><ol class='k-tips'>${(LANG==='en'?r.se:r.sh).map((s,i)=>html`<li key=${i}><b>${i+1}</b><span>${s}</span></li>`)}</ol><//>
  <${KSec} t='Hozzáadás a naplóhoz'><${KSeg} v=${mi} on=${x=>setMi(+x)} o=${MEALS.map((n,i)=>[i,n])}/>
   <div class='k-wh' style=${{alignItems:'center',margin:'12px 0 0'}}><span class='k-row-t'>Ennyit eszem (adag)</span><${KStep} v=${es} on=${setEs} min=${.5} step=${.5}/></div>
   <div class='k-hint'>${mline({k:m.k*es,p:m.p*es,c:m.c*es,f:m.f*es})}</div><//><//>`;
}
