/* ---------- Profil: személyes adatok és napi célok (Menü: "Adatok és célok") ----------
   Ugyanazt a `prof` tárolót használja, mint a Kardió/Kalória számolók profilkártyája és az Étel fül (tg = napi cél), ezért szinkronban vannak. */
function Profile({user,go}){
 const[p,setP]=useState(()=>gj('prof',{sex:'m',age:'',cm:'',kg:'',bf:''}));
 useEffect(()=>sjt('prof',p),[p]);
 const sp=o=>setP(x=>({...x,...o})),tg=p.tg||{k:2200,p:150,c:250,f:70},st=o=>sp({tg:{...tg,...o}});
 const kg=+p.kg,cm=+p.cm,bmi=kg>0&&cm>0?kg/Math.pow(cm/100,2):0,mk=Math.round(tg.p*4+tg.c*4+tg.f*9),off=tg.k>0&&Math.abs(mk-tg.k)/tg.k>.06;
 // a Nő kiválasztása után a ciklus-követés felajánlása (cycle.js)
 const sex=x=>{sp({sex:x,sexSel:true});if(x==='f'&&!cycGet().on)window.dispatchEvent(new Event('cycprompt'))};
 const num=(k)=>x=>st({[k]:Math.max(0,Math.round(+x||0))});
 return html`<div>
  <h1 class='fd text-4xl font-bold mb-4'>Profil</h1>
  <${Cd} t='Adatok'>
   <div class='mb-3'><${Sg} v=${p.sex} on=${sex} o=${[['m','Férfi'],['f','Nő']]}/></div>
   <div class='grid grid-cols-2 gap-2'><${F} l='Életkor' u='év' v=${p.age} on=${x=>sp({age:x})}/><${F} l='Magasság' u='cm' v=${p.cm} on=${x=>sp({cm:x})}/><${F} l='Testsúly' u='kg' v=${p.kg} on=${x=>sp({kg:x})}/><${F} l='Testzsír (opcionális)' u='%' v=${p.bf} on=${x=>sp({bf:x})}/></div>
   ${bmi>0&&html`<div class='flex justify-between text-sm mt-3 pt-3 border-t border-zinc-800'><span class='text-zinc-400'>BMI</span><span class='fd text-xl font-bold'>${bmi.toFixed(1)}</span></div>`}
  <//>
  <${Cd} t='Napi célok'>
   <div class='grid grid-cols-2 gap-2'><${F} l='Kalória' u='kcal' v=${tg.k} on=${num('k')}/><${F} l='Fehérje' u='g' v=${tg.p} on=${num('p')}/><${F} l='Szénhidrát' u='g' v=${tg.c} on=${num('c')}/><${F} l='Zsír' u='g' v=${tg.f} on=${num('f')}/></div>
   <div class='text-xs text-zinc-400 mt-3'>${LANG==='en'?'The macros add up to '+mk+' kcal.':'A makrók összesen '+mk+' kcal-t adnak.'}</div>
   ${off&&html`<div class='text-xs text-amber-400 mt-1'>A makrók és a kalória-cél eltér.</div>`}
   <button onClick=${()=>go('tools','k')} class='w-full h-11 rounded-xl bg-zinc-800 text-sm font-semibold mt-3'>Célok kiszámolása a Kalória számolóban</button>
  <//>
  <${Cd} t='Fiók'>
   <div class='text-sm break-all'>${(SESS&&SESS.user&&SESS.user.email)||user}</div>
   <button onClick=${()=>go('social')} class='w-full h-11 rounded-xl bg-zinc-800 text-sm font-semibold mt-3'>Közösségi profil</button>
  <//>
 </div>`;
}
