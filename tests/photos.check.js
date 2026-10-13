// Haladási fotók: a kliens és az SQL szabályai egyezzenek. Futtatás: node tests/photos.check.js
const fs=require('fs'),path=require('path'),assert=require('assert');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const sql=rd('supabase/progress_photos.sql'),src=rd('js/photos.js'),sqlc=sql.replace(/--.*$/gm,'');
// csak a tiszta (böngésző nélküli) részek: állandók, útvonal, napok, hibaüzenetek
const lines=src.split('\n').filter(l=>/^const (PH_BUCKET|phPath|phDays|phGap)/.test(l)).join('\n');
const err=/const phErr=[\s\S]*?\n return'A fotó mentése[^\n]*\};/.exec(src)[0];
const k=new Function('pd','LANG',lines+'\n'+err+';return{PH_BUCKET,PH_MAX,PH_THUMB,phPath,phDays,phGap,phErr}')(s=>{const[a,b,c]=s.split('-');return new Date(+a,b-1,+c)},'hu');
// tároló és tábla
assert.strictEqual(k.PH_BUCKET,'progress-photos');
assert.ok(sql.includes("values ('progress-photos', 'progress-photos', false"),'a tároló nem privát vagy más a neve');
assert.ok(/allowed_mime_types[\s\S]*image\/jpeg/.test(sql),'csak JPEG lehet');
assert.ok(src.includes('progress_photos?'),'a kliens a progress_photos táblát használja');
// RLS és jogok
assert.ok(/alter table public\.progress_photos enable row level security/.test(sql));
assert.ok(/revoke all on public\.progress_photos from anon/.test(sql),'anon jog nincs elvéve');
assert.ok(/grant update \(taken_on, note, shared\)/.test(sql),'csak három oszlop módosítható');
for(const p of ['progress_photos_select','progress_photos_insert','progress_photos_update','progress_photos_delete','progress_photos_obj_select','progress_photos_obj_insert','progress_photos_obj_delete'])assert.ok(new RegExp('create policy '+p+' ').test(sql),p+' hiányzik');
assert.ok(/shared and public\.social_can_view\(user_id\)/.test(sql),'a megosztott fotó láthatósága a social_can_view-ra épül');
assert.ok(/\(storage\.foldername\(name\)\)\[1\] = \(select auth\.uid\(\)\)::text/.test(sql),'a fájl csak a saját mappába mehet');
assert.ok(!/service_role/i.test(src+sqlc),'service role nem szerepelhet');
assert.ok(!/public\s*=\s*true/.test(sqlc),'a tároló nem lehet nyilvános');
// a fájlnév-forma egyezik az SQL-ben és a kliensben
const id='11111111-2222-4333-8444-555555555555';
assert.strictEqual(k.phPath('u1',id),'u1/'+id+'.jpg');assert.strictEqual(k.phPath('u1',id,true),'u1/'+id+'_t.jpg');
assert.ok(sql.includes("p.user_id::text || '/' || p.id::text || '.jpg'")&&sql.includes("'/' || p.id::text || '_t.jpg'"),'az SQL fájlnév-formája eltér a klienstől');
// védelem: napi korlát és darabszám, a kliens ismeri a hibákat
assert.ok(sql.includes("social_check_rate('photo', 20"));assert.ok(sql.includes('>= 300'));
assert.ok(k.phErr({status:500,j:{message:'photo_limit'}}).includes('300'));
assert.ok(k.phErr({status:404,j:{}}).includes('nincs bekapcsolva'));
assert.ok(k.phErr({status:400,j:{message:'rate_limit'}}).includes('holnap'));
// számítások
assert.strictEqual(k.phDays('2026-10-01','2026-10-13'),12);assert.strictEqual(k.phDays('2026-10-13','2026-10-01'),12);
assert.strictEqual(k.phGap(1),'1 nap különbség');
assert.ok(k.PH_MAX>k.PH_THUMB&&k.PH_MAX<=2000);
// a megosztás csak profil mellett
assert.ok(/not shared or exists \(select 1 from public\.profiles/.test(sql));assert.ok(/progress_photos_unshare/.test(sql));
console.log('rendben: haladási fotók (SQL és kliens)');
