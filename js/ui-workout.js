/* ---------- Edzés (aktív edzés): Pro, Gym, Family ----------
   Mockupok: docs/mockups/forras/ProWorkout, GymWorkout, FamilyWorkout. Egy gyakorlat látszik egyszerre; a három irány ugyanazt az
   állapotot (aw) szerkeszti, ugyanazzal a logikával (useWk), csak a megjelenés más. A régi, minden gyakorlatot egyszerre mutató
   szerkesztő helyett a gyakorlatok listája (ExSheet) a váltás, hozzáadás és törlés helye. */

// A gyakorlat leírása (a régi Info lap és a Family képernyő is ezt használja)
const exInfo=n=>{
 const g=GOF[n]||'',cb=/csig|Cable|Crossover/i.test(n),mc=!cb&&/gép|Machine|Smith|Hack|Pec Deck|Stairmaster|Pendulum|Belt|Assisted/i.test(n),bb=!cb&&!mc&&/rúd|Ez-/i.test(n),db=!cb&&!mc&&!bb&&/súlyz/i.test(n);
 const kind=cb?'Csigás gyakorlat':mc?'Gépes gyakorlat':bb?'Rudas gyakorlat':db?'Súlyzós gyakorlat':'Testsúlyos vagy egyéb gyakorlat';
 const T1={c:['Állítsd a csiga magasságát a mozgáshoz, a kábel végig feszes maradjon.','Lépj hátra, hogy a súlyt ne a lendület mozgassa.','A törzsed stabil, csak a célizom dolgozik.'],m:['Állítsd az ülést úgy, hogy az ízület a gép forgáspontjával egy vonalban legyen.','Állítsd be a párna vagy kapaszkodó magasságát, hogy a teljes mozgástartomány kényelmes legyen.','Ne zárd ki teljesen az ízületet a végállásban, tartsd feszesen az izmot.'],b:['Fogd meg a rudat stabilan, a csukló legyen egyenesben.','Feszítsd meg a törzsedet, mielőtt elindítod a mozgást.','Nehéz sorozatnál legyen biztosítás (rack vagy társ).'],d:['Olyan súlyt válassz, amit végig kontrolláltan mozgatsz.','Mindkét kar egyformán dolgozzon, ne lendülj a testtel.','A súlyzókat óvatosan tedd le, ne ejtsd el.'],w:['Tartsd a testet egy vonalban, a törzs legyen feszes.','Ha túl nehéz, használj segítséget (gumiszalag vagy gép).']};
 const GC={Mell:'Lapockák hátra és le, mellkas kiemelve.',Hát:'A lapockák összehúzásával indíts, ne a karokkal húzz.',Láb:'A térd a lábfej irányába nézzen, a sarok maradjon a földön.',Váll:'Ne húzd a vállad a füled felé.',Kar:'A könyök maradjon a test mellett, ne lendülj.',Törzs:'Lassú, kontrollált mozgás, a derekad ne ívelődjön.'};
 const tips=[...T1[cb?'c':mc?'m':bb?'b':db?'d':'w'],GC[g],'Bemelegítés: 1–2 könnyű sorozat az első nehéz előtt.','Lassan emelj (1–2 mp), lassabban engedd vissza (2–3 mp).','Ha az ízületedben fájdalmat érzel, hagyd abba.'].filter(Boolean);
 return{g,kind,tips,bb,cue:GC[g]||T1[cb?'c':mc?'m':bb?'b':db?'d':'w'][0]};
};

