// A 0. fázis mockupjainak generálása: node docs/mockups/uj/build.js
// Egy közös szerkezet, három irány: a kinézetet az app valódi tokenjei és elemkészlete adja (css/tokens.css, ui-kit.css).
const fs=require('fs'),path=require('path');
const FONT={pro:'family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600',gym:'family=Anton&family=Archivo:wght@400;600;800',family:'family=Atkinson+Hyperlegible:wght@400;700'};
const SCH={pro:['paper','stone','graphite'],gym:['yellow','orange','green'],family:['green','warm','cool']};
const NAME={pro:'Pro',gym:'Gym',family:'Family'};
const IC={dumbbell:'M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12',cal:'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',log:'M6 4h12v16H6zM9 9h6M9 13h6M9 17h3',food:'M3 12h18a9 9 0 01-18 0zM8 7.5c0-1.5 1-2 0-3.5M12 7.5c0-1.5 1-2 0-3.5',book:'M12 6.5C10 5 7 4.5 4 5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v14',chart:'M4 20h16M7 20v-8M12 20V5M17 20v-5',people:'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M16 11a3 3 0 100-6M18 14a5 5 0 013 5',cycle:'M20 12a8 8 0 11-2.3-5.6M20 4v4h-4',user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',sliders:'M4 7h9M17 7h3M4 17h3M11 17h9M15 4.5v5M9 14.5v5',calc:'M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2M9 18.5h6',edit:'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3',check:'M5 12.5l4.5 4.5L19 7',back:'M14 4l-7 7 7 7',x:'M6 6l12 12M18 6L6 18',plus:'M12 5v14M5 12h14',search:'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',help:'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17v.5',info:'M12 11v6M12 7.5v.5M12 21a9 9 0 100-18 9 9 0 000 18z',up:'M5 15l7-7 7 7',home:'M4 11l8-7 8 7M6 10v10h12V10',lock:'M6 11h12v9H6zM9 11V8a3 3 0 016 0v3',star:'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z',drop:'M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z',minus:'M5 12h14'};
const ico=(n,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="var(--ui-ico-sw)" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`;
const btn=(t,v='pri',x='')=>`<button type="button" class="k-btn ${v} ${x}">${t}</button>`;
const fr=(t,d,inner)=>`<section class="fr"><h2 class="fr-t">${t}</h2><p class="fr-d">${d}</p><div class="ph">${inner}</div></section>`;
const hd=(t,right='')=>`<div class="ph-hd"><span class="ic">${ico('back',20)}</span><h1 class="ph-t">${t}</h1><span style="min-width:44px;display:flex;justify-content:flex-end">${right}</span></div>`;
const qm=`<button type="button" class="qm" aria-label="Súgó">?</button>`;
const sw=(l,s,on)=>`<div class="k-sw" role="switch" aria-checked="${on}"><span class="k-sw-tx"><span class="k-sw-t">${l}</span>${s?`<span class="k-sw-s">${s}</span>`:''}</span><span class="k-sw-tr" aria-hidden="true"><span class="k-sw-th"></span></span></div>`;
const seg=(o,v)=>`<div class="k-seg" role="group">${o.map(x=>`<button type="button" aria-pressed="${x===v}">${x}</button>`).join('')}</div>`;
const card=(inner,x='')=>`<div class="k-card ${x}">${inner}</div>`;
const sec=(t,inner)=>`<section class="k-sec"><div class="k-sec-h"><h2 class="k-sec-t">${t}</h2></div>${inner}</section>`;
const field=(l,v,u)=>`<label class="k-fld"><span class="k-fld-l">${l}</span><span class="k-fld-w"><input class="k-in" value="${v}" readonly>${u?`<span class="k-fld-u">${u}</span>`:''}</span></label>`;

// ---- képernyők ----
const LEVELS=[
 ['Csak a lényeg','Egyszerű, csak az edzésnapló.',['Edzés indítása és naplózása','Terv és napló az edzéseidről','Profil és beállítások','Tiszta, rövid kezdőlap']],
 ['Ajánlott','A legtöbb embernek ez elég.',['A lényeg, plusz étel és kalória','Testsúly és méretek követése','Heti haladás, ha kéred a kezdőlapon','Kedvencek az ételekhez']],
 ['Minden','Minden eszköz, a gyakorlottaknak.',['Receptek és vízbevitel','Közösség, csoportok, kihívások','Fotók, ciklus-követés, számolók','Részletes statisztika és export']]];
const levelCards=sel=>`<div class="ob-list">${LEVELS.map((l,i)=>`<button type="button" class="ob-card" aria-pressed="${i===sel}"><span class="ob-n"><span>${l[0]}</span>${i===1?'<span class="badge">Ajánlott</span>':''}</span><span class="ob-s" style="display:block">${l[1]}</span><ul class="ob-ul">${l[2].map(x=>`<li>${x}</li>`).join('')}</ul><span class="chk">${ico('check',24)}</span></button>`).join('')}</div>`;

const F={};
F.login=()=>fr('M2 · Bejelentkezés, vendég móddal','Új: „Folytatás vendégként”, alatta egyetlen mondat arról, hogy az adat csak helyi. A Google-belépés és a handoff érintetlen.',
`<div style="text-align:center;margin:8px 0 20px"><div class="k-brand"><span class="k-logo">${ico('dumbbell',34)}</span><h1 class="k-brand-t">Edzésnapló</h1><p class="k-hint" style="margin:0">Kövesd, tervezd és told a határaidat</p></div></div>
 ${card(`<div class="k-mb">${seg(['Belépés','Regisztráció'],'Belépés')}</div><button type="button" class="k-btn k-google full"><span class="k-gl" style="background:conic-gradient(#ea4335 0 25%,#fbbc05 0 50%,#34a853 0 75%,#4285f4 0)">G</span>Folytatás Google-lel</button><div class="k-or"><span></span>vagy<span></span></div><div class="k-stack">${field('E-mail','teszt@pelda.hu')}${field('Jelszó','••••••••')}${btn('Belépés','pri','full')}</div>`)}
 <div class="k-or" style="margin:4px 0 12px"><span></span>vagy<span></span></div>
 ${btn('Folytatás vendégként','sec','full')}
 <p class="guest">${ico('info',18)}<span>Vendégként az adataid csak ezen a készüléken tárolódnak.</span></p>`);
F.level=()=>fr('M1 · Szint-választó (új felhasználó)','3. lépés az onboardingban (1: bejelentkezés, 2: felület-választó, 3: szint, 4: bemutató). A középső kártya előre kijelölve. „Később” = Ajánlott.',
`<p class="ph-k">3 / 4</p><h1 class="ph-h1">Mennyi funkciót szeretnél látni?</h1><p class="ph-p">Bármikor átállíthatod a Beállításokban. Semmi sem törlődik, csak elrejtjük.</p>${levelCards(1)}
 <div class="ph-foot">${btn('Ezt választom','pri')}${btn('Később','gho')}</div>`);
F.levelOld=()=>fr('M1b · Szint-választó (meglévő felhasználó)','K3: akinek már van fiókja, a következő indításkor egyszer ezt kapja. Amíg nem választ, a Minden szint él. A felület-választót nem kérjük újra.',
`<p class="ph-k">Újdonság</p><h1 class="ph-h1">Válaszd ki, mennyit szeretnél látni</h1><p class="ph-p">Eddig minden látszott. Szűkítheted az appot, semmi nem törlődik, és bármikor visszaállíthatod.</p>${levelCards(2)}
 <div class="ph-foot">${btn('Ezt választom','pri')}${btn('Később (mindent mutat)','gho')}</div>`);
const TOUR=[
 ['dumbbell','1 / 3','Indíts egy edzést','A Kezdőlapról egy koppintással elindul a mai edzés. Közben csak a következő sorozat látszik.'],
 ['search','2 / 3','A menü mindent tud','Nyisd meg a menüt, és keress rá bármire: ételre, fotóra, kihívásra. A rejtett funkciókat is megtalálja.'],
 ['help','3 / 3','Elakadtál? Koppints a ? jelre','Minden képernyőn van egy kis ? gomb, ami elmagyarázza, mit látsz és hogyan használd.']];
TOUR.forEach((t,i)=>{F['tour'+i]=()=>fr('M2 · Bemutató '+(i+1)+'. lépés','Opcionális, átugorható. Három rövid lépés, utána a Kezdőlap.',
`<p class="ph-k">${t[1]}</p><div class="tour-i">${ico(t[0],72)}</div><h1 class="ph-h1">${t[2]}</h1><p class="ph-p">${t[3]}</p><div class="dots">${[0,1,2].map(j=>`<i class="${j===i?'on':''}"></i>`).join('')}</div>
 <div class="ph-foot">${btn(i===2?'Kezdjük':'Tovább','pri')}${btn('Átugrom','gho')}</div>`)});

const week=`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;font-size:12px;color:rgb(var(--ui-muted))">${['H','K','Sze','Cs','P','Szo','V'].map((d,i)=>`<span>${d}<br><i style="display:inline-block;margin-top:6px;width:10px;height:10px;border-radius:50%;background:${i<1?'rgb(var(--ui-accent))':i===1?'transparent':'rgb(var(--ui-line2))'};border:${i===1?'2px solid rgb(var(--ui-accent))':'0'}"></i></span>`).join('')}</div>`;
F.home=()=>fr('M8 · Kezdőlap (alap: letisztult)','K4: csak üdvözlés, mai edzés, indítás és a heti napsor. A többit a felhasználó kéri a „Kezdőlap testreszabása” sorral. Vendég esetén halk jelzés.',
`<div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 20px"><span class="ph-k" style="margin:0">Kedd · okt. 13.</span><span class="chip-g">Vendég · csak helyi adat</span></div>
 <p class="ph-k">Mai edzés</p><h1 class="ph-h1" style="font-size:40px">Nyomó</h1><p class="ph-p">6 gyakorlat · kb. 55 perc · utoljára 4 napja</p>
 ${btn('Edzés indítása '+ico('check',18),'pri','full')}
 <div style="margin:28px 0 8px">${week}</div>
 <button type="button" class="mr" style="margin-top:24px"><span class="mr-i">${ico('sliders',22)}</span><span class="mr-tx"><span class="mr-t" style="font-size:15px">Kezdőlap testreszabása</span><span class="mr-d">Válaszd ki, mit lássál itt</span></span>${ico('back',18).replace('<svg','<svg style="transform:rotate(180deg)"')}</button>
 <div class="ph-foot"><button type="button" class="k-btn sec full" style="justify-content:space-between"><span>Menü</span><span class="k-hint" style="margin:0">Edzés · Terv · Napló · +2</span></button></div>`);
const cardsList=[['Heti napsor',true],['Heti volumen',false],['Rekordok',false],['Új rekord',false],['Hetes széria',false],['Heti sorozatok izomcsoportonként',false],['Könnyű mozdulatok',false],['Gyors betűméret',false]];
F.homeSheet=()=>fr('M8 · Kezdőlap tartalma (lap)','Ugyanaz mindhárom irányban. A szint adja az alapot, a felhasználó felülírhatja. A Beállításokból is elérhető.',
`<div style="opacity:.5;pointer-events:none"><p class="ph-k">Mai edzés</p><h1 class="ph-h1" style="font-size:40px">Nyomó</h1></div><div class="scrim"></div>
 <div class="hs" style="bottom:0"><h3>Kezdőlap tartalma</h3><p class="what" style="margin:0 0 4px;color:rgb(var(--ui-muted))">Az Ajánlott szint alapja. Bármelyiket be- vagy kikapcsolhatod.</p>
 <div>${cardsList.map(c=>sw(c[0],'',c[1])).join('')}</div>${btn('Kész','pri','full')}</div>`);
const mrow=(i,t,d,b,lock)=>`<button type="button" class="mr${lock?' mr-lock':''}"><span class="mr-i">${ico(i,22)}</span><span class="mr-tx"><span class="mr-t">${t}</span><span class="mr-d">${d}</span></span>${b?`<span class="mr-b">${b}</span>`:''}</button>`;
F.menu=()=>fr('M3 · Menü csoportokkal és kereséssel (Ajánlott szint)','Négy csoport (üres csoport nem látszik), kereső, fix lábsor, „Még N funkció”. A leírások irányonként a meglévő UI_MENU szövegei maradnak.',
`<h1 class="ph-t" style="margin:0 0 12px">Menü</h1><div class="srch">${ico('search',20)}<input class="k-in" placeholder="Keress funkciót…" readonly></div>
 <div class="mg"><p class="mg-h">Ma</p>${mrow('dumbbell','Edzés','Mai edzés és a gyakorlatok')}${mrow('cal','Terv','Heti terv és célsúlyok')}${mrow('log','Napló','Korábbi edzések')}</div>
 <div class="mg"><p class="mg-h">Étkezés</p>${mrow('food','Étel','Kalória és makrók')}</div>
 <div class="mg"><p class="mg-h">Fejlődés</p>${mrow('chart','Test és mérések','Súly és méretek')}</div>
 <div class="more">Még 6 funkció elérhető. Beállítások › Szint</div>
 <div class="mfoot">${mrow('user','Profil','Adatok és célok')}${mrow('sliders','Beállítások','Felület, szint, fiók')}${mrow('help','Súgó','Hogyan működik?')}</div>`);
F.menuFull=()=>fr('M3 · Menü, Minden szint','Fejlődés alatt a Számolók, Statisztikák és Ciklus (ha be van kapcsolva); a Közösség külön csoport.',
`<h1 class="ph-t" style="margin:0 0 12px">Menü</h1><div class="srch">${ico('search',20)}<input class="k-in" placeholder="Keress funkciót…" readonly></div>
 <div class="mg"><p class="mg-h">Ma</p>${mrow('dumbbell','Edzés','Mai edzés és a gyakorlatok')}${mrow('cal','Terv','Heti terv és célsúlyok')}${mrow('log','Napló','Korábbi edzések')}</div>
 <div class="mg"><p class="mg-h">Étkezés</p>${mrow('food','Étel','Kalória és makrók')}${mrow('book','Receptek','Ötletek és mentett ételek')}</div>
 <div class="mg"><p class="mg-h">Fejlődés</p>${mrow('chart','Test és mérések','Súly, méretek, fotók')}${mrow('star','Statisztikák és rekordok','Rekordok, grafikonok')}${mrow('calc','Számolók','Kardió, kalória, erő')}${mrow('cycle','Ciklus','Ha bekapcsoltad')}</div>
 <div class="mg"><p class="mg-h">Közösség</p>${mrow('people','Közösség','Barátok, csoportok, kihívások')}</div>
 <div class="mfoot">${mrow('user','Profil','Adatok és célok')}${mrow('sliders','Beállítások','Felület, szint, fiók')}${mrow('help','Súgó','Hogyan működik?')}</div>`);
F.search=()=>fr('M3 · Keresés (találatok)','A rejtett funkciót is megtalálja, jelzi, hogy a szinteden nem látszik, és egy koppintással megnyitja. A súgó-címeket is keresi.',
`<h1 class="ph-t" style="margin:0 0 12px">Menü</h1><div class="srch">${ico('search',20)}<input class="k-in" value="fotó" readonly></div>
 <div class="mg"><p class="mg-h">Funkciók</p>${mrow('chart','Haladási fotók','Test és mérések › Fotók','Nem látszik a szinteden',true)}${mrow('chart','Fotó-összehasonlítás','Test és mérések › Fotók','Nem látszik a szinteden',true)}</div>
 <div class="mg"><p class="mg-h">Súgó</p>${mrow('help','Fotó megosztása','Ki láthatja a fotóidat?')}</div>
 <p class="k-hint" style="margin:16px 0 0">Egy találat megnyitja a funkciót akkor is, ha a szinteden nem látszik. A szint a Beállításokban állítható.</p>`);
F.tip=()=>fr('M4 · Súgó: „?” gomb és első-látogatás tipp','A „?” minden képernyő fejlécében. A tipp képernyőnként egyszer jelenik meg (Csak a lényeg és Ajánlott szinten), bezárható.',
`${hd('Terv',qm)}<div class="tip"><b>Mi ez a képernyő?</b>Itt adod meg, melyik napon mit edzel. A „?” jelre koppintva bármikor elolvasod.<span class="x">${ico('x',18)}</span></div>
 ${card(`<div class="k-day"><span class="k-day-n">Hétfő</span><label class="k-fld"><select class="k-in"><option>Nyomó (Push)</option></select></label></div><div class="k-goals"><div class="k-goal"><span>Fekvenyomás</span><b>82,5 kg × 8</b></div><div class="k-goal"><span>Vállnyomás</span><b>42,5 kg × 10</b></div></div>`)}
 ${card(`<div class="k-day"><span class="k-day-n">Kedd</span><label class="k-fld"><select class="k-in"><option>Pihenőnap</option></select></label></div>`)}`);
F.help=()=>fr('M4 · Súgó-lap','A közös alsó lap (KSheet): cím, „mi ez”, „hogyan használd”, tipp. Egy forrásból (help.js), magyarul és angolul.',
`${hd('Terv',qm)}<div style="opacity:.55">${card(`<div class="k-day"><span class="k-day-n">Hétfő</span><span style="flex:1"></span></div>`)}</div><div class="scrim"></div>
 <div class="hs"><div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 8px"><h3 style="margin:0">Terv</h3><span class="ic" style="display:flex">${ico('x',22)}</span></div>
 <p class="what">Itt adod meg, melyik napon mit edzel. Az app a célsúlyokat az előző hasonló edzésed alapján számolja.</p>
 <ol><li>Válassz edzést minden napra.</li><li>A zöld számok a mai célsúlyok.</li><li>Az értesítéseket lent kapcsolhatod be.</li></ol>
 <p class="tp">Tipp: a „Minta terv” gombbal azonnal kapsz egy heti beosztást.</p>${btn('Értem','pri','full')}</div>`);
F.stats=()=>fr('M5 · Statisztikák és rekordok (Fejlődés)','Gyűjtő nézet a meglévő adatokból: rekordok, fejlődés-grafikon, heti volumen, izomcsoportok, széria. A Kezdőlapról ide kerülnek a kikapcsolt kártyák.',
`${hd('Statisztikák',qm)}${seg(['Rekordok','Fejlődés','Heti'],'Rekordok')}<div style="height:12px"></div>
 ${sec('Rekordok (becsült 1RM)',card(`<div class="k-list"><div class="k-row"><span class="k-row-tx"><span class="k-row-t">Guggolás</span><span class="k-row-s">100 kg × 5, okt. 5.</span></span><span class="k-row-r"><b class="k-pr">117 kg</b></span></div><div class="k-row"><span class="k-row-tx"><span class="k-row-t">Fekvenyomás</span><span class="k-row-s">80 kg × 8, okt. 12.</span></span><span class="k-row-r"><b class="k-pr">101 kg</b></span></div></div>`))}
 ${sec('Heti volumen',card(`<svg class="sp" viewBox="0 0 300 100"><line class="sp-g" x1="8" x2="292" y1="90" y2="90"/><polyline class="sp-l" points="10,70 52,62 94,66 136,48 178,52 220,34 262,28"/><circle class="sp-d" cx="262" cy="28" r="4"/></svg><p class="k-hint" style="margin:6px 0 0">12 480 kg · +8% a múlt hétnél · 3 hetes széria</p>`))}
 ${sec('Izomcsoportok, utolsó 7 nap',card(['Mell','Hát','Láb'].map((g,i)=>`<div class="k-bar"><span class="k-bar-l">${g}</span><div class="k-bar-tr"><div class="k-bar-f" style="--p:${[1,.6,.4][i]}"></div></div><span class="k-bar-n">${[12,8,5][i]}</span></div>`).join('')))}`);
F.workout=()=>fr('M6 · Edzés: az új elemek (meglévő stílusban)','Előző alkalmak sorozatai, RPE, sorozat hozzáadása, ±15 mp és idő a hiányzó irányokban. A pw/gw/fw nézetek kerete marad, ez a kiegészítést mutatja szint szerint (Ajánlott: előző sorozatok, ±15; Minden: RPE).',
`<div class="ph-hd"><span class="ic">${ico('back',20)}</span><span class="ph-k" style="margin:0">Nyomó · 1 / 6</span><span class="k-hint" style="margin:0">12:48</span></div>
 <h1 class="ph-h1">Fekvenyomás</h1><p class="ph-p" style="margin:0 0 12px">Legutóbb: 80 kg × 8 · rekord 82,5 kg</p>
 <div class="st-g"><span>#</span><span>KG</span><span>ISM</span><span>RPE <span class="nt">Minden</span></span><span>KÉSZ</span></div>
 ${[["1","80","8","7",1],["2","80","8","8",1],["3","82,5","6","",0]].map(r=>`<div class="st-r2"><span>${r[0]}</span><input class="in" value="${r[1]}" readonly><input class="in" value="${r[2]}" readonly><input class="in" value="${r[3]}" placeholder="–" readonly><span class="ck${r[4]?' on':''}">${r[4]?ico('check',22):''}</span></div>`).join('')}
 <button type="button" class="k-btn sec sm full" style="margin:4px 0 12px">${ico('plus',16)} Sorozat hozzáadása</button>
 ${card(`<div class="k-cd-t" style="margin-bottom:8px">Előző alkalmak <span class="nt">Ajánlott</span></div><div class="pv"><div class="pv-r"><span class="pv-d">okt. 9.</span><b>80×8 · 80×8 · 80×6</b></div><div class="pv-r"><span class="pv-d">okt. 5.</span><b>77,5×8 · 77,5×8 · 77,5×7</b></div><div class="pv-r"><span class="pv-d">okt. 1.</span><b>75×8 · 75×8 · 75×8</b></div></div>`)}
 <div class="rst"><span class="rst-v">1:30</span><button type="button" class="k-btn sec sm">−15</button><button type="button" class="k-btn sec sm">+15</button></div>`);
F.settings=()=>fr('M7 · Beállítások: az új sorok','Szint, Kezdőlap tartalma, Nagy kontraszt, Csendes órák, JSON-export, Alapértékek visszaállítása. A meglévő kártyák (felület, nyelv, betűméret…) változatlanok.',
`${hd('Beállítások',qm)}
 ${card(`<div class="k-cd-t">Szint</div><p class="k-hint" style="margin:0 0 10px">Mennyi funkciót lássál. Semmi nem törlődik, a keresés mindent megtalál.</p>${seg(['Lényeg','Ajánlott','Minden'],'Ajánlott')}<button type="button" class="mr" style="margin-top:8px"><span class="mr-tx"><span class="mr-t" style="font-size:15px">Kezdőlap tartalma</span><span class="mr-d">Napsor, volumen, rekordok…</span></span>${ico('back',18).replace('<svg','<svg style="transform:rotate(180deg)"')}</button>`)}
 ${card(`<div class="k-cd-t">Megjelenés</div>${sw('Nagy kontraszt','Erősebb szöveg és vonalak',false)}${sw('Animációk','Kikapcsolva gyorsabb, kíméli az akkut',true)}`)}
 ${card(`<div class="k-cd-t">Értesítések</div>${sw('Edzés-emlékeztető','A tervezett napokon',true)}${sw('Csendes órák','Ilyenkor nem szól az app',true)}<div class="k-g2" style="margin-top:8px">${field('Tól','22:00')}${field('Ig','07:00')}</div>`)}
 ${card(`<div class="k-cd-t">Adatok</div><div class="k-btns"><button type="button" class="k-btn sec sm">CSV</button><button type="button" class="k-btn sec sm">PDF</button><button type="button" class="k-btn sec sm">JSON</button></div><button type="button" class="k-btn dan sm full">Alapértékek visszaállítása</button>`)}`);

const ORDER=['login','level','levelOld','tour0','tour1','tour2','home','homeSheet','menu','menuFull','search','tip','help','stats','workout','settings'];
const NOTE=`<p class="pg-n">0. fázis mockupok, magyarul. Az angol szövegek az implementációban készülnek a setDict-ben. A kinézetet az app valódi tokenjei adják, ezért a séma is váltható. <a href="index.html">Vissza az indexre</a></p>`;
function page(ui){
 const links=SCH[ui].map(s=>`<a href="?s=${s}" data-s="${s}">${s}</a>`).join('');
 return `<!doctype html><html lang="hu" data-ui="${ui}" data-scheme="${SCH[ui][0]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${NAME[ui]} – új mockupok</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${FONT[ui]}&display=swap">
<link rel="stylesheet" href="../../../css/tokens.css"><link rel="stylesheet" href="../../../css/base.css"><link rel="stylesheet" href="../../../css/motion.css"><link rel="stylesheet" href="../../../css/ui-kit.css"><link rel="stylesheet" href="uj.css">
<style>.k-card{margin-bottom:12px}</style></head><body><div class="pg">
<div class="pg-h"><h1>${NAME[ui]}: új mockupok</h1></div>${NOTE}
<div class="pg-sw" role="navigation" aria-label="Színséma">${links}</div>
<div class="frs">${ORDER.map(k=>F[k]()).join('\n')}</div></div>
<script>(function(){try{var s=new URLSearchParams(location.search).get('s'),ok=${JSON.stringify(SCH[ui])};if(s&&ok.indexOf(s)>-1)document.documentElement.setAttribute('data-scheme',s);var c=document.documentElement.getAttribute('data-scheme');document.querySelectorAll('.pg-sw a').forEach(function(a){if(a.dataset.s===c)a.setAttribute('aria-current','page')})}catch(e){}})();</script></body></html>`;
}
for(const ui of ['pro','gym','family'])fs.writeFileSync(path.join(__dirname,ui+'.html'),page(ui));
fs.writeFileSync(path.join(__dirname,'index.html'),`<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Új mockupok</title><style>body{font:16px/1.5 system-ui,sans-serif;margin:0;padding:24px;max-width:560px}a{display:block;padding:14px;margin:0 0 10px;border:1px solid #888;border-radius:8px;color:inherit;text-decoration:none}h1{font-size:22px}</style></head><body><h1>0. fázis: új mockupok</h1><p>Mindhárom irányban ugyanaz a 16 képernyő: bejelentkezés vendég móddal, szint-választó (új és meglévő felhasználó), bemutató, Kezdőlap (letisztult) és testreszabása, menü kereséssel, súgó, statisztikák, edzés-kiegészítések, beállítások.</p><a href="pro.html">Pro</a><a href="gym.html">Gym</a><a href="family.html">Family</a></body></html>`);
console.log('kész:',ORDER.length,'képernyő × 3 irány');
