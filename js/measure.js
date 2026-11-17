'use strict';
/* Measure: the Bible's numbers at true size, next to you, on your street, and in your own money.
   Sizes come from the verses. A cubit is taken as 18 in (common) or 20.6 in (royal); a shekel as 11.4 g; a talent as 34.2 kg; a stadion as 185 m. */
const MS={sec:Store.get('msec','you'),cub:Store.get('mcub','c'),met:Store.get('mmet',false),h:Store.get('myh',1.75),wage:Store.get('mwage',20),hrs:Store.get('mhrs',8),gold:Store.get('mgold',3900),silver:Store.get('msilver',50),
  loc:Store.get('mloc',null),obj:'ark',crowd:'gideon',ex:{n:2400000,w:10},thing:'ark',ring:'emm',map:null,mk:[]};
const MCU={c:.4572,r:.5232}, SHEKEL=11.4, TALENT=34200, OZ=31.1035, STADION=185, MILE=1609.344;
const mu=()=>MCU[MS.cub];
const JERU=[35.2347,31.7767];
/* ---------- formatting ---------- */
function mfL(m){ if(MS.met) return m<1?Math.round(m*100)+' cm':m<1000?(+m.toFixed(m<10?2:0)).toLocaleString()+' m':(+(m/1000).toFixed(m<1e4?1:0)).toLocaleString()+' km';
  const ft=m/.3048; if(ft<10){ let f=Math.floor(ft), i=Math.round((ft-f)*12); if(i===12){f++;i=0} return f?`${f}′${i}″`:`${Math.round(ft*12)} in` } if(ft<2640) return Math.round(ft).toLocaleString()+' ft'; const mi=m/MILE; return (+mi.toFixed(mi<10?1:0)).toLocaleString()+' miles' }
const mfW=kg=>MS.met?(kg<1?Math.round(kg*1000)+' g':(+kg.toFixed(kg<10?1:0)).toLocaleString()+' kg'):(kg*2.20462<1?Math.round(kg*35.274)+' oz':(+(kg*2.20462).toFixed(kg<5?1:0)).toLocaleString()+' lb');
const mfT=kg=>MS.met?(+(kg/1000).toFixed(kg<1e5?1:0)).toLocaleString()+' tonnes':(+(kg/907.185).toFixed(kg<1e5?1:0)).toLocaleString()+' tons';
const mfN=n=>Math.round(n).toLocaleString();
const mf$=v=>v>=1e12?'$'+(v/1e12).toFixed(1)+' trillion':v>=1e9?'$'+(v/1e9).toFixed(1)+' billion':v>=1e6?'$'+(v/1e6).toFixed(1)+' million':v>=100?'$'+Math.round(v).toLocaleString():'$'+v.toFixed(2);
const mB=k=>`<span class="lk-b" style="background:${LK[k][1]}">${LK[k][0]}</span>`;
const mV=r=>r?`<button class="btn sm" data-act="goref" data-ref="${r}">${esc(dotStr(r))}</button>`:'';

/* ---------- page ---------- */
const MSECS=[['you','You vs. them'],['street','On your street'],['crowd','Crowds'],['thing','Objects'],['money','Money'],['dist','Distances']];
VIEW.measure=()=>{ if(!$('#measure').firstChild) msRender() };
function msRender(){
  $('#measure').innerHTML=`<h2 class="sec">Measure</h2><p class="sub">The Bible's numbers at true size: next to you, dropped on your street, and in your own money.</p>
  ${seg(MSECS,MS.sec,'msec')}<div class="ms-tog"><span>Cubit</span>${seg([['c','18″ common'],['r','20.6″ royal']],MS.cub,'mcub')}<span>Units</span>${seg([['us','feet'],['m','metres']],MS.met?'m':'us','mmet')}</div><div id="msb"></div>`;
  msSec() }
ACT.msec=el=>{MS.sec=el.dataset.k; Store.set('msec',MS.sec); msRender(); $('#v-measure').scrollTop=0};
ACT.mcub=el=>{MS.cub=el.dataset.k; Store.set('mcub',MS.cub); msRender()};
ACT.mmet=el=>{MS.met=el.dataset.k==='m'; Store.set('mmet',MS.met); msRender()};
function msSec(){ const b=$('#msb'); ({you:msYou,street:msStreet,crowd:msCrowd,thing:msThing,money:msMoney,dist:msDist})[MS.sec](b) }