// Közös logika: aktuális gyakorlat és sorozat, sorozat-állapotok, rekordjelzés, pihenő
function useWk({aw,setAw,hist,startRest,rest,setRest,rd,setRd}){
 const first=()=>{const i=aw.ex.findIndex(e=>e.sets.some(s=>!s.done));return i<0?Math.max(0,aw.ex.length-1):i};
 const[cur,setCur]=useState(first),[ak,setAk]=useState(null),[sheet,setSheet]=useState(null),[,tick]=useState(0);
 useEffect(()=>{if(!rest)return;const t=setInterval(()=>tick(x=>x+1),250);return()=>clearInterval(t)},[rest]);
 const n=aw.ex.length,i=Math.min(cur,Math.max(0,n-1)),e=aw.ex[i]||null,sets=e?e.sets:[];
 const und=sets.findIndex(s=>!s.done),k=e?(ak!=null&&ak<sets.length?ak:und>=0?und:Math.max(0,sets.length-1)):0,s=e?(sets[k]||{kg:'',reps:'',rpe:'',done:false}):null;
 const up=(x,f)=>setAw(a=>({...a,ex:a.ex.map((y,j)=>j===x?f(y):y)})),setS=(x,q,f,v)=>up(x,y=>({...y,sets:y.sets.map((z,j)=>j===q?{...z,[f]:v}:z)}));
 const nd=aw.ex.reduce((a,y)=>a+y.sets.filter(z=>z.done).length,0),tv=aw.ex.reduce((a,y)=>a+vol(y.sets.filter(z=>z.done)),0);
 // sorozat kész / vissza: ugyanaz a rekordjelzés és pihenő-indítás, mint a régi szerkesztőben
 const toggle=(x,q)=>{const y=aw.ex[x],z=y.sets[q];setS(x,q,'done',!z.done);buzz();
  if(!z.done){startRest();const m=maxKg(hist,y.n),w=+z.kg||0;if(m>0&&w>m){setS(x,q,'pr',true);toast('Új rekord: '+y.n+', '+w+' kg',1)}}};
 const allDone=!!e&&und<0,last=i>=n-1,finalSet=!!e&&sets.filter((z,j)=>!z.done&&j!==k).length===0&&!sets[k].done;
 const go=j=>{setCur(Math.max(0,Math.min(n-1,j)));setAk(null)};
 const completeAuto=fin=>{if(!e)return;if(allDone){last?fin():go(i+1);return}toggle(i,k);if(finalSet&&!last)setTimeout(()=>go(i+1),450)};
 const addSet=()=>{if(!e)return;up(i,y=>{const l=y.sets[y.sets.length-1]||{};return{...y,sets:[...y.sets,{kg:l.kg||'',reps:l.reps||'',rpe:'',done:false}]}});setAk(sets.length)};
 const addEx=nm=>{setAw(a=>({...a,ex:[...a.ex,newEx(nm,hist)]}));setCur(n);setAk(null)};
 const rmEx=j=>{setAw(a=>({...a,ex:a.ex.filter((_,q)=>q!==j)}));setCur(c=>Math.max(0,Math.min(c,n-2)));setAk(null)};
 const adj=d=>{if(rest){const t=Math.max(1,rest.total+d);setRest({...rest,end:rest.end+d*1000,total:t})}else setRd(Math.max(15,Math.min(600,rd+d)))};
 const left=rest?Math.max(0,Math.ceil((rest.end-Date.now())/1000)):rd,rdone=!!rest&&left===0;
 const mmss=t=>pad(Math.floor(t/60))+':'+pad(t%60);
 return{n,i,e,sets,k,s,und,nd,tv,toggle,allDone,last,finalSet,completeAuto,go,addSet,addEx,rmEx,setS,setAk,sheet,setSheet,adj,left,rdone,mmss,rest,rd,setRest,up};
}

// Gyakorlatok: váltás, hozzáadás, törlés; edzés befejezése vagy elvetése
function ExSheet({w,onClose,onPick,finish,quit}){
 const[cf,setCf]=useState(false);
 return html`<${KSheet} t='Gyakorlatok' onClose=${onClose} foot=${html`<${KBtn} v='sec' full=${true} ic='plus' onClick=${onPick}>Gyakorlat hozzáadása<//>
  <div class='k-btns k-mt' style=${{marginBottom:0}}><${KBtn} disabled=${!w.nd} onClick=${finish}>Edzés befejezése<//><${KBtn} v='dan' c=${cf?'ask':''} onClick=${()=>cf?quit():setCf(true)}>${cf?'Biztosan?':'Elvetés'}<//></div>
  ${!w.nd&&html`<p class='k-hint k-center'>Jelölj be legalább egy sorozatot a mentéshez.</p>`}`}>
  ${w.n===0&&html`<p class='k-hint'>Még nincs gyakorlat az edzésben.</p>`}
  <div class='k-list'>${Array.from({length:w.n},(_,j)=>j).map(j=>{const y=w.aw.ex[j],dn=y.sets.filter(z=>z.done).length;
   return html`<div key=${j} class='k-row'><button type='button' class='k-row-main' onClick=${()=>{w.go(j);onClose()}}><span class=${'k-row-t'+(j===w.i?' cur':'')}>${y.n}</span><span class='k-row-s'>${dn} / ${y.sets.length} ${tr('sorozat')}</span></button><${KDel} on=${()=>w.rmEx(j)}/></div>`})}</div><//>`;
}

