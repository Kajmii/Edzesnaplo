/* ---------- A Kezdőlap és az Edzés képernyők számított adatai (tiszta függvények, tests/ui-data.check.js) ----------
   Minden érték az appban már meglévő adatból jön (edzés-előzmények, terv, profil), kitalált adat nincs. */
const uiIsoWeek=d=>{const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())),n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y)/864e5+1)/7)};
const uiAgo=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const uiE1=(k,r)=>k*(1+r/30);
// A terv nevéből a rövid cím: "Nyomó (Push)" -> "Nyomó"
const uiShort=n=>String(n||'').replace(/\s*\(.*\)\s*/,'').trim()||String(n||'');
// A hét napjai (hétfőtől): kész, mai, tervezett (jövő) vagy pihenő
const uiWeek=(hist,plan,today)=>weekOf(today).map(k=>{const dow=pd(k).getDay(),done=hist.some(w=>w.date===k),planned=!!(plan.days&&plan.days[dow]);return{k,dow,done,planned,today:k===today,st:done?'done':k===today?'today':planned&&k>today?'plan':'rest'}});
// Heti volumen az utolsó n hétre (régebbitől az újig) és a változás az előző héthez képest
const uiVolWeeks=(hist,today,n=8)=>{const w0=pd(weekOf(today)[0]),out=[];
 for(let i=n-1;i>=0;i--){const d=new Date(w0.getFullYear(),w0.getMonth(),w0.getDate()-7*i),ks=weekOf(dk(d));out.push(hist.filter(w=>ks.includes(w.date)).reduce((a,w)=>a+w.vol,0))}
 const cur=out[n-1],prev=out[n-2];return{vals:out,cur,delta:prev>0?(cur-prev)/prev*100:null}};
// Legjobb becsült 1RM gyakorlatonként (a legnehezebb sorozat), csökkenő sorrendben
const uiRecs=(hist,n=3)=>{const b={};for(const w of hist)for(const e of w.ex)for(const s of e.sets){const k=+s.kg||0,r=+s.reps||0;if(!k)continue;const m=uiE1(k,r);if(!b[e.n]||m>b[e.n].m)b[e.n]={n:e.n,m,k,r,d:w.date}}
 return Object.values(b).sort((a,c)=>c.m-a.m).slice(0,n)};
// Az utolsó napokban elért rekord (a sorozatnál a pr jelző): név, nap, becsült 1RM
const uiLatestPR=(hist,today,days=21)=>{for(const w of [...hist].sort((a,b)=>a.date<b.date?1:-1)){if(uiAgo(w.date,today)>days)break;
  for(const e of w.ex){const s=e.sets.filter(x=>x.pr);if(s.length){const best=Math.max(...e.sets.map(x=>uiE1(+x.kg||0,+x.reps||0)));return{n:e.n,d:w.date,ago:uiAgo(w.date,today),m:best}}}}return null};
// Izomcsoportonkénti sorozatok ezen a héten a GOF (gyakorlat -> csoport) szerint
const UI_TARGET={Mell:16,Hát:16,Láb:14,Váll:12,Kar:10,Törzs:8};
const uiGroupSets=(hist,today,groups)=>{const wk=weekOf(today),g=Object.fromEntries(groups.map(x=>[x,0]));
 for(const w of hist)if(wk.includes(w.date))for(const e of w.ex){const k=GOF[e.n];if(k in g)g[k]+=e.sets.length}return g};
// Egymást követő hetek száma, amelyekben volt edzés (ha a mai hétnek még nincs, az előző hettől számolva)
const uiStreak=(hist,today)=>{const wk=new Set(hist.map(w=>weekOf(w.date)[0])),cur=weekOf(today)[0],d=pd(cur);let st=0;if(!wk.has(cur))d.setDate(d.getDate()-7);while(wk.has(dk(d))){st++;d.setDate(d.getDate()-7)}return st};
// "NAP 3/5": hányadik tervezett edzésnap ez a hét és hány van összesen
const uiDayOf=(plan,today)=>{const wk=weekOf(today),pl=wk.filter(k=>plan.days&&plan.days[pd(k).getDay()]);return{n:Math.max(1,pl.filter(k=>k<=today).length),of:Math.max(1,pl.length)}};
// Tárcsák egy oldalra a rúdhoz; maradék: amit a készlet nem tud kirakni
const UI_PLATES=[25,20,15,10,5,2.5,1.25];
const uiPlates=(kg,bar=20)=>{let side=Math.max(0,(+kg||0)-bar)/2;const list=[];for(const p of UI_PLATES){const c=Math.floor(side/p+1e-9);if(c>0){list.push({w:p,c});side-=c*p}}return{list,rest:Math.round(side*100)/100}};
// Szabad edzéshez ajánlott könnyű mozdulatok (Family, ha nincs tervezett edzés)
const UI_EASY=['Séta, 20 perc','Lábemelés ülve, 2 × 10','Fekvőtámasz a falnál, 2 × 8','Nyújtás, 5 perc'];
const uiFirstName=u=>{const s=String(u||'').split(/[._\-+@\s]/)[0]||'';return s?s[0].toUpperCase()+s.slice(1):''};
// Becsült időtartam: gyakorlatonként kb. 9 perc (3 sorozat és pihenők), 5 percre kerekítve
const uiMins=n=>Math.max(10,Math.round(n*9/5)*5);
