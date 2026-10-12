/* ---------- Gyakorlat- és gépadatbázis ---------- */
const G={
Mell:['Ferde pados súlyzós nyomás','Smith-gépes fekvenyomás','Pec Deck mellrepesztő','Csigás keresztezés (Cable Crossover)','Fekvenyomás rúddal','Mellnyomó gép','Tárogatás súlyzóval','Iso-lateral mellnyomó (lemezes)','Ferde mellnyomó gép','Fekvő mellnyomó gép (szelektoros)','Konvergáló mellnyomó gép','Alsó mell csigával (Low-to-High)','Felső mell csigával (High-to-Low)','Egykezes csigás mellnyomás','Ülő tolódzkodás gép (Seated Dip)','Ferde fekvenyomás Smith-gépben','Fekvőtámasz'],
Hát:['Lat húzás – széles fogás','Lat húzás – szűk fogás','Ülő csigás evezés','T-rudas evezés','Segített húzódzkodás gép','Egykezes súlyzós evezés','Felhúzás','Hiperextenzió','Iso-lateral evezőgép (lemezes)','Alsó evezőgép (Low Row)','Magas evezőgép (High Row)','Vertikális evezőgép (Vertical Row)','Divergáló lat húzás gép','Lat húzás – V-fogás','Lat húzás – egykezes csigán','Egyenes karos letolás csigán','Pullover gép','Hátfeszítő gép (45°)','Húzódzkodás','Rack pull','Egykezes csigás evezés'],
Láb:['Hack guggolás gép','Lábtoló (45°)','Lábfeszítés gép','Ülő lábhajlítás','Fekvő lábhajlítás','Csípőemelés gép (Hip Thrust)','Álló vádliemelés','Román felhúzás','Bolgár guggolás','Guggolás rúddal','Inga guggolás gép (Pendulum)','Reverse hack guggolás gép','V-guggolás gép','Belt squat gép','Smith-gépes guggolás','Vízszintes lábtoló (ülő)','Egylábas lábtoló','Egylábas lábfeszítés','Csípőemelés rúddal','Csípő-távolító gép (Abduktor)','Csípő-közelítő gép (Adduktor)','Farizom hátrarúgás gép (Glute Kickback)','Álló csípőfeszítő gép','Ülő vádliemelés gép','Vádliemelés lábtolón','Nordic lábhajlítás','Kitörés Smith-gépben','Kitörés súlyzóval','Goblet guggolás','Lábfejemelés (Tibialis)'],
Váll:['Gépes vállnyomás','Csigás oldalemelés','Súlyzós oldalemelés','Hátsó vállgép (Reverse Pec Deck)','Arnold nyomás','Arcra húzás kötéllel','Lemezes vállnyomó gép (Plate-loaded)','Oldalemelő gép (Lateral Raise)','Hátsó váll fly gép','Vállnyomás Smith-gépben','Csigás elülső emelés','Egykezes csigás hátsó váll','Vállvonás gép (Shrug)','Vállvonás súlyzóval','Súlyzós vállnyomás ülve','Katonai nyomás állva'],
Kar:['Tricepsz letolás – kötél','Tricepsz letolás – rúd','Scott pad gép (Preacher Curl)','Ez-rudas bicepsz hajlítás','Kalapács bicepsz','Francia nyomás Ez-rúddal','Gépes tricepsz nyomás','Ülő tricepsz extenzió gép','Tolódzkodás gép (Assisted Dip)','Csigás tricepsz fej felett','Egykezes tricepsz letolás','Koponyatörő súlyzóval','Szűk fogású fekvenyomás','Ülő bicepsz hajlító gép','Csigás bicepsz hajlítás','Dőlt padon súlyzós bicepsz','Koncentrált bicepsz hajlítás','Fordított bicepsz hajlítás','Csuklóhajlítás rúddal'],
Törzs:['Csigás hasprés','Lábemelés függeszkedve','Plank','Gépes hasprés','Orosz csavarás','Hasprés padon','Hasprés gép (Ab Crunch)','Törzsforgató gép (Rotary Torso)','Hátfeszítő gép (Low Back)','Oldalhajlító gép','Csigás fahasogatás (Wood Chop)','Római széken hasprés','Függeszkedő térdemelés','Ab roller','Oldalsó plank','Hanyatt fekvő lábemelés']};
const GR=Object.keys(G);
const EX=GR.flatMap(g=>G[g].map(n=>({n,g})));

/* ---------- Edzéstervek ---------- */
const T=[
{id:'ppl',n:'Nyomó / Húzó / Láb',s:'Push / Pull / Legs',days:[
 {n:'Nyomó (Push)',e:['Ferde pados súlyzós nyomás','Smith-gépes fekvenyomás','Pec Deck mellrepesztő','Gépes vállnyomás','Csigás oldalemelés','Tricepsz letolás – kötél']},
 {n:'Húzó (Pull)',e:['Lat húzás – széles fogás','Ülő csigás evezés','T-rudas evezés','Segített húzódzkodás gép','Ez-rudas bicepsz hajlítás','Scott pad gép (Preacher Curl)']},
 {n:'Láb (Legs)',e:['Hack guggolás gép','Lábtoló (45°)','Lábfeszítés gép','Ülő lábhajlítás','Csípőemelés gép (Hip Thrust)','Álló vádliemelés']}]},
{id:'ul',n:'Felsőtest / Alsótest',s:'Upper / Lower',days:[
 {n:'Felsőtest (Upper)',e:['Ferde pados súlyzós nyomás','Lat húzás – szűk fogás','Gépes vállnyomás','Ülő csigás evezés','Csigás oldalemelés','Tricepsz letolás – rúd','Ez-rudas bicepsz hajlítás']},
 {n:'Alsótest (Lower)',e:['Hack guggolás gép','Lábtoló (45°)','Fekvő lábhajlítás','Lábfeszítés gép','Csípőemelés gép (Hip Thrust)','Álló vádliemelés']}]}];

const GOF=Object.fromEntries(EX.map(x=>[x.n,x.g]));
