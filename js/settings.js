const BDY=['SU','MO','TU','WE','TH','FR','SA'];
const ACCS={lime:['Lime','190 242 100','163 230 53','#a3e635','77 124 15','#65a30d'],cyan:['Kék','165 243 252','34 211 238','#22d3ee','14 116 144','#0891b2'],violet:['Lila','196 181 253','167 139 250','#a78bfa','109 40 217','#7c3aed'],orange:['Narancs','253 186 116','251 146 60','#fb923c','194 65 12','#ea580c'],pink:['Rózsaszín','249 168 212','244 114 182','#f472b6','190 24 93','#db2777'],red:['Piros','252 165 165','248 113 113','#f87171','185 28 28','#dc2626']};
const THEMES={alap:['Alap','63 63 70','39 39 42','24 24 27','9 11 14'],amoled:['AMOLED','43 43 48','26 26 29','12 12 14','0 0 0'],kek:['Éjkék','45 63 94','28 42 66','17 26 43','10 16 32'],grafit:['Grafit','68 72 80','46 49 54','32 34 38','18 19 22']};
// Világos mód: [név, z7 (kapcsoló-sáv, elválasztó), z8, z9, háttér]
const LIGHT=['Világos','190 190 197','228 228 231','255 255 255','244 245 248'];
const Cd=({t,children})=>html`<div class='up k-card'><div class='k-cd-t'>${t}</div>${children}</div>`;
const Lb=({t})=>html`<div class='k-lb'>${t}</div>`;
const Sw=KSw;
function Opts({anchor,opt,setOpt,hist,setHist,plan,setPlan,user,out,sy,syncNow,delAcc}){
 const[bk,setBk]=useState(''),[cf,setCf]=useState(false),[cd,setCd]=useState(false),o=x=>setOpt(p=>({...p,...x}));
 const exp=()=>{const j=JSON.stringify({hist,plan,opt});setBk(j);try{navigator.clipboard.writeText(j).then(()=>toast('Mentés a vágólapra másolva')).catch(()=>{})}catch(e){}};
 const imp=()=>{try{const d=JSON.parse(bk);if(d.hist)setHist(d.hist);if(d.plan)setPlan(d.plan);if(d.opt)setOpt(d.opt);toast('Adatok visszatöltve')}catch(e){toast('A mentés szövege hibás')}};
 const bt='k-btn sec sm';
 useEffect(()=>{if(anchor==='data')setTimeout(()=>{try{document.getElementById('opt-data').scrollIntoView({block:'start'})}catch(e){}},60)},[]);
 return html`<div>
  <${UiSwitcher} opt=${opt} o=${o}/>
  <${Cd} t='Megjelenés'>
   <${Lb} t='Nyelv / Language'/><${Sg} v=${opt.lang} on=${x=>{try{localStorage.setItem('en_lang',x)}catch(e){}o({lang:x})}} o=${[['hu','Magyar'],['en','English']]}/>
   <${Lb} t='Betűméret'/><${Sg} v=${opt.fs} on=${x=>o({fs:+x})} o=${[[14,'Kicsi'],[16,'Normál'],[18,'Nagy'],[20,'Nagyon nagy']]}/>
   <${Sw} l='Animációk' s='Kikapcsolva gyorsabb, kíméli az akkut' v=${opt.an} on=${x=>o({an:x})}/>
  <//>
  <${Cd} t='Edzés'>
   <${Lb} t='Heti edzéscél'/><${Sg} v=${opt.wg} on=${x=>o({wg:+x})} o=${[[2,'2'],[3,'3'],[4,'4'],[5,'5'],[6,'6']]}/>
   <${Lb} t='Alap pihenőidő'/><${Sg} v=${opt.rest} on=${x=>o({rest:+x})} o=${[[60,'60 mp'],[90,'90 mp'],[120,'120 mp'],[180,'180 mp']]}/>
   <${Sw} l='Automatikus pihenő' s='A sorozat kipipálása elindítja az időzítőt' v=${opt.auto} on=${x=>o({auto:x})}/>
   <${Lb} t='Célsúly lépcső (kg)'/><${Sg} v=${opt.step} on=${x=>o({step:+x})} o=${[[.5,'0,5'],[1.25,'1,25'],[2.5,'2,5']]}/>
   <${Lb} t='Heti emelés a célsúlyoknál'/><${Sg} v=${opt.pct} on=${x=>o({pct:+x})} o=${[[1.5,'1,5%'],[2.5,'2,5%'],[5,'5%']]}/>
   <${Sw} l='Képernyő ébren tartása' s='Edzés közben nem kapcsol le' v=${opt.wake} on=${x=>o({wake:x})}/>
   <${Sw} l='Hang' s='Sípszó a pihenő végén' v=${opt.snd} on=${x=>o({snd:x})}/>
   <${Sw} l='Rezgés' s='Érintéskor és a pihenő végén' v=${opt.vib} on=${x=>o({vib:x})}/>
  <//>
  ${cycAvail()&&html`<${Cd} t='Ciklus-követés'><${Sw} l='Ciklus-követés' s='Naptár és edzési javaslatok. Az adat csak ezen az eszközön van.' v=${cycGet().on} on=${x=>cycSet({...cycGet(),on:x})}/><//>`}
  <div id='opt-data'></div>
  <${Cd} t='Adatok'>
   <div class='k-g2 k-mb'><button onClick=${()=>exportCSV(hist)} class=${bt}>Exportálás (Excel/CSV)</button><button onClick=${()=>exportPDF(hist)} class=${bt}>PDF / nyomtatás</button></div>
   <div class='k-g2 k-mb'><button onClick=${exp} class=${bt}>Mentés másolása</button><button onClick=${imp} class=${bt}>Visszatöltés</button></div>
   <textarea value=${bk} onChange=${e=>setBk(e.target.value)} placeholder='Másold ide a mentés szövegét a visszatöltéshez' class='k-in k-ta k-mb'></textarea>
   <button onClick=${()=>{if(cf){setHist([]);setCf(false);toast('Előzmények törölve')}else setCf(true)}} class=${'k-btn dan sm full'+(cf?' ask':'')}>${cf?'Biztosan törlöd?':'Összes edzés törlése'}</button>
  <//>
  <${Cd} t='Fiók és szinkron'><div class='k-row-t' style=${{overflowWrap:'anywhere'}}>${(SESS&&SESS.user&&SESS.user.email)||user}</div><div class='k-hint k-mb'>${sy.s==='ok'?'Utoljára szinkronizálva: '+sy.t:sy.s==='busy'?'Szinkronizálás...':sy.s==='off'?'Offline, a változások később szinkronizálódnak.':sy.s==='err'?'Szinkronhiba':'Még nem szinkronizált'}</div><div class='k-g2 k-mb'><button onClick=${syncNow} class=${bt}>Szinkronizálás most</button><button onClick=${out} class=${bt}>Kilépés</button></div><button onClick=${()=>{if(cd)delAcc();else setCd(true)}} class=${'k-btn dan sm full'+(cd?' ask':'')}>${cd?'Biztosan törlöd a fiókot és minden adatot?':'Fiók törlése'}</button><//>
 </div>`;
}

