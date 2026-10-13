/* ---------- Haladási fotók: privát tároló, választható megosztás (supabase/progress_photos.sql) ----------
   A fájl a Supabase Storage-ban van (<user_id>/<id>.jpg és <user_id>/<id>_t.jpg), az adatai a progress_photos táblában.
   A láthatóságot az RLS adja: alapból csak a tulajdonos látja, megosztva a profilt láthatók (privát profilnál a barátok).
   A kliens feltöltés előtt kicsinyít (hosszabb oldal 1280 px, JPEG), a bélyegkép 320 px. */
const PH_BUCKET='progress-photos',PH_MAX=1280,PH_THUMB=320;
const phPath=(uid,id,t)=>uid+'/'+id+(t?'_t':'')+'.jpg';
const phId=()=>(window.crypto&&crypto.randomUUID)?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16)});
const phErr=r=>{const j=(r&&r.j)||{},m=String(j.message||'')+String(j.details||'')+String(j.error||'');
 if(m.includes('photo_limit'))return'Elérted a fotók maximális számát (300).';
 if(m.includes('rate_limit'))return'Ma már sok fotót töltöttél fel, próbáld holnap.';
 if(r&&(r.status===404||j.code==='42P01'||j.code==='PGRST205'))return'A fotó-funkció még nincs bekapcsolva a szerveren.';
 return'A fotó mentése nem sikerült. Próbáld újra.'};
const phHdr=()=>({apikey:SBK,Authorization:'Bearer '+SESS.access_token});
const phAuth=async()=>{if(SESS&&SESS.expires_at-60<Date.now()/1000)await refresh()};
// JPEG-re kicsinyítés (EXIF-forgatással, mert a böngésző a képet a mutatott állásban rajzolja)
async function phScale(file,max,q){
 const bm=await createImageBitmap(file),k=Math.min(1,max/Math.max(bm.width,bm.height)),w=Math.max(1,Math.round(bm.width*k)),h=Math.max(1,Math.round(bm.height*k)),c=document.createElement('canvas');
 c.width=w;c.height=h;c.getContext('2d').drawImage(bm,0,0,w,h);if(bm.close)bm.close();
 return new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error('blob')),'image/jpeg',q));
}
const PH_URL={};
// A kép betöltése a bejelentkezett felhasználó tokenjével (privát tároló), gyorsítótárazva
async function phUrl(path){
 if(PH_URL[path])return PH_URL[path];
 await phAuth();
 const r=await fetch(SBU+'/storage/v1/object/authenticated/'+PH_BUCKET+'/'+path,{headers:phHdr()});
 if(!r.ok)throw r;
 return PH_URL[path]=URL.createObjectURL(await r.blob());
}
async function phPut(path,blob){
 await phAuth();
 const r=await fetch(SBU+'/storage/v1/object/'+PH_BUCKET+'/'+path,{method:'POST',headers:{...phHdr(),'Content-Type':'image/jpeg','x-upsert':'false'},body:blob});
 if(!r.ok){let j=null;try{j=await r.json()}catch(e){}throw{ok:false,status:r.status,j}}
}
async function phDel(paths){
 await phAuth();
 const r=await fetch(SBU+'/storage/v1/object/'+PH_BUCKET,{method:'DELETE',headers:{...phHdr(),'Content-Type':'application/json'},body:JSON.stringify({prefixes:paths})});
 if(!r.ok)throw r;
}
// Fiók törlése előtt a saját fájlok eltávolítása (a sorokat a fiók törlése viszi, a fájlokat nem)
async function phPurge(){
 const me=SESS&&SESS.user&&SESS.user.id;if(!me)return;
 const r=await sbf('/rest/v1/progress_photos?select=id&user_id=eq.'+me+'&limit=300');
 if(r.ok&&r.j&&r.j.length)await phDel(r.j.flatMap(x=>[phPath(me,x.id),phPath(me,x.id,true)]));
}
// Egy kép: betöltésig üres keret
function PhImg({p,t,c}){
 const[u,setU]=useState(null),[er,setEr]=useState(false);
 useEffect(()=>{let off=false;setU(null);setEr(false);phUrl(phPath(p.user_id,p.id,t)).then(x=>{if(!off)setU(x)}).catch(()=>{if(!off)setEr(true)});return()=>{off=true}},[p.id,t]);
 return u?html`<img class=${c} src=${u} alt=${p.note||fd(p.taken_on)}/>`:html`<div class=${kc('k-ph-sk',er&&'er')} role='img' aria-label=${tr(er?'A kép nem tölthető be.':'Betöltés')}></div>`;
}
const phDays=(a,b)=>Math.abs(Math.round((pd(b)-pd(a))/864e5));
const phGap=n=>LANG==='en'?n+(n===1?' day apart':' days apart'):n+' nap különbség';

