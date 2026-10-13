/* ---------- Közösség: profil és felhasználónév (1. lépés) ----------
   A szabályokat (jogosultság, rate limit, felhasználónév-váltás) a Supabase őrzi: supabase/social_1_profiles.sql.
   A kliens csak az anon kulcsot és a felhasználó saját tokenjét használja (sbf), és azt jeleníti meg, amit az RLS enged. */
const SOC_RESERVED=['admin','administrator','support','help','moderator','mod','root','system','edzesnaplo','official','staff','null','undefined','anonymous','deleted'];
const SOC_COLORS=['lime','cyan','violet','orange','pink','red'],SOC_ICONS=['initial','dumbbell','flame','timer','apple','chart','user'];
// Trágár / sértő nevek kiszűrése. Ugyanaz a lista és normalizálás van az SQL-ben (social_name_ok), a tests/social.check.js veti össze.
const SOC_BAD_STRONG=['kurva','picsa','fasz','geci','buzeran','szopd','baszd','baszki','baszod','baszott','kibasz','bazdmeg','bazmeg','anyadat','rohadek','ribanc','szarhazi','neger','nyomorek','fuck','bitch','whore','nigger','nigga','faggot','retard','pedophile','paedophile','pedofil','asshole','dickhead','cocksucker','bullshit','shithead','dipshit','wanker','bastard','pussy','dildo','blowjob','handjob','rapist','porn','tranny','wetback','killyourself','hitler','neonazi','heilhitler','siegheil','swastika','auschwitz'],SOC_BAD_EXACT=['szar','basz','pina','anyad','kocsog','csicska','buzi','mongol','debil','homo','shit','dick','cock','cunt','cunts','slut','sluts','pedo','rape','raped','ass','arse','twat','tits','cum','penis','vagina','jizz','boner','milf','xxx','anal','nazi','kkk','kys','chink','paki','spic','kike','dyke','coon','gook','beaner','negro','fag','fags'];
const SOC_ACC='áàâäãåéèêëíìîïóòôöőõúùûüűñç'+'0134578@$!',SOC_ACC2='aaaaaaeeeeiiiioooooouuuuunc'+'oieastbasi';
const socCollapse=s=>s.replace(/(.)\1+/g,'$1');
const socNameOk=raw=>{raw=String(raw||'');let n='';for(const ch of raw.toLowerCase()){const i=SOC_ACC.indexOf(ch);n+=i>=0?SOC_ACC2[i]:ch}
 const cs=socCollapse(n.replace(/[^a-z]/g,'')),toks=n.split(/[^a-z]+/).map(socCollapse);
 if(raw.replace(/\D/g,'').includes('1488'))return false;
 if(SOC_BAD_STRONG.some(w=>cs.includes(socCollapse(w))))return false;
 return !SOC_BAD_EXACT.some(w=>{const c=socCollapse(w);return cs===c||toks.includes(c)})};
const socUserOk=u=>/^[a-z0-9_]{3,20}$/.test(u)&&!SOC_RESERVED.includes(u);
const socClean=v=>v.toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,20);
// Szerverhiba -> érthető üzenet (a PostgREST hibakódjai alapján)
const socErr=(r,dup)=>{const j=r.j||{},m=String(j.message||'')+String(j.details||''),c=j.code;
 if(c==='23505')return dup||'Ez a felhasználónév már foglalt.';
 if(m.includes('username_cooldown'))return'A felhasználónevet 30 naponta egyszer módosíthatod.';
 if(m.includes('name_blocked'))return'Ez a név nem engedélyezett, válassz másikat.';
 if(m.includes('rate_limit'))return'Túl sok módosítás, próbáld újra később.';
 if(c==='23514')return'A név vagy a felhasználónév érvénytelen.';
 if(c==='42P01'||c==='PGRST205'||r.status===404)return'A közösségi funkció még nincs bekapcsolva a szerveren.';
 if(c==='42501'||r.status===403)return'Ehhez nincs jogosultságod.';
 return'Nem sikerült, próbáld újra.'};

function Avatar({p,s=64}){
 const a=ACCS[p.avatar_color]||ACCS.lime,ic=p.avatar_icon||'initial',ch=((p.display_name||p.username||'?').trim()[0]||'?').toUpperCase();
 return html`<div class='shrink-0 flex items-center justify-center fd font-bold text-black' style=${{width:s,height:s,borderRadius:s*.3,background:'linear-gradient(135deg,'+a[3]+','+a[5]+')',fontSize:s*.46}}>${ic==='initial'?ch:html`<${Ic} n=${ic} s=${Math.round(s*.5)} c='text-black'/>`}</div>`;
}

