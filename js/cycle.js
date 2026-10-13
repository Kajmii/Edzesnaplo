/* ---------- Ciklus-követés: számítás, naptár, javaslat ----------
   Egészségügyi adat: csak helyben van (en:<uid>:cyc), NEM kerül a szinkronba (docNow) és az exportba sem.
   Eszközök közt a Ciklus képernyő export/import gombja viszi át. */
Object.assign(P,{drop:'<path d="M12 2.7s6 6.1 6 10.6a6 6 0 0 1-12 0C6 8.8 12 2.7 12 2.7z"/>'});
const CYC0={on:false,len:0,per:5,starts:[],ts:0}; // len 0 = automatikus (az utolsó ciklusok mediánja)
const cycAvail=()=>{const p=gj('prof',{});return !!(p.sexSel&&p.sex==='f')};
const cycGet=()=>({...CYC0,...gj('cyc',{})});
const cycSet=v=>{sj('cyc',{...v,ts:Date.now()});window.dispatchEvent(new Event('cyc'))};
const useCycRaw=()=>{const[,x]=useState(0);useEffect(()=>{const f=()=>x(v=>v+1);window.addEventListener('cyc',f);return()=>window.removeEventListener('cyc',f)},[]);return cycGet()};
const useCyc=()=>{const c=useCycRaw();return cycAvail()&&c.on?c:null};

const dd=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const addD=(k,n)=>{const d=pd(k);d.setDate(d.getDate()+n);return dk(d)};
const wdNext=d=>{const t=new Date();t.setDate(t.getDate()+((d-t.getDay()+7)%7));return dk(t)};
const med=a=>{const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:Math.round((s[m-1]+s[m])/2)};
const cycLen=c=>{if(c.len)return c.len;const s=[...c.starts].sort(),g=[];for(let i=1;i<s.length;i++)g.push(dd(s[i-1],s[i]));const r=g.filter(x=>x>=18&&x<=45).slice(-6);return r.length?med(r):28};
// Egy nap fázisa: {p:'mens'|'foll'|'ovul'|'lut', day, n, ov, logged}; null, ha nincs adat vagy túl régi az utolsó bejegyzés
const cycPhase=(c,k)=>{
 const s=[...c.starts].sort(),L=cycLen(c);let i=-1;for(let j=0;j<s.length;j++)if(s[j]<=k)i=j;
 if(i<0)return null;
 const day=dd(s[i],k),g=i<s.length-1?dd(s[i],s[i+1]):0;let n=L,d=day;
 if(g>=15&&g<=60){n=g}else{if(day>3*L)return null;d=day%L}
 const dn=d+1,ov=Math.max(n-14,c.per+2);
 return{p:dn<=c.per?'mens':dn<ov-1?'foll':dn<=ov+1?'ovul':'lut',day:dn,n,ov,logged:day<c.per}};
// Következő becsült menstruáció és ovuláció a mai naptól
const cycNext=(c,today)=>{
 if(!c.starts.length)return null;
 const s=[...c.starts].sort(),last=s[s.length-1],L=cycLen(c),ov=Math.max(L-14,c.per+2);
 let i=1;while(addD(last,L*i)<=today&&i<12)i++;
 let j=0;while(addD(last,L*j+ov-1)<today&&j<12)j++;
 return{per:addD(last,L*i),ovu:addD(last,L*j+ov-1),L}};

const CPH={
 mens:['Menstruáció','Ha jól érzed magad, edzhetsz a megszokott módon. Ha fáradtabb vagy, a könnyebb edzés, séta vagy nyújtás is rendben van. Hallgass a testedre.','Könnyebb edzés is rendben','rgba(244,63,94,.9)'],
 foll:['Tüszőfázis','Sokaknál ilyenkor jobb az energiaszint: jó időszak a nehezebb edzésekhez és az új célsúlyok kipróbálásához.','Jó időszak a nehezebb edzésekhez','rgba(34,211,238,.25)'],
 ovul:['Ovuláció környéke','Sokaknál jó az erőnlét. Alaposan melegíts be, és a technikára figyelj.','Alaposan melegíts be','rgba(250,204,21,.35)'],
 lut:['Sárgatest-fázis','Sokan fáradékonyabbnak érzik magukat a ciklus vége felé. Mérsékelt intenzitás, hosszabb pihenők és elegendő alvás segíthet, a célsúlyokat nem kell erőltetni.','Mérsékelt intenzitás is jó','rgba(167,139,250,.28)']};
