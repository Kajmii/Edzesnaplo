/* ---------- Közösség: csoportok és heti kihívások (supabase/social_4_groups.sql) ----------
   Meghívó kóddal lehet csatlakozni, a kódot csak a tulajdonos látja. A ranglista a csoport tagjainak MEGOSZTOTT edzéseiből
   készül, és csak összesítést mutat (edzésszám, sorozat, összes súly). A jogosultságot az RLS és az RPC-k adják. */
const GRP_KINDS=['workouts','volume','sets'],GRP_LEN=[7,14,30];
const grpVal=(k,r)=>k==='volume'?+r.volume||0:k==='sets'?+r.sets||0:+r.workouts||0;
const grpEnds=(starts,days)=>{const d=pd(starts);return dk(new Date(d.getFullYear(),d.getMonth(),d.getDate()+days-1))};
const grpState=(c,today)=>c.ends_on<today?'done':c.starts_on>today?'soon':'live';
// Ranglista: érték szerint csökkenő; azonos érték azonos helyezés (1, 1, 3)
const grpRank=(rows,k)=>{const s=rows.map(r=>({...r,v:grpVal(k,r)})).sort((a,b)=>b.v-a.v);let p=0;return s.map((r,i)=>{if(i===0||r.v!==s[i-1].v)p=i+1;return{...r,rank:p}})};
const grpName=k=>k==='volume'?'Összes súly':k==='sets'?'Sorozatok':'Edzések száma';
const grpUnit=k=>k==='volume'?'kg':k==='sets'?(LANG==='en'?'sets':'sorozat'):(LANG==='en'?'workouts':'edzés');
const grpErr=r=>{const j=(r&&r.j)||{},m=String(j.message||'')+String(j.details||'');
 if(m.includes('group_not_found'))return'Nincs ilyen meghívó kód.';
 if(m.includes('group_full'))return'A csoport megtelt (legfeljebb 30 tag).';
 if(m.includes('group_limit'))return'Legfeljebb 10 csoportban lehetsz tag, és 5 csoportot hozhatsz létre.';
 if(m.includes('no_profile'))return'Előbb hozz létre közösségi profilt.';
 if(m.includes('name_blocked'))return'Ez a név nem engedélyezett, válassz másikat.';
 if(m.includes('name_invalid'))return'A csoport neve 3–40 karakter legyen.';
 if(m.includes('challenge_limit'))return'Egyszerre legfeljebb 3 futó kihívás lehet.';
 if(m.includes('challenge_date'))return'A kihívás kezdete nem lehet régebbi tegnapnál.';
 if(m.includes('rate_limit'))return'Túl sok módosítás, próbáld újra később.';
 if(r&&(r.status===404||j.code==='42P01'||j.code==='PGRST205'||j.code==='PGRST202'))return'A csoportok még nincsenek bekapcsolva a szerveren.';
 if(r&&(r.status===403||j.code==='42501'))return'Ehhez nincs jogosultságod.';
 return'Nem sikerült, próbáld újra.'};
const grpFail=(r,set)=>set(r&&r.status!==undefined?grpErr(r):'Nincs kapcsolat. Próbáld újra.');

