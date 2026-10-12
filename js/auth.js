/* ---------- Fiók, terv, kalkulátorok ---------- */
const SBU='https://agbicihwrzgzodwdvype.supabase.co',SBK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYmljaWh3cnpnem9kd2R2eXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MDY3MjAsImV4cCI6MjEwNzI4MjcyMH0.imJ-dWCDYkOhcul8ADV_HXOmGwYNkqbd0nC0w1uXL2Y';
let SESS=null,SYB=false,CTG=[];
const NATIVE=()=>!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
const getLN=()=>NATIVE()&&Capacitor.registerPlugin?Capacitor.registerPlugin('LocalNotifications'):null;
const ssave=()=>{try{SESS?localStorage.setItem('en_sb',JSON.stringify(SESS)):localStorage.removeItem('en_sb')}catch(e){}};
const sload=()=>{try{SESS=JSON.parse(localStorage.getItem('en_sb')||'null')}catch(e){SESS=null}};
const hdr=t=>({apikey:SBK,'Content-Type':'application/json',Authorization:'Bearer '+(t||SBK)});
const sess=j=>{SESS={access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),user:j.user||(SESS&&SESS.user)};ssave()};
async function refresh(){if(!SESS)return false;try{const r=await fetch(SBU+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:hdr(),body:JSON.stringify({refresh_token:SESS.refresh_token})}),j=await r.json();if(r.ok&&j.access_token){sess(j);return true}if(r.status>=400&&r.status<500){SESS=null;ssave()}}catch(e){}return false}
async function sbf(path,o={},auth=true,retry=true){
 if(auth&&SESS&&SESS.expires_at-60<Date.now()/1000)await refresh();
 const r=await fetch(SBU+path,{...o,headers:{...hdr(auth&&SESS?SESS.access_token:null),...(o.headers||{})}});
 if(r.status===401&&auth&&retry&&SESS&&await refresh())return sbf(path,o,auth,false);
 const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){}
 return{ok:r.ok,status:r.status,j};
}
const BUILD='12okt-16';let DBG=[],DBGF=null;
const dbg=m=>{const d=new Date();DBG=[...DBG,String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0')+' '+m].slice(-6);DBGF&&DBGF()};
const PL={};const getPl=n=>{try{return NATIVE()&&Capacitor.registerPlugin?(PL[n]=PL[n]||Capacitor.registerPlugin(n)):null}catch(e){return null}};
const PLA=n=>{try{return NATIVE()&&Capacitor.isPluginAvailable&&Capacitor.isPluginAvailable(n)?1:0}catch(e){return 0}};
const newHc=()=>{const a=new Uint8Array(24);crypto.getRandomValues(a);return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('')};
const hcGet=()=>{try{const o=JSON.parse(localStorage.getItem('en_hc')||'null');return o&&o.c&&Date.now()-o.t<6e5?o:null}catch(e){return null}};
const hcSet=c=>{try{c?localStorage.setItem('en_hc',JSON.stringify({c,t:Date.now()})):localStorage.removeItem('en_hc')}catch(e){}};
const rpc=(fn,body)=>sbf('/rest/v1/rpc/'+fn,{method:'POST',body:JSON.stringify(body)},false);
let POLL=null,POLLN=0,GONE=0,LASTP='';
const ptag=t=>{if(t!==LASTP){LASTP=t;dbg(t)}};
function stopPoll(){if(POLL){clearInterval(POLL);POLL=null}}
async function pollOnce(cb){const o=hcGet();if(!o)return false;POLLN++;
 try{const r=await rpc('take_handoff',{p_code:o.c});
  if(r.ok&&r.j&&r.j.access_token){dbg('got');hcSet(null);stopPoll();cb(r.j);return true}
  ptag(r.ok?'poll none':'poll '+r.status)}
 catch(e){ptag('poll net')}
 return false}
function startPoll(cb,setW,fin){stopPoll();POLLN=0;GONE=0;LASTP='';
 POLL=setInterval(async()=>{if(!hcGet()){GONE++;fin();if(GONE>8){stopPoll();setW(false)}return}GONE=0;await pollOnce(cb)},1500)}
const ss=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(x=>[x,v[x]])):v);
const docNow=()=>({food:gj('food',null),ct:gj('ct',null),hist:gj('h',[]),plan:gj('plan',null),opt:gj('opt',null),prof:gj('prof',null),bw:gj('bw',[]),del:gj('del',[]),ts:gj('ts',0)});
const mergeD=(L,R)=>{const del=[...new Set([...(L.del||[]),...(R.del||[])])],dm=new Set(del),m=new Map();
 for(const w of [...(R.hist||[]),...(L.hist||[])])if(!dm.has(w.id))m.set(w.id,w);
 const hist=[...m.values()].sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:b.id-a.id),nw=(L.ts||0)>=(R.ts||0),bm=new Map();
 for(const e of [...(nw?R.bw||[]:L.bw||[]),...(nw?L.bw||[]:R.bw||[])])bm.set(e.d,e);
 const pk=k=>nw?(L[k]??R[k]):(R[k]??L[k]);
 return{food:pk('food'),ct:pk('ct'),hist,plan:pk('plan'),opt:pk('opt'),prof:pk('prof'),bw:[...bm.values()].sort((a,b)=>a.d<b.d?-1:1),del,ts:Math.max(L.ts||0,R.ts||0)}};
