'use strict';
/* ---------- calendar helpers (Julian calendar before 15 Oct 1582, astronomical year numbers) ---------- */
function jdCal(y,m,d,h){let Y=y,Mo=m; if(Mo<=2){Y--;Mo+=12} const g=(y>1582||(y===1582&&(m>10||(m===10&&d>=15)))), a=Math.floor(Y/100), b=g?2-a+Math.floor(a/4):0; return Math.floor(365.25*(Y+4716))+Math.floor(30.6001*(Mo+1))+d+b-1524.5+(h||0)/24}
function calJd(jd){const z=Math.floor(jd+.5), f=jd+.5-z; let a=z; if(z>=2299161){const al=Math.floor((z-1867216.25)/36524.25); a=z+1+al-Math.floor(al/4)} const b=a+1524, c=Math.floor((b-122.1)/365.25), d=Math.floor(365.25*c), e=Math.floor((b-d)/30.6001); const day=b-d-Math.floor(30.6001*e), m=e<14?e-1:e-13, y=m>2?c-4716:c-4715; return {y,m,d:day,h:f*24}}
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const yLabel=y=>y<=0?(1-y)+' BC':'AD '+y;
const astroT=jd=>Astronomy.MakeTime(new Date((jd-2440587.5)*86400000));

/* ---------- Hebrew calendar (the fixed arithmetic calendar, in use since about AD 359) ---------- */
const HEP=-1373427, HMON=['','Nisan','Iyar','Sivan','Tammuz','Av','Elul','Tishrei','Cheshvan','Kislev','Tevet','Shevat','Adar','Adar II'];
const hLeap=y=>((7*y+1)%19)<7;
function hElapsed(y){const m=Math.floor((235*y-234)/19), p=12084+13753*m; let d=m*29+Math.floor(p/25920); if((3*(d+1))%7<3) d++; return d}
function hNY(y){const a=hElapsed(y-1), b=hElapsed(y), c=hElapsed(y+1); return HEP+b+(c-b===356?2:(b-a===382?1:0))}
const hLen=y=>hNY(y+1)-hNY(y);
function hMonLen(y,m){ if([1,3,5,7,11].includes(m)) return 30; if([2,4,6,10,13].includes(m)) return 29; const L=hLen(y); if(m===8) return L%10===5?30:29; if(m===9) return L%10===3?29:30; return hLeap(y)?30:29}
const hOrder=y=>hLeap(y)?[7,8,9,10,11,12,13,1,2,3,4,5,6]:[7,8,9,10,11,12,1,2,3,4,5,6];
function hFromRD(rd){let y=Math.floor((rd-HEP)/365.2468)+1; while(hNY(y+1)<=rd) y++; while(hNY(y)>rd) y--; let rem=rd-hNY(y); for(const m of hOrder(y)){const n=hMonLen(y,m); if(rem<n) return {y,m,d:rem+1}; rem-=n} return {y,m:6,d:29}}
function hToRD(y,m,d){let rd=hNY(y); for(const k of hOrder(y)){ if(k===m) break; rd+=hMonLen(y,k)} return rd+d-1}
const rdCal=(y,m,d)=>Math.floor(jdCal(y,m,d,12)-1721424.5);
const hName=h=>h.d+' '+(h.m===12&&hLeap(h.y)?'Adar I':HMON[h.m])+' '+h.y;
const FEASTS=[[1,15,'Passover'],[3,6,'Shavuot (Pentecost)'],[5,9,'the Ninth of Av'],[7,1,'Rosh Hashanah (Trumpets)'],[7,10,'Yom Kippur (Day of Atonement)'],[7,15,'Sukkot (Tabernacles)'],[9,25,'Hanukkah'],[12,14,'Purim']];

