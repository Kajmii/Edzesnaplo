const BDY=['SU','MO','TU','WE','TH','FR','SA'];
const ACCS={lime:['Lime','190 242 100','163 230 53','#a3e635','77 124 15','#65a30d'],cyan:['Kék','165 243 252','34 211 238','#22d3ee','14 116 144','#0891b2'],violet:['Lila','196 181 253','167 139 250','#a78bfa','109 40 217','#7c3aed'],orange:['Narancs','253 186 116','251 146 60','#fb923c','194 65 12','#ea580c'],pink:['Rózsaszín','249 168 212','244 114 182','#f472b6','190 24 93','#db2777'],red:['Piros','252 165 165','248 113 113','#f87171','185 28 28','#dc2626']};
const THEMES={alap:['Alap','63 63 70','39 39 42','24 24 27','9 11 14'],amoled:['AMOLED','43 43 48','26 26 29','12 12 14','0 0 0'],kek:['Éjkék','45 63 94','28 42 66','17 26 43','10 16 32'],grafit:['Grafit','68 72 80','46 49 54','32 34 38','18 19 22']};
// Világos mód: [név, z7 (kapcsoló-sáv, elválasztó), z8, z9, háttér]
const LIGHT=['Világos','190 190 197','228 228 231','255 255 255','244 245 248'];
const Cd=({t,children})=>html`<div class='up k-card'><div class='k-cd-t'>${t}</div>${children}</div>`;
const Lb=({t})=>html`<div class='k-lb'>${t}</div>`;
const Sw=KSw;
// Alapértékek: az edzés-, kinézet- és értesítési beállítások visszaállnak; az irány, a nyelv, a szint, a fiók és minden adat marad
const OPT_RESET={wg:3,rest:90,auto:true,snd:true,vib:true,wake:true,step:1.25,pct:2.5,an:true,fs:16,hc:false,qh:{on:false,from:'22:00',to:'07:00'},schemes:{pro:'paper',gym:'yellow',family:'green'}};
const optReset=o=>({...o,...OPT_RESET,qh:{...OPT_RESET.qh},schemes:{...OPT_RESET.schemes}});
// JSON-export: az összes (helyi és szinkronizált) adat egy fájlban
const jsonExport=()=>{const b=new Blob([JSON.stringify({app:'Edzésnapló',build:BUILD,exported:new Date().toISOString(),...docNow()},null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='edzesnaplo-'+dk(new Date())+'.json';a.click();toast('JSON mentés letöltve')};
// Szint-választó (Beállítások › Szint): a szint csak a látható tartalmat szabja, az adat nem törlődik
function LevelPick({opt,o}){
 const cur=lvlOf(opt),hid=lvlHidden();
 return html`<${Cd} t='Szint'>
  <p class='k-hint k-mb'>Bármikor átállíthatod. Semmi sem törlődik, csak elrejtjük.</p>
  <div role='radiogroup' aria-label=${tr('Szint')} class='k-stack'>${LEVELS.map(([v,n,d])=>html`<button key=${v} type='button' role='radio' aria-checked=${cur===v} onClick=${()=>o({lvl:v,lvlSet:true})} class=${'k-card'+(cur===v?' on':'')} style=${{marginBottom:0}}><span class='k-row-t'>${n}</span><span class='k-row-s' style=${{display:'block'}}>${d}</span></button>`)}</div>
  ${hid>0&&html`<p class='k-hint k-mt'>${LANG==='en'?hid+' features are hidden at this level. They are still available when you switch level.':hid+' funkció rejtve ezen a szinten. Szintváltással bármikor visszakapcsolhatod.'}</p>`}
 <div class='k-mt'><${KRow} ic='sliders' t='Kezdőlap tartalma' s='Napsor, volumen, rekordok…' go=${true} onClick=${homeCardsOpen}/></div>
 <//>`;
}
function Opts({anchor,opt,setOpt,hist,setHist,plan,setPlan,user,out,sy,syncNow,delAcc}){
 const[bk,setBk]=useState(''),[cf,setCf]=useState(false),[cd,setCd]=useState(false),[rs,setRs]=useState(false),o=x=>setOpt(p=>({...p,...x})),qh={on:false,from:'22:00',to:'07:00',...opt.qh},sq=x=>o({qh:{...qh,...x}});
 const exp=()=>{const j=JSON.stringify({hist,plan,opt});setBk(j);try{navigator.clipboard.writeText(j).then(()=>toast('Mentés a vágólapra másolva')).catch(()=>{})}catch(e){}};
 const imp=()=>{try{const d=JSON.parse(bk);if(d.hist)setHist(d.hist);if(d.plan)setPlan(d.plan);if(d.opt)setOpt(d.opt);toast('Adatok visszatöltve')}catch(e){toast('A mentés szövege hibás')}};
 const bt='k-btn sec sm';
 useEffect(()=>{if(anchor==='data'||anchor==='level')setTimeout(()=>{try{document.getElementById(anchor==='level'?'opt-level':'opt-data').scrollIntoView({block:'start'})}catch(e){}},60)},[]);
 return html`<div>
  <${UiSwitcher} opt=${opt} o=${o}/>
  <${Cd} t='Megjelenés'>
   <${Lb} t='Nyelv / Language'/><${Sg} v=${opt.lang} on=${x=>{try{localStorage.setItem('en_lang',x)}catch(e){}o({lang:x})}} o=${[['hu','Magyar'],['en','English']]}/>
   <${Lb} t='Betűméret'/><${Sg} v=${opt.fs} on=${x=>o({fs:+x})} o=${[[14,'Kicsi'],[16,'Normál'],[18,'Nagy'],[20,'Nagyon nagy']]}/>
   <${Sw} l='Animációk' s='Kikapcsolva gyorsabb, kíméli az akkut' v=${opt.an} on=${x=>o({an:x})}/>
   <${Sw} l='Rezgés' s='Érintéskor és a pihenő végén' v=${opt.vib} on=${x=>o({vib:x})}/>
   ${lvlOn('opt.contrast')&&html`<${Sw} l='Nagy kontraszt' s='Erősebb szöveg és vonalak' v=${opt.hc} on=${x=>o({hc:x})}/><${HelpCalm} id='opt.contrast'/>`}
  <//>
  <div id='opt-level'></div><${LevelPick} opt=${opt} o=${o}/>
  ${lvlOn('opt.workout')&&html`<${Cd} t='Edzés'>
   <${Lb} t='Heti edzéscél'/><${Sg} v=${opt.wg} on=${x=>o({wg:+x})} o=${[[2,'2'],[3,'3'],[4,'4'],[5,'5'],[6,'6']]}/>
   <${Lb} t='Alap pihenőidő'/><${Sg} v=${opt.rest} on=${x=>o({rest:+x})} o=${[[60,'60 mp'],[90,'90 mp'],[120,'120 mp'],[180,'180 mp']]}/>
   <${Sw} l='Automatikus pihenő' s='A sorozat kipipálása elindítja az időzítőt' v=${opt.auto} on=${x=>o({auto:x})}/>
   <${Lb} t='Célsúly lépcső (kg)'/><${Sg} v=${opt.step} on=${x=>o({step:+x})} o=${[[.5,'0,5'],[1.25,'1,25'],[2.5,'2,5']]}/>
   <${Lb} t='Heti emelés a célsúlyoknál'/><${Sg} v=${opt.pct} on=${x=>o({pct:+x})} o=${[[1.5,'1,5%'],[2.5,'2,5%'],[5,'5%']]}/>
   <${Sw} l='Képernyő ébren tartása' s='Edzés közben nem kapcsol le' v=${opt.wake} on=${x=>o({wake:x})}/>
   <${Sw} l='Hang' s='Sípszó a pihenő végén' v=${opt.snd} on=${x=>o({snd:x})}/>
  <//>`}
  ${lvlOn('opt.quiet')&&html`<${Cd} t='Értesítések'>
   <${Sw} l='Csendes órák' s='Ilyenkor nem szól az app és nem küld értesítést' v=${qh.on} on=${x=>sq({on:x})}/>
   ${qh.on&&html`<div class='k-g2'><${KField} l='Tól' type='time' v=${qh.from} on=${v=>sq({from:v})}/><${KField} l='Ig' type='time' v=${qh.to} on=${v=>sq({to:v})}/></div>`}
  <//>`}
  ${lvlOn('opt.reset')&&html`<${Cd} t='Alapértékek'>
   <p class='k-hint k-mb'>A kinézet és a beállítások visszaállnak az alapra.</p>
   <button onClick=${()=>{if(rs){setOpt(p=>optReset(p));setRs(false);toast('Alapértékek visszaállítva')}else setRs(true)}} class=${'k-btn sec sm full'+(rs?' ask':'')}>${rs?'Biztosan visszaállítod?':'Alapértékek visszaállítása'}</button>
   <${HelpCalm} id='opt.reset'/>
  <//>`}
  ${lvlOn('cycle.main')&&cycAvail()&&html`<${Cd} t='Ciklus-követés'><${Sw} l='Ciklus-követés' s='Naptár és edzési javaslatok. Az adat csak ezen az eszközön van.' v=${cycGet().on} on=${x=>cycSet({...cycGet(),on:x})}/><//>`}
  <div id='opt-data'></div>
  ${lvlOn('opt.export',anchor==='data')&&html`<${Cd} t='Adatok'>
   <${HelpCalm} id='opt.export'/>
   <div class='k-g2 k-mb'><button onClick=${()=>exportCSV(hist)} class=${bt}>Exportálás (Excel/CSV)</button><button onClick=${()=>exportPDF(hist)} class=${bt}>PDF / nyomtatás</button></div>
   <div class='k-mb'><button onClick=${jsonExport} class=${bt+' full'}>JSON-export (teljes mentés)</button></div>
   <div class='k-g2 k-mb'><button onClick=${exp} class=${bt}>Mentés másolása</button><button onClick=${imp} class=${bt}>Visszatöltés</button></div>
   <textarea value=${bk} onChange=${e=>setBk(e.target.value)} placeholder='Másold ide a mentés szövegét a visszatöltéshez' class='k-in k-ta k-mb'></textarea>
   <button onClick=${()=>{if(cf){setHist([]);setCf(false);toast('Előzmények törölve')}else setCf(true)}} class=${'k-btn dan sm full'+(cf?' ask':'')}>${cf?'Biztosan törlöd?':'Összes edzés törlése'}</button>
  <//>`}
  <${Cd} t='Fiók és szinkron'><div class='k-row-t' style=${{overflowWrap:'anywhere'}}>${(SESS&&SESS.user&&SESS.user.email)||user}</div><div class='k-hint k-mb'>${sy.s==='ok'?'Utoljára szinkronizálva: '+sy.t:sy.s==='busy'?'Szinkronizálás...':sy.s==='off'?'Offline, a változások később szinkronizálódnak.':sy.s==='err'?'Szinkronhiba':'Még nem szinkronizált'}</div><div class='k-g2 k-mb'><button onClick=${syncNow} class=${bt}>Szinkronizálás most</button><button onClick=${out} class=${bt}>Kilépés</button></div><button onClick=${()=>{if(cd)delAcc();else setCd(true)}} class=${'k-btn dan sm full'+(cd?' ask':'')}>${cd?'Biztosan törlöd a fiókot és minden adatot?':'Fiók törlése'}</button><//>
 </div>`;
}

