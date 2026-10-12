/* ---------- Ciklus-követés: számítás, naptár, javaslat ----------
   Egészségügyi adat: csak helyben van (en:<uid>:cyc), NEM kerül a szinkronba (docNow) és az exportba sem.
   Eszközök közt a Ciklus képernyő export/import gombja viszi át. */
Object.assign(P,{drop:'<path d="M12 2.7s6 6.1 6 10.6a6 6 0 0 1-12 0C6 8.8 12 2.7 12 2.7z"/>'});
const CYC0={on:false,len:0,per:5,starts:[],ts:0}; // len 0 = automatikus (az utolsó ciklusok mediánja)
const cycAvail=()=>{const p=gj('prof',{});return !!(p.sexSel&&p.sex==='f')};
const cycGet=()=>({...CYC0,...gj('cyc',{})});
const cycSet=v=>{sj('cyc',{...v,ts:Date.now()});window.dispatchEvent(new Event('cyc'))};
const useCycRaw=()=>{const[,x]=useState(0);useEffect(()=>{const f=()=>x(v=>v+1);window.addEventListener('cyc',f);return()=>window.removeEventListener('cyc',f)},[]);return cycGet()};
const useCyc=()=>{const c=useCycRaw();return cycAvail()&&c.on?c:null};

const dd=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const addD=(k,n)=>{const d=pd(k);d.setDate(d.getDate()+n);return dk(d)};
const wdNext=d=>{const t=new Date();t.setDate(t.getDate()+((d-t.getDay()+7)%7));return dk(t)};
const med=a=>{const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:Math.round((s[m-1]+s[m])/2)};
const cycLen=c=>{if(c.len)return c.len;const s=[...c.starts].sort(),g=[];for(let i=1;i<s.length;i++)g.push(dd(s[i-1],s[i]));const r=g.filter(x=>x>=18&&x<=45).slice(-6);return r.length?med(r):28};
// Egy nap fázisa: {p:'mens'|'foll'|'ovul'|'lut', day, n, ov, logged}; null, ha nincs adat vagy túl régi az utolsó bejegyzés
const cycPhase=(c,k)=>{
 const s=[...c.starts].sort(),L=cycLen(c);let i=-1;for(let j=0;j<s.length;j++)if(s[j]<=k)i=j;
 if(i<0)return null;
 const day=dd(s[i],k),g=i<s.length-1?dd(s[i],s[i+1]):0;let n=L,d=day;
 if(g>=15&&g<=60){n=g}else{if(day>3*L)return null;d=day%L}
 const dn=d+1,ov=Math.max(n-14,c.per+2);
 return{p:dn<=c.per?'mens':dn<ov-1?'foll':dn<=ov+1?'ovul':'lut',day:dn,n,ov,logged:day<c.per}};
// Következő becsült menstruáció és ovuláció a mai naptól
const cycNext=(c,today)=>{
 if(!c.starts.length)return null;
 const s=[...c.starts].sort(),last=s[s.length-1],L=cycLen(c),ov=Math.max(L-14,c.per+2);
 let i=1;while(addD(last,L*i)<=today&&i<12)i++;
 let j=0;while(addD(last,L*j+ov-1)<today&&j<12)j++;
 return{per:addD(last,L*i),ovu:addD(last,L*j+ov-1),L}};

const CPH={
 mens:['Menstruáció','Ha jól érzed magad, edzhetsz a megszokott módon. Ha fáradtabb vagy, a könnyebb edzés, séta vagy nyújtás is rendben van. Hallgass a testedre.','Könnyebb edzés is rendben','rgba(244,63,94,.9)'],
 foll:['Tüszőfázis','Sokaknál ilyenkor jobb az energiaszint: jó időszak a nehezebb edzésekhez és az új célsúlyok kipróbálásához.','Jó időszak a nehezebb edzésekhez','rgba(34,211,238,.25)'],
 ovul:['Ovuláció környéke','Sokaknál jó az erőnlét. Alaposan melegíts be, és a technikára figyelj.','Alaposan melegíts be','rgba(250,204,21,.35)'],
 lut:['Sárgatest-fázis','Sokan fáradékonyabbnak érzik magukat a ciklus vége felé. Mérsékelt intenzitás, hosszabb pihenők és elegendő alvás segíthet, a célsúlyokat nem kell erőltetni.','Mérsékelt intenzitás is jó','rgba(167,139,250,.28)']};
