/* ---------- Kezdőlap: Pro, Gym, Family ----------
   Mockupok: docs/mockups/forras/Main (Pro), GymHome, FamilyHome. Az adatok a js/ui/data.js tiszta függvényeiből jönnek.
   Minden szám és mértékegység közt nem törő szóköz van (nb), hogy 360 px-en se váljanak szét. */
const NB=' ';
const UI_DAYS={hu:['Vasárnap','Hétfő','Kedd','Szerda','Csütörtök','Péntek','Szombat'],en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']};
const UI_MON={hu:['január','február','március','április','május','június','július','augusztus','szeptember','október','november','december'],en:['January','February','March','April','May','June','July','August','September','October','November','December']};
const UI_DAYLOC=['Vasárnap','Hétfőn','Kedden','Szerdán','Csütörtökön','Pénteken','Szombaton'];
const uiL=()=>LANG==='en'?'en':'hu';
const uiNum1=n=>n.toLocaleString(LANG==='en'?'en-US':'hu-HU',{minimumFractionDigits:1,maximumFractionDigits:1});
const uiPct=n=>Math.abs(n).toLocaleString(LANG==='en'?'en-US':'hu-HU',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
const uiAgoTxt=n=>LANG==='en'?(n<=0?'today':n===1?'yesterday':n+NB+'days ago'):(n<=0?'ma':n===1?'tegnap':n+NB+'napja');
// "KEDD · OKT. 13. · 42. HÉT" (Pro), "42. HÉT · NAP 3/5" (Gym)
const uiDateLine=d=>{const L=uiL(),wd=UI_DAYS[L][d.getDay()].slice(0,L==='en'?3:10).toUpperCase(),mn=(L==='en'?MNE[d.getMonth()]:MN[d.getMonth()]).toUpperCase().replace('.','');
 return L==='en'?wd+' · '+mn+' '+d.getDate()+' · WEEK '+uiIsoWeek(d):wd+' · '+mn+'. '+d.getDate()+'. · '+uiIsoWeek(d)+'. HÉT'};
const uiLongDate=d=>{const L=uiL();return L==='en'?UI_DAYS.en[d.getDay()]+', '+UI_MON.en[d.getMonth()]+' '+d.getDate():UI_DAYS.hu[d.getDay()]+', '+UI_MON.hu[d.getMonth()]+' '+d.getDate()+'.'};
const uiMeta=(x,n,ago,L)=>L==='en'?n+NB+(n===1?'exercise':'exercises')+' · ca. '+uiMins(n)+NB+'min'+(ago!=null?' · last: '+uiAgoTxt(ago):''):n+NB+'gyakorlat · kb. '+uiMins(n)+NB+'perc'+(ago!=null?' · utoljára '+uiAgoTxt(ago):'');
const UiArrow=({s=20,w=1.6})=>html`<svg width=${s} height=${s} viewBox='0 0 20 20' aria-hidden='true' fill='none' stroke='currentColor' strokeWidth=${w} class='ui-arrow'><path d='M4 10h11M11 5l5 5-5 5'/></svg>`;

// Közös adatok a három Kezdőlaphoz
function uiHomeCtx({hist,plan,today,user}){
 const d=pd(today),tp=plan.days[d.getDay()],x=tp&&dayOf(tp),wk=uiWeek(hist,plan,today),vw=uiVolWeeks(hist,today,8),L=uiL();
 const last=x?hist.find(w=>w.name===x.n):null,ago=last?uiAgo(last.date,today):null;
 const groups=x?[...new Set(x.e.map(n=>GOF[n]).filter(Boolean))]:[];
 return{d,x,wk,vw,L,ago,groups,recs:uiRecs(hist,3),pr:uiLatestPR(hist,today),streak:uiStreak(hist,today),day:uiDayOf(plan,today),name:uiFirstName(user),ini:(String(user||'?').replace(/[^A-Za-z0-9]/g,'').slice(0,2)||'?').toUpperCase(),title:x?uiShort(tr(x.n)):tr('Szabad edzés'),n:x?x.e.length:0};
}

/* ---------- Pro ---------- */
function HomePro({c,nav,aw,go,startToday}){
 const{x,wk,vw,L,ago,recs,d}=c,W=326,H=86,mx=Math.max(1,...vw.vals),mn=Math.min(...vw.vals),span=Math.max(1,mx-mn);
 const pts=vw.vals.map((v,i)=>[4+i*(318/7),74-(v-mn)/span*59]),poly=pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),last=pts[pts.length-1];
 const wkl=L==='en'?['M','T','W','T','F','S','S']:['H','K','SZE','CS','P','SZ','V'];
 return html`<div class='ph'>
  <div class='ph-top'><span class='ph-date'>${uiDateLine(d)}</span><button type='button' class='ph-avatar' aria-label=${tr('Profil')} onClick=${()=>nav('profile')}>${c.ini}</button></div>
  <div class='ph-hero'><span class='ph-k'>${x?tr('Mai edzés'):tr('Ma nincs tervezett edzés')}</span><h1 class='ph-h'>${c.title}</h1>
   <span class='ph-meta'>${x?uiMeta(x,c.n,ago,L):tr('Indíts egy üres edzést, vagy válassz tervet.')}</span></div>
  <div class='ph-cta'><button type='button' class='ph-go' onClick=${aw?go:x?startToday:go}><span>${aw?tr('Edzés folytatása'):tr('Edzés indítása')}</span><${UiArrow}/></button><button type='button' class='ph-sec' onClick=${()=>nav('plan')}>${tr('Terv')}</button></div>
  <section class='ph-week' aria-label=${tr('Heti áttekintés')}>${wk.map((w,i)=>html`<div key=${w.k} class='ph-d'><span class='ph-dl'>${wkl[i]}</span><span class=${'ph-box ph-'+w.st+(w.today?' ph-now':'')}></span></div>`)}</section>
  <section class='ph-vol'><div class='ph-vh'><span>${tr('Heti volumen')}</span><span class='ph-mono'>${uiL()==='en'?'8'+NB+'wk':'8'+NB+'hét'}</span></div>
   <div class='ph-vn'><span class='ph-big'><${Cnt} to=${vw.cur}/></span><span class='ph-unit'>kg</span>${vw.delta!=null&&html`<span class='ph-delta'>${vw.delta>=0?'▲':'▼'}${NB}${uiPct(vw.delta)}</span>`}</div>
   <svg viewBox=${'0 0 '+W+' '+H} class='ph-chart' role='img' aria-label=${tr('Heti volumen az elmúlt 8 hétben')}>
    <line x1='0' y1='80' x2=${W} y2='80' class='ph-g1'/><line x1='0' y1='45' x2=${W} y2='45' class='ph-g2'/><line x1='0' y1='10' x2=${W} y2='10' class='ph-g2'/>
    <polyline points=${poly} pathLength='1' class='ph-line ui-draw' style=${{'--len':1}}/><circle cx=${last[0]} cy=${last[1]} r='4' class='ph-dot'/></svg></section>
  ${recs.length>0&&html`<section class='ph-rec'><span class='ph-rk'>${tr('Rekordok · becsült 1RM')}</span>${recs.map(r=>html`<div key=${r.n} class='ph-rr'><span>${tr(r.n)}</span><span class='ph-mono'>${uiNum1(r.m)}${NB}kg</span></div>`)}</section>`}
 </div>`;
}

/* ---------- Gym ---------- */
const GYM_RING=[['Mell','Mell'],['Hát','Hát'],['Láb','Láb'],['Váll','Váll']];
function GymRing({n,max,label,i}){
 const f=Math.min(1,max?n/max:0),C=2*Math.PI*30;
 return html`<div class='gh-ring' style=${{'--i':i}}><svg width='76' height='76' viewBox='0 0 76 76' role='img' aria-label=${label+': '+n+' / '+max}><circle cx='38' cy='38' r='36' class='gh-r0'/><circle cx='38' cy='38' r='30' fill='none' class='gh-r1' strokeWidth='7'/>
  <circle cx='38' cy='38' r='30' fill='none' class='gh-r2 ui-ring' strokeWidth='7' pathLength='1' strokeDasharray=${f+' 1'} transform='rotate(-90 38 38)' style=${{'--f':f}}/><circle cx='38' cy='38' r='8' class='gh-r3'/></svg>
  <span class='gh-rn'><${Cnt} to=${n}/>/${max}</span><span class='gh-rl'>${label}</span></div>`;
}
function HomeGym({c,hist,today,nav,aw,go,startToday}){
 const{x,L,groups,pr,streak,day,d}=c,gs=uiGroupSets(hist,today,GYM_RING.map(g=>g[0])),t=c.title,fs=t.length<=6?112:t.length<=9?84:t.length<=13?62:44;
 const meta=x?(groups.map(g=>tr(g)).join(' · ')+(groups.length?' · ':'')+c.n+NB+(L==='en'?(c.n===1?'exercise':'exercises'):'gyakorlat')):tr('Indíts egy üres edzést, vagy válassz tervet.');
 const wkTxt=L==='en'?'WEEK '+uiIsoWeek(d)+' · DAY '+day.n+'/'+day.of:uiIsoWeek(d)+'. HÉT · NAP '+day.n+'/'+day.of;
 return html`<div class='gh'><div class='ui-stripe' aria-hidden='true'></div>
  <div class='gh-in'>
   <div class='gh-top'><span class='gh-week'>${wkTxt}</span><button type='button' class='gh-avatar' aria-label=${tr('Profil')} onClick=${()=>nav('profile')}>${c.ini}</button></div>
   <div class='gh-hero'><span class='gh-k'>${x?tr('Mai edzés'):tr('Ma nincs tervezett edzés')}</span><h1 class='gh-h' style=${{fontSize:fs+'px'}}>${t}</h1><span class='gh-meta'>${meta}</span></div>
   <button type='button' class='gh-go' onClick=${aw?go:x?startToday:go}><span>${aw?tr('Edzés folytatása'):tr('Edzés indítása')}</span><svg width='28' height='28' viewBox='0 0 28 28' aria-hidden='true' fill='none' stroke='currentColor' strokeWidth='3'><path d='M4 14h18M15 6l8 8-8 8'/></svg></button>
   <section class='gh-sets' aria-label=${tr('Heti sorozatok izomcsoportonként')}><span class='gh-lab'>${tr('Heti sorozatok')}</span><div class='gh-rings'>${GYM_RING.map(([k,l],i)=>html`<${GymRing} key=${k} n=${gs[k]} max=${UI_TARGET[k]} label=${tr(l)} i=${i}/>`)}</div></section>
   ${pr&&html`<section class='gh-rec'><span class='gh-recbar ui-stripe-v' aria-hidden='true'></span><div class='gh-rect'><span class='gh-reck'>${tr('Új rekord')}</span><span class='gh-recn'>${tr(pr.n)} · ${uiAgoTxt(pr.ago)}</span></div><span class='gh-recv'>${uiNum1(pr.m)}<span class='gh-recu'>${NB}KG</span></span></section>`}
   ${streak>0&&html`<div class='gh-streak'><div class='gh-bars' aria-hidden='true'>${Array.from({length:12},(_,i)=>html`<span key=${i} class=${'gh-bar'+(i<Math.min(12,streak)?' on':'')} style=${{'--i':i}}></span>`)}</div><span class='gh-sn'>${L==='en'?streak+NB+'WEEK STREAK':streak+NB+'HETES SZÉRIA'}</span></div>`}
  </div></div>`;
}

/* ---------- Family ---------- */
// A mai mozgás: a tervezett edzés gyakorlatai (a naplóból pipálva), terv nélkül könnyű mozdulatok, amiket kézzel lehet pipálni
function useEasy(today){
 const[v,setV]=useState(()=>gj('fmv',{})[today]||[]);
 const tgl=i=>setV(a=>{const n=a.includes(i)?a.filter(x=>x!==i):[...a,i];const all=gj('fmv',{});sj('fmv',{[today]:n});return n});
 return[v,tgl];
}
function HomeFamily({c,hist,today,nav,aw,go,startToday,opt,setOpt}){
 const{x,wk,L,d}=c,[easy,tgl]=useEasy(today),hr=new Date().getHours(),done=new Set(hist.filter(w=>w.date===today).flatMap(w=>w.ex.map(e=>e.n)));
 const hello=L==='en'?(hr<10?'Good morning':hr<18?'Hello':'Good evening'):(hr<10?'Jó reggelt':hr<18?'Szia':'Jó estét');
 const items=x?x.e.slice(0,4).map(n=>({k:n,t:tr(n),on:done.has(n)})):UI_EASY.map((t,i)=>({k:'e'+i,t:tr(t),on:easy.includes(i),i}));
 const more=x&&x.e.length>4?x.e.length-4:0;
 const dn=wk.filter(w=>w.done),ord=L==='en'?['first','second','third','fourth','fifth','sixth','seventh']:['első','második','harmadik','negyedik','ötödik','hatodik','hetedik'];
 const todayDone=wk.some(w=>w.today&&w.done);
 const note=!dn.length?(L==='en'?'You have not trained this week yet. Today is a good day to start.':'Ezen a héten még nem mozogtál. Ma jó nap a kezdésre.')
  :(L==='en'?'You trained on '+dn.map(w=>UI_DAYS.en[w.dow]).join(', ')+'. '+(todayDone?'Today is done too.':'Today is day number '+ord[Math.min(6,dn.length)]+'.'):dn.map(w=>UI_DAYLOC[w.dow]).join(', ')+' mozogtál. '+(todayDone?'Ma is megvolt.':'Ma a '+ord[Math.min(6,dn.length)]+' nap jön.'));
 const cyc=()=>{const o=[16,18,20],i=o.indexOf(opt.fs);setOpt(p=>({...p,fs:o[(i+1)%3]}))};
 const wl=L==='en'?['M','T','W','T','F','S','S']:['H','K','Sze','Cs','P','Szo','V'];
 return html`<div class='fh'>
  <div class='fh-top'><div class='fh-hd'><span class='fh-date'>${uiLongDate(d)}</span><h1 class='fh-h'>${hello}${c.name?', '+c.name:''}!</h1></div>
   <button type='button' class='fh-aa' aria-label=${tr('Nagyobb betűméret')} onClick=${cyc}>A<span>A</span></button></div>
  <section class='fh-card'><h2 class='fh-h2'>${tr('A mai mozgás')}</h2>
   <ul class='fh-list ui-stagger'>${items.map((it,i)=>html`<li key=${it.k} style=${{'--i':i}}>${it.i!=null?html`<button type='button' role='checkbox' aria-checked=${it.on} class='fh-it' onClick=${()=>tgl(it.i)}><span class=${'fh-chk'+(it.on?' on':'')}>${it.on&&html`<svg width='16' height='16' viewBox='0 0 18 18' aria-hidden='true' fill='none' stroke='currentColor' strokeWidth='2.6'><path class='ui-tick' d='M3.5 9.5l3.5 3.5 7.5-8'/></svg>`}</span><span class=${'fh-t'+(it.on?' done':'')}>${it.t}</span></button>`:html`<div class='fh-it'><span class=${'fh-chk'+(it.on?' on':(i===items.findIndex(z=>!z.on)?' next':''))} aria-hidden='true'>${it.on&&html`<svg width='16' height='16' viewBox='0 0 18 18' fill='none' stroke='currentColor' strokeWidth='2.6'><path class='ui-tick' d='M3.5 9.5l3.5 3.5 7.5-8'/></svg>`}</span><span class=${'fh-t'+(it.on?' done':'')}>${it.t}${it.on&&html`<span class='ui-sr'> ${tr('kész')}</span>`}</span></div>`}</li>`)}
    ${more>0&&html`<li class='fh-more'>${L==='en'?'+'+more+' more':'+'+more+' további'}</li>`}</ul>
   <button type='button' class='fh-go' onClick=${aw?go:x?startToday:go}><span>${aw?tr('Folytatjuk'):tr('Kezdjük el')}</span><${UiArrow} s=${22} w=${2.4}/></button></section>
  <section class='fh-week'><h2 class='fh-h3'>${tr('Ezen a héten')}</h2><div class='fh-days'>${wk.map((w,i)=>html`<div key=${w.k} class='fh-day'><span class=${'fh-dot '+w.st+(w.today?' now':'')}></span><span class=${'fh-dl'+(w.today?' now':'')}>${wl[i]}</span></div>`)}</div>
   <p class='fh-note'>${note}</p></section>
 </div>`;
}

// A kiválasztott irány Kezdőlapja
function UiHome(p){
 const c=uiHomeCtx(p),ui=uiState(OPT).ui;
 const P={...p,c};
 return h(ui==='gym'?HomeGym:ui==='family'?HomeFamily:HomePro,P);
}