/* ---------- 1. you vs. them ---------- */
function msYou(b){ const u=mu(), H=MS.h;
  const F=[{n:'You',h:H,c:'#3d5bd9',k:null,d:'your height'},{n:'Average man',s:'Avg. man',h:1.65,c:'#9aa3b5',k:'h',d:'Israel, about 1000 BC (estimate from skeletons)'},{n:'Saul',h:1.65+.29,c:'#0c8f7f',k:'s',d:'"higher than any of the people from his shoulders and upward" · estimate',r:'1SA.9.2'},
    {n:'The Egyptian',s:'Egyptian',h:5*u,c:'#c27c0e',k:'s',d:'"a man of great stature, five cubits high", killed by Benaiah',r:'1CH.11.23'},{n:'Goliath · A',s:'Goliath A',h:4.5*u,c:'#e8590c',k:'s',d:'"four cubits and a span" in the Dead Sea Scrolls, the Greek Septuagint and Josephus',r:'1SA.17.4'},{n:'Goliath · B',s:'Goliath B',h:6.5*u,c:'#e03131',k:'s',d:'"six cubits and a span" in the standard Hebrew text',r:'1SA.17.4'}];
  const mx=Math.max(...F.map(f=>f.h))*1.08, PX=300/mx, fw=F.map(f=>Math.max(54,f.h*PX*.4+14)), fx=fw.map((w,i)=>46+fw.slice(0,i).reduce((a,b)=>a+b,0)+w/2), W=46+fw.reduce((a,b)=>a+b,0)+6, Hs=330, g0=310, step=MS.met?.5:.3048;
  let svg=`<svg viewBox="0 0 ${W} ${Hs+40}" class="ms-svg">`;
  for(let k=0;k*step<=mx;k++){ const y=k*step, py=g0-y*PX, major=MS.met?k%2===0:true, lab=k===0?'':MS.met?(major?(k/2)+' m':''):k+' ft'; svg+=`<line x1="40" x2="${W}" y1="${py}" y2="${py}" class="${major?'g1':'g2'}"/>${lab?`<text x="34" y="${py+4}" class="gl">${lab}</text>`:''}` }
  F.forEach((f,i)=>{ const x=fx[i], h=f.h*PX; svg+=msPerson(x,g0,h,f.c)+`<text x="${x}" y="${g0-h-8}" class="hl">${mfL(f.h)}</text><text x="${x}" y="${g0+18}" class="nl">${esc(f.s||f.n)}</text>` });
  svg+=`<line x1="40" x2="${W}" y1="${g0}" y2="${g0}" class="gd"/></svg>`;
  const sh=k=>k*SHEKEL/1000;
  b.innerHTML=`<div class="row" style="margin:6px 0 10px"><label class="ms-in">Your height <input type="number" id="msh-ft" value="${Math.floor(H/.3048)}" min="2" max="8" data-chg="msh"> ft <input type="number" id="msh-in" value="${Math.round((H/.3048-Math.floor(H/.3048))*12)}" min="0" max="11" data-chg="msh"> in</label></div>
  <div class="ms-scroll">${svg}</div>
  ${F.slice(1).map(f=>`<div class="ms-row"><i style="background:${f.c}"></i><div><b>${esc(f.n)}: ${mfL(f.h)}</b> ${f.k?mB(f.k):''}<small>${esc(f.d)}</small></div>${mV(f.r)}</div>`).join('')}
  <p class="note">Goliath's height differs between ancient copies of 1 Samuel. Most scholars think the shorter figure is the older reading. The royal cubit was a building measure, so the common cubit is the likelier one for a man's height.</p>
  <h3 class="sec" style="font-size:20px">What they carried</h3>
  ${[['Goliath\'s coat of mail','5,000 shekels of bronze',sh(5000),'1SA.17.5','about the weight of two and a half full suitcases at the 50 lb airline limit'],['Goliath\'s spearhead','600 shekels of iron',sh(600),'1SA.17.7','heavier than a 15 lb bowling ball, on the end of a shaft "like a weaver\'s beam"'],['Absalom\'s hair, cut each year','200 shekels "after the king\'s weight"',sh(200),'2SA.14.26','about two bags of sugar'],['Og\'s iron bed','9 by 4 cubits',null,'DEU.3.11',`${mfL(9*u)} by ${mfL(4*u)}. See it next to a king-size bed under Objects.`]].map(x=>`<div class="ms-row"><div><b>${x[0]}: ${x[2]?mfW(x[2]):mfL(9*u)+' long'}</b><small>${x[1]} · ${x[4]}</small></div>${mV(x[3])}</div>`).join('')}
  <p class="note">A shekel is taken as 11.4 g. Shekel weights varied by period and place.</p>` }
ACT.msh=()=>{ const ft=+$('#msh-ft').value||0, inch=+$('#msh-in').value||0; MS.h=Math.max(.6,Math.min(2.5,(ft*12+inch)*.0254)); Store.set('myh',MS.h); msSec() };
function msPerson(x,g,h,c){ const s=h/100, y=v=>g-v*s, X=v=>x+v*s;
  return `<g fill="${c}"><circle cx="${x}" cy="${y(93)}" r="${6.6*s}"/><rect x="${X(-12)}" y="${y(85)}" width="${24*s}" height="${36*s}" rx="${6*s}"/><rect x="${X(-17)}" y="${y(84)}" width="${5*s}" height="${33*s}" rx="${2.5*s}"/><rect x="${X(12)}" y="${y(84)}" width="${5*s}" height="${33*s}" rx="${2.5*s}"/><rect x="${X(-11)}" y="${y(52)}" width="${9.5*s}" height="${52*s}" rx="${3*s}"/><rect x="${X(1.5)}" y="${y(52)}" width="${9.5*s}" height="${52*s}" rx="${3*s}"/></g>` }