// Közös kereten kívüli lapok: gyakorlat-lista, választó, leírás
function WkSheets({w,finish,quit}){
 return html`<${React.Fragment}>
  ${w.sheet==='list'&&html`<${ExSheet} w=${{...w,aw:w.aw}} onClose=${()=>w.setSheet(null)} onPick=${()=>w.setSheet('pick')} finish=${finish} quit=${quit}/>`}
  ${w.sheet==='pick'&&html`<${Pick} onClose=${()=>w.setSheet(null)} onPick=${nm=>{w.addEx(nm);w.setSheet(null)}}/>`}
  ${w.sheet==='info'&&w.e&&html`<${Info} n=${w.e.n} onClose=${()=>w.setSheet(null)}/>`}<//>`;
}
// Üres edzés: még nincs gyakorlat
function WkEmpty({w,cls}){
 return html`<div class=${cls}><p class='k-lead'>Add hozzá az első gyakorlatot.</p><${KBtn} full=${true} ic='plus' onClick=${()=>w.setSheet('pick')}>Gyakorlat hozzáadása<//></div>`;
}
const lastTxt=(hist,n)=>{const l=lastSet(hist,n);return l?(LANG==='en'?'Last: ':'Legutóbb: ')+uiNum0(l.kg||0)+NB+'kg × '+(l.reps||0)+(maxKg(hist,n)>0?(LANG==='en'?' · record ':' · rekord ')+uiNum0(maxKg(hist,n))+NB+'kg':''):''};
const uiNum0=v=>(+v||0).toLocaleString(LANG==='en'?'en-US':'hu-HU',{maximumFractionDigits:2});

