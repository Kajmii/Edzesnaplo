/* ---------- Első bejelentkezés után: a felület (Pro, Gym, Family) egyszeri kiválasztása ----------
   Fiókonként egyszer jelenik meg (opt.uiChosen, a user_data része, ezért eszközök közt szinkronban van). A választás azonnal
   látszik (élő előnézet), a "Ezt választom" gomb rögzíti. Később a Beállításokban bármikor módosítható. */
const UI_WHO={
 pro:{n:['Pro','Letisztult'],w:'Ajánljuk, ha szereted az áttekinthető, tömör felületet: listák, számok és grafikonok, kevés dísszel.'},
 gym:{n:['Gym','Ipari'],w:'Ajánljuk, ha gyors, erős kontrasztú, sötét felületet szeretnél, főleg edzés közben a teremben.'},
 family:{n:['Family','Nyugodt'],w:'Ajánljuk, ha nagyobb gombokat és nyugodt, jól olvasható felületet szeretnél: kezdőknek, idősebbeknek és családi használatra.'}};

function UiPicker({opt,o}){
 const[sel,setSel]=useState(null),first=React.useRef(null);
 useEffect(()=>{uiLoadExtra('family=Anton','anton')},[]); // a Gym előnézet címbetűje
 useEffect(()=>{const m=document.getElementById('ui-main');if(m)m.setAttribute('inert','');document.documentElement.style.overflow='hidden';setTimeout(()=>first.current&&first.current.focus(),50);return()=>{if(m)m.removeAttribute('inert');document.documentElement.style.overflow=''}},[]);
 const pick=u=>{setSel(u);o({ui:u,schemes:{...(opt.schemes||{}),[u]:uiState({...opt,ui:u}).sc}})};
 const done=()=>o({uiChosen:true});
 return html`<div class='ui-pick' role='dialog' aria-modal='true' aria-labelledby='ui-pick-h'><div class='ui-pick-in'>
  <h1 id='ui-pick-h' class='ui-pick-h'>Válaszd ki a kinézetet</h1>
  <p class='ui-pick-p'>Ezt egyszer kell kiválasztanod. A Beállításokban később bármikor módosíthatod.</p>
  <div class='ui-pick-list ui-stagger' role='radiogroup' aria-labelledby='ui-pick-h'>${UI_ORDER.map((u,i)=>{const d=uiState({...opt,ui:u}).def,Pv=UI_PREV[u],on=sel===u;
   return html`<button key=${u} ref=${i===0?first:null} type='button' role='radio' aria-checked=${on} onClick=${()=>pick(u)} class=${'ui-pick-card'+(on?' on':'')} style=${{'--i':i}}>
    <span class='ui-sw-shot ui-pick-shot' aria-hidden='true'><${Pv} a=${d.acc} bg=${d.bg}/></span>
    <span class='ui-pick-tx'><span class='ui-pick-name'>${UI_WHO[u].n[0]}<span class='ui-pick-sub'>${UI_WHO[u].n[1]}</span></span><span class='ui-pick-who'>${UI_WHO[u].w}</span></span>
    <span class='ui-pick-tick' aria-hidden='true'>${on&&html`<${UiIco} n='check' s=${20}/>`}</span></button>`})}</div>
  <div class='ui-pick-bar'><button type='button' class='ui-pick-go' disabled=${!sel} onClick=${done}>Ezt választom</button></div></div></div>`;
}