// Egy fotó nagyban (saját: szerkeszthető; másé: csak nézet)
function PhView({p,mine,hasProf,onClose,onChange,onDelete}){
 const[note,setNote]=useState(p.note||''),[msg,setMsg]=useState(''),[bz,setBz]=useState(false);
 const patch=async o=>{setBz(true);setMsg('');
  try{const r=await sbf('/rest/v1/progress_photos?id=eq.'+p.id,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(o)});if(!r.ok||!r.j||!r.j[0])throw r;onChange(r.j[0])}
  catch(r){setMsg(phErr(r))}setBz(false)};
 return html`<${KSheet} t=${fd(p.taken_on)} onClose=${onClose}>
  <${PhImg} p=${p} c='k-pbig'/>
  ${mine?html`<div class='k-mt'>
   <${KField} l='Megjegyzés' type='text' v=${note} on=${setNote}/>
   ${note.trim()!==(p.note||'')&&html`<${KBtn} sm=${true} c='k-mt' disabled=${bz} onClick=${()=>patch({note:note.trim().slice(0,200)})}>Mentés<//>`}
   <${KSw} l='Megosztás a közösségben' s=${!hasProf?'Megosztáshoz előbb hozz létre közösségi profilt.':p.shared?'Privát profilnál csak a barátaid látják, nyilvános profilnál mindenki, aki a profilodat látja.':'Csak te látod ezt a fotót.'} v=${p.shared} on=${v=>{if(bz||(v&&!hasProf))return;patch({shared:v})}}/>
   ${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}
   <div class='k-btns k-mt' style=${{marginBottom:0}}><${KDel} on=${()=>onDelete(p)}/></div></div>`:html`<div class='k-mt'>${p.note&&html`<p class='k-lead'>${p.note}</p>`}</div>`}<//>`;
}

