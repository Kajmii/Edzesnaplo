/* ---------- Súgó: lap, Súgó-képernyő, elemi súgó, első-látogatás tipp, megnyugtató sor ----------
   A tartalom a js/features/help.js-ben van (kulcs: a funkció azonosítója). A "?" a fejlécben (UiHeader), az "i" az elemeknél (HelpI),
   a lapot az App nyitja a 'helpopen' eseményre (helpOpen). Terv: docs/UI-IMPLEMENTATION.md 7. fejezet. */
const helpOpen=id=>{try{window.dispatchEvent(new CustomEvent('helpopen',{detail:id}))}catch(e){}};

// a súgólap: mi ez, hogyan használd, tipp, megnyugtató mondat; onAll = ugrás a Súgó-képernyőre
function HelpSheet({id,onClose,onAll}){
 const f=featById(id),H=HELP[id];if(!f||!H)return null;
 return html`<${KSheet} t=${f.t} onClose=${onClose} foot=${html`<${React.Fragment}><${KBtn} full=${true} onClick=${onClose}>Értem<//>${onAll&&html`<${KBtn} v='gho' full=${true} c='k-mt' onClick=${onAll}>Minden súgótéma<//>`}<//>`}>
  <p class='k-lead'>${H[0]}</p>
  ${H[1].length>0&&html`<h3 class='k-help-h'>Hogyan használd</h3><ol class='k-help-ol'>${H[1].map((x,i)=>html`<li key=${i}>${x}</li>`)}</ol>`}
  ${H[2]&&html`<p class='k-hint'><b>${tr('Tipp')}:</b> ${H[2]}</p>`}
  ${H[3]&&html`<p class='k-hint k-calm'>${H[3]}</p>`}<//>`;
}

// az "i" gomb egy nem magától értetődő elem mellett: mindig látható, nem csak hosszú nyomásra
function HelpI({id}){
 const f=featById(id);
 return html`<button type='button' class='k-hi' aria-haspopup='dialog' aria-label=${tr('Magyarázat')+': '+tr(f?f.t:'')} onClick=${()=>helpOpen(id)}><${UiIco} n='info' s=${16}/></button>`;
}

// halk megnyugtató sor (docs 7b): a súgó-bejegyzés negyedik mezője
function HelpCalm({id}){
 const H=HELP[id];
 return H&&H[3]?html`<p class='k-hint k-calm'>${H[3]}</p>`:null;
}

// első-látogatás tipp: képernyőnként egyszer, bezárható; csak a Csak a lényeg és az Ajánlott szinten (Minden szinten nem)
function HelpTip({id}){
 const[seen,setSeen]=useState(()=>gj('tips',{})),H=HELP[id];
 if(!H||lvlOf()>=3||seen[id])return null;
 const close=()=>{const n={...gj('tips',{}),[id]:1};sj('tips',n);setSeen(n)};
 return html`<div class='k-tip' role='note'><div class='k-tip-tx'><b>Mi ez a képernyő?</b> ${H[0]} ${tr('A „?” jelre koppintva bármikor elolvasod.')}</div><button type='button' class='k-ib' aria-label=${tr('Tipp bezárása')} onClick=${close}><${UiIco} n='x' s=${18}/></button></div>`;
}

// Súgó-képernyő: keresés és az összes téma csoportonként; egy sor megnyitja a súgólapot
function Help(){
 const[q,setQ]=useState(''),res=q.trim()?helpSearch(q):null;
 const row=f=>html`<${KRow} key=${f.id} ic=${f.ic} t=${f.t} s=${HELP[f.id][0]} go=${true} onClick=${()=>helpOpen(f.id)}/>`;
 return html`<div>
  <div class='k-hsearch'><${UiIco} n='search' s=${18}/><input type='search' class='k-in' value=${q} placeholder=${tr('Keress a súgóban…')} aria-label=${tr('Keress a súgóban…')} onChange=${e=>setQ(e.target.value)}/></div>
  ${res?(res.length>0?html`<${KCard}><div class='k-list'>${res.map(row)}</div><//>`:html`<p class='k-hint'>Nincs találat. Próbálj másik szót.</p>`)
   :FEAT_GROUPS.map(g=>{const fs=FEATURES.filter(f=>f.group===g&&f.id!=='help.main'&&HELP[f.id]);return fs.length>0&&html`<${KSec} key=${g} t=${FEAT_GROUP_LBL[g]}><${KCard}><div class='k-list'>${fs.map(row)}</div><//><//>`})}
 </div>`;
}
