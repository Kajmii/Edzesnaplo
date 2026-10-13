/* ---------- UI-irányok és színsémák: Pro, Gym, Family ----------
   Terv: docs/UI-IMPLEMENTATION.md. A tokenek a css/tokens.css-ben vannak, ez a fájl az állapotot és az alkalmazást végzi.
   Állapot: opt.ui ('pro' | 'gym' | 'family'; az alap a Pro, az eredeti kinézet kikerült az appból), opt.schemes = {pro:'paper', gym:'yellow', family:'green'}.
   Az opt a user_data része, ezért bejelentkezve a Supabase-be szinkronizálódik. Minden felhasználás előtt localStorage-ba is tükrözzük
   (en_ui, en_scheme), hogy az index.html korai scriptje az első festés előtt alkalmazhassa. */
// bg/ink/acc: a váltó színmintái és a theme-color (a css/tokens.css-sel egyezik, a tests/ui.check.js ellenőrzi)
const UI_DEF={
 pro:{fs:16,fonts:'family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600',schemes:[
  ['paper','Papír','Meleg, világos alap',{bg:'#ECEAE5',ink:'#16171A',acc:'#C2410C',txt:'#A63608'}],
  ['stone','Kő','Barnás, nyomtatott hatás',{bg:'#E6E0D4',ink:'#221E18',acc:'#C2410C',txt:'#A63608'}],
  ['graphite','Grafit','Sötét, esti edzéshez',{bg:'#1B1C1F',ink:'#ECEAE5',acc:'#C2410C',txt:'#EC7344'}]]},
 gym:{fs:15,fonts:'family=Anton&family=Archivo:wght@400;600;800',schemes:[
  ['yellow','Sárga','',{bg:'#0F0F0D',ink:'#F3F0E8',acc:'#FFC93C',txt:'#FFC93C'}],
  ['orange','Narancs','',{bg:'#0F0F0D',ink:'#F3F0E8',acc:'#FF5A1F',txt:'#FF5A1F'}],
  ['green','Zöld','',{bg:'#0F0F0D',ink:'#F3F0E8',acc:'#7CFF4F',txt:'#7CFF4F'}]]},
 family:{fs:16,fonts:'family=Atkinson+Hyperlegible:wght@400;700',schemes:[
  ['green','Zöld','Az alap',{bg:'#F2F4F0',ink:'#1A2420',acc:'#0E6B5E',txt:'#0E6B5E'}],
  ['warm','Meleg','Barnás, napos',{bg:'#F5EEE4',ink:'#1A2420',acc:'#A8481F',txt:'#A8481F'}],
  ['cool','Hűvös','Kékes, friss',{bg:'#EEF2F7',ink:'#1A2420',acc:'#1F4E99',txt:'#1F4E99'}]]}};
const UI_ORDER=['pro','gym','family'];
// A felület-kártyák feliratai a nézőpont (a most aktív felület) mockupja szerint
const UI_CARD_LBL={
 pro:{pro:['Pro','Letisztult'],gym:['Gym','Ipari'],family:['Family','Nyugodt']},
 gym:{pro:['PRO','LETISZTULT'],gym:['GYM','IPARI'],family:['FAMILY','NYUGODT']},
 family:{pro:['Pro','Letisztult'],gym:['Gym','Erős'],family:['Family','Nyugodt']}};

// Az aktuális irány és séma az opt-ból (érvénytelen irány = Pro, érvénytelen séma = az irány első sémája)
const uiState=opt=>{
 const ui=opt&&UI_DEF[opt.ui]?opt.ui:'pro';
 const want=opt.schemes&&opt.schemes[ui],d=UI_DEF[ui].schemes.find(s=>s[0]===want)||UI_DEF[ui].schemes[0];
 return{ui,sc:d[0],def:d[3]};
};
const uiFontLink=ui=>'https://fonts.googleapis.com/css2?'+UI_DEF[ui].fonts+'&display=swap';
const uiLoadExtra=(q,k)=>{try{if(document.querySelector('link[data-ui-font="'+k+'"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?'+q+'&display=swap';l.setAttribute('data-ui-font',k);document.head.appendChild(l)}catch(e){}};
const uiLoadFonts=ui=>{try{if(!ui||document.querySelector('link[data-ui-font="'+ui+'"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=uiFontLink(ui);l.setAttribute('data-ui-font',ui);document.head.appendChild(l)}catch(e){}};

// Alkalmazás az html elemre: attribútumok, betűk, betűméret, theme-color, localStorage-tükör
const uiApply=opt=>{
 const{ui,sc,def}=uiState(opt),r=document.documentElement;
 try{r.setAttribute('data-ui',ui);r.setAttribute('data-scheme',sc)}catch(e){}
 try{localStorage.setItem('en_ui',ui);localStorage.setItem('en_scheme',sc)}catch(e){}
 try{if(opt.hc)r.setAttribute('data-hc','1');else r.removeAttribute('data-hc');localStorage.setItem('en_hc',opt.hc?'1':'0')}catch(e){}
 uiLoadFonts(ui);
 return{ui,sc,def};
};
// Gym: rövid rezgés gombnyomásra, ha a készülék tudja és a rezgés nincs kikapcsolva
try{document.addEventListener('pointerdown',e=>{if(document.documentElement.getAttribute('data-ui')!=='gym'||!OPT||!OPT.vib||!navigator.vibrate)return;const t=e.target;if(t&&t.closest&&t.closest('button,[role=button],a'))navigator.vibrate(10)},{passive:true})}catch(e){}
// Felületváltáskor a tartalom rövid belépője (megszakítható: új váltás újraindítja)
let UI_LAST;
const uiSwitchFx=ui=>{
 if(UI_LAST===undefined){UI_LAST=ui;return}
 if(UI_LAST===ui)return;UI_LAST=ui;
 try{const r=document.getElementById('root');if(!r)return;r.classList.remove('ui-switching');void r.offsetWidth;r.classList.add('ui-switching');setTimeout(()=>r.classList.remove('ui-switching'),700)}catch(e){}
};
