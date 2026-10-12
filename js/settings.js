const BDY=['SU','MO','TU','WE','TH','FR','SA'];
const ACCS={lime:['Lime','190 242 100','163 230 53','#a3e635'],cyan:['Kék','165 243 252','34 211 238','#22d3ee'],violet:['Lila','196 181 253','167 139 250','#a78bfa'],orange:['Narancs','253 186 116','251 146 60','#fb923c'],pink:['Rózsaszín','249 168 212','244 114 182','#f472b6'],red:['Piros','252 165 165','248 113 113','#f87171']};
const THEMES={alap:['Alap','63 63 70','39 39 42','24 24 27','9 11 14'],amoled:['AMOLED','43 43 48','26 26 29','12 12 14','0 0 0'],kek:['Éjkék','45 63 94','28 42 66','17 26 43','10 16 32'],grafit:['Grafit','68 72 80','46 49 54','32 34 38','18 19 22']};
const Cd=({t,children})=>html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'><div class='font-semibold mb-3'>${t}</div>${children}</div>`;
const Lb=({t})=>html`<div class='text-xs text-zinc-400 mt-3 mb-2'>${t}</div>`;
const Sw=({l,s,v,on})=>html`<button onClick=${()=>on(!v)} class='w-full flex items-center justify-between gap-3 py-2.5 text-left'><span><span class='block'>${l}</span>${s&&html`<span class='block text-xs text-zinc-500'>${s}</span>`}</span><span class=${'w-12 h-7 rounded-full p-1 shrink-0 '+(v?'bg-lime-400':'bg-zinc-700')}><span class=${'block w-5 h-5 rounded-full bg-white transition-transform '+(v?'translate-x-5':'')}></span></span></button>`;
function Opts({opt,setOpt,hist,setHist,plan,setPlan,user,out,sy,syncNow,delAcc}){
 const[bk,setBk]=useState(''),[cf,setCf]=useState(false),[cd,setCd]=useState(false),o=x=>setOpt(p=>({...p,...x}));
 const exp=()=>{const j=JSON.stringify({hist,plan,opt});setBk(j);try{navigator.clipboard.writeText(j).then(()=>toast('Mentés a vágólapra másolva')).catch(()=>{})}catch(e){}};
 const imp=()=>{try{const d=JSON.parse(bk);if(d.hist)setHist(d.hist);if(d.plan)setPlan(d.plan);if(d.opt)setOpt(d.opt);toast('Adatok visszatöltve')}catch(e){toast('A mentés szövege hibás')}};
 const bt='h-11 rounded-xl bg-zinc-800 text-sm font-semibold';
 return html`<div><h1 class='fd text-4xl font-bold mb-4'>Beállítások</h1>
  <${Cd} t='Megjelenés'>
   <${Lb} t='Nyelv / Language'/><${Sg} v=${opt.lang} on=${x=>{try{localStorage.setItem('en_lang',x)}catch(e){}o({lang:x})}} o=${[['hu','Magyar'],['en','English']]}/>
   <${Lb} t='Kiemelő szín'/><div class='flex gap-3 flex-wrap'>${Object.entries(ACCS).map(([k,a])=>html`<button key=${k} title=${a[0]} onClick=${()=>o({ac:k})} style=${{background:a[3]}} class=${'w-10 h-10 rounded-full '+(opt.ac===k?'ring-4 ring-white/80':'')}></button>`)}</div>
   <${Lb} t='Téma'/><div class='grid grid-cols-2 gap-2'>${Object.entries(THEMES).map(([k,t])=>html`<button key=${k} onClick=${()=>o({th:k})} class=${'h-11 rounded-xl text-sm font-semibold '+(opt.th===k?'bg-lime-400 text-black':'bg-zinc-800 text-zinc-300')}>${t[0]}</button>`)}</div>
   <${Lb} t='Betűméret'/><${Sg} v=${opt.fs} on=${x=>o({fs:+x})} o=${[[14,'Kicsi'],[16,'Normál'],[18,'Nagy']]}/>
   <${Sw} l='Animációk' s='Kikapcsolva gyorsabb, kíméli az akkut' v=${opt.an} on=${x=>o({an:x})}/>
  <//>
  <${Cd} t='Edzés'>
   <${Lb} t='Heti edzéscél'/><${Sg} v=${opt.wg} on=${x=>o({wg:+x})} o=${[[2,'2'],[3,'3'],[4,'4'],[5,'5'],[6,'6']]}/>
   <${Lb} t='Alap pihenőidő'/><${Sg} v=${opt.rest} on=${x=>o({rest:+x})} o=${[[60,'60 mp'],[90,'90 mp'],[120,'120 mp'],[180,'180 mp']]}/>
   <${Sw} l='Automatikus pihenő' s='A sorozat kipipálása elindítja az időzítőt' v=${opt.auto} on=${x=>o({auto:x})}/>
   <${Lb} t='Célsúly lépcső (kg)'/><${Sg} v=${opt.step} on=${x=>o({step:+x})} o=${[[.5,'0,5'],[1.25,'1,25'],[2.5,'2,5']]}/>
   <${Lb} t='Heti emelés a célsúlyoknál'/><${Sg} v=${opt.pct} on=${x=>o({pct:+x})} o=${[[1.5,'1,5%'],[2.5,'2,5%'],[5,'5%']]}/>
   <${Sw} l='Képernyő ébren tartása' s='Edzés közben nem kapcsol le' v=${opt.wake} on=${x=>o({wake:x})}/>
   <${Sw} l='Hang' s='Sípszó a pihenő végén' v=${opt.snd} on=${x=>o({snd:x})}/>
   <${Sw} l='Rezgés' s='Érintéskor és a pihenő végén' v=${opt.vib} on=${x=>o({vib:x})}/>
  <//>
  <${Cd} t='Adatok'>
   <div class='grid grid-cols-2 gap-2 mb-2'><button onClick=${()=>exportCSV(hist)} class=${bt}>Exportálás (Excel/CSV)</button><button onClick=${()=>exportPDF(hist)} class=${bt}>PDF / nyomtatás</button></div>
   <div class='grid grid-cols-2 gap-2 mb-2'><button onClick=${exp} class=${bt}>Mentés másolása</button><button onClick=${imp} class=${bt}>Visszatöltés</button></div>
   <textarea value=${bk} onChange=${e=>setBk(e.target.value)} placeholder='Másold ide a mentés szövegét a visszatöltéshez' class='w-full h-24 rounded-xl bg-zinc-800 text-xs p-3 text-white outline-none mb-2'></textarea>
   <button onClick=${()=>{if(cf){setHist([]);setCf(false);toast('Előzmények törölve')}else setCf(true)}} class=${'w-full h-11 rounded-xl text-sm font-semibold '+(cf?'bg-red-500 text-white':'bg-zinc-800 text-red-400')}>${cf?'Biztosan törlöd?':'Összes edzés törlése'}</button>
  <//>
  <${Cd} t='Fiók és szinkron'><div class='text-zinc-300 text-sm break-all'>${(SESS&&SESS.user&&SESS.user.email)||user}</div><div class='text-xs text-zinc-400 mt-1 mb-3'>${sy.s==='ok'?'Utoljára szinkronizálva: '+sy.t:sy.s==='busy'?'Szinkronizálás...':sy.s==='off'?'Offline, a változások később szinkronizálódnak.':sy.s==='err'?'Szinkronhiba':'Még nem szinkronizált'}</div><div class='grid grid-cols-2 gap-2 mb-2'><button onClick=${syncNow} class=${bt}>Szinkronizálás most</button><button onClick=${out} class=${bt}>Kilépés</button></div><button onClick=${()=>{if(cd)delAcc();else setCd(true)}} class=${'w-full h-11 rounded-xl text-sm font-semibold '+(cd?'bg-red-500 text-white':'bg-zinc-800 text-red-400')}>${cd?'Biztosan törlöd a fiókot és minden adatot?':'Fiók törlése'}</button><//>
 </div>`;
}

