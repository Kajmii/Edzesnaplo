/* ---------- Segédfüggvények ---------- */
const pad=n=>String(n).padStart(2,'0');
const dk=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pd=k=>{const[a,b,c]=k.split('-');return new Date(+a,b-1,+c)};
const DN=['V','H','K','Sze','Cs','P','Szo'];
const MN=['jan.','febr.','márc.','ápr.','máj.','jún.','júl.','aug.','szept.','okt.','nov.','dec.'];
const MNE=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fs=k=>{const d=pd(k);return LANG==='en'?`${MNE[d.getMonth()]} ${d.getDate()}`:`${MN[d.getMonth()]} ${d.getDate()}.`};
const fd=k=>LANG==='en'?`${fs(k)}, ${pd(k).getFullYear()}`:`${pd(k).getFullYear()}. ${fs(k)}`;
const weekOf=k=>{const d=pd(k),w=(d.getDay()+6)%7;return Array.from({length:7},(_,i)=>dk(new Date(d.getFullYear(),d.getMonth(),d.getDate()-w+i)))};
const vol=s=>s.reduce((a,x)=>a+(+x.kg||0)*(+x.reps||0),0);
const fmt=n=>Math.round(n).toLocaleString(LANG==='en'?'en-US':'hu-HU');
let CU='',OPT={snd:true,vib:true,step:1.25,pct:2.5},ACC='#a3e635';const gj=(k,d)=>{try{return JSON.parse(localStorage.getItem('en:'+CU+':'+k))||d}catch(e){return d}};const sj=(k,v)=>{try{localStorage.setItem('en:'+CU+':'+k,JSON.stringify(v))}catch(e){}};const sjt=(k,v)=>{try{const q='en:'+CU+':'+k,n=JSON.stringify(v),o=localStorage.getItem(q);if(o===n)return;localStorage.setItem(q,n);if(o!==null)localStorage.setItem('en:'+CU+':ts',JSON.stringify(Date.now()))}catch(e){}};const ld=()=>gj('h',[]);
const sv=v=>sj('h',v);
const lastSet=(hist,n)=>{for(const w of hist){const e=w.ex.find(x=>x.n===n);if(e)return e.sets[e.sets.length-1]}return null};
const newEx=(n,hist,g)=>{const l=g&&g.kg?g:lastSet(hist,n);return{n,sets:[{kg:l?l.kg:'',reps:l?l.reps:'',rpe:'',done:false}]}};
const inp='w-full min-w-0 h-12 rounded-xl bg-zinc-800 text-center text-lg font-semibold text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-lime-400';

