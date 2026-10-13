/* ---------- Vendég mód (K1) ----------
   A bejelentkező képernyőn „Folytatás vendégként”: fiók és szinkron nélkül, az adat csak ezen a készüléken (en:guest:* kulcsok).
   A közösségi funkciók és a fotók (Supabase) fiókhoz kötöttek. Fiók létrehozásakor / belépéskor a rendszer felajánlja, hogy a
   vendég-adatot átviszi a fiókba (mergeD, mint a szinkron), vagy külön tartja. A Google-belépés és a handoff érintetlen.
   Terv: docs/UI-IMPLEMENTATION.md 10. fejezet (Vendég mód részletei). Teszt: node tests/guest.check.js. */
const GUEST={id:'guest',email:'',guest:true};
const isGuest=()=>CU==='guest';
const guestOn=()=>{try{return localStorage.getItem('en_guest')==='1'}catch(e){return false}};
const guestPending=()=>{try{return localStorage.getItem('en_guest_pending')==='1'}catch(e){return false}};
// a vendég dokumentuma (ugyanaz a forma, mint a szinkroné), a jelenlegi felhasználó (CU) érintetlen
const guestDoc=()=>{const k=CU;CU='guest';try{return docNow()}finally{CU=k}};
// van-e a vendégnek érdemi adata (edzés, mérés, étel, saját edzés, terv, profil)
const guestHasData=()=>{const d=guestDoc(),p=d.prof||{};
 return (d.hist||[]).length>0||(d.bw||[]).length>0||Object.keys(d.food||{}).length>0||(d.ct||[]).length>0||Object.values((d.plan&&d.plan.days)||{}).some(Boolean)||!!(p.age||p.kg||p.cm||p.tg||(p.fav||[]).length)};
const guestClear=()=>{try{Object.keys(localStorage).filter(x=>x.startsWith('en:guest:')).forEach(x=>localStorage.removeItem(x))}catch(e){}};
// a vendég-adat a fiók helyi tárolójába olvad (mergeD: az edzések uniója, a többi a frissebb), majd a vendég-adat törlődik
const guestMove=uid=>{
 const G=guestDoc(),k=CU;CU=uid;
 try{const M=mergeD(docNow(),G),W={food:'food',ct:'ct',hist:'h',plan:'plan',opt:'opt',prof:'prof',bw:'bw',del:'del',ts:'ts'};
  for(const[a,b]of Object.entries(W))if(M[a]!=null)sj(b,M[a])}
 finally{CU=k}
 guestClear();
};
// a Root figyeli: kilép a vendég módból a bejelentkezőbe, a vendég-adat átvitelének felajánlásával
const guestToAccount=()=>{try{window.dispatchEvent(new Event('guestacct'))}catch(e){}};

// fiókhoz kötött rész vendégnek
function GuestGate(){
 return html`<${KEmpty} ic='people' t='Fiókkal elérhető' s='A közösségi funkciók és a fotók fiókkal érhetők el. Létrehozás után az adataidat átviheted.' a=${html`<${KBtn} onClick=${guestToAccount}>Fiók létrehozása<//>`}/>`;
}
// halk jelzés a Kezdőlapon: csak helyi adat, és a fiók létrehozása
function GuestNote(){
 return html`<${KCard}><p class='k-hint k-mb'>Vendég · csak helyi adat</p><${KBtn} v='sec' sm=${true} onClick=${guestToAccount}>Fiók létrehozása<//><//>`;
}
// belépés után: átviszi-e a vendég-adatot (a döntés után a Root megy tovább az App-ra)
function GuestTransfer({uid,onDone}){
 return html`<div class='k-auth'><div class='up k-auth-in k-stack'>
  <h1 class='k-brand-t'>Átviszed a vendég-adataidat?</h1>
  <p class='k-hint'>A vendégként rögzített edzéseid, terved és beállításaid a fiókodba kerülhetnek. A meglévő adataid megmaradnak, az edzések összeolvadnak.</p>
  <${KBtn} full=${true} onClick=${()=>{guestMove(uid);onDone()}}>Átvitel a fiókba<//>
  <${KBtn} v='sec' full=${true} onClick=${onDone}>Külön tartom<//>
  <p class='k-hint k-center'>Külön tartva a vendég-adat a készüléken marad, és vendégként később is elérhető.</p></div></div>`;
}
