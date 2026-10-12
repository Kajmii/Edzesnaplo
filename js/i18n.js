const {useState,useEffect}=React;
let LANG='hu',DI=Object.create(null),DK=[];
const setDict=d=>{DI=Object.assign(Object.create(null),d);DK=Object.keys(d).filter(k=>k.length>=8).sort((a,b)=>b.length-a.length)};
const trs=s=>{if(DI[s])return DI[s];const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s);if(m[2]!==s&&DI[m[2]])return m[1]+DI[m[2]]+m[3];if(!/[A-Za-z\u00C0-\u024F]/.test(s))return s;let r=s;for(const k of DK)if(r.includes(k))r=r.split(k).join(DI[k]);return r};
const tr=x=>LANG==='en'&&typeof x==='string'?trs(x):x;
const h=(t,p,...c)=>{if(p){if(p.class)p={...p,className:p.class,class:undefined};if(LANG==='en'){if(p.placeholder)p={...p,placeholder:trs(p.placeholder)};if(p.title)p={...p,title:trs(p.title)}}}return React.createElement(t,p,...c.map(x=>tr(x)))};
const html=htm.bind(h);

