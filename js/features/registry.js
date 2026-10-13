/* ---------- Funkció-nyilvántartás (feature registry) ----------
   Minden funkció egy helyen, megjelenítés nélkül: azonosító, csoport, szint, hová visz, ikon, cím, kulcsszavak.
   A három UI (Pro, Gym, Family) ebből építi a menüt, és (későbbi fázisokban) a keresést, a szint-szűrést és a súgót.
   Új funkció = egy sor ide + a három irány megvalósítása a js/features/parity.js-ben. A tests/features.check.js és a
   tests/parity.check.js ezt védi. Terv: docs/UI-IMPLEMENTATION.md.
   group: today | meal | progress | social | me      level: 1 = Csak a lényeg, 2 = Ajánlott, 3 = Minden
   tab/sub/focus: az app útvonala (App.tab, a képernyő almenüje, a képernyőn belüli fül)
   m: ha főmenü-sor is, a menü saját címe, sorrendje (o) és irányonkénti leírása (d). A leírások rövidek (mockup 7. szabálya). */
const FEAT_GROUPS=['today','meal','progress','social','me'];
const FEAT_TABS=['home','log','plan','hist','stats','food','tools','social','cycle','profile','opt','edit','help'];
// via: ha a funkció képernyőjét nem a főmenü, hanem egy másik képernyő nyitja (pl. a Tervszerkesztőt a Terv)
const F_=(id,group,level,tab,sub,focus,ic,t,kw,m,via)=>({id,group,level,tab,sub,focus,ic,t,kw:kw.split(' '),help:id,m:m||null,via:via||''});
const FEATURES=[
 // ---- Ma ----
 F_('home.hero','today',1,'home','','','home','Kezdőlap: mai edzés','kezdőlap mai edzés indítás home start'),
 F_('home.week','today',1,'home','','','cal','Heti napsor','hét napsor heti week days'),
 F_('home.easy','today',2,'home','','','dumbbell','Könnyű mozdulatok','könnyű mozdulat ajánlás easy suggestion'),
 F_('home.profile','today',1,'home','','','user','Profil-gomb a Kezdőlapon','profil gomb avatar profile'),
 F_('home.fontsize','today',3,'home','','','sliders','Gyors betűméret','betűméret nagyobb font size'),
 F_('home.volume','today',2,'home','','','chart','Heti volumen','volumen heti grafikon volume weekly'),
 F_('home.records','today',3,'home','','','star','Rekordok a Kezdőlapon','rekord 1rm records'),
 F_('home.pr','today',3,'home','','','star','Új rekord','új rekord pr record'),
 F_('home.streak','today',3,'home','','','cycle','Hetes széria','széria streak hét'),
 F_('home.groups','today',2,'home','','','chart','Heti sorozatok izomcsoportonként','izomcsoport sorozat muscle sets'),
 F_('workout.pick','today',1,'log','','','dumbbell','Edzés indítása','edzés indítás terv ismétlés üres workout start',{k:'log',t:'Edzés',o:1,d:{pro:'Mai edzés és a gyakorlatok',gym:'Mai edzés, gyakorlatok',family:'A mai mozgás'}}),
 F_('workout.sets','today',1,'log','','','check','Sorozatok rögzítése','súly ismétlés sorozat kész set weight reps'),
 F_('workout.lastline','today',1,'log','','','log','Legutóbbi alkalom','legutóbb előző alkalom last time'),
 F_('workout.prevsets','today',2,'log','','','log','Előző alkalmak sorozatai','előző sorozatok előzmény previous sets history'),
 F_('workout.addset','today',2,'log','','','plus','Sorozat hozzáadása','sorozat hozzáadás add set'),
 F_('workout.rpe','today',3,'log','','','info','RPE','rpe erőfeszítés effort'),
 F_('workout.rest','today',1,'log','','','cal','Pihenő-időzítő','pihenő időzítő rest timer'),
 F_('workout.restadj','today',2,'log','','','plus','Pihenő ±15 mp','pihenő idő hosszabbítás rest adjust'),
 F_('workout.clock','today',2,'log','','','cal','Eltelt idő az edzésben','óra idő eltelt elapsed clock'),
 F_('workout.finish','today',1,'log','','','check','Edzés befejezése','befejezés vége finish'),
 F_('workout.list','today',1,'log','','','log','Gyakorlat-lista','gyakorlat lista váltás törlés exercises list'),
 F_('workout.info','today',1,'log','','','info','Gyakorlat-leírás','leírás technika videó exercise info form'),
 F_('workout.plates','today',3,'log','','','dumbbell','Rúd és tárcsák','tárcsa rúd súly plates barbell'),
 F_('plan.week','today',1,'plan','','','cal','Heti terv','terv heti beosztás célsúly plan weekly',{k:'plan',t:'Terv',o:2,d:{pro:'Heti és havi terv',gym:'Heti és havi ciklus',family:'Mi jön a héten'}}),
 F_('plan.notify','today',3,'plan','','','cal','Értesítések és naptár','értesítés naptár emlékeztető ics notification calendar'),
 F_('plan.editor','today',3,'edit','','','edit','Tervszerkesztő','tervszerkesztő saját terv szerkesztés plan editor custom',null,'plan'),
 F_('log.list','today',1,'hist','','','log','Napló','napló edzések előzmények log history',{k:'hist',t:'Napló',o:3,d:{pro:'Korábbi edzések és sorozatok',gym:'Mit és mennyit emeltél',family:'Amit már megcsináltál'}}),
 
 // ---- Étkezés ----
 F_('food.log','meal',2,'food','','','food','Étel-napló','étel kalória makró napló food calories macros',{k:'food',t:'Étel',o:4,d:{pro:'Kalória és makrók',gym:'Kalória és fehérje',family:'Mit ettél ma'}}),
 F_('food.water','meal',3,'food','','water','drop','Vízbevitel','víz ivás folyadék water'),
 F_('food.week','meal',3,'food','','','chart','Kalória, utolsó 7 nap','kalória hét grafikon calories week'),
 F_('food.fav','meal',2,'food','','fav','star','Kedvenc ételek','kedvenc mentett étel favorites saved'),
 F_('food.suggest','meal',3,'food','','','book','Receptjavaslat','recept javaslat hátralévő suggestion'),
 F_('recipes.list','meal',3,'food','rec','','book','Receptek','recept receptek keresés recipes',{k:'recipes',t:'Receptek',o:5,d:{pro:'Mentett ételek és ötletek',gym:'Mentett ételek',family:'Mentett ételek'}}),
 // ---- Fejlődés ----
 F_('stats.main','progress',2,'stats','','','star','Statisztikák és rekordok','statisztika rekord grafikon fejlődés stats records progress',{k:'stats',t:'Statisztikák és rekordok',o:7,d:{pro:'Rekordok, grafikonok, volumen',gym:'Rekordok és volumen',family:'Amit elértél'}}),
 F_('log.progress','progress',2,'stats','','','chart','Fejlődés-grafikon','fejlődés grafikon progress chart'),
 F_('log.records','progress',2,'stats','','','star','Rekordok és izomcsoportok','rekord izomcsoport records muscle'),
 F_('stats.volume','progress',2,'stats','','','chart','Heti volumen, utolsó 8 hét','heti volumen széria grafikon volume weekly streak'),
 F_('body.measure','progress',2,'tools','b','','chart','Test és mérések','test mérés súly méret body measurements weight',{k:'body',t:'Test és mérések',o:6,d:{pro:'Súly, méretek, fotók',gym:'Súly, méretek, rekordok',family:'Súly és méretek'}}),
 F_('body.photos','progress',3,'tools','b','photos','user','Haladási fotók','fotó kép haladás összehasonlítás photos progress compare'),
 F_('tools.cardio','progress',3,'tools','c','c','calc','Kardió-számoló','kardió kalória égetés cardio',{k:'calc',t:'Számolók',o:8,d:{pro:'Kardió, kalória, erő, intervall',gym:'Kardió, kalória, erő',family:'Kalória és kardió'}}),
 F_('tools.kcal','progress',3,'tools','c','k','calc','Kalória és makró számoló','kalória makró tdee bmr calorie macro'),
 F_('tools.strength','progress',3,'tools','c','e','calc','Erő-számoló','1rm százalék tárcsa bemelegítés strength plates warmup'),
 F_('tools.interval','progress',3,'tools','c','i','calc','Intervall-időzítő','intervall tabata hiit emom interval timer'),
 F_('cycle.main','progress',3,'cycle','','','cycle','Ciklus-követés','ciklus menstruáció cycle period',{k:'cycle',t:'Ciklus',o:9,d:{pro:'Csak ha be van kapcsolva',gym:'Csak ha bekapcsoltad',family:'Ha bekapcsoltad'}}),
 // ---- Közösség ----
 F_('social.feed','social',3,'social','','feed','people','Hírfolyam','hírfolyam közösség feed community',{k:'social',t:'Közösség',o:10,d:{pro:'Csoportok és kihívások',gym:'Csoportok, kihívások',family:'Barátok, csoportok'}}),
 F_('social.conn','social',3,'social','','conn','people','Kapcsolatok','követés barát kapcsolat follow friends'),
 F_('social.groups','social',3,'social','','grp','people','Csoportok és kihívások','csoport kihívás ranglista groups challenges'),
 F_('social.profile','social',3,'social','','prof','user','Közösségi profil','közösségi profil adatvédelem privacy'),
 F_('social.report','social',3,'social','','','info','Jelentés és tiltás','jelentés tiltás report block'),
 // ---- Fiók és beállítások ----
 F_('me.profile','me',1,'profile','','','user','Profil','profil adatok célok profile goals',{k:'profile',t:'Profil',o:11,d:{pro:'Adatok és célok',gym:'Adatok és célok',family:'Adataid'}}),
 F_('opt.ui','me',1,'opt','','','sliders','Felület és színséma','felület téma szín ui theme scheme',{k:'opt',t:'Beállítások',o:12,d:{pro:'Felület, színséma, fiók',gym:'Felület, színek, fiók',family:'Betűméret, színek'}}),
 F_('opt.lang','me',1,'opt','','','sliders','Nyelv','nyelv language magyar english'),
 F_('opt.fontsize','me',1,'opt','','','sliders','Betűméret','betűméret font size'),
 F_('opt.motion','me',1,'opt','','','sliders','Animációk','animáció mozgás animation motion'),
 F_('opt.vibrate','me',1,'opt','','','sliders','Rezgés','rezgés vibration haptic'),
 F_('opt.level','me',1,'opt','','','sliders','Szint','szint funkciók level simple'),
 F_('acct.guest','me',1,'opt','','','user','Vendég mód','vendég mód fiók nélkül helyi adat guest local account'),
 F_('opt.home','me',1,'opt','level','','sliders','Kezdőlap tartalma','kezdőlap tartalma kártya testreszabás home cards customize'),
 F_('opt.contrast','me',2,'opt','','','sliders','Nagy kontraszt','kontraszt contrast accessibility'),
 F_('opt.quiet','me',3,'opt','','','sliders','Csendes órák','értesítés csendes órák quiet hours notifications'),
 F_('opt.workout','me',2,'opt','','','sliders','Edzés-beállítások','heti cél pihenő célsúly lépcső workout settings'),
 F_('opt.export','me',3,'opt','data','','download','Export és adatok','export csv pdf mentés backup data'),
 F_('opt.json','me',3,'opt','data','','download','JSON-export','json export'),
 F_('opt.account','me',1,'opt','','','user','Fiók és szinkron','fiók szinkron kilépés account sync'),
 F_('opt.reset','me',2,'opt','','','sliders','Alapértékek visszaállítása','visszaállítás alapérték reset defaults'),
 F_('help.main','me',1,'help','','','help','Súgó','súgó segítség help tipp útmutató',{k:'help',t:'Súgó',o:13,d:{pro:'Hogyan működik?',gym:'Hogyan működik?',family:'Segítség és tippek'}}),
 F_('nav.search','me',1,'home','','','search','Funkció-keresés','keresés search find')];
const featById=id=>FEATURES.find(f=>f.id===id);
