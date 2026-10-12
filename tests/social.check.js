// Közösségi profil: a kliens és az SQL szabályai egyezzenek. Futtatás: node tests/social.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const sql=fs.readFileSync(path.join(__dirname,'../supabase/social_1_profiles.sql'),'utf8');
const src=fs.readFileSync(path.join(__dirname,'../js/social.js'),'utf8');
const m=new Function('ACCS','html','useState','useEffect',src+';return{SOC_RESERVED,SOC_COLORS,SOC_ICONS,socUserOk,socClean,socNameOk,SOC_BAD_STRONG,SOC_BAD_EXACT,SOC_ACC,SOC_ACC2}')({},()=>0,()=>0,()=>0);
const list=s=>[...s.matchAll(/'([^']+)'/g)].map(x=>x[1]);
const sqlRes=list(/username <> all \(array\[([\s\S]*?)\]\)/.exec(sql)[1]);
assert.deepStrictEqual([...sqlRes].sort(),[...m.SOC_RESERVED].sort(),'foglalt nevek eltérnek');
assert.deepStrictEqual(list(/avatar_color in \(([^)]*)\)/.exec(sql)[1]),m.SOC_COLORS,'avatar színek eltérnek');
assert.deepStrictEqual(list(/avatar_icon in \(([^)]*)\)/.exec(sql)[1]),m.SOC_ICONS,'avatar jelek eltérnek');
assert.ok(sql.includes("username ~ '^[a-z0-9_]{3,20}$'"),'felhasználónév-minta hiányzik az SQL-ből');
for(const t of ['profiles','profile_settings','social_rate_log'])assert.ok(new RegExp('alter table public\.'+t+' enable row level security').test(sql),t+': RLS hiányzik');
assert.ok(/revoke all on public\.profiles from anon/.test(sql)&&/revoke all on public\.profile_settings from anon/.test(sql),'anon jog nincs elvéve');
assert.ok(!/service_role/i.test(src+sql.replace(/--.*$/gm,'')),'service role nem szerepelhet');
for(const u of ['abc','anna_92','a'.repeat(20),'___'])assert.ok(m.socUserOk(u),u);
for(const u of ['ab','a'.repeat(21),'Anna','anna!','árpád','admin','edzesnaplo','',' abc'])assert.ok(!m.socUserOk(u),JSON.stringify(u));
assert.strictEqual(m.socClean('Anna Kiss-92!'),'annakiss92');
assert.strictEqual(m.socClean('A'.repeat(30)).length,20);

// Trágár / sértő nevek: az SQL és a kliens listája és normalizálása egyezzen
const arr=name=>{const k=name+' text[] := array[';return list(sql.slice(sql.indexOf(k)+k.length).split(']')[0])};
assert.deepStrictEqual(arr('strong'),m.SOC_BAD_STRONG,'tiltott szavak (strong) eltérnek');
assert.deepStrictEqual(arr('exact'),m.SOC_BAD_EXACT,'tiltott szavak (exact) eltérnek');
const tl=sql.slice(sql.indexOf('n := translate(')).split('\n')[0],tq=tl.split("'");
assert.strictEqual(tq[3],m.SOC_ACC,'normalizálás (honnan) eltér');assert.strictEqual(tq[5],m.SOC_ACC2,'normalizálás (hova) eltér');
assert.strictEqual(m.SOC_ACC.length,m.SOC_ACC2.length);
assert.ok(sql.includes("raise exception 'name_blocked'"),'a trigger nem ellenőrzi a nevet');
for(const w of [...m.SOC_BAD_STRONG,...m.SOC_BAD_EXACT])assert.ok(/^[a-z]+$/.test(w),'a lista csak kisbetűs ASCII lehet: '+w);
for(const bad of ['kurva','Kurva_Anyad','fu_ck','FUUUCK','f.u.c.k','fűck'.replace('ű','u'),'Sh1t','sh!t','n1gger','B4stard','h1tler','Adolf_1488','1 4 8 8','szar','Szar','buzi','KuRvA','b@stard','fa$z','Nazi','nazi_88','my.ass','pu55y','p0rn','Árvíztűrő Fasz','faszfej','kibaszott','bazdmeg_12','heil_hitler','retard','ret4rd','f4gg0t'])assert.ok(!m.socNameOk(bad),'engedte: '+bad);
for(const good of ['Anna Kiss','anna_fit92','Szarka Péter','Buzinkay Gábor','Scunthorpe','Torpedo','Slutsky','Grape','Dickens','Cockburn','Kovács Béla','edzo_anna','Árpád','Ősz Éva','Rápolti','Vágó István','assist','classic','massza','Bass_Guy','Peter_Cummings','hello_world','Pásztor','Mókus_Sanyi','müller','Zsófi','Kiss_Pista','Szabó Kata','fit1488'.replace('1488','2000')])assert.ok(m.socNameOk(good),'tiltotta: '+good);

