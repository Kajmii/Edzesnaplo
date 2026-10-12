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
 return l.length?html`<div class='flex flex-wrap gap-1 mt-1.5'>${l.map(x=>html`<span key=${x} class='text-[10px] px-1.5 py-0.5 rounded-md bg-lime-400/15 text-lime-300'>${x}</span>`)}</div>`:null;
}
function RecRow({r,open}){
 const m=recMac(r);
 return html`<button onClick=${()=>open(r)} class='w-full text-left py-3 px-1 border-b border-zinc-800'>
  <div class='flex justify-between gap-3'><span class='font-medium'>${rname(r)}</span><span class='text-xs text-zinc-500 shrink-0'>${r.min} min</span></div>
  <div class='text-xs text-zinc-400 mt-0.5'>${catName(r.cat)} · ${mline(m)}</div><${Tags} r=${r}/></button>`;
}

// Javaslat a napló fülön: a hátralévő kalória és makrók alapján
function Sugg({rem,ok,open,all}){
 const l=suggest(rem,3,ok);
 return html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'>
  <div class='font-semibold'>Javaslat</div>
  <div class='text-xs text-zinc-400 mt-1'>Hátralévő: ${Math.round(rem.k)} kcal · P ${Math.round(rem.p)} · C ${Math.round(rem.c)} · F ${Math.round(rem.f)}</div>
  ${l.length?l.map(x=>html`<${RecRow} key=${x.r.id} r=${x.r} open=${open}/>`):html`<p class='text-sm text-zinc-400 mt-3'>Mára nincs elég hátralévő kalóriakeret egy étkezéshez.</p>`}
  <button onClick=${all} class='w-full h-10 rounded-xl bg-zinc-800 text-sm font-semibold mt-3'>Összes recept</button>
  <div class='text-[10px] text-zinc-500 mt-2'>Tájékoztató jellegű értékek.</div></div>`;
}

// Receptlista: keresés, kategória és étrendi szűrők, "beleférő"
function Recipes({rem,diet,setDiet,open,fit,setFit}){
 const[q,setQ]=useState(''),[cat,setCat]=useState('');
 const tgl=k=>setDiet(diet.includes(k)?diet.filter(x=>x!==k):[...diet,k]),ql=q.toLowerCase();
 const list=REC.filter(r=>(!cat||r.cat===cat)&&diet.every(k=>recTags(r)[k])&&(!fit||recFits(r,rem))&&(!ql||rname(r).toLowerCase().includes(ql)||r.ing.some(x=>iname(x[0]).toLowerCase().includes(ql)))).sort((a,b)=>rname(a).localeCompare(rname(b)));
 const Ch=({on,t,f})=>html`<button onClick=${f} class=${'h-9 px-3 rounded-full text-xs font-semibold shrink-0 '+(on?'bg-lime-400 text-black':'bg-zinc-800 text-zinc-300')}>${t}</button>`;
 return html`<div>
  <input value=${q} onChange=${e=>setQ(e.target.value)} placeholder='Keresés a receptek és alapanyagok között' class=${inp+' !text-left px-4 !text-base mb-3'}/>
  <div class='flex gap-2 overflow-x-auto pb-2'><${Ch} on=${!cat} t='Mind' f=${()=>setCat('')}/>${RCAT.map(([k,n])=>html`<${Ch} key=${k} on=${cat===k} t=${n} f=${()=>setCat(cat===k?'':k)}/>`)}</div>
  <div class='flex gap-2 overflow-x-auto pb-2'>${RDIET.map(([k,n])=>html`<${Ch} key=${k} on=${diet.includes(k)} t=${n} f=${()=>tgl(k)}/>`)}<${Ch} on=${fit} t='Beleférő' f=${()=>setFit(!fit)}/></div>
  <div class='text-[10px] text-zinc-500 mb-1'>A jelölések az összetevők alapján készültek; csomagolt terméknél mindig ellenőrizd a címkét.</div>
  <div class='text-xs text-zinc-400 mb-1'>${list.length} recept</div>
  ${list.map(r=>html`<${RecRow} key=${r.id} r=${r} open=${open}/>`)}
  ${!list.length&&html`<p class='text-sm text-zinc-400 py-6 text-center'>Nincs találat. Próbálj kevesebb szűrőt.</p>`}</div>`;
}

// Recept részletei: adagszámolás, alapanyagok, lépések, hozzáadás a naplóhoz
function RecSheet({r,onClose,add}){
 const[cs,setCs]=useState(r.sv),[es,setEs]=useState(1),[mi,setMi]=useState(mealOf(r.cat)),m=recMac(r),k=cs/r.sv,pcs=LANG==='en'?'pcs':'db';
 const St=({v,on,min,step})=>html`<div class='flex items-center gap-2'><button onClick=${()=>on(Math.max(min,Math.round((v-step)*10)/10))} class='h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center'><${Ic} n='minus' s=${16}/></button><span class='fd text-2xl font-bold w-12 text-center'>${v}</span><button onClick=${()=>on(Math.round((v+step)*10)/10)} class='h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center'><${Ic} n='plus' s=${16}/></button></div>`;
 const name=rname(r)+' ('+es+' '+(LANG==='en'?(es===1?'serving':'servings'):'adag')+')';
 return html`<div class='fade fixed inset-0 z-50 bg-black/70 flex items-end' onClick=${onClose}><div class='sheet w-full max-w-md mx-auto bg-zinc-900 rounded-t-3xl p-4 max-h-[90vh] overflow-y-auto' onClick=${x=>x.stopPropagation()}>
  <div class='flex items-start justify-between gap-3 mb-1'><h3 class='fd text-2xl font-bold leading-tight'>${rname(r)}</h3><button onClick=${onClose} class='h-10 w-10 shrink-0 flex items-center justify-center text-zinc-400'><${Ic} n='x'/></button></div>
  <div class='text-xs text-zinc-400'>${catName(r.cat)} · ${r.min} min</div><${Tags} r=${r}/>
  <div class='grid grid-cols-4 gap-2 mt-3 text-center'>${[['kcal',m.k],['P',m.p],['C',m.c],['F',m.f]].map(([l,v])=>html`<div key=${l} class='rounded-xl bg-zinc-800 py-2'><div class='fd text-xl font-bold'>${Math.round(v)}</div><div class='text-[10px] text-zinc-400'>${l}</div></div>`)}</div>
  <div class='text-[10px] text-zinc-500 mt-1'>Értékek egy adagra, nyers alapanyag-tömegekkel számolva.</div>
  <div class='flex items-center justify-between mt-4'><span class='font-semibold'>Főzök</span><${St} v=${cs} on=${setCs} min=${1} step=${1}/></div>
  <div class='text-xs text-zinc-400 -mt-1'>adag, az alapanyagok ehhez igazodnak</div>
  <div class='font-semibold mt-4 mb-1'>Alapanyagok</div>
  ${r.ing.map(([id,g])=>{const i=ING[id],n=i.pc?g*k/i.pc:0;return html`<div key=${id} class='flex justify-between text-sm py-1 border-b border-zinc-800'><span>${iname(id)}</span><span class='text-zinc-300 shrink-0 pl-3'>${rgm(g*k)} g${n>=.75?html`<span class='text-xs text-zinc-500'> (~${Math.round(n*2)/2} ${pcs})</span>`:''}</span></div>`})}
  <div class='font-semibold mt-4 mb-1'>Elkészítés</div>
  ${(LANG==='en'?r.se:r.sh).map((s,i)=>html`<div key=${i} class='flex gap-3 text-sm py-1'><span class='fd text-lg text-lime-400 w-5 shrink-0'>${i+1}</span><span>${s}</span></div>`)}
  <div class='font-semibold mt-4 mb-2'>Hozzáadás a naplóhoz</div>
  <div class='flex gap-2 mb-3'>${MEALS.map((n,i)=>html`<button key=${i} onClick=${()=>setMi(i)} class=${'flex-1 h-10 rounded-xl text-xs font-semibold '+(mi===i?'bg-lime-400 text-black':'bg-zinc-800 text-zinc-300')}>${n}</button>`)}</div>
  <div class='flex items-center justify-between'><span class='text-sm'>Ennyit eszem (adag)</span><${St} v=${es} on=${setEs} min=${.5} step=${.5}/></div>
  <div class='text-sm text-zinc-300 my-3'>${mline({k:m.k*es,p:m.p*es,c:m.c*es,f:m.f*es})}</div>
  <button onClick=${()=>add(mi,name,{k:m.k*es,p:m.p*es,c:m.c*es,f:m.f*es})} class='w-full h-12 rounded-xl bg-lime-400 text-black font-bold'>Hozzáadás</button></div></div>`;
}