// Saját fotók: rács, hozzáadás, összehasonlítás
function Photos(){
 const me=SESS&&SESS.user&&SESS.user.id,[items,setItems]=useState(null),[hasProf,setHasProf]=useState(false),[msg,setMsg]=useState(''),[bz,setBz]=useState(false),
  [dr,setDr]=useState(null),[sel,setSel]=useState(null),[cm,setCm]=useState(false),[pk,setPk]=useState([]),[cmp,setCmp]=useState(null),fin=React.useRef(null);
 const load=async()=>{setMsg('');
  try{const[a,b]=await Promise.all([sbf('/rest/v1/progress_photos?select=*&user_id=eq.'+me+'&order=taken_on.desc,created_at.desc&limit=300'),sbf('/rest/v1/profiles?select=user_id&user_id=eq.'+me)]);
   if(!a.ok)throw a;setItems(a.j||[]);setHasProf(!!(b.ok&&b.j&&b.j[0]))}
  catch(r){setMsg(phErr(r));setItems([])}};
 useEffect(()=>{me?load():setItems([])},[]);
 // kiválasztott fájl -> kicsinyítés -> előnézet (még nincs feltöltve)
 const choose=async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;setMsg('');setBz(true);
  try{const[m,t]=await Promise.all([phScale(f,PH_MAX,.82),phScale(f,PH_THUMB,.7)]);setDr({m,t,pv:URL.createObjectURL(m),date:dk(new Date()),note:'',shared:false})}
  catch(x){setMsg('A fotó feldolgozása nem sikerült.')}setBz(false)};
 const save=async()=>{if(!dr)return;setBz(true);setMsg('');const id=phId();let up=[];
  try{await phPut(phPath(me,id),dr.m);up.push(phPath(me,id));await phPut(phPath(me,id,true),dr.t);up.push(phPath(me,id,true));
   const r=await sbf('/rest/v1/progress_photos',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({id,user_id:me,taken_on:dr.date,note:dr.note.trim().slice(0,200),shared:dr.shared&&hasProf})});
   if(!r.ok||!r.j||!r.j[0])throw r;
   setItems(x=>[r.j[0],...(x||[])].sort((a,b)=>a.taken_on<b.taken_on?1:a.taken_on>b.taken_on?-1:0));URL.revokeObjectURL(dr.pv);setDr(null);toast('Fotó mentve')}
  catch(r){try{if(up.length)await phDel(up)}catch(e){}setMsg(phErr(r))}setBz(false)};
 const del=async p=>{setBz(true);setMsg('');
  try{const r=await sbf('/rest/v1/progress_photos?id=eq.'+p.id,{method:'DELETE',headers:{Prefer:'return=minimal'}});if(!r.ok)throw r;
   try{await phDel([phPath(me,p.id),phPath(me,p.id,true)])}catch(e){}
   setItems(x=>x.filter(y=>y.id!==p.id));setSel(null);toast('Fotó törölve')}
  catch(r){setMsg(phErr(r))}setBz(false)};
 const tap=p=>{if(!cm)return setSel(p);setPk(x=>x.includes(p.id)?x.filter(i=>i!==p.id):x.length>=2?[x[1],p.id]:[...x,p.id])};
 if(items===null)return html`<${KBusy} t='Betöltés'/>`;
 const two=pk.length===2?pk.map(i=>items.find(x=>x.id===i)).filter(Boolean).sort((a,b)=>a.taken_on<b.taken_on?-1:1):null;
 return html`<div>
  <input ref=${fin} type='file' accept='image/*' hidden onChange=${choose}/>
  <div class='k-btns'><${KBtn} ic='plus' disabled=${bz} onClick=${()=>fin.current&&fin.current.click()}>Fotó hozzáadása<//>
   ${items.length>1&&html`<${KBtn} v='sec' onClick=${()=>{setCm(!cm);setPk([])}}>${cm?'Mégse':'Összehasonlítás'}<//>`}</div>
  ${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}
  ${bz&&!dr&&html`<${KBusy} t='Egy pillanat…'/>`}
  ${cm&&html`<p class='k-hint'>Válassz ki két fotót.</p>${two&&html`<${KBtn} full=${true} c='k-mt' onClick=${()=>setCmp(two)}>Összehasonlítás megnyitása<//>`}`}
  ${!items.length&&!msg&&html`<${KEmpty} ic='user' t='Még nincs haladási fotó' s='Készíts egy fotót, és később egymás mellett látod a változást. Alapból csak te látod.'/>`}
  ${items.length>0&&html`<div class='k-pg ui-stagger'>${items.map(p=>html`<button key=${p.id} type='button' class='k-pt' aria-pressed=${pk.includes(p.id)} onClick=${()=>tap(p)}><${PhImg} p=${p} t=${true} c='k-pimg'/><span class='k-pt-d'>${fs(p.taken_on)}</span>${p.shared&&html`<span class='k-pt-s' aria-hidden='true'><${UiIco} n='people' s=${14}/></span>`}</button>`)}</div>`}
  ${dr&&html`<${KSheet} t='Új fotó' onClose=${()=>{URL.revokeObjectURL(dr.pv);setDr(null)}} foot=${html`<${KBtn} full=${true} disabled=${bz} onClick=${save}>Mentés<//>`}>
   <img class='k-pbig' src=${dr.pv} alt=''/>
   <div class='k-mt'><${KField} l='Dátum' type='date' v=${dr.date} on=${v=>setDr(x=>({...x,date:v||x.date}))}/></div>
   <div class='k-mt'><${KField} l='Megjegyzés' type='text' v=${dr.note} on=${v=>setDr(x=>({...x,note:v}))}/></div>
   <${KSw} l='Megosztás a közösségben' s=${!hasProf?'Megosztáshoz előbb hozz létre közösségi profilt.':dr.shared?'Privát profilnál csak a barátaid látják, nyilvános profilnál mindenki, aki a profilodat látja.':'Csak te látod ezt a fotót.'} v=${dr.shared} on=${v=>{if(v&&!hasProf)return;setDr(x=>({...x,shared:v}))}}/>
   ${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}<//>`}
  ${sel&&html`<${PhView} p=${sel} mine=${true} hasProf=${hasProf} onClose=${()=>setSel(null)} onChange=${n=>{setItems(x=>x.map(y=>y.id===n.id?n:y));setSel(n)}} onDelete=${del}/>`}
  ${cmp&&html`<${KSheet} t='Összehasonlítás' onClose=${()=>setCmp(null)}>
   <div class='k-cmp'>${cmp.map(p=>html`<figure key=${p.id}><${PhImg} p=${p} c='k-pbig'/><figcaption>${fd(p.taken_on)}</figcaption></figure>`)}</div>
   <p class='k-hint k-center'>${phGap(phDays(cmp[0].taken_on,cmp[1].taken_on))}</p><//>`}</div>`;
}

// Más felhasználó megosztott fotói (az RLS csak azt adja vissza, amit látnom szabad)
function PhGrid({uid}){
 const[items,setItems]=useState(null),[sel,setSel]=useState(null);
 useEffect(()=>{let off=false;sbf('/rest/v1/progress_photos?select=*&user_id=eq.'+uid+'&order=taken_on.desc&limit=60').then(r=>{if(!off)setItems(r.ok&&r.j?r.j:[])}).catch(()=>{if(!off)setItems([])});return()=>{off=true}},[uid]);
 if(!items||!items.length)return null;
 return html`<${KSec} t='Haladási fotók'><div class='k-pg ui-stagger'>${items.map(p=>html`<button key=${p.id} type='button' class='k-pt' onClick=${()=>setSel(p)}><${PhImg} p=${p} t=${true} c='k-pimg'/><span class='k-pt-d'>${fs(p.taken_on)}</span></button>`)}</div>
  ${sel&&html`<${PhView} p=${sel} mine=${false} onClose=${()=>setSel(null)}/>`}<//>`;
}
