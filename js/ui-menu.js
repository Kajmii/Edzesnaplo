/* ---------- Lenyitható menü és képernyő-fejléc (Pro, Gym, Family) ----------
   Mockupok: docs/mockups/forras/ProMenu, GymMenu, FamilyMenu (+ a kezdőlapok menüsávja). Az alsó füles navigáció megszűnt:
   a Kezdőlapon egy összecsukott menüsáv van, rákoppintva alulról felnyíló lap jön fel. Más képernyőn a fejléc "Menü" gombja
   a Kezdőlapra ugrik, nyitott menüvel. Az animációk a css/motion.css tokenjeit használják. */
const UI_ICO={
 dumbbell:'M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12',
 cal:'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
 log:'M6 4h12v16H6zM9 9h6M9 13h6M9 17h3',
 food:'M3 12h18a9 9 0 01-18 0zM8 7.5c0-1.5 1-2 0-3.5M12 7.5c0-1.5 1-2 0-3.5',
 book:'M12 6.5C10 5 7 4.5 4 5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v14',
 chart:'M4 20h16M7 20v-8M12 20V5M17 20v-5',
 people:'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M16 11a3 3 0 100-6M18 14a5 5 0 013 5',
 cycle:'M20 12a8 8 0 11-2.3-5.6M20 4v4h-4',
 user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
 sliders:'M4 7h9M17 7h3M4 17h3M11 17h9M15 4.5v5M9 14.5v5',
 calc:'M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2M9 18.5h6',
 edit:'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3',
 download:'M12 4v11M7 11l5 5 5-5M5 20h14',
 up:'M5 15l7-7 7 7',
 back:'M14 4l-7 7 7 7'};
const UiIco=({n,s=24})=>html`<svg width=${s} height=${s} viewBox='0 0 24 24' class='ui-ico' aria-hidden='true' fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round'><path d=${UI_ICO[n]}/></svg>`;

// Menüpontok: k, hova (tab, sub), ikon, név, irányonkénti egysoros leírás. A Ciklus csak bekapcsolt funkciónál látszik.
const UI_MENU=[
 {k:'log',tab:'log',sub:'',ic:'dumbbell',t:'Edzés',d:{pro:'Mai edzés és a gyakorlatok',gym:'Mai edzés, gyakorlatok',family:'A mai mozgás'}},
 {k:'plan',tab:'plan',sub:'',ic:'cal',t:'Terv',d:{pro:'Heti és havi terv',gym:'Heti és havi ciklus',family:'Mi jön a héten'}},
 {k:'hist',tab:'hist',sub:'',ic:'log',t:'Napló',d:{pro:'Korábbi edzések és sorozatok',gym:'Mit és mennyit emeltél',family:'Amit már megcsináltál'}},
 {k:'food',tab:'food',sub:'',ic:'food',t:'Étel',d:{pro:'Kalória és makrók',gym:'Kalória és fehérje',family:'Mit ettél ma'}},
 {k:'recipes',tab:'food',sub:'rec',ic:'book',t:'Receptek',d:{pro:'Mentett ételek és ötletek',gym:'Mentett ételek',family:'Mentett ételek'}},
 {k:'body',tab:'tools',sub:'b',ic:'chart',t:'Test és mérések',d:{pro:'Súly, méretek, fotók',gym:'Súly, méretek, rekordok',family:'Súly és méretek'}},
 {k:'social',tab:'social',sub:'',ic:'people',t:'Közösség',d:{pro:'Csoportok és kihívások',gym:'Csoportok, kihívások',family:'Barátok, csoportok'}},
 {k:'cycle',tab:'cycle',sub:'',ic:'cycle',t:'Ciklus',d:{pro:'Csak ha be van kapcsolva',gym:'Csak ha bekapcsoltad',family:'Ha bekapcsoltad'}},
 {k:'profile',tab:'profile',sub:'',ic:'user',t:'Profil',d:{pro:'Adatok és célok',gym:'Adatok és célok',family:'Adataid'}},
 {k:'opt',tab:'opt',sub:'',ic:'sliders',t:'Beállítások',d:{pro:'Felület, színséma, fiók',gym:'Felület, színek, fiók',family:'Betűméret, színek'}},
 {k:'calc',tab:'tools',sub:'c',ic:'calc',t:'Számolók',d:{pro:'Kardió, kalória, erő, intervall',gym:'Kardió, kalória, erő',family:'Kalória és kardió'}},
 {k:'edit',tab:'edit',sub:'',ic:'edit',t:'Tervszerkesztő',d:{pro:'Saját edzések szerkesztése',gym:'Saját edzések',family:'Saját edzéseid'}},
 {k:'data',tab:'opt',sub:'data',ic:'download',t:'Export és adatok',d:{pro:'CSV, PDF, mentés',gym:'Export, mentés',family:'Adataid mentése'}}];
