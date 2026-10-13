/* ---------- Közösség: aktivitások, profil nézet, feed (4. lépés) ----------
   A láthatóságot a Supabase dönti el (supabase/social_2b_activities.sql: RLS és social_can_view).
   A kliens csak azt jeleníti meg, amit a szerver visszaad: ha egy profil privát és nem vagyunk barátok, üres jön. */
const socSum=s=>{s=s||{};const e=+s.exercises||0,t=+s.sets||0,v=fmt(+s.volume||0);return LANG==='en'?e+' exercises · '+t+' sets · '+v+' kg':e+' gyakorlat · '+t+' sorozat · '+v+' kg'};
const socDay=iso=>fd(dk(new Date(iso)));

// Egy befejezett edzés közzététele (csak ha a megosztás be van kapcsolva; a szerver ezt is ellenőrzi). Hiba esetén csendben kimarad.
const socPublish=async(w,pr)=>{
 if(!SESS||!SESS.user||!gj('socshare',false))return;
 try{const ex=w.ex,sm={exercises:ex.length,sets:ex.reduce((a,e)=>a+e.sets.length,0),volume:Math.round(w.vol),prs:pr||0,names:ex.slice(0,5).map(e=>String(e.n).slice(0,40))};
  await sbf('/rest/v1/activities',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({user_id:SESS.user.id,kind:'workout',title:String(w.name).slice(0,80),summary:sm,workout_id:String(w.id),created_at:new Date().toISOString()})})}catch(e){}};

function ActCard({a,p,open,del}){
 const sm=a.summary||{},nm=Array.isArray(sm.names)?sm.names:[];
 return html`<div class='py-3 border-b border-zinc-800'>
  ${p&&html`<button onClick=${()=>open&&open(p.username)} class='flex items-center gap-2 mb-2 text-left'><${Avatar} p=${p} s=${32}/><span class='text-sm font-medium'>${p.display_name}</span><span class='text-xs text-zinc-500'>@${p.username}</span></button>`}
  <div class='font-medium'>${a.title}</div>
  <div class='text-xs text-zinc-400 mt-0.5'>${socDay(a.created_at)} · ${socSum(sm)}</div>
  ${+sm.prs>0&&html`<div class='text-xs text-lime-300 mt-1'>${LANG==='en'?sm.prs+(+sm.prs===1?' new record':' new records'):sm.prs+' új rekord'}</div>`}
  ${nm.length>0&&html`<div class='text-xs text-zinc-500 mt-1'>${nm.join(', ')}</div>`}
  ${del&&html`<button onClick=${()=>del(a)} class='mt-2 h-8 px-3 rounded-lg bg-zinc-800 text-xs text-red-400'>Aktivitás törlése</button>`}</div>`;
}