const dayN=n=>LANG==='en'?'day '+n:n+'. nap',daysN=n=>LANG==='en'?n+(n===1?' day':' days'):n+' nap';
const CYC_NOTE='Tájékoztató jellegű becslés, nem helyettesíti az orvosi véleményt. A ciklusok egyénenként eltérnek.';

// Export / import (eszközök közti átvitel)
const cycExport=c=>JSON.stringify({app:'edzesnaplo-cycle',v:1,data:{len:c.len,per:c.per,starts:[...c.starts].sort(),ts:c.ts}});
const cycParse=t=>{
 const j=JSON.parse(t);if(!j||j.app!=='edzesnaplo-cycle'||!j.data)throw 0;
 const d=j.data,len=+d.len||0,per=+d.per||5;
 if(!Array.isArray(d.starts)||d.starts.length>600||!d.starts.every(s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&dk(pd(s))===s))throw 0;
 if(len&&(len<18||len>45)||per<1||per>12)throw 0;
 return{len,per,starts:[...new Set(d.starts)].sort(),ts:+d.ts||0}};
const cycMerge=(c,d)=>({...c,starts:[...new Set([...c.starts,...d.starts])].sort(),...(d.ts>c.ts?{len:d.len,per:d.per}:{})});

// Fázis-címke a Terv fülön
function CycChip({k}){
 const c=useCyc(),f=c&&cycPhase(c,k);if(!f)return null;const x=CPH[f.p];
 return html`<div class='k-cyc' style=${{background:x[3],color:f.p==='mens'?'#fff':undefined}}>${x[0]} · ${x[2]}</div>`;
}
// Felugró ablak: a Nő kiválasztása után jelzi, hogy elérhető a funkció
function CycPop({go}){
 const[o,setO]=useState(false);
 useEffect(()=>{const f=()=>setO(true);window.addEventListener('cycprompt',f);return()=>window.removeEventListener('cycprompt',f)},[]);
 if(!o)return null;
 return html`<${KSheet} t='Elérhető a ciklus-követés' onClose=${()=>setO(false)} foot=${html`<div class='k-btns' style=${{margin:0}}><${KBtn} full=${true} onClick=${()=>{cycSet({...cycGet(),on:true});setO(false);go('cycle')}}>Bekapcsolom<//><${KBtn} v='sec' full=${true} onClick=${()=>setO(false)}>Később<//></div>`}>
  <p class='k-lead' style=${{marginBottom:0}}>Ciklus-naptár és kalkulátor, a ciklusfázishoz igazodó edzési javaslatokkal. Az adat csak ezen az eszközön marad, és bármikor kikapcsolhatod.</p><//>`;
}

const CSt=({v,on,min,max})=>html`<${KStep} v=${v} on=${x=>on(Math.min(max,x))} min=${min}/>`;

