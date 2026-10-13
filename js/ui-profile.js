/* ---------- Profil: személyes adatok és napi célok (Menü: "Adatok és célok") ----------
   Ugyanazt a `prof` tárolót használja, mint a Kardió/Kalória számolók profilkártyája és az Étel fül (tg = napi cél), ezért szinkronban vannak. */
function Profile({user,go,out}){
 const[p,setP]=useState(()=>gj('prof',{sex:'m',age:'',cm:'',kg:'',bf:''}));
 useEffect(()=>sjt('prof',p),[p]);
 const sp=o=>setP(x=>({...x,...o})),tg=p.tg||{k:2200,p:150,c:250,f:70},st=o=>sp({tg:{...tg,...o}});
 const kg=+p.kg,cm=+p.cm,bmi=kg>0&&cm>0?kg/Math.pow(cm/100,2):0,mk=Math.round(tg.p*4+tg.c*4+tg.f*9),off=tg.k>0&&Math.abs(mk-tg.k)/tg.k>.06;
 // a Nő kiválasztása után a ciklus-követés felajánlása (cycle.js)
 const sex=x=>{sp({sex:x,sexSel:true});if(x==='f'&&!cycGet().on)window.dispatchEvent(new Event('cycprompt'))};
 const num=(k)=>x=>st({[k]:Math.max(0,Math.round(+x||0))});
 return html`<div>
  
  <${Cd} t='Adatok'>
   <div class='mb-3'><${Sg} v=${p.sex} on=${sex} o=${[['m','Férfi'],['f','Nő']]}/></div>
   <div class='k-g2'><${F} l='Életkor' u='év' v=${p.age} on=${x=>sp({age:x})}/><${F} l='Magasság' u='cm' v=${p.cm} on=${x=>sp({cm:x})}/><${F} l='Testsúly' u='kg' v=${p.kg} on=${x=>sp({kg:x})}/><${F} l='Testzsír (opcionális)' u='%' v=${p.bf} on=${x=>sp({bf:x})}/></div>
   ${bmi>0&&html`<div class='k-tr2 k-tr' style=${{marginTop:'12px'}}><span>BMI</span><b class='k-pr'>${bmi.toFixed(1)}</b></div>`}
  <//>
  <${Cd} t='Napi célok'>
   <div class='k-g2'><${F} l='Kalória' u='kcal' v=${tg.k} on=${num('k')}/><${F} l='Fehérje' u='g' v=${tg.p} on=${num('p')}/><${F} l='Szénhidrát' u='g' v=${tg.c} on=${num('c')}/><${F} l='Zsír' u='g' v=${tg.f} on=${num('f')}/></div>
   <div class='k-hint'>${LANG==='en'?'The macros add up to '+mk+' kcal.':'A makrók összesen '+mk+' kcal-t adnak.'}</div>
   ${off&&html`<div class='k-hint k-warn'>A makrók és a kalória-cél eltér.</div>`}
   <button onClick=${()=>go('tools','k')} class='k-btn sec sm full k-mt'>Célok kiszámolása a Kalória számolóban</button>
  <//>
  <${Cd} t='Fiók'>
   <div class='text-sm break-all'>${(SESS&&SESS.user&&SESS.user.email)||user}</div>
   <button onClick=${()=>go('social')} class='k-btn sec sm full k-mt'>Közösségi profil</button>
   <button onClick=${out} class='k-btn dan sm full k-mt'>Kilépés</button>
  <//>
 </div>`;
}