const dayN=n=>LANG==='en'?'day '+n:n+'. nap',daysN=n=>LANG==='en'?n+(n===1?' day':' days'):n+' nap';
const CYC_NOTE='Tájékoztató jellegű becslés, nem helyettesíti az orvosi véleményt. A ciklusok egyénenként eltérnek.';

// Export / import (eszközök közti átvitel)
const cycExport=c=>JSON.stringify({app:'edzesnaplo-cycle',v:1,data:{len:c.len,per:c.per,starts:[...c.starts].sort(),ts:c.ts}});
const cycParse=t=>{
 const j=JSON.parse(t);if(!j||j.app!=='edzesnaplo-cycle'||!j.data)throw 0;
 const d=j.data,len=+d.len||0,per=+d.per||5;
 if(!Array.isArray(d.starts)||d.starts.length>600||!d.starts.every(s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&dk(pd(s))===s))throw 0;
 if(len&&(len<18||len>45)||per<1||per>12)throw 0;
 return{len,per,starts:[...new Set(d.starts)].sort(),ts:+d.ts||0}};
const cycMerge=(c,d)=>({...c,starts:[...new Set([...c.starts,...d.starts])].sort(),...(d.ts>c.ts?{len:d.len,per:d.per}:{})});

// Fázis-címke a Terv fülön
function CycChip({k}){
 const c=useCyc(),f=c&&cycPhase(c,k);if(!f)return null;const x=CPH[f.p];
 return html`<div class='mt-2 text-[11px] inline-block px-2 py-1 rounded-lg' style=${{background:x[3],color:f.p==='mens'?'#fff':undefined}}>${x[0]} · ${x[2]}</div>`;
}
// Mai javaslat a Kezdőlapon
function CycToday({nav}){
 const c=useCyc();if(!c)return null;
 const f=cycPhase(c,dk(new Date())),x=f&&CPH[f.p];
 return html`<button onClick=${()=>nav('cycle')} class='up w-full text-left bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 flex gap-3 items-start'><span class='mt-0.5 shrink-0' style=${{color:x?x[3].replace(/[\d.]+\)$/,'1)'):'#f472b6'}}><${Ic} n='drop' s=${22}/></span>
  <span>${f?html`<span class='block font-semibold'>${x[0]} · ${dayN(f.day)}</span><span class='block text-xs text-zinc-400 mt-1'>${x[1]}</span>`:html`<span class='block font-semibold'>Ciklus</span><span class='block text-xs text-zinc-400 mt-1'>Jelöld be az utolsó menstruáció első napját a javaslathoz.</span>`}</span></button>`;
}
// Felugró ablak: a Nő kiválasztása után jelzi, hogy elérhető a funkció
function CycPop({go}){
 const[o,setO]=useState(false);
 useEffect(()=>{const f=()=>setO(true);window.addEventListener('cycprompt',f);return()=>window.removeEventListener('cycprompt',f)},[]);
 if(!o)return null;
 return html`<div class='fade fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6' onClick=${()=>setO(false)}><div class='up w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center' onClick=${e=>e.stopPropagation()}>
  <div class='w-14 h-14 mx-auto mb-3 rounded-2xl bg-lime-400 text-black flex items-center justify-center'><${Ic} n='drop' s=${28}/></div>
  <div class='fd text-3xl font-bold'>Elérhető a ciklus-követés</div>
  <p class='text-sm text-zinc-400 mt-2'>Ciklus-naptár és kalkulátor, a ciklusfázishoz igazodó edzési javaslatokkal. Az adat csak ezen az eszközön marad, és bármikor kikapcsolhatod.</p>
  <button onClick=${()=>{cycSet({...cycGet(),on:true});setO(false);go('cycle')}} class='w-full h-12 rounded-xl bg-lime-400 text-black font-bold mt-4'>Bekapcsolom</button>
  <button onClick=${()=>setO(false)} class='w-full h-11 rounded-xl bg-zinc-800 text-sm mt-2'>Később</button></div></div>`;
}