/* ---------- 2. on your street (a 3D satellite map) ---------- */
const MOBJ={
ark:{n:'Noah\'s ark',k:'s',r:'GEN.6.15',pitch:58,f:u=>[['r',0,0,300*u,50*u,0,30*u,'#8b5a2b']],cmp:true,info:u=>[`${mfL(300*u)} long, ${mfL(50*u)} wide, ${mfL(30*u)} high (300 × 50 × 30 cubits).`,`Floor space on three decks: about ${mfN(300*u*50*u*3*10.764)} sq ft${MS.met?` (${mfN(300*u*50*u*3)} m²)`:''}.`,'The red outline beside it is the Titanic (882 ft), for comparison.']},
statue:{n:'Nebuchadnezzar\'s golden statue',k:'s',r:'DAN.3.1',pitch:70,f:u=>[['r',0,0,6*u,3*u,0,60*u,'#e0a800']],info:u=>[`${mfL(60*u)} tall and ${mfL(6*u)} wide (60 × 6 cubits): about a ${Math.round(60*u/3)}-storey building.`,'The Statue of Liberty, from the ground to the torch, is 305 ft (93 m).','The proportions are ten to one, very thin for a human figure; many think it stood on a tall base.']},
gallows:{n:'Haman\'s gallows',k:'s',r:'EST.5.14',pitch:70,f:u=>[['r',0,0,1*u,1*u,0,50*u,'#6d4c2f'],['r',2*u,0,5*u,1*u,48*u,50*u,'#6d4c2f']],info:u=>[`${mfL(50*u)} high (50 cubits): about a ${Math.round(50*u/3)}-storey building.`,'Built to be seen across the city. Haman was hanged on it himself (Esther 7:10).']},
temple:{n:'Solomon\'s temple',k:'s',r:'1KI.6.2',pitch:55,f:u=>[['r',0,0,60*u,20*u,0,30*u,'#d8c7a0'],['r',35*u,0,10*u,20*u,0,20*u,'#e9dcbc'],['r',42*u,6*u,4*u,4*u,0,18*u,'#b08d57'],['r',42*u,-6*u,4*u,4*u,0,18*u,'#b08d57']],info:u=>[`The house: ${mfL(60*u)} long, ${mfL(20*u)} wide, ${mfL(30*u)} high (60 × 20 × 30 cubits) — smaller than many churches.`,`The two bronze pillars, Jachin and Boaz, stood ${mfL(18*u)} high (1 Kings 7:15).`,'2 Chronicles 3:4 gives the porch a height of 120 cubits; most scholars think that is a copying error, and some Greek copies read 20. It is drawn at 20 here.']},
tab:{n:'The tabernacle and its court',k:'s',r:'EXO.27.18',pitch:55,f:u=>{const c='#f1ece0',t=.25; return [['r',0,25*u,100*u,t,0,5*u,c],['r',0,-25*u,100*u,t,0,5*u,c],['r',-50*u,0,t,50*u,0,5*u,c],['r',50*u,17.5*u,t,15*u,0,5*u,c],['r',50*u,-17.5*u,t,15*u,0,5*u,c],['r',50*u,0,t,20*u,0,5*u,'#3d5bd9'],['r',-25*u,0,30*u,10*u,0,10*u,'#6b3f2a'],['r',25*u,0,5*u,5*u,0,3*u,'#b87333']]},info:u=>[`The court: ${mfL(100*u)} by ${mfL(50*u)}, with a curtain wall ${mfL(5*u)} high (100 × 50 × 5 cubits).`,`The tent itself: about ${mfL(30*u)} by ${mfL(10*u)}. The bronze altar stands in front of it; the blue strip is the 20-cubit gate (Exodus 27:16).`]},
mount:{n:'Herod\'s Temple Mount',k:'h',r:'JHN.2.20',pitch:50,f:()=>[['p',[[-150,-240],[130,-240],[150,230],[-165,245]],0,12,'#cdbd96']],info:()=>['About 300 by 480 m (roughly 980 by 1,570 ft): around 36 acres, the size of about 27 football fields.','Herod doubled the older platform from about 19 BC. Its retaining walls, including the Western Wall, rose up to about 30 m (100 ft) above bedrock.','Size from the surviving walls, not from the Bible.']},
zig:{n:'Babylon\'s great ziggurat',k:'h',r:'GEN.11.4',pitch:62,f:()=>{const s=[91,78,60,51,42,33,24],o=[]; let h=0; s.forEach((w,i)=>{const t=i?12:33; o.push(['r',0,0,w,w,h,h+t,i%2?'#c9a46b':'#b98d50']); h+=t}); return o},info:()=>['Etemenanki, "the temple of the foundation of heaven and earth": a base about 91 m (300 ft) square and, by ancient tablets, about as tall.','The Bible gives no size for the Tower of Babel. Many scholars think Babylon\'s ziggurat inspired the story; that link is a theory.']},
newjer:{n:'The New Jerusalem',k:'s',r:'REV.21.16',pitch:0,f:()=>{const s=12000*STADION; return [['r',0,0,s,s,0,0,'#f0b429','flat']]},info:()=>[`12,000 stadia on each side: about ${mfL(12000*STADION)}.`,`"The length and the breadth and the height of it are equal." That height is about ${Math.round(12000*STADION/408000)} times as high as the International Space Station's orbit.`,'Its wall is 144 cubits (Revelation 21:17), whether high or thick is not said. Many read the measurements as symbolic: 12 × 1,000.']},
quail:{n:'The quail around the camp',k:'s',r:'NUM.11.31',pitch:45,f:u=>[['c',0,0,32000,0,2*u,'#c9a66b']],info:u=>[`Quail lay about ${mfL(2*u)} deep (two cubits), "a day's journey on this side, and a day's journey on the other side, round about the camp."`,`Drawn here as a circle about ${mfL(32000)} in radius, taking a day's journey as roughly 20 miles.`,'Some read "two cubits high" as how high the birds flew above the ground, which made them easy to catch.']},
exodus:{n:'The Exodus marching column',k:'s',r:'NUM.1.46',pitch:40,f:()=>{const L=MS.ex.n/MS.ex.w; return [['l',L]]},info:()=>{const L=MS.ex.n/MS.ex.w; return [`${mfN(MS.ex.n)} people marching ${MS.ex.w} abreast, one row per metre, would make a column ${mfL(L)} long.`,`At 2 mph the whole column would take about ${Math.round(L/MILE/2)} hours to pass one spot.`,'Change the numbers under Crowds.']}}
};
function msGeo(c,dx,dy){ return [c[0]+dx/(111320*Math.cos(c[1]*Math.PI/180)),c[1]+dy/110540] }
function msFeatures(id){ const o=MOBJ[id], u=mu(), c=MS.loc||JERU, F=[];
  const poly=(pts,props)=>F.push({type:'Feature',properties:props,geometry:{type:'Polygon',coordinates:[pts.concat([pts[0]]).map(p=>msGeo(c,p[0],p[1]))]}});
  o.f(u).forEach(s=>{ if(s[0]==='r'){const [_,x,y,w,d,b,h,col,flat]=s; poly([[x-w/2,y-d/2],[x+w/2,y-d/2],[x+w/2,y+d/2],[x-w/2,y+d/2]],{b,h,col,flat:flat?1:0})}
    else if(s[0]==='p'){const [_,pts,b,h,col]=s; poly(pts,{b,h,col,flat:0})}
    else if(s[0]==='c'){const [_,x,y,r,b,h,col]=s, pts=[]; for(let i=0;i<96;i++){const a=i/96*Math.PI*2; pts.push([x+r*Math.cos(a),y+r*Math.sin(a)])} poly(pts,{b,h,col,flat:0})}
    else if(s[0]==='l'){const L=s[1], pts=[]; for(let i=0;i<=40;i++) pts.push(msGeo(c,L*i/40,0)); F.push({type:'Feature',properties:{col:'#e03131'},geometry:{type:'LineString',coordinates:pts}})} });
  /* you, for scale */
  if(id!=='newjer'&&id!=='exodus'&&id!=='quail'){ const ex=Math.max(...o.f(u).map(s=>s[0]==='r'?Math.abs(s[1])+s[3]/2:s[0]==='p'?170:0)); poly([[ex+4,-.25],[ex+4.5,-.25],[ex+4.5,.25],[ex+4,.25]],{b:0,h:MS.h,col:'#3d5bd9',flat:0}) }
  if(o.cmp){ const y=-(50*u/2+30+14); poly([[-134.5,y-14],[134.5,y-14],[134.5,y+14],[-134.5,y+14]],{b:0,h:0,col:'#e03131',flat:1}); F.push({type:'Feature',properties:{col:'#e03131'},geometry:{type:'LineString',coordinates:[[-134.5,y-14],[134.5,y-14],[134.5,y+14],[-134.5,y+14],[-134.5,y-14]].map(p=>msGeo(c,p[0],p[1]))}}) }
  return {type:'FeatureCollection',features:F} }
