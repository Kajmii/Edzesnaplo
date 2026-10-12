/* ---------- Közösség: követés és barátkérés (3. lépés) ----------
   A szabályokat (ki kit követhet, ki válaszolhat, rate limit) a Supabase őrzi: supabase/social_2_follows.sql.
   A kliens csak azt jeleníti meg, amit az RLS enged: a saját követéseimet, követőimet és barátkéréseimet. */
const SOC_PF='user_id,username,display_name,avatar_color,avatar_icon';

// Kapcsolataim (követés, barátkérés) és a rajtuk végezhető műveletek; a Kapcsolatok és a Profil nézet is ezt használja
function useSocRel(me){
 const[d,setD]=useState(null),[busy,setBusy]=useState(''),[msg,setMsg]=useState(''),[er,setEr]=useState(false);
 const fail=r=>setMsg(r&&r.status!==undefined?socErr(r,'Már van függő kérés vagy barátság.'):'Nincs kapcsolat. Próbáld újra.');
 const load=async()=>{
  try{const[a,b]=await Promise.all([sbf('/rest/v1/follows?select=follower_id,followee_id'),sbf('/rest/v1/friend_requests?select=id,from_id,to_id,status,responded_at')]);
   if(!a.ok||!b.ok)throw a.ok?b:a;
   const ids=[...new Set([...a.j.flatMap(x=>[x.follower_id,x.followee_id]),...b.j.flatMap(x=>[x.from_id,x.to_id])])].filter(x=>x!==me),pm={};
   for(let i=0;i<ids.length;i+=50){const p=await sbf('/rest/v1/profiles?select='+SOC_PF+'&user_id=in.('+ids.slice(i,i+50).join(',')+')');if(!p.ok)throw p;p.j.forEach(x=>{pm[x.user_id]=x})}
   setD({f:a.j,r:b.j,pm});setEr(false)}catch(r){fail(r);setEr(true)}};
 useEffect(()=>{load()},[]);
 const rel=u=>{const f=d?d.f:[],fr=(d?d.r:[]).find(x=>x.from_id===u||x.to_id===u);return{following:f.some(x=>x.follower_id===me&&x.followee_id===u),follower:f.some(x=>x.follower_id===u&&x.followee_id===me),fr}};
 const act=async(key,fn)=>{setBusy(key);setMsg('');try{const r=await fn();if(!r.ok)throw r}catch(r){fail(r)}await load();setBusy('')};
 const hm={Prefer:'return=minimal'},rq=(path,o)=>sbf('/rest/v1/'+path,{headers:hm,...o}),J=o=>({method:'POST',body:JSON.stringify(o)});
 const follow=u=>act('f'+u,()=>rq('follows',J({follower_id:me,followee_id:u}))),
  unfollow=u=>act('f'+u,()=>rq('follows?follower_id=eq.'+me+'&followee_id=eq.'+u,{method:'DELETE'})),
  ask=u=>act('r'+u,()=>rq('friend_requests',J({from_id:me,to_id:u,status:'pending'}))),
  drop=fr=>act('r'+fr.id,()=>rq('friend_requests?id=eq.'+fr.id,{method:'DELETE'})),
  answer=(fr,st)=>act('r'+fr.id,async()=>{const r=await sbf('/rest/v1/friend_requests?id=eq.'+fr.id,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status:st})});return r.ok&&!(r.j&&r.j[0])?{ok:false,status:403,j:{}}:r}),
  reask=(fr,u)=>act('r'+u,async()=>{const a=await rq('friend_requests?id=eq.'+fr.id,{method:'DELETE'});return a.ok?rq('friend_requests',J({from_id:me,to_id:u,status:'pending'})):a});
 const B=(t,f,cls)=>html`<button key=${t} onClick=${f} disabled=${!!busy} class=${'h-9 px-3 rounded-lg text-xs font-semibold '+(cls||'bg-zinc-800 text-zinc-200')+(busy?' opacity-60':'')}>${t}</button>`;
 // A felhasználóhoz tartozó gombok: követés és barátkérés (a kapcsolat állapota szerint)
 const btns=p=>{const u=p.user_id,fr=rel(u).fr;let fb;
  if(!fr)fb=B('Barátkérés',()=>ask(u));
  else if(fr.status==='accepted')fb=B('Barátság megszüntetése',()=>drop(fr),'bg-zinc-800 text-red-400');
  else if(fr.status==='pending')fb=fr.from_id===me?B('Kérés visszavonása',()=>drop(fr)):[B('Elfogadás',()=>answer(fr,'accepted'),'bg-lime-400 text-black'),B('Elutasítás',()=>answer(fr,'declined'))];
  else fb=fr.from_id!==me?html`<span class='text-xs text-zinc-500 self-center'>Elutasítottad</span>`:(fr.responded_at&&Date.now()-Date.parse(fr.responded_at)>7*864e5?B('Új barátkérés',()=>reask(fr,u)):html`<span class='text-xs text-zinc-500 self-center'>A kérésed elutasítva</span>`);
  return html`<div class='flex flex-wrap gap-2 mt-2'>${rel(u).following?B('Követés megszüntetése',()=>unfollow(u)):B('Követés',()=>follow(u),'bg-lime-400 text-black')}${fb}</div>`};
 return{d,msg,setMsg,busy,er,load,rel,btns,fail};
}