/* ---------- Pro ---------- */
function LogPro({w,aw,hist,finish,quit,onBack}){
 const{e,sets,k,i,n}=w,nx=aw.ex[i+1];
 return html`<div class='pw'>
  <header class='pw-hdr'><button type='button' class='pw-back' onClick=${onBack}><${UiIco} n='back' s=${16}/><span>Vissza</span></button><span class='pw-timer'><${Clk} t=${aw.t}/></span><button type='button' class='pw-fin' disabled=${!w.nd} onClick=${finish}>Befejezés</button></header>
  <div class='pw-body'>
   ${!e?html`<${WkEmpty} w=${w} cls='pw-empty'/>`:html`<div class='pw-main'>
    <div class='pw-head'><div class='pw-row'><span class='pw-wk'>${tr(aw.name)}</span><button type='button' class='pw-ex' onClick=${()=>w.setSheet('list')}>${i+1} / ${n}</button></div>
     <h1 class='pw-h'><button type='button' class='pw-hb' onClick=${()=>w.setSheet('info')}>${e.n}</button></h1><span class='pw-sub'>${lastTxt(hist,e.n)}</span></div>
    <table class='pw-t'><thead><tr><th scope='col'>${tr('SOR.')}</th><th scope='col'>KG</th><th scope='col'>${tr('ISM')}</th><th scope='col'>RPE</th><th scope='col' class='pw-r'>${tr('KÉSZ')}</th></tr></thead>
     <tbody>${sets.map((s,q)=>s.done?html`<tr key=${q} class='pw-done'><td>${q+1}</td><td>${uiNum0(s.kg)}</td><td>${s.reps||'–'}</td><td>${s.rpe||'–'}</td><td class='pw-r'><input type='checkbox' checked aria-label=${(q+1)+'. '+tr('sorozat kész')} onChange=${()=>w.toggle(i,q)}/></td></tr>`
      :html`<tr key=${q} class=${'pw-act'+(q===k?' on':'')} onClick=${()=>w.setAk(q)}><td>${q+1}</td>
       <td><input type='text' inputMode='decimal' aria-label=${(q+1)+'. '+tr('sorozat súly')} class='pw-in' style=${{width:'56px'}} value=${s.kg} placeholder='–' onChange=${ev=>w.setS(i,q,'kg',ev.target.value)}/></td>
       <td><input type='text' inputMode='numeric' aria-label=${(q+1)+'. '+tr('sorozat ismétlés')} class='pw-in' style=${{width:'44px'}} value=${s.reps} placeholder='–' onChange=${ev=>w.setS(i,q,'reps',ev.target.value)}/></td>
       <td><input type='text' inputMode='decimal' aria-label=${(q+1)+'. RPE'} class='pw-in' style=${{width:'44px'}} value=${s.rpe} placeholder='–' onChange=${ev=>w.setS(i,q,'rpe',ev.target.value)}/></td>
       <td class='pw-r'><input type='checkbox' aria-label=${(q+1)+'. '+tr('sorozat kész')} onChange=${()=>w.toggle(i,q)}/></td></tr>`)}</tbody></table>
    <button type='button' class='pw-add' onClick=${w.addSet}>+ ${tr('Sorozat hozzáadása')}</button>
    <div class='pw-next'><span class='pw-nk'>${tr('Következő')}</span><span>${nx?html`<button type='button' class='pw-nb' onClick=${()=>w.go(i+1)}>${nx.n}</button>`:html`<button type='button' class='pw-nb' onClick=${()=>w.setSheet('pick')}>+ ${tr('Gyakorlat hozzáadása')}</button>`}</span></div></div>`}
  </div>
  <section class='pw-rest' aria-label=${tr('Pihenőidő')}>
   <div class='pw-rh'><div class='pw-rl'><span class='pw-rk'>${tr('PIHENŐ')}</span><span class=${'pw-rt'+(w.rest?'':' idle')+(w.rdone?' ok':'')}>${w.mmss(w.left)}</span></div>
    <div class='pw-rb'><button type='button' aria-label=${tr('15 másodperccel kevesebb')} onClick=${()=>w.adj(-15)}>−15</button><button type='button' aria-label=${tr('15 másodperccel több')} onClick=${()=>w.adj(15)}>+15</button></div></div>
   <div class='pw-bar'><div class='pw-fill' style=${{'--p':w.rest?Math.min(1,w.left/Math.max(1,w.rest.total)):0}}></div></div>
   ${e&&html`<button type='button' class='pw-ok' onClick=${()=>w.allDone?(w.last?finish():w.go(i+1)):w.toggle(i,k)}>${w.allDone?(w.last?tr('Edzés befejezése'):tr('Következő gyakorlat')):tr('Sorozat kész')}</button>`}
  </section><${WkSheets} w=${w} finish=${finish} quit=${quit}/></div>`;
}

