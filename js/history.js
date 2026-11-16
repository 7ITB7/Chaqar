'use strict';
/* Rough empire outlines [lon,lat]. Sketches for orientation, not surveyed borders. */
const EGY=[[29.5,31.4],[32.5,31.4],[32.6,30],[33.2,28],[34,26],[33.5,22.5],[31,22.5],[30,26],[29.3,29.5]];
const LEV=[[32.5,31.4],[34.3,31.3],[35.2,33.3],[36,33.3],[35.7,31],[34.9,29.5],[32.6,30]];
const PERS=[[25.5,31.5],[26.5,41.5],[41,42.5],[50,41],[62,38],[66,30],[60,25],[50,29.5],[48,29.8],[40,30.5],[35,28.5],[34,22.5],[30,22.5],[25.5,29]];
const GRE=[[20,38],[20.5,41.5],[26,41.5],[26,36.5],[22.5,36.3]];
const EMPIRES=[
['Ur (Sumer)','#c9a227',-2112,-2004,[[44,33.5],[47.5,31.5],[48,30],[46,30.3],[44,32]],[31.6,45.8]],
['Babylon (Hammurabi\'s dynasty)','#b5651d',-1894,-1595,[[43,34.5],[45.5,34],[48,30.5],[46,30],[43.5,32]],[32.6,44.6]],
['Egypt','#d4a017',-2200,-1650,EGY,[27,31.2]],
['Egypt','#d4a017',-1550,-525,EGY,[27,31.2]],
['Egypt\'s empire in Canaan','#d4a017',-1480,-1180,[[32.5,31.4],[34.2,31.3],[34.9,29.5],[35.8,31],[36.5,33.5],[37,35.5],[36,35.8],[35.7,34.5],[34.9,32.5]],[33.9,36.2]],
['Hittites','#7d5ba6',-1400,-1190,[[29,37],[30,40.5],[35,42],[40,40.5],[39.5,37.5],[37.5,35.2],[36,35.5],[35.8,36.6],[32,36.2]],[39,34.5]],
['Philistines','#8e44ad',-1175,-604,[[34.3,31.25],[34.55,31.9],[34.9,31.85],[34.75,31.3]],[31.55,34.6]],
['Israel (united kingdom)','#2e6fd0',-1010,-930,[[34.5,31.2],[34.9,32.5],[35.1,33.1],[35.6,33.4],[36.2,33],[36.2,31.5],[35.9,30.5],[35,29.6],[34.6,30.6]],[32.2,35.6]],
['Israel (north)','#2e6fd0',-930,-722,[[34.85,32],[35.1,33.1],[35.6,33.4],[36.1,33],[36,32],[35.55,31.85],[35.2,31.95]],[32.6,35.4]],
['Judah','#3f9bd8',-930,-586,[[34.5,31.25],[34.85,32],[35.2,31.95],[35.55,31.85],[35.5,31.1],[35.2,30.9],[34.6,30.9]],[31.35,35]],
['Aram (Damascus)','#16a085',-1000,-732,[[35.8,33],[36,34.2],[37,34.5],[37.5,33.2],[36.3,32.5]],[33.6,36.6]],
['Assyria','#c0392b',-900,-745,[[41,37.5],[44.5,37.3],[45,35],[43.5,34],[41.5,35]],[36.2,43.2]],
['Assyrian Empire','#c0392b',-745,-612,[[34,36.8],[36,38.5],[41,38.5],[45.5,37.5],[48.5,33],[48,30.2],[45.5,30.5],[42.5,33.5],[38,33],[36.3,31],[35.6,30.8],[34.4,31.3],[35,33],[35.8,35.5],[36,36.5]],[35.5,41]],
['Babylonian Empire','#e67e22',-612,-539,[[35.9,36.5],[38.5,37.3],[42,37.2],[46,34.5],[48.5,31],[47.8,29.9],[45,30],[42,31.5],[38.5,31.5],[36,29.6],[34.9,29.5],[34.3,31.3],[35,33],[35.8,35.5]],[33.5,41.5]],
['Persian Empire','#27ae60',-539,-331,PERS,[34,50]],
['Alexander\'s empire','#2980b9',-331,-323,PERS,[34,50]],
['Alexander\'s empire','#2980b9',-336,-323,GRE,[39.5,22.5]],
['Ptolemies (Egypt)','#d4a017',-323,-30,EGY,[27,31.2]],
['Ptolemies hold Judea','#d4a017',-301,-198,LEV,[30.6,34.4]],
['Seleucid Empire','#2980b9',-312,-129,[[35.8,36.9],[30,36.5],[29.5,39.5],[36,40],[42,38],[46,36],[50,33],[48.5,30.2],[44,31],[39,33],[36.5,33.6],[35.9,34.5]],[35.5,40]],
['Seleucids hold Judea','#2980b9',-198,-142,LEV,[30.6,34.4]],
['Seleucid Syria','#2980b9',-129,-63,[[35.7,36.9],[38.5,37],[39,34.5],[36.5,33.6],[35.9,34.5]],[35.6,37.4]],
['Hasmonean Judea (independent)','#3f9bd8',-142,-63,[[34.5,31.3],[34.9,32.6],[35.2,33.1],[35.7,33.2],[36,32.3],[35.9,31.2],[35.3,30.9],[34.6,31]],[31.9,35.3]],
['Parthian Empire','#9b59b6',-141,100,[[41,37.5],[46,39],[55,38.5],[62,36],[62,27],[52,27],[48.5,30],[44,31.5],[40.5,34.5]],[33.5,50]],
['Roman Republic','#b03a2e',-146,-63,[[7,44],[13.5,46],[20,45],[26,41.5],[26,36.5],[22.5,36.3],[20,37.5],[18.5,40],[16,38],[12.5,37.5],[12,41],[9,43.5]],[42,13]],
['Rome','#b03a2e',-63,100,[[7,44],[13.5,46],[20,45],[29,42.5],[36,41.5],[40.5,40],[39.5,36.8],[38.5,34],[36.5,32.5],[35.8,30.8],[34.8,29.6],[34.3,31.2],[35.5,35],[36,36.5],[30,36],[27,36],[23,35.5],[20,37.5],[18.5,40],[16,38],[12.5,37.5],[12,41],[9,43.5]],[39,32]],
['Rome (Egypt)','#b03a2e',-30,100,EGY,[27,31.2]]
];
/* name, lat, lon, from, to, ref, note. Dates follow the traditional chronology built on 1 Kings 6:1 and Exodus 12:40. */
const PEOPLE=[
['Abraham',30.96,46.1,-2166,-2095,'GEN.11.28','Born in Ur of the Chaldeans.'],['Abraham',36.864,39.033,-2095,-2091,'GEN.12.4','In Haran until his father Terah dies.'],['Abraham',31.525,35.102,-2091,-1991,'GEN.13.18','A tent-dweller in Canaan for a hundred years, mostly near Hebron and Beersheba.'],
['Isaac',31.245,34.841,-2066,-1886,'GEN.26.23','Spends his whole life in the south of Canaan.'],
['Jacob',31.245,34.841,-2006,-1929,'GEN.25.27','Grows up in his father\'s tents.'],['Jacob',36.864,39.033,-1929,-1909,'GEN.29.20','Twenty years working for Laban in Haran.'],['Jacob',31.525,35.102,-1909,-1876,'GEN.37.1','Back in Canaan with twelve sons.'],['Jacob',30.799,31.834,-1876,-1859,'GEN.47.28','His last seventeen years in Goshen.'],
['Joseph',31.525,35.102,-1915,-1898,'GEN.37.3','The favorite son, until he is sold at seventeen.'],['Joseph',30.13,31.31,-1898,-1805,'GEN.41.41','Slave, prisoner, then governor of Egypt.'],
['Moses',30.799,31.834,-1526,-1486,'EXO.2.10','Raised in Pharaoh\'s household.'],['Moses',28.5,35,-1486,-1446,'EXO.3.1','Forty years a shepherd in Midian.'],['Moses',28.54,33.973,-1446,-1445,'EXO.19.20','At Mount Sinai.'],['Moses',30.648,34.422,-1445,-1407,'NUM.20.1','The wilderness years, based at Kadesh.'],['Moses',31.768,35.725,-1406,-1406,'DEU.34.1','Dies on Mount Nebo in sight of the land.'],
['Joshua',31.872,35.445,-1406,-1400,'JOS.6.2','Leads the campaign from Gilgal.'],['Joshua',32.056,35.29,-1399,-1380,'JOS.18.1','Divides the land at Shiloh.'],
['Deborah',31.89,35.23,-1210,-1170,'JDG.4.5','Judges Israel under her palm tree between Ramah and Bethel.'],['Gideon',32.55,35.357,-1180,-1140,'JDG.7.1','Routs Midian with three hundred men.'],['Ruth and Boaz',31.704,35.208,-1120,-1100,'RUT.2.4','In the barley fields of Bethlehem.'],['Samson',31.776,34.985,-1090,-1055,'JDG.13.25','On the Philistine border.'],
['Samuel',31.854,35.232,-1100,-1015,'1SA.7.17','Prophet and last judge, based at Ramah.'],['Saul',31.823,35.231,-1050,-1010,'1SA.10.26','First king, ruling from Gibeah.'],
['David',31.704,35.208,-1040,-1022,'1SA.16.11','A shepherd boy in Bethlehem.'],['David',31.652,35.002,-1021,-1011,'1SA.22.1','An outlaw hiding from Saul.'],['David',31.525,35.102,-1010,-1004,'2SA.2.11','King of Judah at Hebron.'],['David',31.777,35.234,-1003,-970,'2SA.5.9','King of all Israel in Jerusalem.'],
['Solomon',31.777,35.234,-970,-930,'1KI.6.1','Builds the temple.'],['Jeroboam',32.214,35.282,-930,-910,'1KI.12.25','First king of the northern tribes.'],
['Ahab and Jezebel',32.276,35.195,-874,-853,'1KI.16.29','Rule from Samaria.'],['Elijah',32.672,35.023,-870,-850,'1KI.18.20','Confronts the prophets of Baal on Carmel.'],['Elisha',32.276,35.195,-850,-800,'2KI.6.24','Prophet in the northern kingdom.'],
['Jonah',36.359,43.153,-770,-765,'JON.3.3','Preaches in Nineveh.'],['Amos',31.923,35.241,-760,-755,'AMO.7.13','A southern herdsman preaching at Bethel.'],['Hosea',32.276,35.195,-755,-722,'HOS.1.1','Prophesies through the last years of the north.'],
['Isaiah',31.777,35.234,-740,-685,'ISA.6.1','Prophet in Jerusalem under four kings.'],['Hezekiah',31.777,35.234,-715,-686,'2KI.18.13','Holds Jerusalem against Assyria.'],['Sennacherib',36.359,43.153,-705,-681,'2KI.19.36','King of Assyria at Nineveh.'],
['Josiah',31.777,35.234,-640,-609,'2KI.22.1','Reforming king, killed at Megiddo.'],['Jeremiah',31.777,35.234,-627,-586,'JER.1.2','Warns Jerusalem for forty years.'],['Jeremiah',30.86,32.17,-585,-570,'JER.43.7','Taken to Egypt against his will.'],
['Nebuchadnezzar',32.543,44.422,-605,-562,'DAN.4.30','King of Babylon.'],['Daniel',32.543,44.422,-605,-536,'DAN.1.6','Exile and court official in Babylon.'],['Ezekiel',32.1,45.2,-597,-571,'EZK.1.1','Among the exiles by the Chebar canal.'],
['Cyrus',32.543,44.422,-539,-530,'EZR.1.1','Takes Babylon and frees the exiles.'],['Zerubbabel',31.777,35.234,-538,-515,'EZR.3.8','Leads the first return and rebuilds the temple.'],['Haggai and Zechariah',31.777,35.234,-520,-516,'HAG.1.1','Push the builders to finish.'],
['Esther',32.19,48.26,-479,-470,'EST.2.17','Queen of Persia at Susa.'],['Ezra',31.777,35.234,-458,-440,'EZR.7.8','Brings the Law back from Babylon.'],['Nehemiah',32.19,48.26,-446,-446,'NEH.1.1','Cupbearer to the king at Susa.'],['Nehemiah',31.777,35.234,-445,-430,'NEH.2.11','Rebuilds the walls of Jerusalem.'],['Malachi',31.777,35.234,-435,-425,'MAL.1.1','The last of the prophets.'],
['Alexander the Great',33.271,35.196,-333,-331,'DAN.8.5','Besieges Tyre and takes the Levant from Persia.'],['Antiochus IV',31.777,35.234,-168,-164,'DAN.11.31','Outlaws Jewish worship and defiles the temple.'],['Judas Maccabeus',31.93,34.99,-167,-160,'1MA.3.1','Leads the revolt from the hills of Modein.'],
['Herod the Great',31.777,35.234,-37,-4,'MAT.2.1','Rebuilds the temple on a vast scale.'],
['Jesus',31.704,35.208,-5,-4,'LUK.2.7','Born in Bethlehem.'],['Jesus',30.13,31.31,-4,-3,'MAT.2.14','A refugee in Egypt.'],['Jesus',32.702,35.298,-3,26,'LUK.2.51','Grows up in Nazareth.'],['Jesus',32.881,35.575,27,29,'MAT.4.13','Teaching around Galilee from Capernaum.'],['Jesus',31.778,35.23,30,30,'LUK.23.33','Crucified and raised at Jerusalem.'],
['John the Baptist',31.837,35.55,26,28,'JHN.1.28','Baptizing at the Jordan.'],
['Peter',32.881,35.575,20,29,'MRK.1.16','A fisherman at Capernaum.'],['Peter',31.777,35.234,30,44,'ACT.2.14','Leads the church in Jerusalem.'],['Peter',41.892,12.485,60,65,'1PE.5.13','In Rome ("Babylon"), where tradition says he died.'],
['Paul',36.913,34.892,5,20,'ACT.22.3','Born in Tarsus.'],['Paul',31.777,35.234,21,33,'ACT.22.3','Studies under Gamaliel.'],['Paul',33.511,36.306,34,36,'ACT.9.3','Conversion on the Damascus road.'],['Paul',36.913,34.892,37,44,'GAL.1.21','The quiet years back in Tarsus.'],['Paul',36.227,36.172,45,47,'ACT.11.26','Teaching at Antioch.'],['Paul',37.872,32.492,48,48,'ACT.14.1','First journey, through Galatia.'],['Paul',36.227,36.172,49,49,'ACT.15.35','Back in Antioch.'],['Paul',37.906,22.879,50,52,'ACT.18.11','Eighteen months in Corinth.'],['Paul',37.939,27.341,53,56,'ACT.19.10','Three years in Ephesus.'],['Paul',32.5,34.892,57,59,'ACT.24.27','Two years a prisoner at Caesarea.'],['Paul',41.892,12.485,60,62,'ACT.28.30','Under guard in Rome.'],
['James, brother of Jesus',31.777,35.234,44,62,'ACT.15.13','Leads the Jerusalem church.'],['John',37.939,27.341,70,94,'REV.2.1','By tradition, an old man at Ephesus.'],['John',37.325,26.542,95,96,'REV.1.9','Exiled on Patmos.'],['Titus (Roman general)',31.777,35.234,70,70,'LUK.21.6','Destroys Jerusalem and the temple.']
];
const EVENTS=[[-2091,'Abraham enters Canaan'],[-1876,'Jacob\'s family moves to Egypt'],[-1446,'The Exodus (traditional date; many scholars prefer about 1260 BC)'],[-1406,'Israel crosses the Jordan'],[-1050,'Saul becomes king'],[-1003,'David takes Jerusalem'],[-966,'Solomon begins the temple'],[-930,'The kingdom splits in two'],[-722,'Assyria destroys Samaria; the ten tribes are deported'],[-701,'Sennacherib besieges Jerusalem'],[-612,'Nineveh falls'],[-605,'Battle of Carchemish; first exiles to Babylon'],[-586,'Jerusalem and the temple destroyed'],[-539,'Cyrus takes Babylon'],[-516,'Second temple finished'],[-445,'Nehemiah rebuilds the walls'],[-332,'Alexander takes the Levant'],[-167,'Antiochus IV defiles the temple; the Maccabees revolt'],[-164,'Temple rededicated (Hanukkah)'],[-63,'Pompey takes Jerusalem for Rome'],[-37,'Herod becomes king'],[-5,'Birth of Jesus (approximate)'],[30,'The crucifixion (AD 30 or 33)'],[49,'The Jerusalem council'],[64,'Fire of Rome; Nero\'s persecution'],[70,'Rome destroys Jerusalem and the temple'],[95,'Revelation written (traditional date)']];
const ERAS=[['Abraham',-2080],['Joseph',-1890],['Exodus',-1446],['Judges',-1175],['David',-1000],['Two kingdoms',-860],['Assyria',-722],['Exile',-586],['Return',-538],['Esther',-475],['Greeks',-330],['Maccabees',-165],['Jesus',28],['Paul',55],['AD 70',70]];