function Social(){
 const id=SESS&&SESS.user&&SESS.user.id,[st,setSt]=useState('load'),[pr,setPr]=useState(null),[se,setSe]=useState(null),[f,setF]=useState({username:'',display_name:'',avatar_color:'lime',avatar_icon:'initial'}),[terms,setTerms]=useState(false),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[cf,setCf]=useState(false),[tb,setTb]=useState(navFocus('social')||'feed'),[pv,setPv]=useState(null);
 const fill=p=>setF({username:p.username,display_name:p.display_name,avatar_color:p.avatar_color,avatar_icon:p.avatar_icon});
 const load=async()=>{setSt('load');setMsg('');socLoadHidden();
  try{const[a,b]=await Promise.all([sbf('/rest/v1/profiles?select=*&user_id=eq.'+id),sbf('/rest/v1/profile_settings?select=*&user_id=eq.'+id)]);
   if(!a.ok||!b.ok){setMsg(socErr(a.ok?b:a));return setSt('err')}
   const p=a.j&&a.j[0];setSe(b.j&&b.j[0]||null);sj('socshare',!!(b.j&&b.j[0]&&b.j[0].share_activity));
   if(p){setPr(p);fill(p);setSt('ok')}else{setPr(null);setSt('none')}
  }catch(e){setMsg('Nincs kapcsolat. Próbáld újra.');setSt('err')}};
 useEffect(()=>{id?load():setSt('err')},[]);
 const set=o=>{setMsg('');setF(x=>({...x,...o}))};
 const check=()=>{const u=f.username.trim(),n=f.display_name.trim();
  if(!socUserOk(u))return'A felhasználónév 3–20 karakter lehet: kisbetű, szám és aláhúzás.';
  if(!n||n.length>40)return'Adj meg egy nevet (legfeljebb 40 karakter).';
  if(!socNameOk(u)||!socNameOk(n))return'Ez a név nem engedélyezett, válassz másikat.';return''};
 const rep={Prefer:'return=representation'};
 const create=async()=>{const e=check()||(!terms&&'A folytatáshoz el kell fogadnod a közösségi szabályokat.');if(e)return setMsg(e);
  setBusy(true);setMsg('');
  try{ // előbb a feltételek elfogadása (a profil létrehozását az RLS ehhez köti), utána a profil
   const a=await sbf('/rest/v1/profile_settings?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({user_id:id,terms_accepted_at:new Date().toISOString()})});
   if(!a.ok)throw a;
   const b=await sbf('/rest/v1/profiles',{method:'POST',headers:rep,body:JSON.stringify({user_id:id,username:f.username.trim(),display_name:f.display_name.trim(),avatar_color:f.avatar_color,avatar_icon:f.avatar_icon})});
   if(!b.ok||!b.j||!b.j[0])throw b;
   setSe(a.j&&a.j[0]||null);setPr(b.j[0]);fill(b.j[0]);setSt('ok');toast('Profil létrehozva');
  }catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.')}setBusy(false)};
 const save=async()=>{const e=check();if(e)return setMsg(e);
  const o={};for(const k of ['username','display_name','avatar_color','avatar_icon'])if(f[k].trim()!==pr[k])o[k]=f[k].trim();
  if(!Object.keys(o).length)return setMsg('Nincs módosítás.');
  setBusy(true);setMsg('');
  try{const r=await sbf('/rest/v1/profiles?user_id=eq.'+id,{method:'PATCH',headers:rep,body:JSON.stringify(o)});
   if(!r.ok||!r.j||!r.j[0])throw r;setPr(r.j[0]);fill(r.j[0]);toast('Profil mentve');
  }catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.')}setBusy(false)};
 const pub=async(v,k)=>{setBusy(true);setMsg('');
  try{const r=await sbf('/rest/v1/profile_settings?user_id=eq.'+id,{method:'PATCH',headers:rep,body:JSON.stringify({[k||'is_public']:v})});
   if(!r.ok||!r.j||!r.j[0])throw r;setSe(r.j[0]);sj('socshare',!!r.j[0].share_activity)}catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.')}setBusy(false)};
 const del=async()=>{if(!cf)return setCf(true);setBusy(true);setMsg('');
  try{const a=await sbf('/rest/v1/profiles?user_id=eq.'+id,{method:'DELETE',headers:{Prefer:'return=minimal'}});if(!a.ok)throw a;
   const b=await sbf('/rest/v1/profile_settings?user_id=eq.'+id,{method:'DELETE',headers:{Prefer:'return=minimal'}});if(!b.ok)throw b;
   setPr(null);setSe(null);setCf(false);setTerms(false);setF({username:'',display_name:'',avatar_color:'lime',avatar_icon:'initial'});setSt('none');toast('Profil törölve');
  }catch(r){setMsg(r&&r.status!==undefined?socErr(r):'Nincs kapcsolat. Próbáld újra.')}setBusy(false)};
 const bt='k-btn pri full';
 const Msg=()=>msg?html`<p class='k-hint k-warn'>${msg}</p>`:null;
 const Form=()=>html`<div>
  <div class='k-ph'><${Avatar} p=${{...f}} s=${72}/><div><div class='k-wh-t k-trunc'>${f.display_name.trim()||'Neved'}</div><div class='k-row-s k-trunc'>@${f.username||'felhasznalonev'}</div></div></div>
  <span class='k-fld-l'>Felhasználónév</span>
  <input value=${f.username} onChange=${e=>set({username:socClean(e.target.value)})} placeholder='pl. edzo_anna' autoCapitalize='none' autoCorrect='off' spellCheck=${false} class=${inp+' !text-left px-4 !text-base mb-1'}/>
  <p class='k-hint'>3–20 karakter: kisbetű, szám és aláhúzás. Mentés után 30 naponta egyszer módosíthatod.</p>
  <span class='k-fld-l'>Megjelenített név</span>
  <input value=${f.display_name} onChange=${e=>set({display_name:e.target.value.slice(0,40)})} placeholder='Megjelenített név' class=${inp+' !text-left px-4 !text-base mb-3'}/>
  <span class='k-fld-l'>Avatar színe</span>
  <div class='k-sws'>${SOC_COLORS.map(k=>html`<button type='button' key=${k} aria-pressed=${f.avatar_color===k} aria-label=${ACCS[k][0]} onClick=${()=>set({avatar_color:k})} style=${{background:ACCS[k][3]}} class='k-sw-c'></button>`)}</div>
  <span class='k-fld-l'>Avatar jele</span>
  <div class='k-sws'>${SOC_ICONS.map(k=>html`<button type='button' key=${k} aria-pressed=${f.avatar_icon===k} onClick=${()=>set({avatar_icon:k})} class='k-ibx'>${k==='initial'?html`<span class='fd'>Aa</span>`:html`<${Ic} n=${k} s=${22}/>`}</button>`)}</div></div>`;
 if(st==='load')return html`<${KBusy} t='Betöltés'/>`;
 if(st==='err')return html`<div><p class='k-hint k-warn'>${msg||'Nem sikerült betölteni.'}</p><button onClick=${load} class='k-btn sec sm full k-mt'>Újra</button></div>`;
 if(st==='none')return html`<div><p class='k-lead'>Hozz létre profilt. Alapból privát: idegenek csak a felhasználónevedet, a neved és az avatarod látják, az edzéseid és más adataid nem.</p>
  <div class='up k-card'>${Form()}</div>
  <div class='up k-card'><div class='k-cd-t'>Közösségi szabályok</div>
   <ul class='k-rules'><li>Tilos a zaklatás, a gyűlöletkeltés és a mások megsértése.</li><li>Tilos a spam és a megtévesztő vagy jogsértő tartalom.</li><li>A jelentett tartalmat és a szabályt sértő fiókot eltávolíthatjuk.</li><li>Bárkit tilthatsz, és bármit jelenthetsz.</li></ul>
   <button type='button' role='checkbox' aria-checked=${terms} onClick=${()=>setTerms(!terms)} class='k-chk'><span class='k-chk-b'>${terms&&html`<${UiIco} n='check' s=${18}/>`}</span>Elfogadom a közösségi szabályokat</button></div>
  <button onClick=${create} disabled=${busy} class=${bt}>Profil létrehozása</button>${Msg()}</div>`;
 if(pv)return html`<div><${SocProfile} u=${pv} me=${id} back=${()=>setPv(null)}/></div>`;
 return html`<div>
  <${KTabs} v=${tb} on=${setTb} o=${[['feed','Hírfolyam'],['conn','Kapcsolatok'],['grp','Csoportok'],['prof','Profil']]}/>
  <${HelpCalm} id='social.feed'/>
  ${tb==='feed'?html`<${SocFeed} me=${id} open=${setPv}/>`:tb==='conn'?html`<${SocConn} me=${id} open=${setPv}/>`:tb==='grp'?html`<${SocGroups} me=${id} open=${setPv}/>`:html`<div>
  <div class='up k-card'>${Form()}<button onClick=${save} disabled=${busy} class=${bt+' mt-4'}>Mentés</button>${Msg()}</div>
  <div class='up k-card'><div class='k-cd-t'>Adatvédelem</div>
   <${Sw} l='Nyilvános profil' s=${se&&se.is_public?'Bárki látja a profilod és a megosztott aktivitásaid.':'Privát: idegenek csak a felhasználóneved, a neved és az avatarod látják.'} v=${!!(se&&se.is_public)} on=${v=>pub(v,'is_public')}/>
   <${Sw} l='Edzéseim megosztása' s=${se&&se.share_activity?'A befejezett edzéseid összefoglalója megjelenik a követőidnél és a barátaidnál, a profilod láthatósága szerint.':'Kikapcsolva: az edzéseid nem jelennek meg a közösségben.'} v=${!!(se&&se.share_activity)} on=${v=>pub(v,'share_activity')}/></div>
  <${SocMine} me=${id}/>
  <${SocBlocks}/>
  <div class='up k-card'><div class='k-cd-t'>Profil törlése</div><p class='k-hint'>A profil és a közösségi beállításaid törlődnek. Az edzéseid és a többi adatod nem érintett.</p>
   <button onClick=${del} disabled=${busy} class=${'k-btn dan sm full'+(cf?' ask':'')}>${cf?'Biztosan törlöd?':'Profil törlése'}</button></div></div>`}</div>`;
}