async function msMapInit(host){
  if(MS.map){ host.appendChild(MS.box); MS.map.resize(); return true }
  const box=document.createElement('div'); MS.box=box; box.id='ms-mapbox'; box.innerHTML='<div id="ms-map"></div>'; host.appendChild(box);
  try{ MS.map=new maplibregl.Map({container:'ms-map',center:MS.loc||JERU,zoom:16,pitch:55,maxPitch:80,attributionControl:{compact:true},
    style:{version:8,sources:{sat:{type:'raster',tiles:[ESRI],tileSize:256,maxzoom:19,attribution:'Imagery © Esri, Maxar, Earthstar Geographics'},lab:{type:'raster',tiles:[ESRIL],tileSize:256,maxzoom:19},ms:{type:'geojson',data:{type:'FeatureCollection',features:[]}}},
    layers:[{id:'sat',type:'raster',source:'sat'},{id:'lab',type:'raster',source:'lab'},
      {id:'ms-flat',type:'fill',source:'ms',filter:['all',['==','$type','Polygon'],['==','flat',1]],paint:{'fill-color':['get','col'],'fill-opacity':.35,'fill-outline-color':'#fff'}},
      {id:'ms-ext',type:'fill-extrusion',source:'ms',filter:['all',['==','$type','Polygon'],['==','flat',0]],paint:{'fill-extrusion-color':['get','col'],'fill-extrusion-height':['get','h'],'fill-extrusion-base':['get','b'],'fill-extrusion-opacity':.92}},
      {id:'ms-line',type:'line',source:'ms',filter:['==','$type','LineString'],paint:{'line-color':['get','col'],'line-width':4}}]}}) }
  catch(e){ box.innerHTML='<p class="note">This browser could not start the 3D map. It needs WebGL.</p>'; MS.map=null; box.remove(); return false }
  MS.map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
  await new Promise(r=>MS.map.on('load',r)); return true }
function msMarks(list){ MS.mk.forEach(m=>m.remove()); MS.mk=list.map(([ll,t,cls,off])=>{const el=document.createElement('div'); el.className='ms-pin '+(cls||''); el.textContent=t; return new maplibregl.Marker({element:el,anchor:'bottom',offset:off||[0,0]}).setLngLat(ll).addTo(MS.map)}) }
function msFit(fc,pitch,pad){ const b=new maplibregl.LngLatBounds(); let mh=0; fc.features.forEach(f=>{const g=f.geometry, cs=g.type==='Polygon'?g.coordinates[0]:g.coordinates; cs.forEach(p=>b.extend(p)); mh=Math.max(mh,f.properties.h||0)}); if(b.isEmpty()) return;
  if(mh>0&&mh<5000){ const c=MS.loc||JERU, r=mh*.75; b.extend(msGeo(c,-r,-r)); b.extend(msGeo(c,r,r)) }
  const cam=MS.map.cameraForBounds(b,{padding:pad||50}); if(cam) MS.map.flyTo({center:cam.center,zoom:Math.min(18.5,cam.zoom-(pitch>30?.25:0)),pitch,bearing:pitch?-25:0,duration:1600}) }
async function msStreet(b){
  b.innerHTML=`<div class="ms-strip">${Object.keys(MOBJ).filter(k=>k!=='exodus').map(k=>`<button class="btn sm${MS.obj===k?' pri':''}" data-act="mobj" data-k="${k}">${esc(MOBJ[k].n.replace(/^The /,''))}</button>`).join('')}</div>
  ${msLocBar()}<div id="ms-maphost"></div><div id="ms-info"></div>`;
  if(await msMapInit($('#ms-maphost'))) msDrop(MS.obj) }
function msLocBar(){ return `<div class="ms-loc"><button class="btn sm pri" data-act="mloc">◎ Use my location</button><input class="inp" id="ms-q" placeholder="or search a place…" data-enter="mfind"><button class="btn sm" data-act="mfind">Go</button></div><div id="ms-qr"></div><p class="ms-where">${MS.loc?'Placed at your chosen spot.':'Shown in Jerusalem until you pick a place.'} Your location stays on this phone.</p>` }
function msDrop(id){ if(!MS.map) return; MS.obj=id; const o=MOBJ[id], fc=msFeatures(id); MS.map.getSource('ms').setData(fc); const c=MS.loc||JERU;
  const u=mu(); msMarks([[c,o.n,'',[0,-34]]].concat(o.cmp?[[msGeo(c,-134,-(50*u/2+44+14)),'Titanic','red']]:[]));
  msFit(fc,o.pitch,id==='newjer'?20:60);
  $('#ms-info').innerHTML=`<div class="ms-card"><h3>${esc(o.n)} ${mB(o.k)}</h3>${o.info(mu()).map(t=>`<p>${esc(t)}</p>`).join('')}${id!=='newjer'&&id!=='exodus'&&id!=='quail'?'<p class="ms-you">The thin blue post beside it is you, at your height.</p>':''}<div class="row">${mV(o.r)}</div></div>` }
ACT.mobj=el=>{ $$('[data-act=mobj]').forEach(x=>x.classList.toggle('pri',x===el)); msDrop(el.dataset.k) };
ACT.mloc=()=>{ if(!navigator.geolocation){toast('Location is not available here');return} toast('Finding you…');
  navigator.geolocation.getCurrentPosition(p=>{ MS.loc=[p.coords.longitude,p.coords.latitude]; Store.set('mloc',MS.loc); msSec() },()=>toast('Location was not allowed. Try searching for a place.'),{enableHighAccuracy:true,timeout:12000}) };