// Egy csoport: tagok, meghívó kód (tulajdonos), kihívások ranglistával
function GroupView({g,me,back,reload,open}){
 const own=g.owner_id===me,today=dk(new Date());
 const[mem,setMem]=useState(null),[pm,setPm]=useState({}),[chs,setChs]=useState(null),[bd,setBd]=useState({}),[code,setCode]=useState(''),[msg,setMsg]=useState(''),[bz,setBz]=useState(false),[nw,setNw]=useState(null),[rg,setRg]=useState(false),[sh,setSh]=useState(()=>!!gj('socshare',false)),[cf,setCf]=useState('');
 const load=async()=>{setMsg('');
  try{const[a,b]=await Promise.all([sbf('/rest/v1/social_group_members?select=user_id,joined_at&group_id=eq.'+g.id+'&order=joined_at'),sbf('/rest/v1/social_challenges?select=*&group_id=eq.'+g.id+'&order=ends_on.desc,created_at.desc&limit=12')]);
   if(!a.ok)throw a;if(!b.ok)throw b;
   const ids=a.j.map(x=>x.user_id),np={};
   if(ids.length){const p=await sbf('/rest/v1/profiles?select='+SOC_PF+'&user_id=in.('+ids.join(',')+')');if(!p.ok)throw p;p.j.forEach(x=>{np[x.user_id]=x})}
   setPm(np);setMem(ids);setChs(b.j);
   const nb={};await Promise.all(b.j.slice(0,6).map(async c=>{const r=await sbf('/rest/v1/rpc/social_challenge_board',{method:'POST',body:JSON.stringify({p_challenge:c.id})});if(r.ok)nb[c.id]=r.j||[]}));setBd(nb);
   if(own){const r=await sbf('/rest/v1/rpc/social_group_code',{method:'POST',body:JSON.stringify({p_group:g.id})});if(r.ok&&typeof r.j==='string')setCode(r.j)}
  }catch(r){grpFail(r,setMsg);setMem(x=>x||[]);setChs(x=>x||[])}};
 useEffect(()=>{load()},[g.id]);
 const run=async(fn,done)=>{setBz(true);setMsg('');try{const r=await fn();if(!r.ok)throw r;await done(r)}catch(r){grpFail(r,setMsg)}setBz(false)};
 const regen=()=>run(()=>sbf('/rest/v1/rpc/social_regen_code',{method:'POST',body:JSON.stringify({p_group:g.id})}),r=>{setCode(String(r.j));toast('Új meghívó kód')});
 const copy=()=>{try{navigator.clipboard.writeText(code).then(()=>toast('Kód másolva')).catch(()=>{})}catch(e){}};
 const kick=u=>run(()=>sbf('/rest/v1/social_group_members?group_id=eq.'+g.id+'&user_id=eq.'+u,{method:'DELETE',headers:{Prefer:'return=minimal'}}),load);
 const leave=()=>run(()=>sbf('/rest/v1/social_group_members?group_id=eq.'+g.id+'&user_id=eq.'+me,{method:'DELETE',headers:{Prefer:'return=minimal'}}),async()=>{toast('Kiléptél a csoportból');await reload();back()});
 const drop=()=>run(()=>sbf('/rest/v1/social_groups?id=eq.'+g.id,{method:'DELETE',headers:{Prefer:'return=minimal'}}),async()=>{toast('Csoport törölve');await reload();back()});
 const mkCh=()=>run(()=>sbf('/rest/v1/social_challenges',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({group_id:g.id,title:nw.title.trim().slice(0,60),kind:nw.kind,starts_on:today,ends_on:grpEnds(today,nw.days)})}),async()=>{setNw(null);toast('Kihívás létrehozva');await load()});
 const delCh=c=>run(()=>sbf('/rest/v1/social_challenges?id=eq.'+c.id,{method:'DELETE',headers:{Prefer:'return=minimal'}}),load);
 const share=()=>run(()=>sbf('/rest/v1/profile_settings?user_id=eq.'+me,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({share_activity:true})}),r=>{if(!r.j||!r.j[0])throw{status:403,j:{}};sj('socshare',true);setSh(true);toast('Megosztás bekapcsolva');return load()});
 if(mem===null||chs===null)return html`<div><${KBtn} v='gho' sm=${true} ic='back' onClick=${back}>Vissza<//><${KBusy} t='Betöltés'/></div>`;
 return html`<div><${KBtn} v='gho' sm=${true} ic='back' c='k-mb' onClick=${back}>Vissza<//>
  <${KSec} t=${g.name}>
   <p class='k-hint' style=${{margin:'0 0 12px'}}>${mem.length} ${LANG==='en'?(mem.length===1?'member':'members'):'tag'}${own?html` · ${tr('Te vagy a tulajdonos')}`:''}</p>
   ${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}
   ${own&&html`<${KCard}><div class='k-cd-t'>Meghívó kód</div><div class='k-code' aria-label=${tr('Meghívó kód')}>${code||'…'}</div>
    <p class='k-hint'>Aki ismeri a kódot, csatlakozhat. Új kód kérése után a régi nem működik.</p>
    <div class='k-btns k-mt' style=${{marginBottom:0}}><${KBtn} v='sec' sm=${true} disabled=${!code} onClick=${copy}>Másolás<//><${KBtn} v='sec' sm=${true} disabled=${bz} onClick=${regen}>Új kód<//></div><//>`}<//>
  <${KSec} t='Kihívások' a=${own&&html`<${KBtn} v='gho' sm=${true} ic='plus' onClick=${()=>setNw({kind:'workouts',days:7,title:''})}>Új kihívás<//>`}>
   ${!sh&&html`<${KCard}><p class='k-hint' style=${{margin:'0 0 12px'}}>A ranglistán csak a megosztott edzéseid számítanak, és most az Edzéseim megosztása ki van kapcsolva.</p><${KBtn} sm=${true} disabled=${bz} onClick=${share}>Megosztás bekapcsolása<//><//>`}
   ${!chs.length&&html`<${KEmpty} ic='chart' t='Még nincs kihívás' s=${own?'Indíts egy heti kihívást, és a tagok edzései összesítve itt látszanak.':'A csoport tulajdonosa indíthat kihívást.'}/>`}
   <div class='ui-stagger'>${chs.map(c=>{const st=grpState(c,today),rows=grpRank(bd[c.id]||[],c.kind),top=Math.max(1,...rows.map(r=>r.v));
    return html`<${KCard} key=${c.id} on=${st==='live'}>
     <div class='k-wh' style=${{alignItems:'center'}}><div class='k-wh-tx'><div class='k-wh-t'>${c.title||grpName(c.kind)}</div><div class='k-row-s'>${c.title?grpName(c.kind)+' · ':''}${fs(c.starts_on)} – ${fs(c.ends_on)}</div></div>${own&&html`<${KDel} on=${()=>delCh(c)}/>`}</div>
     <span class=${'k-tag k-st-'+st}>${st==='live'?'Fut':st==='soon'?'Hamarosan':'Lezárult'}</span>
     <div class='k-list k-mt'>${rows.map(r=>{const p=pm[r.user_id]||{display_name:'?',username:''};return html`<div key=${r.user_id} class=${'k-row k-lb-r'+(r.user_id===me?' me':'')}><span class='k-rk'>${r.rank}</span><${Avatar} p=${p} s=${32}/><span class='k-row-tx'><span class='k-row-t k-trunc'>${p.display_name}</span><span class='k-bar-tr'><span class='k-bar-f' style=${{'--p':r.v/top,'--i':r.rank}}></span></span></span><span class='k-pr'>${c.kind==='volume'?fmt(r.v):r.v} <span class='k-unit'>${grpUnit(c.kind)}</span></span></div>`})}</div><//>`})}</div><//>
  <${KSec} t='Tagok'><${KCard}><div class='k-list'>${mem.map(u=>{const p=pm[u]||{display_name:'?',username:''};return html`<div key=${u} class='k-row'><button type='button' class='k-who' onClick=${()=>open&&p.username&&open(p.username)}><${Avatar} p=${p} s=${36}/><span class='k-row-tx'><span class='k-row-t k-trunc'>${p.display_name}${u===g.owner_id?html` · <span class='k-row-s'>${tr('tulajdonos')}</span>`:''}</span><span class='k-row-s k-trunc'>@${p.username}</span></span></button>${own&&u!==me&&html`<${KDel} label='Eltávolítás a csoportból' on=${()=>kick(u)}/>`}</div>`})}</div><//>
   ${!own&&html`<${KBtn} v='dan' sm=${true} full=${true} c=${cf==='l'?'ask':''} disabled=${bz} onClick=${()=>cf==='l'?leave():setCf('l')}>${cf==='l'?'Biztosan kilépsz?':'Kilépés a csoportból'}<//>`}
   ${!own&&html`<${KBtn} v='gho' sm=${true} full=${true} c='k-mb' onClick=${()=>setRg(true)}>Csoport jelentése<//>`}
   ${own&&html`<${KBtn} v='dan' sm=${true} full=${true} c=${cf==='d'?'ask':''} disabled=${bz} onClick=${()=>cf==='d'?drop():setCf('d')}>${cf==='d'?'Biztosan törlöd a csoportot?':'Csoport törlése'}<//>`}<//>
  ${rg&&html`<${SocReport} t='group' uid=${g.owner_id} id=${g.id} onClose=${()=>setRg(false)}/>`}
  ${nw&&html`<${KSheet} t='Új kihívás' onClose=${()=>setNw(null)} foot=${html`<${KBtn} full=${true} disabled=${bz} onClick=${mkCh}>Létrehozás<//>`}>
   <div class='k-lb' style=${{marginTop:0}}>Mit versenyezzenek?</div><${KSeg} v=${nw.kind} on=${v=>setNw(x=>({...x,kind:v}))} o=${GRP_KINDS.map(k=>[k,grpName(k)])}/>
   <div class='k-lb'>Mennyi ideig?</div><${KSeg} v=${nw.days} on=${v=>setNw(x=>({...x,days:+v}))} o=${[[7,'1 hét'],[14,'2 hét'],[30,'1 hónap']]}/>
   <div class='k-mt'><${KField} l='Cím (nem kötelező)' type='text' v=${nw.title} on=${v=>setNw(x=>({...x,title:v.slice(0,60)}))}/></div>
   <p class='k-hint'>A kihívás ma kezdődik. A ranglistán a tagok megosztott edzései számítanak.</p>${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}<//>`}</div>`;
}

