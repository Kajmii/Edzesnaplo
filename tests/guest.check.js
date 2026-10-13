// Vendég mód (8. fázis): helyi adat, átvitel a fiókba, bekötés. Futtatás: node tests/guest.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const util=rd('js/util.js').split('\n').find(l=>l.startsWith("let CU=''")),auth=rd('js/auth.js'),guest=rd('js/guest.js');
assert.ok(util,'a util.js tárolósora nincs meg');
const docMerge=auth.slice(auth.indexOf('const docNow='),auth.indexOf('function Reset'));
// helyettesítő localStorage: az adatok felsorolhatók (Object.keys), a metódusok nem
const mkLS=()=>{const s={};for(const[k,f]of Object.entries({getItem:k=>k in s?s[k]:null,setItem:(k,v)=>{s[k]=String(v)},removeItem:k=>{delete s[k]}}))Object.defineProperty(s,k,{value:f,enumerable:false});return s};
const mk=()=>{const ls=mkLS();const m=new Function('localStorage','window',util+';'+docMerge+';'+guest+';return{GUEST,isGuest,guestOn,guestPending,guestDoc,guestHasData,guestClear,guestMove,setCU:v=>{CU=v},getCU:()=>CU,gj,sj}')(ls,{dispatchEvent(){},Event:function(){}});return{ls,m}};
const W=(id,date,n)=>({id,date,name:n||'Nyomó',ex:[{n:'Fekvenyomás',sets:[{kg:80,reps:8,done:true}]}],vol:640});
// 1. alap: a vendég azonosítója "guest", az adat az en:guest:* kulcsok alatt van
{const{ls,m}=mk();assert.strictEqual(m.GUEST.id,'guest');m.setCU('guest');assert.strictEqual(m.isGuest(),true);m.sj('h',[W(1,'2026-10-01')]);assert.ok('en:guest:h' in ls);m.setCU('u1');assert.strictEqual(m.isGuest(),false)}
// 2. van-e érdemi vendég-adat: üres és alapértelmezett profil = nincs, edzés / étel / terv / saját edzés = van
{const{m}=mk();m.setCU('x');assert.strictEqual(m.guestHasData(),false);
 m.setCU('guest');m.sj('prof',{sex:'m',age:'',cm:'',kg:'',bf:''});m.setCU('x');assert.strictEqual(m.guestHasData(),false,'az alap profil nem adat');
 m.setCU('guest');m.sj('h',[W(1,'2026-10-01')]);m.setCU('x');assert.strictEqual(m.guestHasData(),true);assert.strictEqual(m.getCU(),'x','a CU nem módosul');}
for(const[k,v]of [['food',{'2026-10-01':{e:[{n:'a'}],w:0}}],['ct',[{id:'c1'}]],['plan',{days:{1:'ppl:0'},time:'07:00',on:false}],['bw',[{d:'2026-10-01',kg:80}]],['prof',{age:'30'}]]){const{m}=mk();m.setCU('guest');m.sj(k,v);m.setCU('x');assert.strictEqual(m.guestHasData(),true,k+' érdemi adat')}
// 3. átvitel: az edzések uniója (azonos azonosító egyszer), a terv és a beállítások a vendégtől, ha a fiókban nincs, a törlési lista érvényes, a vendég-adat eltűnik
{const{ls,m}=mk();
 m.setCU('guest');m.sj('h',[W(1,'2026-10-01'),W(2,'2026-10-05'),W(3,'2026-10-07')]);m.sj('plan',{days:{1:'ppl:0'},time:'07:00',on:false});m.sj('opt',{ui:'gym',lvl:2,lvlSet:true,uiChosen:true});m.sj('ts',500);
 m.setCU('u1');m.sj('h',[W(3,'2026-10-07'),W(9,'2026-10-08')]);m.sj('del',[2]);m.sj('ts',0);
 m.guestMove('u1');
 m.setCU('u1');const h=m.gj('h',[]);assert.deepStrictEqual(h.map(x=>x.id).sort(),[1,3,9],'unió, duplikáció és a törölt (2) nélkül');
 assert.deepStrictEqual(m.gj('plan',null).days,{1:'ppl:0'});assert.strictEqual(m.gj('opt',null).lvl,2);assert.strictEqual(m.gj('ts',0),500);
 assert.ok(!Object.keys(ls).some(k=>k.startsWith('en:guest:')),'a vendég-adat átkerült, nem maradt másolat');
 assert.strictEqual(m.getCU(),'u1','a CU nem módosul');}