/* ---------- the twelve ---------- */
/* IAU id, Hebrew, sound, English, Hebrew month no., tribe, letter, Genesis 49 ref, Deuteronomy 33 ref, in the calendar, 1800s "gospel in the stars" reading, Babylonian name, Vedic name */
const TWELVE=[
['Ari','טלה','Taleh','The Lamb (Aries)',1,'Judah','ה','GEN.49.9','DEU.33.7','Passover falls on the 14th and 15th: the lamb is killed in the month of the Lamb. Exodus 12:2 makes this the first month.','The Lamb that was slain.','The Hired Man','Mesha'],
['Tau','שור','Shor','The Ox (Taurus)',2,'Issachar','ו','GEN.49.14','DEU.33.18','The counting of the fifty days between Passover and Pentecost. Solomon began the temple in this month (1 Kings 6:1).','The coming Judge.','The Bull of Heaven','Vrishabha'],
['Gem','תאומים','Te\'omim','The Twins (Gemini)',3,'Zebulun','ז','GEN.49.13','DEU.33.18','Shavuot (Pentecost) on the 6th: the giving of the Law at Sinai on two tablets, and the Spirit in Acts 2.','Two natures in one person.','The Great Twins','Mithuna'],
['Cnc','סרטן','Sartan','The Crab (Cancer)',4,'Reuben','ח','GEN.49.3','DEU.33.6','The 17th marks the breaching of Jerusalem\'s walls. Tradition also puts the golden calf on this day.','The possession held fast.','The Crayfish','Karka'],
['Leo','אריה','Aryeh','The Lion (Leo)',5,'Simeon','ט','GEN.49.5','','The 9th: both temples were destroyed on this date, 586 BC and AD 70. The saddest day of the year.','The Lion of the tribe of Judah.','The Lion','Simha'],
['Vir','בתולה','Betulah','The Virgin (Virgo)',6,'Gad','י','GEN.49.19','DEU.33.20','The month of repentance: the shofar is blown each morning to prepare for the Day of Atonement.','The seed of the woman.','The Furrow','Kanya'],
['Lib','מאזנים','Moznayim','The Scales (Libra)',7,'Ephraim','ל','GEN.49.22','DEU.33.13','Trumpets on the 1st, the Day of Atonement on the 10th, Tabernacles on the 15th. The month of judgment, under the Scales.','The price weighed and paid.','The Scales','Tula'],
['Sco','עקרב','Akrav','The Scorpion (Scorpio)',8,'Manasseh','נ','GEN.49.22','DEU.33.17','The only month with no feast or fast. Genesis 7:11 starts the Flood on the 17th of the second month, which tradition counts as this one.','The conflict and the wounded heel.','The Scorpion','Vrischika'],
['Sgr','קשת','Keshet','The Bow (Sagittarius)',9,'Benjamin','ס','GEN.49.27','DEU.33.12','Hanukkah begins on the 25th. The Hebrew sign is just "the Bow," the same word as the rainbow of Genesis 9:13.','The conqueror riding out.','Pabilsag the archer','Dhanu'],
['Cap','גדי','Gedi','The Kid (Capricorn)',10,'Dan','ע','GEN.49.16','DEU.33.22','The 10th: Nebuchadnezzar began the siege of Jerusalem (2 Kings 25:1).','The sacrifice that brings life.','The Goat-Fish','Makara'],
['Aqr','דלי','Deli','The Water-Bucket (Aquarius)',11,'Asher','צ','GEN.49.20','DEU.33.24','The 15th is the new year for trees. Moses began his last address, Deuteronomy, on the 1st (Deuteronomy 1:3).','Living water poured out.','The Great One','Kumbha'],
['Psc','דגים','Dagim','The Fishes (Pisces)',12,'Naphtali','ק','GEN.49.21','DEU.33.23','Purim on the 14th: the deliverance in the book of Esther. In leap years the month is doubled.','The people, bound and upheld.','The Tails','Meena']
];
const WEST=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const BODIES=[['Sun','שמש','Shemesh','#ffd36b',9],['Moon','ירח','Yareach','#f2efe6',8],['Mercury','כוכב','Kokhav','#c9c9c9',3.5],['Venus','נגה','Nogah','#fff7d6',5],['Mars','מאדים','Ma\'adim','#ff7a5c',4],['Jupiter','צדק','Tzedek','#ffe2b0',5],['Saturn','שבתאי','Shabbtai','#e8d49a',4]];
const BSTARS=[['Kimah · Pleiades',56.75,24.12,'JOB.38.31'],['Kesil · Orion',83.8,-1.2,'JOB.38.31'],['Ayish · the Bear',183.8,57],['Regulus',152.09,11.97],['Spica',201.3,-11.16],['Antares',247.35,-26.43],['Aldebaran',68.98,16.51],['Sirius',101.29,-16.72]];
const SKPLACES=[['Jerusalem',31.777,35.234],['Bethlehem',31.704,35.208],['Babylon',32.543,44.422],['Ur',30.963,46.103],['Mount Sinai',28.539,33.975],['Nineveh',36.359,43.153],['Gibeon',31.847,35.185],['Patmos',37.325,26.542],['Rome',41.892,12.485]];

const SK={tab:'sky',D:null,pl:0,lat:31.777,lon:35.234,jd:Date.now()/86400000+2440587.5,hi:null,hits:[],timer:null,names:true,res:null};
VIEW.sky=()=>{ if(!$('#sky').firstChild) renderSky() };
function renderSky(){
  clearInterval(SK.timer); SK.timer=null;
  $('#sky').innerHTML=`<h2 class="sec rub">Mazzaroth</h2><p class="sub">"Canst thou bring forth Mazzaroth in his season?" The real sky over the Bible lands, on any night in history.</p>`+seg([['sky','The sky'],['twelve','The twelve'],['you','Your Mazzaroth'],['signs','Signs in scripture'],['word','What the Bible says']],SK.tab,'stab')+'<div id="sbody"></div>';
  ({sky:sSky,twelve:sTwelve,you:sYou,signs:sSigns,word:sWord})[SK.tab]($('#sbody'));
}
ACT.stab=el=>{SK.tab=el.dataset.k; renderSky()};
async function skyData(){ if(SK.D) return SK.D; const d=await J('sky.json'); if(!d) return null; const r=Math.PI/180, v=x=>[Math.cos(x[1]*r)*Math.cos(x[0]*r),Math.cos(x[1]*r)*Math.sin(x[0]*r),Math.sin(x[1]*r)];
  d.sv=d.s.map(v); d.lv={}; for(const k in d.l) d.lv[k]=d.l[k].map(sg=>sg.map(v)); d.cen={}; for(const k in d.lv){let x=0,y=0,z=0,n=0; d.lv[k].forEach(sg=>sg.forEach(p=>{x+=p[0];y+=p[1];z+=p[2];n++})); const m=Math.hypot(x,y,z); d.cen[k]=[x/m,y/m,z/m]}
  d.bv=BSTARS.map(b=>v([b[1],b[2]])); d.nv=d.n.map(v);
  const er=Astronomy.Rotation_ECL_EQJ().rot; d.ecl=[]; for(let l=0;l<=360;l+=4){const c=Math.cos(l*r), s=Math.sin(l*r); d.ecl.push([er[0][0]*c+er[1][0]*s,er[0][1]*c+er[1][1]*s,er[0][2]*c+er[1][2]*s])}
  return SK.D=d }