// A követettek megosztott aktivitásai, időrendben (az RLS szűri, hogy melyik látszik)
function SocFeed({me,open}){
 const[items,setItems]=useState(null),[pm,setPm]=useState({}),[more,setMore]=useState(false),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 const load=async before=>{setBusy(true);setMsg('');
  try{const r=await sbf('/rest/v1/rpc/social_feed',{method:'POST',body:JSON.stringify({p_limit:20,p_before:before||null})});if(!r.ok)throw r;
   const ids=[...new Set(r.j.map(x=>x.user_id))].filter(i=>!pm[i]),np={...pm};
   if(ids.length){const p=await sbf('/rest/v1/profiles?select='+SOC_PF+'&user_id=in.('+ids.join(',')+')');if(!p.ok)throw p;p.j.forEach(x=>{np[x.user_id]=x})}
   setPm(np);setItems(x=>before?[...(x||[]),...r.j]:r.j);setMore(r.j.length>=20)}
  catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.');setItems(x=>x||[])}setBusy(false)};
 useEffect(()=>{load()},[]);
 if(items===null)return html`<p class='text-sm text-zinc-400'>Betöltés...</p>`;
 return html`<div>${msg&&html`<p class='text-sm text-amber-400 mb-3'>${msg}</p>`}
  ${!items.length&&!msg&&html`<p class='text-sm text-zinc-400'>Itt a követett felhasználók megosztott edzései jelennek meg. Kövess valakit a Kapcsolatok fülön.</p>`}
  ${items.length>0&&html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'>${items.map(a=>html`<${ActCard} key=${a.id} a=${a} p=${pm[a.user_id]} open=${open}/>`)}</div>`}
  ${more&&html`<button onClick=${()=>load(items[items.length-1].created_at)} disabled=${busy} class='w-full h-11 rounded-xl bg-zinc-800 text-sm font-semibold'>Több betöltése</button>`}
  ${items.length===0&&html`<button onClick=${()=>load()} disabled=${busy} class='w-full h-11 rounded-xl bg-zinc-800 text-sm font-semibold mt-3'>Frissítés</button>`}</div>`;
}

// Más felhasználó profilja: fejléc, számok és aktivitás-lista. Privát profilnál idegennek csak az azonosító látszik.
function SocProfile({u,me,back}){
 const R=useSocRel(me),[p,setP]=useState(undefined),[acts,setActs]=useState(null),[msg,setMsg]=useState('');
 useEffect(()=>{let off=false;setP(undefined);setActs(null);
  (async()=>{try{const r=await sbf('/rest/v1/rpc/social_profile',{method:'POST',body:JSON.stringify({p_username:u})});if(!r.ok)throw r;if(off)return;
   const x=r.j&&r.j[0]||null;setP(x);
   if(x&&x.can_view){const a=await sbf('/rest/v1/activities?select=*&user_id=eq.'+x.user_id+'&order=created_at.desc&limit=30');if(!a.ok)throw a;if(!off)setActs(a.j)}
  }catch(r){if(!off){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.');setP(null)}}})();
  return()=>{off=true}},[u]);
 const St=({l,v})=>html`<div class='flex-1 text-center'><div class='fd text-2xl font-bold'>${v}</div><div class='text-[11px] text-zinc-400'>${l}</div></div>`;
 return html`<div><button onClick=${back} class='h-10 px-3 -ml-3 mb-2 flex items-center gap-1 text-sm text-zinc-300'><${Ic} n='chevL' s=${18}/>Vissza</button>
  ${p===undefined&&html`<p class='text-sm text-zinc-400'>Betöltés...</p>`}
  ${p===null&&html`<p class='text-sm text-zinc-400'>${msg||'A felhasználó nem található.'}</p>`}
  ${p&&html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'>
   <div class='flex items-center gap-4'><${Avatar} p=${p} s=${72}/><div class='min-w-0'><div class='fd text-2xl font-bold truncate'>${p.display_name}</div><div class='text-sm text-zinc-400 truncate'>@${p.username}</div></div></div>
   ${p.can_view?html`<div class='flex mt-4'><${St} l='Követők' v=${p.followers}/><${St} l='Követett' v=${p.following}/><${St} l='Aktivitás' v=${p.activities}/></div>`:html`<p class='text-sm text-zinc-400 mt-4 flex items-center gap-2'><${Ic} n='lock' s=${16}/>Privát profil. A tartalmát csak a barátai látják.</p>`}
   ${p.user_id!==me&&R.d&&R.btns(p)}${R.msg&&html`<p class='text-sm text-amber-400 mt-2'>${R.msg}</p>`}</div>
   ${p.can_view&&html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'><div class='font-semibold'>Aktivitások</div>
    ${acts===null?html`<p class='text-sm text-zinc-400 mt-2'>Betöltés...</p>`:acts.length?acts.map(a=>html`<${ActCard} key=${a.id} a=${a}/>`):html`<p class='text-sm text-zinc-400 mt-2'>Még nincs megosztott aktivitás.</p>`}</div>`}`}</div>`;
}

// Saját megosztott aktivitásaim (törölhetők)
function SocMine({me}){
 const[items,setItems]=useState(null),[msg,setMsg]=useState(''),[cf,setCf]=useState(false);
 const load=async()=>{try{const r=await sbf('/rest/v1/activities?select=*&user_id=eq.'+me+'&order=created_at.desc&limit=50');if(!r.ok)throw r;setItems(r.j)}catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.');setItems([])}};
 useEffect(()=>{load()},[]);
 const del=async a=>{try{const r=await sbf('/rest/v1/activities?id=eq.'+a.id,{method:'DELETE',headers:{Prefer:'return=minimal'}});if(!r.ok)throw r;setItems(x=>x.filter(y=>y.id!==a.id))}catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.')}};
 const all=async()=>{if(!cf)return setCf(true);try{const r=await sbf('/rest/v1/activities?user_id=eq.'+me,{method:'DELETE',headers:{Prefer:'return=minimal'}});if(!r.ok)throw r;setItems([]);setCf(false);toast('Aktivitások törölve')}catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.')}};
 if(items===null)return null;
 return html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'><div class='font-semibold'>Megosztott aktivitásaid</div>
  ${msg&&html`<p class='text-sm text-amber-400 mt-2'>${msg}</p>`}
  ${items.length?items.map(a=>html`<${ActCard} key=${a.id} a=${a} del=${del}/>`):html`<p class='text-sm text-zinc-400 mt-2'>Még nincs megosztott aktivitásod.</p>`}
  ${items.length>0&&html`<button onClick=${all} class=${'w-full h-11 rounded-xl text-sm font-semibold mt-3 '+(cf?'bg-red-500 text-white':'bg-zinc-800 text-red-400')}>${cf?'Biztosan törlöd?':'Összes aktivitás törlése'}</button>`}</div>`;
}
