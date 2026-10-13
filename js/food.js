const FOODS='Csirkemell (nyers):120,22.5,0,2.6;Csirkemell (sült):165,31,0,3.6;Tojás:143,12.6,0.7,9.5;Tojásfehérje:52,11,0.7,0.2;Rizs (főtt):130,2.7,28,0.3;Burgonya (főtt):87,1.9,20,0.1;Édesburgonya:86,1.6,20,0.1;Tészta (főtt):158,5.8,31,0.9;Zabpehely:372,13.5,60,7;Teljes kiőrlésű kenyér:247,13,41,4.2;Banán:89,1.1,23,0.3;Alma:52,0.3,14,0.2;Áfonya:57,0.7,14,0.3;Avokádó:160,2,9,15;Brokkoli:34,2.8,7,0.4;Spenót:23,2.9,3.6,0.4;Paradicsom:18,0.9,3.9,0.2;Görög joghurt (0%):59,10,3.6,0.4;Túró (sovány):98,12,3.5,4.3;Tej (2,8%):60,3.2,4.8,2.8;Sajt (edami):357,25,1.4,28;Tonhal (konzerv):116,26,0,1;Lazac:208,20,0,13;Marhahús (sovány):158,26,0,5.5;Darált pulyka:148,20,0,7;Mogyoróvaj:588,25,20,50;Mandula:579,21,22,50;Olívaolaj:884,0,0,100;Fehérjepor (whey):390,78,8,6;Étcsokoládé:546,5,61,31';
const FD=FOODS.split(';').map(x=>{const[n,v]=x.split(':'),[k,p,c,f]=v.split(',').map(Number);return{n,k,p,c,f}});
const MEALS=['Reggeli','Ebéd','Vacsora','Snack'];
const MR=({l,v,m,c})=>html`<div class='k-mr'><${Ring} v=${v} max=${m} col=${c} s=${64} w=${7}><div class='k-mr-v'>${Math.round(v)}</div><//><div class='k-mr-l'>${l}</div><div class='k-mr-s'>/ ${m} g</div></div>`;
function Food({init}){
 const[f,setF]=useState(()=>gj('food',{})),[fav,setFav0]=useState(()=>gj('prof',{}).fav||[]),[ft,setFt]=useState('s'),[d,setD]=useState(dk(new Date())),[ad,setAd]=useState(null),[q,setQ]=useState(''),[gm,setGm]=useState(100),[ch,setCh]=useState(null),[cu,setCu]=useState({n:'',k:'',p:'',c:'',f:''}),[sub,setSub]=useState(init==='rec'?'rec':'log'),[rcp,setRcp]=useState(null),[diet,setDiet0]=useState(()=>gj('rdiet',[])),[fitF,setFitF]=useState(false);
 useEffect(()=>sjt('food',f),[f]);
 const setDiet=v=>{setDiet0(v);sj('rdiet',v)};
 const P2=gj('prof',{}),tg=P2.tg||{k:2200,p:150,c:250,f:70},day=f[d]||{e:[],w:0},e=day.e,sum=e.reduce((a,x)=>({k:a.k+x.k,p:a.p+x.p,c:a.c+x.c,f:a.f+x.f}),{k:0,p:0,c:0,f:0});
 const upd=fn=>setF(o=>({...o,[d]:fn(o[d]||{e:[],w:0})}));
 // hátralévő keret a napi célból; recept hozzáadása a naplóhoz
 const rem={k:Math.max(0,tg.k-sum.k),p:Math.max(0,tg.p-sum.p),c:Math.max(0,tg.c-sum.c),f:Math.max(0,tg.f-sum.f)},ok=r=>diet.every(k=>recTags(r)[k]);
 const addRec=(mi,name,m)=>{upd(x=>({...x,e:[...x.e,{id:Date.now(),m:mi,n:name,k:Math.round(m.k),p:Math.round(m.p*10)/10,c:Math.round(m.c*10)/10,f:Math.round(m.f*10)/10,g:0}]}));setRcp(null);toast('Hozzáadva a naplóhoz')};
 const put=(n,k,p,c,fa,g)=>{upd(x=>({...x,e:[...x.e,{id:Date.now(),m:ad,n,k:Math.round(k),p:Math.round(p*10)/10,c:Math.round(c*10)/10,f:Math.round(fa*10)/10,g}]}));setAd(null);setQ('');setCh(null);setCu({n:'',k:'',p:'',c:'',f:''})};
 // kedvencek: ugyanaz a név, kalória és mennyiség = ugyanaz a tétel; a prof szinkronizált dokumentum
 const setFav=v=>{setFav0(v);sjt('prof',{...gj('prof',{}),fav:v})},fk=x=>x.n+'|'+x.k+'|'+(x.g||0),isFav=x=>fav.some(y=>fk(y)===fk(x));
 const togFav=x=>{if(isFav(x))setFav(fav.filter(y=>fk(y)!==fk(x)));else setFav([{n:x.n,k:x.k,p:x.p,c:x.c,f:x.f,g:x.g||0},...fav].slice(0,60))};
 const shift=n=>{const x=pd(d);x.setDate(x.getDate()+n);setD(dk(x))};
 const wt=+P2.kg?Math.round(+P2.kg*35/250)*250:2500,days7=Array.from({length:7},(_,i)=>{const x=pd(d);x.setDate(x.getDate()-6+i);const k=dk(x);return f[k]?f[k].e.reduce((a,y)=>a+y.k,0):0}),labs=Array.from({length:7},(_,i)=>{const x=pd(d);x.setDate(x.getDate()-6+i);return(LANG==='en'?['S','M','T','W','T','F','S']:DN)[x.getDay()]});
 const rec=[...new Set(Object.values(f).flatMap(o=>o.e.map(y=>y.n)).reverse())].slice(0,6),ql=q.toLowerCase(),fl=FD.filter(x=>x.n.toLowerCase().includes(ql)||tr(x.n).toLowerCase().includes(ql)).slice(0,30);
 const fi=(l,k,u)=>html`<${F} l=${l} u=${u} type=${k==='n'?'text':'number'} v=${cu[k]} on=${x=>setCu(o=>({...o,[k]:x}))}/>`;
 return html`<div>
  <div class='k-datenav'><button type='button' class='k-ib' aria-label=${tr('Előző nap')} onClick=${()=>shift(-1)}><${UiIco} n='back' s=${20}/></button><span class='k-datenav-t'>${d===dk(new Date())?'Ma':fs(d)}</span><button type='button' class='k-ib k-flip' aria-label=${tr('Következő nap')} onClick=${()=>shift(1)}><${UiIco} n='back' s=${20}/></button></div>
  ${lvlOn('recipes.list',sub==='rec'||init==='rec')&&html`<${KTabs} v=${sub} on=${setSub} o=${[['log','Napló'],['rec','Receptek']]}/>`}
  ${sub==='rec'?html`<${Recipes} rem=${rem} diet=${diet} setDiet=${setDiet} open=${setRcp} fit=${fitF} setFit=${setFitF}/>`:html`<div>
  <${HelpCalm} id='food.log'/>
  <${KCard}><div class='k-fsum'>
   <${Ring} v=${sum.k} max=${tg.k} col='rgb(var(--ui-accent))' s=${120} w=${11}><div class='k-fsum-v'>${Math.round(Math.max(0,tg.k-sum.k))}</div><div class='k-fsum-l'>kcal maradt</div><//>
   <div class='k-macros'><${MR} l='Fehérje' v=${sum.p} m=${tg.p} c='rgb(var(--ui-accent))'/><${MR} l='Szénhidrát' v=${sum.c} m=${tg.c} c='rgb(var(--ui-text))'/><${MR} l='Zsír' v=${sum.f} m=${tg.f} c='rgb(var(--ui-muted))'/></div></div>
   <div class='k-hint k-center'>${Math.round(sum.k)} / ${tg.k} kcal${!P2.tg?' (alap cél: a Kalória számolóban állíthatod be)':''}</div><//>
  ${lvlOn('food.suggest')&&html`<${Sugg} rem=${rem} ok=${ok} open=${setRcp} all=${()=>{setFitF(true);setSub('rec')}}/>`}
  ${lvlOn('food.water')&&html`<${KCard}><div class='k-wh' style=${{alignItems:'center',marginBottom:0}}><span class='k-water-t'><${UiIco} n='drop' s=${22}/>Víz</span><${KStep} v=${day.w||0} min=${0} step=${250} lab=${(day.w||0)+' / '+wt+' ml'} on=${nv=>{upd(x=>({...x,w:nv}));if(nv>(day.w||0))buzz()}}/></div>
   <div class='k-bar-tr k-mt'><div class='k-bar-f' style=${{'--p':Math.min(1,(day.w||0)/wt)}}></div></div><//>`}
  <div class='ui-stagger'>${MEALS.map((mn,mi)=>{const es=e.filter(x=>x.m===mi);return html`<${KCard} key=${mi}>
   <div class='k-wh' style=${{alignItems:'center',marginBottom:es.length?'4px':0}}><div class='k-wh-tx'><div class='k-wh-t'>${mn}</div><div class='k-row-s'>${Math.round(es.reduce((a,x)=>a+x.k,0))} kcal</div></div><${KBtn} sm=${true} ic='plus' onClick=${()=>setAd(mi)}>Hozzáadás<//></div>
   <div class='k-list'>${es.map(x=>html`<div key=${x.id} class='k-row'><span class='k-row-tx'><span class='k-row-t'>${x.n}</span><span class='k-row-s'>${x.g?x.g+' g · ':''}P ${x.p} · C ${x.c} · F ${x.f}</span></span><span class='k-row-r'>${x.k} kcal</span><button type='button' class='k-ib' aria-pressed=${isFav(x)} aria-label=${tr(isFav(x)?'Eltávolítás a kedvencekből':'Mentés kedvencnek')} onClick=${()=>togFav(x)}><${UiIco} n='star' s=${20} f=${isFav(x)}/></button><${KDel} on=${()=>upd(o=>({...o,e:o.e.filter(y=>y.id!==x.id)}))}/></div>`)}</div><//>`})}</div>
  ${lvlOn('food.week')&&html`<${KSec} t='Kalória, utolsó 7 nap'><${KCard}><${Bars} vals=${days7} labels=${labs}/><//><//>`}
  ${ad!==null&&html`<${KSheet} t=${MEALS[ad]} onClose=${()=>setAd(null)}>
   ${ch?html`<div class='up'><div class='k-cd-t'>${ch.n}</div><${F} l='Mennyiség' u='g' v=${gm} on=${x=>setGm(+x||0)}/><div class='k-hint' style=${{margin:'12px 0'}}>${Math.round(ch.k*gm/100)} kcal · P ${(ch.p*gm/100).toFixed(1)} · C ${(ch.c*gm/100).toFixed(1)} · F ${(ch.f*gm/100).toFixed(1)}</div><div class='k-btns'><${KBtn} v='sec' onClick=${()=>setCh(null)}>Vissza<//><${KBtn} onClick=${()=>put(ch.n,ch.k*gm/100,ch.p*gm/100,ch.c*gm/100,ch.f*gm/100,gm)}>Hozzáadás<//></div></div>`:html`<div>
    <${KTabs} v=${ft} on=${setFt} o=${[['s','Keresés'],['f','Kedvencek']]}/>
    ${ft==='f'?html`<div>${fav.length?html`<div class='k-list ui-stagger'>${fav.map(x=>html`<div key=${fk(x)} class='k-row'><button type='button' class='k-row-main' onClick=${()=>put(x.n,x.k,x.p,x.c,x.f,x.g)}><span class='k-row-t'>${x.n}</span><span class='k-row-s'>${x.g?x.g+' g · ':''}P ${x.p} · C ${x.c} · F ${x.f}</span></button><span class='k-row-r'>${x.k} kcal</span><${KDel} label='Eltávolítás a kedvencekből' on=${()=>togFav(x)}/></div>`)}</div>`:html`<${KEmpty} ic='star' t='Még nincs kedvenc étel' s='A naplóban a csillaggal menthetsz el egy tételt, és itt egy koppintással újra hozzáadhatod.'/>`}</div>`:html`<div>
    <input value=${q} onChange=${x=>setQ(x.target.value)} placeholder='Keresés az ételek között' class='k-in' style=${{marginBottom:'12px'}}/>
    ${!q&&rec.length>0&&html`<div class='k-chips sc'>${rec.map(n=>{const o=FD.find(z=>z.n===n);return o?html`<${KChip} key=${n} onClick=${()=>{setCh(o);setGm(100)}}>${n}<//>`:null})}</div>`}
    <div class='k-list'>${fl.map(x=>html`<${KRow} key=${x.n} t=${x.n} r=${html`${x.k} kcal / 100 g`} onClick=${()=>{setCh(x);setGm(100)}}/>`)}</div>
    <${KSec} t='Saját tétel' c='k-mt'><div class='k-g2'><div class='k-span2'>${fi('Név','n','')}</div>${fi('Kalória','k','kcal')}${fi('Fehérje','p','g')}${fi('Szénhidrát','c','g')}${fi('Zsír','f','g')}</div>
    <${KBtn} full=${true} c='k-mt' onClick=${()=>{if(cu.n.trim()&&+cu.k)put(cu.n.trim(),+cu.k,+cu.p||0,+cu.c||0,+cu.f||0,0)}}>Hozzáadás<//><//></div>`}</div>`}<//>`}</div>`}
  ${rcp&&html`<${RecSheet} key=${rcp.id} r=${rcp} onClose=${()=>setRcp(null)} add=${addRec}/>`}</div>`;
}
