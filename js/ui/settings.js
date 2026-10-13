/* ---------- Beállítások: felület-váltó (Pro, Gym, Family) és színséma ----------
   A kinézet a nézőpont (aktív felület) mockupja szerint: docs/mockups/forras/ProSettings, GymSettings, FamilySettings.
   A váltás azonnali, a mentés az opt-on át történik (bejelentkezve szinkron, mindig localStorage-tükör). */
const UI_PREV={pro:UiPrevPro,gym:UiPrevGym,family:UiPrevFamily};
const UI_TXT={
 pro:{h:'Felület',hint:'Azonnal vált',sh:'Színséma',note:'A választást a profilodba mentjük, ha be vagy jelentkezve. Különben ezen az eszközön marad.'},
 gym:{h:'Felület',hint:'Azonnal vált',sh:'Kiemelőszín',note:'A választást a profilodba mentjük, ha be vagy jelentkezve. Különben ezen az eszközön marad.'},
 family:{h:'Kinézet',hint:'',sh:'Színek',note:'Mindháromban jól olvasható a szöveg.'}};

const uiEn={'Kinézet':'Look','Erős':'Strong'},uiT=x=>LANG==='en'&&uiEn[x]?uiEn[x]:x;
function UiSwitcher({opt,o}){
 useEffect(()=>{uiLoadExtra('family=Anton','anton')},[]); // a Gym előnézet címbetűje a váltónál is Anton legyen
 const cur=uiState(opt),v=cur.ui,L=UI_CARD_LBL[v],T=UI_TXT[v];
 const pick=u=>o({ui:u,schemes:{...(opt.schemes||{}),[u]:uiState({...opt,ui:u}).sc}});
 const pickScheme=s=>o({schemes:{...(opt.schemes||{}),[v]:s}});
 const Tick=({s=18})=>html`<svg width=${s} height=${s} viewBox='0 0 18 18' aria-hidden='true' class='ui-sw-tick'><path d='M3.5 9.5l3.5 3.5 7.5-8' fill='none' stroke='currentColor' strokeWidth='2'/></svg>`;
 const card=u=>{const on=cur.ui===u,sd=uiState({...opt,ui:u}).def,Pv=UI_PREV[u];
  return html`<button key=${u} type='button' aria-pressed=${on} onClick=${()=>pick(u)} class=${'ui-sw-card'+(on?' on':'')}>
   <span class='ui-sw-shot' aria-hidden='true'><${Pv} a=${sd.acc} bg=${sd.bg}/></span>${on&&v==='family'&&html`<span class='ui-sw-badge'><${Tick} s=${18}/></span>`}
   <span class='ui-sw-cap'><span class='ui-sw-act'>${on?'Aktív':' '}</span><span class='ui-sw-name'>${L[u][0]}</span><span class='ui-sw-sub'>${uiT(L[u][1])}</span></span></button>`};
 const schemes=()=>{if(!v)return null;const list=UI_DEF[v].schemes;
  if(v==='gym')return html`<div role='radiogroup' aria-label=${tr(T.sh)} class='ui-sw-blocks'>${list.map(([k,n,,d])=>html`<button key=${k} type='button' role='radio' aria-checked=${cur.sc===k} onClick=${()=>pickScheme(k)} class=${'ui-sw-block'+(cur.sc===k?' on':'')}><span class='ui-sw-blockcol' style=${{background:d.acc}}>${cur.sc===k&&html`<${Tick} s=${18}/>`}</span><span class='ui-sw-blocknm'>${n}</span></button>`)}</div>`;
  return html`<div role='radiogroup' aria-label=${tr(T.sh)} class=${'ui-sw-rows ui-sw-rows-'+v}>${list.map(([k,n,ds,d])=>html`<button key=${k} type='button' role='radio' aria-checked=${cur.sc===k} onClick=${()=>pickScheme(k)} class=${'ui-sw-row'+(cur.sc===k?' on':'')}>
   <span class='ui-sw-sw' aria-hidden='true'>${v==='pro'?html`<i style=${{background:d.bg}}></i><i style=${{background:d.ink}}></i><i style=${{background:d.acc,borderColor:d.acc}}></i>`:html`<i style=${{background:d.bg}}></i><i style=${{background:d.acc,borderColor:d.acc}}></i>`}</span>
   <span class='ui-sw-rowtx'><span class='ui-sw-rownm'>${n}</span><span class='ui-sw-rowds'>${ds}</span></span>
   <span class='ui-sw-rowtick'>${cur.sc===k?html`<${Tick}/>`:null}</span></button>`)}</div>`};
 return html`<section class=${'ui-sw ui-sw-'+(v||'orig')}>
  <div class='ui-sw-head'><h2 class='ui-sw-h'>${uiT(T.h)}</h2>${T.hint&&html`<span class='ui-sw-hint'>${T.hint}</span>`}</div>
  <div class='ui-sw-cards'>${UI_ORDER.map(card)}</div>
  ${v&&html`<h2 class='ui-sw-h ui-sw-h2'>${T.sh}</h2>${schemes()}`}
  <p class='ui-sw-note'>${T.note}</p>
</section>`;
}
