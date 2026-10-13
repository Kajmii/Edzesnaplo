// Csoportok és kihívások: a kliens és az SQL szabályai egyezzenek. Futtatás: node tests/groups.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const sql=rd('supabase/social_4_groups.sql'),sqlc=sql.replace(/--.*$/gm,''),src=rd('js/social-groups.js');
const util=rd('js/util.js').split('\n').filter(l=>/^const (pad|dk|pd)=/.test(l)).join('\n');
const head=src.slice(src.indexOf('const GRP_KINDS'),src.indexOf('const grpFail'));
const k=new Function('LANG',util+'\n'+head+';return{GRP_KINDS,GRP_LEN,grpVal,grpEnds,grpState,grpRank,grpErr,grpName,grpUnit}')('hu');
// a kihívás-fajták egyeznek
const kinds=[...(/kind in \(([^)]*)\)/.exec(sql)[1]).matchAll(/'([^']+)'/g)].map(x=>x[1]);
assert.deepStrictEqual(kinds,k.GRP_KINDS,'kihívás-fajták eltérnek');
// minden RPC, amit a kliens hív, létezik az SQL-ben
for(const f of [...src.matchAll(/rpc\/(social_[a-z_]+)/g)].map(x=>x[1]))assert.ok(sql.includes('create or replace function public.'+f+'('),'hiányzó RPC: '+f);
// jogosultságok
for(const t of ['social_groups','social_group_members','social_challenges'])assert.ok(sql.includes('alter table public.'+t+' enable row level security'),t+': RLS hiányzik');
assert.ok(/revoke all on public\.social_groups, public\.social_group_members, public\.social_challenges from anon, authenticated/.test(sql),'jogok nincsenek elvéve');
assert.ok(/grant select \(id, owner_id, name, created_at\) on public\.social_groups/.test(sql),'a meghívó kód oszlop nem olvasható közvetlenül');
assert.ok(!/invite_code[^;]*to authenticated/.test(sqlc.replace(/returns table[^)]*\)/g,'')),'a kód oszlopot nem adhatjuk ki közvetlenül');
assert.ok(!/service_role/i.test(src+sqlc),'service role nem szerepelhet');
// korlátok
assert.ok(sql.includes(">= 30"),'30 tag');assert.ok(sql.includes(">= 10"),'10 csoport');assert.ok(sql.includes(">= 5"),'5 saját csoport');assert.ok(sql.includes(">= 3"),'3 futó kihívás');
assert.ok(sql.includes('ends_on - starts_on <= 31'));
assert.ok(sql.includes("social_check_rate('group_join', 20, interval '1 hour')"),'a kód nem találgatható');
assert.ok(sql.includes('social_name_ok(n)'),'a csoportnév szűrése hiányzik');
for(const e of ['group_not_found','group_full','group_limit','no_profile','name_blocked','name_invalid','challenge_limit','challenge_date'])assert.ok(sql.includes("'"+e+"'"),'az SQL nem dobja: '+e);
for(const e of ['group_not_found','group_full','group_limit','no_profile','name_blocked','name_invalid','challenge_limit','challenge_date'])assert.ok(src.includes("'"+e+"'"),'a kliens nem ismeri: '+e);
// számítások
assert.strictEqual(k.grpEnds('2026-10-13',7),'2026-10-19');assert.strictEqual(k.grpEnds('2026-10-30',3),'2026-11-01');
assert.strictEqual(k.grpState({starts_on:'2026-10-13',ends_on:'2026-10-19'},'2026-10-13'),'live');
assert.strictEqual(k.grpState({starts_on:'2026-10-13',ends_on:'2026-10-19'},'2026-10-20'),'done');
assert.strictEqual(k.grpState({starts_on:'2026-10-14',ends_on:'2026-10-19'},'2026-10-13'),'soon');
const rows=[{user_id:'a',workouts:2,sets:20,volume:5000},{user_id:'b',workouts:3,sets:10,volume:3000},{user_id:'c',workouts:2,sets:5,volume:100}];
assert.deepStrictEqual(k.grpRank(rows,'workouts').map(r=>[r.user_id,r.rank]),[['b',1],['a',2],['c',2]]);
assert.deepStrictEqual(k.grpRank(rows,'volume').map(r=>r.user_id),['a','b','c']);
assert.deepStrictEqual(k.grpRank([{user_id:'x',workouts:0},{user_id:'y',workouts:0}],'workouts').map(r=>r.rank),[1,1]);
assert.ok(k.grpErr({status:400,j:{message:'group_full'}}).includes('30'));assert.ok(k.grpErr({status:404,j:{}}).includes('nincsenek bekapcsolva'));
console.log('rendben: csoportok és kihívások (SQL és kliens)');