function Reset({done}){
 const[p,setP]=useState(''),[er,setEr]=useState('');
 const go=async()=>{if(p.length<6)return setEr('A jelszó legalább 6 karakter legyen.');try{const r=await sbf('/auth/v1/user',{method:'PUT',body:JSON.stringify({password:p})});r.ok?done():setEr('Hálózati hiba, próbáld újra.')}catch(e){setEr('Hálózati hiba, próbáld újra.')}};
 return html`<div class='min-h-screen flex items-center justify-center px-5'><div class='up w-full max-w-sm grid gap-3'><h1 class='fd text-4xl font-bold text-center'>Új jelszó</h1><input class=${inp+' !text-left px-4 !text-base'} type='password' placeholder='Új jelszó' value=${p} onChange=${e=>setP(e.target.value)}/>${er&&html`<p class='text-red-400 text-sm'>${er}</p>`}<button onClick=${go} class='h-14 rounded-2xl bg-lime-400 text-black font-bold text-lg'>Jelszó mentése</button></div></div>`;
}
const Fld=({ic,children})=>html`<div class='relative'><span class='absolute left-3.5 top-3.5 text-zinc-500'><${Ic} n=${ic} s=${20}/></span>${children}</div>`;
function Auth({on,note,gstart,wt,chk,dbgl}){
 const[lg,setLg]=useState(LANG),[m,setM]=useState('in'),[em,setEm]=useState(''),[p,setP]=useState(''),[p2,setP2]=useState(''),[sh,setSh]=useState(false),[er,setEr]=useState(''),[ok,setOk]=useState(''),[bz,setBz]=useState(false);
 const fail=j=>{const t=((j&&(j.error_description||j.msg||j.message))||'')+'';return /invalid login|invalid_grant/i.test(t)?'Hibás e-mail vagy jelszó.':/not confirmed/i.test(t)?'Az e-mail cím még nincs megerősítve.':/already registered|already exists/i.test(t)?'Ehhez az e-mail címhez már tartozik fiók. Lépj be, vagy használd az „Elfelejtett jelszó?” opciót.':/at least|weak/i.test(t)?'A jelszó legalább 6 karakter legyen.':/valid email|invalid format/i.test(t)?'Érvénytelen e-mail cím.':/rate limit/i.test(t)?'Túl sok próba, várj egy kicsit.':t||'Hálózati hiba, próbáld újra.'};
 const em2=()=>em.trim().toLowerCase(),bad=()=>!/^\S+@\S+\.\S+$/.test(em2());
 const go=async()=>{setEr('');setOk('');
  if(bad())return setEr('Érvénytelen e-mail cím.');
  if(p.length<6)return setEr('A jelszó legalább 6 karakter legyen.');
  if(m==='up'&&p!==p2)return setEr('A két jelszó nem egyezik.');
  setBz(true);
  try{const r=await sbf(m==='in'?'/auth/v1/token?grant_type=password':'/auth/v1/signup',{method:'POST',body:JSON.stringify({email:em2(),password:p})},false);
   if(r.ok&&r.j&&r.j.access_token){sess(r.j);on(SESS.user)}
   else if(r.ok){const u=r.j&&(r.j.user||r.j);if(m==='up'&&u&&Array.isArray(u.identities)&&u.identities.length===0){setEr('Ehhez az e-mail címhez már tartozik fiók. Lépj be, vagy használd az „Elfelejtett jelszó?” opciót.');setM('in')}else setOk('Ellenőrizd az e-mailedet: a megerősítő link után jelentkezz be.')}
   else setEr(fail(r.j))}
  catch(x){setEr('Hálózati hiba, próbáld újra.')}
  setBz(false)};
 const rec=async()=>{setEr('');setOk('');if(bad())return setEr('Érvénytelen e-mail cím.');try{await sbf('/auth/v1/recover',{method:'POST',body:JSON.stringify({email:em2()})},false);setOk('Küldtünk egy jelszó-visszaállító e-mailt, ha létezik ilyen fiók.')}catch(x){setEr('Hálózati hiba, próbáld újra.')}};
 const goog=()=>{if(NATIVE()&&gstart){gstart();return}location.href=SBU+'/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent(location.origin+location.pathname)};
 const ky=e=>e.key==='Enter'&&go(),ip=inp+' !text-left !text-base !pl-11 !pr-4';
 const pw=(v,set,ph,cls)=>html`<${Fld} ic='lock'><input class=${ip+' !pr-12 '+(cls||'')} type=${sh?'text':'password'} placeholder=${ph} value=${v} onChange=${e=>set(e.target.value)} onKeyDown=${ky}/><button type='button' onClick=${()=>setSh(!sh)} class='absolute right-1 top-1 h-10 w-10 flex items-center justify-center text-zinc-400'><${Ic} n=${sh?'eyeoff':'eye'} s=${20}/></button><//>`;
 return html`<div class='min-h-screen flex items-center justify-center px-5 py-8'><div class='up w-full max-w-sm'>
  <div class='flex justify-end gap-1 mb-3'>${['hu','en'].map(l=>html`<button key=${l} onClick=${()=>{try{localStorage.setItem('en_lang',l)}catch(e){}LANG=l;setLg(l)}} class=${'px-3 h-9 rounded-lg text-sm '+(lg===l?'bg-lime-400 text-black font-semibold':'bg-zinc-800 text-zinc-400')}>${l.toUpperCase()}</button>`)}</div>
  <div class='text-center mb-6'><div class='relative w-20 h-20 mx-auto mb-4'><div class='absolute inset-0 rounded-3xl bg-lime-400 blur-xl opacity-60 glow'></div><div class='relative w-20 h-20 rounded-3xl bg-lime-400 text-black flex items-center justify-center float'><${Ic} n='dumbbell' s=${38}/></div></div><h1 class='fd text-5xl font-bold grad'>Edzésnapló</h1><p class='text-zinc-400 text-sm mt-1'>Kövesd, tervezd és told a határaidat</p></div>
  <div class='bg-zinc-900 border border-zinc-800 rounded-3xl p-4'>
   <div class='grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-zinc-800 mb-4'>${[['in','Belépés'],['up','Regisztráció']].map(([k,l])=>html`<button key=${k} onClick=${()=>{setM(k);setEr('');setOk('')}} class=${'h-10 rounded-xl text-sm font-semibold transition-all duration-300 '+(m===k?'bg-lime-400 text-black':'text-zinc-400')}>${l}</button>`)}</div>
   ${!/Electron/.test(navigator.userAgent)&&html`<button onClick=${goog} class='w-full h-12 rounded-xl bg-white text-zinc-800 font-semibold flex items-center justify-center gap-3 mb-3'><span class='w-6 h-6 rounded-full flex items-center justify-center font-bold text-white' style=${{background:'conic-gradient(#ea4335 0 25%,#fbbc05 0 50%,#34a853 0 75%,#4285f4 0)'}}>G</span>Folytatás Google-lel</button>${wt&&html`<button onClick=${chk} class='w-full h-11 rounded-xl bg-zinc-800 text-lime-300 text-sm font-semibold mb-3'>Már beléptem a Chrome-ban</button>`}
   <div class='flex items-center gap-3 text-xs text-zinc-500 mb-3'><span class='flex-1 h-px bg-zinc-700'></span>vagy<span class='flex-1 h-px bg-zinc-700'></span></div>`}
   <div class='grid gap-3'>
    <${Fld} ic='mail'><input class=${ip} type='email' placeholder='E-mail' autoCapitalize='none' value=${em} onChange=${e=>setEm(e.target.value)} onKeyDown=${ky}/><//>
    ${pw(p,setP,'Jelszó')}
    ${m==='up'&&html`<div class='up'>${pw(p2,setP2,'Jelszó újra')}</div>`}
    ${er&&html`<p class='up text-red-400 text-sm'>${er}</p>`}${ok&&html`<p class='up text-lime-300 text-sm'>${ok}</p>`}${note&&html`<p class='up text-amber-300 text-sm break-all'>${note}</p>`}
    <button disabled=${bz} onClick=${go} class='sh h-14 rounded-2xl bg-lime-400 text-black font-bold text-lg'>${bz?'...':m==='in'?'Belépés':'Fiók létrehozása'}</button>
    ${m==='in'&&html`<button onClick=${rec} class='text-sm text-zinc-400 py-1'>Elfelejtett jelszó?</button>`}</div></div>
  <p class='text-xs text-zinc-500 text-center mt-4'>Az adataid a fiókodhoz kötve, titkosított kapcsolaton szinkronizálódnak.</p>
  <p class='text-[10px] leading-snug text-zinc-600 text-center mt-3 break-all'>${dbgl}</p></div></div>`;
}
function Handoff({hash,cont}){
 const hp=new URLSearchParams(hash.replace(/^[#?]/,'')),hc=new URLSearchParams(location.search).get('hc')||'';
 const[st,setSt]=useState(hc?'send':'nohc'),[er,setEr]=useState(''),link='edzesnaplo://auth?ok=1';
 useEffect(()=>{if(!hc)return;
  rpc('put_handoff',{p_code:hc,p_payload:{access_token:hp.get('access_token'),refresh_token:hp.get('refresh_token')||'',expires_at:+hp.get('expires_at')||0,type:hp.get('type')||''}})
   .then(r=>{if(r.ok){setSt('ok');setTimeout(()=>{try{location.href=link}catch(e){}},900)}else{setSt('err');setEr(String(r.status))}})
   .catch(()=>{setSt('err');setEr('net')})},[]);
 const bad=st==='err'||st==='nohc';
 return html`<div class='min-h-screen flex items-center justify-center px-5'><div class='up w-full max-w-sm text-center grid gap-4'>
  <div class=${'mx-auto w-20 h-20 rounded-3xl text-black flex items-center justify-center float '+(bad?'bg-amber-300':'bg-lime-400')}><${Ic} n='check' s=${40}/></div>
  <h1 class='fd text-4xl font-bold'>${st==='err'?'Az átadás nem sikerült':'Sikeres belépés'}</h1>
  <p class='text-zinc-400 text-sm'>${st==='send'?'Átadás az appnak...':st==='ok'?'Kész! Térj vissza az Edzésnapló appba.':st==='nohc'?'Az átadás kódja hiányzik':'('+er+')'}</p>
  ${(st==='ok'||st==='err')&&html`<a href=${link} class='sh h-14 rounded-2xl bg-lime-400 text-black font-bold text-lg flex items-center justify-center'>Megnyitás az appban</a>`}
  <button onClick=${cont} class='text-sm text-zinc-400 py-2'>Folytatás itt a böngészőben</button>
  <p class='text-[10px] text-zinc-600'>v${BUILD}</p></div></div>`;
}
function Root(){
 const[u,setU]=useState(()=>{sload();return SESS&&SESS.user?SESS.user:null}),[rs,setRs]=useState(false),[gm,setGm]=useState(''),[ho,setHo]=useState(null),[wt,setWt]=useState(()=>NATIVE()&&!!hcGet()),[,tk]=useState(0);
 DBGF=()=>tk(n=>n+1);
 LANG=(()=>{try{return localStorage.getItem('en_lang')||'hu'}catch(e){return'hu'}})();
 if(u)CU=u.id;
 const feed=hsh=>{const hp=new URLSearchParams(hsh.replace(/^[#?]/,'')),t=hp.get('access_token');
  SESS={access_token:t,refresh_token:hp.get('refresh_token'),expires_at:+hp.get('expires_at')||Math.floor(Date.now()/1000)+3600,user:null};
  sbf('/auth/v1/user').then(r=>{if(r.ok){SESS.user=r.j;ssave();setGm('');hp.get('type')==='recovery'?setRs(true):setU(r.j)}else{SESS=null;ssave();setGm(tr('Google-belépési hiba')+': '+(r.status||''))}}).catch(()=>{SESS=null;setGm(tr('Hálózati hiba, próbáld újra.'))})};
 const onTok=j=>{try{const B=getPl('Browser');B&&B.close&&B.close().catch(()=>{})}catch(e){}setWt(false);setGm(tr('Belépés folyamatban...'));dbg('login');feed(new URLSearchParams({access_token:j.access_token,refresh_token:j.refresh_token||'',expires_at:String(j.expires_at||''),type:j.type||''}).toString())};
 const fin=()=>{sload();if(SESS&&SESS.user){stopPoll();setWt(false);setU(SESS.user)}};
 const run=()=>{setWt(true);startPoll(onTok,setWt,fin)};
 const gstart=async()=>{const c=newHc();hcSet(c);setGm('');dbg('start');run();
  const url=SBU+'/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent(location.origin+location.pathname+'?app=1&hc='+c);
  try{const B=getPl('Browser');if(!B)throw new Error('no plugin');await B.open({url});dbg('open')}
  catch(e){dbg('open err '+String((e&&(e.message||e.errorMessage||e.code))||e).replace(/\s+/g,' ').slice(0,70));
   try{dbg('fallback');location.href=url}catch(e2){dbg('nav err');stopPoll();hcSet(null);setWt(false);setGm(tr('Google-belépési hiba')+': Browser')}}};
 const chk2=async()=>{if(!hcGet()){setWt(false);setGm(tr('A belépés lejárt, próbáld újra.'));return}
  setGm('');dbg('manual');const ok=await pollOnce(onTok);if(!ok){fin();if(!(SESS&&SESS.user))setGm(tr('Még nem érkezett meg a belépés. Próbáld újra egy pillanat múlva.'))}};
 useEffect(()=>{if(!NATIVE())return;
  const chk=()=>{if(hcGet()){pollOnce(onTok);run()}else if(!(SESS&&SESS.user))fin()};
  try{const A=getPl('App');if(A){A.addListener('appStateChange',s=>{dbg('app '+(s&&s.isActive?'on':'off'));if(s&&s.isActive)chk()});A.addListener('appUrlOpen',()=>{dbg('url');chk()})}}catch(e){dbg('app plugin err')}
  const vis=()=>{if(!document.hidden)chk()};document.addEventListener('visibilitychange',vis);
  chk();return()=>document.removeEventListener('visibilitychange',vis)},[]);
  useEffect(()=>{const hp=new URLSearchParams(location.hash.slice(1)),t=hp.get('access_token');if(!t)return;
  if(/[?&]app=1/.test(location.search)&&!NATIVE()){setHo(location.hash);return}
  SESS={access_token:t,refresh_token:hp.get('refresh_token'),expires_at:+hp.get('expires_at')||Math.floor(Date.now()/1000)+3600,user:null};
  history.replaceState(null,'',location.pathname+location.search);
  sbf('/auth/v1/user').then(r=>{if(r.ok){SESS.user=r.j;ssave();hp.get('type')==='recovery'?setRs(true):setU(r.j)}else{SESS=null;ssave()}})},[]);
 const out=async()=>{try{SESS&&await sbf('/auth/v1/logout',{method:'POST'})}catch(e){}SESS=null;ssave();setU(null)};
 if(ho)return html`<${Handoff} hash=${ho} cont=${()=>{const h=ho;history.replaceState(null,'',location.pathname);setHo(null);feed(h)}}/>`;
 if(rs)return html`<${Reset} done=${()=>{setRs(false);setU(SESS.user)}}/>`;
 return u?html`<${App} key=${u.id} user=${(u.email||'').split('@')[0]} out=${out}/>`:html`<${Auth} on=${x=>setU(x)} note=${gm||(wt?tr('Várakozás a belépésre a Chrome-ban...'):'')} gstart=${gstart} wt=${wt} chk=${chk2} dbgl=${'v'+BUILD+' app:'+(NATIVE()?1:0)+' browser:'+PLA('Browser')+' appplugin:'+PLA('App')+(DBG.length?' | '+DBG.join(' · '):'')}/>`;
}