/* everything about the sky at one moment */
function skyState(jd,lat,lon){const t=astroT(jd), obs=new Astronomy.Observer(lat,lon,0), out={t,obs,b:[]};
  for(const B of BODIES){const eq=Astronomy.Equator(B[0],t,obs,true,true), hz=Astronomy.Horizon(t,obs,eq.ra,eq.dec,'normal'), ej=Astronomy.Equator(B[0],t,obs,false,true), con=Astronomy.Constellation(ej.ra,ej.dec);
    out.b.push({n:B[0],he:B[1],tr:B[2],col:B[3],r:B[4],alt:hz.altitude,az:hz.azimuth,con:con.symbol,conName:con.name})}
  out.sunLon=Astronomy.SunPosition(t).elon; out.phase=Astronomy.MoonPhase(t); out.illum=Math.round((1-Math.cos(out.phase*Math.PI/180))/2*100); return out}
const phaseName=p=>p<12||p>348?'new moon':p<78?'waxing crescent':p<102?'first quarter':p<168?'waxing gibbous':p<192?'full moon':p<258?'waning gibbous':p<282?'last quarter':'waning crescent';
const signOf=id=>TWELVE.find(x=>x[0]===id);

function sSky(el){
  const c=calJd(SK.jd+SK.lon/360);
  el.innerHTML=`<div class="two" style="margin-bottom:8px"><div><label>Standing at</label><select class="inp" data-chg="skplace">${SKPLACES.map((p,i)=>`<option value="${i}" ${i===SK.pl?'selected':''}>${p[0]}</option>`).join('')}<option value="-1" ${SK.pl<0?'selected':''}>My location</option></select></div>
  <div><label>Year</label><div style="display:flex;gap:4px"><input class="inp" id="sky-y" type="number" inputmode="numeric" value="${c.y<=0?1-c.y:c.y}" data-chg="skdate" style="padding:0 8px"><select class="inp" id="sky-e" data-chg="skdate" style="width:74px;padding:0 6px"><option ${c.y>0?'selected':''}>AD</option><option ${c.y<=0?'selected':''}>BC</option></select></div></div></div>
  <div class="two"><div><label>Month</label><select class="inp" id="sky-m" data-chg="skdate">${MON.map((m,i)=>`<option value="${i+1}" ${i+1===c.m?'selected':''}>${m}</option>`).join('')}</select></div><div><label>Day</label><input class="inp" id="sky-d" type="number" inputmode="numeric" min="1" max="31" value="${c.d}" data-chg="skdate"></div></div>
  <div style="margin:10px 0 2px" class="row"><span class="lbl" id="sky-tl" style="width:88px"></span><input type="range" id="sky-h" min="0" max="23.9" step="0.1" value="${c.h.toFixed(1)}" data-inp="skhour" style="flex:1;accent-color:var(--red);height:36px"></div>
  <div class="row" style="margin-bottom:10px"><button class="btn sm" data-act="sknow">Now</button><button class="btn sm" data-act="skstep" data-d="-30">− month</button><button class="btn sm" data-act="skstep" data-d="30">+ month</button><button class="btn sm pri" data-act="skplay" id="sky-play">▶ Run the night</button></div>
  <canvas id="skyc" style="display:block;width:100%;max-width:560px;margin:0 auto;border-radius:50%;touch-action:manipulation"></canvas>
  <div id="sky-cap" style="margin-top:12px"></div>
  <p class="note">You are looking straight up: north at the top, east on the left. The gold line is the ecliptic, the sun's yearly road, and the twelve constellations along it are the Mazzaroth. Step a month at a time at the same hour to watch them brought out "in season." Dates before 1582 use the Julian calendar. Clock time is local sun time.</p>`;
  $('#skyc').addEventListener('click',skyTap); drawSky();
}
function skyReadInputs(){let y=Math.max(1,+$('#sky-y').value||1); if($('#sky-e').value==='BC') y=1-y; const m=+$('#sky-m').value, d=Math.max(1,Math.min(31,+$('#sky-d').value||1)), h=+$('#sky-h').value; SK.jd=jdCal(y,m,d,h)-SK.lon/360}
ACT.skdate=()=>{skyReadInputs(); drawSky()};
ACT.skhour=()=>{skyReadInputs(); drawSky()};
ACT.skplace=el=>{const i=+el.value; if(i<0){ if(!navigator.geolocation){toast('Location is not available');return} navigator.geolocation.getCurrentPosition(p=>{const loc=calJd(SK.jd+SK.lon/360); SK.pl=-1; SK.lat=p.coords.latitude; SK.lon=p.coords.longitude; drawSky()},()=>toast('Could not get your location')); return}
  SK.pl=i; SK.lat=SKPLACES[i][1]; SK.lon=SKPLACES[i][2]; drawSky()};
ACT.sknow=()=>{SK.jd=Date.now()/86400000+2440587.5; sSky($('#sbody'))};
ACT.skstep=el=>{SK.jd+=+el.dataset.d*(365.2422/360); sSky($('#sbody'))};
ACT.skplay=()=>{ if(SK.timer){clearInterval(SK.timer); SK.timer=null; $('#sky-play').textContent='▶ Run the night'; return} $('#sky-play').textContent='❚❚ Pause'; SK.timer=setInterval(()=>{ if(!$('#skyc')){clearInterval(SK.timer); SK.timer=null; return} SK.jd+=6/1440; const c=calJd(SK.jd+SK.lon/360), h=$('#sky-h'); if(h) h.value=c.h.toFixed(1); drawSky()},90)};
function setSky(jd,pl,hi){SK.jd=jd; if(pl!=null){SK.pl=pl; SK.lat=SKPLACES[pl][1]; SK.lon=SKPLACES[pl][2]} SK.hi=hi||null; SK.tab='sky'; Sheet.close(); go('sky'); renderSky(); $('#v-sky').scrollTop=0}