/* ---------- Gym ---------- */
const GYM_PLATE={25:['#D7372B',104],20:['#2F62D0',96],15:['#E3B23C',84],10:['#2E9E5B',72],5:['#E8E6E0',56],2.5:['#8A8780',44],1.25:['#B9B5AC',34]};
function GymBar({kg,bb}){
 const p=uiPlates(kg,20),plates=[];for(const q of p.list)for(let c=0;c<q.c;c++)plates.push(q.w);
 let x=102,L=[],R=[];for(const q of plates){const[col,h]=GYM_PLATE[q],wd=Math.max(8,6+q/2.5);x-=wd+2;L.push(html`<rect key=${'l'+x} x=${x} y=${52-h/2} width=${wd} height=${h} fill=${col} class='gh-plate' style=${{'--i':L.length}}/>`);}
 x=248;for(const q of plates){const[col,h]=GYM_PLATE[q],wd=Math.max(8,6+q/2.5);R.push(html`<rect key=${'r'+x} x=${x+2} y=${52-h/2} width=${wd} height=${h} fill=${col} class='gh-plate' style=${{'--i':R.length}}/>`);x+=wd+2}
 const cap=p.list.length?(LANG==='en'?'PER SIDE ':'OLDALANKÉNT ')+p.list.flatMap(q=>Array(q.c).fill(uiNum0(q.w))).join(' + ')+' · '+(LANG==='en'?'BAR 20'+NB+'KG':'RÚD 20'+NB+'KG'):(LANG==='en'?'BAR 20'+NB+'KG':'RÚD 20'+NB+'KG');
 return html`<figure class='gw-fig'><svg viewBox='0 0 350 104' class='gw-svg' role='img' aria-label=${cap}><rect x='0' y='49' width='350' height='6' fill='#8A8780'/><rect x='120' y='47' width='110' height='10' fill='#6E6B65'/><rect x='104' y='40' width='8' height='24' fill='#B9B5AC'/><rect x='238' y='40' width='8' height='24' fill='#B9B5AC'/>${L}${R}</svg>
  <figcaption class='gw-cap'>${cap}${p.rest>0?html`<span class='gw-rest'> · ${p.rest}${NB}kg ${tr('marad')}</span>`:''}</figcaption></figure>`;
}
function LogGym({w,aw,hist,finish,quit,onBack}){
 const{e,sets,k,i,n,s}=w,inf=e?exInfo(e.n):null,tk=(+(s&&s.kg)||0);
 return html`<div class='gw'>
  <header class='gw-hdr'><button type='button' class='gw-back' onClick=${onBack} aria-label=${tr('Vissza')}><${UiIco} n='back' s=${22}/></button><span class='gw-title'>${uiShort(tr(aw.name))}</span><span class='gw-timer'><${Clk} t=${aw.t}/></span></header><div class='ui-stripe' aria-hidden='true'></div>
  <div class='gw-body'>
   ${!e?html`<${WkEmpty} w=${w} cls='gw-empty'/>`:html`<div class='gw-main'>
    <div class='gw-eh'><button type='button' class='gw-ek' onClick=${()=>w.setSheet('list')}>${LANG==='en'?'EXERCISE '+(i+1)+'/'+n:'GYAKORLAT '+(i+1)+'/'+n}</button><h1 class='gw-h'><button type='button' class='gw-hb' onClick=${()=>w.setSheet('info')}>${e.n}</button></h1></div>
    <div class='gw-big'><label class='gw-num'><span class='ui-sr'>KG</span><input type='text' inputMode='decimal' class='gw-bi' style=${{width:Math.max(2,String(s.kg||0).length)+'ch'}} value=${s.kg} placeholder='0' onChange=${ev=>w.setS(i,k,'kg',ev.target.value)}/></label><span class='gw-kg'>KG</span><span class='gw-x'>×</span><label class='gw-num'><span class='ui-sr'>${tr('Ismétlés')}</span><input type='text' inputMode='numeric' class='gw-bi gw-br' style=${{width:Math.max(1,String(s.reps||0).length)+'ch'}} value=${s.reps} placeholder='0' onChange=${ev=>w.setS(i,k,'reps',ev.target.value)}/></label></div>
    ${inf&&inf.bb&&html`<${GymBar} kg=${tk}/>`}
    <div role='list' aria-label=${tr('Sorozatok')} class='gw-chips'>${sets.map((z,q)=>html`<button key=${q} role='listitem' type='button' aria-current=${q===k?'step':undefined} onClick=${()=>w.setAk(q)} class=${'gw-chip'+(z.done?' done':'')+(q===k?' on':'')}>${z.done?html`<span class='gw-ck'>✓</span><span class='gw-cs'>${uiNum0(z.kg)}×${z.reps||0}</span>`:html`<span class='gw-cn'>${q+1}</span>`}</button>`)}<button type='button' class='gw-chip gw-plus' onClick=${w.addSet} aria-label=${tr('Sorozat hozzáadása')}>+</button></div>
    <span class='gw-last'>${lastTxt(hist,e.n)}</span></div>`}
  </div>
  <section class='gw-rest' aria-label=${tr('Pihenőidő')}>
   <div class='gw-rbox'><div class='gw-rh'><div class='gw-rl'><span class='gw-rk'>${tr('PIHENŐ')}</span><span class=${'gw-rt'+(w.rest?'':' idle')+(w.rdone?' ok':'')}>${w.mmss(w.left).replace(/^0/,'')}</span></div>
    <div class='gw-rb'><button type='button' aria-label=${tr('15 másodperccel kevesebb')} onClick=${()=>w.adj(-15)}>−15</button><button type='button' aria-label=${tr('15 másodperccel több')} onClick=${()=>w.adj(15)}>+15</button></div></div>
    <div class='gw-bar'><div class='gw-fill' style=${{'--p':w.rest?Math.min(1,w.left/Math.max(1,w.rest.total)):0}}></div></div></div>
   ${e&&html`<button type='button' class='gw-ok' onClick=${()=>w.allDone?(w.last?finish():w.go(i+1)):w.toggle(i,k)}>${w.allDone?(w.last?tr('Edzés befejezése'):tr('Következő gyakorlat')):tr('Sorozat kész')}</button>`}
   <div class='gw-sec'><button type='button' onClick=${()=>w.setSheet('list')}>${tr('Gyakorlatok')}</button><button type='button' disabled=${!w.nd} onClick=${finish}>${tr('Befejezés')}</button></div>
  </section><${WkSheets} w=${w} finish=${finish} quit=${quit}/></div>`;
}

