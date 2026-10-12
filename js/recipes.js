/* ---------- Receptek: alapanyagok, számítás, címkék, javaslat ---------- */
// Alapanyagok 100 g-ra: kcal, fehérje, szénhidrát, zsír. Referencia-átlagértékek (USDA FoodData Central jellegű adatok); a tömegek nyers
// állapotra vonatkoznak, kivéve ahol a névben "főtt" szerepel. Jelzők: M hús/hal, A egyéb állati eredetű (tojás, tejtermék, méz),
// L laktózt tartalmaz, G glutént tartalmaz. pc: egy darab súlya grammban (ha számolható darabra).
const ING={};
const ig=(id,hu,en,k,p,c,f,fl,pc)=>{ING[id]={hu,en,k,p,c,f,fl:fl||'',pc:pc||0}};
// hús, hal
ig('csirkemell','Csirkemell (nyers)','Chicken breast (raw)',120,22.5,0,2.6,'M');
ig('csirkemell_sult','Csirkemell (sült)','Chicken breast (cooked)',165,31,0,3.6,'M');
ig('csirkecomb','Csirkecomb, bőr nélkül (nyers)','Chicken thigh, skinless (raw)',121,19.7,0,4.1,'M');
ig('pulykamell','Pulykamell (nyers)','Turkey breast (raw)',114,23.7,0,1.5,'M');
ig('darald_pulyka','Darált pulyka (nyers)','Ground turkey (raw)',148,20,0,7,'M');
ig('marha','Marhahús, sovány (nyers)','Lean beef (raw)',133,21.5,0,4.7,'M');
ig('darald_marha','Darált marha, 10% zsír (nyers)','Ground beef 10% fat (raw)',176,20,0,10,'M');
ig('sertes','Sertéskaraj, sovány (nyers)','Lean pork loin (raw)',143,21.4,0,5.7,'M');
ig('lazac','Lazac (nyers)','Salmon (raw)',208,20,0,13,'M');
ig('tonhal','Tonhal (konzerv, vizes lében)','Tuna (canned in water)',116,26,0,1,'M');
ig('tokehal','Tőkehal (nyers)','Cod (raw)',82,17.8,0,0.7,'M');
ig('garnela','Garnélarák (nyers, tisztított)','Shrimp (raw, peeled)',85,20.1,0,0.5,'M');
ig('pisztrang','Szivárványos pisztráng (nyers)','Rainbow trout (raw)',119,20.5,0,3.5,'M');
ig('szardinia','Szardínia (konzerv, olajban, lecsepegtetve)','Sardines (canned in oil, drained)',208,24.6,0,11.5,'M');
// tojás, tejtermék
ig('tojas','Tojás','Egg',143,12.6,0.7,9.5,'A',55);
ig('tojasfeher','Tojásfehérje','Egg white',52,11,0.7,0.2,'A',33);
ig('gorog_joghurt','Görög joghurt (0%)','Greek yogurt (0% fat)',59,10,3.6,0.4,'AL');
ig('joghurt','Natúr joghurt (3,5%)','Plain yogurt (3.5% fat)',61,3.5,4.7,3.3,'AL');
ig('turo','Túró (félzsíros)','Quark (semi-fat)',98,12,3.5,4.3,'AL');
ig('cottage','Cottage cheese (zsírszegény)','Cottage cheese (low-fat)',72,12.4,2.7,1,'AL');
ig('tej','Tej (2,8%)','Milk (2.8% fat)',60,3.2,4.8,2.8,'AL');
ig('lm_tej','Laktózmentes tej (1,5%)','Lactose-free milk (1.5% fat)',46,3.4,4.9,1.5,'A');
ig('lm_joghurt','Laktózmentes natúr joghurt','Lactose-free plain yogurt',61,3.5,4.7,3.3,'A');
ig('edami','Sajt (edami)','Cheese (Edam)',357,25,1.4,28,'AL');
ig('mozzarella','Mozzarella (zsírszegény, reszelhető)','Mozzarella (part-skim, shredded)',254,24.3,2.8,15.9,'AL');
ig('feta','Feta','Feta',264,14.2,4.1,21.3,'AL');
ig('parmezan','Parmezán','Parmesan',431,38.5,4.1,28.6,'AL');
ig('vaj','Vaj','Butter',717,0.9,0.1,81,'AL');
ig('mez','Méz','Honey',304,0.3,82.4,0,'A');
ig('whey','Fehérjepor (tejsavó)','Protein powder (whey)',390,78,8,6,'AL');
ig('borso_feherje','Fehérjepor (borsó, növényi)','Protein powder (pea)',380,76,7,6);
// gabonafélék, köretek
ig('rizs','Rizs (főtt, fehér)','Rice (cooked, white)',130,2.7,28,0.3);
ig('barna_rizs','Barna rizs (főtt)','Brown rice (cooked)',112,2.3,23.5,0.9);
ig('quinoa','Quinoa (főtt)','Quinoa (cooked)',120,4.4,21.3,1.9);
ig('kuszkusz','Kuszkusz (főtt)','Couscous (cooked)',112,3.8,23.2,0.2,'G');
ig('teszta','Tészta (főtt)','Pasta (cooked)',158,5.8,31,0.9,'G');
ig('tk_teszta','Teljes kiőrlésű tészta (főtt)','Whole wheat pasta (cooked)',124,5.3,26.5,0.5,'G');
ig('gf_teszta','Gluténmentes tészta (főtt, kukorica-rizs)','Gluten-free pasta (cooked, corn-rice)',130,2.8,28,0.7);
ig('rizstészta','Rizstészta (főtt)','Rice noodles (cooked)',108,0.9,24.9,0.2);
ig('burgonya','Burgonya (főtt)','Potato (cooked)',87,1.9,20,0.1);
ig('burgonya_ny','Burgonya (nyers)','Potato (raw)',77,2,17,0.1);
ig('edesburgonya','Édesburgonya (nyers)','Sweet potato (raw)',86,1.6,20,0.1);
ig('zab','Zabpehely','Rolled oats',379,13.2,67.7,6.5,'G');
ig('zab_gf','Zabpehely (gluténmentes)','Rolled oats (gluten-free)',379,13.2,67.7,6.5);
ig('kenyer','Teljes kiőrlésű kenyér','Whole grain bread',247,13,41,4.2,'G',35);
ig('gf_kenyer','Gluténmentes kenyér','Gluten-free bread',245,4,47,4.5,'',30);
ig('tortilla','Búzatortilla','Wheat tortilla',310,8.5,50,8,'G',50);
ig('kuk_tortilla','Kukoricatortilla','Corn tortilla',218,5.7,44.6,2.9,'',30);
ig('liszt','Búzaliszt','Wheat flour',364,10.3,76.3,1,'G');
ig('tk_liszt','Teljes kiőrlésű liszt','Whole wheat flour',340,13.2,72,2.5,'G');
ig('mandulaliszt','Mandulaliszt','Almond flour',571,21.4,21.4,50);
ig('kukoricaliszt','Kukoricaliszt','Corn flour',361,6.9,76.9,3.9);
ig('rizsliszt','Rizsliszt','Rice flour',366,6,80,1.4);
ig('kemenyito','Kukoricakeményítő','Corn starch',381,0.3,91,0.1);
// hüvelyesek, szója, növényi tejek
ig('lencse','Lencse (száraz)','Lentils (dry)',352,24.6,63.4,1.1);
ig('lencse_fott','Lencse (főtt)','Lentils (cooked)',116,9,20.1,0.4);
ig('csicseri','Csicseriborsó (főtt, konzerv)','Chickpeas (cooked, canned)',164,8.9,27.4,2.6);
ig('fekete_bab','Fekete bab (főtt)','Black beans (cooked)',132,8.9,23.7,0.5);
ig('voros_bab','Vörösbab (főtt)','Kidney beans (cooked)',127,8.7,22.8,0.5);
ig('feher_bab','Fehér bab (főtt)','White beans (cooked)',140,8.2,26,0.6);
ig('tofu','Tofu (kemény)','Tofu (firm)',144,17.3,2.8,8.7);
ig('tempeh','Tempeh','Tempeh',192,20.3,7.6,10.8);
ig('edamame','Edamame (főtt)','Edamame (cooked)',121,11.9,8.9,5.2);
ig('zoldborso','Zöldborsó','Green peas',81,5.4,14.5,0.4);
ig('hummusz','Hummusz','Hummus',166,7.9,14.3,9.6);
ig('szojatej','Szójatej (cukrozatlan)','Soy milk (unsweetened)',33,2.9,1.7,1.8);
ig('mandulatej','Mandulatej (cukrozatlan)','Almond milk (unsweetened)',15,0.6,0.3,1.2);
ig('zabtej','Zabital','Oat drink',46,1,6.5,1.5,'G');
ig('kokusztej','Kókusztej (konzerv)','Coconut milk (canned)',197,2,2.8,21.3);
// zöldségek
ig('brokkoli','Brokkoli','Broccoli',34,2.8,7,0.4);
ig('karfiol','Karfiol','Cauliflower',25,1.9,5,0.3);
ig('spenot','Spenót','Spinach',23,2.9,3.6,0.4);
ig('paradicsom','Paradicsom','Tomato',18,0.9,3.9,0.2,'',123);
ig('uborka','Uborka','Cucumber',15,0.7,3.6,0.1);
ig('paprika','Paprika (piros)','Bell pepper (red)',31,1,6,0.3,'',119);
ig('cukkini','Cukkini','Zucchini',17,1.2,3.1,0.3);
ig('padlizsan','Padlizsán','Eggplant',25,1,5.9,0.2);
ig('gomba','Gomba (csiperke)','Mushrooms (button)',22,3.1,3.3,0.3);
ig('hagyma','Vöröshagyma','Onion',40,1.1,9.3,0.1,'',110);
ig('fokhagyma','Fokhagyma','Garlic',149,6.4,33,0.5,'',3);
ig('sargarepa','Sárgarépa','Carrot',41,0.9,9.6,0.2,'',61);
ig('kaposzta','Káposzta','Cabbage',25,1.3,5.8,0.1);
ig('kelkaposzta','Kelkáposzta (kale)','Kale',49,4.3,8.8,0.9);
ig('salata','Jégsaláta','Iceberg lettuce',14,0.9,3,0.1);
ig('rukkola','Rukkola','Arugula',25,2.6,3.7,0.7);
ig('sparga','Spárga','Asparagus',20,2.2,3.9,0.1);
ig('zoldbab','Zöldbab','Green beans',31,1.8,7,0.2);
ig('sutotok','Sütőtök','Pumpkin',26,1,6.5,0.1);
ig('cekla','Cékla','Beetroot',43,1.6,9.6,0.2);
ig('retek','Retek','Radish',16,0.7,3.4,0.1);
ig('poreh','Póréhagyma','Leek',61,1.5,14.2,0.3);
ig('zeller','Zeller (szár)','Celery',16,0.7,3,0.2);
ig('kukorica','Csemegekukorica (konzerv, lecsepegtetve)','Sweet corn (canned, drained)',81,2.5,17,1.2);
ig('paradicsom_konz','Paradicsom (konzerv, aprított)','Tomatoes (canned, diced)',32,1.6,7.3,0.3);
ig('paradicsompure','Paradicsompüré','Tomato paste',82,4.3,19,0.5);
ig('salsa','Salsa','Salsa',36,1.5,7,0.2);
// gyümölcsök
ig('banan','Banán','Banana',89,1.1,23,0.3,'',118);
ig('alma','Alma','Apple',52,0.3,14,0.2,'',182);
ig('afonya','Áfonya','Blueberries',57,0.7,14,0.3);
ig('eper','Eper','Strawberries',32,0.7,7.7,0.3);
ig('malna','Málna','Raspberries',52,1.2,11.9,0.7);
ig('narancs','Narancs','Orange',47,0.9,11.8,0.1,'',131);
ig('mango','Mangó','Mango',60,0.8,15,0.4);
ig('ananasz','Ananász','Pineapple',50,0.5,13.1,0.1);
ig('kiwi','Kiwi','Kiwi',61,1.1,14.7,0.5,'',76);
ig('korte','Körte','Pear',57,0.4,15.2,0.1,'',178);
ig('avokado','Avokádó','Avocado',160,2,9,15,'',150);
ig('datolya','Datolya','Dates',277,1.8,75,0.2);
ig('mazsola','Mazsola','Raisins',299,3.1,79.2,0.5);
ig('aszalt_szilva','Aszalt szilva','Dried plums',240,2.2,63.9,0.4);
ig('citromle','Citromlé','Lemon juice',22,0.4,6.9,0.2);
// magvak, olajok, egyebek
ig('mandula','Mandula','Almonds',579,21,22,50);
ig('dio','Dió','Walnuts',654,15.2,13.7,65.2);
ig('kesudio','Kesudió','Cashews',553,18.2,30.2,43.9);
ig('mogyoro','Mogyoró','Peanuts',567,25.8,16.1,49.2);
ig('mogyorovaj','Mogyoróvaj','Peanut butter',588,25,20,50);
ig('chia','Chia mag','Chia seeds',486,16.5,42.1,30.7);
ig('lenmag','Lenmag','Flaxseed',534,18.3,28.9,42.2);
ig('tokmag','Tökmag','Pumpkin seeds',559,30.2,10.7,49);
ig('napraforgomag','Napraforgómag','Sunflower seeds',584,20.8,20,51.5);
ig('szezam','Szezámmag','Sesame seeds',573,17.7,23.5,49.7);
ig('tahini','Tahini','Tahini',595,17,21.2,53.8);
ig('kokuszreszelek','Kókuszreszelék','Desiccated coconut',660,6.9,23.7,64.5);
ig('olivaolaj','Olívaolaj','Olive oil',884,0,0,100);
ig('kokuszolaj','Kókuszolaj','Coconut oil',862,0,0,100);
ig('cukor','Cukor','Sugar',387,0,100,0);
ig('juharszirup','Juharszirup','Maple syrup',260,0,67,0);
ig('kakao','Kakaópor (cukrozatlan)','Cocoa powder (unsweetened)',228,19.6,24.7,13.7); // szénhidrát rost nélkül (a teljes 57,9 g-ból 33,2 g rost)
ig('etcsoki','Étcsokoládé (70–85%)','Dark chocolate (70–85%)',598,7.8,45.9,42.6);
ig('szojaszosz','Szójaszósz','Soy sauce',53,8.1,4.9,0.6,'G');
ig('tamari','Tamari (gluténmentes szójaszósz)','Tamari (gluten-free soy sauce)',60,10,5.6,0.1);
ig('mustar','Mustár','Mustard',66,4.4,5.8,4);
ig('alaple','Zöldségalaplé (házi)','Vegetable stock (homemade)',8,0.4,1.5,0.1);
ig('gyomber','Gyömbér','Ginger',80,1.8,17.8,0.8);
ig('petrezselyem','Petrezselyem','Parsley',36,3,6.3,0.8);
ig('bazsalikom','Bazsalikom','Basil',23,3.2,2.7,0.6);
ig('koriander','Koriander','Cilantro',23,2.1,3.7,0.5);
ig('zabliszt','Zabliszt (gluténmentes)','Oat flour (gluten-free)',404,14.7,65.7,9.1);

