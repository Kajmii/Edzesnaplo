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
console.log('rendben: közösségi profil (SQL és kliens egyezik)');