async function drawSky(){
  const cv=$('#skyc'); if(!cv) return; const D=await skyData(); if(!D||!$('#skyc')) return;
  const W=Math.min(cv.parentNode.clientWidth,560), dpr=Math.min(window.devicePixelRatio||1,2); if(cv.width!==W*dpr){cv.width=cv.height=W*dpr; cv.style.height=W+'px'}
  const g=cv.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0); const cx=W/2, cy=W/2, R=W/2-2, st=skyState(SK.jd,SK.lat,SK.lon), rot=Astronomy.Rotation_EQJ_HOR(st.t,st.obs).rot, sun=st.b[0];
  const P=v=>{const x=rot[0][0]*v[0]+rot[1][0]*v[1]+rot[2][0]*v[2], y=rot[0][1]*v[0]+rot[1][1]*v[1]+rot[2][1]*v[2], z=rot[0][2]*v[0]+rot[1][2]*v[1]+rot[2][2]*v[2]; if(z<-0.02) return null; const k=R/(1+z); return [cx+y*k,cy-x*k,z]};
  const PA=(alt,az)=>{ if(alt<-1) return null; const r=Math.PI/180, rr=R*Math.tan((90-alt)/2*r); return [cx-rr*Math.sin(az*r),cy-rr*Math.cos(az*r)]};
  const day=Math.max(0,Math.min(1,(sun.alt+12)/18)), gr=g.createRadialGradient(cx,cy,0,cx,cy,R);
  const mix=(a,b)=>`rgb(${a.map((x,i)=>Math.round(x+(b[i]-x)*day)).join(',')})`; gr.addColorStop(0,mix([6,9,22],[70,130,200])); gr.addColorStop(1,mix([16,22,44],[150,190,225]));
  g.clearRect(0,0,W,W); g.save(); g.beginPath(); g.arc(cx,cy,R,0,7); g.clip(); g.fillStyle=gr; g.fillRect(0,0,W,W);
  const dim=1-day*.75; SK.hits=[];
  /* constellation figures */
  for(const k in D.lv){const z=signOf(k), hi=SK.hi===k; g.strokeStyle=z?(hi?`rgba(255,120,80,${.95*dim+.05})`:`rgba(255,211,107,${.75*dim})`):`rgba(170,190,230,${.22*dim})`; g.lineWidth=z?(hi?2.2:1.3):.8; g.beginPath(); D.lv[k].forEach(sg=>{let pen=false; sg.forEach(v=>{const p=P(v); if(!p){pen=false;return} pen?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); pen=true})}); g.stroke()}
  /* ecliptic */
  g.strokeStyle=`rgba(255,211,107,${.5*dim+.15})`; g.lineWidth=1; g.setLineDash([4,5]); g.beginPath(); let pen=false; D.ecl.forEach(v=>{const p=P(v); if(!p){pen=false;return} pen?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); pen=true}); g.stroke(); g.setLineDash([]);
  /* stars */
  g.fillStyle='#fff'; for(let i=0;i<D.sv.length;i++){const m=D.s[i][2]; if(day>.5&&m>1.5) break; const p=P(D.sv[i]); if(!p) continue; const r=Math.max(.5,2.6-m*.42); g.globalAlpha=Math.min(1,(1.15-m*.13)*dim+.05); g.beginPath(); g.arc(p[0],p[1],r,0,7); g.fill()} g.globalAlpha=1;
  /* labels */
  g.textAlign='center'; g.font='600 11px system-ui,sans-serif';
  if(SK.names){ TWELVE.forEach(z=>{const p=P(D.cen[z[0]]); if(!p||p[2]<.03) return; g.fillStyle=SK.hi===z[0]?'#ff9a7d':`rgba(255,221,140,${.9*dim+.1})`; g.fillText(z[2]+' '+z[1],p[0],p[1]-4); SK.hits.push([p[0],p[1],'z',z[0]])});
    g.font='10.5px system-ui,sans-serif'; BSTARS.forEach((b,i)=>{const p=P(D.bv[i]); if(!p||p[2]<.03) return; g.fillStyle=`rgba(200,220,255,${.85*dim+.1})`; g.fillText(b[0],p[0],p[1]+(i<3?14:-7))}) }
  /* sun, moon, wandering stars */
  st.b.forEach(b=>{const p=PA(b.alt,b.az); if(!p) return; g.beginPath(); g.arc(p[0],p[1],b.r,0,7); g.fillStyle=b.col; g.shadowColor=b.col; g.shadowBlur=b.n==='Sun'?22:8; g.fill(); g.shadowBlur=0;
    if(b.n==='Moon'){const ph=st.phase*Math.PI/180; g.fillStyle='rgba(8,10,20,.82)'; g.beginPath(); const s=ph<Math.PI?-1:1; g.arc(p[0],p[1],b.r,-Math.PI/2,Math.PI/2,s>0); g.ellipse(p[0],p[1],Math.abs(Math.cos(ph))*b.r,b.r,0,Math.PI/2,-Math.PI/2,(Math.cos(ph)>0)===(s>0)); g.fill()}
    g.fillStyle=day>.6?'#14110d':'#fff'; g.font='600 11px system-ui,sans-serif'; g.fillText(b.n,p[0],p[1]-b.r-4); SK.hits.push([p[0],p[1],'b',b.n])});
  g.restore(); g.strokeStyle='#d3ad55'; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,R,0,7); g.stroke();
  g.fillStyle=day>.6?'#14110d':'#d3ad55'; g.font='600 12px system-ui,sans-serif'; [['N',0],['E',90],['S',180],['W',270]].forEach(c=>{const r=Math.PI/180, rr=R-12; g.fillText(c[0],cx-rr*Math.sin(c[1]*r),cy-rr*Math.cos(c[1]*r)+4)});
  /* caption */
  const c=calJd(SK.jd+SK.lon/360), hh=Math.floor(c.h), mm=Math.floor((c.h-hh)*60); const tl=$('#sky-tl'); if(tl) tl.textContent=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
  const zs=signOf(sun.con), up=st.b.filter(b=>b.alt>0&&b.n!=='Sun'&&b.n!=='Moon'), h=hFromRD(rdCal(c.y,c.m,c.d)), moon=st.b[1], zm=signOf(moon.con);
  $('#sky-cap').innerHTML=`<div class="card" style="cursor:default"><span class="lbl">${esc(SK.pl<0?'Your location':SKPLACES[SK.pl][0])} · ${c.d} ${MON[c.m-1]} ${yLabel(c.y)} · ${hName(h)}${c.y<359?' (calculated calendar, projected back)':''}</span>
  <p style="color:var(--ink);font-size:14.5px">${sun.alt>0?'Daylight. ':sun.alt>-12?'Twilight. ':''}The sun stands among the stars of <b>${esc(sun.conName)}</b>${zs?' (<span class="heb">'+zs[1]+'</span> '+zs[2]+')':''}${sun.alt>0?', so that sign is hidden in its glare':''}.</p>
  <p style="color:var(--ink);font-size:14.5px">Moon: ${phaseName(st.phase)}, ${st.illum}% lit, in ${esc(moon.conName)}${zm?' ('+zm[2]+')':''}${moon.alt>0?'':' (below the horizon)'}.</p>
  <p>${up.length?'Wandering stars in the sky: '+up.map(b=>`${b.n} (<span class="heb">${b.he}</span>) in ${esc(b.conName)}`).join(' · '):'No planets above the horizon.'}</p>
  <div class="row" style="margin-top:8px"><button class="btn sm" data-act="sknames">${SK.names?'Hide':'Show'} names</button>${SK.hi?'<button class="btn sm" data-act="skunhi">Clear highlight</button>':''}</div></div>`;
}
ACT.sknames=()=>{SK.names=!SK.names; drawSky()};
ACT.skunhi=()=>{SK.hi=null; drawSky()};
function skyTap(e){const r=e.currentTarget.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top; let best=null, bd=34; SK.hits.forEach(h=>{const d=Math.hypot(h[0]-x,h[1]-y); if(d<bd){bd=d;best=h}}); if(!best) return;
  if(best[2]==='z') openSign(best[3]); else {const b=BODIES.find(q=>q[0]===best[3]); toast(`${b[0]}: ${b[1]} (${b[2]}) in Hebrew`)}}