// A csoportjaim: lista, új csoport, csatlakozás kóddal
function SocGroups({me,open}){
 const[gs,setGs]=useState(null),[cnt,setCnt]=useState({}),[sel,setSel]=useState(null),[sheet,setSheet]=useState(''),[nm,setNm]=useState(''),[cd,setCd]=useState(''),[msg,setMsg]=useState(''),[bz,setBz]=useState(false);
 const load=async()=>{setMsg('');
  try{const[a,b]=await Promise.all([sbf('/rest/v1/social_groups?select=id,owner_id,name,created_at&order=created_at.desc'),sbf('/rest/v1/social_group_members?select=group_id')]);
   if(!a.ok)throw a;if(!b.ok)throw b;const c={};(b.j||[]).forEach(x=>{c[x.group_id]=(c[x.group_id]||0)+1});setCnt(c);setGs(a.j||[]);return a.j||[]}
  catch(r){grpFail(r,setMsg);setGs(x=>x||[]);return[]}};
 useEffect(()=>{load()},[]);
 const create=async()=>{setBz(true);setMsg('');
  try{const r=await sbf('/rest/v1/rpc/social_create_group',{method:'POST',body:JSON.stringify({p_name:nm.trim()})});if(!r.ok)throw r;
   const l=await load(),g=l.find(x=>x.id===(r.j&&r.j[0]&&r.j[0].id));setSheet('');setNm('');toast('Csoport létrehozva');if(g)setSel(g)}
  catch(r){grpFail(r,setMsg)}setBz(false)};
 const join=async()=>{setBz(true);setMsg('');
  try{const r=await sbf('/rest/v1/rpc/social_join_group',{method:'POST',body:JSON.stringify({p_code:cd.trim()})});if(!r.ok)throw r;
   const l=await load(),g=l.find(x=>x.id===r.j);setSheet('');setCd('');toast('Csatlakoztál a csoporthoz');if(g)setSel(g)}
  catch(r){grpFail(r,setMsg)}setBz(false)};
 if(gs===null)return html`<${KBusy} t='Betöltés'/>`;
 if(sel)return html`<${GroupView} g=${sel} me=${me} back=${()=>setSel(null)} reload=${load} open=${open}/>`;
 return html`<div>
  <div class='k-btns'><${KBtn} ic='plus' onClick=${()=>{setMsg('');setSheet('new')}}>Új csoport<//><${KBtn} v='sec' onClick=${()=>{setMsg('');setSheet('join')}}>Csatlakozás kóddal<//></div>
  ${msg&&!sheet&&html`<p class='k-hint k-warn'>${msg}</p>`}
  ${!gs.length&&!msg&&html`<${KEmpty} ic='people' t='Még nincs csoportod' s='Hozz létre egyet, vagy csatlakozz a barátaid meghívó kódjával, és versenyezzetek heti kihívásokban.'/>`}
  ${gs.length>0&&html`<${KCard}><div class='k-list ui-stagger'>${gs.map(g=>html`<${KRow} key=${g.id} ic='people' t=${g.name} s=${(cnt[g.id]||1)+' '+(LANG==='en'?((cnt[g.id]||1)===1?'member':'members'):'tag')+(g.owner_id===me?' · '+tr('tulajdonos'):'')} go=${true} onClick=${()=>setSel(g)}/>`)}</div><//>`}
  ${sheet==='new'&&html`<${KSheet} t='Új csoport' onClose=${()=>setSheet('')} foot=${html`<${KBtn} full=${true} disabled=${bz||nm.trim().length<3} onClick=${create}>Létrehozás<//>`}>
   <${KField} l='A csoport neve' type='text' v=${nm} on=${v=>setNm(v.slice(0,40))}/>
   <p class='k-hint'>3–40 karakter. A csoportba csak meghívó kóddal lehet belépni, a kódot te kapod meg.</p>${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}<//>`}
  ${sheet==='join'&&html`<${KSheet} t='Csatlakozás kóddal' onClose=${()=>setSheet('')} foot=${html`<${KBtn} full=${true} disabled=${bz||cd.trim().length<6} onClick=${join}>Csatlakozás<//>`}>
   <${KField} l='Meghívó kód' type='text' v=${cd} on=${v=>setCd(v.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12))}/>
   <p class='k-hint'>A kódot a csoport tulajdonosa adja meg.</p>${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}<//>`}</div>`;
}
