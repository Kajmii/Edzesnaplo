/* ---------- Pihenőidő-időzítő ---------- */
function Rest({rest,setRest,hidden}){
 const[,t]=useState(0);
 useEffect(()=>{
  if(!rest)return;
  const i=setInterval(()=>{if(Date.now()>=rest.end){clearInterval(i);beep();try{OPT.vib&&navigator.vibrate&&navigator.vibrate([250,100,250])}catch(e){}}t(x=>x+1)},250);
  return()=>clearInterval(i);
 },[rest]);
 if(!rest||hidden)return null;
 const left=Math.max(0,Math.ceil((rest.end-Date.now())/1000)),done=left===0;
 return html`<div class='up k-rest-w' style=${{bottom:'calc(var(--ui-bar-h,64px) + 12px + env(safe-area-inset-bottom,0px))'}}>
  <div class=${'k-rest'+(done?' done':'')} role='timer'>
   <div class='k-rest-r'>
    <span class='k-rest-i'><${UiIco} n='timer' s=${24}/></span>
    <div class='k-rest-tx'><div class='k-rest-v'>${done?'Mehet a következő sorozat':Math.floor(left/60)+':'+pad(left%60)}</div><div class='k-rest-s'>Pihenőidő</div></div>
    ${!done&&html`<${KBtn} v='sec' sm=${true} onClick=${()=>setRest({end:rest.end+15000,total:rest.total+15})}>+15 mp<//>`}
    <button type='button' class='k-ib' aria-label=${tr('Bezárás')} onClick=${()=>setRest(null)}><${UiIco} n='x' s=${20}/></button>
   </div>
   ${!done&&html`<div class='k-bar-tr k-mt'><div class='k-bar-f' style=${{'--p':left/rest.total}}></div></div>`}
  </div></div>`;
}

/* ---------- Edzés indítása: terv-választó (aktív edzésnél az UiLog fut, js/ui/workout.js) ---------- */
function LogPick({hist,sel,begin}){
 return html`<div>
  <p class='k-lead'>${fd(sel)}: válassz edzéstervet</p>
  ${hist.length<3&&html`<${HelpCalm} id='workout.pick'/>`}
  <div class='ui-stagger'>${allT().map(t=>html`<${KSec} key=${t.id} t=${t.n}>
   <p class='k-hint' style=${{margin:'-4px 0 10px'}}>${t.s}</p>
   <${KCard}><div class='k-list'>${t.days.map(d=>html`<${KRow} key=${d.n} t=${d.n} r=${html`${d.e.length} gyakorlat`} go=${true} onClick=${()=>begin(d.n,d.e)}/>`)}</div><//><//>`)}</div>
  <div class='k-btns'>${hist[0]&&html`<${KBtn} v='sec' full=${true} onClick=${()=>begin(hist[0].name,hist[0].ex.map(e=>e.n))}>Legutóbbi ismétlése: ${hist[0].name}<//>`}
   <${KBtn} v='sec' full=${true} ic='plus' onClick=${()=>begin('Szabad edzés',[])}>Üres edzés<//></div></div>`;
}

/* ---------- Diagram ---------- */
function Chart({pts,dec}){
 if(!pts.length)return html`<p class='k-hint' style=${{textAlign:'center',padding:'24px 0'}}>Még nincs adat ehhez a gyakorlathoz.</p>`;
 const mx=Math.max(...pts.map(p=>p.v))||1,lo=dec?Math.min(...pts.map(p=>p.v))-1:0,n=pts.length;
 const X=i=>n===1?150:24+i*(252/(n-1)),Y=v=>96-((v-lo)/(mx-lo||1))*70;
 return html`<svg key=${pts.map(p=>p.v).join()} viewBox="0 0 300 130" class="w-full">
  <line class='k-ch-g' x1='24' x2='276' y1='100' y2='100'/>
  <polyline class='k-ch-p ui-draw' pathLength='600' style=${{'--len':600}} points=${pts.map((p,i)=>X(i)+','+Y(p.v)).join(' ')}/>
  ${pts.map((p,i)=>html`<g key=${i} class='fade' style=${{animationDelay:(250+i*80)+'ms',animationFillMode:'backwards'}}><circle class='k-ch-c' cx=${X(i)} cy=${Y(p.v)} r="4"/>
   <text class='k-ch-v' x=${X(i)} y=${Y(p.v)-9} textAnchor="middle" fontSize="10">${dec?p.v.toFixed(1):fmt(p.v)}</text>
   ${(i===0||i===n-1)&&html`<text class='k-ch-d' x=${X(i)} y="122" textAnchor="middle" fontSize="9">${fs(p.d)}</text>`}</g>`)}
 </svg>`;
}