/* ---------- the twelve ---------- */
function sTwelve(el){
  el.innerHTML=`<div class="prose" style="font-size:15.5px"><p>Twelve constellations lie along the sun's road. Israel's calendar has twelve months, each beginning at a new moon, and Jewish tradition pairs each month with the sign the sun passes through, with one of the twelve tribes, and with a Hebrew letter.</p></div>
  <p class="note">Three layers are kept apart here. <b>Scripture</b>: the verses themselves. <b>Tradition</b>: the month, tribe and letter pairings, from the Sefer Yetzirah and later rabbinic writers. <b>Theory</b>: the "gospel in the stars" reading, from three authors in the 1800s.</p>`+
  TWELVE.map(z=>`<button class="card" data-act="sign" data-id="${z[0]}"><span class="lbl">${HMON[z[4]]} · tribe of ${z[5]}</span><h3><span class="heb" style="font-size:24px;color:var(--gold)">${z[1]}</span> &nbsp;${esc(z[2])} · ${esc(z[3])}</h3><p>${esc(z[9])}</p></button>`).join('')+
  `<h3 class="sec" style="font-size:20px">The camp and the four faces</h3><div class="prose" style="font-size:15.5px"><p>Numbers 2 arranges the tribes around the tabernacle in four groups of three, each under a leading standard: Judah to the east, Reuben south, Ephraim west, Dan north. The text does not say what was on the standards.</p><p>Later Jewish tradition gives them as a lion, a man, an ox and an eagle: the four faces of the living creatures in Ezekiel 1:10 and Revelation 4:7. Those four also match the four signs a quarter-turn apart on the zodiac: the Lion, the Water-Bearer, the Ox and the Scorpion (which older star lore sometimes drew as an eagle).</p></div>
  <div class="row"><button class="btn sm" data-act="goref" data-ref="NUM.2.2">Numbers 2</button><button class="btn sm" data-act="goref" data-ref="EZK.1.10">Ezekiel 1:10</button><button class="btn sm" data-act="goref" data-ref="REV.4.7">Revelation 4:7</button></div>`;
}
ACT.sign=el=>openSign(el.dataset.id);
function openSign(id){const z=signOf(id); if(!z) return;
  Sheet.open({title:z[2]+' · '+z[3],full:true,render(el){
    el.innerHTML=`<div style="text-align:center"><div class="heb" style="font-size:64px;color:var(--gold);line-height:1.2">${z[1]}</div><div class="lbl">${esc(z[2])} · month of ${HMON[z[4]]}</div></div>
    <div class="row" style="margin:14px 0"><button class="btn sm pri" data-act="signsky" data-id="${id}">Find it in the sky</button><button class="btn sm" data-act="signsun" data-id="${id}">When the sun is in it</button></div>
    <div class="lbl" style="margin-top:6px;color:var(--green)">In the calendar</div><p class="def">${esc(z[9])}</p>
    <div class="lbl" style="margin-top:14px;color:var(--gold)">Tradition</div><p class="def">Tribe: <b>${z[5]}</b>. Letter: <span class="heb" style="font-size:22px">${z[6]}</span>. The pairing of tribes follows the order of the camp in Numbers 2 and of the princes' offerings in Numbers 7.</p>
    <div class="lbl" style="margin-top:14px;color:var(--blue)">Scripture: the blessings on ${z[5]}</div>
    <div class="cmp"><b>Jacob</b><span id="sg-g">…</span></div>${z[8]?'<div class="cmp"><b>Moses</b><span id="sg-d">…</span></div>':'<p class="note">Moses\' blessing in Deuteronomy 33 leaves Simeon out.</p>'}
    <div class="row" style="margin-top:8px"><button class="btn sm" data-act="goref" data-ref="${z[7]}">Open ${esc(dotStr(z[7]))}</button>${z[8]?`<button class="btn sm" data-act="goref" data-ref="${z[8]}">Open ${esc(dotStr(z[8]))}</button>`:''}</div>
    <div class="lbl" style="margin-top:18px;color:var(--red)">Theory (1800s): the gospel in the stars</div><p class="def">${esc(z[10])} <span style="color:var(--dim);font-size:14px">This reading comes from Frances Rolleston, Joseph Seiss and E. W. Bullinger. It depends on star-name meanings that Hebrew and Arabic scholars mostly do not accept, and no ancient source teaches it.</span></p>
    <div class="lbl" style="margin-top:14px">Other names</div><p class="def" style="font-size:15px">Babylonian: ${esc(z[11])}. Vedic: ${esc(z[12])}. The twelve signs reached Israel, Greece and India from Babylonian astronomy.</p>`;
    verseText('KJV',...Object.values(dotRef(z[7])).slice(0,3)).then(t=>{const x=$('#sg-g'); if(x) x.textContent=t}); if(z[8]) verseText('KJV',...Object.values(dotRef(z[8])).slice(0,3)).then(t=>{const x=$('#sg-d'); if(x) x.textContent=t})}})}