function SocConn({me,open}){
 const R=useSocRel(me),{d,msg,er,load,rel,btns,fail}=R,[q,setQ]=useState(''),[res,setRes]=useState(null);
 // Keresés: a felhasználónév elejére, legalább 3 karakter, legfeljebb 20 találat
 useEffect(()=>{const s=q.trim().toLowerCase();if(s.length<3){setRes(null);return}
  let off=false;const t=setTimeout(async()=>{try{const r=await sbf('/rest/v1/profiles?select='+SOC_PF+'&username=like.'+encodeURIComponent(s.replace(/_/g,'\\_')+'*')+'&order=username&limit=20');
   if(off)return;if(!r.ok)throw r;setRes(r.j.filter(x=>x.user_id!==me))}catch(r){if(!off)fail(r)}},400);
  return()=>{off=true;clearTimeout(t)}},[q]);
 const row=p=>html`<div key=${p.user_id} class='py-3 border-b border-zinc-800'><button onClick=${()=>open(p.username)} class='flex items-center gap-3 text-left w-full'><${Avatar} p=${p} s=${44}/><span class='min-w-0'><span class='block font-medium truncate'>${p.display_name}</span><span class='block text-xs text-zinc-400 truncate'>@${p.username}${rel(p.user_id).follower&&html` · Követ téged`}</span></span></button>${btns(p)}</div>`;
 const sec=(t,ids)=>{const ps=ids.map(i=>d.pm[i]).filter(Boolean);return ps.length?html`<div key=${t} class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'><div class='font-semibold'>${t} (${ps.length})</div>${ps.map(row)}</div>`:null};
 if(er&&!d)return html`<div><p class='text-sm text-amber-400'>${msg}</p><button onClick=${load} class='w-full h-11 rounded-xl bg-zinc-800 text-sm font-semibold mt-3'>Újra</button></div>`;
 if(!d)return html`<p class='text-sm text-zinc-400'>Betöltés...</p>`;
 const other=x=>x.from_id===me?x.to_id:x.from_id,pend=d.r.filter(x=>x.status==='pending');
 const lists=[sec('Barátkérések',pend.filter(x=>x.to_id===me).map(x=>x.from_id)),sec('Elküldött kérések',pend.filter(x=>x.from_id===me).map(x=>x.to_id)),sec('Barátok',d.r.filter(x=>x.status==='accepted').map(other)),sec('Követettek',d.f.filter(x=>x.follower_id===me).map(x=>x.followee_id)),sec('Követők',d.f.filter(x=>x.followee_id===me).map(x=>x.follower_id))].filter(Boolean);
 return html`<div>
  <input value=${q} onChange=${e=>setQ(e.target.value)} placeholder='Keresés felhasználónévre (legalább 3 karakter)' autoCapitalize='none' autoCorrect='off' spellCheck=${false} class=${inp+' !text-left px-4 !text-base mb-3'}/>
  ${msg&&html`<p class='text-sm text-amber-400 mb-3'>${msg}</p>`}
  ${res&&html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3'><div class='font-semibold'>Találatok</div>${res.length?res.map(row):html`<p class='text-sm text-zinc-400 mt-2'>Nincs találat.</p>`}</div>`}
  ${lists}
  ${!lists.length&&!res&&html`<p class='text-sm text-zinc-400'>Még nincs kapcsolatod. Keress felhasználót a felhasználóneve elejével.</p>`}</div>`;
}