// 4. ha a fiók frissebb, annak a terve marad; az átvitel más fiókok kulcsait nem érinti
{const{ls,m}=mk();m.setCU('guest');m.sj('plan',{days:{1:'a'}});m.sj('ts',100);m.setCU('u1');m.sj('plan',{days:{2:'b'}});m.sj('ts',900);m.setCU('u2');m.sj('h',[W(7,'2026-10-02')]);
 m.guestMove('u1');m.setCU('u1');assert.deepStrictEqual(m.gj('plan',null).days,{2:'b'},'a frissebb fiók-terv marad');m.setCU('u2');assert.strictEqual(m.gj('h',[]).length,1,'másik fiók érintetlen')}
// 5. „külön tartom”: guestClear nélkül a vendég-adat megmarad (a Root csak a jelzőt törli)
{const{ls,m}=mk();m.setCU('guest');m.sj('h',[W(1,'2026-10-01')]);ls['en_guest_pending']='1';assert.strictEqual(m.guestPending(),true);delete ls['en_guest_pending'];assert.strictEqual(m.guestPending(),false);assert.ok('en:guest:h' in ls)}
// 6. bekötés: bejelentkező gomb és mondat, a Root vendég állapota és átvitele, az App nem vár szinkronra, fiókhoz kötött részek
assert.ok(/guest&&html`<div class='k-or'>[^`]*Folytatás vendégként[^`]*Vendégként az adataid csak ezen a készüléken tárolódnak\./.test(auth),'a vendég gomb és a mondat');
assert.ok(/guestOn\(\)\?GUEST:null/.test(auth)&&/en_guest_pending/.test(auth)&&/guestPending\(\)&&guestHasData\(\)/.test(auth)&&/removeItem\('en_guest'\)/.test(auth),'a Root vendég-állapota');
// a Google-belépés és a handoff érintetlen
for(const t of ['gstart','hcSet(c)','take_handoff','put_handoff','startPoll','pollOnce','/auth/v1/authorize?provider=google'])assert.ok(auth.includes(t),'a Google-belépés része hiányzik: '+t);
const app=rd('js/app.js');
assert.ok(/!isGuest\(\)&&gj\('ts',0\)===0/.test(app)&&/isGuest\(\)\|\|sy\.s==='ok'/.test(app),'az App vendégként nem vár a szinkronra');
assert.ok(/isGuest\(\)\?html`<\$\{GuestGate\}\/>`:html`<\$\{Social\}\/>`/.test(app)&&/isGuest\(\)\?html`<\$\{GuestGate\}\/>`:html`<\$\{Photos\}\/>`/.test(rd('js/tools.js')),'a Közösség és a Fotók fiókhoz kötött');
assert.ok(/SESS\)return/.test(app.replace(/\s/g,''))||/if\(!SESS\|\|SYB\)return/.test(app),'a szinkron SESS nélkül nem fut');
assert.ok(/GuestNote/.test(rd('js/ui/home.js'))&&/guestToAccount/.test(rd('js/settings.js'))&&/guestToAccount/.test(rd('js/ui/profile.js')),'jelzés és fiók létrehozása a Kezdőlapon, Beállításokban, Profilban');
const idx=rd('index.html');assert.ok(idx.indexOf('js/guest.js')>idx.indexOf('js/auth.js')&&idx.indexOf('js/guest.js')<idx.indexOf('js/app.js'),'a guest.js az auth.js után, az app.js előtt');
// 7. keresés és menü: a fiókhoz kötött funkció jelölése
const fnA=new Function(rd('js/features/search.js').slice(rd('js/features/search.js').indexOf('const featNeedsAcct'),rd('js/features/search.js').indexOf('// "Test és mérések'))+';return featNeedsAcct')();
for(const id of ['social.feed','social.groups','social.report','body.photos'])assert.strictEqual(fnA(id),true,id);for(const id of ['body.measure','food.log','opt.ui','plan.week'])assert.strictEqual(fnA(id),false,id);
// 8. szövegek angolul, a súgó-bejegyzés a 7b mondattal, nyilvántartás
let dict;new Function('setDict',rd('js/i18n-en.js'))(x=>{dict=x});
for(const t of ['Folytatás vendégként','Vendégként az adataid csak ezen a készüléken tárolódnak.','Fiókkal elérhető','Fiók létrehozása','Vendég · csak helyi adat','Vendég mód','Kilépés a vendég módból','Átviszed a vendég-adataidat?','Átvitel a fiókba','Külön tartom'])assert.ok(dict[t]!==undefined,'nincs angol: '+t);
assert.ok(rd('js/features/registry.js').includes("F_('acct.guest'")&&rd('docs/UI-IMPLEMENTATION.md').includes('Később fiókot is létrehozhatsz, az adataidat átviheted'));
console.log('rendben: vendég mód (helyi adat, átvitel, bekötés)');