ACT.signsky=el=>{const id=el.dataset.id, D=SK.D; /* find an evening this year when it is high */ const now=calJd(Date.now()/86400000+2440587.5); let best=[-1,0];
  skyData().then(d=>{for(let k=0;k<12;k++){const jd=jdCal(now.y,k+1,15,21.5)-SK.lon/360, t=astroT(jd), rot=Astronomy.Rotation_EQJ_HOR(t,new Astronomy.Observer(SK.lat,SK.lon,0)).rot, v=d.cen[id], z=rot[0][2]*v[0]+rot[1][2]*v[1]+rot[2][2]*v[2]; if(z>best[0]) best=[z,jd]} setSky(best[1],null,id); toast('Highest in the evening sky this month')})};
ACT.signsun=el=>{const id=el.dataset.id, now=calJd(Date.now()/86400000+2440587.5); for(let dd=0;dd<366;dd+=3){const jd=jdCal(now.y,1,1,12)+dd, t=astroT(jd), e=Astronomy.Equator('Sun',t,new Astronomy.Observer(31.78,35.23,0),false,true); if(Astronomy.Constellation(e.ra,e.dec).symbol===id){setSky(jd+8-SK.lon/360,null,id); toast('The sun is passing through it, so it is hidden by day'); return}}};

/* ---------- your Mazzaroth ---------- */
function sYou(el){
  const b=Store.get('birth',{d:'',t:'12:00',ss:false});
  el.innerHTML=`<div class="prose" style="font-size:15.5px"><p>Where your birthday falls in the Bible's own calendar: the Hebrew date, the month's sign, tribe and feast, and the real sky at that moment.</p></div>
  <div class="two"><div><label>Date of birth</label><input class="inp" type="date" id="yb-d" value="${esc(b.d)}"></div><div><label>Time (if known)</label><input class="inp" type="time" id="yb-t" value="${esc(b.t)}"></div></div>
  <label class="row" style="margin:12px 0;font-family:var(--sans);font-size:14px"><input type="checkbox" id="yb-s" ${b.ss?'checked':''} style="width:22px;height:22px;accent-color:var(--red)"> Born after sunset (the Hebrew day begins at sundown)</label>
  <button class="btn pri" data-act="youcalc" style="width:100%">Show my Mazzaroth</button><div id="yres"></div>
  <p class="note" style="margin-top:18px">This is not a horoscope. It does not describe your character or predict anything, and nothing in the Bible says the stars do. Deuteronomy 18:10 and Isaiah 47:13 forbid reading fortunes from them. What it gives you is real: your place in the calendar God gave Israel, the scriptures tied to it, and the sky that was overhead. Nothing you enter leaves this device.</p>`;
  if(b.d) youCalc();
}
ACT.youcalc=()=>{const d=$('#yb-d').value; if(!d){toast('Enter a date of birth');return} Store.set('birth',{d,t:$('#yb-t').value||'12:00',ss:$('#yb-s').checked}); youCalc()};
function youCalc(){
  const b=Store.get('birth',{}), [y,m,d]=b.d.split('-').map(Number), [hh,mi]=(b.t||'12:00').split(':').map(Number), out=$('#yres'); if(!y) return;
  const dt=new Date(y,m-1,d,hh||0,mi||0), jd=dt.getTime()/86400000+2440587.5, t=astroT(jd), obs=new Astronomy.Observer(31.78,35.23,0);
  const h=hFromRD(rdCal(y,m,d)+(b.ss?1:0)), z=TWELVE.find(x=>x[4]===(h.m===13?12:h.m)), st=skyState(jd,31.78,35.23), sun=st.b[0], moon=st.b[1];
  const trop=WEST[Math.floor(st.sunLon/30)%12], ay=23.853+(y-2000)*0.013969, sid=((st.sunLon-ay)%360+360)%360, ved=TWELVE[Math.floor(sid/30)], real=signOf(sun.con);
  /* nearest feast */
  let nf=null; const rd=hToRD(h.y,h.m,h.d); for(const yy of [h.y-1,h.y,h.y+1]) for(const f of FEASTS){const fm=(f[0]===12&&hLeap(yy))?13:f[0], dd=hToRD(yy,fm,f[1])-rd; if(!nf||Math.abs(dd)<Math.abs(nf[0])) nf=[dd,f[2]]}
  const feast=nf[0]===0?`on ${nf[1]} itself`:`${Math.abs(nf[0])} day${Math.abs(nf[0])===1?'':'s'} ${nf[0]>0?'before':'after'} ${nf[1]}`;
  const moonDay=h.d<=2?'The month had just begun: a thin new crescent.':h.d>=13&&h.d<=16?'Mid-month: the moon was full, as it is at Passover and Tabernacles.':h.d>=27?'The end of the month: the moon had all but vanished.':h.d<13?'The moon was growing toward full.':'The moon was shrinking from full.';
  out.innerHTML=`<div class="verdict" style="margin-top:16px;text-align:center"><div class="lbl">Your Hebrew birthday</div><b style="font-size:26px">${hName(h)}</b><br><span style="color:var(--dim)">${feast}</span></div>
  <button class="card" data-act="sign" data-id="${z[0]}"><span class="lbl">Sign of your month · Jewish tradition</span><h3><span class="heb" style="font-size:26px;color:var(--gold)">${z[1]}</span> &nbsp;${esc(z[2])} · ${esc(z[3])}</h3><p>Month of ${HMON[z[4]]}. Tribe: ${z[5]}. Letter: ${z[6]}. ${esc(z[9])}</p></button>
  <div class="card" style="cursor:default"><span class="lbl">The blessings on ${z[5]}</span><p style="color:var(--ink);font-size:15.5px;font-family:var(--serif)" id="yb-g">…</p>${z[8]?'<p style="color:var(--ink);font-size:15.5px;font-family:var(--serif)" id="yb-m">…</p>':''}<p>${esc(dotStr(z[7]))}${z[8]?' · '+esc(dotStr(z[8])):''}. These were spoken over a tribe, not over people born in a month. The link to your month is tradition.</p></div>
  <div class="card" style="cursor:default"><span class="lbl">Four systems, one sun</span>
  <div class="cmp"><b style="width:74px">Hebrew</b><span>${esc(z[2])}, ${esc(z[3])}<small>by the month you were born in</small></span></div>
  <div class="cmp"><b style="width:74px">Real sky</b><span>${esc(sun.conName)}${real?' ('+real[2]+')':''}<small>the stars actually behind the sun that day</small></span></div>
  <div class="cmp"><b style="width:74px">Vedic</b><span>${esc(ved[12])} (${esc(ved[3].replace(/.*\(|\)/g,''))})<small>measured against the stars</small></span></div>
  <div class="cmp"><b style="width:74px">Western</b><span>${trop}<small>fixed to the seasons about 2,000 years ago</small></span></div>
  <p>Western signs are counted from the spring equinox, and the equinox has slid about one sign backward against the stars since the system was fixed. That is why the Western sign and the real sky usually disagree. The Hebrew method does not use the sun's position at all: it goes by the moon's months.</p></div>
  <div class="card" style="cursor:default"><span class="lbl">The moon and the wandering stars</span><p style="color:var(--ink)">Moon: ${phaseName(st.phase)}, ${st.illum}% lit, in ${esc(moon.conName)}. ${moonDay}</p><p>${st.b.slice(2).map(p=>`${p.n} (<span class="heb">${p.he}</span> ${esc(p.tr)}) in ${esc(p.conName)}`).join(' · ')}</p></div>
  <button class="btn" data-act="yousky" style="width:100%">See the sky over Jerusalem at that moment</button>
  <p class="note">Time is read in this device's time zone. The Hebrew date uses the calculated calendar.</p>`;
  SK.res=jd; const g=dotRef(z[7]); verseText('KJV',g.b,g.c,g.v).then(x=>{const e=$('#yb-g'); if(e) e.textContent=x}); if(z[8]){const q=dotRef(z[8]); verseText('KJV',q.b,q.c,q.v).then(x=>{const e=$('#yb-m'); if(e) e.textContent=x})}
}
ACT.yousky=()=>setSky(SK.res,0);