/* ---------- Family ---------- */
// Egyszerű vonalrajzok: egy-egy póz izomcsoportonként (a mozgó végtag az akcent színű)
const FAM_FIG={
 Láb:html`<path d='M60 60v80M60 100h60v40M120 100v40' class='ff-a'/><circle cx='84' cy='30' r='13' class='ff-b'/><path d='M84 44v44h34' class='ff-b'/><path d='M118 88l14 40' class='ff-b'/><path d='M100 92l58-6' class='ff-m'/><path d='M84 58l22 18' class='ff-b'/>`,
 Mell:html`<path d='M20 130h160' class='ff-a'/><circle cx='42' cy='86' r='12' class='ff-b'/><path d='M54 94l86 22' class='ff-b'/><path d='M140 116l26 14' class='ff-b'/><path d='M60 98v32' class='ff-m'/><path d='M80 104v26' class='ff-m'/>`,
 Hát:html`<path d='M30 130h140' class='ff-a'/><circle cx='100' cy='34' r='13' class='ff-b'/><path d='M100 48v50M100 98l-22 32M100 98l22 32' class='ff-b'/><path d='M100 62l-34 16M100 62l34 16' class='ff-m'/><path d='M66 78v-26M134 78v-26' class='ff-a'/>`,
 Váll:html`<path d='M30 136h140' class='ff-a'/><circle cx='100' cy='46' r='13' class='ff-b'/><path d='M100 60v46M100 106l-20 30M100 106l20 30' class='ff-b'/><path d='M100 70l-34-24M100 70l34-24' class='ff-m'/><path d='M60 40h12M128 40h12' class='ff-a'/>`,
 Kar:html`<path d='M30 136h140' class='ff-a'/><circle cx='100' cy='34' r='13' class='ff-b'/><path d='M100 48v58M100 106l-20 30M100 106l20 30' class='ff-b'/><path d='M100 62l-18 28' class='ff-b'/><path d='M82 90l18-24' class='ff-m'/><path d='M96 62h14' class='ff-a'/>`,
 Törzs:html`<path d='M20 130h160' class='ff-a'/><circle cx='54' cy='104' r='12' class='ff-b'/><path d='M66 112l56 10M122 122l18-30M140 92l18 38' class='ff-b'/><path d='M60 116l22-10' class='ff-m'/>`};