ACT.mfind=async()=>{ const q=$('#ms-q').value.trim(); if(!q) return; const out=$('#ms-qr'); out.innerHTML='<p class="note">Searching…</p>';
  try{ const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=5&q='+encodeURIComponent(q)).then(r=>r.json()); out.innerHTML=r.length?r.map(x=>`<button class="ref" data-act="mpick" data-ll="${x.lon},${x.lat}"><b>${esc(x.display_name.split(',').slice(0,2).join(','))}</b><span>${esc(x.display_name.split(',').slice(2,5).join(','))}</span></button>`).join(''):'<p class="note">Nothing found.</p>' }catch(e){ out.innerHTML='<p class="note">Search is not reachable right now.</p>' } };
ACT.mpick=el=>{ MS.loc=el.dataset.ll.split(',').map(Number); Store.set('mloc',MS.loc); msSec() };

/* ---------- 3. crowds ---------- */
const MCROWD={
gideon:{n:'Gideon\'s 300',k:'s',r:'JDG.8.10',g:()=>[[300,'#f0b429','Gideon\'s men'],[135000,'#9aa3b5','The Midianite army (120,000 fell, 15,000 remained)']],t:'Judges 7–8: Gideon sent 31,700 men home and kept 300.'},
five:{n:'The 5,000 fed',k:'s',r:'MAT.14.21',g:()=>[[5000,'#3d5bd9','Men, "about five thousand"'],[MS.wc||10000,'#9db4e0','Women and children (estimate: not counted)']],t:'"Beside women and children" (Matthew 14:21). Drag the slider: no one knows how many there were.',slider:true},
four:{n:'The 4,000 fed',k:'s',r:'MAT.15.38',g:()=>[[4000,'#3d5bd9','Men'],[MS.wc||8000,'#9db4e0','Women and children (estimate)']],t:'A second feeding, with seven loaves (Matthew 15:32–38).',slider:true},
pent:{n:'Pentecost',k:'s',r:'ACT.2.41',g:()=>[[120,'#f0b429','The believers in the upper room (Acts 1:15)'],[3000,'#3d5bd9','Baptized that day']],t:'"About three thousand souls."'},
david:{n:'David\'s census',k:'s',r:'2SA.24.9',g:()=>[[800000,'#3d5bd9','Fighting men of Israel'],[500000,'#e8590c','Fighting men of Judah']],t:'2 Samuel 24:9 gives 1,300,000. 1 Chronicles 21:5 gives 1,570,000 (1,100,000 and 470,000).'},
exodus:{n:'The Exodus',k:'s',r:'NUM.1.46',g:()=>MS.ex.n>100000?[[603550,'#3d5bd9','Men of fighting age (Numbers 1:46)'],[MS.ex.n-603550,'#9db4e0','Women, children, the elderly and Levites (estimate)']]:[[MS.ex.n,'#3d5bd9','Everyone, on the smaller reading']],t:'',ex:true},
pass:{n:'Passover in Jerusalem',k:'h',r:'',g:()=>[[300000,'#3d5bd9','A common modern estimate'],[2700000-300000,'#f08c8c','Josephus\'s claim, the rest of it']],t:'Josephus (Jewish War 6.9.3) says 2.7 million people were in Jerusalem for one Passover. Modern estimates are usually 200,000–500,000.'}};
function msCrowd(b){ const c=MCROWD[MS.crowd];
  b.innerHTML=`<div class="ms-strip">${Object.entries(MCROWD).map(([k,v])=>`<button class="btn sm${k===MS.crowd?' pri':''}" data-act="mcrowd" data-k="${k}">${esc(v.n)}</button>`).join('')}</div>
  <div class="ms-card"><h3>${esc(c.n)} ${mB(c.k)}</h3>${c.t?`<p>${esc(c.t)}</p>`:''}
  ${c.slider?`<label class="ms-in" style="display:block;margin-top:8px">Women and children: <b id="mwcv">${mfN(MS.wc||(MS.crowd==='five'?10000:8000))}</b><input type="range" min="0" max="${MS.crowd==='five'?20000:16000}" step="500" value="${MS.wc||(MS.crowd==='five'?10000:8000)}" data-inp="mwc" style="width:100%"></label>`:''}
  ${c.ex?`<div class="seg" style="margin-top:8px">${[[2400000,'As written: about 2.4 million'],[1200000,'Lower estimate: 1.2 million'],[22000,'"Eleph" read as "clan": about 22,000']].map(x=>`<button data-act="mexn" data-n="${x[0]}" class="${MS.ex.n===x[0]?'on':''}">${x[1]}</button>`).join('')}</div>
    <label class="ms-in" style="display:block">Marching <b>${MS.ex.w}</b> abreast <input type="range" min="2" max="60" value="${MS.ex.w}" data-chg="mexw" style="width:100%"></label>
    <p>Numbers 1:46 counts 603,550 men aged 20 and up; with families that is often put at 2–2.5 million. Some scholars read the Hebrew word <i>eleph</i> ("thousand") as "clan" or "unit," which shrinks the total to about 20,000–30,000. That is a minority reading.</p>
    <p><b>The column: ${mfL(MS.ex.n/MS.ex.w)} long.</b> At 2 mph it would take about ${Math.round(MS.ex.n/MS.ex.w/MILE/2)} hours to pass one spot.</p><button class="btn sm pri" data-act="mexmap">Lay it out from my location</button>`:''}
  <div class="row" style="margin-top:8px">${mV(c.r)}</div></div>
  <canvas id="ms-dots"></canvas><div id="ms-leg"></div>`;
  msDots(c.g()) }
ACT.mcrowd=el=>{MS.crowd=el.dataset.k; MS.wc=null; msSec()};
ACT.mwc=el=>{MS.wc=+el.value; $('#mwcv').textContent=mfN(MS.wc); msDots(MCROWD[MS.crowd].g())};
ACT.mexn=el=>{MS.ex.n=+el.dataset.n; msSec()};
ACT.mexw=el=>{MS.ex.w=+el.value; msSec()};
ACT.mexmap=()=>{ MS.sec='street'; MS.obj='exodus'; msRender(); setTimeout(()=>msDrop('exodus'),900) };
function msDots(groups){ const cv=$('#ms-dots'); if(!cv) return; const tot=groups.reduce((a,g)=>a+g[0],0), dpr=Math.min(2,devicePixelRatio||1), W=Math.floor(cv.parentElement.clientWidth*dpr)||700, unit=[1,2,5,10,25,50,100,250,500,1000,2500,5000].find(u=>tot/u<=W*W*1.1/4)||5000;
  const n=groups.map(g=>Math.round(g[0]/unit)), N=n.reduce((a,b)=>a+b,0);
  let s=Math.max(1,Math.floor(Math.sqrt(W*W*1.1/N))); s=Math.min(s,Math.floor(W/30)); const cols=Math.floor(W/s); let rows=0; n.forEach(k=>rows+=Math.ceil(k/cols)+1); rows+=Math.ceil(8*dpr/s);
  cv.width=W; cv.height=rows*s; let row=Math.ceil(5*dpr/s); cv.style.width=W/dpr+'px'; cv.style.height=rows*s/dpr+'px';
  const g=cv.getContext('2d'), gap=s>2?Math.max(1,Math.round(s*.18)):0;
  n.forEach((k,i)=>{ g.fillStyle=groups[i][1]; for(let j=0;j<k;j++){ g.fillRect((j%cols)*s,(row+Math.floor(j/cols))*s,s-gap,s-gap) } const rr=Math.ceil(k/cols);
    if(rr<4&&k<cols*3){ const w=(rr>1?cols:k)*s, y0=row*s; g.strokeStyle='#e03131'; g.lineWidth=2*dpr; g.strokeRect(1,y0-3*dpr,w+3*dpr,rr*s+6*dpr); g.font=`700 ${12*dpr}px system-ui,sans-serif`; g.fillStyle='#e03131'; g.textBaseline='middle'; if(w+90*dpr<W) g.fillText('← '+mfN(groups[i][0]),w+10*dpr,y0+rr*s/2) }
    row+=rr+1 });
  $('#ms-leg').innerHTML=`<p class="note">Each square is ${unit===1?'one person':unit+' people'}.</p>`+groups.map(x=>`<div class="ms-row"><i style="background:${x[1]}"></i><div><b>${mfN(x[0])}</b><small>${esc(x[2])}</small></div></div>`).join('')+
    `<p class="note">For scale: a large basketball arena holds about 20,000; a pro football stadium about 70,000.</p>` }

/* ---------- 4. objects in 3D ---------- */
const MTHING={
ark:{n:'Ark of the Covenant',k:'s',r:'EXO.25.10',info:u=>[`${mfL(2.5*u)} long, ${mfL(1.5*u)} wide and ${mfL(1.5*u)} high (2½ × 1½ × 1½ cubits): the size of a large chest, smaller than most coffee tables are long.`,'Wood covered in gold, carried on two gold-covered poles. The poles\' length is not given.']},
table:{n:'Table of showbread',k:'s',r:'EXO.25.23',info:u=>[`${mfL(2*u)} long, ${mfL(1*u)} wide and ${mfL(1.5*u)} high (2 × 1 × 1½ cubits): about the size of a small desk.`,'Twelve loaves sat on it, one for each tribe.']},
altar:{n:'Bronze altar',k:'s',r:'EXO.27.1',info:u=>[`${mfL(5*u)} square and ${mfL(3*u)} high (5 × 5 × 3 cubits), with a horn at each corner.`]},
sea:{n:'Solomon\'s bronze Sea',k:'s',r:'1KI.7.23',info:u=>[`${mfL(10*u)} across, ${mfL(5*u)} deep, and "a line of thirty cubits did compass it round about".`,'10 across and 30 around makes pi equal to 3. Common answers: the numbers are rounded, or the 30 was measured below the flared brim, inside walls a handbreadth thick (1 Kings 7:26).',`It held 2,000 baths (1 Kings 7:26), about ${MS.met?'44,000 litres':'11,600 gallons'}. 2 Chronicles 4:5 says 3,000. It stood on twelve bronze oxen.`]},
ogbed:{n:'Og\'s bed',k:'s',r:'DEU.3.11',info:u=>[`${mfL(9*u)} long and ${mfL(4*u)} wide (9 × 4 cubits "after the cubit of a man"), made of iron.`,'Next to it is a US king-size bed (80 × 76 in). The bed\'s height is not given.','Some scholars think the "bed" was a stone sarcophagus or a ritual couch.']},
talent:{n:'A talent of gold',k:'s',r:'EXO.25.39',info:()=>[`About 34 kg (${mfW(34.2)}) of gold, yet only a cube ${mfL(Math.cbrt(34.2/19.32)/10)} on each side, smaller than the 2-litre bottle beside it.`,`At $${MS.gold.toLocaleString()} an ounce that is about ${mf$(34.2*1000/OZ*MS.gold)}. The golden lampstand was made from one talent.`]},
omer:{n:'An omer of manna',k:'s',r:'EXO.16.16',info:()=>[`One omer per person per day: about 2.2 litres (${MS.met?'2.2 L':'2.3 quarts'}), shown next to a gallon jug.`,`For 2.4 million people that is about ${MS.met?'5.3 million litres':'1.4 million gallons'} a day: two Olympic swimming pools, every morning.`]}};
const M3={};
function msThing(b){ const t=MTHING[MS.thing];
  b.innerHTML=`<div class="ms-strip">${Object.entries(MTHING).map(([k,v])=>`<button class="btn sm${k===MS.thing?' pri':''}" data-act="mthing" data-k="${k}">${esc(v.n)}</button>`).join('')}</div>
  <div id="ms-3d"><div id="ms-lab"></div><p class="ms-hint">Drag to turn · pinch to zoom</p></div>
  <div class="ms-card"><h3>${esc(t.n)} ${mB(t.k)}</h3>${t.info(mu()).map(x=>`<p>${esc(x)}</p>`).join('')}<p class="ms-you">Drawn as simple shapes at true size, not as a reconstruction of how they looked.</p><div class="row">${mV(t.r)}</div></div>`;
  try{ ms3d() }catch(e){ console.error(e); $('#ms-3d').innerHTML='<p class="note">This browser could not start the 3D view.</p>' } }
ACT.mthing=el=>{MS.thing=el.dataset.k; msSec()};
function ms3d(){ const host=$('#ms-3d'), W=host.clientWidth, H=Math.round(Math.min(420,W*.8)); host.style.height=H+'px';
  if(!M3.rn){ const c=document.createElement('canvas'); c.id='ms-cv'; M3.rn=new THREE.WebGLRenderer({canvas:c,antialias:true}); M3.rn.setPixelRatio(Math.min(2,devicePixelRatio||1)); msOrbit(c) }
  const cv=M3.rn.domElement; host.prepend(cv);
  M3.rn.setSize(W,H,false); cv.style.width=W+'px'; cv.style.height=H+'px'; M3.W=W; M3.H=H;
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0xf4f7fb); sc.add(new THREE.HemisphereLight(0xffffff,0xd8cfbf,.85)); const dl=new THREE.DirectionalLight(0xffffff,.75); dl.position.set(3,6,4); sc.add(dl);
  const u=mu(), G=new THREE.Group(), L=[], mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.45,metalness:c===0xd4a72c?.6:.1}), gold=0xd4a72c, bronze=0xb0703a;
  const box=(w,h,d,x,y,z,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c)); m.position.set(x,y,z); G.add(m); return m}, cyl=(r1,r2,h,x,y,z,c,rx)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,32),mat(c)); m.position.set(x,y,z); if(rx) m.rotation.z=rx; G.add(m); return m};
  const person=(x,z)=>{const s=MS.h/1.75, g=new THREE.Group(), m=mat(0x3d5bd9), cap=(r,l,px,py)=>{const k=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,4,12),m); k.position.set(px,py,0); g.add(k)};
    cap(.07,.72,-.09,.43); cap(.07,.72,.09,.43); cap(.17,.42,0,1.13); cap(.05,.56,-.25,1.08); cap(.05,.56,.25,1.08); const hd=new THREE.Mesh(new THREE.SphereGeometry(.11,20,16),m); hd.position.y=1.62; g.add(hd); g.scale.setScalar(s); g.position.set(x,0,z); G.add(g); L.push(['You',x,MS.h+.12,z])};
  let span=3;
  switch(MS.thing){
    case 'ark':{const l=2.5*u,w=1.5*u,h=1.5*u; box(l,h,w,0,h/2,0,gold); box(l*1.04,.06,w*1.04,0,h+.03,0,gold); [-1,1].forEach(s=>{box(.18,.32,.3,s*l*.3,h+.22,0,gold); cyl(.03,.03,l+1.4,0,h*.35,s*(w/2+.05),0x9c7b2b,Math.PI/2)}); person(-l/2-.8,0); box(1.22,.05,.61,l/2+1.2,.43,0,0x8a6a4a); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>box(.05,.41,.05,l/2+1.2+a*.55,.2,c*.25,0x8a6a4a)); L.push(['Ark',0,h+.6,0],['Coffee table',l/2+1.2,.75,0]); span=l+3; break}
    case 'table':{const l=2*u,w=1*u,h=1.5*u; box(l,.05,w,0,h,0,gold); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>box(.06,h,.06,a*(l/2-.06),h/2,c*(w/2-.06),gold)); for(let i=0;i<6;i++){box(.22,.06,.15,-l/2+.2+i*(l-.4)/5,h+.06,-w/4,0xd9b98a); box(.22,.06,.15,-l/2+.2+i*(l-.4)/5,h+.06,w/4,0xd9b98a)} person(-l/2-.7,0); L.push(['Table',0,h+.4,0]); span=l+2.5; break}
    case 'altar':{const l=5*u,h=3*u; box(l,h,l,0,h/2,0,bronze); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>box(.25,.3,.25,a*(l/2-.13),h+.15,c*(l/2-.13),bronze)); person(-l/2-.8,0); L.push(['Altar',0,h+.6,0]); span=l+3; break}
    case 'sea':{const r=5*u,h=5*u,pts=[]; for(let i=0;i<=12;i++){const t=i/12; pts.push(new THREE.Vector2(r*(.55+.45*Math.sin(t*Math.PI/2)),t*h))} const bowl=new THREE.Mesh(new THREE.LatheGeometry(pts,48),new THREE.MeshStandardMaterial({color:bronze,roughness:.4,metalness:.3,side:THREE.DoubleSide})); bowl.position.y=1.6; G.add(bowl);
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2+Math.PI/12, x=Math.cos(a)*r*.48, z=Math.sin(a)*r*.48, o=box(.9,1.1,.45,x,.75,z,0x9c6a3a); o.rotation.y=-a} person(-r-1.2,0); box(4.6,.8,1.8,r+3.3,.55,0,0xd0453a); box(2.4,.62,1.6,r+3.2,1.25,0,0xb63a31); L.push(['Bronze Sea',0,h+2,0],['Car',r+3.3,1.9,0]); span=2*r+7; break}
    case 'ogbed':{const l=9*u,w=4*u; box(l,.55,w,0,.28,0,0x4a4f57); box(2.03,.6,1.93,0,.3,w/2+1.5,0xf4f4f4); box(.08,1.1,1.93,-1.03,.55,w/2+1.5,0x8a6a4a); person(-l/2-.8,0); L.push(['Og\'s bed',0,.95,0],['King-size bed',0,1.2,w/2+1.5]); span=l+3; break}
    case 'talent':{const s=Math.cbrt(34.2/19.32)/10; box(s,s,s,0,s/2,0,gold); cyl(.053,.053,.31,.2,.155,0,0x7fc4e8); L.push(['A talent of gold',0,s+.06,0],['2-litre bottle',.2,.37,0]); span=.55; break}
    case 'omer':{cyl(.068,.065,.16,0,.08,0,0xc9a46b); cyl(.078,.078,.29,.25,.145,0,0xeef3f8); L.push(['An omer',0,.22,0],['Gallon jug',.25,.35,0]); span=.6; break}
  }
  sc.add(G); const gs=span>2?Math.ceil(span*1.6):1, step=MS.met?(span>2?1:.1):(span>2?.3048:.0254*2), grid=new THREE.GridHelper(Math.round(gs/step)*step,Math.round(gs/step),0xc9bfa8,0xe3dccb); sc.add(grid);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(gs*3,gs*3),new THREE.MeshStandardMaterial({color:0xf3eee3})); fl.rotation.x=-Math.PI/2; fl.position.y=-.002; sc.add(fl);
  M3.sc=sc; M3.L=L; M3.cam=new THREE.PerspectiveCamera(40,W/H,.01,500); M3.o={th:.6,ph:1.12,d:span*1.25,t:[0,span>2?.9:.12,0]}; ms3dDraw() }