/* ---------- signs in scripture ---------- */
const SIGNS=[
['The Lamb at the Exodus','EXO.12.2','At the first Passover the sun stood among the stars of the Lamb (Aries). You can check it: this is the sky on the 14th of the first month in the traditional Exodus year.',[-1445,4,4,12,0],'Ari','Astronomy, not tradition: the spring sun was in Aries from about 1865 BC to about 68 BC.'],
['Kimah and Kesil','JOB.38.31','The Pleiades and Orion, named in Job and Amos, high on a winter evening.',['y',1,15,21,0],null,'The same two star groups are named together in Job 9:9, Job 38:31 and Amos 5:8.'],
['Joshua\'s long day','JOS.10.13','On 30 October 1207 BC an eclipse covered most of the sun over Gibeon in the afternoon. Two Cambridge researchers proposed in 2017 that this is the event behind the verse.',[-1206,10,30,15.2,6],null,'It requires the later date for the conquest and reading the Hebrew as "the sun stopped shining." Most readers take the verse as a lengthened day.'],
['Darkness at noon','AMO.8.9','"I will cause the sun to go down at noon." On 15 June 763 BC a total eclipse crossed Assyria. It is recorded in the Assyrian king lists and falls in the reign of Jeroboam II, when Amos preached.',[-762,6,15,9.4,5],null,'This eclipse is the anchor that fixes Assyrian, and through them Israelite, dates.'],
['The star of Bethlehem: Jupiter and Saturn','MAT.2.2','In 7 BC Jupiter and Saturn met three times in Pisces, about one degree apart. Kepler was the first to connect this with the magi.',[-6,5,29,3.5,2],'Psc','Fits a birth before Herod\'s death in 4 BC. A one-degree gap is two moon-widths, so it was not a single "star."'],
['The star of Bethlehem: Jupiter and Venus','MAT.2.2','On the evening of 17 June 2 BC, Jupiter and Venus came so close in Leo that they would have looked like one brilliant star in the west.',[-1,6,17,20.6,2],'Leo','Striking, but it needs Herod to have died later than the usual date of 4 BC.'],
['The eclipse before Herod died','MAT.2.19','Josephus says Herod died after a lunar eclipse and before a Passover. The usual candidate is the partial eclipse of 13 March 4 BC.',[-3,3,13,2.7,0],null,'This eclipse is the main reason Jesus\' birth is dated to about 6–4 BC.'],
['The moon turned to blood','ACT.2.20','On Friday 3 April AD 33, a partial lunar eclipse was in progress as the full Passover moon rose over Jerusalem.',[33,4,3,18.6,0],null,'One of the two leading dates for the crucifixion. The other, 7 April AD 30, had no eclipse.'],
['The woman clothed with the sun','REV.12.1','On 23 September 2017 the sun was in Virgo, the moon just below her feet, Jupiter inside the figure, and Mercury, Venus and Mars in Leo above her head.',[2017,9,23,12,0],'Vir','Widely shared as a fulfilment. Astronomers who checked found similar line-ups at least four other times in the last thousand years.']
];
function sSigns(el){
  el.innerHTML=`<div class="prose" style="font-size:15.5px"><p>Places where the Bible points at the sky, set beside what was really overhead. Every sky here is calculated, so you can check each claim yourself.</p></div>`+
  SIGNS.map((s,i)=>`<div class="card" style="cursor:default"><span class="lbl">${esc(dotStr(s[1]))}</span><h3>${esc(s[0])}</h3><p style="color:var(--ink)">${esc(s[2])}</p><p>${esc(s[5])}</p><div class="row" style="margin-top:10px"><button class="btn sm pri" data-act="sigsky" data-i="${i}">See that sky</button><button class="btn sm" data-act="goref" data-ref="${s[1]}">Read the verse</button></div></div>`).join('')+
  `<p class="note">Sky positions come from a modern planetary model and are reliable to a fraction of a degree across these dates. Clock times for ancient eclipses can be off by a few minutes, because the earth's rotation has slowed by an amount that is not known exactly.</p>`;
}
ACT.sigsky=el=>{const s=SIGNS[+el.dataset.i], a=s[3], pl=a[4], y=a[0]==='y'?calJd(Date.now()/86400000+2440587.5).y:a[0]; setSky(jdCal(y,a[1],a[2],a[3])-SKPLACES[pl][2]/360,pl,s[4])};

