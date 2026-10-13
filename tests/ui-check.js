/* Böngészőben futó elrendezés-ellenőrző (a docs/mockups/eszkoz/check_overflow.py logikájának portja, Python nélkül).
   Használat: a böngésző konzolján (vagy a fejlesztői panelből) futtasd le ezt a fájlt, majd: uiCheck()
   Visszaad egy listát: kilógó elem (jobbra/balra), levágott szöveg, két sorra tört szó, vízszintes görgetés.
   Függőleges görgetés nem hiba: az app oldala görög. Három szélességen kell lefuttatni: 360, 390, 430 px. */
window.uiCheck=function(root){
  root=root||document.getElementById('root');
  const VW=document.documentElement.clientWidth,out=[],flagged=new Set();
  if(document.documentElement.scrollWidth>VW+1)out.push('vízszintes görgetés: '+document.documentElement.scrollWidth+'>'+VW);
  for(const el of root.querySelectorAll('*')){
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden')continue;
    const r=el.getBoundingClientRect();
    if(r.width===0&&r.height===0)continue;
    if(el.closest('[aria-hidden="true"]')&&el.closest('.ui-sw-shot'))continue; // a kicsinyített előnézetek belseje díszítés
    if(r.right<-100||r.left>VW+100)continue; // szándékosan képernyőn kívüli (sr-only, kiúszó lap)
    if(el.parentElement&&el.parentElement.closest('.overflow-x-auto,[data-hscroll]'))continue; // vízszintesen görgethető sor: a kilógás szándékos
    let p=el.parentElement,pf=false;while(p&&p!==root){if(flagged.has(p)){pf=true;break}p=p.parentElement}
    const label=el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+' "'+(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,40)+'"';
    const issues=[];
    if(r.right>VW+0.5)issues.push('kilóg jobbra '+Math.round(r.right-VW)+'px');
    if(r.left<-0.5)issues.push('kilóg balra '+Math.round(-r.left)+'px');
    const own=el.children.length===0&&(el.textContent||'').trim()&&!el.closest('svg');
    if(own&&el.scrollWidth>el.clientWidth+1)issues.push('szöveg szélesebb a dobozánál ('+el.scrollWidth+'>'+el.clientWidth+')');
    if(issues.length&&!pf){flagged.add(el);out.push(label+': '+issues.join(', '))}
  }
  // szavak, amelyek két sorra törtek
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while((n=walker.nextNode())){
    if(n.parentElement.closest('svg,script,style,[aria-hidden="true"]'))continue;
    const re=/\S+/g;let m;
    while((m=re.exec(n.textContent))){
      if(m[0].length<3)continue;
      const range=document.createRange();range.setStart(n,m.index);range.setEnd(n,m.index+m[0].length);
      const tops=new Set(Array.from(range.getClientRects()).filter(x=>x.width>0).map(x=>Math.round(x.top)));
      if(tops.size>1)out.push('szó két sorra tört: "'+m[0]+'"');
    }
  }
  return out;
};
