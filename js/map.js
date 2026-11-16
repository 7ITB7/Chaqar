'use strict';
const M={map:null,mode:'book',b:'GEN',c:0,trace:true,tilt:false,P:null,ev:[],j:null,js:0,jv:0,timer:null,playing:false,q:'',marks:[],tool:null,tp:[],dz:null,di:0,yr:-1000,bt:null,bs:0,um:{}};
const ESRI='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ESRIL='https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
const DEMT='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const FT=3.28084, MI=1609.344, PADB={top:30,bottom:30,left:40,right:40};
const ft=m=>Math.round(m*FT).toLocaleString()+' ft';
const dim=t=>`<span style="font-family:var(--sans);font-size:12px;color:#b9ad93">${t}</span>`;

/* ---------- elevation data ---------- */
const DEM={c:new Map(),
  tile(z,x,y){const k=z+'/'+x+'/'+y; if(!this.c.has(k)) this.c.set(k,new Promise(res=>{const im=new Image(); im.crossOrigin='anonymous'; im.onload=()=>{try{const cv=document.createElement('canvas'); cv.width=cv.height=256; const g=cv.getContext('2d',{willReadFrequently:true}); g.drawImage(im,0,0); const d=g.getImageData(0,0,256,256).data, e=new Float32Array(65536); for(let i=0;i<65536;i++) e[i]=d[i*4]*256+d[i*4+1]+d[i*4+2]/256-32768; res(e)}catch(err){res(null)}}; im.onerror=()=>res(null); im.src=DEMT.replace('{z}',z).replace('{x}',x).replace('{y}',y)})); return this.c.get(k)},
  px(lat,lon,z){const n=256*Math.pow(2,z), s=Math.sin(lat*Math.PI/180); return [(lon+180)/360*n,(0.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n]},
  ll(x,y,z){const n=256*Math.pow(2,z); return [Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI, x/n*360-180]},
  async at(lat,lon,z=10){const [x,y]=this.px(lat,lon,z), t=await this.tile(z,Math.floor(x/256),Math.floor(y/256)); return t?t[(Math.floor(y)&255)*256+(Math.floor(x)&255)]:null},
  async grid(lat,lon,z,S){const [cx,cy]=this.px(lat,lon,z), x0=Math.round(cx-S/2), y0=Math.round(cy-S/2), g=new Float32Array(S*S), jobs=[];
    for(let ty=Math.floor(y0/256);ty<=Math.floor((y0+S-1)/256);ty++) for(let tx=Math.floor(x0/256);tx<=Math.floor((x0+S-1)/256);tx++) jobs.push(this.tile(z,tx,ty).then(t=>{ if(!t) return; const ox=tx*256-x0, oy=ty*256-y0; for(let r=0;r<256;r++){const gy=oy+r; if(gy<0||gy>=S) continue; for(let c=0;c<256;c++){const gx=ox+c; if(gx>=0&&gx<S) g[gy*S+gx]=t[r*256+c]}}}));
    await Promise.all(jobs); return {g,x0,y0,S,z}}
};
function gcDist(a,b){const R=6371000,r=Math.PI/180,dl=(b[0]-a[0])*r,dn=(b[1]-a[1])*r,h=Math.sin(dl/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dn/2)**2; return 2*R*Math.asin(Math.sqrt(h))}
function bearing(a,b){const r=Math.PI/180,y=Math.sin((b[1]-a[1])*r)*Math.cos(b[0]*r),x=Math.cos(a[0]*r)*Math.sin(b[0]*r)-Math.sin(a[0]*r)*Math.cos(b[0]*r)*Math.cos((b[1]-a[1])*r); return (Math.atan2(y,x)/r+360)%360}
/* travel estimate for one leg. a,b are [lat,lon] */
function legInfo(a,b,mode){const d=gcDist(a,b), sea=mode==='ship', road=d*(sea?1.15:1.3)/MI; return {mi:road,straight:d/MI,sea,days:road/PACE[sea?'ship':'foot'],herd:road/PACE.herd}}
const daysTxt=d=>d<0.75?'under a day':d<1.5?'about a day':'about '+Math.round(d)+' days';
async function profile(a,b){const n=48, es=[]; for(let i=0;i<=n;i++){const t=i/n; es.push(DEM.at(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,9))} const v=(await Promise.all(es)).filter(x=>x!=null); if(!v.length) return null; return {a:v[0],b:v[v.length-1],hi:Math.max(...v),lo:Math.min(...v)}}

/* ---------- map setup ---------- */
let _mi=null;
VIEW.map=()=>{ if(M.map){M.map.resize(); return Promise.resolve()} return _mi||(_mi=initMap()) };
async function initMap(){
  M.P=await J('places.json'); if(!M.P){$('#map-card').innerHTML='<div class="t">Could not load the place data.</div>'; _mi=null; return}
  if(BI[R.s.b]<66&&!M.set) M.b=R.s.b;
  let map;
  try{ map=new maplibregl.Map({container:'map',center:[35.2,31.6],zoom:6.3,maxPitch:80,attributionControl:{compact:true},
    style:{version:8,sources:{sat:{type:'raster',tiles:[ESRI],tileSize:256,maxzoom:18,attribution:'Imagery © Esri, Maxar, Earthstar Geographics · Terrain: Mapzen/AWS'},lab:{type:'raster',tiles:[ESRIL],tileSize:256,maxzoom:18},dem:{type:'raster-dem',tiles:[DEMT],encoding:'terrarium',tileSize:256,maxzoom:13}},
      layers:[{id:'sat',type:'raster',source:'sat'},{id:'lab',type:'raster',source:'lab',layout:{visibility:Store.get('labels',false)?'visible':'none'}}]}}); }
  catch(e){$('#map-card').innerHTML='<div class="t">This browser could not start the 3D map.</div><div class="d">It needs WebGL. Try Chrome or Safari.</div>'; _mi=null; return}
  await new Promise(r=>map.on('load',r));
  try{map.setTerrain({source:'dem',exaggeration:1.5})}catch(e){}
  map.setPadding({top:50,bottom:190,left:0,right:0});
  const empty={type:'FeatureCollection',features:[]};
  map.addSource('emp',{type:'geojson',data:empty});
  map.addLayer({id:'emp-f',type:'fill',source:'emp',paint:{'fill-color':['get','c'],'fill-opacity':.3}});
  map.addLayer({id:'emp-l',type:'line',source:'emp',paint:{'line-color':['get','c'],'line-width':1.5,'line-opacity':.9}});
  map.addSource('ln',{type:'geojson',data:empty}); map.addSource('pt',{type:'geojson',data:empty});
  const lp={'line-color':['get','c'],'line-width':['get','w'],'line-opacity':['get','o']};
  map.addLayer({id:'ln-d',type:'line',source:'ln',filter:['==',['get','d'],1],paint:Object.assign({'line-dasharray':[1.5,2.5]},lp),layout:{'line-cap':'round','line-join':'round'}});
  map.addLayer({id:'ln-s',type:'line',source:'ln',filter:['==',['get','d'],0],paint:lp,layout:{'line-cap':'round','line-join':'round'}});
  map.addLayer({id:'pt',type:'circle',source:'pt',paint:{'circle-radius':['get','r'],'circle-color':['get','f'],'circle-opacity':['get','o'],'circle-stroke-color':['get','s'],'circle-stroke-width':['get','w']}});
  map.on('click',e=>{ if(M.tool){toolClick(e);return} const f=map.queryRenderedFeatures([[e.point.x-9,e.point.y-9],[e.point.x+9,e.point.y+9]],{layers:['pt']}); if(f.length){const dd=x=>{const q=map.project(x.geometry.coordinates); return (q.x-e.point.x)**2+(q.y-e.point.y)**2}, best=f.sort((a,b)=>dd(a)-dd(b))[0]; if(best.properties.t) treeSheet(best.properties.t); else if(best.properties.i>=0) placeSheet(best.properties.i)}});
  M.map=map; M.ev=bookEvents(M.b); drawMap(true);
}
function stopPlay(){clearInterval(M.timer); M.timer=null; M.playing=false; M.run=(M.run||0)+1; hush()}
/* ---------- narrator: the phone's own voice reads each stop aloud ---------- */
M.voice=Store.get('voice',false);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function hush(){try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
function speak(text){return new Promise(res=>{ if(!M.voice||!window.speechSynthesis||!text){res();return} hush();
  const u=new SpeechSynthesisUtterance(text.replace(/[“”"]/g,'')), vs=speechSynthesis.getVoices(), v=vs.find(x=>/en[-_]US/i.test(x.lang)&&/natural|enhanced|premium|google/i.test(x.name))||vs.find(x=>/^en/i.test(x.lang)); if(v) u.voice=v; u.lang='en-US'; u.rate=.95;
  let done=false; const fin=()=>{ if(!done){done=true; clearTimeout(tm); res()} }, tm=setTimeout(fin,Math.max(5000,text.length*95)); u.onend=fin; u.onerror=fin; M.utter=u; try{speechSynthesis.speak(u)}catch(e){fin()} })}
async function narrateStop(){ if(!M.voice||M.mode!=='journey') return; const st=jStops(), k=M.js, s=st[k], q=dotRef(s[3]); let v=''; try{v=await verseText('KJV',q.b,q.c,q.v)}catch(e){}
  if(M.mode!=='journey'||M.js!==k) return; const j=M.j; await speak((k===0?j.t+'. '+j.sub.replace(/–/g,' to ').replace(/·/g,',')+'. ':'')+'Stop '+(k+1)+': '+s[0]+'. '+s[4]+(v?' '+dotStr(s[3]).replace(':',', verse ')+' says: '+v:''))}
ACT.mvoice=()=>{M.voice=!M.voice; Store.set('voice',M.voice); if(!M.voice){hush(); toast('Narration off')} else { if(!window.speechSynthesis){toast('This browser has no built-in voice'); M.voice=false} else toast('Narration on') }
  const pl=M.playing; if(M.mode==='journey'){clearMarks(); drawJourney(false); M.playing=pl; if(M.voice&&!pl) narrateStop()} else if(M.mode==='battle'){clearMarks(); M.um={}; drawBattle(false); if(M.voice&&!pl) speak(M.bt.s[M.bs][0])}};
const vbtn=()=>`<button data-act="mvoice" class="${M.voice?'go':''}" aria-label="Narration">${M.voice?'🔊':'🔈'}</button>`;
function bookEvents(b){const bi=BI[b], ev=[]; M.P.forEach((p,i)=>{for(const x of p.v){ if(Math.floor(x/1e6)===bi) ev.push([x%1e6,i]) }}); ev.sort((a,b)=>a[0]-b[0]||a[1]-b[1]); return ev}
const conf=c=>c>=500?'Location well established':c>=150?'Location likely':'Location uncertain or debated';
const LL=a=>[a[1],a[0]];   /* [lat,lon] -> [lon,lat] */
const okLL=(la,lo)=>isFinite(la)&&isFinite(lo)&&Math.abs(la)<89;
function setGeo(pts,lines){ pts=pts.filter(p=>okLL(p.la,p.lo)); lines=lines.map(l=>Object.assign({},l,{pts:l.pts.filter(q=>okLL(q[0],q[1]))})); M.map.getSource('pt').setData({type:'FeatureCollection',features:pts.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:[p.lo,p.la]},properties:{i:p.i,r:p.r,f:p.f,o:p.o==null?1:p.o,s:p.s||'#fff',w:p.w==null?1:p.w}}))});
  M.map.getSource('ln').setData({type:'FeatureCollection',features:lines.filter(l=>l.pts.length>1).map(l=>({type:'Feature',geometry:{type:'LineString',coordinates:l.pts.map(LL)},properties:{c:l.c,w:l.w,o:l.o,d:l.d?1:0}}))}) }
function clearMarks(){M.marks.forEach(m=>m.remove()); M.marks=[]}
function label(la,lo,text,cls,onclick){ if(!okLL(la,lo)) return {getElement:()=>document.createElement('div'),setLngLat(){},remove(){}}; const el=document.createElement('div'); el.className=cls||'ptip'; el.textContent=text; if(onclick) el.addEventListener('click',e=>{e.stopPropagation(); onclick()}); const m=new maplibregl.Marker({element:el,anchor:cls?'center':'bottom',offset:cls?[0,0]:[0,-9]}).setLngLat([lo,la]).addTo(M.map); M.marks.push(m); return m}
function fit(pts,maxZoom){ pts=pts.filter(p=>okLL(p[0],p[1])); if(!pts.length) return; const b=new maplibregl.LngLatBounds(); pts.forEach(p=>b.extend(LL(p))); M.map.fitBounds(b,{padding:PADB,maxZoom:maxZoom||10,duration:900,pitch:M.tilt?62:0}) }
function clearVs(){ if(M.map.getLayer('vs')) M.map.removeLayer('vs'); if(M.map.getSource('vs')) M.map.removeSource('vs') }

function drawTop(){
  const b=(act,on,txt)=>`<button data-act="${act}" class="${on?'on':''}">${txt}</button>`;
  $('#map-top').innerHTML=b('mbook',M.mode==='book'&&!M.tool,M.mode==='book'?esc(bname(M.b))+' ▾':'By book')+b('mjour',M.mode==='journey'&&!M.tool,M.mode==='journey'?esc(M.j.t)+' ▾':'Journeys')+(M.mode==='trace'?b('mtrback',true,'Trace: '+esc(M.tr.t)):'')+(M.mode==='pat'?b('mpback',true,esc(M.pat.t)):'')+b('mtime',M.mode==='time'&&!M.tool,'Timeline')+b('mbat',M.mode==='battle'&&!M.tool,M.mode==='battle'?esc(M.bt.t)+' ▾':'Battles')+b('mtree',M.mode==='tree'&&!M.tool,'Family tree')+b('m3d',M.tilt,'3D')+b('mview',M.tool==='view','What can you see?')+b('mmeasure',M.tool==='measure','Walk time')+b('mdisp',M.mode==='disputed'&&!M.tool,'Disputed sites')+b('mall',M.mode==='all'&&!M.tool,'All places')+b('mtrace',M.trace,'Trace line')+b('mlabels',M.map.getLayoutProperty('lab','visibility')==='visible','Modern names');
}
function drawMap(doFit){ if(!M.map) return; M.tool=null; M.map.getCanvas().style.cursor=''; clearVs(); clearMarks(); M.um={}; if(M.mode!=='time') M.map.getSource('emp').setData({type:'FeatureCollection',features:[]}); drawTop(); ({book:drawBook,journey:drawJourney,all:drawAll,disputed:drawDisputed,time:drawTime,battle:drawBattle,trace:drawTrace,pat:drawPat,tree:drawTree})[M.mode](doFit) }

/* ---------- by book ---------- */
function drawBook(doFit){
  const P=M.P, ev=M.ev, c=M.c, seen=new Map(), line=[]; let last=-1;
  for(const [cv,i] of ev){const ch=Math.floor(cv/1000); if(c&&ch>c) break; const o=seen.get(i)||{n:0,cur:false}; o.n++; if(!c||ch===c){o.cur=true; if(i!==last){line.push([P[i].la,P[i].lo]); last=i}} seen.set(i,o)}
  const cur=[...seen].filter(x=>x[1].cur), pts=[], feats=[];
  seen.forEach((o,i)=>{const p=P[i]; if(o.cur) pts.push([p.la,p.lo]); feats.push({i,la:p.la,lo:p.lo,r:o.cur?6+Math.min(7,Math.sqrt(o.n)):4,f:o.cur?'#e05a36':'#7d6f50',o:o.cur?.95:.6,s:o.cur?'#fff':'#cbbd98',w:o.cur?2:1})});
  feats.sort((a,b)=>a.r-b.r);
  setGeo(feats,M.trace?[{pts:line,c:'#ffd36b',w:c?3:1.5,o:c?.95:.55,d:!c}]:[]);
  if(cur.length<=16) cur.forEach(x=>{const p=P[x[0]]; label(p.la,p.lo,p.n,null,()=>placeSheet(x[0]))});
  if(doFit) fit(pts);
  const n=Math.max(nch(M.b),1), names=cur.map(x=>P[x[0]].n);
  $('#map-card').innerHTML=`<div class="t">${esc(bname(M.b))}${c?' '+c:''} ${dim(`· ${cur.length} place${cur.length===1?'':'s'}${c?'':' in the whole book'}`)}</div>
  <div class="d">${cur.length?esc(names.slice(0,40).join(' · '))+(names.length>40?' …':''):(c?'No mapped places in this chapter.':'No mapped places in this book.')}</div>
  <div class="ctl"><button class="go" data-act="mplay">${M.timer?'❚❚':'▶'}</button><input type="range" min="0" max="${n}" value="${c}" data-inp="mslide" aria-label="Chapter"><button data-act="mread" aria-label="Read this chapter">¶</button></div>`;
}
ACT.mslide=el=>{M.c=+el.value; stopPlay(); drawMap(true)};
ACT.mread=()=>{stopPlay(); goRef(M.b,M.c||1)};
ACT.mtrace=()=>{M.trace=!M.trace; drawMap(false)};
ACT.mlabels=()=>{const on=M.map.getLayoutProperty('lab','visibility')==='visible'; M.map.setLayoutProperty('lab','visibility',on?'none':'visible'); Store.set('labels',!on); drawTop()};
ACT.m3d=()=>{M.tilt=!M.tilt; M.map.easeTo({pitch:M.tilt?65:0,bearing:M.tilt?M.map.getBearing():0,duration:900}); drawTop(); if(M.tilt) toast('Two fingers: drag up or down to tilt, twist to turn')};
ACT.mbook=()=>{stopPlay(); Sheet.open({title:'Trace a book on the map',render(el){
  el.innerHTML=[['ot','Old Testament'],['nt','New Testament']].map(g=>`<div class="lbl" style="margin:4px 0 8px">${g[1]}</div><div class="grid">`+BOOKS.filter(b=>b[2]===g[0]).map(b=>`<button data-act="mpick" data-b="${b[0]}" class="${M.mode==='book'&&b[0]===M.b?'on':''}">${esc(b[1])}</button>`).join('')+'</div>').join('')}})};
ACT.mpick=el=>{Sheet.close(); mapOpenBook(el.dataset.b,0)};
async function mapOpenBook(b,c){ if(BI[b]>65){toast('Places are mapped for the 66-book canon');return} M.set=true; M.mode='book'; M.b=b; M.c=c||0; stopPlay(); go('map'); await VIEW.map(); if(!M.map) return; M.ev=bookEvents(b); drawMap(true) }
ACT.mplay=async()=>{ if(M.timer||M.playing){stopPlay(); drawMap(false); return}
  if(M.mode==='journey'){ if(M.js>=jStops().length-1) M.js=0; drawMap(!M.tilt); const run=M.run=(M.run||0)+1; M.playing=true; clearMarks(); drawJourney(false); await (M.voice?narrateStop():wait(1800));
    while(M.run===run&&M.playing&&M.mode==='journey'&&M.js<jStops().length-1){ if(M.tilt) await flyLeg(); else {M.js++; clearMarks(); drawJourney(true)} if(M.run!==run||!M.playing) break; await (M.voice?narrateStop():wait(M.tilt?1400:2600)) }
    if(M.run===run&&M.mode==='journey'){stopPlay(); clearMarks(); drawJourney(false)} return }
  const n=nch(M.b); if(M.c>=n) M.c=0; M.timer=setInterval(()=>{ if(M.c>=n){stopPlay(); drawMap(false); return} M.c++; drawMap(true)},2400); M.c++; drawMap(true)};

/* ---------- journeys, travel time, fly-through ---------- */
const jStops=()=>(M.j.alts&&M.j.alts[M.jv]&&M.j.alts[M.jv].stops)||M.j.stops;
const jLegMode=k=>{const m=JMODE[M.j.id]||['foot',[]]; return (!M.jv&&m[1].includes(k))?'ship':m[0]};
ACT.mjour=()=>{stopPlay(); Sheet.open({title:'Journeys',render(el){el.innerHTML=JOURNEYS.map(j=>`<button class="li" data-act="mj" data-id="${j.id}"><h3>${esc(j.t)}${j.alts?'<small>'+j.alts.length+' route theories</small>':''}</h3><p>${esc(j.sub)} · ${j.stops.length} stops</p></button>`).join('')}})};
ACT.mj=el=>{Sheet.close(); stopPlay(); M.mode='journey'; M.j=JOURNEYS.find(j=>j.id===el.dataset.id); M.js=0; M.jv=0; drawMap(true); narrateStop()};
function drawJourney(doFit){
  const j=M.j, st=jStops(), k=M.js, s=st[k];
  const done=st.slice(0,k+1).map(x=>[x[1],x[2]]), rest=st.slice(k).map(x=>[x[1],x[2]]);
  setGeo([],[{pts:rest,c:'#ffffff',w:1.5,o:.5,d:1},{pts:done,c:'#ffd36b',w:3.5,o:.95,d:0}]);
  st.forEach((x,i)=>label(x[1],x[2],String(i+1),'jm'+(i===k?' cur':i>k?' dim':''),()=>{M.js=i; stopPlay(); drawMap(true)}));
  if(doFit){ if(k===0&&!M.playing&&!M.timer) fit(st.map(x=>[x[1],x[2]]),9); else M.map.flyTo({center:[s[2],s[1]],zoom:Math.max(M.map.getZoom(),M.tilt?10.5:7.5),pitch:M.tilt?62:0,duration:1000}) }
  /* travel totals */
  let tot=0, days=0, leg=null; for(let i=1;i<st.length;i++){const m=jLegMode(i), L=legInfo([st[i-1][1],st[i-1][2]],[st[i][1],st[i][2]],m), d=L.sea?L.days:(m==='herd'?L.herd:L.days); if(i<=k){tot+=L.mi; days+=d} if(i===k) leg=Object.assign(L,{d,m})}
  const legTxt=leg?`<b style="color:#ffd36b">${Math.round(leg.mi)} mi</b> from ${esc(st[k-1][0])}, ${leg.sea?daysTxt(leg.d)+' under sail':leg.m==='herd'?daysTxt(leg.herd)+' with flocks ('+daysTxt(leg.days)+' on foot alone)':daysTxt(leg.d)+' on foot'}<span id="jelev"></span>. Journey so far: ${Math.round(tot).toLocaleString()} mi, day ${Math.max(1,Math.round(days))}.`:'Starting point.';
  $('#map-card').innerHTML=`<div class="t">${k+1}. ${esc(s[0])} ${dim('· '+esc(dotStr(s[3])))}</div><div class="d" style="max-height:7.2em">${esc(s[4])}${k===0&&j.note&&!M.jv?' <i>'+esc(j.note)+'</i>':''}<br>${legTxt}</div>
  ${j.alts?`<div class="ctl" style="margin-top:6px"><button data-act="mjv" style="width:auto;flex:1;border-radius:8px;height:36px;font-size:12.5px;padding:0 10px">Theory: ${esc(j.alts[M.jv].n)} ⟳</button></div>`:''}
  <div class="ctl"><button data-act="mjs" data-d="-1">‹</button><button class="go" data-act="mplay">${(M.timer||M.playing)?'❚❚':'▶'}</button><button data-act="mjs" data-d="1">›</button><button data-act="mfly" style="width:auto;padding:0 14px;border-radius:21px;font-size:13px" ${k<st.length-1?'':'disabled'}>✈ Fly next leg</button><span style="flex:1;font-family:var(--sans);font-size:12px;color:#b9ad93;text-align:center">${k+1}/${st.length}</span>${vbtn()}<button data-act="goref" data-ref="${s[3]}" aria-label="Read">¶</button></div>`;
  if(leg&&!leg.sea) profile([st[k-1][1],st[k-1][2]],[s[1],s[2]]).then(p=>{const e=$('#jelev'); if(p&&e&&M.js===k) e.textContent=`. Elevation ${ft(p.a)} → ${ft(p.b)}${p.hi-Math.max(p.a,p.b)>150?', crossing '+ft(p.hi):''}`});
}
ACT.mjs=el=>{stopPlay(); const n=jStops().length; M.js=Math.max(0,Math.min(n-1,M.js+(+el.dataset.d))); drawMap(true); narrateStop()};
ACT.mjv=()=>{stopPlay(); M.jv=(M.jv+1)%M.j.alts.length; M.js=Math.min(M.js,jStops().length-1); drawMap(true); if(M.js===0) fit(jStops().map(x=>[x[1],x[2]]),9)};
ACT.mfly=async()=>{ if(M.flying) return; stopPlay(); await flyLeg(); narrateStop() };
/* low-level camera run from the current stop to the next */
function flyLeg(){ const st=jStops(), k=M.js; if(k>=st.length-1) return Promise.resolve();
  const a=[st[k][1],st[k][2]], b=[st[k+1][1],st[k+1][2]], km=gcDist(a,b)/1000, brg=bearing(a,b), z=Math.max(8.3,Math.min(13.5,14.6-0.78*Math.log2(Math.max(km,2)))), dur=Math.max(5000,Math.min(14000,3500+km*45));
  if(!M.tilt){M.tilt=true; drawTop()} M.flying=true;
  return new Promise(done=>{ M.map.easeTo({center:LL(a),zoom:z,pitch:74,bearing:brg,duration:1300});
    setTimeout(()=>{const t0=performance.now(); const step=now=>{ let t=Math.min(1,(now-t0)/dur); const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
        M.map.jumpTo({center:[a[1]+(b[1]-a[1])*e,a[0]+(b[0]-a[0])*e],zoom:z,pitch:74,bearing:brg});
        if(t<1&&M.flying) requestAnimationFrame(step); else {M.flying=false; M.js=k+1; const pl=M.playing; clearMarks(); drawTop(); drawJourney(false); M.playing=pl; done()} };
      requestAnimationFrame(step)},1350) }) }

/* ---------- disputed sites ---------- */
ACT.mdisp=()=>{stopPlay(); Sheet.open({title:'Disputed sites',render(el){el.innerHTML='<p class="note">Places where the Bible names a location and scholars do not agree where it was. Each candidate is shown with the case for and against.</p>'+DISPUTED.map(d=>`<button class="li" data-act="md" data-id="${d.id}"><h3>${esc(d.t)}<small>${d.c.length} candidates</small></h3><p>${esc(d.x)}</p></button>`).join('')}})};
ACT.md=el=>{Sheet.close(); M.mode='disputed'; M.dz=DISPUTED.find(d=>d.id===el.dataset.id); M.di=-1; drawMap(true)};
function drawDisputed(doFit){
  const d=M.dz, k=M.di; setGeo([],[]);
  d.c.forEach((c,i)=>label(c[1],c[2],String.fromCharCode(65+i),'jm'+(i===k?' cur':''),()=>{M.di=i; drawMap(true)}));
  if(doFit){ if(k<0) fit(d.c.map(c=>[c[1],c[2]]),11); else M.map.flyTo({center:[d.c[k][2],d.c[k][1]],zoom:Math.max(M.map.getZoom(),M.tilt?11.5:9),pitch:M.tilt?62:0,duration:1000}) }
  const c=k>=0?d.c[k]:null;
  $('#map-card').innerHTML=(c?`<div class="t">${String.fromCharCode(65+k)}. ${esc(c[0])}</div><div class="d" style="max-height:9em"><b style="color:#9fd6bd">For:</b> ${esc(c[3])}<br><b style="color:#f0a48e">Against:</b> ${esc(c[4])}<span id="delev"></span></div>`:`<div class="t">${esc(d.t)} ${dim('· '+esc(dotStr(d.ref)))}</div><div class="d">${esc(d.x)} Tap a letter, or step through with the arrows.</div>`)+
  `<div class="ctl"><button data-act="mds" data-d="-1">‹</button><button data-act="mds" data-d="1">›</button><span style="flex:1;font-family:var(--sans);font-size:12px;color:#b9ad93;text-align:center">${k<0?d.c.length+' candidates':(k+1)+' of '+d.c.length}</span>${c?`<button data-act="mdview" style="width:auto;padding:0 12px;border-radius:21px;font-size:12.5px">View from here</button>`:''}<button data-act="goref" data-ref="${d.ref}" aria-label="Read">¶</button></div>`;
  if(c) DEM.at(c[1],c[2],11).then(e=>{const x=$('#delev'); if(e!=null&&x&&M.di===k) x.innerHTML=`<br>Elevation here: ${ft(e)}.`});
}
ACT.mds=el=>{const n=M.dz.c.length; M.di=((M.di<0&&+el.dataset.d<0?0:M.di)+(+el.dataset.d)+n)%n; drawMap(true)};
ACT.mdview=()=>{const c=M.dz.c[M.di]; viewshed(c[1],c[2],c[0])};

/* ---------- all places ---------- */
ACT.mall=()=>{stopPlay(); M.mode='all'; $('#map-card').innerHTML=''; drawMap(true)};
function drawAll(doFit){
  const q=M.q.toLowerCase(), hits=[], feats=[];
  M.P.forEach((p,i)=>{const hit=q&&p.n.toLowerCase().includes(q); if(hit) hits.push(i); feats.push({i,la:p.la,lo:p.lo,r:hit?9:2.5+Math.min(8,Math.log2(p.v.length+1)),f:hit?'#e05a36':'#d3ad55',o:hit?.95:.65,s:hit?'#fff':'#f3e3b3',w:hit?2:.8})});
  feats.sort((a,b)=>a.r-b.r); setGeo(feats,[]);
  hits.slice(0,12).forEach(i=>label(M.P[i].la,M.P[i].lo,M.P[i].n,null,()=>placeSheet(i)));
  if(doFit){ if(hits.length) fit(hits.map(i=>[M.P[i].la,M.P[i].lo]),11); else if(!q) M.map.flyTo({center:[35.3,31.8],zoom:6.8,duration:800}) }
  if(!$('#mq')) $('#map-card').innerHTML=`<div class="t">${M.P.length.toLocaleString()} places named in the Bible</div><div class="d" id="mqd">Bigger dots are mentioned more often. Tap any dot.</div><div class="ctl"><input class="inp" id="mq" placeholder="Find a place: Bethel, Ephesus…" data-inp="mfind" value="${esc(M.q)}"></div>`;
  const d=$('#mqd'); if(d&&q) d.textContent=hits.length?hits.length+' match'+(hits.length===1?'':'es'):'No place by that name';
}
let _mf; ACT.mfind=el=>{M.q=el.value.trim(); clearTimeout(_mf); _mf=setTimeout(()=>{clearMarks(); drawAll(true)},350)};

/* ---------- tools: walk time and line of sight ---------- */
function nearPlace(e){const f=M.map.queryRenderedFeatures([[e.point.x-10,e.point.y-10],[e.point.x+10,e.point.y+10]],{layers:['pt']}).filter(x=>x.properties.i>=0); if(f.length){const p=M.P[f[0].properties.i]; return {la:p.la,lo:p.lo,n:p.n}} return {la:e.lngLat.lat,lo:e.lngLat.lng,n:''}}
function startTool(t,msg){stopPlay(); M.tool=t; M.tp=[]; clearVs(); drawTop(); M.map.getCanvas().style.cursor='crosshair'; $('#map-card').innerHTML=`<div class="t">${msg[0]}</div><div class="d">${msg[1]}</div><div class="ctl"><button data-act="mtoolx" style="width:auto;padding:0 14px;border-radius:21px;font-size:13px">Done</button></div>`}
ACT.mmeasure=()=>{ if(M.tool==='measure'){drawMap(false);return} startTool('measure',['Walk time','Tap where the journey starts, then where it ends. Tapping a dot uses that place.'])};
ACT.mview=()=>{ if(M.tool==='view'){drawMap(false);return} startTool('view',['What can you see from here?','Tap the spot where you want to stand. Hilltops work best.'])};
ACT.mtoolx=()=>drawMap(false);
async function toolClick(e){const p=nearPlace(e);
  if(M.tool==='view'){viewshed(p.la,p.lo,p.n);return}
  M.tp.push(p); label(p.la,p.lo,M.tp.length===1?'A':'B','jm cur');
  if(M.tp.length===1){$('#map-card .d').textContent=(p.n?'From '+p.n+'. ':'')+'Now tap the destination.';return}
  const [a,b]=M.tp, A=[a.la,a.lo], B=[b.la,b.lo], L=legInfo(A,B,'foot'), S=legInfo(A,B,'ship');
  M.map.getSource('ln').setData({type:'FeatureCollection',features:[{type:'Feature',geometry:{type:'LineString',coordinates:[LL(A),LL(B)]},properties:{c:'#ffd36b',w:3,o:.95,d:0}}]});
  $('#map-card').innerHTML=`<div class="t">${esc(a.n||'Point A')} → ${esc(b.n||'Point B')}</div><div class="d" style="max-height:9em">Straight line <b style="color:#ffd36b">${L.straight.toFixed(L.straight<10?1:0)} mi</b>; by road roughly ${Math.round(L.mi)} mi.<br>On foot: ${daysTxt(L.days)} · With flocks and families: ${daysTxt(L.herd)} · By ship, if it is a sea route: ${daysTxt(S.days)}<span id="melev"></span></div><div class="ctl"><button data-act="mmeasure2" style="width:auto;padding:0 14px;border-radius:21px;font-size:13px">Measure another</button><button data-act="mtoolx" style="width:auto;padding:0 14px;border-radius:21px;font-size:13px">Done</button></div>`;
  M.tp=[]; profile(A,B).then(pr=>{const x=$('#melev'); if(pr&&x) x.innerHTML=`<br>Elevation ${ft(pr.a)} → ${ft(pr.b)}. Highest ground on the line ${ft(pr.hi)}, lowest ${ft(pr.lo)}.`});
}
ACT.mmeasure2=()=>{clearMarks(); setGeo([],[]); if(M.mode==='book'||M.mode==='all') ({book:drawBook,all:drawAll})[M.mode](false); startTool('measure',['Walk time','Tap where the journey starts, then where it ends.'])};

/* what the eye can reach from a point: terrain, earth curvature and normal refraction */
async function viewshed(la,lo,name){
  stopPlay(); M.tool='view'; drawTop(); const card=$('#map-card'); card.innerHTML='<div class="t">Working out the view…</div><div class="d">Loading terrain for 60 miles in every direction.</div>';
  const z=10, S=1536, G=await DEM.grid(la,lo,z,S), g=G.g, [fx,fy]=DEM.px(la,lo,z); let cx=Math.round(fx-G.x0), cy=Math.round(fy-G.y0);
  { let bx=cx,by=cy; for(let a=-2;a<=2;a++) for(let b=-2;b<=2;b++) if(g[(cy+a)*S+cx+b]>g[by*S+bx]){bx=cx+b;by=cy+a} cx=bx; cy=by }   /* stand on the highest ground within about 300 yards */
  const mpp=156543.03392*Math.cos(la*Math.PI/180)/Math.pow(2,z), h0=g[cy*S+cx]+1.8, vis=new Uint8Array(S*S), Rr=S/2-2, K=0.87/(2*6371000); let far=0;
  if(!g.some(v=>v!==0)){card.innerHTML='<div class="t">Could not load the terrain.</div><div class="d">Check your connection and try again.</div><div class="ctl"><button data-act="mtoolx" style="width:auto;padding:0 14px;border-radius:21px;font-size:13px">Done</button></div>';return}
  const ray=(tx,ty)=>{const dx=tx-cx, dy=ty-cy, n=Math.max(Math.abs(dx),Math.abs(dy)), sx=dx/n, sy=dy/n, sl=Math.hypot(sx,sy)*mpp; let mx=-1e9;
    for(let i=1;i<=n;i++){const x=Math.round(cx+sx*i), y=Math.round(cy+sy*i); if(x<0||y<0||x>=S||y>=S) break; const pd=Math.hypot(x-cx,y-cy); if(pd>Rr) break; const d=i*sl, s=(g[y*S+x]-K*d*d-h0)/d; if(i<3){vis[y*S+x]=1; if(s>mx) mx=s; continue} if(s>=mx){mx=s; vis[y*S+x]=1; if(d>far) far=d}}};
  for(let i=0;i<S;i++){ray(i,0);ray(i,S-1);ray(0,i);ray(S-1,i)} vis[cy*S+cx]=1;
  const cv=document.createElement('canvas'); cv.width=cv.height=S; const cx2=cv.getContext('2d'), im=cx2.createImageData(S,S), D=im.data;
  for(let y=0;y<S;y++) for(let x=0;x<S;x++){const k=(y*S+x)*4, pd=Math.hypot(x-cx,y-cy); if(pd>Rr) continue; if(vis[y*S+x]){D[k]=255;D[k+1]=205;D[k+2]=70;D[k+3]=105} else {D[k]=8;D[k+1]=10;D[k+2]=16;D[k+3]=150}}
  cx2.putImageData(im,0,0);
  const c1=DEM.ll(G.x0,G.y0,z), c2=DEM.ll(G.x0+S,G.y0+S,z);
  clearVs(); M.map.addSource('vs',{type:'image',url:cv.toDataURL(),coordinates:[[c1[1],c1[0]],[c2[1],c1[0]],[c2[1],c2[0]],[c1[1],c2[0]]]}); M.map.addLayer({id:'vs',type:'raster',source:'vs',paint:{'raster-fade-duration':0,'raster-opacity':.9}},'ln-d');
  clearMarks(); label(la,lo,'◉','jm cur');
  const seen=[]; M.P.forEach((p,i)=>{const [px,py]=DEM.px(p.la,p.lo,z), x=Math.round(px-G.x0), y=Math.round(py-G.y0); if(x<3||y<3||x>=S-3||y>=S-3) return; const d=gcDist([la,lo],[p.la,p.lo]); if(d<400) return; let ok=false; for(let a=-2;a<=2&&!ok;a++) for(let b=-2;b<=2;b++) if(vis[(y+a)*S+x+b]){ok=true;break} if(ok) seen.push([p.v.length,p.n,d,i])});
  seen.sort((a,b)=>b[0]-a[0]); const names=[...new Map(seen.map(s=>[s[1],s])).values()].slice(0,24);
  names.slice(0,8).forEach(s=>label(M.P[s[3]].la,M.P[s[3]].lo,s[1],null,()=>placeSheet(s[3])));
  M.map.fitBounds([[c1[1]+ (c2[1]-c1[1])*.2,c2[0]+(c1[0]-c2[0])*.2],[c2[1]-(c2[1]-c1[1])*.2,c1[0]-(c1[0]-c2[0])*.2]],{padding:PADB,duration:900,pitch:M.tilt?55:0});
  card.innerHTML=`<div class="t">The view from ${esc(name||'here')}</div><div class="d" style="max-height:9.5em">Standing at ${ft(h0-1.8)}. Gold ground is in direct line of sight on a perfectly clear day; dark ground is hidden by hills or the curve of the earth. Terrain detail is about 140 yards, so buildings and small rises are not counted. Farthest ground in view: <b style="color:#ffd36b">${far>Rr*mpp*.96?'beyond '+Math.round(Rr*mpp/MI)+' mi (the edge of this calculation)':Math.round(far/MI)+' mi'}</b>.<br>${names.length?'Bible places in view: '+names.map(s=>esc(s[1])+' ('+Math.round(s[2]/MI)+' mi)').join(' · '):'No mapped Bible places in view.'}</div>
  <div class="ctl"><button data-act="mview2" style="width:auto;padding:0 14px;border-radius:21px;font-size:13px">Try another spot</button><button data-act="mtoolx" style="width:auto;padding:0 14px;border-radius:21px;font-size:13px">Done</button></div>`;
  M.map.getCanvas().style.cursor='crosshair';
}
ACT.mview2=()=>{clearMarks(); startTool('view',['What can you see from here?','Tap the spot where you want to stand.'])};

/* ---------- place details ---------- */
ACT.mapplace=async el=>{const i=+el.dataset.i; Sheet.close(); go('map'); await VIEW.map(); if(!M.map) return; const p=M.P[i]; M.mode='all'; M.q=p.n; $('#map-card').innerHTML=''; drawMap(true); placeSheet(i)};
function placeSheet(i){const p=M.P[i]; stopPlay();
  Sheet.open({title:p.n,shown:25,render(el){const o=this, per={}; p.v.forEach(x=>{const b=Math.floor(x/1e6); per[b]=(per[b]||0)+1});
    let refs=p.v; const inBook=M.mode==='book'&&per[BI[M.b]]; if(inBook&&!o.all) refs=p.v.filter(x=>Math.floor(x/1e6)===BI[M.b]);
    let h=`<div class="lbl">${esc(p.t)} · ${p.v.length} mention${p.v.length===1?'':'s'}</div><p class="def" style="margin:8px 0 4px">${p.m?'Identified with <b>'+esc(p.m)+'</b>. ':''}${conf(p.c)}.<span id="pelev"></span></p>
    <p class="sub" style="margin-bottom:10px">${p.la.toFixed(3)}°, ${p.lo.toFixed(3)}° · <a href="https://www.google.com/maps/@${p.la},${p.lo},3000m/data=!3m1!1e3" target="_blank" rel="noopener">Open in Google Maps</a></p>
    <div class="row" style="margin-bottom:6px"><button class="btn sm" data-act="pzoom" data-i="${i}">Fly to the site in 3D</button><button class="btn sm" data-act="pview" data-i="${i}">What can you see from here?</button>${inBook?`<button class="btn sm" data-act="pall">${o.all?'Only '+esc(bname(M.b)):'All books'}</button>`:''}</div>
    <div class="chips" style="margin:10px 0 6px">`+Object.keys(per).slice(0,30).map(b=>`<span class="tag">${esc(BOOKS[b][0])} ${per[b]}</span>`).join('')+'</div>';
    h+=refs.slice(0,o.shown).map((x,k)=>{const r=unpack(x); return `<button class="ref" data-act="goref" data-ref="${r.b}.${r.c}.${r.v}"><b>${esc(refStr(r.b,r.c,r.v))}</b><span id="pv${k}">…</span></button>`}).join('')+(refs.length>o.shown?`<button class="btn" data-act="pmore" style="width:100%;margin-top:12px">Show more (${refs.length-o.shown})</button>`:'');
    el.innerHTML=h; refs.slice(0,o.shown).forEach((x,k)=>{const r=unpack(x); verseText('KJV',r.b,r.c,r.v).then(t=>{const s=$('#pv'+k); if(s) s.textContent=t})});
    DEM.at(p.la,p.lo,11).then(e=>{const x=$('#pelev'); if(e!=null&&x) x.textContent=' Elevation '+ft(e)+'.'})}})}
ACT.pzoom=el=>{const p=M.P[+el.dataset.i]; Sheet.close(); M.tilt=true; drawTop(); M.map.flyTo({center:[p.lo,p.la],zoom:13.5,pitch:68,duration:2600})};
ACT.pview=el=>{const p=M.P[+el.dataset.i]; Sheet.close(); viewshed(p.la,p.lo,p.n)};
ACT.pall=()=>{const o=Sheet.top(); o.all=!o.all; Sheet.redraw()};
ACT.pmore=()=>{const o=Sheet.top(); o.shown+=50; Sheet.redraw()};

/* ---------- timeline: people and empires by year ---------- */
const yrTxt=y=>y<0?(-y)+' BC':'AD '+y;
ACT.mtime=()=>{stopPlay(); M.mode='time'; drawMap(true)};
function drawTime(doFit){
  const y=M.yr, emps=EMPIRES.filter(e=>y>=e[2]&&y<=e[3]), ppl=PEOPLE.filter(p=>y>=p[3]&&y<=p[4]);
  setGeo(ppl.map(p=>({i:-1,la:p[1],lo:p[2],r:6,f:'#ffd36b',s:'#14110d',w:2})),[]);
  M.map.getSource('emp').setData({type:'FeatureCollection',features:emps.map(e=>({type:'Feature',geometry:{type:'Polygon',coordinates:[e[4].concat([e[4][0]])]},properties:{c:e[1]}}))});
  const seenL=new Set(); emps.forEach(e=>{ if(seenL.has(e[0])) return; seenL.add(e[0]); const m=label(e[5][0],e[5][1],e[0],'el'); m.getElement().style.color=e[1]});
  /* stack people who share a spot */
  const at={}; ppl.forEach(p=>{const k=p[1].toFixed(1)+','+p[2].toFixed(1); (at[k]=at[k]||[]).push(p)});
  Object.values(at).forEach(g=>label(g[0][1],g[0][2],g.map(p=>p[0]).join(' · '),null,()=>personSheet(g)));
  if(doFit&&ppl.length) fit(ppl.map(p=>[p[1],p[2]]),7);
  let ev=null; EVENTS.forEach(e=>{ if(Math.abs(e[0]-y)<=6&&(!ev||Math.abs(e[0]-y)<Math.abs(ev[0]-y))) ev=e});
  const names=[...new Set(emps.map(e=>e[0]))];
  $('#map-card').innerHTML=`<div class="t"><b style="color:#ffd36b;font-weight:400;font-size:22px">${yrTxt(y)}</b> ${ev?dim('· '+yrTxt(ev[0])+': '+esc(ev[1])):''}</div>
  <div class="d" style="max-height:5.6em">${ppl.length?'<b style="color:#ece2cc">'+[...new Set(ppl.map(p=>p[0]))].map(esc).join(' · ')+'</b>':'No one from the timeline is placed in this year.'}<br>${names.length?'Powers: '+emps.filter((e,i)=>emps.findIndex(x=>x[0]===e[0])===i).map(e=>`<span style="color:${e[1]}">■</span> ${esc(e[0])}`).join(' &nbsp;'):''}</div>
  <div class="ctl"><button data-act="myr" data-d="-1">‹</button><input type="range" min="-2180" max="100" step="5" value="${y}" data-inp="myrs" aria-label="Year"><button data-act="myr" data-d="1">›</button><button class="go" data-act="mtplay">${M.timer?'❚❚':'▶'}</button></div>
  <div class="map-eras">${ERAS.map(e=>`<button data-act="mera" data-y="${e[1]}">${esc(e[0])}</button>`).join('')}<button data-act="mtinfo">About the dates</button></div>`;
}
function setYr(y,doFit){ if(y===0) y=1; M.yr=Math.max(-2180,Math.min(100,y)); clearMarks(); drawTime(doFit) }
ACT.myrs=el=>{stopPlay(); M.yr=+el.value||1; clearMarks(); const keep=document.activeElement; drawTimeLight()};
/* while dragging: update everything except the slider itself, so the drag is not interrupted */
function drawTimeLight(){const sl=$('#map-card input[type=range]'), v=sl?sl.value:null; const y=M.yr; const emps=EMPIRES.filter(e=>y>=e[2]&&y<=e[3]), ppl=PEOPLE.filter(p=>y>=p[3]&&y<=p[4]);
  setGeo(ppl.map(p=>({i:-1,la:p[1],lo:p[2],r:6,f:'#ffd36b',s:'#14110d',w:2})),[]);
  M.map.getSource('emp').setData({type:'FeatureCollection',features:emps.map(e=>({type:'Feature',geometry:{type:'Polygon',coordinates:[e[4].concat([e[4][0]])]},properties:{c:e[1]}}))});
  const seenL=new Set(); emps.forEach(e=>{ if(seenL.has(e[0])) return; seenL.add(e[0]); const m=label(e[5][0],e[5][1],e[0],'el'); m.getElement().style.color=e[1]});
  const at={}; ppl.forEach(p=>{const k=p[1].toFixed(1)+','+p[2].toFixed(1); (at[k]=at[k]||[]).push(p)}); Object.values(at).forEach(g=>label(g[0][1],g[0][2],g.map(p=>p[0]).join(' · '),null,()=>personSheet(g)));
  let ev=null; EVENTS.forEach(e=>{ if(Math.abs(e[0]-y)<=6&&(!ev||Math.abs(e[0]-y)<Math.abs(ev[0]-y))) ev=e});
  const t=$('#map-card .t'), d=$('#map-card .d'); if(t) t.innerHTML=`<b style="color:#ffd36b;font-weight:400;font-size:22px">${yrTxt(y)}</b> ${ev?dim('· '+yrTxt(ev[0])+': '+esc(ev[1])):''}`;
  if(d) d.innerHTML=`${ppl.length?'<b style="color:#ece2cc">'+[...new Set(ppl.map(p=>p[0]))].map(esc).join(' · ')+'</b>':'No one from the timeline is placed in this year.'}<br>${emps.length?'Powers: '+emps.filter((e,i)=>emps.findIndex(x=>x[0]===e[0])===i).map(e=>`<span style="color:${e[1]}">■</span> ${esc(e[0])}`).join(' &nbsp;'):''}`}
ACT.myr=el=>{stopPlay(); let y=M.yr+(+el.dataset.d); if(y===0) y+=+el.dataset.d; setYr(y,false)};
ACT.mera=el=>{stopPlay(); setYr(+el.dataset.y,true)};
ACT.mtplay=()=>{ if(M.timer){stopPlay(); clearMarks(); drawTime(false); return} if(M.yr>=100) M.yr=-2180; M.timer=setInterval(()=>{ if(M.yr>=100){stopPlay(); clearMarks(); drawTime(false); return} M.yr=Math.min(100,M.yr+(M.yr>-60?2:10)); if(M.yr===0) M.yr=1; const sl=$('#map-card input[type=range]'); if(sl) sl.value=M.yr; clearMarks(); drawTimeLight()},700); clearMarks(); drawTime(false)};
ACT.mtinfo=()=>Sheet.open({title:'About the dates and borders',render(el){el.innerHTML=`<div class="prose"><p><b>Dates.</b> From David onward (about 1000 BC) dates are tied to Assyrian, Babylonian and Roman records and are good to within a few years.</p><p>Before that, this timeline follows the traditional chronology that counts back from Solomon's temple using 1 Kings 6:1 and Exodus 12:40. It puts the Exodus in 1446 BC and Abraham's birth in 2166 BC. Many scholars prefer an Exodus about 1260 BC, which moves Moses, Joshua and the early judges nearly two centuries later, and some doubt the early figures can be dated at all.</p><p><b>People.</b> Each person is shown at their main location for a span of years. Real lives had more movement than this.</p><p><b>Borders.</b> The shaded empires are rough sketches drawn for orientation. Ancient states did not have surveyed borders, and control at the edges came and went.</p></div>`}});
function personSheet(g){Sheet.open({title:[...new Set(g.map(p=>p[0]))].join(' · '),render(el){el.innerHTML=g.map(p=>`<div class="li"><div class="lbl">${yrTxt(p[3])}${p[4]!==p[3]?' to '+yrTxt(p[4]):''}</div><h3>${esc(p[0])}</h3><p>${esc(p[6])}</p><div class="row" style="margin-top:8px"><button class="btn sm" data-act="goref" data-ref="${p[5]}">Read ${esc(dotStr(p[5]))}</button><button class="btn sm" data-act="pfollow" data-n="${esc(p[0])}">Follow ${esc(p[0])} through time</button></div></div>`).join('')}})}
ACT.pfollow=el=>{const n=el.dataset.n, list=PEOPLE.filter(p=>p[0]===n); Sheet.open({title:n,render(e2){e2.innerHTML=list.map(p=>`<button class="li" data-act="mera" data-y="${p[3]}"><div class="lbl">${yrTxt(p[3])}${p[4]!==p[3]?' to '+yrTxt(p[4]):''}</div><p style="color:var(--ink);font-size:15px">${esc(p[6])}</p></button>`).join('')}})};
const _mera=ACT.mera; ACT.mera=el=>{Sheet.close(); _mera(el)};

/* ---------- battles ---------- */
ACT.mbat=()=>{stopPlay(); Sheet.open({title:'Battles on the real ground',render(el){el.innerHTML='<p class="note">Each battle is laid out on the actual terrain, step by step from the text. Unit positions are placed from the description and the lie of the land; they are reconstructions, not surveyed facts.</p>'+BATTLES.map(b=>`<button class="li" data-act="mb" data-id="${b.id}"><h3>${esc(b.t)}</h3><p>${esc(b.sub)} · ${b.s.length} steps</p></button>`).join('')}})};
ACT.mb=el=>{Sheet.close(); stopPlay(); M.mode='battle'; M.bt=BATTLES.find(b=>b.id===el.dataset.id); M.bs=0; M.tilt=true; drawMap(true)};
function batState(k){const st={}; for(let i=0;i<=k;i++){const p=M.bt.s[i][2]; for(const u in p){ if(p[u]===null) delete st[u]; else st[u]=p[u] }} return st}
function drawBattle(doFit){
  const b=M.bt, k=M.bs, cur=batState(k), prev=k>0?batState(k-1):{}, lines=[];
  b.u.forEach(u=>{const id=u[0], to=cur[id]; if(!to) return; const from=prev[id]||to, moved=from[0]!==to[0]||from[1]!==to[1];
    if(moved&&u[1]!=='n') lines.push({pts:[from,to],c:u[1]==='a'?'#8fc1ff':'#ff9a85',w:3,o:.9,d:1});
    const m=label(M.animate&&moved?from[0]:to[0],M.animate&&moved?from[1]:to[1],u[2],'bu '+u[1]); M.um[id]=m;
    if(M.animate&&moved){const t0=performance.now(), step=now=>{const t=Math.min(1,(now-t0)/1500), e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; m.setLngLat([from[1]+(to[1]-from[1])*e,from[0]+(to[0]-from[0])*e]); if(t<1&&M.um[id]===m) requestAnimationFrame(step)}; requestAnimationFrame(step)}});
  setGeo([],lines); M.animate=false;
  if(doFit){ if(k===0) M.map.flyTo({center:[b.c[1],b.c[0]],zoom:b.z,pitch:58,bearing:b.br,duration:1800}); else {const pts=Object.values(cur), bb=new maplibregl.LngLatBounds(); pts.forEach(p=>bb.extend([p[1],p[0]])); const cam=M.map.cameraForBounds(bb,{padding:60,maxZoom:b.z+.3}); if(cam) M.map.easeTo({center:cam.center,zoom:Math.min(cam.zoom,b.z+.3),pitch:58,bearing:b.br,duration:1400})} }
  const s=b.s[k], eye=b.u.find(u=>u[1]==='a'&&cur[u[0]]);
  $('#map-card').innerHTML=`<div class="t">${esc(b.t)} ${dim('· '+esc(dotStr(s[1])))}</div><div class="d" style="max-height:8.4em;font-size:13.5px;color:#ece2cc">${esc(s[0])}</div>
  <div class="ctl"><button data-act="mbs" data-d="-1" ${k?'':'disabled'}>‹</button><button class="go" data-act="mbplay">${M.playing?'❚❚':'▶'}</button><button data-act="mbs" data-d="1" ${k<b.s.length-1?'':'disabled'}>›</button><span style="flex:1;font-family:var(--sans);font-size:12px;color:#b9ad93;text-align:center">${k+1}/${b.s.length}</span>${eye?`<button data-act="mbview" data-u="${eye[0]}" style="width:auto;padding:0 12px;border-radius:21px;font-size:12.5px">What ${esc(eye[2].split(',')[0])} could see</button>`:''}${vbtn()}<button data-act="goref" data-ref="${s[1]}" aria-label="Read">¶</button></div>`;
}
ACT.mbs=el=>{stopPlay(); const n=M.bt.s.length, k=Math.max(0,Math.min(n-1,M.bs+(+el.dataset.d))); M.animate=k>M.bs; M.bs=k; clearMarks(); M.um={}; drawTop(); drawBattle(true); speak(M.bt.s[k][0])};
ACT.mbplay=async()=>{ if(M.playing){stopPlay(); clearMarks(); M.um={}; drawBattle(false); return} const n=M.bt.s.length; if(M.bs>=n-1) M.bs=0; const run=M.run=(M.run||0)+1; M.playing=true; clearMarks(); M.um={}; drawBattle(true);
  const tell=()=>M.voice?speak(M.bt.t&&M.bs===0?M.bt.t+'. '+M.bt.s[0][0]:M.bt.s[M.bs][0]).then(()=>wait(500)):wait(5200); await tell();
  while(M.run===run&&M.playing&&M.mode==='battle'&&M.bs<n-1){M.bs++; M.animate=true; clearMarks(); M.um={}; drawBattle(true); await tell()}
  if(M.run===run&&M.mode==='battle'){stopPlay(); clearMarks(); M.um={}; drawBattle(false)} };
ACT.mbview=el=>{const u=M.bt.u.find(x=>x[0]===el.dataset.u), p=batState(M.bs)[u[0]]; viewshed(p[0],p[1],u[2].split(',')[0]+"'s position")};

/* ---------- a word traced over the land ---------- */
async function mapOpenTrace(T){ if(!T) return; M.mode='trace'; M.tr=T; M.tf=0; stopPlay(); go('map'); await VIEW.map(); if(!M.map) return; drawMap(true) }
ACT.mtrback=()=>go('codes');
function drawTrace(doFit){
  const T=M.tr, P=M.P, line=[]; let last=-1; T.seq.forEach(s=>{ if(s[0]!==last){line.push([P[s[0]].la,P[s[0]].lo]); last=s[0]} });
  const feats=[]; T.counts.forEach((n,i)=>feats.push({i,la:P[i].la,lo:P[i].lo,r:4+Math.min(9,Math.sqrt(n)*1.6),f:'#e05a36',o:.92,s:'#fff',w:1.5})); feats.sort((a,b)=>b.r-a.r);
  const lines=[{pts:line,c:'#00f6ff',w:3,o:1,d:0}], f=T.find[M.tf];
  if(f&&f.k==='line'){const a=P[f.a], c=P[f.c], ex=.6; lines.push({pts:[[a.la-(c.la-a.la)*ex,a.lo-(c.lo-a.lo)*ex],[c.la+(c.la-a.la)*ex,c.lo+(c.lo-a.lo)*ex]],c:'#ff4fd8',w:3,o:.95,d:1}); [f.a,f.m,f.c].forEach(i=>label(P[i].la,P[i].lo,P[i].n,null,()=>placeSheet(i)))}
  else { [...T.counts].sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(x=>label(P[x[0]].la,P[x[0]].lo,P[x[0]].n,null,()=>placeSheet(x[0]))) }
  if(f&&f.k==='center') label(f.la,f.lo,'✛','jm cur');
  if(f&&f.k==='span'){const a=P[T.seq[0][0]], z=P[T.seq[T.seq.length-1][0]]; lines.push({pts:[[a.la,a.lo],[z.la,z.lo]],c:'#ff4fd8',w:3,o:.95,d:1}); label(a.la,a.lo,'first','jm cur'); label(z.la,z.lo,'last','jm cur')}
  setGeo(feats,lines);
  if(doFit){ if(f&&f.k==='line') fit([f.a,f.m,f.c].map(i=>[P[i].la,P[i].lo]),10); else fit(feats.map(x=>[x.la,x.lo]),9) }
  $('#map-card').innerHTML=`<div class="t">${esc(T.t)} ${dim('· '+T.n.toLocaleString()+' verses, '+T.counts.size+' places')}</div><div class="d" style="max-height:8.4em;color:#ece2cc;font-size:13.5px">${esc(f.long)}</div>
  <div class="ctl"><button data-act="mtf" data-d="-1">‹</button><button data-act="mtf" data-d="1">›</button><span style="flex:1;font-family:var(--sans);font-size:12px;color:#b9ad93;text-align:center">finding ${M.tf+1} of ${T.find.length}</span><button data-act="mtrback" style="width:auto;padding:0 14px;border-radius:21px;font-size:13px">New word</button></div>`;
}
ACT.mtf=el=>{const n=M.tr.find.length; M.tf=(M.tf+(+el.dataset.d)+n)%n; drawMap(true)};

/* ---------- generic display for the pattern lab ---------- */
async function mapOpenPat(o){Sheet.close(); M.mode='pat'; M.pat=o; M.pf=0; stopPlay(); go('map'); await VIEW.map(); if(!M.map) return; drawMap(true)}
ACT.mpback=()=>{go('codes'); C.tab='pat'; renderCodes(); const f=({lives:pLives,geo:pGeo,mirror:pMirror,sun:pSun,heat:pHeat})[M.pat.back]; if(f) f()};
function drawPat(doFit){const o=M.pat, f=o.finds[M.pf]||{};
  setGeo((o.feats||[]).map(x=>Object.assign({i:-1,s:'#fff',w:1.5},x)).sort((a,b)=>b.r-a.r),(o.lines||[]).concat(f.lines||[]).map(l=>Object.assign({w:3,o:1,d:0},l)));
  (f.labels||[]).forEach(l=>label(l[0],l[1],l[2],l[3]||null));
  if(doFit){const pts=f.fit||o.fit||(o.feats||[]).map(x=>[x.la,x.lo]); fit(pts,10)}
  $('#map-card').innerHTML=`<div class="t">${esc(o.t)}</div><div class="d" style="max-height:9.6em;color:#ece2cc;font-size:13.5px">${esc(f.long||'')}</div>
  <div class="ctl"><button data-act="mpf" data-d="-1">‹</button><button data-act="mpf" data-d="1">›</button><span style="flex:1;font-family:var(--sans);font-size:12px;color:#b9ad93;text-align:center">${M.pf+1} of ${o.finds.length}</span><button data-act="mpback" style="width:auto;padding:0 14px;border-radius:21px;font-size:13px">Back to the lab</button></div>`}
ACT.mpf=el=>{const n=M.pat.finds.length; M.pf=(M.pf+(+el.dataset.d)+n)%n; drawMap(true)};