const uiMenuItems=cyc=>UI_MENU.filter(m=>m.k!=='cycle'||cyc);
// A képernyő címe a fejlécben (a Test és mérések / Számolók ugyanaz a Tools képernyő, a sub dönt)
const uiTitle=(tab,sub)=>({log:'Edzés',plan:'Terv',hist:'Napló',food:sub==='rec'?'Receptek':'Étel',tools:sub==='b'?'Test és mérések':'Számolók',social:'Közösség',cycle:'Ciklus',profile:'Profil',opt:sub==='data'?'Export és adatok':'Beállítások',edit:'Tervszerkesztő'})[tab]||'';
const uiCloseMs=()=>{try{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return 0;return +getComputedStyle(document.documentElement).getPropertyValue('--close-ms')||200}catch(e){return 200}};
const uiBarSub=(items,ui)=>{
 if(ui==='family')return 'Napló, étel és a többi';
 const nm=['hist','food','log'].map(k=>tr(items.find(m=>m.k===k).t)); // Gym: "EDZÉS · NAPLÓ · ÉTEL · +N"
 return [tr(items[0].t),nm[0],nm[1]].join(' · ')+' · +'+(items.length-3);
};

// A menü: összecsukott sáv (csak a Kezdőlapon) és a felnyíló lap
function UiMenu({open,setOpen,home,go}){
 const cyc=useCyc(),items=uiMenuItems(!!cyc),ui=uiState(OPT).ui,[vis,setVis]=useState(open),[cl,setCl]=useState(false),bar=React.useRef(null),first=React.useRef(null),sheet=React.useRef(null),why=React.useRef('');
 useEffect(()=>{
  if(open){setCl(false);setVis(true);return}
  if(!vis)return;
  setCl(true);const ms=uiCloseMs(),t=setTimeout(()=>{setVis(false);setCl(false);if(why.current==='back'&&bar.current)bar.current.focus();why.current=''},ms);
  return()=>clearTimeout(t)},[open]);
 // nyitáskor a fókusz az első pontra; a háttér inert, a görgetés zárolt
 useEffect(()=>{
  const m=document.getElementById('ui-main');
  if(open){setTimeout(()=>first.current&&first.current.focus(),30);if(m)m.setAttribute('inert','');document.documentElement.style.overflow='hidden'}
  return()=>{if(m)m.removeAttribute('inert');document.documentElement.style.overflow=''}},[open]);
 useEffect(()=>{if(!open)return;
  const k=e=>{
   if(e.key==='Escape'){why.current='back';setOpen(false);return}
   if(e.key!=='Tab'||!sheet.current)return;
   const f=[...sheet.current.querySelectorAll('button')].filter(x=>!x.disabled);if(!f.length)return;
   const a=f[0],z=f[f.length-1];
   if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}};
  document.addEventListener('keydown',k);return()=>document.removeEventListener('keydown',k)},[open]);
 const close=()=>{why.current='back';setOpen(false)},pick=m=>{why.current='nav';setOpen(false);go(m.tab,m.sub)};
 const chev=r=>html`<span class=${'ui-chev'+(r?' ui-chev-open':'')}><${UiIco} n='up' s=${24}/></span>`;
 const n=items.length,oldal=LANG==='en'?n+' pages':n+' oldal';
 return html`<${React.Fragment}>
  ${home&&html`<div class='ui-bar-wrap'><button ref=${bar} type='button' class='ui-bar' aria-expanded=${open} aria-controls='ui-menu-list' onClick=${()=>setOpen(true)}>
    <span class='ui-bar-stripe' aria-hidden='true'></span>
    <span class='ui-bar-tx'><span class='ui-bar-t'>Menü</span><span class='ui-bar-sub'>${uiBarSub(items,ui)}</span></span>
    <span class='ui-bar-hint'>${oldal}</span><span class='ui-bar-chip'>${chev(false)}</span></button></div>`}
  ${vis&&html`<div class=${'ui-mlayer'+(cl?' ui-closing':'')}>
   <div class='ui-scrim' onClick=${close} aria-hidden='true'></div>
   <section ref=${sheet} class='ui-msheet' role='dialog' aria-modal='true' aria-label=${tr('Menü')}><div class='ui-minner'>
    <div class='ui-mstripe' aria-hidden='true'></div>
    <button type='button' class='ui-mhead' aria-expanded=${!cl} aria-controls='ui-menu-list' onClick=${close}><span class='ui-mhead-t'>${ui==='family'?'Menü bezárása':'Menü'}</span><span class='ui-mhead-r'><span class='ui-mhead-hint'>${ui==='gym'?'Bezár':'Bezárás'}</span>${chev(!cl)}</span></button>
    <ul id='ui-menu-list' class='ui-mlist ui-stagger' role='list'>${items.map((m,i)=>html`<li key=${m.k} style=${{'--i':i}}><button ref=${i===0?first:null} type='button' class=${'ui-mrow'+(i===0?' on':'')} onClick=${()=>pick(m)}>
      <span class='ui-mnum' aria-hidden='true'>${String(i+1).padStart(2,'0')}</span><span class='ui-mbar' aria-hidden='true'></span>
      <span class='ui-mico' aria-hidden='true'><${UiIco} n=${m.ic}/></span>
      <span class='ui-mtx'><span class='ui-mt'>${m.t}</span><span class='ui-md'>${m.d[ui]}</span></span></button></li>`)}</ul></div></section></div>`}
 <//>`;
}

// Fejléc a nem-Kezdőlap képernyőkön: vissza a menübe + a képernyő címe
function UiHeader({title,onBack}){
 return html`<header class='ui-hdr'><div class='ui-hdr-in'><button type='button' class='ui-back' onClick=${onBack}><${UiIco} n='back' s=${18}/><span>Menü</span></button><h1 class='ui-hdr-t'>${title}</h1><span class='ui-hdr-sp' aria-hidden='true'></span></div><div class='ui-hdr-stripe' aria-hidden='true'></div></header>`;
}
