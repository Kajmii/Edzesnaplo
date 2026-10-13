/* ---------- Közösség: jelentés és tiltás (supabase/social_3_moderation.sql) ----------
   A tiltott fél számára a tiltó "nem található" (a szerver szabálya, nem a kliensé). A jelentett tartalmat a jelentő azonnal nem látja
   (helyben megjegyzett lista, a szerveren lévő saját jelentéseiből is feltöltődik). A jelentéseket az üzemeltető SQL-ből kezeli. */
const SOC_REASONS=[['spam','Spam'],['harassment','Zaklatás'],['inappropriate','Nem megfelelő tartalom'],['other','Egyéb']];
const SOC_RTITLE={profile:'Profil jelentése',activity:'Aktivitás jelentése',photo:'Fotó jelentése',group:'Csoport jelentése'};
const socHid=(t,id)=>!!gj('sochide',{})[t+':'+id];
const socHide=(t,id)=>{const h=gj('sochide',{});h[t+':'+id]=1;sj('sochide',h)};
// a szerveren lévő saját jelentések (más eszközön tett jelentések is elrejtik a tartalmat)
const socLoadHidden=async()=>{try{const r=await sbf('/rest/v1/reports?select=target_type,target_id&order=created_at.desc&limit=500');if(r.ok&&r.j){const h=gj('sochide',{});r.j.forEach(x=>{h[x.target_type+':'+x.target_id]=1});sj('sochide',h)}}catch(e){}};
const modErr=r=>{const j=(r&&r.j)||{},m=String(j.message||'')+String(j.details||'');
 if(m.includes('report_target'))return'Ezt a tartalmat már nem lehet jelenteni.';
 if(m.includes('rate_limit'))return'Túl sok jelentés vagy tiltás, próbáld később.';
 if(r&&(r.status===404||j.code==='42P01'||j.code==='PGRST205'||j.code==='PGRST202'))return'A jelentés és a tiltás még nincs bekapcsolva a szerveren.';
 if(r&&(r.status===403||j.code==='42501'))return'Ehhez nincs jogosultságod.';
 return'Nem sikerült, próbáld újra.'};
const modFail=(r,set)=>set(r&&r.status!==undefined?modErr(r):'Nincs kapcsolat. Próbáld újra.');
const socBlock=async uid=>{const r=await sbf('/rest/v1/blocks',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({blocker_id:SESS.user.id,blocked_id:uid})});if(!r.ok&&!(r.j&&r.j.code==='23505'))throw r};

// Jelentés lap: ok + leírás; küldés után a tartalom elrejtődik
function SocReport({t,uid,id,onClose,onDone}){
 const[rs,setRs]=useState('spam'),[dt,setDt]=useState(''),[bz,setBz]=useState(false),[msg,setMsg]=useState('');
 const send=async()=>{setBz(true);setMsg('');
  try{const r=await sbf('/rest/v1/reports',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({reporter_id:SESS.user.id,target_user_id:uid,target_type:t,target_id:id,reason:rs,details:dt.trim().slice(0,500)})});
   if(!r.ok&&!(r.j&&r.j.code==='23505'))throw r;
   socHide(t,id);toast(r.ok?'Köszönjük, a jelentést megkaptuk.':'Ezt már jelentetted.');if(onDone)onDone();onClose()}
  catch(r){modFail(r,setMsg)}setBz(false)};
 return html`<${KSheet} t=${SOC_RTITLE[t]} onClose=${onClose} foot=${html`<${KBtn} full=${true} disabled=${bz} onClick=${send}>Jelentés küldése<//>`}>
  <div class='k-lb' style=${{marginTop:0}}>Mi a probléma?</div>
  <div class='k-chips'>${SOC_REASONS.map(([k,l])=>html`<${KChip} key=${k} on=${rs===k} onClick=${()=>setRs(k)}>${l}<//>`)}</div>
  <div class='k-lb'>Leírás (nem kötelező)</div>
  <textarea value=${dt} maxLength='500' onChange=${e=>setDt(e.target.value)} class='k-in k-ta'></textarea>
  <p class='k-hint'>A jelentett tartalmat ezután nem látod. A jelentést megnézzük, és szükség esetén eltávolítjuk a tartalmat vagy a fiókot.</p>
  ${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}<//>`;
}

// Tiltott felhasználók (Közösség > Profil fül): lista és feloldás
function SocBlocks(){
 const me=SESS&&SESS.user&&SESS.user.id,[items,setItems]=useState(null),[msg,setMsg]=useState('');
 const load=async()=>{try{const r=await sbf('/rest/v1/rpc/social_my_blocks',{method:'POST',body:'{}'});if(!r.ok)throw r;setItems(r.j||[])}catch(r){modFail(r,setMsg);setItems([])}};
 useEffect(()=>{load()},[]);
 const un=async u=>{setMsg('');try{const r=await sbf('/rest/v1/blocks?blocker_id=eq.'+me+'&blocked_id=eq.'+u,{method:'DELETE',headers:{Prefer:'return=minimal'}});if(!r.ok)throw r;setItems(x=>x.filter(y=>y.user_id!==u));toast('Tiltás feloldva')}catch(r){modFail(r,setMsg)}};
 if(items===null||(!items.length&&!msg))return null;
 return html`<div class='up k-card'><div class='k-cd-t'>Tiltott felhasználók</div>
  <p class='k-hint' style=${{marginTop:0}}>A tiltott felhasználó nem látja a profilodat, és te sem az övét. A követések és a barátság megszűnnek.</p>
  ${msg&&html`<p class='k-hint k-warn'>${msg}</p>`}
  <div class='k-list'>${items.map(p=>html`<div key=${p.user_id} class='k-row'><${Avatar} p=${p} s=${36}/><span class='k-row-tx'><span class='k-row-t k-trunc'>${p.display_name}</span><span class='k-row-s k-trunc'>@${p.username}</span></span><${KBtn} v='sec' sm=${true} onClick=${()=>un(p.user_id)}>Feloldás<//></div>`)}</div></div>`;
}
