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
 return html`<div class='k-item'>
  ${p&&html`<button type='button' onClick=${()=>open&&open(p.username)} class='k-who' style=${{marginBottom:'8px'}}><${Avatar} p=${p} s=${32}/><span class='k-row-t k-trunc'>${p.display_name}</span><span class='k-row-s k-trunc'>@${p.username}</span></button>`}
  <div class='k-row-t'>${a.title}</div>
  <div class='k-row-s'>${socDay(a.created_at)} · ${socSum(sm)}</div>
  ${+sm.prs>0&&html`<div class='k-act-pr'>${LANG==='en'?sm.prs+(+sm.prs===1?' new record':' new records'):sm.prs+' új rekord'}</div>`}
  ${nm.length>0&&html`<div class='k-row-s'>${nm.join(', ')}</div>`}
  ${del&&html`<${KBtn} v='dan' sm=${true} c='k-mt' onClick=${()=>del(a)}>Aktivitás törlése<//>`}</div>`;
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
 if(items===null)return html`<${KBusy} t='Betöltés'/>`;
 return html`<div>${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}
  ${!items.length&&!msg&&html`<p class='k-hint'>Itt a követett felhasználók megosztott edzései jelennek meg. Kövess valakit a Kapcsolatok fülön.</p>`}
  ${items.length>0&&html`<div class='up k-card'>${items.map(a=>html`<${ActCard} key=${a.id} a=${a} p=${pm[a.user_id]} open=${open}/>`)}</div>`}
  ${more&&html`<button onClick=${()=>load(items[items.length-1].created_at)} disabled=${busy} class='k-btn sec sm full'>Több betöltése</button>`}
  ${items.length===0&&html`<button onClick=${()=>load()} disabled=${busy} class='k-btn sec sm full k-mt'>Frissítés</button>`}</div>`;
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
 const St=({l,v})=>html`<div class='k-stat'><div class='k-stat-v' style=${{justifyContent:'center'}}>${v}</div><div class='k-stat-l' style=${{textAlign:'center'}}>${l}</div></div>`;
 return html`<div><${KBtn} v='gho' sm=${true} ic='back' onClick=${back}>Vissza<//>
  ${p===undefined&&html`<${KBusy} t='Betöltés'/>`}
  ${p===null&&html`<p class='k-hint'>${msg||'A felhasználó nem található.'}</p>`}
  ${p&&html`<div class='up k-card'>
   <div class='k-ph' style=${{marginBottom:0}}><${Avatar} p=${p} s=${72}/><div><div class='k-wh-t k-trunc'>${p.display_name}</div><div class='k-row-s k-trunc'>@${p.username}</div></div></div>
   ${p.can_view?html`<div class='k-stats c3 k-mt'><${St} l='Követők' v=${p.followers}/><${St} l='Követett' v=${p.following}/><${St} l='Aktivitás' v=${p.activities}/></div>`:html`<p class='k-hint k-ic'><${Ic} n='lock' s=${16}/>Privát profil. A tartalmát csak a barátai látják.</p>`}
   ${p.user_id!==me&&R.d&&R.btns(p)}${R.msg&&html`<p class='k-hint k-warn'>${R.msg}</p>`}</div>
   ${p.can_view&&html`<div class='up k-card'><div class='k-cd-t'>Aktivitások</div>
    ${acts===null?html`<p class='k-hint'>Betöltés...</p>`:acts.length?acts.map(a=>html`<${ActCard} key=${a.id} a=${a}/>`):html`<p class='k-hint'>Még nincs megosztott aktivitás.</p>`}</div>`}${p.can_view&&html`<${PhGrid} uid=${p.user_id}/>`}`}</div>`;
}

// Saját megosztott aktivitásaim (törölhetők)
function SocMine({me}){
 const[items,setItems]=useState(null),[msg,setMsg]=useState(''),[cf,setCf]=useState(false);
 const load=async()=>{try{const r=await sbf('/rest/v1/activities?select=*&user_id=eq.'+me+'&order=created_at.desc&limit=50');if(!r.ok)throw r;setItems(r.j)}catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.');setItems([])}};
 useEffect(()=>{load()},[]);
 const del=async a=>{try{const r=await sbf('/rest/v1/activities?id=eq.'+a.id,{method:'DELETE',headers:{Prefer:'return=minimal'}});if(!r.ok)throw r;setItems(x=>x.filter(y=>y.id!==a.id))}catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.')}};
 const all=async()=>{if(!cf)return setCf(true);try{const r=await sbf('/rest/v1/activities?user_id=eq.'+me,{method:'DELETE',headers:{Prefer:'return=minimal'}});if(!r.ok)throw r;setItems([]);setCf(false);toast('Aktivitások törölve')}catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.')}};
 if(items===null)return null;
 return html`<div class='up k-card'><div class='k-cd-t'>Megosztott aktivitásaid</div>
  ${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}
  ${items.length?items.map(a=>html`<${ActCard} key=${a.id} a=${a} del=${del}/>`):html`<p class='k-hint'>Még nincs megosztott aktivitásod.</p>`}
  ${items.length>0&&html`<button onClick=${all} class=${'k-btn dan sm full k-mt'+(cf?' ask':'')}>${cf?'Biztosan törlöd?':'Összes aktivitás törlése'}</button>`}</div>`;
}