function Cycle({plan,hist,today}){
 const c=useCycRaw(),[mo,setMo]=useState(()=>{const d=pd(today);return new Date(d.getFullYear(),d.getMonth(),1)}),[sd,setSd]=useState(today),[bk,setBk]=useState(''),[cf,setCf]=useState(false);
 const set=o=>cycSet({...c,...o}),bt='k-btn sec sm';
 if(!cycAvail())return html`<div><p class='k-hint'>Ez a funkció akkor érhető el, ha a Kardió vagy Kalória számoló Profil kártyáján a Nő nemet választod.</p></div>`;
 if(!c.on)return html`<div>
  <div class='up k-card'><p class='k-hint'>Ciklus-naptár és kalkulátor, a ciklusfázishoz igazodó edzési javaslatokkal. Az adat csak ezen az eszközön van, nem kerül a szerverre.</p><button onClick=${()=>set({on:true})} class='k-btn pri full k-mt'>Bekapcsolom</button></div>
  <${Imp} c=${c} bk=${bk} setBk=${setBk} set=${set}/><p class='k-hint'>${CYC_NOTE}</p></div>`;
 const f=cycPhase(c,today),x=f&&CPH[f.p],nx=cycNext(c,today),y=mo.getFullYear(),m=mo.getMonth(),lead=(mo.getDay()+6)%7,nd=new Date(y,m+1,0).getDate();
 const cells=[...Array(lead).fill(null),...Array.from({length:nd},(_,i)=>dk(new Date(y,m,i+1)))];
 const sf=cycPhase(c,sd),sw=plan.days[pd(sd).getDay()],sx=sw&&dayOf(sw),sh=hist.filter(w=>w.date===sd);
 const toggle=()=>set({starts:c.starts.includes(sd)?c.starts.filter(s=>s!==sd):[...c.starts,sd].sort()});
 const Row=({l,v})=>html`<div class='k-tr k-tr2'><span class='k-lab'>${l}</span><span class='k-r'>${v}</span></div>`;
 return html`<div>
  <div class='up k-card'>
   ${f?html`<div class='k-cph'><i class='k-dot' style=${{background:x[3]}}></i><span class='k-wh-t'>${x[0]}</span><span class='k-row-s'>${dayN(f.day)} / ${f.n}</span></div><p class='k-hint'>${x[1]}</p>`:html`<div class='k-cd-t'>Nincs mai becslés</div><p class='k-hint'>Jelöld be az utolsó menstruáció első napját a naptárban (válaszd ki a napot, majd nyomd meg a gombot).</p>`}
   <p class='k-hint'>${CYC_NOTE}</p></div>
  <div class='k-card'>
   <div class='k-datenav'><button type='button' class='k-ib' aria-label=${tr('Előző nap')} onClick=${()=>setMo(new Date(y,m-1,1))}><${UiIco} n='back' s=${20}/></button><span class='k-datenav-t'>${LANG==='en'?MNE[m]:MN[m].replace('.','')} ${y}</span><button type='button' class='k-ib k-flip' aria-label=${tr('Következő nap')} onClick=${()=>setMo(new Date(y,m+1,1))}><${UiIco} n='back' s=${20}/></button></div>
   <div class='k-cal k-cal-h'>${(LANG==='en'?['M','T','W','T','F','S','S']:['H','K','Sze','Cs','P','Szo','V']).map((d,i)=>html`<span key=${i}>${d}</span>`)}</div>
   <div class='k-cal'>${cells.map((k,i)=>{if(!k)return html`<span key=${i}></span>`;const p=cycPhase(c,k),cl=p&&CPH[p.p][3],lg=p&&p.p==='mens'&&p.logged,pl=plan.days[pd(k).getDay()]&&k>=today,dn=hist.some(w=>w.date===k);
    return html`<button key=${k} onClick=${()=>setSd(k)} class=${'k-cal-d'+(k===sd?' on':'')+(k===today?' td':'')} aria-pressed=${k===sd} style=${{background:cl||'transparent',color:lg?'#fff':undefined,opacity:p&&p.p==='mens'&&!lg?.75:1}}>${+k.slice(8)}<span class='k-cal-p'>${pl&&html`<i class='k-dot pl'></i>`}${dn&&html`<i class='k-dot dn'></i>`}</span></button>`})}</div>
   <div class='k-legend'>${Object.entries(CPH).map(([k,v])=>html`<span key=${k}><i class='k-dot' style=${{background:v[3]}}></i>${v[0]}</span>`)}<span><i class='k-dot pl'></i>Tervezett edzés</span><span><i class='k-dot dn'></i>Elvégzett edzés</span></div></div>
  <div class='up k-card'><div class='k-cd-t'>${fd(sd)}</div>
   <${Row} l='Fázis' v=${sf?CPH[sf.p][0]+' · '+dayN(sf.day):'–'}/><${Row} l='Tervezett edzés' v=${sx?sx.n:'–'}/><${Row} l='Elvégzett edzés' v=${sh.length?sh.map(w=>w.name).join(', '):'–'}/>
   ${sf&&sd>=today&&html`<p class='k-hint'>${CPH[sf.p][2]}</p>`}
   <button onClick=${toggle} disabled=${sd>today} class=${'k-btn sm full k-mt '+(sd>today?'sec':c.starts.includes(sd)?'dan':'pri')}>${sd>today?'Jövőbeli napot nem jelölhetsz':c.starts.includes(sd)?'Menstruáció kezdetének törlése':'Itt kezdődött a menstruáció'}</button></div>
  <div class='up k-card'><div class='k-cd-t'>Kalkulátor</div>
   ${nx?html`<${Row} l='Következő menstruáció (becslés)' v=${fd(nx.per)+' ('+(LANG==='en'?'in '+daysN(dd(today,nx.per)):dd(today,nx.per)+' nap múlva')+')'}/><${Row} l='Ovuláció (becslés)' v=${fd(nx.ovu)}/><${Row} l='Számolt ciklushossz' v=${daysN(nx.L)}/>`:html`<p class='k-hint'>Jelöld be legalább egy menstruáció első napját.</p>`}
   <${Row} l='Rögzített ciklusok' v=${c.starts.length}/>
   <div class='k-wh k-mt' style=${{alignItems:'center',marginBottom:0}}><span class='k-row-t'>Ciklus hossza</span><div class='k-step'><button type='button' class=${'k-btn sm '+(c.len?'sec':'pri')} onClick=${()=>set({len:0})}>Auto</button><${CSt} v=${c.len||cycLen(c)} on=${v=>set({len:v})} min=${21} max=${45}/></div></div>
   <div class='k-wh k-mt' style=${{alignItems:'center',marginBottom:0}}><span class='k-row-t'>Menstruáció hossza</span><${CSt} v=${c.per} on=${v=>set({per:v})} min=${2} max=${10}/></div>
   <p class='k-hint'>Az ovuláció becslése nem alkalmas fogamzásgátlásra.</p></div>
  <${Imp} c=${c} bk=${bk} setBk=${setBk} set=${set}/>
  <div class='up k-card'><div class='k-cd-t'>Kikapcsolás és törlés</div><p class='k-hint'>Kikapcsolva a funkció sehol nem jelenik meg, az adat megmarad. A törlés végleges.</p>
   <div class='k-g2'><button onClick=${()=>set({on:false})} class=${bt}>Kikapcsolás</button><button onClick=${()=>{if(cf){cycSet({...CYC0});setCf(false);toast('Ciklus-adatok törölve')}else setCf(true)}} class=${'k-btn dan sm'+(cf?' ask':'')}>${cf?'Biztosan törlöd?':'Adatok törlése'}</button></div></div></div>`;
}
// Átvitel másik eszközre: letölthető fájl vagy másolható szöveg, és visszatöltés
function Imp({c,bk,setBk,set}){
 const bt='k-btn sec sm',
  exp=()=>{const j=cycExport(c);setBk(j);try{navigator.clipboard.writeText(j).catch(()=>{})}catch(e){}try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([j],{type:'application/json'}));a.download='ciklus-adatok.json';a.click();toast('Ciklus-adatok exportálva')}catch(e){toast('Az exportálás nem sikerült.')}},
  imp=()=>{try{const d=cycParse(bk);cycSet({...cycMerge(c,d),on:true});setBk('');toast('Ciklus-adatok betöltve')}catch(e){toast('A fájl vagy a szöveg hibás')}},
  file=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>setBk(String(r.result));r.readAsText(f)};
 return html`<div class='up k-card'><div class='k-cd-t'>Átvitel másik eszközre</div><p class='k-hint'>Az adat nem kerül a szerverre. Exportáld fájlba, majd a másik eszközön töltsd vissza a fájlt vagy a szöveget. A betöltés hozzáadja a hiányzó dátumokat.</p>
  <div class='k-g2 k-mb'><button onClick=${exp} class=${bt}>Exportálás fájlba</button><label class=${bt+' flex items-center justify-center'}>Fájl kiválasztása<input type='file' accept='.json,application/json' onChange=${file} class='hidden'/></label></div>
  <textarea value=${bk} onChange=${e=>setBk(e.target.value)} placeholder='Az exportált szöveg ide másolható a visszatöltéshez' class='k-in k-ta k-mb'></textarea>
  <button onClick=${imp} class=${'w-full '+bt}>Visszatöltés</button></div>`;
}