/* ---------- Battles. Units: id, side (a = Israel/Judah, b = opponent, n = town), label. Steps move units; null removes one. ---------- */
const BATTLES=[
{id:'jericho',t:'The fall of Jericho',sub:'Joshua 6 · c. 1406 BC',ref:'JOS.6.1',c:[31.874,35.45],z:13.6,br:250,u:[['is','a','Israel'],['ark','a','Priests and ark'],['je','n','Jericho']],s:[
['Israel is camped at Gilgal, about a mile and a half east. Jericho is shut tight.','JOS.6.1',{is:[31.8819,35.46],je:[31.871,35.444]}],
['Days one to six: armed men, seven priests with rams\' horns, then the ark, circle the city once in silence and return to camp.','JOS.6.14',{is:[31.8745,35.4445],ark:[31.8738,35.447]}],
['The circuit of a nine-acre city takes well under an hour.','JOS.6.11',{is:[31.868,35.441],ark:[31.8676,35.4445]}],
['Day seven: seven times around. On the last, the horns sound and the people shout.','JOS.6.16',{is:[31.8712,35.4478],ark:[31.8735,35.4465]}],
['The wall falls flat and every man goes straight in. Only Rahab\'s house is spared.','JOS.6.20',{is:[31.871,35.4442],ark:[31.872,35.4468]}]]},
{id:'ai',t:'The ambush at Ai',sub:'Joshua 7–8 · c. 1406 BC',ref:'JOS.8.1',c:[31.918,35.262],z:13.2,br:270,u:[['js','a','Joshua, main force'],['am','a','Ambush'],['ai','b','Men of Ai'],['city','n','Ai'],['bt','n','Bethel']],s:[
['The first attack fails: three thousand men are chased down the slope and thirty-six die. The cause is Achan\'s theft.','JOS.7.5',{city:[31.917,35.261],bt:[31.9228,35.2414],js:[31.912,35.275],ai:[31.9165,35.264]}],
['Second attempt. By night Joshua hides an ambush west of the city, between Ai and Bethel.','JOS.8.9',{am:[31.9185,35.2515],js:[31.895,35.33],ai:[31.917,35.2612]}],
['The main force camps in plain view north of Ai, with a valley between.','JOS.8.11',{js:[31.9245,35.2625]}],
['At dawn the king of Ai comes out. Joshua pretends to break and runs east toward the wilderness. Every man in Ai and Bethel gives chase, leaving the gates open.','JOS.8.15',{js:[31.916,35.284],ai:[31.9165,35.2735]}],
['Joshua raises his javelin. The ambush rises, takes the empty city and sets it alight.','JOS.8.19',{am:[31.917,35.261]}],
['The pursuers look back and see smoke. Joshua turns on them, the ambush comes out behind, and they are caught between.','JOS.8.22',{js:[31.9163,35.277],am:[31.9168,35.268],ai:[31.9165,35.2725]}]]},
{id:'deborah',t:'Deborah and Barak at the Kishon',sub:'Judges 4–5 · c. 1200 BC',ref:'JDG.4.14',c:[32.65,35.3],z:10.6,br:200,u:[['bk','a','Barak, 10,000'],['ss','b','Sisera, 900 chariots'],['jl','n','Jael\'s tent'],['tb','n','Mount Tabor']],s:[
['Barak gathers ten thousand men of Naphtali and Zebulun on Mount Tabor, safe from chariots.','JDG.4.10',{tb:[32.687,35.39],bk:[32.69,35.392]}],
['Sisera brings nine hundred iron chariots from Harosheth to the Kishon plain. On flat dry ground they are unbeatable.','JDG.4.13',{ss:[32.71,35.1]}],
['He draws up on the plain below.','JDG.4.13',{ss:[32.625,35.27]}],
['"Up, for this is the day." Barak charges down the mountain.','JDG.4.14',{bk:[32.645,35.31]}],
['Deborah\'s song says the stars fought and the Kishon swept them away: a cloudburst turned the plain to mud and the chariots stuck.','JDG.5.21',{bk:[32.63,35.275],ss:[32.622,35.25]}],
['The army is cut down back to Harosheth. Sisera runs the other way on foot, to the tent of Jael, who kills him with a tent peg as he sleeps.','JDG.4.21',{jl:[32.72,35.5],ss:[32.719,35.498],bk:[32.68,35.14]}]]},
{id:'gideon',t:'Gideon\'s three hundred',sub:'Judges 7 · c. 1170 BC',ref:'JDG.7.1',c:[32.565,35.36],z:11.8,br:20,u:[['g','a','Gideon'],['g2','a','100 men'],['g3','a','100 men'],['m','b','Midian, 135,000'],['ep','a','Ephraim']],s:[
['Gideon camps at the spring of Harod under Mount Gilboa with 32,000. Midian fills the valley to the north by the hill of Moreh.','JDG.7.1',{g:[32.5506,35.3569],m:[32.59,35.352]}],
['Too many. The fearful go home (22,000), then a test at the water leaves three hundred.','JDG.7.7',{}],
['At night Gideon creeps down to the camp and overhears a Midianite\'s dream of a barley loaf flattening a tent.','JDG.7.13',{g:[32.584,35.354]}],
['Three companies of a hundred take positions around the camp at the start of the middle watch. Each man has a horn and a torch hidden in a jar.','JDG.7.19',{g:[32.583,35.343],g2:[32.598,35.352],g3:[32.586,35.363]}],
['Jars smash, torches flare, three hundred horns sound. Midian wakes to lights on every side and turns its swords on itself.','JDG.7.22',{}],
['The survivors run southeast down the valley toward the Jordan fords. Ephraim cuts them off at the river.','JDG.7.24',{m:[32.44,35.5],g:[32.5,35.45],g2:null,g3:null,ep:[32.39,35.56]}]]},
{id:'michmash',t:'Jonathan at the pass of Michmash',sub:'1 Samuel 14 · c. 1040 BC',ref:'1SA.14.1',c:[31.866,35.272],z:14,br:40,u:[['jn','a','Jonathan'],['sl','a','Saul, 600'],['ph','b','Philistine garrison'],['mi','n','Michmash'],['ge','n','Geba']],s:[
['The Philistines hold Michmash on the north side of a deep gorge. Saul sits at the edge of Gibeah with six hundred men and almost no iron weapons.','1SA.14.2',{mi:[31.873,35.279],ge:[31.857,35.262],ph:[31.8715,35.2775],sl:[31.851,35.258]}],
['Jonathan tells no one. He and his armor-bearer go down into the gorge between two crags, Bozez and Seneh.','1SA.14.4',{jn:[31.8655,35.2725]}],
['They show themselves. The outpost jeers, "Come up to us." Jonathan takes it as his sign and climbs on hands and feet.','1SA.14.13',{jn:[31.8688,35.275]}],
['About twenty men fall in half an acre. Panic runs through the camp, and the ground shakes.','1SA.14.15',{jn:[31.8708,35.277],ph:[31.874,35.2795]}],
['Saul\'s lookouts see the army melting away. He attacks, and Hebrews who had been hiding in the hills join in.','1SA.14.20',{sl:[31.87,35.276]}],
['The rout runs west past Beth-aven, all the way to Aijalon, some fifteen miles.','1SA.14.31',{ph:[31.86,35.12],sl:[31.865,35.17],jn:[31.866,35.18]}]]},
{id:'elah',t:'David and Goliath',sub:'1 Samuel 17 · c. 1025 BC',ref:'1SA.17.1',c:[31.692,34.958],z:13.3,br:130,u:[['is','a','Israel'],['dv','a','David'],['ph','b','Philistines'],['go','b','Goliath']],s:[
['The Philistines camp between Socoh and Azekah on the south side of the Valley of Elah. Israel holds the ridge to the north. The valley floor lies between.','1SA.17.3',{ph:[31.683,34.965],is:[31.6975,34.957]}],
['For forty days, morning and evening, Goliath of Gath walks out and offers single combat.','1SA.17.16',{go:[31.6885,34.9615]}],
['David arrives from Bethlehem, fifteen miles east, with bread and cheese for his brothers.','1SA.17.20',{dv:[31.698,34.96]}],
['He refuses Saul\'s armor, picks five smooth stones from the stream bed and walks out.','1SA.17.40',{dv:[31.6915,34.9605]}],
['One stone. Goliath falls on his face, and David takes his head with the giant\'s own sword.','1SA.17.49',{dv:[31.6892,34.9612]}],
['The Philistines run west down the valley toward Gath and Ekron, with Israel behind them.','1SA.17.52',{go:null,ph:[31.7,34.87],is:[31.697,34.9],dv:[31.695,34.93]}]]},
{id:'megiddo',t:'Josiah at Megiddo',sub:'2 Kings 23 · 2 Chronicles 35 · 609 BC',ref:'2CH.35.20',c:[32.5,35.15],z:10.2,br:0,u:[['jo','a','Josiah'],['ne','b','Pharaoh Necho'],['me','n','Megiddo']],s:[
['Assyria is collapsing. Pharaoh Necho marches north up the coast to prop it up against Babylon at Carchemish.','2CH.35.20',{me:[32.585,35.185],ne:[32.2,34.9]}],
['Josiah brings Judah\'s army north to block him. Necho sends word: "I have no quarrel with you."','2CH.35.21',{jo:[32.3,35.25]}],
['Josiah will not turn back. He takes position where the pass through the Carmel ridge opens onto the plain at Megiddo.','2CH.35.22',{jo:[32.582,35.19],ne:[32.5,35.06]}],
['Egyptian archers hit the king in his chariot.','2CH.35.23',{ne:[32.575,35.175]}],
['He is carried to Jerusalem and dies. Judah\'s last good king is gone, and within 23 years so is the kingdom. Megiddo gives its name to Armageddon.','2CH.35.24',{jo:[32.2,35.22],ne:[32.75,35.3]}]]}
];
