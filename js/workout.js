/* ---------- Pihenőidő-időzítő ---------- */
function Rest({rest,setRest,hidden}){
 const[,t]=useState(0);
 useEffect(()=>{
  if(!rest)return;
  const i=setInterval(()=>{if(Date.now()>=rest.end){clearInterval(i);beep();try{OPT.vib&&navigator.vibrate&&navigator.vibrate([250,100,250])}catch(e){}}t(x=>x+1)},250);
  return()=>clearInterval(i);
 },[rest]);
 if(!rest||hidden)return null;
 const left=Math.max(0,Math.ceil((rest.end-Date.now())/1000)),done=left===0;
 return html`<div class="up fixed left-0 right-0 z-30 px-3" style=${{bottom:'calc(var(--ui-bar-h,64px) + 12px + env(safe-area-inset-bottom,0px))'}}>
  <div class=${'max-w-md mx-auto rounded-2xl p-3 shadow-xl border '+(done?'bg-lime-400 text-black border-lime-300 glow':'bg-zinc-900 border-cyan-400/50')}>
   <div class="flex items-center gap-3">
    <${Ic} n="timer" c=${done?'text-black':'text-cyan-400'}/>
    <div class="flex-1"><div class="fd text-3xl font-bold leading-none">${done?'Mehet a következő sorozat':Math.floor(left/60)+':'+pad(left%60)}</div><div class=${'text-xs '+(done?'text-black/70':'text-zinc-400')}>Pihenőidő</div></div>
    ${!done&&html`<button onClick=${()=>setRest({end:rest.end+15000,total:rest.total+15})} class="h-11 px-3 rounded-xl bg-zinc-800 text-cyan-300 font-semibold">+15 mp</button>`}
    <button onClick=${()=>setRest(null)} class=${'h-11 w-11 flex items-center justify-center rounded-xl '+(done?'bg-black/15':'bg-zinc-800 text-zinc-300')}><${Ic} n="x" s=${20}/></button>
   </div>
   ${!done&&html`<div class="h-1.5 rounded-full bg-zinc-800 mt-3 overflow-hidden"><div class="h-full bg-cyan-400 transition-all" style=${{width:(left/rest.total*100)+'%'}}></div></div>`}
  </div></div>`;
}

