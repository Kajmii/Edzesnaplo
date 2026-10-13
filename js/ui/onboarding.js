/* ---------- Első indítás: szint-választó, rövid bemutató; Kezdőlap tartalma (K4) ----------
   Sorrend: bejelentkezés -> felület-választó (picker.js) -> szint-választó (itt) -> opcionális bemutató -> Kezdőlap.
   A meglévő felhasználók (K3) egyszer megkapják a szint-választót (az első szinkron után), a felület-választót nem; amíg nem
   választanak, a Minden szint él. A "Később" új felhasználónál az Ajánlott, meglévőnél a Minden szint (semmi nem tűnik el).
   Terv: docs/UI-IMPLEMENTATION.md 5., 10. fejezet, mockup M1, M1b, M2, M8. */
const LEVEL_SUB={1:'Egyszerű, csak az edzésnapló.',2:'A legtöbb embernek ez elég.',3:'Minden eszköz, a gyakorlottaknak.'};
const LEVEL_PTS={
 1:['Edzés indítása és naplózása','Terv és napló az edzéseidről','Profil és beállítások','Tiszta, rövid kezdőlap'],
 2:['A lényeg, plusz étel és kalória','Testsúly és méretek követése','Heti haladás, ha kéred a kezdőlapon','Kedvencek az ételekhez'],
 3:['Receptek és vízbevitel','Közösség, csoportok, kihívások','Fotók, ciklus-követés, számolók','Részletes statisztika és export']};
// "Később": új felhasználónak az Ajánlott, meglévőnek a Minden szint
const lvLater=fresh=>fresh?2:3;
const TOUR=[
 ['dumbbell','Indíts egy edzést','A Kezdőlapról egy koppintással elindul a mai edzés. Közben csak a következő sorozat látszik.'],
 ['search','A menü mindent tud','Nyisd meg a menüt, és keress rá bármire: ételre, fotóra, kihívásra. A rejtett funkciókat is megtalálja.'],
 ['help','Elakadtál? Koppints a ? jelre','Minden képernyőn van egy kis ? gomb, ami elmagyarázza, mit látsz és hogyan használd.']];

// teljes képernyős réteg közös viselkedése: a háttér inert, a görgetés zárolt, a fókusz az elsőre
const useObLayer=ref=>useEffect(()=>{const m=document.getElementById('ui-main');if(m)m.setAttribute('inert','');document.documentElement.style.overflow='hidden';setTimeout(()=>ref.current&&ref.current.focus(),50);return()=>{if(m)m.removeAttribute('inert');document.documentElement.style.overflow=''}},[]);

function LevelScreen({o,fresh}){
 const[sel,setSel]=useState(2),first=React.useRef(null);
 useObLayer(first);
 const done=v=>o({lvl:v,lvlSet:true});
 return html`<div class='ui-pick' role='dialog' aria-modal='true' aria-labelledby='ob-lv-h'><div class='ui-pick-in'>
  ${!fresh&&html`<p class='ob-k'>Újdonság</p>`}
  <h1 id='ob-lv-h' class='ui-pick-h'>${fresh?'Mennyi funkciót szeretnél látni?':'Válaszd ki, mennyit szeretnél látni'}</h1>
  <p class='ui-pick-p'>${fresh?'Bármikor átállíthatod. Semmi sem törlődik, csak elrejtjük.':'Eddig minden látszott. Szűkítheted az appot, semmi nem törlődik, és bármikor visszaállíthatod.'}</p>
  <div class='ui-pick-list ui-stagger' role='radiogroup' aria-labelledby='ob-lv-h'>${LEVELS.map(([v,n],i)=>html`<button key=${v} ref=${v===2?first:null} type='button' role='radio' aria-checked=${sel===v} onClick=${()=>setSel(v)} class=${'k-card ob-card'+(sel===v?' on':'')} style=${{'--i':i}}>
    <span class='ob-n'><span class='k-row-t'>${n}</span>${v===2&&html`<span class='ob-badge'>Ajánlott</span>`}</span>
    <span class='k-row-s' style=${{display:'block'}}>${LEVEL_SUB[v]}</span>
    <ul class='ob-ul'>${LEVEL_PTS[v].map(x=>html`<li key=${x}>${x}</li>`)}</ul></button>`)}</div>
  <div class='ui-pick-bar ob-bar'><button type='button' class='ui-pick-go' onClick=${()=>done(sel)}>Ezt választom</button>
   <button type='button' class='k-btn gho full' onClick=${()=>done(lvLater(fresh))}>${fresh?'Később':'Később (mindent mutat)'}</button></div></div></div>`;
}

function TourScreen({step,onNext,onSkip}){
 const first=React.useRef(null),[ic,t,p]=TOUR[step];
 useObLayer(first);
 return html`<div class='ui-pick' role='dialog' aria-modal='true' aria-labelledby='ob-tour-h'><div class='ui-pick-in'>
  <p class='ob-k'>${step+1} / ${TOUR.length}</p>
  <div class='ob-tour'><span class='ob-ico' aria-hidden='true'><${UiIco} n=${ic} s=${72}/></span><h1 id='ob-tour-h' class='ui-pick-h'>${t}</h1><p class='ui-pick-p'>${p}</p>
   <div class='ob-dots' aria-hidden='true'>${TOUR.map((_,j)=>html`<i key=${j} class=${j===step?'on':''}></i>`)}</div></div>
  <div class='ui-pick-bar ob-bar'><button ref=${first} type='button' class='ui-pick-go' onClick=${onNext}>${step===TOUR.length-1?'Kezdjük':'Tovább'}</button>
   <button type='button' class='k-btn gho full' onClick=${onSkip}>Átugrom</button></div></div></div>`;
}

// Kezdőlap tartalma: kártya-kapcsolók (mindhárom irányban ugyanaz); a szint csak az alapot adja, a választás az opt.home-ba kerül
const HOME_CARDS=['home.week','home.volume','home.records','home.pr','home.streak','home.groups','home.easy','home.fontsize'];
const homeCardsOpen=()=>{try{window.dispatchEvent(new Event('homecards'))}catch(e){}};
function HomeCardsSheet({opt,o,onClose}){
 const ui=uiState(opt).ui,cur=HOME_CARDS.filter(id=>homeOn(id,ui));
 const tgl=id=>o({home:HOME_CARDS.filter(x=>x===id?!cur.includes(id):cur.includes(x))});
 return html`<${KSheet} t='Kezdőlap tartalma' onClose=${onClose} foot=${html`<${React.Fragment}><${KBtn} full=${true} onClick=${onClose}>Kész<//><${KBtn} v='gho' full=${true} c='k-mt' onClick=${()=>o({home:null})}>Alapértelmezés<//><//>`}>
  <p class='k-hint k-mb'>A szint adja az alapot, bármelyik kártyát be- vagy kikapcsolhatod.</p>
  ${HOME_CARDS.map(id=>html`<${KSw} key=${id} l=${featById(id).t} v=${cur.includes(id)} on=${()=>tgl(id)}/>`)}
  <${HelpCalm} id='opt.home'/><//>`;
}
