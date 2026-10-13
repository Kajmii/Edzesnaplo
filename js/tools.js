const CARDIO=[{n:'Futópad (gyaloglás / futás)',t:1},{n:'Szobabicikli',m:[4,6.8,8.8]},{n:'Elliptikus tréner',m:[4.6,5.7,7.8]},{n:'Evezőgép',m:[4.8,7,8.5]},{n:'Lépcsőzőgép (Stairmaster)',m:[5,8.8,9.4]},{n:'Légbicikli (Assault Bike)',m:[6,10,14]},{n:'SkiErg',m:[5,7,9]},{n:'Ugrókötél',m:[8.8,11.8,12.3]},{n:'Úszás',m:[5.8,8.3,9.8]},{n:'Országúti kerékpár',m:[4,8,12]},{n:'HIIT / körkörös edzés',m:[6,8,12]},{n:'Súlyzós edzés (általános)',m:[3.5,5,6]}];
function Tools({init}){
 const[v,setV]=useState(init||'c'),[p,setP]=useState(()=>gj('prof',{sex:'m',age:'',cm:'',kg:'',bf:''})),
  [c,setC]=useState({a:0,min:30,i:1,sp:8,gr:1,hr:''}),[k,setK]=useState({f:'mif',act:1.55,goal:'keep',rate:.5,pg:2,fp:28,tw:''});
 useEffect(()=>sjt('prof',p),[p]);
 const sp=(o)=>setP(x=>({...x,...o})),sc=o=>setC(x=>({...x,...o})),sk=o=>setK(x=>({...x,...o}));
 const kg=+p.kg,age=+p.age,cm=+p.cm,bf=+p.bf,m=p.sex==='m';
 const prof=html`<${KSec} t='Profil'><${KCard}>
  <div class='k-mb'><${Sg} v=${p.sex} on=${x=>{sp({sex:x,sexSel:true});if(x==='f'&&!cycGet().on)window.dispatchEvent(new Event('cycprompt'))}} o=${[['m','Férfi'],['f','Nő']]}/></div>
  <div class='k-g2'><${F} l='Életkor' u='év' v=${p.age} on=${x=>sp({age:x})}/><${F} l='Magasság' u='cm' v=${p.cm} on=${x=>sp({cm:x})}/><${F} l='Testsúly' u='kg' v=${p.kg} on=${x=>sp({kg:x})}/><${F} l='Testzsír (opcionális)' u='%' v=${p.bf} on=${x=>sp({bf:x})}/></div><//><//>`;
 let out;
 if(v==='c'){
  const a=CARDIO[c.a],min=+c.min||0;let met;
  if(a.t){const S=c.sp*1000/60,g=(+c.gr||0)/100,vo=c.sp>=7?.2*S+.9*S*g+3.5:.1*S+1.8*S*g+3.5;met=vo/3.5}else met=a.m[c.i];
  const gross=met*kg*min/60,net=(met-1)*kg*min/60,hr=+c.hr,kt=hr&&age?Math.max(0,(m?-55.0969+.6309*hr+.1988*kg+.2017*age:-20.4022+.4472*hr-.1263*kg+.074*age)/4.184*min):0,zn=hr&&age?hr/(208-.7*age)*100:0,ff=met<4?.6:met<7?.45:.3;
  out=html`<div class='k-stack'>
   <${Sl} l='Gyakorlat' v=${c.a} on=${x=>sc({a:+x})} o=${CARDIO.map((x,i)=>[i,x.n])}/>
   ${a.t?html`<div class='k-g2'><${F} l='Sebesség' u='km/h' v=${c.sp} on=${x=>sc({sp:x})}/><${F} l='Emelkedés' u='%' v=${c.gr} on=${x=>sc({gr:x})}/></div>`:html`<${Sg} v=${c.i} on=${x=>sc({i:x})} o=${[[0,'Könnyű'],[1,'Közepes'],[2,'Erős']]}/>`}
   <div class='k-g2'><${F} l='Időtartam' u='perc' v=${c.min} on=${x=>sc({min:x})}/><${F} l='Átlagpulzus (opcionális)' u='bpm' v=${c.hr} on=${x=>sc({hr:x})}/></div>
   ${kg>0&&min>0?html`<div class='k-stats'>
    <${R} l='Elégetett kalória' v=${gross} u='kcal' s='MET-alapú, bruttó'/><${R} l='Nettó többlet' v=${net} u='kcal' s='nyugalmi égés nélkül'/>
    <${R} l='Kalória / perc' v=${(gross/min).toFixed(1)} u='kcal'/><${R} l='Intenzitás' v=${met.toFixed(1)} u='MET'/>
    ${a.t&&html`<${R} l='Távolság' v=${(c.sp*min/60).toFixed(2)} u='km'/><${R} l='Tempó' v=${c.sp>0?Math.floor(60/c.sp)+':'+pad(Math.round(60/c.sp%1*60)%60):'-'} u='perc/km'/>`}
    ${kt>0&&html`<${R} l='Pulzus-alapú becslés' v=${kt} u='kcal' s='Keytel-képlet'/>`}
    ${zn>0&&html`<${R} l='Pulzuszóna' v=${Math.round(zn)} u='% HRmax' s=${zn<60?'bemelegítő':zn<70?'zsírégető':zn<80?'aerob':zn<90?'küszöb':'maximális'}/>`}
    <${R} l='Zsírból fedezett' v=${net*ff/9} u='g' s='durva becslés'/></div>`:html`<p class='k-hint'>Add meg a testsúlyod a profilban és az időtartamot.</p>`}</div>`;
 }else{
  const lbm=kg*(1-bf/100),fb=(k.f==='km'||k.f==='cun')&&!bf,f=fb?'mif':k.f;
  const bmr=f==='mif'?10*kg+6.25*cm-5*age+(m?5:-161):f==='hb'?(m?88.362+13.397*kg+4.799*cm-5.677*age:447.593+9.247*kg+3.098*cm-4.33*age):f==='km'?370+21.6*lbm:500+22*lbm;
  const tdee=bmr*k.act,sgn=k.goal==='cut'?-1:k.goal==='bulk'?1:0,adj=sgn*k.rate*7700/7,tg=tdee+adj,min=m?1500:1200;
  const pr=k.pg*kg,fat=tg*k.fp/100/9,ch=Math.max(0,(tg-pr*4-fat*9)/4),bmi=kg/Math.pow(cm/100,2),dw=Math.abs(kg-(+k.tw||kg)),ok=kg>0&&cm>0&&age>0;
  out=html`<div class='k-stack'>
   <div class='k-g2'><div class='k-span2'><${Sl} l='BMR képlet' v=${k.f} on=${x=>sk({f:x})} o=${[['mif','Mifflin-St Jeor'],['hb','Harris-Benedict'],['km','Katch-McArdle'],['cun','Cunningham']]}/></div><div class='k-span2'><${Act} v=${k.act} on=${x=>sk({act:+x})}/></div></div>
   ${fb&&html`<p class='k-hint k-warn'>Ehhez a képlethez testzsír% kell, addig Mifflin-St Jeor számol.</p>`}
   <${Sg} v=${k.goal} on=${x=>sk({goal:x})} o=${[['cut','Fogyás'],['keep','Szinten'],['bulk','Tömeg']]}/>
   <div class='k-g2'>${sgn!==0&&html`<${Sl} l='Tempó' v=${k.rate} on=${x=>sk({rate:+x})} o=${[[.25,'0,25 kg/hét'],[.5,'0,5 kg/hét'],[.75,'0,75 kg/hét'],[1,'1 kg/hét']]}/>`}<${F} l='Célsúly' u='kg' v=${k.tw} on=${x=>sk({tw:x})}/><${F} l='Fehérje' u='g/kg' v=${k.pg} on=${x=>sk({pg:+x})}/><${F} l='Zsír' u='% kcal' v=${k.fp} on=${x=>sk({fp:+x})}/></div>
   ${ok?html`<div class='k-stats'>
    <${R} l='Alapanyagcsere (BMR)' v=${bmr} u='kcal'/><${R} l='Napi szükséglet (TDEE)' v=${tdee} u='kcal'/>
    <${R} l='Napi cél' v=${tg} u='kcal' s=${sgn?(adj>0?'+':'')+Math.round(adj)+' kcal/nap':'szinten tartás'}/><${R} l='Fehérje' v=${pr} u='g'/>
    <${R} l='Szénhidrát' v=${ch} u='g'/><${R} l='Zsír' v=${fat} u='g'/>
    <${R} l='Rost' v=${tg/1000*14} u='g'/><${R} l='Folyadék' v=${(kg*.035).toFixed(1)} u='liter'/>
    <${R} l='BMI' v=${bmi.toFixed(1)} u='' s=${bmi<18.5?'alulsúly':bmi<25?'normál':bmi<30?'túlsúly':'elhízás'}/>${sgn!==0&&+k.tw>0&&html`<${R} l='Cél eléréséig' v=${Math.ceil(dw/k.rate)} u='hét'/>`}</div>
    <${KBtn} full=${true} c='k-mt' onClick=${()=>{setP(z=>({...z,tg:{k:Math.round(tg),p:Math.round(pr),c:Math.round(ch),f:Math.round(fat)}}));toast('Napi cél mentve az Étel fülhöz')}}>Beállítom napi célnak<//>
    ${tg<min&&html`<p class='k-hint k-warn'>A cél a javasolt minimum (${min} kcal) alatt van, lassabb tempót válassz.</p>`}`:html`<p class='k-hint'>Töltsd ki az életkort, magasságot és testsúlyt a profilban.</p>`}</div>`;
 }
 if(v==='e')out=html`<${Str}/>`;else if(v==='i')out=html`<${Intv}/>`;else if(v==='b')out=html`<${Body} setP=${setP}/>`;
 const TB=[['c','Kardió','tools.cardio'],['k','Kalória','tools.kcal'],['e','Erő','tools.strength'],['i','Intervall','tools.interval'],['b','Test','body.measure']].filter(([k,,id])=>lvlOn(id,k===(init||'c'))).map(([k,n])=>[k,n]);
 return html`<div>${TB.length>1&&html`<${KTabs} v=${v} on=${setV} o=${TB}/>`}${(v==='c'||v==='k')&&prof}<div key=${v} class='up'>${out}</div></div>`;
}