// --- receptek ---
// R(azonosító, kategória, adagszám, idő (perc), magyar név, angol név, alapanyagok 'id:gramm,...', magyar lépések '|'-val elválasztva, angol lépések)
// kategóriák: reggeli, ebed, vacsora, snack, desszert, shake
const REC=[];
const rc=(id,cat,sv,min,hu,en,ing,sh,se)=>REC.push({id,cat,sv,min,hu,en,ing:ing.split(',').map(x=>{const a=x.split(':');return[a[0],+a[1]]}),sh:sh.split('|'),se:se.split('|')});

// Egy adag (vagy mult × adag) makrói
function recMac(r,mult){
 const t={k:0,p:0,c:0,f:0};
 for(const[id,g]of r.ing){const i=ING[id];t.k+=i.k*g/100;t.p+=i.p*g/100;t.c+=i.c*g/100;t.f+=i.f*g/100}
 const m=(mult===undefined?1:mult)/r.sv;
 return{k:t.k*m,p:t.p*m,c:t.c*m,f:t.f*m};
}
// Címkék az alapanyagok jelzőiből: vegan, vegetarian, glutenfree, lactosefree
const TAGC={};
function recTags(r){
 if(TAGC[r.id])return TAGC[r.id];
 const fl=r.ing.map(x=>ING[x[0]].fl).join('');
 return TAGC[r.id]={vegan:!/[MA]/.test(fl),vegetarian:!/M/.test(fl),glutenfree:!/G/.test(fl),lactosefree:!/L/.test(fl)};
}
const rname=r=>LANG==='en'?r.en:r.hu,iname=i=>LANG==='en'?ING[i].en:ING[i].hu;
// Hátralévő keretbe illeszkedés (egy adag)
function recFits(r,rem){
 const m=recMac(r);
 return m.k<=rem.k&&m.c<=Math.max(rem.c,0)*1.2+10&&m.f<=Math.max(rem.f,0)*1.2+5;
}
// Javaslat a hátralévő makrók és kalória alapján: a legjobban illeszkedő receptek (kategóriánként változatosan)
function suggest(rem,n,ok){
 if(rem.k<120)return[];
 const T=rem.k>900?650:rem.k*.85,list=[];
 for(const r of REC){
  if(ok&&!ok(r))continue;
  const m=recMac(r);
  if(m.k>rem.k*1.03)continue;
  const pc=Math.min(m.p,rem.p)/Math.max(rem.p,1),pen=Math.max(0,m.c-rem.c)/Math.max(rem.c,1)+Math.max(0,m.f-rem.f)/Math.max(rem.f,1);
  list.push({r,m,s:2*pc+1.5*(1-Math.abs(m.k-T)/T)-Math.min(pen,2)});
 }
 list.sort((a,b)=>b.s-a.s);
 const out=[],cats=new Set();
 for(const x of list)if(!cats.has(x.r.cat)){cats.add(x.r.cat);out.push(x);if(out.length>=n)return out}
 for(const x of list)if(!out.includes(x)){out.push(x);if(out.length>=n)break}
 return out;
}