function FamFig({g}){return html`<svg viewBox='0 0 200 150' class='fw-fig' role='img' aria-label=${tr('Szemléltető rajz')}>${FAM_FIG[g]||FAM_FIG.Láb}</svg>`}
function LogFamily({w,aw,hist,finish,quit,onBack}){
 const{e,sets,k,i,n,s}=w,inf=e?exInfo(e.n):null,rd2=(v,d)=>w.setS(i,k,'reps',String(Math.max(0,(+v||0)+d))),kg2=(v,d)=>w.setS(i,k,'kg',String(Math.max(0,Math.round(((+v||0)+d)*100)/100)));
 const step=OPT.step||1.25,heavy=e&&(+s.kg>0||(inf&&(inf.kind!=='Testsúlyos vagy egyéb gyakorlat')));
 return html`<div class='fw'>
  <header class='fw-hdr'><button type='button' class='fw-back' onClick=${onBack}><${UiIco} n='back' s=${18}/><span>Vissza</span></button>
   <div class='fw-pg'><span class='fw-cnt'>${e?(LANG==='en'?'Exercise '+(i+1)+' of '+n:(i+1)+'.'+NB+'gyakorlat a'+NB+n+'‑ből'):tr('Még nincs gyakorlat')}</span>
    <div role='progressbar' aria-valuemin='0' aria-valuemax=${n} aria-valuenow=${e?i+(w.allDone?1:0):0} aria-label=${tr('Haladás')} class='fw-prog'><div class='fw-pf' style=${{width:(n?(i+(w.allDone?1:0))/n*100:0)+'%'}}></div></div></div></header>
  ${!e?html`<${WkEmpty} w=${w} cls='fw-empty'/>`:html`<div class='fw-main'>
   <div class='fw-art'><${FamFig} g=${inf.g}/></div>
   <div class='fw-tx'><h1 class='fw-h'>${e.n}</h1><p class='fw-p'>${tr(inf.cue)}</p></div>
   <div class='fw-card'><div class='fw-round'><span class='fw-rl'>${LANG==='en'?'Round '+(k+1)+' of '+sets.length:(k+1)+'.'+NB+'kör a'+NB+sets.length+'‑ből'}</span>
     <span class='fw-reps'><button type='button' class='fw-st' aria-label=${tr('Kevesebb ismétlés')} onClick=${()=>rd2(s.reps,-1)}>−</button><span class='fw-rn'>${s.reps||0}</span><button type='button' class='fw-st' aria-label=${tr('Több ismétlés')} onClick=${()=>rd2(s.reps,1)}>+</button><span class='fw-ru'>${tr('ismétlés')}</span></span></div>
    ${heavy&&html`<div class='fw-kgrow'><span>${tr('Súly')}</span><span class='fw-reps'><button type='button' class='fw-st' aria-label=${tr('Kisebb súly')} onClick=${()=>kg2(s.kg,-step)}>−</button><span class='fw-kn'>${uiNum0(s.kg||0)}${NB}kg</span><button type='button' class='fw-st' aria-label=${tr('Nagyobb súly')} onClick=${()=>kg2(s.kg,step)}>+</button></span></div>`}</div>
   <button type='button' class='fw-vid' onClick=${()=>w.setSheet('info')}><svg width='24' height='24' viewBox='0 0 26 26' aria-hidden='true'><circle cx='13' cy='13' r='11' fill='none' stroke='currentColor' strokeWidth='2.4'/><path d='M10.5 8.5v9l7-4.5z' fill='currentColor'/></svg><span>${tr('Hogyan csináljam? Videó')}</span></button></div>`}
  <footer class='fw-ft'>
   ${e&&html`<button type='button' class='fw-ok' onClick=${()=>w.completeAuto(finish)}>${w.allDone?(w.last?tr('Edzés befejezése'):tr('Kész, jöhet a következő')):(w.finalSet?(w.last?tr('Kész, befejezem'):tr('Kész, jöhet a következő')):tr('Kész, jöhet a következő kör'))}</button>
   <button type='button' class='fw-skip' onClick=${()=>w.last?w.setSheet('list'):w.go(i+1)}>${w.last?tr('Gyakorlatok'):tr('Most kihagyom')}</button>`}
   ${w.rest&&html`<p class=${'fw-rest'+(w.rdone?' ok':'')}>${w.rdone?tr('Mehet a következő sorozat'):(LANG==='en'?'Rest: ':'Pihenő: ')+w.mmss(w.left)}</p>`}
   <p class='fw-note'>${tr('Ha fájdalmat érzel, állj meg és pihenj.')}</p></footer>
  <${WkSheets} w=${w} finish=${finish} quit=${quit}/></div>`;
}

// A kiválasztott irány edzés-képernyője
function UiLog(p){
 const w=useWk(p),ui=uiState(OPT).ui,pr={w:{...w,aw:p.aw},aw:p.aw,hist:p.hist,finish:p.finish,quit:p.quit,onBack:p.onBack};
 return h(ui==='gym'?LogGym:ui==='family'?LogFamily:LogPro,pr);
}