const PC={25:'bg-red-500 h-24',20:'bg-blue-500 h-20',15:'bg-yellow-400 h-16',10:'bg-green-500 h-14',5:'bg-zinc-200 h-12',2.5:'bg-zinc-400 h-10',1.25:'bg-zinc-500 h-8'};
function Str(){
 const[s,setS]=useState({kg:'',reps:'',bar:20,tw:''}),o=x=>setS(p=>({...p,...x})),kg=+s.kg,rp=+s.reps,tw=+s.tw,bar=+s.bar;
 const ep=kg&&rp?kg*(1+rp/30):0,br=kg&&rp&&rp<37?kg*36/(37-rp):0,rm=ep&&br?(ep+br)/2:ep||br,rnd=x=>Math.round(x/2.5)*2.5;
 const wu=tw>bar?[[bar,10],[rnd(tw*.5),5],[rnd(tw*.7),3],[rnd(tw*.85),1]]:[];
 let side=Math.max(0,(tw-bar)/2);const pl=[];for(const q of [25,20,15,10,5,2.5,1.25])while(side>=q-1e-9){pl.push(q);side-=q}
 return html`<div class='k-stack'>
  <${KSec} t='Egyismétléses maximum és százalékok'>
  <div class='k-g2'><${F} l='Súly' u='kg' v=${s.kg} on=${x=>o({kg:x})}/><${F} l='Ismétlés' v=${s.reps} on=${x=>o({reps:x})}/></div>
  ${rm>0&&html`<div class='k-stats c3'><${R} l='Epley' v=${ep} u='kg'/><${R} l='Brzycki' v=${br} u='kg'/><${R} l='Átlag (1RM)' v=${rm} u='kg'/></div>
   <${KCard}><div class='k-tr k-th'><span>%</span><span>Súly</span><span>Ismétlés</span></div>${[100,95,90,85,80,75,70,65,60,50].map(q=>html`<div key=${q} class='k-tr'><span>${q}%</span><b>${Math.round(rm*q/50)/2} kg</b><span>${Math.max(1,Math.round(30*(100/q-1)))}</span></div>`)}<//>`}<//>
  <${KSec} t='Tárcsák és bemelegítés'>
  <div class='k-g2'><${F} l='Munkasúly' u='kg' v=${s.tw} on=${x=>o({tw:x})}/><${Sl} l='Rúd' v=${s.bar} on=${x=>o({bar:+x})} o=${[[20,'20 kg (olimpiai)'],[15,'15 kg (női)'],[10,'10 kg (Ez)']]}/></div>
  ${tw>bar&&html`<${KCard}><div class='flex items-center justify-center gap-0.5 h-28 mb-2'><div class='h-3 w-6 rounded bg-zinc-500'></div>${pl.map((q,i)=>html`<div key=${i} class=${'w-3 rounded-sm '+PC[q]}></div>`)}<div class='h-2 w-10 rounded bg-zinc-600'></div></div>
   <div class='k-center'>Oldalanként: <b class='k-pr'>${pl.join(' + ')||'-'} kg</b></div>${side>.01&&html`<div class='k-hint k-warn k-center'>Pontosan nem rakható ki, hiányzik ${(side*2).toFixed(2)} kg.</div>`}
   <div class='k-lb'>Bemelegítő sorozatok</div>${wu.map(([w,r],i)=>html`<div key=${i} class='k-tr k-tr2'><span>${i+1}. sorozat</span><b>${w} kg × ${r}</b></div>`)}<//>`}<//></div>`;
}
function Intv(){
 const[c,setC]=useState({w:40,r:20,n:8}),[st,setSt]=useState(null),[,tk]=useState(0),sc=x=>setC(p=>({...p,...x})),nx=(ph,rd,t)=>setSt({ph,rd,tot:t,end:Date.now()+t*1000});
 useEffect(()=>{if(!st)return;const i=setInterval(()=>{tk(x=>x+1);if(Date.now()<st.end)return;beep();buzz();
  if(st.ph==='prep')nx('work',1,c.w);else if(st.ph==='work'){if(st.rd>=c.n){setSt(null);toast('Intervall kész, szép munka!',1)}else if(c.r>0)nx('rest',st.rd,c.r);else nx('work',st.rd+1,c.w)}else nx('work',st.rd+1,c.w)},200);return()=>clearInterval(i)},[st]);
 const left=st?Math.max(0,Math.ceil((st.end-Date.now())/1000)):0,fr=st?Math.max(0,(st.end-Date.now())/1000/st.tot):0,tot=(c.w+c.r)*c.n-c.r+5;
 return html`<div class='k-stack'>
  <div class='k-btns' style=${{margin:0}}>${[['Tabata',20,10,8],['HIIT',40,20,10],['EMOM',50,10,10]].map(([n,w,r,k])=>html`<${KBtn} key=${n} v='sec' sm=${true} onClick=${()=>sc({w,r,n:k})}>${n}<//>`)}</div>
  <div class='k-g3'><${F} l='Munka' u='mp' v=${c.w} on=${x=>sc({w:+x})}/><${F} l='Pihenő' u='mp' v=${c.r} on=${x=>sc({r:+x})}/><${F} l='Körök' v=${c.n} on=${x=>sc({n:+x})}/></div>
  ${st?html`<div class='up text-center'><svg viewBox='0 0 120 120' class='w-56 h-56 mx-auto'><circle cx='60' cy='60' r='54' fill='none' stroke='rgb(var(--ui-line))' strokeWidth='8'/><circle cx='60' cy='60' r='54' fill='none' stroke=${st.ph==='rest'?'rgb(var(--ui-control))':'rgb(var(--ui-accent))'} strokeWidth='8' strokeLinecap='round' strokeDasharray='339.3' strokeDashoffset=${339.3*(1-fr)} transform='rotate(-90 60 60)'/><text x='60' y='70' textAnchor='middle' fontSize='36' class='fd k-ch-v'>${left}</text></svg>
   <div class=${'k-phase'+(st.ph==='rest'?' rest':'')}>${st.ph==='prep'?'Felkészülés':st.ph==='work'?'Munka':'Pihenő'}</div><div class='k-hint k-center'>${st.rd} / ${c.n}. kör</div></div>`:html`<p class='k-hint k-center'>Összesen: ${Math.floor(tot/60)}:${pad(tot%60)} perc</p>`}
  <${KBtn} v=${st?'sec':'pri'} full=${true} onClick=${()=>st?setSt(null):nx('prep',0,5)}>${st?'Leállítás':'Indítás'}<//></div>`;
}
const ACTV=[[1.2,'Ülő','Alig mozogsz: irodai vagy otthoni munka, többnyire ülsz.','0–1 edzés/hét','2–4 ezer lépés/nap','Példa: irodai dolgozó vagy diák, aki nem sportol rendszeresen.'],[1.375,'Enyhén aktív','Heti 1–3 könnyű vagy rövid edzés, rendszeres séta.','1–3 edzés/hét (20–45 perc)','5–7 ezer lépés/nap','Példa: tanár vagy ügyfélszolgálatos, aki heti 2× edzőterembe jár.'],[1.55,'Közepesen aktív','Rendszeres, tervezett edzés átlagos napi mozgással.','3–5 edzés/hét (45–60 perc)','8–10 ezer lépés/nap','Példa: heti 4× súlyzós edzés, vagy heti 3× futás; eladó, pincér.'],[1.725,'Nagyon aktív','Szinte mindennap intenzív edzés vagy fizikai munka.','6–7 edzés/hét','10–14 ezer lépés/nap','Példa: napi edzés + sok állás-járás, csapatsportoló, futár, festő.'],[1.9,'Extrém','Napi két edzés, vagy nehéz fizikai munka plusz edzés.','7+ edzés/hét vagy napi 2×','15 ezer+ lépés/nap','Példa: élsportoló, építőipari rakodó edzéssel, versenyfelkészülés.']];
function Act({v,on}){
 return html`<div><div class='k-lb' style=${{marginTop:0}}>Aktivitási szint (mit jelentenek?)</div><div class='ui-stagger'>${ACTV.map(([m,n,ds,w,st,ex],i)=>html`<${KCard} key=${m} on=${+v===m} onClick=${()=>on(m)}>
   <div class='k-opt-h'><span class='k-row-t'>${n}</span><b class='k-pr'>×${String(m).replace('.',',')}</b></div>
   <div class='k-row-s'>${ds}</div>
   <div class='k-tags k-mt'><span class='k-tag'>${w}</span><span class='k-tag'>${st}</span></div>
   ${+v===m&&html`<div class='k-hint up'>${ex}</div>`}<//>`)}</div>
  <p class='k-hint'>Tipp: ha két szint között bizonytalan vagy, válaszd az alacsonyabbat, mert a legtöbben túlbecsülik a mozgásukat. Két hét múlva finomíts a mérleg alapján: ha a súlyod nem változik a céloddal ellentétesen, lépj egy szintet.</p></div>`;
}
const MS=[['kg','Súly','kg'],['waist','Derék','cm'],['chest','Mell','cm'],['arm','Kar','cm'],['thigh','Comb','cm'],['hip','Csípő','cm'],['sh','Váll','cm']];
function Body({setP}){
 const[bw,setBw]=useState(()=>gj('bw',[])),[v,setV]=useState({}),[mt,setMt]=useState('kg'),[bt,setBt]=useState('m');
 useEffect(()=>sjt('bw',bw),[bw]);
 const add=()=>{const d=dk(new Date()),n={};MS.forEach(([k])=>{if(+v[k])n[k]=+v[k]});if(!Object.keys(n).length)return;setBw(b=>{const o=b.find(e=>e.d===d)||{d};return[...b.filter(e=>e.d!==d),{...o,...n}].sort((a,c)=>a.d<c.d?-1:1)});if(n.kg)setP(p=>({...p,kg:String(n.kg)}));setV({});toast(tr('Mérés mentve'))};
 const pts=bw.filter(e=>e[mt]).slice(-12).map(e=>({d:e.d,v:e[mt]})),f=pts[0],l=pts[pts.length-1],ch=f&&l?l.v-f.v:0,u=MS.find(m=>m[0]===mt)[2];
 const mi=html`<div class='k-stack'>
  <${KSec} t='Mai mérés'><${KCard}><div class='k-g2'>${MS.map(([k,n,un])=>html`<${F} key=${k} l=${n} u=${un} v=${v[k]||''} on=${x=>setV(o=>({...o,[k]:x}))}/>`)}</div><${KBtn} full=${true} c='k-mt' onClick=${add}>Mentés<//><//><//>
  ${bw.length>0&&html`<div class='k-chips sc'>${MS.filter(([k])=>bw.some(e=>e[k])).map(([k,n])=>html`<${KChip} key=${k} on=${mt===k} onClick=${()=>setMt(k)}>${n}<//>`)}</div>
   ${f&&html`<div class='k-stats c3'><${R} l='Kezdő' v=${f.v.toFixed(1)} u=${u}/><${R} l='Jelenlegi' v=${l.v.toFixed(1)} u=${u}/><${R} l='Változás' v=${(ch>0?'+':'')+ch.toFixed(1)} u=${u}/></div>
   <${KCard}><${Chart} pts=${pts} dec=${1}/><//>`}
   <${KCard}><div class='k-list'>${bw.slice(-5).reverse().map(e=>html`<div key=${e.d} class='k-row'><span class='k-row-tx'><span class='k-row-t'>${fd(e.d)}</span><span class='k-row-s'>${MS.filter(([k])=>e[k]).map(([k,n,un])=>e[k]+' '+un).join(' · ')}</span></span><${KDel} on=${()=>setBw(b=>b.filter(x=>x.d!==e.d))}/></div>`)}</div><//>`}
  ${!bw.length&&html`<p class='k-hint'>Mérd meg magad és mentsd el: a grafikon a változást mutatja.</p>`}</div>`;
 return html`<div>${lvlOn('body.photos')&&html`<${KTabs} v=${bt} on=${setBt} o=${[['m','Mérések'],['f','Fotók']]}/>`}${bt==='f'?html`<${Photos}/>`:mi}</div>`;
}