const buzz=()=>{try{OPT.vib&&navigator.vibrate&&navigator.vibrate(12)}catch(e){}};
const beep=()=>{if(!OPT.snd)return;try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.setValueAtTime(.15,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.5);o.start();o.stop(a.currentTime+.5)}catch(e){}};
const toast=(m,pr)=>window.dispatchEvent(new CustomEvent('toast',{detail:{m,pr}}));
const maxKg=(hist,n)=>Math.max(0,...hist.flatMap(w=>w.ex.filter(e=>e.n===n).flatMap(e=>e.sets.map(s=>+s.kg||0))));
const uiReduced=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('noanim')}catch(e){return false}};
const uiMs=(k,d)=>{try{const x=getComputedStyle(document.documentElement).getPropertyValue(k).trim();return x.endsWith('ms')?parseFloat(x):x.endsWith('s')?parseFloat(x)*1000:d}catch(e){return d}};
function Cnt({to}){const[v,setV]=useState(0);useEffect(()=>{const D=uiReduced()?0:uiMs('--dur-count',700);if(!D){setV(to);return}let r,s;const f=t=>{s=s||t;const p=Math.min(1,(t-s)/D);setV(to*(1-Math.pow(1-p,3)));if(p<1)r=requestAnimationFrame(f)};r=requestAnimationFrame(f);return()=>cancelAnimationFrame(r)},[to]);return fmt(v)}
function Clk({t}){const[,x]=useState(0);useEffect(()=>{const i=setInterval(()=>x(v=>v+1),1000);return()=>clearInterval(i)},[]);const s=Math.max(0,Math.floor((Date.now()-t)/1000));return pad(Math.floor(s/60))+':'+pad(s%60)}
const Conf=({n=18})=>Array.from({length:n},(_,i)=>{const a=i/n*6.283,d=70+(i*37%60);return html`<i key=${i} class='cf' style=${{left:'50%',top:'50%',background:[ACC,'#22d3ee','#facc15','#f472b6'][i%4],'--x':Math.cos(a)*d+'px','--y':Math.sin(a)*d+'px','--r':(i*47)+'deg'}}></i>`});
const F=({l,v,on,u})=>html`<label class='block'><span class='text-xs text-zinc-400'>${l}</span><div class='relative'><input type='number' inputMode='decimal' class=${inp+' !text-left px-3'} value=${v} onChange=${e=>on(e.target.value)}/>${u&&html`<span class='absolute right-3 top-3.5 text-xs text-zinc-500'>${u}</span>`}</div></label>`;
const Sl=({l,v,on,o})=>html`<label class='block'><span class='text-xs text-zinc-400'>${l}</span><select value=${v} onChange=${e=>on(e.target.value)} class='w-full h-12 rounded-xl bg-zinc-800 text-white px-3 outline-none'>${o.map(([a,b])=>html`<option key=${a} value=${a}>${b}</option>`)}</select></label>`;
const Sg=({v,on,o})=>html`<div class='flex gap-2'>${o.map(([a,b])=>html`<button key=${a} onClick=${()=>on(a)} class=${'flex-1 h-11 rounded-xl text-sm font-semibold '+(String(v)===String(a)?'bg-lime-400 text-black':'bg-zinc-800 text-zinc-300')}>${b}</button>`)}</div>`;
const R=({l,v,u,s})=>html`<div class='up bg-zinc-900 border border-zinc-800 rounded-2xl p-3'><div class='fd text-3xl font-bold text-lime-400 leading-none'>${typeof v==='number'?html`<${Cnt} to=${v}/>`:v}<span class='text-sm text-zinc-500 ml-1'>${u}</span></div><div class='text-xs text-zinc-400 mt-1.5'>${l}</div>${s&&html`<div class='text-[11px] text-zinc-500'>${s}</div>`}</div>`;

function Ring({v,max,col,s=96,w=9,children}){
 const[m,setM]=useState(0);useEffect(()=>{const t=setTimeout(()=>setM(1),80);return()=>clearTimeout(t)},[]);
 const r=(s-w)/2,C=2*Math.PI*r,pc=m?Math.min(1,max?v/max:0):0;
 return html`<div class='relative shrink-0' style=${{width:s+'px',height:s+'px'}}><svg width=${s} height=${s} class='-rotate-90'><circle cx=${s/2} cy=${s/2} r=${r} fill='none' stroke='rgba(255,255,255,.08)' strokeWidth=${w}/><circle cx=${s/2} cy=${s/2} r=${r} fill='none' stroke=${col} strokeWidth=${w} strokeLinecap='round' strokeDasharray=${C} strokeDashoffset=${C*(1-pc)} style=${{transition:'stroke-dashoffset var(--dur-draw,1.1s) var(--ease-draw,cubic-bezier(.2,.8,.2,1))',filter:'drop-shadow(0 0 5px '+col+')'}}/></svg><div class='absolute inset-0 flex flex-col items-center justify-center text-center'>${children}</div></div>`;
}
function Bars({vals,labels,h=84}){
 const[m,setM]=useState(0);useEffect(()=>{const t=setTimeout(()=>setM(1),80);return()=>clearTimeout(t)},[]);
 const mx=Math.max(1,...vals);
 return html`<div><div class='flex items-end gap-1.5' style=${{height:h+'px'}}>${vals.map((v,i)=>html`<div key=${i} class='flex-1 flex items-end h-full'><div class='w-full rounded-t-lg bg-lime-400' style=${{height:m?Math.max(v?7:2,v/mx*100)+'%':'2%',opacity:v?1:.25,transition:'height var(--dur-draw,.9s) var(--ease-draw,cubic-bezier(.2,.8,.2,1)) '+i*40+'ms'}}></div></div>`)}</div><div class='flex gap-1.5 mt-1'>${labels.map((l,i)=>html`<span key=${i} class='flex-1 text-center text-[10px] text-zinc-500'>${l}</span>`)}</div></div>`;
}