const CSt=({v,on,min,max})=>html`<div class='flex items-center gap-2'><button onClick=${()=>on(Math.max(min,v-1))} class='h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center'><${Ic} n='minus' s=${16}/></button><span class='fd text-xl font-bold w-10 text-center'>${v}</span><button onClick=${()=>on(Math.min(max,v+1))} class='h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center'><${Ic} n='plus' s=${16}/></button></div>`;

function Cycle({plan,hist,today}){
 const c=useCycRaw(),[mo,setMo]=useState(()=>{const d=pd(today);return new Date(d.getFullYear(),d.getMonth(),1)}),[sd,setSd]=useState(today),[bk,setBk]=useState(''),[cf,setCf]=useState(false);
 const set=o=>cycSet({...c,...o}),bt='h-11 rounded-xl bg-zinc-800 text-sm font-semibold';
 if(!cycAvail())return html`<div><h1 class='fd text-4xl font-bold mb-3'>Ciklus</h1><p class='text-sm text-zinc-400'>Ez a funkció akkor érhető el, ha a Kardió vagy Kalória számoló Profil kártyáján a Nő nemet választod.</p></div>`;
 if(!c.on)return html`<div><h1 class='fd text-4xl font-bold mb-3'>Ciklus</h1>
  <div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4'><p class='text-sm text-zinc-300'>Ciklus-naptár és kalkulátor, a ciklusfázishoz igazodó edzési javaslatokkal. Az adat csak ezen az eszközön van, nem kerül a szerverre.</p><button onClick=${()=>set({on:true})} class='w-full h-12 rounded-xl bg-lime-400 text-black font-bold mt-4'>Bekapcsolom</button></div>
  <${Imp} c=${c} bk=${bk} setBk=${setBk} set=${set}/><p class='text-[10px] text-zinc-500 mt-3'>${CYC_NOTE}</p></div>`;
 const f=cycPhase(c,today),x=f&&CPH[f.p],nx=cycNext(c,today),y=mo.getFullYear(),m=mo.getMonth(),lead=(mo.getDay()+6)%7,nd=new Date(y,m+1,0).getDate();
 const cells=[...Array(lead).fill(null),...Array.from({length:nd},(_,i)=>dk(new Date(y,m,i+1)))];
 const sf=cycPhase(c,sd),sw=plan.days[pd(sd).getDay()],sx=sw&&dayOf(sw),sh=hist.filter(w=>w.date===sd);
 const toggle=()=>set({starts:c.starts.includes(sd)?c.starts.filter(s=>s!==sd):[...c.starts,sd].sort()});
 const Row=({l,v})=>html`<div class='flex justify-between text-sm py-1.5 border-b border-zinc-800'><span class='text-zinc-400'>${l}</span><span class='text-right'>${v}</span></div>`;
 return html`<div><h1 class='fd text-4xl font-bold mb-3'>Ciklus</h1>
  <div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'>
   ${f?html`<div class='flex items-center gap-2'><span class='w-3 h-3 rounded-full' style=${{background:x[3]}}></span><span class='font-semibold'>${x[0]}</span><span class='text-xs text-zinc-400'>${dayN(f.day)} / ${f.n}</span></div><p class='text-sm text-zinc-300 mt-2'>${x[1]}</p>`:html`<div class='font-semibold'>Nincs mai becslés</div><p class='text-sm text-zinc-400 mt-1'>Jelöld be az utolsó menstruáció első napját a naptárban (válaszd ki a napot, majd nyomd meg a gombot).</p>`}
   <p class='text-[10px] text-zinc-500 mt-2'>${CYC_NOTE}</p></div>
  <div class='bg-zinc-900 rounded-2xl p-3 border border-zinc-800 mb-3'>
   <div class='flex items-center justify-between mb-2'><button onClick=${()=>setMo(new Date(y,m-1,1))} class='h-10 w-10 flex items-center justify-center text-zinc-400'><${Ic} n='chevL'/></button><span class='text-sm text-zinc-300'>${LANG==='en'?MNE[m]:MN[m].replace('.','')} ${y}</span><button onClick=${()=>setMo(new Date(y,m+1,1))} class='h-10 w-10 flex items-center justify-center text-zinc-400'><${Ic} n='chevL' c='rotate-180'/></button></div>
   <div class='grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500 mb-1'>${(LANG==='en'?['M','T','W','T','F','S','S']:['H','K','Sze','Cs','P','Szo','V']).map((d,i)=>html`<span key=${i}>${d}</span>`)}</div>
   <div class='grid grid-cols-7 gap-1'>${cells.map((k,i)=>{if(!k)return html`<span key=${i}></span>`;const p=cycPhase(c,k),cl=p&&CPH[p.p][3],lg=p&&p.p==='mens'&&p.logged,pl=plan.days[pd(k).getDay()]&&k>=today,dn=hist.some(w=>w.date===k);
    return html`<button key=${k} onClick=${()=>setSd(k)} class=${'h-11 rounded-lg flex flex-col items-center justify-center text-sm '+(k===sd?'ring-2 ring-lime-400 ':'')+(k===today?'font-bold':'')} style=${{background:cl||'transparent',color:lg?'#fff':undefined,opacity:p&&p.p==='mens'&&!lg?.75:1}}>${+k.slice(8)}<span class='h-1.5 flex gap-0.5'>${pl&&html`<i class='w-1.5 h-1.5 rounded-full bg-lime-400'></i>`}${dn&&html`<i class='w-1.5 h-1.5 rounded-full bg-cyan-400'></i>`}</span></button>`})}</div>
   <div class='flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-zinc-400'>${Object.entries(CPH).map(([k,v])=>html`<span key=${k} class='flex items-center gap-1'><i class='w-2 h-2 rounded-full' style=${{background:v[3]}}></i>${v[0]}</span>`)}<span class='flex items-center gap-1'><i class='w-2 h-2 rounded-full bg-lime-400'></i>Tervezett edzés</span><span class='flex items-center gap-1'><i class='w-2 h-2 rounded-full bg-cyan-400'></i>Elvégzett edzés</span></div></div>
  <div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'><div class='font-semibold mb-1'>${fd(sd)}</div>
   <${Row} l='Fázis' v=${sf?CPH[sf.p][0]+' · '+dayN(sf.day):'–'}/><${Row} l='Tervezett edzés' v=${sx?sx.n:'–'}/><${Row} l='Elvégzett edzés' v=${sh.length?sh.map(w=>w.name).join(', '):'–'}/>
   ${sf&&sd>=today&&html`<p class='text-xs text-zinc-400 mt-2'>${CPH[sf.p][2]}</p>`}
   <button onClick=${toggle} disabled=${sd>today} class=${'w-full h-11 rounded-xl text-sm font-semibold mt-3 '+(sd>today?'bg-zinc-800 text-zinc-500':c.starts.includes(sd)?'bg-zinc-800 text-red-400':'bg-lime-400 text-black')}>${sd>today?'Jövőbeli napot nem jelölhetsz':c.starts.includes(sd)?'Menstruáció kezdetének törlése':'Itt kezdődött a menstruáció'}</button></div>
  <div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'><div class='font-semibold mb-1'>Kalkulátor</div>
   ${nx?html`<${Row} l='Következő menstruáció (becslés)' v=${fd(nx.per)+' ('+(LANG==='en'?'in '+daysN(dd(today,nx.per)):dd(today,nx.per)+' nap múlva')+')'}/><${Row} l='Ovuláció (becslés)' v=${fd(nx.ovu)}/><${Row} l='Számolt ciklushossz' v=${daysN(nx.L)}/>`:html`<p class='text-sm text-zinc-400'>Jelöld be legalább egy menstruáció első napját.</p>`}
   <${Row} l='Rögzített ciklusok' v=${c.starts.length}/>
   <div class='flex items-center justify-between mt-3'><span class='text-sm'>Ciklus hossza</span><div class='flex items-center gap-2'><button onClick=${()=>set({len:0})} class=${'h-10 px-3 rounded-xl text-xs font-semibold '+(c.len?'bg-zinc-800 text-zinc-300':'bg-lime-400 text-black')}>Auto</button><${CSt} v=${c.len||cycLen(c)} on=${v=>set({len:v})} min=${21} max=${45}/></div></div>
   <div class='flex items-center justify-between mt-3'><span class='text-sm'>Menstruáció hossza</span><${CSt} v=${c.per} on=${v=>set({per:v})} min=${2} max=${10}/></div>
   <p class='text-[10px] text-zinc-500 mt-2'>Az ovuláció becslése nem alkalmas fogamzásgátlásra.</p></div>
  <${Imp} c=${c} bk=${bk} setBk=${setBk} set=${set}/>
  <div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'><div class='font-semibold mb-1'>Kikapcsolás és törlés</div><p class='text-xs text-zinc-500 mb-3'>Kikapcsolva a funkció sehol nem jelenik meg, az adat megmarad. A törlés végleges.</p>
   <div class='grid grid-cols-2 gap-2'><button onClick=${()=>set({on:false})} class=${bt}>Kikapcsolás</button><button onClick=${()=>{if(cf){cycSet({...CYC0});setCf(false);toast('Ciklus-adatok törölve')}else setCf(true)}} class=${'h-11 rounded-xl text-sm font-semibold '+(cf?'bg-red-500 text-white':'bg-zinc-800 text-red-400')}>${cf?'Biztosan törlöd?':'Adatok törlése'}</button></div></div></div>`;
}
// Átvitel másik eszközre: letölthető fájl vagy másolható szöveg, és visszatöltés
function Imp({c,bk,setBk,set}){
 const bt='h-11 rounded-xl bg-zinc-800 text-sm font-semibold',
  exp=()=>{const j=cycExport(c);setBk(j);try{navigator.clipboard.writeText(j).catch(()=>{})}catch(e){}try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([j],{type:'application/json'}));a.download='ciklus-adatok.json';a.click();toast('Ciklus-adatok exportálva')}catch(e){toast('Az exportálás nem sikerült.')}},
  imp=()=>{try{const d=cycParse(bk);cycSet({...cycMerge(c,d),on:true});setBk('');toast('Ciklus-adatok betöltve')}catch(e){toast('A fájl vagy a szöveg hibás')}},
  file=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>setBk(String(r.result));r.readAsText(f)};
 return html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3 mt-3'><div class='font-semibold mb-1'>Átvitel másik eszközre</div><p class='text-xs text-zinc-500 mb-3'>Az adat nem kerül a szerverre. Exportáld fájlba, majd a másik eszközön töltsd vissza a fájlt vagy a szöveget. A betöltés hozzáadja a hiányzó dátumokat.</p>
  <div class='grid grid-cols-2 gap-2 mb-2'><button onClick=${exp} class=${bt}>Exportálás fájlba</button><label class=${bt+' flex items-center justify-center'}>Fájl kiválasztása<input type='file' accept='.json,application/json' onChange=${file} class='hidden'/></label></div>
  <textarea value=${bk} onChange=${e=>setBk(e.target.value)} placeholder='Az exportált szöveg ide másolható a visszatöltéshez' class='w-full h-20 rounded-xl bg-zinc-800 text-xs p-3 text-white outline-none mb-2'></textarea>
  <button onClick=${imp} class=${'w-full '+bt}>Visszatöltés</button></div>`;
}
