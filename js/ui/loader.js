/* ---------- Töltőképernyő: Pro (kirajzolódó vonal), Gym (becsúszó tárcsák), Family (lélegző kör) ----------
   Mockupok: docs/mockups/forras/ProLoader, GymLoader, FamilyLoader. Új eszközön az első szinkronig látszik, ha még nincs helyi adat. */
function UiLoader({out}){
 const ui=uiState(OPT).ui,B=()=>html`<div class='ui-ldr-t'>${ui==='gym'?html`<span class='ldr-gt'>${tr('Betöltés')}</span><span class='ldr-gs'>${tr('Tárcsák felrakása')}</span>`:ui==='family'?html`<span class='ldr-ft'>${tr('Egy pillanat…')}</span><span class='ldr-fs'>${tr('Betöltjük az adataidat.')}</span>`:html`<span class='ldr-pt'>Edzésnapló</span><span class='ldr-ps'>${tr('Adatok szinkronizálása')}</span>`}</div>`;
 return html`<div class=${'ui-ldr ui-ldr-'+ui} role='status' aria-live='polite'>
  ${ui==='gym'&&html`<div class='ui-stripe ldr-st' aria-hidden='true'></div>`}
  <div class='ui-ldr-in'>${ui==='gym'?html`<svg width='350' height='120' viewBox='0 0 350 120' class='ldr-gsvg' aria-hidden='true'><rect x='0' y='57' width='350' height='6' fill='#8A8780'/><rect x='120' y='55' width='110' height='10' fill='#6E6B65'/><rect x='104' y='48' width='8' height='24' fill='#B9B5AC'/><rect x='238' y='48' width='8' height='24' fill='#B9B5AC'/>
    <rect class='gl gl-l1' x='84' y='8' width='18' height='104' fill='#D7372B'/><rect class='gl gl-l2' x='66' y='12' width='16' height='96' fill='#2F62D0'/><rect class='gl gl-l3' x='52' y='30' width='12' height='60' fill='#2E9E5B'/>
    <rect class='gl gl-r1' x='248' y='8' width='18' height='104' fill='#D7372B'/><rect class='gl gl-r2' x='268' y='12' width='16' height='96' fill='#2F62D0'/><rect class='gl gl-r3' x='286' y='30' width='12' height='60' fill='#2E9E5B'/></svg>`
   :ui==='family'?html`<div class='ldr-fc' aria-hidden='true'><div class='ldr-halo'></div><div class='ldr-breath'></div></div>`
   :html`<svg width='300' height='140' viewBox='0 0 300 140' class='ldr-psvg' aria-hidden='true'><line x1='0' y1='130' x2='300' y2='130' class='ph-g1'/><line x1='0' y1='90' x2='300' y2='90' class='ph-g2'/><line x1='0' y1='50' x2='300' y2='50' class='ph-g2'/><line x1='0' y1='10' x2='300' y2='10' class='ph-g2'/>
    <polyline class='ldr-pdraw' points='4,118 46,100 88,106 130,80 172,88 214,56 256,48 296,22' fill='none'/><circle class='ldr-pdot' cx='296' cy='22' r='5'/></svg>`}
   <${B}/></div>
  ${ui==='gym'&&html`<div class='ui-stripe ldr-st' aria-hidden='true'></div>`}</div>`;
}