/* ---------- Előzmények és statisztika ---------- */
// Fejlődés-grafikon gyakorlatonként (a Statisztikák és rekordok képernyőn)
function Prog({hist}){
 const names=[...new Set(hist.flatMap(w=>w.ex.map(e=>e.n)))];
 const[ex,setEx]=useState(''),[m,setM]=useState('w');
 const cur=names.includes(ex)?ex:names[0];
 const pts=hist.filter(w=>w.ex.some(e=>e.n===cur)).sort((a,b)=>a.date<b.date?-1:1).slice(-10).map(w=>{const e=w.ex.find(x=>x.n===cur);return{d:w.date,v:m==='w'?Math.max(...e.sets.map(s=>+s.kg||0)):m==='r'?Math.max(...e.sets.map(s=>(+s.kg||0)*(1+(+s.reps||0)/30))):vol(e.sets)}});
  return html`<${KSec} t='Fejlődés'><${KCard}>
   <${KSel} v=${cur} on=${setEx} o=${names.map(n=>[n,n])}/>
   <div style=${{height:'12px'}}></div>
   <${KSeg} v=${m} on=${setM} o=${[['w','Max súly'],['v','Térfogat'],['r','Becsült 1RM']]}/>
   ${pts.length>0&&html`<div class='k-best'>Legjobb: <b>${fmt(Math.max(...pts.map(p=>p.v)))}</b> kg</div>`}
   <${Chart} pts=${pts}/><//><//>`;
}
// Statisztikák és rekordok: gyűjtő nézet a meglévő adatokból (heti volumen, rekordok, izomcsoportok, fejlődés)
function Stats({hist,today}){
 if(!hist.length)return html`<${KEmpty} ic='star' t='Statisztikák és rekordok' s='Itt jelennek meg a rekordjaid és a grafikonjaid, amint rögzítesz egy edzést.'/>`;
 const vw=uiVolWeeks(hist,today,8),st=uiStreak(hist,today),w0=pd(weekOf(today)[0]),labs=vw.vals.map((_,i)=>uiIsoWeek(new Date(w0.getFullYear(),w0.getMonth(),w0.getDate()-7*(7-i))));
 const dl=vw.delta!=null?' · '+(vw.delta>=0?'+':'−')+uiPct(vw.delta):'',sk=st>0?(LANG==='en'?' · '+st+'-week streak':' · '+st+' hetes széria'):'';
 return html`<div>
  <${KSec} t='Heti volumen, utolsó 8 hét' a=${html`<${HelpI} id='stats.volume'/>`}><${KCard}><${Bars} vals=${vw.vals} labels=${labs}/>
   <p class='k-hint k-center'>${(LANG==='en'?'This week: ':'Ezen a héten: ')+fmt(vw.cur)+' kg'+dl+sk}</p><//><//>
  <${Rec} hist=${hist}/>
  <${Prog} hist=${hist}/></div>`;
}
function Hist({hist,del}){
 const dates=[...new Set(hist.map(w=>w.date))].sort().reverse();
 return html`<div>
  ${hist.length>0&&html`<${HelpCalm} id='log.list'/>`}
  ${!hist.length&&html`<${KEmpty} ic='log' t='Előzmények' s='Itt jelennek meg a befejezett edzéseid. Indíts egyet az Edzés menüpontból.'/>`}
  ${dates.map(d=>html`<${KSec} key=${d} t=${fd(d)}>${hist.filter(w=>w.date===d).map(w=>html`<${KCard} key=${w.id}>
   <div class='k-wh'><div class='k-wh-tx'><div class='k-wh-t'>${w.name}</div><div class='k-row-s'>${fmt(w.vol)} kg összes térfogat</div></div><${KDel} on=${()=>del(w.id)}/></div>
   <div class='k-list'>${w.ex.map(e=>html`<${KRow} key=${e.n} t=${e.n} s=${e.sets.map(s=>`${s.kg||0}×${s.reps||0}${s.rpe?' @'+s.rpe:''}`).join(',  ')}/>`)}</div><//>`)}<//>`)}
 </div>`;
}

const MOT=['A mai edzés a holnapi önbizalmad alapja.','Nem kell tökéletesnek lenni, elég megjelenni.','Egy sorozattal mindig többet bírsz, mint hiszed.','A fejlődés apró lépésekből áll, ma egy kicsit nehezebb.','Ma a saját rekordod a versenytársad.','A fegyelem erősebb a motivációnál.'];
const allT=()=>[...T,...CTG];const daysList=()=>allT().flatMap(t=>t.days.map((d,i)=>({v:t.id+':'+i,...d})));
const dayOf=v=>daysList().find(x=>x.v===v);
const up=w=>{const s=OPT.step||1.25,x=Math.ceil(w*(1+(OPT.pct||2.5)/100)/s)*s;return x>w?x:w+s};
const bestSet=(hist,n,day)=>{for(const w of hist){if(day&&w.name!==day)continue;const e=w.ex.find(x=>x.n===n);if(e)return e.sets.reduce((a,b)=>(+b.kg||0)>(+a.kg||0)?b:a)}return null};
const goalsFor=(hist,d)=>d.e.map(n=>{const s=bestSet(hist,n,d.n)||bestSet(hist,n),w=s&&+s.kg>0?up(+s.kg):0;return{n,kg:w,reps:s?s.reps:'',txt:tr(n)+': '+(w?w+' kg × '+(s.reps||'?'):tr('új gyakorlat, találd meg a kezdősúlyt'))}});
const remind=(hist,v)=>{const x=dayOf(v);return{t:tr('Ma: ')+tr(x.n),b:tr(MOT[new Date().getDate()%MOT.length])+'\n'+tr('Célok:')+'\n'+goalsFor(hist,x).map(g=>g.txt).join('\n')}};

function Plan({plan,setPlan,hist,begin,today,edit}){
 const W=[[1,'Hétfő'],[2,'Kedd'],[3,'Szerda'],[4,'Csütörtök'],[5,'Péntek'],[6,'Szombat'],[0,'Vasárnap']],td=new Date().getDay();
 const set=(d,v)=>setPlan(p=>({...p,days:{...p.days,[d]:v||null}}));
 const tgl=async()=>{if(!plan.on){try{await Notification.requestPermission()}catch(e){}}setPlan(p=>({...p,on:!p.on}))};
 const gl=d=>{const v=plan.days[d],m=remind(hist,v),t=new Date(),[hh,mm]=plan.time.split(':');t.setDate(t.getDate()+((d-t.getDay()+7)%7));const ymd=`${t.getFullYear()}${pad(t.getMonth()+1)}${pad(t.getDate())}`,en=+hh<23?pad(+hh+1)+mm:'2359';return 'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:tr('Edzés')+': '+tr(dayOf(v).n),details:m.b,dates:`${ymd}T${hh}${mm}00/${ymd}T${en}00`,recur:'RRULE:FREQ=WEEKLY;BYDAY='+BDY[d]}).toString()};
 const test=()=>{try{const L=getLN();L&&L.schedule({notifications:[{id:7002,title:tr('Teszt értesítés'),body:tr('Így fog kinézni az emlékeztető.'),schedule:{at:new Date(Date.now()+3000)}}]})}catch(e){}const v=Object.values(plan.days).find(Boolean),m=v?remind(hist,v):{t:tr('Teszt értesítés'),b:tr('Így fog kinézni az emlékeztető.')};toast(m.t+': '+m.b.split('\n')[0]);try{Notification.permission==='granted'&&new Notification(m.t,{body:m.b})}catch(e){}};
 const ics=()=>{
  const BD=['SU','MO','TU','WE','TH','FR','SA'],[hh,mm]=plan.time.split(':'),esc=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const f=t=>`${t.getFullYear()}${pad(t.getMonth()+1)}${pad(t.getDate())}T${hh}${mm}00`;
  const ev=W.filter(([d])=>plan.days[d]).map(([d])=>{const v=plan.days[d],m=remind(hist,v),t=new Date();t.setDate(t.getDate()+((d-t.getDay()+7)%7));
   return['BEGIN:VEVENT','UID:en-'+d+'@edzesnaplo','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z','DTSTART:'+f(t),'DURATION:PT1H','RRULE:FREQ=WEEKLY;BYDAY='+BD[d],'SUMMARY:'+esc(tr('Edzés')+': '+tr(dayOf(v).n)),'DESCRIPTION:'+esc(m.b),'BEGIN:VALARM','TRIGGER:-PT0M','ACTION:DISPLAY','DESCRIPTION:'+esc(m.t),'END:VALARM','END:VEVENT'].join('\r\n')});
  const b=new Blob(['BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Edzesnaplo//HU\r\n'+ev.join('\r\n')+'\r\nEND:VCALENDAR'],{type:'text/calendar'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='edzesterv.ics';a.click();toast('Naptárfájl letöltve: nyisd meg és importáld.');
 };
 return html`<div>
  <p class='k-lead'>Válaszd ki, melyik napon mit edzel. A cél az előző hasonló edzésed legnehezebb sorozata +${String(OPT.pct).replace('.',',')}%.</p>
  <${HelpCalm} id='plan.week'/>
  <div class='k-btns'><${KBtn} v='sec' onClick=${()=>setPlan(p=>({...p,days:{1:'ppl:0',2:'ppl:1',3:'ppl:2',5:'ul:0',6:'ul:1'}}))}>Minta terv<//><${KBtn} v='gho' onClick=${()=>setPlan(p=>({...p,days:{}}))}>Törlés<//></div>
  ${lvlOn('plan.editor')&&html`<div class='k-mb'><${KBtn} v='sec' full=${true} ic='edit' onClick=${edit}>Saját edzések szerkesztése<//></div>`}
  <div class='ui-stagger'>${W.map(([d,l])=>{const v=plan.days[d],x=v&&dayOf(v),g=x?goalsFor(hist,x):[];return html`<${KCard} key=${d} on=${d===td}>
   <div class='k-day'><span class='k-day-n'>${l}</span><${KSel} v=${v||''} on=${y=>set(d,y)} o=${[['','Pihenőnap'],...daysList().map(o=>[o.v,o.n])]}/></div>
   ${x&&html`<${CycChip} k=${wdNext(d)}/>`}
   ${x&&html`<div class='k-goals'>${g.map(y=>html`<div key=${y.n} class='k-goal'><span>${y.n}</span><b>${y.kg?y.kg+' kg × '+(y.reps||'?'):'új'}</b></div>`)}</div>`}
   ${x&&d===td&&html`<${KBtn} full=${true} c='k-mt' onClick=${()=>begin(x.n,x.e,Object.fromEntries(g.map(y=>[y.n,y])),today)}>Mai edzés indítása a célokkal<//>`}<//>`})}</div>
  ${lvlOn('plan.notify')&&html`<${KSec} t='Értesítések'><${KCard}>
   <${KSw} l='Értesítések' s='Motiváció, napi edzés és célsúlyok' v=${plan.on} on=${tgl}/>
   <${KField} l='Időpont' type='time' v=${plan.time} on=${t=>setPlan(p=>({...p,time:t}))}/>
   <div class='k-lb'>Naptár-emlékeztető</div><div class='k-btns' style=${{margin:0}}>${W.filter(([d])=>plan.days[d]).map(([d,l])=>html`<a key=${d} href=${gl(d)} target='_blank' rel='noopener noreferrer' class='k-btn sec full'>${l}: hozzáadás a Google Naptárhoz</a>`)}${!W.some(([d])=>plan.days[d])&&html`<p class='k-hint'>Előbb jelölj ki edzésnapokat.</p>`}</div>
   <div class='k-btns k-mt'><${KBtn} v='sec' sm=${true} onClick=${test}>Teszt értesítés<//><${KBtn} v='sec' sm=${true} onClick=${ics}>.ics fájl<//></div>
   <p class='k-hint'>Az app csak nyitva tud értesíteni. Zárt appnál a naptár értesít: a gombok megnyitják a Google Naptárat kitöltött, hetente ismétlődő eseménnyel, csak mentsd el benne. A célsúlyok a hozzáadáskori állapotot mutatják.</p><//><//>`}</div>`;
}

function Rec({hist}){
 const b={};for(const w of hist)for(const e of w.ex)for(const s of e.sets){const k=+s.kg||0,r=+s.reps||0;if(!k)continue;const m=k*(1+r/30);if(!b[e.n]||m>b[e.n].m)b[e.n]={m,k,r,d:w.date}}
 const rs=Object.entries(b).sort((a,c)=>c[1].m-a[1].m).slice(0,6),lim=dk(new Date(Date.now()-6*864e5)),g={};GR.forEach(x=>g[x]=0);
 for(const w of hist)if(w.date>=lim)for(const e of w.ex)if(GOF[e.n])g[GOF[e.n]]+=e.sets.length;
 const mx=Math.max(1,...Object.values(g));
 return html`<${React.Fragment}><${KSec} t='Rekordok (becsült 1RM)' a=${html`<${HelpI} id='log.records'/>`}><${KCard}><div class='k-list ui-stagger'>${rs.map(([n,r])=>html`<${KRow} key=${n} t=${n} s=${html`${r.k} kg × ${r.r}, ${fs(r.d)}`} r=${html`<b class='k-pr'>${Math.round(r.m)} kg</b>`}/>`)}</div><//><//>
  <${KSec} t='Izomcsoportok, utolsó 7 nap (sorozat)'><${KCard}>${GR.map((x,i)=>html`<div key=${x} class='k-bar'><span class='k-bar-l'>${x}</span><div class='k-bar-tr'><div class='k-bar-f' style=${{'--p':g[x]/mx,'--i':i}}></div></div><span class='k-bar-n'>${g[x]}</span></div>`)}
   ${Object.values(g).some(v=>!v)&&html`<p class='k-hint'>Hiányzó csoportok: ${GR.filter(x=>!g[x]).map(tr).join(', ')}</p>`}<//><//><//>`;
}
// gyakorlat-választó lap (Terv-szerkesztő, Edzés); rec = legutóbbi gyakorlatok gyorsgombjai
function Pick({onPick,onClose,rec=[]}){
 const[q,setQ]=useState(''),[g,setG]=useState('Mind'),ql=q.toLowerCase(),list=EX.filter(x=>(g==='Mind'||x.g===g)&&(x.n.toLowerCase().includes(ql)||tr(x.n).toLowerCase().includes(ql)));
 return html`<${KSheet} t='Gyakorlatok és gépek' onClose=${onClose}>
  <input value=${q} onChange=${e=>setQ(e.target.value)} placeholder='Keresés' class='k-in' style=${{marginBottom:'12px'}}/>
  ${!q&&rec.length>0&&html`<div class='k-chips sc'>${rec.map(n=>html`<${KChip} key=${n} onClick=${()=>onPick(n)}>${n}<//>`)}</div>`}
  <div class='k-chips sc'>${['Mind',...GR].map(x=>html`<${KChip} key=${x} on=${g===x} onClick=${()=>setG(x)}>${x}<//>`)}</div>
  <div class='k-list'>${list.map(x=>html`<${KRow} key=${x.n} t=${x.n} r=${x.g} onClick=${()=>onPick(x.n)}/>`)}</div><//>`;
}
function Editor({ct,setCt}){
 const[sel,setSel]=useState(null),[nm,setNm]=useState(''),[pk,setPk]=useState(null),t=ct.find(x=>x.id===sel);
 const mk=()=>{const n=nm.trim();if(!n)return;const x={id:'c'+Date.now(),n,s:'Saját terv',days:[{n:n+' – 1',e:[]}]};setCt([...ct,x]);setSel(x.id);setNm('')};
 const up2=fn=>setCt(ct.map(x=>x.id===sel?fn(x):x)),setDay=(i,fn)=>up2(x=>({...x,days:x.days.map((d,j)=>j===i?fn(d):d)}));
 if(!t)return html`<div><p class='k-lead'>Állítsd össze a saját edzésterveidet, majd válaszd ki őket az Edzés és a Terv menüpontban.</p>
  ${ct.length>0&&html`<${KCard}><div class='k-list ui-stagger'>${ct.map(x=>html`<div key=${x.id} class='k-row'><button type='button' class='k-row-main' onClick=${()=>setSel(x.id)}><span class='k-row-t'>${x.n}</span><span class='k-row-s'>${x.days.length} nap, ${x.days.reduce((a,d)=>a+d.e.length,0)} gyakorlat</span></button><${KDel} on=${()=>setCt(ct.filter(y=>y.id!==x.id))}/></div>`)}</div><//>`}
  <div class='k-inl'><${KField} type='text' v=${nm} on=${setNm} ph='Új terv neve'/><${KBtn} onClick=${mk}>Létrehozás<//></div></div>`;
 return html`<div><${KBtn} v='gho' sm=${true} ic='back' onClick=${()=>setSel(null)}>Vissza<//>
  <${KSec} t=${t.n}><div class='ui-stagger'>${t.days.map((d,i)=>html`<${KCard} key=${i}>
   <div class='k-inl'><input class='k-in' value=${d.n} onChange=${e=>setDay(i,x=>({...x,n:e.target.value}))}/><${KDel} on=${()=>up2(x=>({...x,days:x.days.filter((_,j)=>j!==i)}))}/></div>
   <div class='k-list k-mt'>${d.e.map((n,k)=>html`<div key=${k} class='k-row'><span class='k-row-tx'><span class='k-row-t'>${n}</span></span><button type='button' class='k-ib' aria-label=${tr('Törlés')} onClick=${()=>setDay(i,x=>({...x,e:x.e.filter((_,j)=>j!==k)}))}><${UiIco} n='x' s=${18}/></button></div>`)}</div>
   <${KBtn} v='sec' sm=${true} full=${true} ic='plus' c='k-mt' onClick=${()=>setPk(i)}>Gyakorlat<//><//>`)}</div>
  <${KBtn} v='sec' full=${true} ic='plus' onClick=${()=>up2(x=>({...x,days:[...x.days,{n:x.n+' – '+(x.days.length+1),e:[]}]}))}>Nap hozzáadása<//><//>
  ${pk!==null&&html`<${Pick} onClose=${()=>setPk(null)} onPick=${n=>{setDay(pk,x=>({...x,e:[...x.e,n]}));setPk(null)}}/>`}</div>`;
}
function Info({n,onClose}){
 const g=GOF[n]||'',cb=/csig|Cable|Crossover/i.test(n),mc=!cb&&/gép|Machine|Smith|Hack|Pec Deck|Stairmaster|Pendulum|Belt|Assisted/i.test(n),bb=!cb&&!mc&&/rúd|Ez-/i.test(n),db=!cb&&!mc&&!bb&&/súlyz/i.test(n);
 const kind=cb?'Csigás gyakorlat':mc?'Gépes gyakorlat':bb?'Rudas gyakorlat':db?'Súlyzós gyakorlat':'Testsúlyos vagy egyéb gyakorlat';
 const T1={c:['Állítsd a csiga magasságát a mozgáshoz, a kábel végig feszes maradjon.','Lépj hátra, hogy a súlyt ne a lendület mozgassa.','A törzsed stabil, csak a célizom dolgozik.'],m:['Állítsd az ülést úgy, hogy az ízület a gép forgáspontjával egy vonalban legyen.','Állítsd be a párna vagy kapaszkodó magasságát, hogy a teljes mozgástartomány kényelmes legyen.','Ne zárd ki teljesen az ízületet a végállásban, tartsd feszesen az izmot.'],b:['Fogd meg a rudat stabilan, a csukló legyen egyenesben.','Feszítsd meg a törzsedet, mielőtt elindítod a mozgást.','Nehéz sorozatnál legyen biztosítás (rack vagy társ).'],d:['Olyan súlyt válassz, amit végig kontrolláltan mozgatsz.','Mindkét kar egyformán dolgozzon, ne lendülj a testtel.','A súlyzókat óvatosan tedd le, ne ejtsd el.'],w:['Tartsd a testet egy vonalban, a törzs legyen feszes.','Ha túl nehéz, használj segítséget (gumiszalag vagy gép).']};
 const GC={Mell:'Lapockák hátra és le, mellkas kiemelve.',Hát:'A lapockák összehúzásával indíts, ne a karokkal húzz.',Láb:'A térd a lábfej irányába nézzen, a sarok maradjon a földön.',Váll:'Ne húzd a vállad a füled felé.',Kar:'A könyök maradjon a test mellett, ne lendülj.',Törzs:'Lassú, kontrollált mozgás, a derekad ne ívelődjön.'};
 const tips=[...T1[cb?'c':mc?'m':bb?'b':db?'d':'w'],GC[g],'Bemelegítés: 1–2 könnyű sorozat az első nehéz előtt.','Lassan emelj (1–2 mp), lassabban engedd vissza (2–3 mp).','Ha az ízületedben fájdalmat érzel, hagyd abba.'].filter(Boolean);
 return html`<${KSheet} t=${n} onClose=${onClose} foot=${html`<a href=${'https://www.youtube.com/results?search_query='+encodeURIComponent(tr(n)+' '+(LANG==='en'?'proper form':'helyes technika'))} target='_blank' rel='noopener noreferrer' class='k-btn pri full'>Videó keresése a YouTube-on</a>`}>
  <div class='k-tags'><span class='k-tag'>${g}</span><span class='k-tag'>${kind}</span></div>
  <ol class='k-tips ui-stagger'>${tips.map((x,i)=>html`<li key=${i}><b>${i+1}</b><span>${x}</span></li>`)}</ol><//>`;
}
const exportCSV=hist=>{const rows=[[tr('Dátum'),tr('Edzés'),tr('Gyakorlat'),tr('Sorozat'),tr('Súly (kg)'),tr('Ismétlés'),'RPE',tr('Térfogat')]];for(const w of hist)for(const e of w.ex)e.sets.forEach((s,i)=>rows.push([w.date,tr(w.name),tr(e.n),i+1,s.kg||0,s.reps||0,s.rpe||'',(+s.kg||0)*(+s.reps||0)]));
 const csv='\ufeff'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(';')).join('\r\n');
 try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='edzesnaplo.csv';a.click();toast(tr('Exportálás kész'))}catch(e){toast(tr('Az exportálás nem sikerült.'))}};
const exportPDF=hist=>{const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])),body=hist.map(w=>`<h3>${esc(w.date)} – ${esc(tr(w.name))} (${fmt(w.vol)} kg)</h3><table>${w.ex.map(e=>`<tr><td>${esc(tr(e.n))}</td><td>${e.sets.map(s=>`${s.kg||0}×${s.reps||0}`).join(', ')}</td></tr>`).join('')}</table>`).join('');
 const w=window.open('','_blank');if(!w)return toast(tr('A böngésző letiltotta az új ablakot.'));
 w.document.write(`<!doctype html><meta charset=utf-8><title>Edzésnapló</title><style>body{font:14px system-ui;margin:24px}h3{margin:18px 0 6px}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #ddd;padding:4px 6px}</style><h1>Edzésnapló</h1>${body}`);w.document.close();setTimeout(()=>w.print(),500)};

