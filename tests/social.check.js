// Közösségi profil: a kliens és az SQL szabályai egyezzenek. Futtatás: node tests/social.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const sql=fs.readFileSync(path.join(__dirname,'../supabase/social_1_profiles.sql'),'utf8');
const src=fs.readFileSync(path.join(__dirname,'../js/social.js'),'utf8');
const m=new Function('ACCS','html','useState','useEffect',src+';return{SOC_RESERVED,SOC_COLORS,SOC_ICONS,socUserOk,socClean}')({},()=>0,()=>0,()=>0);
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
console.log('rendben: közösségi profil (SQL és kliens egyezik)');
