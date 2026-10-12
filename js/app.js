const MENU=[['plan','','cal','Terv','#a78bfa,#6366f1'],['tools','c','flame','Kardió','#fb923c,#f43f5e'],['tools','k','apple','Kalória','#84cc16,#10b981'],['tools','e','dumbbell','Erő','#22d3ee,#3b82f6'],['tools','i','timer','Intervall','#f472b6,#a855f7'],['tools','b','user','Test és mérések','#34d399,#06b6d4'],['edit','','edit','Tervszerkesztő','#facc15,#f97316'],['opt','','dl','Export és adatok','#38bdf8,#6366f1'],['opt','','gear','Opciók','#94a3b8,#475569'],['cycle','','drop','Ciklus','#f472b6,#e11d48']];
/* ---------- Alkalmazás ---------- */
function App({user,out}){
 const today=dk(new Date());
 const[tab,setTab]=useState('home'),[sel,setSel]=useState(today),[hist,setHist]=useState(ld),[aw,setAw]=useState(null),[rest,setRest]=useState(null),[rd,setRd]=useState(()=>gj('opt',{}).rest||90),[fin,setFin]=useState(null),[ts,setTs]=useState(null),[plan,setPlan]=useState(()=>gj('plan',{days:{},time:'07:00',on:false})),[opt,setOpt]=useState(()=>({lang:(()=>{try{return localStorage.getItem('en_lang')||'hu'}catch(e){return'hu'}})(),wg:3,ac:'lime',th:'alap',mode:(()=>{try{return localStorage.getItem('en_mode')==='light'?'light':'dark'}catch(e){return'dark'}})(),fs:16,an:true,rest:90,auto:true,snd:true,vib:true,wake:true,step:1.25,pct:2.5,...gj('opt',{})}));
 ACC=(ACCS[opt.ac]||ACCS.lime)[opt.mode==='light'?5:3];OPT=opt;LANG=opt.lang;
 const[sy,setSy]=useState({s:'idle',t:''}),[ct,setCt]=useState(()=>gj('ct',[])),[menu,setMenu]=useState(false),[sub,setSub]=useState('');CTG=ct;sjt('ct',ct);
 useEffect(()=>sv(hist),[hist]);
 const setHistT=v=>{const nv=typeof v==='function'?v(hist):v,gone=hist.filter(w=>!nv.some(x=>x.id===w.id)).map(w=>w.id);if(gone.length)sjt('del',[...new Set([...gj('del',[]),...gone])]);setHist(nv)};
 const syncNow=async()=>{if(!SESS||SYB)return;SYB=true;setSy(x=>({...x,s:'busy'}));try{
  const r=await sbf('/rest/v1/user_data?select=data&user_id=eq.'+SESS.user.id);if(!r.ok)throw 0;
  const R=r.j&&r.j[0]?r.j[0].data:null,L=docNow(),M=R?mergeD(L,R):{...L,ts:L.ts||Date.now()};
  if(ss(docNow())!==ss(L)){SYB=false;return setTimeout(syncNow,1500)}
  if(ss(M.hist)!==ss(L.hist)){sj('h',M.hist);setHist(M.hist)}
  if(M.plan&&ss(M.plan)!==ss(L.plan)){sj('plan',M.plan);setPlan(M.plan)}
  if(M.opt&&ss(M.opt)!==ss(L.opt)){sj('opt',M.opt);setOpt(M.opt)}
  if(M.food)sj('food',M.food);if(M.ct&&ss(M.ct)!==ss(L.ct)){sj('ct',M.ct);setCt(M.ct)}if(M.prof)sj('prof',M.prof);sj('bw',M.bw);sj('del',M.del);sj('ts',M.ts);
  if(!R||ss(M)!==ss(R)){const w=await sbf('/rest/v1/user_data?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:SESS.user.id,data:M,updated_at:new Date().toISOString()})});if(!w.ok)throw 0}
  const d=new Date();setSy({s:'ok',t:pad(d.getHours())+':'+pad(d.getMinutes())})}catch(e){setSy(x=>({...x,s:navigator.onLine?'err':'off'}))}SYB=false};
 const delAcc=async()=>{const r=await sbf('/rest/v1/rpc/delete_my_account',{method:'POST',body:'{}'});if(!r.ok)return toast('A fiók törlése nem sikerült.');try{Object.keys(localStorage).filter(k=>k.startsWith('en:'+CU+':')).forEach(k=>localStorage.removeItem(k))}catch(e){}toast('Fiók és minden adat törölve');out()};
 useEffect(()=>{const t=setTimeout(syncNow,2500);return()=>clearTimeout(t)},[hist,plan,opt,ct,tab]);
 useEffect(()=>{const i=setInterval(syncNow,60000),f=()=>document.visibilityState==='visible'&&syncNow();window.addEventListener('online',syncNow);document.addEventListener('visibilitychange',f);return()=>{clearInterval(i);window.removeEventListener('online',syncNow);document.removeEventListener('visibilitychange',f)}},[]);
 sjt('plan',plan);
 sjt('opt',opt);
 useEffect(()=>{const a=ACCS[opt.ac]||ACCS.lime,lt=opt.mode==='light',t=lt?LIGHT:(THEMES[opt.th]||THEMES.alap),r=document.documentElement,st=r.style;st.setProperty('--a3',a[1]);st.setProperty('--a4',a[2]);st.setProperty('--at',a[4]);st.setProperty('--z7',t[1]);st.setProperty('--z8',t[2]);st.setProperty('--z9',t[3]);st.setProperty('--bg',t[4]);st.fontSize=opt.fs+'px';r.classList.toggle('noanim',!opt.an);r.classList.toggle('lt',lt);try{localStorage.setItem('en_mode',lt?'light':'dark')}catch(e){}const mt=document.querySelector('meta[name=theme-color]');mt&&mt.setAttribute('content',lt?'#f4f5f8':'#090b0e')},[opt]);
 useEffect(()=>setRd(opt.rest),[opt.rest]);
 useEffect(()=>{const LN=getLN();LN&&LN.requestPermissions().catch(()=>{})},[]);
 useEffect(()=>{if(!rest){const LN=getLN();LN&&LN.cancel({notifications:[{id:7001}]}).catch(()=>{})}},[rest]);
 useEffect(()=>{const LN=getLN();if(!LN)return;(async()=>{try{await LN.cancel({notifications:[1,2,3,4,5,6,7].map(i=>({id:8000+i}))});if(!plan.on)return;const[hh,mm]=plan.time.split(':').map(Number),ns=[];for(let d=0;d<7;d++){const v=plan.days[d];if(!v||!dayOf(v))continue;const m=remind(hist,v);ns.push({id:8001+d,title:m.t,body:m.b,schedule:{on:{weekday:d+1,hour:hh,minute:mm},allowWhileIdle:true}})}if(ns.length)await LN.schedule({notifications:ns})}catch(e){}})()},[plan,hist,opt.lang]);
 useEffect(()=>{const c=()=>{if(!plan.on)return;const d=new Date(),k=dk(d),v=plan.days[d.getDay()];if(!v||pad(d.getHours())+':'+pad(d.getMinutes())<plan.time||gj('n','')===k)return;sj('n',k);const m=remind(hist,v);toast(m.t+': '+m.b.split('\n')[0]);try{Notification.permission==='granted'&&new Notification(m.t,{body:m.b})}catch(e){}};c();const i=setInterval(c,30000);return()=>clearInterval(i)},[plan,hist]);
 useEffect(()=>{let t;const f=e=>{setTs(e.detail);clearTimeout(t);t=setTimeout(()=>setTs(null),2800)};window.addEventListener('toast',f);return()=>window.removeEventListener('toast',f)},[]);
 useEffect(()=>{let l;if(aw&&opt.wake&&navigator.wakeLock)navigator.wakeLock.request('screen').then(x=>l=x).catch(()=>{});return()=>{l&&l.release().catch(()=>{})}},[!!aw,opt.wake]);
 const startRest=()=>{if(!opt.auto)return;setRest({end:Date.now()+rd*1000,total:rd});try{const LN=getLN();LN&&LN.schedule({notifications:[{id:7001,title:tr('Pihenő vége'),body:tr('Mehet a következő sorozat'),schedule:{at:new Date(Date.now()+rd*1000),allowWhileIdle:true}}]})}catch(e){}};
 const begin=(name,names,gl={},date)=>setAw({date:date||sel,name,t:Date.now(),ex:names.map(n=>newEx(n,hist,gl[n]))});
 const finish=()=>{
  const ex=aw.ex.map(e=>({n:e.n,sets:e.sets.filter(s=>s.done)})).filter(e=>e.sets.length);
  if(!ex.length)return;
  setHist([{id:aw.t,date:aw.date,name:aw.name,ex,vol:ex.reduce((a,e)=>a+vol(e.sets),0)},...hist]);
  setFin({name:aw.name,n:ex.length,vol:ex.reduce((a,e)=>a+vol(e.sets),0),sets:ex.reduce((a,e)=>a+e.sets.length,0),pr:ex.reduce((a,e)=>a+e.sets.filter(s=>s.pr).length,0)});setAw(null);setRest(null);setTab('home');
 };
 const quit=()=>{setAw(null);setRest(null)};
 const dock=[['home','home','Kezdőlap'],['log','dumbbell','Edzés'],['food','apple','Étel'],['hist','chart','Napló'],['menu','grid','Menü']],act=['home','log','food','hist'].includes(tab)?tab:'menu',di=dock.findIndex(x=>x[0]===act);
 const go2=(t,u)=>{setTab(t);setSub(u||'');setMenu(false);try{window.scrollTo(0,0)}catch(e){}};
 const startToday=()=>{const v=plan.days[new Date().getDay()],x=v&&dayOf(v);if(!x)return go2('log');const g=goalsFor(hist,x);begin(x.n,x.e,Object.fromEntries(g.map(y=>[y.n,y])),today);setTab('log')};
 return html`<${React.Fragment}>
  <div key=${tab} class="up max-w-md mx-auto px-4 pt-5 pb-52">
   ${tab==='home'&&html`<${Home} hist=${hist} sel=${sel} setSel=${setSel} today=${today} aw=${aw} go=${()=>setTab('log')} nav=${go2} startToday=${startToday} plan=${plan} user=${user} out=${out}/>`}
   ${tab==='log'&&html`<${Log} aw=${aw} setAw=${setAw} hist=${hist} sel=${sel} rd=${rd} setRd=${setRd} startRest=${startRest} begin=${begin} finish=${finish} quit=${quit}/>`}
   ${tab==='hist'&&html`<${Hist} hist=${hist} del=${id=>setHistT(hist.filter(w=>w.id!==id))}/>`}
   ${tab==='plan'&&html`<${Plan} plan=${plan} setPlan=${setPlan} hist=${hist} today=${today} begin=${(...a)=>{begin(...a);setTab('log')}}/>`}
   ${tab==='tools'&&html`<${Tools} key=${sub} init=${sub}/>`}
   ${tab==='cycle'&&html`<${Cycle} plan=${plan} hist=${hist} today=${today}/>`}${tab==='food'&&html`<${Food}/>`}${tab==='edit'&&html`<${Editor} ct=${ct} setCt=${setCt}/>`}
   ${tab==='opt'&&html`<${Opts} opt=${opt} setOpt=${setOpt} hist=${hist} setHist=${setHistT} plan=${plan} setPlan=${setPlan} user=${user} out=${out} sy=${sy} syncNow=${syncNow} delAcc=${delAcc}/>`}
  </div>
  <${CycPop} go=${go2}/>
  ${menu&&html`<div class='fade fixed inset-0 z-40 bg-black/70 flex items-end' style=${{WebkitBackdropFilter:'blur(6px)',backdropFilter:'blur(6px)'}} onClick=${()=>setMenu(false)}><div class='sheet w-full max-w-md mx-auto bg-zinc-900 rounded-t-3xl p-4 pb-8' onClick=${e=>e.stopPropagation()}>
   <div class='flex items-center justify-between mb-3'><div class='fd text-3xl font-bold'>Menü</div><button onClick=${()=>setMenu(false)} class='h-10 w-10 flex items-center justify-center text-zinc-400'><${Ic} n='x'/></button></div>
   <div class='grid grid-cols-3 gap-2.5'>${MENU.filter(m=>m[0]!=='cycle'||cycAvail()).map((m,i)=>html`<button key=${m[3]} onClick=${()=>go2(m[0],m[1])} class='up rounded-2xl p-3 text-left min-h-[92px] flex flex-col justify-between' style=${{background:'linear-gradient(135deg,'+m[4]+')',animationDelay:i*35+'ms'}}><${Ic} n=${m[2]} s=${24} c='text-white'/><div class='text-white text-[13px] font-semibold leading-tight'>${m[3]}</div></button>`)}</div></div></div>`}
  <${Rest} rest=${rest} setRest=${setRest}/>
  ${ts&&html`<div class='fixed top-0 inset-x-0 z-50 flex justify-center px-4 pointer-events-none' style=${{paddingTop:'calc(env(safe-area-inset-top,0px) + 12px)'}}><div class='up relative bg-lime-400 text-black font-bold rounded-2xl px-5 py-3 shadow-xl'>${ts.m}${ts.pr&&html`<${Conf}/>`}</div></div>`}
  ${fin&&html`<div class='fade fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6' onClick=${()=>setFin(null)}><div class='up relative w-full max-w-sm bg-zinc-900 border border-lime-400/40 rounded-3xl p-6 text-center'><svg viewBox='0 0 52 52' class='w-20 h-20 mx-auto mb-3'><circle cx='26' cy='26' r='23' fill='none' stroke=${ACC} strokeWidth='3' pathLength='600' class='draw'/><path d='M15 27l8 8 14-16' fill='none' stroke=${ACC} strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' pathLength='600' class='draw' style=${{animationDelay:'.5s'}}/></svg><h2 class='fd text-4xl font-bold'>Edzés kész!</h2><p class='text-zinc-400 text-sm mb-4'>${fin.name}</p><div class='grid grid-cols-3 gap-2 mb-4'>${[['Gyakorlat',fin.n,''],['Sorozat',fin.sets,''],['Térfogat',fin.vol,'kg']].map(([l,v,u])=>html`<div key=${l} class='bg-zinc-800 rounded-2xl p-3'><div class='fd text-2xl font-bold text-lime-400'><${Cnt} to=${v}/>${u&&html`<span class='text-xs text-zinc-500 ml-1'>${u}</span>`}</div><div class='text-xs text-zinc-400'>${l}</div></div>`)}</div>${fin.pr>0&&html`<div class='text-lime-300 font-semibold mb-3'>${fin.pr} új egyéni rekord!</div><${Conf} n=${30}/>`}<button class='w-full h-14 rounded-2xl bg-lime-400 text-black font-bold text-lg'>Rendben</button></div></div>`}
  <nav class='fixed bottom-3 inset-x-3 z-30' style=${{paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
   <div class='max-w-md mx-auto relative grid grid-cols-5 rounded-3xl bg-zinc-900 border border-zinc-800 p-1.5'>
    <span class='absolute top-1.5 bottom-1.5 left-1.5 rounded-2xl bg-lime-400/15 border border-lime-400/30 transition-transform duration-500' style=${{width:'calc((100% - 12px)/5)',transform:`translateX(${di*100}%)`,transitionTimingFunction:'cubic-bezier(.2,.9,.3,1.2)'}}></span>
    ${dock.map(([k,ic,l])=>html`<button key=${k} onClick=${()=>k==='menu'?setMenu(true):go2(k)} class=${'relative h-14 flex flex-col items-center justify-center gap-0.5 text-[11px] transition-colors '+(act===k?'text-lime-400':'text-zinc-400')}><${Ic} n=${ic} s=${22}/>${l}</button>`)}
   </div></nav>
 <//>`;
}
ReactDOM.createRoot(document.getElementById('root')).render(h(Root));
