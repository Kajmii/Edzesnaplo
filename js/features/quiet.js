/* ---------- Csendes órák (opt.qh = {on, from, to}) ----------
   Ilyenkor az app nem szól (sípszó a pihenő végén, rezgés) és nem küld értesítést (tervezett edzés-emlékeztető, pihenő vége).
   Az éjszakába nyúló sáv (22:00–07:00) is működik; ha a kezdet és a vég egyenlő, nincs csendes óra. Tiszta függvények,
   a tests/quiet.check.js ellenőrzi. */
const quietMin=(q,m)=>{
 if(!q||!q.on||!q.from||!q.to||q.from===q.to)return false;
 const t=s=>{const p=String(s).split(':').map(Number);return(p[0]||0)*60+(p[1]||0)},a=t(q.from),b=t(q.to);
 return a<b?m>=a&&m<b:m>=a||m<b;
};
const quietAt=(q,d)=>quietMin(q,d.getHours()*60+d.getMinutes());
