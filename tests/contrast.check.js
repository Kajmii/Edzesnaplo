// Nagy kontrasztú mód: minden séma 7:1 (szöveg) és 3:1 (vonal). Futtatás: node tests/contrast.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const base=rd('css/tokens.css'),hc=rd('css/ui-contrast.css'),idx=rd('index.html'),core=rd('js/ui/core.js'),app=rd('js/app.js');
const vars=b=>Object.fromEntries([...b.matchAll(/--(ui-[\w-]+):([^;]+);?/g)].map(m=>[m[1],m[2].trim()]));
// alap: irány + séma tokenek (mint a tests/ui.check.js)
const blocks=[...base.matchAll(/html\[data-ui="(\w+)"\](?:\[data-scheme="(\w+)"\])?\{([^}]*)\}/g)].map(m=>({ui:m[1],sc:m[2]||'',v:vars(m[3])}));
const baseOf=(ui,sc)=>Object.assign({},...blocks.filter(b=>b.ui===ui&&(!b.sc||b.sc===sc)).sort((a,b)=>(a.sc?1:0)-(b.sc?1:0)).map(b=>b.v));
// nagy kontraszt: közös blokk, majd a sémák felülírásai (a szelektorlistából a séma-névvel)
const common=vars(hc.match(/html\[data-ui\]\[data-hc\]\{([^}]*)\}/)[1]);
const over=(ui,sc)=>Object.assign({},...[...hc.matchAll(/((?:html\[data-ui="\w+"\]\[data-scheme="\w+"\]\[data-hc\],?\s*)+)\{([^}]*)\}/g)].filter(m=>m[1].includes('html[data-ui="'+ui+'"][data-scheme="'+sc+'"][data-hc]')).map(m=>vars(m[2])));
const resolve=(ui,sc)=>{const t={...baseOf(ui,sc),...common,...over(ui,sc)};const r=k=>{let v=t[k];const m=/^var\(--(ui-[\w-]+)\)$/.exec(v||'');return m?r(m[1]):v};return Object.fromEntries(Object.keys(t).map(k=>[k,r(k)]))};
const rgb=t=>t.split(/\s+/).map(Number);
const lum=t=>{const c=rgb(t).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const UI={pro:['paper','stone','graphite'],gym:['yellow','orange','green'],family:['green','warm','cool']};
let n=0;const fails=[];
for(const[ui,list]of Object.entries(UI))for(const sc of list){
 const t=resolve(ui,sc),name=ui+'/'+sc,g=(a,b)=>cr(t['ui-'+a],t['ui-'+b]),ok=(l,v,min)=>{if(!(v>=min))fails.push(name+': '+l+' '+v.toFixed(2)+':1 < '+min)};
 for(const bg of ['bg','surface','surface2','field'])for(const fg of ['text','muted','accent-text','danger','warn'])ok(fg+'/'+bg,g(fg,bg),7);
 ok('on-accent/accent',g('on-accent','accent'),7);
 for(const bg of ['bg','surface','field']){ok('line/'+bg,g('line',bg),3);ok('line2/'+bg,g('line2',bg),3);ok('control/'+bg,g('control',bg),3)}
 n++;
}
assert.deepStrictEqual(fails,[],'kontraszt: '+fails.join(' | '));
assert.strictEqual(n,9);
// bekötés: a CSS be van kötve, az alkalmazás az opt.hc-t a data-hc attribútumra és a korai scriptbe is tükrözi
assert.ok(idx.includes('css/ui-contrast.css')&&idx.indexOf('css/ui-contrast.css')>idx.indexOf('css/tokens.css'),'a ui-contrast.css a tokens.css után kell');
assert.ok(/data-hc/.test(core)&&/en_contrast/.test(core)&&/en_contrast/.test(idx)&&!/setItem\('en_hc'/.test(core),'az opt.hc nincs bekötve (core.js, korai script)');
assert.ok(/uiApply\(opt\)/.test(app));
console.log('rendben: nagy kontraszt (9 séma, 7:1 szöveg, 3:1 vonal)');