function ms3dDraw(){ const o=M3.o, c=M3.cam; c.aspect=M3.W/M3.H; c.updateProjectionMatrix(); c.position.set(o.t[0]+o.d*Math.sin(o.ph)*Math.sin(o.th),o.t[1]+o.d*Math.cos(o.ph),o.t[2]+o.d*Math.sin(o.ph)*Math.cos(o.th)); c.lookAt(o.t[0],o.t[1],o.t[2]); M3.rn.render(M3.sc,c);
  const v=new THREE.Vector3(); $('#ms-lab').innerHTML=M3.L.map(([t,x,y,z])=>{ v.set(x,y,z).project(c); if(v.z>1) return ''; return `<span style="left:${(v.x+1)/2*M3.W}px;top:${(1-v.y)/2*M3.H}px">${esc(t)}</span>` }).join('') }
function msOrbit(cv){ const pts=new Map(); let pd=null;
  cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,[e.clientX,e.clientY]); cv.setPointerCapture(e.pointerId); if(pts.size===2){const [a,b]=[...pts.values()]; pd=[Math.hypot(a[0]-b[0],a[1]-b[1]),M3.o.d]}});
  cv.addEventListener('pointermove',e=>{ if(!pts.has(e.pointerId)) return; const p=pts.get(e.pointerId), dx=e.clientX-p[0], dy=e.clientY-p[1]; pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===2&&pd){const [a,b]=[...pts.values()]; M3.o.d=Math.max(.15,pd[1]*pd[0]/Math.max(20,Math.hypot(a[0]-b[0],a[1]-b[1])))} else { M3.o.th-=dx*.008; M3.o.ph=Math.max(.15,Math.min(1.5,M3.o.ph-dy*.006)) } ms3dDraw() });
  const up=e=>{pts.delete(e.pointerId); if(pts.size<2) pd=null}; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault(); M3.o.d=Math.max(.15,M3.o.d*Math.exp(e.deltaY*.0015)); ms3dDraw()},{passive:false}) }

