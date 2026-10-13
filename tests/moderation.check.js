// Jelentés és tiltás: a kliens és az SQL szabályai egyezzenek. Futtatás: node tests/moderation.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const sql=rd('supabase/social_3_moderation.sql'),sqlc=sql.replace(/--.*$/gm,''),src=rd('js/social-mod.js');
const head=src.slice(src.indexOf('const SOC_REASONS'),src.indexOf('const socHid'))+src.slice(src.indexOf('const modErr'),src.indexOf('const modFail'));
const k=new Function(head+';return{SOC_REASONS,SOC_RTITLE,modErr}')();
const list=s=>[...s.matchAll(/'([^']+)'/g)].map(x=>x[1]);
// okok és célfajták egyeznek
assert.deepStrictEqual(list(/reason in \(([^)]*)\)/.exec(sql)[1]),k.SOC_REASONS.map(x=>x[0]),'jelentés-okok eltérnek');
assert.deepStrictEqual(list(/target_type in \(([^)]*)\)/.exec(sql)[1]),Object.keys(k.SOC_RTITLE),'jelentés-célfajták eltérnek');
// a kliens által hívott RPC-k léteznek
for(const f of [...src.matchAll(/rpc\/(social_[a-z_]+)/g)].map(x=>x[1]))assert.ok(sql.includes('create or replace function public.'+f+'('),'hiányzó RPC: '+f);
// jogosultságok
for(const t of ['blocks','reports'])assert.ok(sql.includes('alter table public.'+t+' enable row level security'),t+': RLS hiányzik');
assert.ok(sql.includes('revoke all on public.blocks from anon, authenticated')&&sql.includes('revoke all on public.reports from anon, authenticated'),'jogok nincsenek elvéve');
assert.ok(sql.includes('grant select, insert on public.reports to authenticated'),'a jelentés nem módosítható és nem törölhető a kliensből');
assert.ok(!/service_role/i.test(src+sqlc),'service role nem szerepelhet');
// a tiltás kétirányú, és minden hivatkozó szabály ugyanazt a függvényt használja
assert.ok(/blocker_id = a and blocked_id = b\) or \(blocker_id = b and blocked_id = a/.test(sql),'a tiltás nem kétirányú');
assert.ok(sql.includes('social_is_blocked(auth.uid(), m.user_id)'),'a ranglista nem szűri a tiltottakat');
assert.ok(sql.includes('drop policy if exists social_group_members_select'),'a tag-lista szabály nincs cserélve');
for(const f of ['social_1_profiles','social_2_follows','social_2b_activities'])assert.ok(rd('supabase/'+f+'.sql').includes('social_is_blocked'),f+' nem használja a tiltást');
// korlátok és hibák
assert.ok(sql.includes("social_check_rate('report', 10")&&sql.includes("social_check_rate('block', 30"));
assert.ok(sql.includes('create unique index if not exists reports_once'),'egy célt csak egyszer lehet jelenteni');
assert.ok(sql.includes('reporter_id <> target_user_id'),'magadat nem jelentheted');
assert.ok(sql.includes("raise exception 'report_target'"));
assert.ok(k.modErr({status:400,j:{message:'report_target'}}).includes('már nem'));
assert.ok(k.modErr({status:404,j:{}}).includes('nincs bekapcsolva'));
// takarítás tiltáskor: követés, barátkérés, csoport
for(const t of ['public.follows','public.friend_requests','public.social_group_members'])assert.ok(sql.includes('delete from '+t),'tiltáskor nem törlődik: '+t);
// a kezelési lekérdezések ott vannak a fájl végén
assert.ok(/status = 'open' order by/.test(sql));
console.log('rendben: jelentés és tiltás (SQL és kliens)');