// 3. lépés: követés és barátkérés SQL (supabase/social_2_follows.sql)
const sql2=fs.readFileSync(path.join(__dirname,'../supabase/social_2_follows.sql'),'utf8');
const code2=sql2.replace(/--.*$/gm,'');
for(const tb of ['follows','friend_requests']){
 assert.ok(new RegExp('alter table public\.'+tb+' enable row level security').test(code2),tb+': RLS hiányzik');
 assert.ok(new RegExp('revoke all on public\.'+tb+' from anon').test(code2),tb+': anon jog nincs elvéve');
}
const pols=code2.split('create policy ').slice(1).map(x=>{const w=x.split(/\s+/);return w[2].replace('public.','')+'.'+w[4]});
for(const p of ['follows.select','follows.insert','follows.delete','friend_requests.select','friend_requests.insert','friend_requests.update','friend_requests.delete'])assert.ok(pols.includes(p),'hiányzó szabály: '+p);
assert.ok(!pols.includes('follows.update'),'a követés nem módosítható');
assert.ok(code2.replace(/\s+/g,' ').includes('follower_id = (select auth.uid()) and not public.social_is_blocked'),'a követés beszúrása nem a saját nevemben történik');
assert.ok(code2.replace(/\s+/g,' ').includes("from_id = (select auth.uid()) and status = 'pending'"),'a barátkérés csak pending lehet');
assert.ok(code2.replace(/\s+/g,' ').includes("to_id = (select auth.uid()) and status = 'pending'"),'csak a címzett válaszolhat');
assert.ok(code2.includes("social_check_rate('follow'")&&code2.includes("social_check_rate('friend_request'"),'rate limit hiányzik');
assert.ok(code2.includes('friend_requests_pair_key'),'a pár egyedisége hiányzik');
assert.ok(!/service_role/i.test(code2+fs.readFileSync(path.join(__dirname,'../js/social-follow.js'),'utf8')),'service role nem szerepelhet');
console.log('rendben: közösségi profil (SQL és kliens egyezik)');
// 4. lépés: aktivitások, profil nézet, feed (supabase/social_2b_activities.sql)
const sql3=fs.readFileSync(path.join(__dirname,'../supabase/social_2b_activities.sql'),'utf8'),code3=sql3.replace(/--.*$/gm,''),flat3=code3.replace(/\s+/g,' ');
assert.ok(flat3.includes('alter table public.activities enable row level security'),'activities: RLS hiányzik');
assert.ok(flat3.includes('revoke all on public.activities from anon'),'activities: anon jog nincs elvéve');
const pols3=code3.split('create policy ').slice(1).map(x=>{const w=x.split(/\s+/);return w[2].replace('public.','')+'.'+w[4]});
assert.deepStrictEqual(pols3.sort(),['activities.delete','activities.insert','activities.select'],'az activities szabályai eltérnek (szerkesztés nem lehet)');
assert.ok(flat3.includes('user_id = (select auth.uid()) or public.social_can_view(user_id)'),'a láthatóság nem a social_can_view-ból jön');
assert.ok(flat3.includes('s.share_activity'),'a közzététel nem függ a megosztás-kapcsolótól');
assert.ok(flat3.includes('public.social_is_public(u) or public.social_is_friend(auth.uid(), u)'),'a nyilvános/barát szabály hiányzik');
assert.ok(flat3.includes('security invoker'),'a feed nem a hívó jogán fut (az RLS-t megkerülhetné)');
assert.ok(flat3.includes("social_check_rate('activity'")&&flat3.includes("social_check_rate('profile_view'"),'rate limit hiányzik');
assert.ok(flat3.includes('case when v then'),'a profil-számokat nem védi a láthatóság');
assert.ok(!/service_role/i.test(code3+fs.readFileSync(path.join(__dirname,'../js/social-feed.js'),'utf8')),'service role nem szerepelhet');
// kliens: a közzététel csak bekapcsolt megosztásnál megy ki, és csak összefoglalót küld (nyers sorozatokat nem)
const fsrc=fs.readFileSync(path.join(__dirname,'../js/social-feed.js'),'utf8');
let sent=[],flag=false;
const f=new Function('SESS','gj','sbf','fmt','fd','dk','LANG','html','useState','useEffect','Avatar','Ic','SOC_PF','socErr','toast',fsrc+';return{socPublish,socSum}')({user:{id:'u1'}},()=>flag,async(p,o)=>{sent.push([p,JSON.parse(o.body)]);return{ok:true}},x=>String(x),x=>x,x=>x,'hu',()=>0,()=>0,()=>0,0,0,'',0,()=>0);
const w={id:123,name:'Push',vol:5230.7,ex:[{n:'Fekvenyomás',sets:[{kg:80,reps:5,done:true},{kg:80,reps:5}]},{n:'Vállnyomás',sets:[{kg:40,reps:8}]}]};
(async()=>{await f.socPublish(w,1);assert.strictEqual(sent.length,0,'kikapcsolt megosztásnál is elküldte');flag=true;await f.socPublish(w,1);
 assert.strictEqual(sent.length,1);const b=sent[0][1];assert.strictEqual(b.user_id,'u1');assert.strictEqual(b.workout_id,'123');assert.strictEqual(b.title,'Push');
 assert.deepStrictEqual(b.summary,{exercises:2,sets:3,volume:5231,prs:1,names:['Fekvenyomás','Vállnyomás']});
 assert.ok(!JSON.stringify(b).includes('"kg"'),'nyers sorozatadat ment ki');
 assert.strictEqual(f.socSum({exercises:2,sets:3,volume:100}),'2 gyakorlat · 3 sorozat · 100 kg');
 console.log('rendben: közösségi aktivitás (SQL és kliens)')})();