/* ---------- 5. money ---------- */
function msMoney(b){ const day=MS.wage*MS.hrs, ag=g=>g/OZ*MS.silver, au=g=>g/OZ*MS.gold;
  const R=[['A day\'s wage','1 denarius','MAT.20.2',1,null,'The vineyard workers were paid a denarius for the day.'],['The widow\'s two coins','2 lepta = 1/64 denarius','MRK.12.42',1/64,null,'"She of her want did cast in all that she had."'],['The lost coin','1 drachma','LUK.15.8',1,null,'A Greek drachma was worth about a denarius.'],['The temple tax','a half shekel (two drachmas)','MAT.17.24',2,null,''],['The Good Samaritan','2 denarii','LUK.10.35',2,null,'Enough for perhaps several weeks at an inn.'],['Joseph sold','20 shekels of silver','GEN.37.28',null,ag(20*SHEKEL),'Valued by the silver\'s weight today.'],['Judas\'s price','30 pieces of silver','MAT.26.15',120,ag(30*14.2),'Probably Tyrian shekels of about 14.2 g, each worth 4 denarii: four months\' wages.'],['Bread for the crowd','200 denarii "would not be enough"','JHN.6.7',200,null,''],['Mary\'s perfume','300 denarii','MRK.14.5',300,null,'About a year\'s wages, poured out at once.'],['Abraham\'s field and cave','400 shekels of silver','GEN.23.16',null,ag(400*SHEKEL),'Valued by the silver\'s weight today.'],['One talent','6,000 denarii','MAT.25.15',6000,null,'About 20 years of work. The servant who buried his one talent buried two decades of wages.'],['The servant\'s debt','10,000 talents','MAT.18.24',6e7,null,'He would not forgive a debt of 100 denarii. 10,000 was the largest number in Greek: Jesus is saying "an unpayable amount."'],['Solomon\'s gold, each year','666 talents','1KI.10.14',null,au(666*TALENT),`About ${mfT(666*TALENT/1000)} of gold.`],['David\'s gift for the temple','100,000 talents of gold and 1,000,000 of silver','1CH.22.14',null,au(1e5*TALENT)+ag(1e6*TALENT),`About ${mfT(1e5*TALENT/1000)} of gold: roughly the world's gold output for a year, and many read the figure as exaggerated for honour.`]];
  b.innerHTML=`<div class="ms-card"><div class="row"><label class="ms-in">Your pay $<input type="number" value="${MS.wage}" min="1" step="0.5" data-chg="mwage" style="width:70px"> an hour</label><label class="ms-in"><input type="number" value="${MS.hrs}" min="1" max="16" data-chg="mhrs" style="width:50px"> hours a day</label></div>
    <div class="row" style="margin-top:6px"><label class="ms-in">Gold $<input type="number" value="${MS.gold}" data-chg="mgold" style="width:76px">/oz</label><label class="ms-in">Silver $<input type="number" value="${MS.silver}" data-chg="msilver" style="width:60px">/oz</label></div>
    <p class="ms-you">Metal prices set to mid-November 2026; change them any time. A day's wage for you: <b>${mf$(day)}</b>.</p></div>
  ${R.map(r=>{const w=r[3]!=null?r[3]*day:null; return `<div class="ms-row"><div><b>${esc(r[0])}: ${w!=null?mf$(w):mf$(r[4])}</b><small>${esc(r[1])}${r[3]!=null&&r[3]>=1?' · '+(r[3]>=300?(+(r[3]/300).toFixed(r[3]<3000?1:0)).toLocaleString()+' years of work':mfN(r[3])+' day'+(r[3]===1?'':'s')+' of work'):''}${r[4]&&w!=null?' · its silver alone: '+mf$(r[4]):''}${r[5]?' · '+esc(r[5]):''}</small></div>${mV(r[2])}</div>`}).join('')}
  <p class="note">Years of work assume about 300 working days a year. Ancient wages bought different things than ours, so these are a feel for the size, not exact equivalents.</p>` }
