/* ---------- Közös elemkészlet (Pro, Gym, Family): a kinézetet a css/ui-kit.css adja, ez csak a szerkezet ----------
   Szövegek: a gyerek-szövegek és a l/t/s tulajdonságok a tr()-en mennek át, az új magyar feliratokhoz angol fordítás kell a setDict-ben.
   Nincs props-szórás a sablonban; a stílus objektum. A régi Cd, Lb, Sw, Sg, F, Sl, R ezekre épül (settings.js, util.js). */
const kc=(...a)=>a.filter(Boolean).join(' ');
// szakasz: cím + jobb oldali művelet + tartalom
function KSec({t,a,c,children}){return html`<section class=${kc('k-sec',c)}>${(t||a)&&html`<div class='k-sec-h'><h2 class='k-sec-t'>${t}</h2>${a}</div>`}${children}</section>`}
// kártya; onClick esetén gomb
function KCard({on,onClick,c,children}){const cl=kc('up k-card',on&&'on',c);return onClick?html`<button type='button' class=${cl} onClick=${onClick}>${children}</button>`:html`<div class=${cl}>${children}</div>`}
// listasor: ic = UiIco neve, t cím, s alcím, r jobb oldali érték, go = nyíl
function KRow({ic,t,s,r,go,onClick,c}){
 const b=html`${ic&&html`<span class='k-row-ic'><${UiIco} n=${ic} s=${22}/></span>`}<span class='k-row-tx'><span class='k-row-t'>${t}</span>${s&&html`<span class='k-row-s'>${s}</span>`}</span>${r!=null&&r!==''&&html`<span class='k-row-r'>${r}</span>`}${go&&html`<span class='k-chev' aria-hidden='true'><${UiIco} n='back' s=${18}/></span>`}`;
 return onClick?html`<button type='button' class=${kc('k-row',c)} onClick=${onClick}>${b}</button>`:html`<div class=${kc('k-row',c)}>${b}</div>`}
// v: pri (alap) | sec | gho | dan
function KBtn({v='pri',onClick,disabled,full,sm,ic,c,label,children}){return html`<button type='button' class=${kc('k-btn',v,full&&'full',sm&&'sm',c)} disabled=${disabled} aria-label=${label} onClick=${onClick}>${ic&&html`<${UiIco} n=${ic} s=${20}/>`}${children}</button>`}
// számmező címkével és mértékegységgel
function KField({l,v,on,u,type='number',ph,c}){return html`<label class=${kc('k-fld',c)}>${l&&html`<span class='k-fld-l'>${l}</span>`}<span class=${kc('k-fld-w',!u&&'x')}><input type=${type} inputMode=${type==='number'?'decimal':null} class='k-in' value=${v} placeholder=${ph?tr(ph):null} onChange=${e=>on(e.target.value)}/>${u&&html`<span class='k-fld-u'>${u}</span>`}</span></label>`}
function KSel({l,v,on,o,c}){return html`<label class=${kc('k-fld',c)}>${l&&html`<span class='k-fld-l'>${l}</span>`}<select class='k-in' value=${v} onChange=${e=>on(e.target.value)}>${o.map(([a,b])=>html`<option key=${a} value=${a}>${b}</option>`)}</select></label>`}
// szegmentált váltó: o = [[érték, felirat], ...]
function KSeg({v,on,o,l}){return html`<div class='k-seg' role='group' aria-label=${l?tr(l):null}>${o.map(([a,b])=>html`<button key=${a} type='button' aria-pressed=${String(v)===String(a)} onClick=${()=>on(a)}>${b}</button>`)}</div>`}
function KSw({l,s,v,on}){return html`<button type='button' role='switch' aria-checked=${!!v} class='k-sw' onClick=${()=>on(!v)}><span class='k-sw-tx'><span class='k-sw-t'>${l}</span>${s&&html`<span class='k-sw-s'>${s}</span>`}</span><span class='k-sw-tr' aria-hidden='true'><span class='k-sw-th'></span></span></button>`}
// statisztika-csempe: a szám felszámlálással jön be
function KStat({l,v,u,s}){return html`<div class='up k-stat'><div class='k-stat-v'>${typeof v==='number'?html`<${Cnt} to=${v}/>`:v}${u&&html`<span class='k-stat-u'>${u}</span>`}</div><div class='k-stat-l'>${l}</div>${s&&html`<div class='k-stat-s'>${s}</div>`}</div>`}
function KChip({on,onClick,children}){return html`<button type='button' class='k-chip' aria-pressed=${!!on} onClick=${onClick}>${children}</button>`}
function KTabs({v,on,o}){return html`<div class='k-tabs' role='tablist'>${o.map(([a,b])=>html`<button key=${a} type='button' role='tab' aria-selected=${String(v)===String(a)} onClick=${()=>on(a)}>${b}</button>`)}</div>`}
// üres állapot: ikon, cím, magyarázat, egy gomb
function KEmpty({ic='dumbbell',t,s,a}){return html`<div class='up k-empty'><span class='k-empty-ic'><${UiIco} n=${ic} s=${40}/></span><div class='k-empty-t'>${t}</div>${s&&html`<div class='k-empty-s'>${s}</div>`}${a}</div>`}
// töltés a képernyőn belül (az irányhoz illő animációval); hosszabb műveletnél ezt tedd a lista helyére
function KBusy({t='Egy pillanat…',s}){return html`<div class='k-busy' role='status' aria-live='polite'><div class='k-busy-a' aria-hidden='true'><i></i><i></i><i></i></div><div class='k-busy-t'>${t}</div>${s&&html`<div class='k-busy-s'>${s}</div>`}</div>`}