/* ---------- Kezdőlap ---------- */
function Home({hist,sel,setSel,today,aw,go,nav,startToday,plan,user,out}){
 const wk=weekOf(sel),on=k=>hist.filter(w=>w.date===k),wh=hist.filter(w=>wk.includes(w.date));
 const sets=wh.reduce((a,w)=>a+w.ex.reduce((b,e)=>b+e.sets.length,0),0),shift=n=>{const d=pd(sel);d.setDate(d.getDate()+n);setSel(dk(d))},day=on(sel);
 const hr=new Date().getHours(),gr=hr<10?'Jó reggelt':hr<18?'Szia':'Jó estét',tp=plan.days[new Date().getDay()],x=tp&&dayOf(tp);
 const fo=gj('food',{})[today],kc=fo?fo.e.reduce((a,e)=>a+e.k,0):0,tgk=(gj('prof',{}).tg||{}).k||2200,w0=pd(weekOf(today)[0]),wv=[],wl=[];
 for(let i=7;i>=0;i--){const d=new Date(w0.getFullYear(),w0.getMonth(),w0.getDate()-7*i),ks=weekOf(dk(d));wv.push(hist.filter(w=>ks.includes(w.date)).reduce((a,w)=>a+w.vol,0));wl.push((d.getMonth()+1)+'.'+d.getDate())}
 const St=({l,v,u})=>html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-3'><div class='fd text-3xl font-bold text-lime-400 leading-none'><${Cnt} to=${v}/><span class='text-sm text-zinc-500 ml-1'>${u}</span></div><div class='text-xs text-zinc-400 mt-1.5'>${l}</div></div>`;
 const Tl=(m,i)=>html`<button key=${m[3]} onClick=${()=>nav(m[0],m[1])} class='up rounded-2xl p-3 text-left active:scale-95' style=${{background:'linear-gradient(135deg,'+m[4]+')',animationDelay:i*50+'ms'}}><${Ic} n=${m[2]} s=${22} c='text-white/90'/><div class='mt-3 font-semibold text-white text-[13px] leading-tight'>${m[3]}</div></button>`;
 return html`<div>
  <div class='flex items-center justify-between mb-4'><div class='flex items-center gap-3'><div class='w-12 h-12 rounded-2xl bg-lime-400 text-black font-bold flex items-center justify-center fd text-2xl'>${(user[0]||'?').toUpperCase()}</div><div><div class='text-xs text-zinc-400'>${gr}</div><div class='fd text-3xl font-bold leading-none'>${user}</div></div></div>
   <div class='flex gap-2'><button onClick=${()=>setSel(today)} class='h-10 px-4 rounded-xl bg-zinc-800 text-sm font-medium'>Ma</button><button onClick=${out} title='Kilépés' class='h-10 w-10 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center'><${Ic} n='out' s=${18}/></button></div></div>
  <div class='up relative overflow-hidden rounded-3xl p-5 mb-4' style=${{background:'linear-gradient(135deg,rgb(var(--a4)),#6366f1 130%)'}}>
   <div class='absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/25 blur-2xl'></div><div class='absolute right-4 bottom-3 opacity-20'><${Ic} n='dumbbell' s=${72} c='text-black'/></div>
   <div class='relative'><div class='text-sm text-black/70'>${x?'Mai edzés':'Ma nincs tervezett edzés'}</div><div class='fd text-4xl font-bold text-black leading-tight'>${x?x.n:'Szabad edzés'}</div><div class='text-sm text-black/70 mb-4'>${x?x.e.length+' gyakorlat, célsúlyokkal':'Indíts egy üres edzést, vagy válassz tervet.'}</div>
   <button onClick=${aw?go:x?startToday:go} class='sh h-12 px-6 rounded-2xl bg-black text-white font-bold flex items-center gap-2'><${Ic} n='play' s=${16}/>${aw?'Edzés folytatása':'Edzés indítása'}</button></div></div>
  <${CycToday} nav=${nav}/>
  <div class='grid grid-cols-4 gap-2 mb-5'>${[['food','','apple','Étel','#f59e0b,#ef4444'],MENU[2],MENU[4],MENU[5]].map(Tl)}</div>
  <div class='bg-zinc-900 rounded-2xl p-3 border border-zinc-800'>
   <div class='flex items-center justify-between mb-2'><button onClick=${()=>shift(-7)} class='h-10 w-10 flex items-center justify-center text-zinc-400'><${Ic} n='chevL'/></button><span class='text-sm text-zinc-300'>${fs(wk[0])} – ${fs(wk[6])}</span><button onClick=${()=>shift(7)} class='h-10 w-10 flex items-center justify-center text-zinc-400'><${Ic} n='chevR'/></button></div>
   <div class='grid grid-cols-7 gap-1.5'>${wk.map(k=>{const a=k===sel,has=on(k).length>0;return html`<button key=${k} onClick=${()=>setSel(k)} class=${'flex flex-col items-center py-2.5 rounded-xl transition-all duration-200 '+(a?'bg-lime-400 text-black':'bg-zinc-800/60 text-zinc-300')}><span class='text-[11px] opacity-70'>${(LANG==='en'?['S','M','T','W','T','F','S']:DN)[pd(k).getDay()]}</span><span class='fd text-2xl font-bold leading-tight'>${pd(k).getDate()}</span><span class=${'w-1.5 h-1.5 rounded-full mt-1 '+(has?(a?'bg-black':'bg-lime-400'):(k===today?'bg-zinc-500':'bg-transparent'))}></span></button>`})}</div></div>
  <h2 class='text-sm text-zinc-400 mt-5 mb-2'>${fd(sel)}</h2>
  ${day.map(w=>html`<div key=${w.id} class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-2 flex items-center justify-between'><div><div class='font-semibold'>${w.name}</div><div class='text-xs text-zinc-400'>${w.ex.length} gyakorlat, ${fmt(w.vol)} kg</div></div><${Ic} n='check' c='text-lime-400'/></div>`)}
  ${!day.length&&html`<p class='text-zinc-500 text-sm'>Ezen a napon még nincs rögzített edzés.</p>`}
  <${Lvl} hist=${hist}/>
  <h2 class='text-sm text-zinc-400 mt-5 mb-2'>Heti összesítő</h2>
  <div class='grid grid-cols-3 gap-2'><${St} l='Edzés' v=${wh.length} u='db'/><${St} l='Térfogat' v=${wh.reduce((a,w)=>a+w.vol,0)} u='kg'/><${St} l='Sorozat' v=${sets} u='db'/></div>
  <div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mt-3'><div class='font-semibold mb-3'>Heti térfogat (kg)</div><${Bars} vals=${wv} labels=${wl}/></div>
  <button onClick=${()=>nav('food')} class='up w-full text-left bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mt-3 flex items-center gap-4'><${Ring} v=${kc} max=${tgk} col='#f59e0b' s=${64} w=${7}><div class='text-xs font-semibold'>${Math.round(kc/tgk*100)}%</div><//><div><div class='font-semibold'>Étel ma</div><div class='text-sm text-zinc-400'>${Math.round(kc)} / ${tgk} kcal</div></div></button>
 </div>`;
}

/* ---------- Edzés rögzítése ---------- */
function Log({aw,setAw,hist,sel,rd,setRd,startRest,begin,finish,quit}){
 const[pick,setPick]=useState(false),[cf,setCf]=useState(false),[g,setG]=useState('Mind'),[q,setQ]=useState(''),[info,setInfo]=useState(null);
 if(!aw)return html`<div>
  <h1 class="fd text-4xl font-bold">Edzés rögzítése</h1>
  <p class="text-zinc-400 text-sm mb-5">${fd(sel)}: válassz edzéstervet</p>
  ${allT().map(t=>html`<div key=${t.id} class="up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
   <p class="fd text-2xl font-bold">${t.n}</p><p class="text-xs text-zinc-500 mb-3">${t.s}</p>
   <div class="grid gap-2">${t.days.map(d=>html`<button key=${d.n} onClick=${()=>begin(d.n,d.e)} class="flex items-center justify-between h-14 px-4 rounded-xl bg-zinc-800 active:bg-lime-400 active:text-black">
    <span class="font-semibold">${d.n}</span><span class="text-xs text-zinc-500">${d.e.length} gyakorlat</span></button>`)}</div></div>`)}
  ${hist[0]&&html`<button onClick=${()=>begin(hist[0].name,hist[0].ex.map(e=>e.n))} class='w-full h-14 rounded-2xl bg-lime-400/10 border border-lime-400/40 text-lime-300 font-semibold mb-3'>Legutóbbi ismétlése: ${hist[0].name}</button>`}<button onClick=${()=>begin('Szabad edzés',[])} class="w-full h-14 rounded-2xl border border-dashed border-zinc-700 text-zinc-300 flex items-center justify-center gap-2"><${Ic} n="plus" s=${20}/>Üres edzés</button></div>`;
 const up=(i,f)=>setAw(a=>({...a,ex:a.ex.map((e,j)=>j===i?f(e):e)}));
 const setS=(i,k,f,v)=>up(i,e=>({...e,sets:e.sets.map((s,j)=>j===k?{...s,[f]:v}:s)}));
 const nd=aw.ex.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
 const tv=aw.ex.reduce((a,e)=>a+vol(e.sets.filter(s=>s.done)),0);
 const ql=q.toLowerCase(),list=EX.filter(x=>(g==='Mind'||x.g===g)&&(x.n.toLowerCase().includes(ql)||tr(x.n).toLowerCase().includes(ql)));
 const rec=[...new Set(hist.flatMap(w=>w.ex.map(e=>e.n)))].slice(0,6);
 const add=n=>{setAw(a=>({...a,ex:[...a.ex,newEx(n,hist)]}));setPick(false);setQ('')};
 return html`<div>
  <div class="flex items-start justify-between gap-3">
   <div><h1 class="fd text-4xl font-bold leading-tight">${aw.name}</h1><p class="text-sm text-zinc-400">${fd(aw.date)}, ${nd} sorozat, ${fmt(tv)} kg, <${Clk} t=${aw.t}/></p></div>
   <button onClick=${()=>cf?quit():setCf(true)} class=${'h-10 px-3 rounded-xl text-sm shrink-0 '+(cf?'bg-red-500 text-white':'bg-zinc-800 text-zinc-400')}>${cf?'Biztosan?':'Elvetés'}</button></div>
  <div class="flex items-center gap-2 my-4"><span class="text-sm text-zinc-400 mr-1">Pihenőidő</span>
   ${[60,90,120,180].map(s=>html`<button key=${s} onClick=${()=>setRd(s)} class=${'flex-1 h-11 rounded-xl text-sm font-semibold '+(rd===s?'bg-cyan-400 text-black':'bg-zinc-800 text-zinc-300')}>${s} mp</button>`)}</div>
  ${aw.ex.map((e,i)=>html`<div key=${i+e.n} class="up bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-3" style=${{animationDelay:i*60+'ms'}}>
   <div class="flex items-center justify-between mb-2"><div class='pr-2'><button onClick=${()=>setInfo(e.n)} class='text-left font-semibold flex items-center gap-1.5'>${e.n}<${Ic} n='info' s=${15} c='text-lime-400 shrink-0'/></button>${(l=>l&&html`<div class='text-xs text-zinc-500'>Legutóbb: ${l.kg||0} kg × ${l.reps||0}, rekord: ${maxKg(hist,e.n)} kg</div>`)(lastSet(hist,e.n))}</div>
    <button onClick=${()=>setAw(a=>({...a,ex:a.ex.filter((_,j)=>j!==i)}))} class="h-9 w-9 flex items-center justify-center text-zinc-500 shrink-0"><${Ic} n="trash" s=${18}/></button></div>
   <div class="grid grid-cols-[1.5rem_1fr_1fr_1fr_3rem] gap-2 text-[11px] text-zinc-500 text-center mb-1"><span>#</span><span>Súly (kg)</span><span>Ismétlés</span><span>RPE</span><span></span></div>
   ${e.sets.map((s,k)=>html`<div key=${k} class="up grid grid-cols-[1.5rem_1fr_1fr_1fr_3rem] gap-2 items-center mb-2">
    <span class="fd text-xl text-zinc-500 text-center">${k+1}</span>
    <input type="number" inputMode="decimal" class=${inp} placeholder="0" value=${s.kg} onChange=${ev=>setS(i,k,'kg',ev.target.value)}/>
    <input type="number" inputMode="numeric" class=${inp} placeholder="0" value=${s.reps} onChange=${ev=>setS(i,k,'reps',ev.target.value)}/>
    <input type="number" inputMode="decimal" min="1" max="10" step="0.5" class=${inp} placeholder="-" value=${s.rpe} onChange=${ev=>setS(i,k,'rpe',ev.target.value)}/>
    <button onClick=${()=>{setS(i,k,'done',!s.done);buzz();if(!s.done){startRest();const m=maxKg(hist,e.n),w=+s.kg||0;if(m>0&&w>m){setS(i,k,'pr',true);toast('Új rekord: '+e.n+', '+w+' kg',1)}}}} class=${'h-12 w-12 rounded-xl flex items-center justify-center '+(s.done?'bg-lime-400 text-black pop':'bg-zinc-800 text-zinc-500')}><${Ic} n="check" s=${24}/></button></div>`)}
   <button onClick=${()=>up(i,x=>{const l=x.sets[x.sets.length-1];return{...x,sets:[...x.sets,{kg:l.kg,reps:l.reps,rpe:'',done:false}]}})} class="w-full h-11 rounded-xl bg-zinc-800/70 text-zinc-300 text-sm flex items-center justify-center gap-1.5"><${Ic} n="plus" s=${16}/>Sorozat hozzáadása</button>
  </div>`)}
  <button onClick=${()=>setPick(true)} class="w-full h-14 rounded-2xl border border-dashed border-zinc-700 text-zinc-300 flex items-center justify-center gap-2 mb-3"><${Ic} n="plus" s=${20}/>Gyakorlat hozzáadása</button>
  <button disabled=${!nd} onClick=${finish} class=${'w-full h-14 rounded-2xl font-bold text-lg '+(nd?'bg-lime-400 text-black':'bg-zinc-800 text-zinc-600')}>Edzés befejezése</button>
  ${!nd&&html`<p class="text-xs text-zinc-500 text-center mt-2">Jelölj be legalább egy sorozatot a mentéshez.</p>`}
  ${info&&html`<${Info} n=${info} onClose=${()=>setInfo(null)}/>`}
  ${pick&&html`<div class="fixed inset-0 z-40 bg-black/70 flex items-end fade" onClick=${()=>setPick(false)}>
   <div class="sheet w-full max-w-md mx-auto bg-zinc-900 rounded-t-3xl p-4 max-h-[80vh] flex flex-col" onClick=${ev=>ev.stopPropagation()}>
    <div class="flex items-center justify-between mb-3"><h3 class="fd text-2xl font-bold">Gyakorlatok és gépek</h3><button onClick=${()=>setPick(false)} class="h-10 w-10 flex items-center justify-center text-zinc-400"><${Ic} n="x"/></button></div>
    <input value=${q} onChange=${ev=>setQ(ev.target.value)} placeholder='Keresés (pl. lábtoló, csiga, Smith)' class=${inp+' !text-left px-4 !text-base mb-3 shrink-0'}/>${!q&&rec.length>0&&html`<div class='flex gap-2 overflow-x-auto pb-3 shrink-0'>${rec.map(n=>html`<button key=${n} onClick=${()=>add(n)} class='h-9 px-3 rounded-full border border-lime-400/40 text-lime-300 text-xs shrink-0'>${n}</button>`)}</div>`}<div class="flex gap-2 overflow-x-auto pb-3 shrink-0">${['Mind',...GR].map(x=>html`<button key=${x} onClick=${()=>setG(x)} class=${'h-10 px-4 rounded-full text-sm shrink-0 '+(g===x?'bg-lime-400 text-black font-semibold':'bg-zinc-800 text-zinc-300')}>${x}</button>`)}</div>
    <div class="overflow-y-auto">${list.map(x=>html`<button key=${x.n} onClick=${()=>add(x.n)} class="w-full text-left py-3.5 px-2 border-b border-zinc-800 flex justify-between"><span>${x.n}</span><span class="text-xs text-zinc-500">${x.g}</span></button>`)}</div>
   </div></div>`}
 </div>`;
}

/* ---------- Diagram ---------- */
function Chart({pts,dec}){
 if(!pts.length)return html`<p class="text-zinc-500 text-sm py-6 text-center">Még nincs adat ehhez a gyakorlathoz.</p>`;
 const mx=Math.max(...pts.map(p=>p.v))||1,lo=dec?Math.min(...pts.map(p=>p.v))-1:0,n=pts.length;
 const X=i=>n===1?150:24+i*(252/(n-1)),Y=v=>96-((v-lo)/(mx-lo||1))*70;
 return html`<svg key=${pts.map(p=>p.v).join()} viewBox="0 0 300 130" class="w-full">
  <polyline class='draw' pathLength='600' fill="none" stroke=${ACC} strokeWidth="2.5" strokeLinejoin="round" points=${pts.map((p,i)=>X(i)+','+Y(p.v)).join(' ')}/>
  ${pts.map((p,i)=>html`<g key=${i} class='fade' style=${{animationDelay:(250+i*80)+'ms',animationFillMode:'backwards'}}><circle cx=${X(i)} cy=${Y(p.v)} r="4" fill=${ACC}/>
   <text x=${X(i)} y=${Y(p.v)-9} textAnchor="middle" fontSize="10" fill="#d4d4d8">${dec?p.v.toFixed(1):fmt(p.v)}</text>
   ${(i===0||i===n-1)&&html`<text x=${X(i)} y="122" textAnchor="middle" fontSize="9" fill="#71717a">${fs(p.d)}</text>`}</g>`)}
 </svg>`;
}

/* ---------- Előzmények és statisztika ---------- */
function Hist({hist,del}){
 const names=[...new Set(hist.flatMap(w=>w.ex.map(e=>e.n)))];
 const[ex,setEx]=useState(''),[m,setM]=useState('w');
 const cur=names.includes(ex)?ex:names[0];
 const pts=hist.filter(w=>w.ex.some(e=>e.n===cur)).sort((a,b)=>a.date<b.date?-1:1).slice(-10).map(w=>{const e=w.ex.find(x=>x.n===cur);return{d:w.date,v:m==='w'?Math.max(...e.sets.map(s=>+s.kg||0)):m==='r'?Math.max(...e.sets.map(s=>(+s.kg||0)*(1+(+s.reps||0)/30))):vol(e.sets)}});
 const dates=[...new Set(hist.map(w=>w.date))].sort().reverse();
 const Tg=({k,l})=>html`<button onClick=${()=>setM(k)} class=${'flex-1 h-10 rounded-xl text-sm font-semibold '+(m===k?'bg-lime-400 text-black':'bg-zinc-800 text-zinc-300')}>${l}</button>`;
 return html`<div>
  <h1 class="fd text-4xl font-bold mb-4">Előzmények</h1>
  ${!hist.length&&html`<div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400">Itt jelennek meg a befejezett edzéseid. Indíts egyet az Edzés fülön.</div>`}
  ${hist.length>0&&html`<${Rec} hist=${hist}/>`}${hist.length>0&&html`<div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-5">
   <h2 class="font-semibold mb-3">Fejlődés</h2>
   <select value=${cur} onChange=${e=>setEx(e.target.value)} class="w-full h-12 rounded-xl bg-zinc-800 text-white px-3 mb-3 outline-none">${names.map(n=>html`<option key=${n} value=${n}>${n}</option>`)}</select>
   <div class="flex gap-2 mb-2"><${Tg} k="w" l="Max súly"/><${Tg} k="v" l="Térfogat"/><${Tg} k="r" l="Becsült 1RM"/></div>
   ${pts.length>0&&html`<div class="text-sm text-zinc-400">Legjobb: <span class="fd text-2xl font-bold text-lime-400">${fmt(Math.max(...pts.map(p=>p.v)))}</span> kg</div>`}
   <${Chart} pts=${pts}/></div>`}
  ${dates.map(d=>html`<div key=${d} class="mb-4"><h2 class="text-sm text-zinc-400 mb-2">${fd(d)}</h2>
   ${hist.filter(w=>w.date===d).map(w=>html`<div key=${w.id} class="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-2">
    <div class="flex items-center justify-between mb-2"><div><div class="fd text-2xl font-bold leading-tight">${w.name}</div><div class="text-xs text-zinc-400">${fmt(w.vol)} kg összes térfogat</div></div>
     <button onClick=${()=>del(w.id)} class="h-10 w-10 flex items-center justify-center text-zinc-500"><${Ic} n="trash" s=${18}/></button></div>
    ${w.ex.map(e=>html`<div key=${e.n} class="py-1.5 border-t border-zinc-800 text-sm"><div class="font-medium">${e.n}</div><div class="text-zinc-400">${e.sets.map(s=>`${s.kg||0}×${s.reps||0}${s.rpe?' @'+s.rpe:''}`).join(',  ')}</div></div>`)}
   </div>`)}</div>`)}
 </div>`;
}

const MOT=['A mai edzés a holnapi önbizalmad alapja.','Nem kell tökéletesnek lenni, elég megjelenni.','Egy sorozattal mindig többet bírsz, mint hiszed.','A fejlődés apró lépésekből áll, ma egy kicsit nehezebb.','Ma a saját rekordod a versenytársad.','A fegyelem erősebb a motivációnál.'];
const allT=()=>[...T,...CTG];const daysList=()=>allT().flatMap(t=>t.days.map((d,i)=>({v:t.id+':'+i,...d})));
const dayOf=v=>daysList().find(x=>x.v===v);
const up=w=>{const s=OPT.step||1.25,x=Math.ceil(w*(1+(OPT.pct||2.5)/100)/s)*s;return x>w?x:w+s};
const bestSet=(hist,n,day)=>{for(const w of hist){if(day&&w.name!==day)continue;const e=w.ex.find(x=>x.n===n);if(e)return e.sets.reduce((a,b)=>(+b.kg||0)>(+a.kg||0)?b:a)}return null};
const goalsFor=(hist,d)=>d.e.map(n=>{const s=bestSet(hist,n,d.n)||bestSet(hist,n),w=s&&+s.kg>0?up(+s.kg):0;return{n,kg:w,reps:s?s.reps:'',txt:tr(n)+': '+(w?w+' kg × '+(s.reps||'?'):tr('új gyakorlat, találd meg a kezdősúlyt'))}});
const remind=(hist,v)=>{const x=dayOf(v);return{t:tr('Ma: ')+tr(x.n),b:tr(MOT[new Date().getDate()%MOT.length])+'\n'+tr('Célok:')+'\n'+goalsFor(hist,x).map(g=>g.txt).join('\n')}};

function Plan({plan,setPlan,hist,begin,today}){
 const W=[[1,'Hétfő'],[2,'Kedd'],[3,'Szerda'],[4,'Csütörtök'],[5,'Péntek'],[6,'Szombat'],[0,'Vasárnap']],td=new Date().getDay();
 const set=(d,v)=>setPlan(p=>({...p,days:{...p.days,[d]:v||null}}));
 const tgl=async()=>{if(!plan.on){try{await Notification.requestPermission()}catch(e){}}setPlan(p=>({...p,on:!p.on}))};
 const gl=d=>{const v=plan.days[d],m=remind(hist,v),t=new Date(),[hh,mm]=plan.time.split(':');t.setDate(t.getDate()+((d-t.getDay()+7)%7));const ymd=`${t.getFullYear()}${pad(t.getMonth()+1)}${pad(t.getDate())}`,en=+hh<23?pad(+hh+1)+mm:'2359';return 'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:tr('Edzés')+': '+tr(dayOf(v).n),details:m.b,dates:`${ymd}T${hh}${mm}00/${ymd}T${en}00`,recur:'RRULE:FREQ=WEEKLY;BYDAY='+BDY[d]}).toString()};
 const test=()=>{try{const L=getLN();L&&L.schedule({notifications:[{id:7002,title:tr('Teszt értesítés'),body:tr('Így fog kinézni az emlékeztető.'),schedule:{at:new Date(Date.now()+3000)}}]})}catch(e){}const v=Object.values(plan.days).find(Boolean),m=v?remind(hist,v):{t:tr('Teszt értesítés'),b:tr('Így fog kinézni az emlékeztető.')};toast(m.t+': '+m.b.split('\n')[0]);try{Notification.permission==='granted'&&new Notification(m.t,{body:m.b})}catch(e){}};
 const ics=()=>{
  const BD=['SU','MO','TU','WE','TH','FR','SA'],[hh,mm]=plan.time.split(':'),esc=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const f=t=>`${t.getFullYear()}${pad(t.getMonth()+1)}${pad(t.getDate())}T${hh}${mm}00`;
  const ev=W.filter(([d])=>plan.days[d]).map(([d])=>{const v=plan.days[d],m=remind(hist,v),t=new Date();t.setDate(t.getDate()+((d-t.getDay()+7)%7));
   return['BEGIN:VEVENT','UID:en-'+d+'@edzesnaplo','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z','DTSTART:'+f(t),'DURATION:PT1H','RRULE:FREQ=WEEKLY;BYDAY='+BD[d],'SUMMARY:'+esc(tr('Edzés')+': '+tr(dayOf(v).n)),'DESCRIPTION:'+esc(m.b),'BEGIN:VALARM','TRIGGER:-PT0M','ACTION:DISPLAY','DESCRIPTION:'+esc(m.t),'END:VALARM','END:VEVENT'].join('\r\n')});
  const b=new Blob(['BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Edzesnaplo//HU\r\n'+ev.join('\r\n')+'\r\nEND:VCALENDAR'],{type:'text/calendar'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='edzesterv.ics';a.click();toast('Naptárfájl letöltve: nyisd meg és importáld.');
 };
 return html`<div>
  <h1 class='fd text-4xl font-bold'>Edzésterv</h1><p class='text-sm text-zinc-400 mb-4'>Válaszd ki, melyik napon mit edzel. A cél az előző hasonló edzésed legnehezebb sorozata +${String(OPT.pct).replace('.',',')}%.</p>
  <div class='flex gap-2 mb-4'><button onClick=${()=>setPlan(p=>({...p,days:{1:'ppl:0',2:'ppl:1',3:'ppl:2',5:'ul:0',6:'ul:1'}}))} class='flex-1 h-11 rounded-xl bg-zinc-800 text-sm'>Minta terv</button><button onClick=${()=>setPlan(p=>({...p,days:{}}))} class='flex-1 h-11 rounded-xl bg-zinc-800 text-sm text-zinc-400'>Törlés</button></div>
  ${W.map(([d,l])=>{const v=plan.days[d],x=v&&dayOf(v),g=x?goalsFor(hist,x):[];return html`<div key=${d} class=${'up rounded-2xl border p-3 mb-2 bg-zinc-900 '+(d===td?'border-lime-400/60':'border-zinc-800')}>
   <div class='flex items-center gap-3'><span class='fd text-xl shrink-0' style=${{minWidth:'6rem'}}>${l}</span><select value=${v||''} onChange=${e=>set(d,e.target.value)} class='flex-1 h-11 rounded-xl bg-zinc-800 text-white px-3 outline-none'><option value=''>Pihenőnap</option>${daysList().map(o=>html`<option key=${o.v} value=${o.v}>${o.n}</option>`)}</select></div>
   ${x&&html`<${CycChip} k=${wdNext(d)}/>`}
   ${x&&html`<div class='mt-2 text-xs text-zinc-400 grid gap-0.5'>${g.map(y=>html`<div key=${y.n} class='flex justify-between gap-2'><span>${y.n}</span><span class='text-lime-300 shrink-0'>${y.kg?y.kg+' kg × '+(y.reps||'?'):'új'}</span></div>`)}</div>`}
   ${x&&d===td&&html`<button onClick=${()=>begin(x.n,x.e,Object.fromEntries(g.map(y=>[y.n,y])),today)} class='mt-3 w-full h-12 rounded-xl bg-lime-400 text-black font-bold'>Mai edzés indítása a célokkal</button>`}</div>`})}
  <div class='rounded-2xl border border-zinc-800 bg-zinc-900 p-4 mt-4'>
   <div class='flex items-center justify-between mb-3'><div><div class='font-semibold'>Értesítések</div><div class='text-xs text-zinc-500'>Motiváció, napi edzés és célsúlyok</div></div>
    <button onClick=${tgl} class=${'w-14 h-8 rounded-full p-1 '+(plan.on?'bg-lime-400':'bg-zinc-700')}><span class=${'block w-6 h-6 rounded-full bg-white transition-transform '+(plan.on?'translate-x-6':'')}></span></button></div>
   <label class='flex items-center justify-between text-sm'>Időpont<input type='time' value=${plan.time} onChange=${e=>setPlan(p=>({...p,time:e.target.value}))} class='h-11 rounded-xl bg-zinc-800 px-3 text-white'/></label>
   <div class='text-sm font-semibold mt-4 mb-2'>Naptár-emlékeztető</div><div class='grid gap-2'>${W.filter(([d])=>plan.days[d]).map(([d,l])=>html`<a key=${d} href=${gl(d)} target='_blank' rel='noopener noreferrer' class='h-12 rounded-xl border border-cyan-400/50 text-cyan-300 font-semibold flex items-center justify-center'>${l}: hozzáadás a Google Naptárhoz</a>`)}${!W.some(([d])=>plan.days[d])&&html`<p class='text-xs text-zinc-500'>Előbb jelölj ki edzésnapokat.</p>`}</div>
   <div class='grid grid-cols-2 gap-2 mt-2'><button onClick=${test} class='h-11 rounded-xl bg-zinc-800 text-sm'>Teszt értesítés</button><button onClick=${ics} class='h-11 rounded-xl bg-zinc-800 text-sm'>.ics fájl</button></div>
   <p class='text-xs text-zinc-500 mt-2'>Az app csak nyitva tud értesíteni. Zárt appnál a naptár értesít: a gombok megnyitják a Google Naptárat kitöltött, hetente ismétlődő eseménnyel, csak mentsd el benne. A célsúlyok a hozzáadáskori állapotot mutatják.</p></div></div>`;
}

function Lvl({hist}){
 const xp=hist.reduce((a,w)=>a+w.ex.reduce((b,e)=>b+e.sets.length*10,0)+w.vol/100,0),L=Math.floor(Math.sqrt(xp/60))+1,a=60*(L-1)**2,pc=(xp-a)/(60*L*L-a)*100;
 const wk=new Set(hist.map(w=>weekOf(w.date)[0])),cur=weekOf(dk(new Date()))[0],d=pd(cur);let st=0;if(!wk.has(cur))d.setDate(d.getDate()-7);while(wk.has(dk(d))){st++;d.setDate(d.getDate()-7)}
 const tw=hist.filter(w=>weekOf(w.date)[0]===cur).length,goal=OPT.wg||3,prs=hist.reduce((a,w)=>a+w.ex.reduce((b,e)=>b+e.sets.filter(x=>x.pr).length,0),0),tv=hist.reduce((a,w)=>a+w.vol,0);
 const B=[['Első edzés',hist.length>=1],['10 edzés',hist.length>=10],['50 edzés',hist.length>=50],['10 000 kg',tv>=1e4],['100 000 kg',tv>=1e5],['3 hetes széria',st>=3],['Rekordvadász',prs>=5]];
 const Bar=({v,c})=>html`<div class='h-2 rounded-full bg-zinc-800 overflow-hidden'><div class=${'h-full transition-all duration-700 '+c} style=${{width:Math.min(100,v)+'%'}}></div></div>`;
 return html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mt-5'>
  <div class='flex items-end justify-between mb-2'><div><div class='fd text-3xl font-bold text-lime-400 leading-none'>Szint ${L}</div><div class='text-xs text-zinc-400'>${Math.round(xp)} XP</div></div><div class='text-right'><div class='fd text-3xl leading-none'>${st}</div><div class='text-xs text-zinc-400'>hetes széria</div></div></div>
  <${Bar} v=${pc} c='bg-lime-400'/>
  <div class='flex justify-between text-sm mt-3 mb-1'><span>Heti cél</span><span>${tw} / ${goal}</span></div><${Bar} v=${tw/goal*100} c=${tw>=goal?'bg-lime-400':'bg-cyan-400'}/>
  <div class='flex flex-wrap gap-1.5 mt-3'>${B.map(([n,ok])=>html`<span key=${n} class=${'px-2.5 py-1 rounded-full text-xs '+(ok?'bg-lime-400 text-black font-semibold':'bg-zinc-800 text-zinc-500')}>${n}</span>`)}</div></div>`;
}
function Rec({hist}){
 const b={};for(const w of hist)for(const e of w.ex)for(const s of e.sets){const k=+s.kg||0,r=+s.reps||0;if(!k)continue;const m=k*(1+r/30);if(!b[e.n]||m>b[e.n].m)b[e.n]={m,k,r,d:w.date}}
 const rs=Object.entries(b).sort((a,c)=>c[1].m-a[1].m).slice(0,6),lim=dk(new Date(Date.now()-6*864e5)),g={};GR.forEach(x=>g[x]=0);
 for(const w of hist)if(w.date>=lim)for(const e of w.ex)if(GOF[e.n])g[GOF[e.n]]+=e.sets.length;
 const mx=Math.max(1,...Object.values(g));
 return html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-5'><h2 class='font-semibold mb-2'>Rekordok (becsült 1RM)</h2>
  ${rs.map(([n,r])=>html`<div key=${n} class='flex justify-between py-1.5 border-t border-zinc-800 text-sm'><span class='pr-2'>${n}<span class='block text-xs text-zinc-500'>${r.k} kg × ${r.r}, ${fs(r.d)}</span></span><span class='fd text-2xl text-lime-400 shrink-0'>${Math.round(r.m)} kg</span></div>`)}
  <h2 class='font-semibold mt-5 mb-3'>Izomcsoportok, utolsó 7 nap (sorozat)</h2>
  ${GR.map(x=>html`<div key=${x} class='flex items-center gap-2 mb-1.5 text-sm'><span class='w-14 text-zinc-400'>${x}</span><div class='flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden'><div class='h-full bg-lime-400 rounded-full transition-all duration-700' style=${{width:(g[x]/mx*100)+'%'}}></div></div><span class='w-6 text-right'>${g[x]}</span></div>`)}
  ${Object.values(g).some(v=>!v)&&html`<p class='text-xs text-zinc-500 mt-2'>Hiányzó csoportok: ${GR.filter(x=>!g[x]).map(tr).join(', ')}</p>`}</div>`;
}
function Pick({onPick,onClose}){
 const[q,setQ]=useState(''),[g,setG]=useState('Mind'),ql=q.toLowerCase(),list=EX.filter(x=>(g==='Mind'||x.g===g)&&(x.n.toLowerCase().includes(ql)||tr(x.n).toLowerCase().includes(ql)));
 return html`<div class='fade fixed inset-0 z-50 bg-black/70 flex items-end' onClick=${onClose}><div class='sheet w-full max-w-md mx-auto bg-zinc-900 rounded-t-3xl p-4 max-h-[80vh] flex flex-col' onClick=${e=>e.stopPropagation()}>
  <div class='flex items-center justify-between mb-3'><h3 class='fd text-2xl font-bold'>Gyakorlatok és gépek</h3><button onClick=${onClose} class='h-10 w-10 flex items-center justify-center text-zinc-400'><${Ic} n='x'/></button></div>
  <input value=${q} onChange=${e=>setQ(e.target.value)} placeholder='Keresés' class=${inp+' !text-left px-4 !text-base mb-3 shrink-0'}/>
  <div class='flex gap-2 overflow-x-auto pb-3 shrink-0'>${['Mind',...GR].map(x=>html`<button key=${x} onClick=${()=>setG(x)} class=${'h-10 px-4 rounded-full text-sm shrink-0 '+(g===x?'bg-lime-400 text-black font-semibold':'bg-zinc-800 text-zinc-300')}>${x}</button>`)}</div>
  <div class='overflow-y-auto'>${list.map(x=>html`<button key=${x.n} onClick=${()=>onPick(x.n)} class='w-full text-left py-3.5 px-2 border-b border-zinc-800 flex justify-between'><span>${x.n}</span><span class='text-xs text-zinc-500'>${x.g}</span></button>`)}</div></div></div>`;
}
function Editor({ct,setCt}){
 const[sel,setSel]=useState(null),[nm,setNm]=useState(''),[pk,setPk]=useState(null),t=ct.find(x=>x.id===sel);
 const mk=()=>{const n=nm.trim();if(!n)return;const x={id:'c'+Date.now(),n,s:'Saját terv',days:[{n:n+' – 1',e:[]}]};setCt([...ct,x]);setSel(x.id);setNm('')};
 const up2=fn=>setCt(ct.map(x=>x.id===sel?fn(x):x)),setDay=(i,fn)=>up2(x=>({...x,days:x.days.map((d,j)=>j===i?fn(d):d)}));
 if(!t)return html`<div><h1 class='fd text-4xl font-bold mb-1'>Tervszerkesztő</h1><p class='text-sm text-zinc-400 mb-4'>Állítsd össze a saját edzésterveidet, majd válaszd ki őket az Edzés és a Terv fülön.</p>
  ${ct.map(x=>html`<div key=${x.id} class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-2 flex items-center justify-between'><button onClick=${()=>setSel(x.id)} class='text-left flex-1'><div class='font-semibold'>${x.n}</div><div class='text-xs text-zinc-400'>${x.days.length} nap, ${x.days.reduce((a,d)=>a+d.e.length,0)} gyakorlat</div></button><button onClick=${()=>setCt(ct.filter(y=>y.id!==x.id))} class='h-10 w-10 flex items-center justify-center text-zinc-500'><${Ic} n='trash' s=${18}/></button></div>`)}
  <div class='flex gap-2 mt-3'><input value=${nm} onChange=${e=>setNm(e.target.value)} placeholder='Új terv neve' class=${inp+' !text-left px-4 !text-base'}/><button onClick=${mk} class='h-12 px-5 rounded-xl bg-lime-400 text-black font-bold shrink-0'>Létrehozás</button></div></div>`;
 return html`<div><div class='flex items-center gap-2 mb-4'><button onClick=${()=>setSel(null)} class='h-10 w-10 flex items-center justify-center text-zinc-400'><${Ic} n='chevL'/></button><h1 class='fd text-3xl font-bold'>${t.n}</h1></div>
  ${t.days.map((d,i)=>html`<div key=${i} class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-3'>
   <div class='flex gap-2 mb-2'><input value=${d.n} onChange=${e=>setDay(i,x=>({...x,n:e.target.value}))} class=${inp+' !text-left px-3 !text-base'}/><button onClick=${()=>up2(x=>({...x,days:x.days.filter((_,j)=>j!==i)}))} class='h-12 w-12 flex items-center justify-center text-zinc-500 shrink-0'><${Ic} n='trash' s=${18}/></button></div>
   ${d.e.map((n,k)=>html`<div key=${k} class='flex items-center justify-between py-1.5 border-t border-zinc-800 text-sm'><span class='pr-2'>${n}</span><button onClick=${()=>setDay(i,x=>({...x,e:x.e.filter((_,j)=>j!==k)}))} class='text-zinc-500'><${Ic} n='x' s=${16}/></button></div>`)}
   <button onClick=${()=>setPk(i)} class='w-full h-11 rounded-xl bg-zinc-800 text-sm flex items-center justify-center gap-1.5 mt-2'><${Ic} n='plus' s=${16}/>Gyakorlat</button></div>`)}
  <button onClick=${()=>up2(x=>({...x,days:[...x.days,{n:x.n+' – '+(x.days.length+1),e:[]}]}))} class='w-full h-12 rounded-2xl border border-dashed border-zinc-700 text-zinc-300'>Nap hozzáadása</button>
  ${pk!==null&&html`<${Pick} onClose=${()=>setPk(null)} onPick=${n=>{setDay(pk,x=>({...x,e:[...x.e,n]}));setPk(null)}}/>`}</div>`;
}
function Info({n,onClose}){
 const g=GOF[n]||'',cb=/csig|Cable|Crossover/i.test(n),mc=!cb&&/gép|Machine|Smith|Hack|Pec Deck|Stairmaster|Pendulum|Belt|Assisted/i.test(n),bb=!cb&&!mc&&/rúd|Ez-/i.test(n),db=!cb&&!mc&&!bb&&/súlyz/i.test(n);
 const kind=cb?'Csigás gyakorlat':mc?'Gépes gyakorlat':bb?'Rudas gyakorlat':db?'Súlyzós gyakorlat':'Testsúlyos vagy egyéb gyakorlat';
 const T1={c:['Állítsd a csiga magasságát a mozgáshoz, a kábel végig feszes maradjon.','Lépj hátra, hogy a súlyt ne a lendület mozgassa.','A törzsed stabil, csak a célizom dolgozik.'],m:['Állítsd az ülést úgy, hogy az ízület a gép forgáspontjával egy vonalban legyen.','Állítsd be a párna vagy kapaszkodó magasságát, hogy a teljes mozgástartomány kényelmes legyen.','Ne zárd ki teljesen az ízületet a végállásban, tartsd feszesen az izmot.'],b:['Fogd meg a rudat stabilan, a csukló legyen egyenesben.','Feszítsd meg a törzsedet, mielőtt elindítod a mozgást.','Nehéz sorozatnál legyen biztosítás (rack vagy társ).'],d:['Olyan súlyt válassz, amit végig kontrolláltan mozgatsz.','Mindkét kar egyformán dolgozzon, ne lendülj a testtel.','A súlyzókat óvatosan tedd le, ne ejtsd el.'],w:['Tartsd a testet egy vonalban, a törzs legyen feszes.','Ha túl nehéz, használj segítséget (gumiszalag vagy gép).']};
 const GC={Mell:'Lapockák hátra és le, mellkas kiemelve.',Hát:'A lapockák összehúzásával indíts, ne a karokkal húzz.',Láb:'A térd a lábfej irányába nézzen, a sarok maradjon a földön.',Váll:'Ne húzd a vállad a füled felé.',Kar:'A könyök maradjon a test mellett, ne lendülj.',Törzs:'Lassú, kontrollált mozgás, a derekad ne ívelődjön.'};
 const tips=[...T1[cb?'c':mc?'m':bb?'b':db?'d':'w'],GC[g],'Bemelegítés: 1–2 könnyű sorozat az első nehéz előtt.','Lassan emelj (1–2 mp), lassabban engedd vissza (2–3 mp).','Ha az ízületedben fájdalmat érzel, hagyd abba.'].filter(Boolean);
 return html`<div class='fade fixed inset-0 z-50 bg-black/70 flex items-end' onClick=${onClose}><div class='sheet w-full max-w-md mx-auto bg-zinc-900 rounded-t-3xl p-4 max-h-[80vh] overflow-y-auto' onClick=${e=>e.stopPropagation()}>
  <div class='flex items-start justify-between mb-1'><h3 class='fd text-2xl font-bold pr-2'>${n}</h3><button onClick=${onClose} class='h-10 w-10 flex items-center justify-center text-zinc-400 shrink-0'><${Ic} n='x'/></button></div>
  <div class='flex gap-2 mb-3'><span class='px-2.5 py-1 rounded-full bg-lime-400/15 text-lime-300 text-xs'>${g}</span><span class='px-2.5 py-1 rounded-full bg-zinc-800 text-xs'>${kind}</span></div>
  ${tips.map((x,i)=>html`<div key=${i} class='up flex gap-3 py-2 border-t border-zinc-800 text-sm' style=${{animationDelay:i*40+'ms'}}><span class='fd text-lg text-lime-400 w-5'>${i+1}</span><span>${x}</span></div>`)}
  <a href=${'https://www.youtube.com/results?search_query='+encodeURIComponent(tr(n)+' '+(LANG==='en'?'proper form':'helyes technika'))} target='_blank' rel='noopener noreferrer' class='sh mt-4 h-12 rounded-xl bg-lime-400 text-black font-bold flex items-center justify-center'>Videó keresése a YouTube-on</a></div></div>`;
}
const exportCSV=hist=>{const rows=[[tr('Dátum'),tr('Edzés'),tr('Gyakorlat'),tr('Sorozat'),tr('Súly (kg)'),tr('Ismétlés'),'RPE',tr('Térfogat')]];for(const w of hist)for(const e of w.ex)e.sets.forEach((s,i)=>rows.push([w.date,tr(w.name),tr(e.n),i+1,s.kg||0,s.reps||0,s.rpe||'',(+s.kg||0)*(+s.reps||0)]));
 const csv='\ufeff'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(';')).join('\r\n');
 try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='edzesnaplo.csv';a.click();toast(tr('Exportálás kész'))}catch(e){toast(tr('Az exportálás nem sikerült.'))}};
const exportPDF=hist=>{const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])),body=hist.map(w=>`<h3>${esc(w.date)} – ${esc(tr(w.name))} (${fmt(w.vol)} kg)</h3><table>${w.ex.map(e=>`<tr><td>${esc(tr(e.n))}</td><td>${e.sets.map(s=>`${s.kg||0}×${s.reps||0}`).join(', ')}</td></tr>`).join('')}</table>`).join('');
 const w=window.open('','_blank');if(!w)return toast(tr('A böngésző letiltotta az új ablakot.'));
 w.document.write(`<!doctype html><meta charset=utf-8><title>Edzésnapló</title><style>body{font:14px system-ui;margin:24px}h3{margin:18px 0 6px}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #ddd;padding:4px 6px}</style><h1>Edzésnapló</h1>${body}`);w.document.close();setTimeout(()=>w.print(),500)};