['wage','hrs','gold','silver'].forEach(k=>ACT['m'+k]=el=>{const v=+el.value; if(v>0){MS[k]=v; Store.set('m'+k,v); msSec()}});

/* ---------- 6. distances from your door ---------- */
const MRING=[['sab','A Sabbath day\'s journey',2000*.4572,'ACT.1.12','2,000 cubits, the farthest you could walk on the Sabbath by later Jewish rule.','#3d5bd9'],
['emm','The road to Emmaus',60*STADION,'LUK.24.13','60 stadia. Two disciples walked it with Jesus without recognising him, then walked back the same night.','#0c8f7f'],
['day','A day\'s journey',32000,'LUK.2.44','Roughly 20 miles on foot. Mary and Joseph went a day\'s journey before they noticed Jesus was missing.','#c27c0e'],
['jon','Across Nineveh',3*32000,'JON.3.3','"An exceeding great city of three days\' journey." It may mean the time to walk across it, or to visit all of it.','#8e44ad'],
['beth','Nazareth to Bethlehem',145000,'LUK.2.4','About 90 miles by the usual route: four to seven days\' walk, with Mary heavily pregnant.','#d6336c'],
['eli','Elijah to Mount Horeb',350000,'1KI.19.8','"Forty days and forty nights." From Beersheba to the traditional Mount Sinai is about 220 miles; other proposed sites are farther.','#e8590c'],
['abr','Abraham: Ur to Haran to Canaan',1600000,'GEN.12.5','About 600 miles from Ur to Haran, then about 400 more to Shechem: roughly 1,000 miles with flocks and family.','#e03131']];
async function msDist(b){
  b.innerHTML=`<div class="ms-strip"><button class="btn sm${MS.ring==='all'?' pri':''}" data-act="mring" data-k="all">All</button>${MRING.map(r=>`<button class="btn sm${MS.ring===r[0]?' pri':''}" data-act="mring" data-k="${r[0]}">${esc(r[1])}</button>`).join('')}</div>
  ${msLocBar()}<div id="ms-maphost"></div><div id="ms-info">${MRING.filter(r=>MS.ring==='all'||r[0]===MS.ring).map(r=>`<div class="ms-row"><i style="background:${r[5]}"></i><div><b>${esc(r[1])}: ${mfL(r[2])}</b><small>${esc(r[4])} · on foot about ${r[2]<5000?Math.round(r[2]/MILE/3*60)+' minutes':r[2]<40000?(+(r[2]/MILE/3).toFixed(1))+' hours':Math.round(r[2]/32000)+' days'}</small></div>${mV(r[3])}</div>`).join('')}<p class="note">Each circle shows how far that distance reaches from where you stand, in any direction. A day's walk is taken as about 20 miles.</p></div>`;
  if(!await msMapInit($('#ms-maphost'))) return;
  const c=MS.loc||JERU, F=[], marks=[[c,'You','me']], show=MRING.filter(r=>MS.ring==='all'||r[0]===MS.ring);
  show.forEach(r=>{ const pts=[]; for(let i=0;i<=128;i++){const a=i/128*Math.PI*2; pts.push(msGeo(c,r[2]*Math.cos(a),r[2]*Math.sin(a)))} F.push({type:'Feature',properties:{col:r[5]},geometry:{type:'LineString',coordinates:pts}}); marks.push([msGeo(c,0,r[2]),r[1]]) });
  const fc={type:'FeatureCollection',features:F}; MS.map.getSource('ms').setData(fc); msMarks(marks); msFit(fc,0,30) }
ACT.mring=el=>{MS.ring=el.dataset.k; msSec()};
