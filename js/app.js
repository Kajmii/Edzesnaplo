const MENU=[['plan','','cal','Terv','#a78bfa,#6366f1'],['tools','c','flame','Kardió','#fb923c,#f43f5e'],['tools','k','apple','Kalória','#84cc16,#10b981'],['tools','e','dumbbell','Erő','#22d3ee,#3b82f6'],['tools','i','timer','Intervall','#f472b6,#a855f7'],['tools','b','user','Test és mérések','#34d399,#06b6d4'],['edit','','edit','Tervszerkesztő','#facc15,#f97316'],['opt','','dl','Export és adatok','#38bdf8,#6366f1'],['opt','','gear','Opciók','#94a3b8,#475569'],['cycle','','drop','Ciklus','#f472b6,#e11d48'],['social','','user','Közösség','#60a5fa,#7c3aed']];
/* ---------- Alkalmazás ---------- */
function App({user,out}){
 const today=dk(new Date());
 const[tab,setTab]=useState('home'),[sel,setSel]=useState(today),[hist,setHist]=useState(ld),[aw,setAw]=useState(null),[rest,setRest]=useState(null),[rd,setRd]=useState(()=>gj('opt',{}).rest||90),[fin,setFin]=useState(null),[ts,setTs]=useState(null),[plan,setPlan]=useState(()=>gj('plan',{days:{},time:'07:00',on:false})),[opt,setOpt]=useState(()=>({lang:(()=>{try{return localStorage.getItem('en_lang')||'hu'}catch(e){return'hu'}})(),wg:3,ac:'lime',th:'alap',mode:(()=>{try{return localStorage.getItem('en_mode')==='light'?'light':'dark'}catch(e){return'dark'}})(),fs:16,an:true,rest:90,auto:true,snd:true,vib:true,wake:true,step:1.25,pct:2.5,...gj('opt',{})}));
 ACC=(ACCS[opt.ac]||ACCS.lime)[opt.mode==='light'?5:3];OPT=opt;LANG=opt.lang;{const u=uiState(opt);if(u.def)ACC=u.def.txt}
 const[ldr,setLdr]=useState(()=>!isGuest()&&gj('ts',0)===0&&ld().length===0),[sy,setSy]=useState({s:'idle',t:''}),[ct,setCt]=useState(()=>gj('ct',[])),[menu,setMenu]=useState(false),[sub,setSub]=useState('');CTG=ct;sjt('ct',ct);
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
 const delAcc=async()=>{try{await phPurge()}catch(e){}const r=await sbf('/rest/v1/rpc/delete_my_account',{method:'POST',body:'{}'});if(!r.ok)return toast('A fiók törlése nem sikerült.');try{Object.keys(localStorage).filter(k=>k.startsWith('en:'+CU+':')).forEach(k=>localStorage.removeItem(k))}catch(e){}toast('Fiók és minden adat törölve');out()};
 useEffect(()=>{if(!opt.uiChosen||ldr)syncNow()},[]);
 const[help,setHelp]=useState(null);
 useEffect(()=>{const f=e=>setHelp(e.detail);window.addEventListener('helpopen',f);return()=>window.removeEventListener('helpopen',f)},[]);
 const[pkShown,setPkShown]=useState(false); // a választó az első szinkron után jelenik meg, és a döntésig nem tűnik el (a későbbi szinkronok ne indítsák újra)
 useEffect(()=>{if(!opt.uiChosen&&(isGuest()||sy.s==='ok'||sy.s==='err'||sy.s==='off'))setPkShown(true)},[sy.s,opt.uiChosen]);
 // szint-választó (új és meglévő felhasználó egyszer, az első szinkron után: a felhőből jövő lvlSet ne villanjon fel), bemutató, Kezdőlap tartalma
 const[lvShown,setLvShown]=useState(false),[tour,setTour]=useState(null),[fresh]=useState(()=>!gj('opt',{}).uiChosen),[hcs,setHcs]=useState(false);
 useEffect(()=>{if(opt.uiChosen&&!opt.lvlSet&&(isGuest()||sy.s==='ok'||sy.s==='err'||sy.s==='off'))setLvShown(true)},[sy.s,opt.uiChosen,opt.lvlSet]);
 useEffect(()=>{const f=()=>setHcs(true);window.addEventListener('homecards',f);return()=>window.removeEventListener('homecards',f)},[]);
 useEffect(()=>{if(!ldr)return;if(sy.s==='ok'||sy.s==='err'||sy.s==='off'){const t=setTimeout(()=>setLdr(false),900);return()=>clearTimeout(t)}const t=setTimeout(()=>setLdr(false),6000);return()=>clearTimeout(t)},[sy.s,ldr]);
 useEffect(()=>{const t=setTimeout(syncNow,2500);return()=>clearTimeout(t)},[hist,plan,opt,ct,tab]);
 useEffect(()=>{const i=setInterval(syncNow,60000),f=()=>document.visibilityState==='visible'&&syncNow();window.addEventListener('online',syncNow);document.addEventListener('visibilitychange',f);return()=>{clearInterval(i);window.removeEventListener('online',syncNow);document.removeEventListener('visibilitychange',f)}},[]);
 sjt('plan',plan);
 sjt('opt',opt);
 useEffect(()=>{const U=uiApply(opt),r=document.documentElement,st=r.style;['--a3','--a4','--at','--z7','--z8','--z9','--bg'].forEach(k=>st.removeProperty(k));st.fontSize=UI_DEF[U.ui].fs*opt.fs/16+'px';r.classList.toggle('noanim',!opt.an);r.classList.remove('lt');const mt=document.querySelector('meta[name=theme-color]');mt&&mt.setAttribute('content',U.def.bg);uiSwitchFx(U.ui)},[opt]);
 useEffect(()=>setRd(opt.rest),[opt.rest]);
 useEffect(()=>{const LN=getLN();LN&&LN.requestPermissions().catch(()=>{})},[]);
 useEffect(()=>{if(!rest){const LN=getLN();LN&&LN.cancel({notifications:[{id:7001}]}).catch(()=>{})}},[rest]);
 useEffect(()=>{const LN=getLN();if(!LN)return;(async()=>{try{await LN.cancel({notifications:[1,2,3,4,5,6,7].map(i=>({id:8000+i}))});if(!plan.on)return;const[hh,mm]=plan.time.split(':').map(Number),ns=[];for(let d=0;d<7;d++){const v=plan.days[d];if(!v||!dayOf(v)||quietMin(opt.qh,hh*60+mm))continue;const m=remind(hist,v);ns.push({id:8001+d,title:m.t,body:m.b,schedule:{on:{weekday:d+1,hour:hh,minute:mm},allowWhileIdle:true}})}if(ns.length)await LN.schedule({notifications:ns})}catch(e){}})()},[plan,hist,opt.lang,opt.qh]);
 useEffect(()=>{const c=()=>{if(!plan.on||quietAt(opt.qh,new Date()))return;const d=new Date(),k=dk(d),v=plan.days[d.getDay()];if(!v||pad(d.getHours())+':'+pad(d.getMinutes())<plan.time||gj('n','')===k)return;sj('n',k);const m=remind(hist,v);toast(m.t+': '+m.b.split('\n')[0]);try{Notification.permission==='granted'&&new Notification(m.t,{body:m.b})}catch(e){}};c();const i=setInterval(c,30000);return()=>clearInterval(i)},[plan,hist,opt.qh]);
 useEffect(()=>{let t;const f=e=>{setTs(e.detail);clearTimeout(t);t=setTimeout(()=>setTs(null),2800)};window.addEventListener('toast',f);return()=>window.removeEventListener('toast',f)},[]);
 useEffect(()=>{let l;if(aw&&opt.wake&&navigator.wakeLock)navigator.wakeLock.request('screen').then(x=>l=x).catch(()=>{});return()=>{l&&l.release().catch(()=>{})}},[!!aw,opt.wake]);
 const startRest=()=>{if(!opt.auto)return;setRest({end:Date.now()+rd*1000,total:rd});try{const LN=getLN();LN&&!quietAt(opt.qh,new Date(Date.now()+rd*1000))&&LN.schedule({notifications:[{id:7001,title:tr('Pihenő vége'),body:tr('Mehet a következő sorozat'),schedule:{at:new Date(Date.now()+rd*1000),allowWhileIdle:true}}]})}catch(e){}};
 const begin=(name,names,gl={},date)=>setAw({date:date||sel,name,t:Date.now(),ex:names.map(n=>newEx(n,hist,gl[n]))});
 const finish=()=>{
  const ex=aw.ex.map(e=>({n:e.n,sets:e.sets.filter(s=>s.done)})).filter(e=>e.sets.length);
  if(!ex.length)return;
  setHist([{id:aw.t,date:aw.date,name:aw.name,ex,vol:ex.reduce((a,e)=>a+vol(e.sets),0)},...hist]);
  socPublish({id:aw.t,name:aw.name,ex,vol:ex.reduce((a,e)=>a+vol(e.sets),0)},ex.reduce((a,e)=>a+e.sets.filter(s=>s.pr).length,0));
  setFin({name:aw.name,n:ex.length,vol:ex.reduce((a,e)=>a+vol(e.sets),0),sets:ex.reduce((a,e)=>a+e.sets.length,0),pr:ex.reduce((a,e)=>a+e.sets.filter(s=>s.pr).length,0)});setAw(null);setRest(null);setTab('home');
 };
 const quit=()=>{setAw(null);setRest(null)};
 const go2=(t,u,id)=>{lvlForce(id);setTab(t);setSub(u||'');setMenu(false);try{window.scrollTo(0,0)}catch(e){}};
 const startToday=()=>{const v=plan.days[new Date().getDay()],x=v&&dayOf(v);if(!x)return go2('log');const g=goalsFor(hist,x);begin(x.n,x.e,Object.fromEntries(g.map(y=>[y.n,y])),today);setTab('log')};
 return html`<${React.Fragment}>
  ${tab!=='home'&&!(tab==='log'&&aw)&&html`<${UiHeader} title=${uiTitle(tab,sub)} back=${tab==='edit'?'Terv':undefined} onHelp=${()=>setHelp(helpFor(tab,sub))} onBack=${()=>{if(tab==='edit')return go2('plan');setTab('home');setSub('');setMenu(true);try{window.scrollTo(0,0)}catch(e){}}}/>`}
  <div id='ui-main' key=${tab} class="ui-main up max-w-md mx-auto" data-home=${tab==='home'?'':undefined} data-inner=${tab!=='home'?'':undefined}>
   ${tab!=='home'&&!(tab==='log'&&aw)&&helpFor(tab,sub)&&html`<${HelpTip} key=${helpFor(tab,sub)} id=${helpFor(tab,sub)}/>`}
   ${tab==='home'&&html`<${UiHome} hist=${hist} sel=${sel} setSel=${setSel} today=${today} aw=${aw} go=${()=>setTab('log')} nav=${go2} startToday=${startToday} plan=${plan} user=${user} out=${out} opt=${opt} setOpt=${setOpt}/>`}
   ${tab==='log'&&aw&&html`<${UiLog} aw=${aw} setAw=${setAw} hist=${hist} rest=${rest} setRest=${setRest} rd=${rd} setRd=${setRd} startRest=${startRest} finish=${finish} quit=${quit} onBack=${()=>{setTab('home');setSub('');setMenu(false)}}/>`}${tab==='log'&&!aw&&html`<${LogPick} hist=${hist} sel=${sel} begin=${begin}/>`}
   ${tab==='hist'&&html`<${Hist} hist=${hist} del=${id=>setHistT(hist.filter(w=>w.id!==id))}/>`}${tab==='stats'&&html`<${Stats} hist=${hist} today=${today}/>`}
   ${tab==='plan'&&html`<${Plan} plan=${plan} setPlan=${setPlan} hist=${hist} today=${today} begin=${(...a)=>{begin(...a);setTab('log')}} edit=${()=>go2('edit')}/>`}
   ${tab==='tools'&&html`<${Tools} key=${sub} init=${sub}/>`}
   ${tab==='social'&&(isGuest()?html`<${GuestGate}/>`:html`<${Social}/>`)}${tab==='cycle'&&html`<${Cycle} plan=${plan} hist=${hist} today=${today}/>`}${tab==='profile'&&html`<${Profile} user=${user} go=${go2} out=${out}/>`}${tab==='food'&&html`<${Food} init=${sub}/>`}${tab==='edit'&&html`<${Editor} ct=${ct} setCt=${setCt}/>`}${tab==='help'&&html`<${Help}/>`}
   ${tab==='opt'&&html`<${Opts} anchor=${sub} opt=${opt} setOpt=${setOpt} hist=${hist} setHist=${setHistT} plan=${plan} setPlan=${setPlan} user=${user} out=${out} sy=${sy} syncNow=${syncNow} delAcc=${delAcc}/>`}
  </div>
  ${help&&html`<${HelpSheet} id=${help} onClose=${()=>setHelp(null)} onAll=${tab==='help'?null:()=>{setHelp(null);go2('help')}}/>`}
  <${CycPop} go=${go2}/>
  ${ldr&&html`<${UiLoader}/>`}
  <${UiMenu} open=${menu} setOpen=${setMenu} home=${tab==='home'} go=${go2}/>
  ${!opt.uiChosen&&pkShown&&html`<${UiPicker} opt=${opt} o=${x=>setOpt(p=>({...p,...x}))}/>`}
  ${opt.uiChosen&&!opt.lvlSet&&lvShown&&html`<${LevelScreen} fresh=${fresh} o=${x=>{setOpt(p=>({...p,...x}));if(fresh)setTour(0)}}/>`}
  ${tour!==null&&opt.lvlSet&&html`<${TourScreen} step=${tour} onNext=${()=>setTour(tour>=TOUR.length-1?null:tour+1)} onSkip=${()=>setTour(null)}/>`}
  ${hcs&&html`<${HomeCardsSheet} opt=${opt} o=${x=>setOpt(p=>({...p,...x}))} onClose=${()=>setHcs(false)}/>`}
  <${Rest} rest=${rest} setRest=${setRest} hidden=${tab==='log'&&!!aw}/>
  ${ts&&html`<div class='k-toast-w' style=${{paddingTop:'calc(env(safe-area-inset-top,0px) + 12px)'}}><div class='up k-toast' role='status'>${ts.m}${ts.pr&&html`<${Conf}/>`}</div></div>`}
  ${fin&&html`<${KSheet} t='Edzés kész!' onClose=${()=>setFin(null)} foot=${html`<${KBtn} full=${true} onClick=${()=>setFin(null)}>Rendben<//>`}>
   <div class='k-done'><svg viewBox='0 0 52 52' class='k-done-i' aria-hidden='true'><circle cx='26' cy='26' r='23' fill='none' stroke='rgb(var(--ui-accent))' strokeWidth='3' pathLength='600' class='ui-draw' style=${{'--len':600}}/><path d='M15 27l8 8 14-16' fill='none' stroke='rgb(var(--ui-accent))' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' pathLength='600' class='ui-draw' style=${{'--len':600,animationDelay:'.4s'}}/></svg>
    <p class='k-row-s k-center'>${fin.name}</p></div>
   <div class='k-stats c3'>${[['Gyakorlat',fin.n,''],['Sorozat',fin.sets,''],['Térfogat',fin.vol,'kg']].map(([l,v,u])=>html`<${KStat} key=${l} l=${l} v=${v} u=${u}/>`)}</div>
   ${fin.pr>0&&html`<div class='k-act-pr k-center'>${fin.pr} új egyéni rekord!</div><${Conf} n=${30}/>`}<//>`}
 <//>`;
}
ReactDOM.createRoot(document.getElementById('root')).render(h(Root));