/* ---------- what the Bible says ---------- */
const SKYV=[['A calendar and a sign','The lights are made "for signs, and for seasons, and for days, and years." The Hebrew word for seasons, moedim, is the word for the appointed feasts.',['GEN.1.14','PSA.104.19','LEV.23.4']],
['A witness without words','The heavens declare the glory of God to every nation, with no speech or language.',['PSA.19.1','PSA.8.3','ROM.1.20']],
['Named and numbered','He counts the stars and calls each by name. Three star groups are named outright: the Pleiades, Orion and the Bear.',['PSA.147.4','ISA.40.26','JOB.9.9','JOB.38.31','AMO.5.8']],
['Signs that were given','A star for the magi. Darkness at the cross. Signs in the sun, moon and stars before the end.',['NUM.24.17','MAT.2.2','LUK.23.44','LUK.21.25','REV.12.1']],
['Not to be worshiped','Israel is warned not to bow to the sun, moon and stars. Josiah removes the priests who burned incense to the constellations (the same word as Mazzaroth).',['DEU.4.19','2KI.23.5','JOB.31.26']],
['Not to be consulted','Divination is forbidden. Isaiah mocks Babylon\'s stargazers, and Jeremiah says not to be dismayed at the signs of heaven as the nations are.',['DEU.18.10','ISA.47.13','JER.10.2','DAN.2.27']]];
function sWord(el){
  el.innerHTML=SKYV.map(s=>`<h3 class="sec" style="font-size:20px">${esc(s[0])}</h3><p class="sub" style="margin-bottom:6px;color:var(--ink);font-size:14.5px">${esc(s[1])}</p>`+s[2].map((r,i)=>`<button class="ref" data-act="goref" data-ref="${r}"><b>${esc(dotStr(r))}</b><span data-vr="${r}">…</span></button>`).join('')).join('')+
  `<h3 class="sec" style="font-size:20px">How this differs from astrology</h3><div class="prose" style="font-size:15.5px"><p>Western and Vedic astrology both claim that the positions of the sun, moon and planets at birth shape character and fate. The Bible uses the same sky for two other things: to keep time, and to point to its maker. It never tells anyone to learn about themselves from a birth chart, and it forbids trying to read the future there.</p><p>So this section does not rival astrology by making better predictions. It shows what the other systems leave out: the actual stars as they were on the night in question, and the calendar, feasts and scriptures that the Bible itself ties to them.</p></div>`;
  $$('[data-vr]',el).forEach(sp=>{const q=dotRef(sp.dataset.vr); verseText('KJV',q.b,q.c,q.v).then(t=>sp.textContent=t)});
}
