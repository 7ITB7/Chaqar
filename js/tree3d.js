'use strict';
/* The Tree: every person in the Bible with a known line, as name cards floating in 3D space.
   Data: Theographic Bible Metadata (CC BY-SA 4.0) plus tradition and legend branches added for this app. */
const T3={D:null,N:[],S:[],pos:null,ready:false,sel:null,path:null,scr:false,cam:{th:-.6,ph:1.25,d:40,t:[9,-3,-2]},run:false,q:'',art:[]};
const T3LAB={b:['Scripture','g'],t:['Ancient tradition','b'],l:['Medieval legend','b'],h:['Recorded history',''],x:['Modern invention','r']};
const T3COL={m:[.80,.80,1],f:[.96,.74,1],g:[.92,.92,1],t:[.66,.92,.9],l:[.84,.72,1],h:[.86,.88,.9],x:[1,.68,.62],s:[.62,.62,.66],sel:[.6,1,.62]};
const T3EDGE={m:[.08,.08,.78],f:[.55,.08,.72],g:[.4,.4,.8],t:[.05,.5,.5],l:[.38,.12,.7],h:[.4,.42,.46],x:[.7,.1,.08],s:[.3,.3,.34]};
const CW=6.4, CH=1.7, GX=9.2, MINY=2.5, MINZ=3.4;
/* paintings used as portraits beneath a few cards: person title -> index in paintings.json */
const T3PORT={'Adam':0,'Eve':1,'Cain':3,'Noah':4,'Nimrod':5,'Isaac':6,'Jacob':7,'Moses':9,'David':10,'Solomon':11,'Daniel':13,'Mary (Mother of Jesus)':14,'Jesus Christ':15,'Simon Peter':18,'John the Apostle':19};
VIEW.tree=async()=>{ if(!T3.D){ $('#tree-msg').textContent='Laying out the cards…'; const d=await J('tree3d.json'); if(!d){$('#tree-msg').textContent='Could not load the tree.';return} T3.D=d; try{t3Build()}catch(e){$('#tree-msg').textContent='This browser could not start the 3D view. It needs WebGL.'; console.error(e); return} $('#tree-msg').textContent=''; t3UI() } t3Resize(); if(!T3.run){T3.run=true; requestAnimationFrame(t3Frame)} };
const t3cat=r=>r[3]!=='b'?r[3]:(r[2]===1?'g':(r[4]?'f':'m'));
const t3yr=y=>y?(+y<0?(-y)+' BC':'AD '+y):'';

function t3Build(){
  const D=T3.D, N=D.n, n=N.length, kids=Array.from({length:n},()=>[]), depth=new Uint16Array(n), size=new Float32Array(n).fill(1), sizeB=new Float32Array(n);
  for(let k=0;k<n;k++){ if(N[k][1]>=0){kids[N[k][1]].push(k); depth[k]=depth[N[k][1]]+1} sizeB[k]=N[k][3]==='b'?1:0 }
  for(let k=n-1;k>0;k--){size[N[k][1]]+=size[k]; sizeB[N[k][1]]+=sizeB[k]}
  for(let k=0;k<n;k++) kids[k].sort((a,b)=>(sizeB[b]*1e4+size[b])-(sizeB[a]*1e4+size[a]));
  T3.kids=kids; T3.depth=depth;
  /* layout: generations run left to right. Children are stacked into the distance on even generations and downward on odd ones, which keeps 1,800 cards in a compact block */
  const SY=new Float32Array(n), SZ=new Float32Array(n), OY=new Float32Array(n), OZ=new Float32Array(n);
  for(let k=n-1;k>=0;k--){const C=kids[k]; if(!C.length){SY[k]=MINY; SZ[k]=MINZ; continue} let area=0, mz=0; for(const c of C){area+=SY[c]*SZ[c]; mz=Math.max(mz,SZ[c])}
    /* pack the children's blocks in rows, so each family fills a rough square instead of one long line */
    const lim=Math.max(mz,Math.sqrt(area)*1.2); let y=0, z=0, rowH=0, w=0; for(const c of C){ if(z>0&&z+SZ[c]>lim+.01){y+=rowH; z=0; rowH=0} OY[c]=y; OZ[c]=z; z+=SZ[c]; rowH=Math.max(rowH,SY[c]); w=Math.max(w,z)} SY[k]=Math.max(MINY,y+rowH); SZ[k]=Math.max(MINZ,w)}
  const pos=new Float32Array(n*3); for(let k=0;k<n;k++) for(const c of kids[k]){pos[c*3]=pos[k*3]+GX; pos[c*3+1]=pos[k*3+1]-OY[c]; pos[c*3+2]=pos[k*3+2]-OZ[c]}
  T3.pos=pos; const ext={x:0,y:0,z:0}; for(let k=0;k<n;k++){ext.x=Math.max(ext.x,pos[k*3]); ext.y=Math.min(ext.y,pos[k*3+1]); ext.z=Math.min(ext.z,pos[k*3+2])} T3.ext=ext;

  const cv=$('#tree3d'), rn=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:false}); rn.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); rn.setClearColor(0x161616); T3.rn=rn;
  const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0x161616,260,2400); T3.sc=sc; T3.camO=new THREE.PerspectiveCamera(46,1,.5,2500);
  /* one texture holds every card's lettering */
  const AW=4096, AH=2048, CWp=128, CHp=36, COLS=32, at=document.createElement('canvas'); at.width=AW; at.height=AH; const g=at.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,AW,AH); g.textBaseline='alphabetic';
  for(let k=0;k<n;k++){const r=N[k], cx=(k%COLS)*CWp, cy=Math.floor(k/COLS)*CHp; g.save(); g.beginPath(); g.rect(cx+2,cy,CWp-4,CHp); g.clip(); g.fillStyle='#14143a'; let nm=r[0].replace(/ \((patriarch|son of [^)]*|father of [^)]*|Son of [^)]*)\)/,''); g.font='600 13px system-ui,Arial,sans-serif'; if(g.measureText(nm).width>CWp-10) g.font='600 11px system-ui,Arial,sans-serif'; g.fillText(nm,cx+5,cy+15);
    g.font='9.5px system-ui,Arial,sans-serif'; g.fillStyle='#3a3a66'; const l2=r[3]!=='b'?T3LAB[r[3]][0]:(r[7]?'b. '+t3yr(r[7])+(r[8]?'  d. '+t3yr(r[8]):''):(r[2]===1?'line not given':'generation '+depth[k])); g.fillText(l2,cx+5,cy+28); g.restore()}
  const atlas=new THREE.CanvasTexture(at); atlas.anisotropy=Math.min(8,rn.capabilities.getMaxAnisotropy()); atlas.generateMipmaps=true; atlas.minFilter=THREE.LinearMipmapLinearFilter;
  const mk=()=>({p:[],c:[],u:[],i:[]}), G={b:mk(),x:mk()}, Ln={b:{p:[],c:[]},x:{p:[],c:[]}}, hw=CW/2, hh=CH/2;
  const quad=(B,a,b,c,d,uv,col)=>{const o=B.p.length/3; B.p.push(...a,...b,...c,...d); for(let i=0;i<4;i++) B.c.push(col[0],col[1],col[2]); B.u.push(...uv); B.i.push(o,o+1,o+2,o,o+2,o+3)};
  T3.cardRef=[];
  for(let k=0;k<n;k++){const r=N[k], cat=t3cat(r), B=r[3]==='b'?G.b:G.x, x=pos[k*3], y=pos[k*3+1], z=pos[k*3+2], u0=(k%COLS)*CWp/AW, v1=1-Math.floor(k/COLS)*CHp/AH, u1=u0+CWp/AW, v0=v1-CHp/AH, bl=[u0+.0005,v1-.0005];
    T3.cardRef.push([B===G.b?0:1,B.c.length]); quad(B,[x-hw,y-hh,z],[x+hw,y-hh,z],[x+hw,y+hh,z],[x-hw,y+hh,z],[u0,v0,u1,v0,u1,v1,u0,v1],T3COL[cat]);
    quad(B,[x+hw,y-hh,z],[x+hw,y-hh,z-.55],[x+hw,y+hh,z-.55],[x+hw,y+hh,z],[...bl,...bl,...bl,...bl],T3EDGE[cat]); quad(B,[x-hw,y-hh,z-.55],[x+hw,y-hh,z-.55],[x+hw,y-hh,z],[x-hw,y-hh,z],[...bl,...bl,...bl,...bl],T3EDGE[cat].map(v=>v*.7));
    const p=r[1]; if(p>=0){const L=r[3]==='b'?Ln.b:Ln.x, px=pos[p*3]+hw, py=pos[p*3+1], pz=pos[p*3+2]-.27, mx=x-hw-1.1, cz=z-.27, lc=r[3]==='b'?(r[2]===1?[.42,.42,.42]:[.82,.82,.82]):[.55,.5,.75]; L.p.push(px,py,pz,mx,py,pz, mx,py,pz,mx,y,cz, mx,y,cz,x-hw,y,cz); for(let i=0;i<6;i++) L.c.push(...lc)}}
  const mesh=B=>{const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3)); ge.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3)); ge.setAttribute('uv',new THREE.Float32BufferAttribute(B.u,2)); ge.setIndex(B.i); return new THREE.Mesh(ge,new THREE.MeshBasicMaterial({map:atlas,vertexColors:true,side:THREE.DoubleSide}))};
  const lines=L=>{const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(L.p,3)); ge.setAttribute('color',new THREE.Float32BufferAttribute(L.c,3)); return new THREE.LineSegments(ge,new THREE.LineBasicMaterial({vertexColors:true}))};
  T3.cards=[mesh(G.b),mesh(G.x)]; T3.links=[lines(Ln.b),lines(Ln.x)]; sc.add(...T3.cards,...T3.links);
  /* people with no recorded line: a wall of small grey cards behind the chart */
  const S=D.s, sn=S.length, sp=new Float32Array(sn*3), SB=mk(), COLS2=56; for(let i=0;i<sn;i++){const x=(i%COLS2)*3.5, y=ext.y-24-Math.floor(i/COLS2)*1.5, z=0; sp[i*3]=x; sp[i*3+1]=y; sp[i*3+2]=z; const w=1.5, h=.55, c=S[i][1]?[.6,.5,.62]:T3COL.s, bl=[.0002,.9998]; quad(SB,[x-w,y-h,z],[x+w,y-h,z],[x+w,y+h,z],[x-w,y+h,z],[...bl,...bl,...bl,...bl],c)}
  T3.seedPos=sp; T3.seeds=mesh(SB); sc.add(T3.seeds);
  /* portraits: a painting hung beneath a few cards */
  J('paintings.json').then(A=>{ if(!A) return; const ld=new THREE.TextureLoader(); ld.setCrossOrigin('anonymous'); Object.keys(T3PORT).forEach(name=>{const k=N.findIndex(r=>r[0]===name), a=A[T3PORT[name]]; if(k<0||!a) return; const asp=a.h/a.w, W=Math.min(CW-.4,asp>1?3.6:6), H=W*asp, m=new THREE.MeshBasicMaterial({color:0x2a2a2a,side:THREE.DoubleSide}), pl=new THREE.Mesh(new THREE.PlaneGeometry(W,H),m); pl.position.set(pos[k*3]-hw+W/2+.2,pos[k*3+1]-hh-H/2-.15,pos[k*3+2]+.02); sc.add(pl); T3.art.push({a,k}); ld.load(a.u.replace(/\/\d+px-/,'/500px-'),t=>{m.map=t; m.color.setHex(0xffffff); m.needsUpdate=true; T3.dirty=true},undefined,()=>{})})});
  T3.N=N; T3.S=S; T3.ready=true; t3Controls(cv);
}
function t3Resize(){ if(!T3.rn) return; const el=$('#v-tree'), w=el.clientWidth, h=el.clientHeight; if(!w||!h) return; T3.rn.setSize(w,h,false); T3.camO.aspect=w/h; T3.camO.updateProjectionMatrix(); T3.W=w; T3.H=h; T3.dirty=true }
window.addEventListener('resize',()=>{ if(curTab==='tree') t3Resize() });
function t3Frame(now){ if(curTab!=='tree'||!T3.ready){T3.run=false; return} requestAnimationFrame(t3Frame); const c=T3.cam;
  if(T3.fly){const f=T3.fly, t=Math.min(1,(now-f.t0)/f.dur), e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; for(let i=0;i<3;i++) c.t[i]=f.a[i]+(f.b[i]-f.a[i])*e; c.d=f.d0+(f.d1-f.d0)*e; if(f.th!=null){c.th=f.th0+(f.th-f.th0)*e; c.ph=f.ph0+(f.ph-f.ph0)*e} if(t>=1) T3.fly=null; T3.dirty=true}
  if(T3.spin){c.th+=.0025; T3.dirty=true}
  if(T3.hold){c.t[0]=Math.max(-10,Math.min(T3.ext.x+10,c.t[0]+T3.hold*c.d*.014)); T3.dirty=true}
  if(!T3.dirty) return; T3.dirty=false; c.ph=Math.max(.15,Math.min(2.95,c.ph)); c.d=Math.max(5,Math.min(1400,c.d)); const o=T3.camO;
  o.position.set(c.t[0]+c.d*Math.sin(c.ph)*Math.sin(c.th),c.t[1]+c.d*Math.cos(c.ph),c.t[2]+c.d*Math.sin(c.ph)*Math.cos(c.th)); o.lookAt(c.t[0],c.t[1],c.t[2]); T3.rn.render(T3.sc,o);
  if(!T3.lt||now-T3.lt>120){T3.lt=now; t3Labels()} else T3.again=true; }
setInterval(()=>{ if(T3.again&&curTab==='tree'&&T3.ready){T3.again=false; t3Labels()} },260);
function t3Project(x,y,z,out){const v=T3.v||(T3.v=new THREE.Vector3()); v.set(x,y,z).project(T3.camO); out[0]=(v.x+1)/2*T3.W; out[1]=(1-v.y)/2*T3.H; out[2]=v.z; return v.z<1&&v.z>-1}
function t3Labels(){const box=$('#tree-labels'); if(!box) return; const N=T3.N, pos=T3.pos, o=[0,0,0], cp=T3.camO.position, cand=[], path=T3.path?new Set(T3.path):null, lim=Math.max(60,T3.cam.d*2.2);
  const consider=(name,x,y,z,vc,key,boost,cat)=>{const d=Math.hypot(x-cp.x,y-cp.y,z-cp.z); if(d>lim&&!boost) return; if(!t3Project(x,y,z,o)) return; if(o[0]<-20||o[0]>T3.W+20||o[1]<46||o[1]>T3.H-150) return; cand.push([boost+(vc+4)/(d*d+4),o[0],o[1],name,key,cat])};
  for(let k=0;k<N.length;k++){ if(T3.scr&&N[k][3]!=='b') continue; consider(N[k][0],pos[k*3],pos[k*3+1],pos[k*3+2],N[k][5]+(N[k][3]!=='b'?12:0),k,(k===T3.sel?1e6:0)+(path&&path.has(k)?1e3:0),N[k][3])}
  for(let i=0;i<T3.S.length;i++) consider(T3.S[i][0],T3.seedPos[i*3],T3.seedPos[i*3+1],T3.seedPos[i*3+2],T3.S[i][2],-1-i,(-1-i===T3.sel?1e6:0),'s');
  cand.sort((a,b)=>b[0]-a[0]); const used=new Set(), out=[]; for(const c of cand){ if(out.length>=34) break; const gx=Math.floor(c[1]/96), gy=Math.floor(c[2]/20), k=gx*1000+gy; if(used.has(k)||used.has(k+1000)||used.has(k-1000)) continue; used.add(k); out.push(c)}
  box.innerHTML=out.map(c=>`<span class="${c[4]===T3.sel?'sel':''} c${c[5]}" style="left:${c[1].toFixed(0)}px;top:${c[2].toFixed(0)}px">${esc(c[3].replace(/ \(.*/,''))}</span>`).join('') }

function t3Controls(cv){const pts=new Map(); let moved=0, t0=0, lastD=0, lastM=null;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId); pts.set(e.pointerId,[e.clientX,e.clientY]); if(pts.size===1){moved=0; t0=performance.now()} lastD=0; lastM=null; T3.spin=false; T3.fly=null});
  cv.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId); if(!p) return; const dx=e.clientX-p[0], dy=e.clientY-p[1]; pts.set(e.pointerId,[e.clientX,e.clientY]); const c=T3.cam;
    if(pts.size===1){moved+=Math.abs(dx)+Math.abs(dy); c.th-=dx*.006; c.ph-=dy*.005; T3.dirty=true}
    else if(pts.size===2){const a=[...pts.values()], d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]), m=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]; if(lastD){c.d*=lastD/d; const k=c.d*.0016, mx=m[0]-lastM[0], my=m[1]-lastM[1]; c.t[0]-=Math.cos(c.th)*mx*k; c.t[2]+=Math.sin(c.th)*mx*k; c.t[1]+=my*k} lastD=d; lastM=m; moved+=9; T3.dirty=true}});
  const end=e=>{const had=pts.has(e.pointerId); pts.delete(e.pointerId); lastD=0; lastM=null; if(had&&pts.size===0&&moved<9&&performance.now()-t0<450) t3Pick(e)}; cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId)});
  cv.addEventListener('wheel',e=>{e.preventDefault(); T3.cam.d*=e.deltaY>0?1.1:.9; T3.dirty=true},{passive:false}) }
function t3Pick(e){const r=$('#tree3d').getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top, o=[0,0,0]; let best=null, bd=36*36; const tryP=(px,py,pz,key)=>{ if(!t3Project(px,py,pz,o)) return; const d=(o[0]-x)**2+(o[1]-y)**2+o[2]*40; if(d<bd){bd=d; best=key}};
  for(let k=0;k<T3.N.length;k++){ if(T3.scr&&T3.N[k][3]!=='b') continue; tryP(T3.pos[k*3],T3.pos[k*3+1],T3.pos[k*3+2],k)} for(let i=0;i<T3.S.length;i++) tryP(T3.seedPos[i*3],T3.seedPos[i*3+1],T3.seedPos[i*3+2],-1-i);
  if(best!=null) t3Open(best) }
const t3P=k=>k>=0?[T3.pos[k*3],T3.pos[k*3+1],T3.pos[k*3+2]]:[T3.seedPos[(-1-k)*3],T3.seedPos[(-1-k)*3+1],T3.seedPos[(-1-k)*3+2]];
function t3Fly(k,dist){const c=T3.cam; T3.fly={a:c.t.slice(),b:t3P(k),d0:c.d,d1:dist||Math.min(Math.max(c.d,22),34),t0:performance.now(),dur:1000}; T3.dirty=true}
function t3Line(k){const out=[]; while(k>=0){out.unshift(k); k=T3.N[k][1]} return out}
/* recolour one card */
function t3Tint(k,col){const ref=T3.cardRef[k], at=T3.cards[ref[0]].geometry.getAttribute('color'); for(let i=0;i<4;i++) at.setXYZ(ref[1]/3+i,col[0],col[1],col[2]); at.needsUpdate=true}
function t3SetPath(k){ if(T3.path) T3.path.forEach(i=>t3Tint(i,T3COL[t3cat(T3.N[i])])); if(T3.pathMesh){T3.sc.remove(T3.pathMesh); T3.pathMesh.geometry.dispose(); T3.pathMesh=null}
  T3.path=k==null?null:t3Line(k); if(T3.path){T3.path.forEach(i=>t3Tint(i,T3COL.sel)); const P=[], hw=CW/2; for(let j=1;j<T3.path.length;j++){const a=t3P(T3.path[j-1]), b=t3P(T3.path[j]), mx=b[0]-hw-1.1; P.push(a[0]+hw,a[1],a[2]-.2,mx,a[1],a[2]-.2, mx,a[1],a[2]-.2,mx,b[1],b[2]-.2, mx,b[1],b[2]-.2,b[0]-hw,b[1],b[2]-.2)} const ge=new THREE.BufferGeometry(); ge.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); T3.pathMesh=new THREE.LineSegments(ge,new THREE.LineBasicMaterial({color:0x66ff77,depthTest:false,transparent:true})); T3.pathMesh.renderOrder=5; T3.sc.add(T3.pathMesh)} T3.dirty=true; t3UI()}
function t3Open(k){T3.sel=k; T3.dirty=true; const seed=k<0, r=seed?T3.S[-1-k]:T3.N[k];
  Sheet.open({title:r[0],render(el){ let h='';
    if(seed){h=`<span class="tag">No line recorded</span><p class="def" style="margin:10px 0">${r[4]?esc(r[4]):'The Bible names this person without giving a father or tribe, so they cannot be joined to the chart.'}</p>${r[6]?`<p class="note">${esc(r[6])}</p>`:''}<p class="sub">${r[2]} verse${r[2]===1?'':'s'}${r[5]?' · Married: '+esc(r[5]):''}</p><div class="row">${r[3]?`<button class="btn sm" data-act="goref" data-ref="${r[3]}">Read ${esc(dotStr(r[3]))}</button>`:''}</div>`}
    else {const cat=r[3], L=T3LAB[cat], ln=t3Line(k), par=r[1]>=0?T3.N[r[1]]:null, kids=T3.kids[k], port=T3.art.find(a=>a.k===k);
      h=`<span class="tag ${L[1]}">${L[0]}</span>${r[2]===1?'<span class="tag">Line not given</span>':''}${r[4]?'<span class="tag">Woman</span>':''}<div class="lbl" style="margin-top:10px">${ln.length-1} generation${ln.length===2?'':'s'} from Adam on this chart${r[9]?' · also called '+esc(r[9].split(',').slice(0,6).map(w=>w.trim().charAt(0)+w.trim().slice(1).toLowerCase()).join(', ')):''}</div>
      ${port?`<div class="viewer" style="margin:12px 0"><img src="${esc(port.a.u)}" alt=""></div><p class="sub">${esc(port.a.t)}, ${esc(port.a.a)}, ${esc(port.a.y)}. <a href="${esc(port.a.p)}" target="_blank" rel="noopener">Source</a></p>`:''}
      ${r[10]?`<p class="def" style="margin:10px 0">${esc(r[10])}</p>`:''}${r[11]?`<p class="note">${esc(r[11])}</p>`:''}
      ${r[2]===1?`<p class="note">The Bible gives this person's tribe or nation but not the line of descent, so the card is joined directly to ${esc(par[0])}. Some of these placements were made automatically from a dictionary description and can be wrong.</p>`:''}
      <p class="sub">${cat==='b'?r[5]+' verse'+(r[5]===1?'':'s'):''}${r[7]?' · born '+t3yr(r[7]):''}${r[8]?' · died '+t3yr(r[8]):''}${r[12]?' · Mother: '+esc(r[12]):''}${r[13]?' · Married: '+esc(r[13]):''}</p>
      <div class="row" style="margin:8px 0"><button class="btn sm pri" data-act="t3trace" data-k="${k}">Light the line to Adam</button>${r[6]?`<button class="btn sm" data-act="goref" data-ref="${r[6]}">Read ${esc(dotStr(r[6]))}</button>`:''}</div>
      ${par?`<div class="lbl" style="margin-top:12px">${r[2]===2?'Formed from':r[2]===1?'Joined to':'Parent'}</div><div class="chips" style="margin-top:6px"><button class="chip" data-act="t3go" data-k="${r[1]}">${esc(par[0])}</button></div>`:''}
      ${kids.length?`<div class="lbl" style="margin-top:12px">Children on the chart (${kids.length})</div><div class="chips" style="margin-top:6px">${kids.slice(0,60).map(c=>`<button class="chip" data-act="t3go" data-k="${c}">${esc(T3.N[c][0])}</button>`).join('')}</div>`:''}
      ${r[7]&&cat==='b'?'<p class="note" style="margin-top:14px">Years follow the traditional chronology used by the source dataset. Early dates are disputed.</p>':''}`}
    el.innerHTML=h}}); t3Fly(k) }
ACT.t3go=el=>t3Open(+el.dataset.k);
ACT.t3trace=el=>{const k=+el.dataset.k; Sheet.close(); t3SetPath(k); const ln=T3.path, c=T3.cam, a=t3P(ln[0]), b=t3P(k); T3.fly={a:c.t.slice(),b:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],d0:c.d,d1:Math.max(60,Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])*.75),t0:performance.now(),dur:1300}; toast(`${ln.length-1} generations from Adam`)};
function t3UI(){
  $('#tree-top').innerHTML=`<input class="inp" id="t3q" placeholder="Find anyone: Ruth, Caleb, Woden…" data-inp="t3find" value="${esc(T3.q)}" autocomplete="off"><div id="t3res"></div>`;
  $('#tree-bar').innerHTML=`<div class="map-eras">${[['Whole chart',-1],['Adam',0],['Noah','Noah'],['Abraham','Abraham'],['Jacob','Jacob'],['Moses','Moses'],['David','David'],['Jesus','Jesus Christ'],['No line recorded',-2]].map(x=>`<button data-act="t3jump" data-k="${x[1]}">${x[0]}</button>`).join('')}</div>
  <div class="ctl"><button data-act="t3spin" aria-label="Turn slowly">⟳</button><button data-hold="-1" aria-label="Earlier generations">◀</button><button data-hold="1" aria-label="Later generations">▶</button><button data-act="t3scr" style="width:auto;padding:0 12px;border-radius:21px;font-size:12.5px" class="${T3.scr?'go':''}">Scripture only</button>${T3.path?'<button data-act="t3clear" style="width:auto;padding:0 12px;border-radius:21px;font-size:12.5px">Clear line</button>':''}<span style="flex:1"></span><button data-act="t3key" aria-label="Key">?</button></div>`;
  $$('#tree-bar [data-hold]').forEach(b=>{const on=e=>{e.preventDefault(); T3.hold=+b.dataset.hold; T3.dirty=true}, off=()=>{T3.hold=0}; b.addEventListener('pointerdown',on); b.addEventListener('pointerup',off); b.addEventListener('pointerleave',off); b.addEventListener('pointercancel',off)}) }
ACT.t3spin=()=>{T3.spin=!T3.spin; T3.dirty=true};
ACT.t3scr=()=>{T3.scr=!T3.scr; T3.cards[1].visible=!T3.scr; T3.links[1].visible=!T3.scr; T3.dirty=true; t3UI(); toast(T3.scr?'Showing only what the Bible states':'Tradition and legend cards shown')};
ACT.t3clear=()=>t3SetPath(null);
ACT.t3jump=el=>{const k=el.dataset.k, c=T3.cam, E=T3.ext, now=performance.now(); if(k==='-1'){T3.fly={a:c.t.slice(),b:[E.x*.42,E.y*.4,E.z*.4],d0:c.d,d1:Math.max(E.x,-E.y,-E.z)*1.05,th0:c.th,ph0:c.ph,th:-.7,ph:1.2,t0:now,dur:1300}; return} if(k==='-2'){T3.fly={a:c.t.slice(),b:[95,E.y-43,0],d0:c.d,d1:150,th0:c.th,ph0:c.ph,th:0,ph:1.45,t0:now,dur:1300}; return}
  const i=k==='0'?0:T3.N.findIndex(n=>n[0]===k); if(i>=0){T3.sel=i; T3.fly={a:c.t.slice(),b:t3P(i),d0:c.d,d1:38,th0:c.th,ph0:c.ph,th:-.75,ph:1.25,t0:now,dur:1200}; T3.dirty=true}};
ACT.t3find=el=>{T3.q=el.value; const q=el.value.trim().toLowerCase(), out=$('#t3res'); if(q.length<2){out.innerHTML='';return} const res=[]; T3.N.forEach((n,k)=>{ if(n[0].toLowerCase().includes(q)) res.push([n[0].toLowerCase().startsWith(q)?1e4+n[5]:n[5],k,n[0],T3LAB[n[3]][0]])}); T3.S.forEach((s,i)=>{ if(s[0].toLowerCase().includes(q)) res.push([(s[0].toLowerCase().startsWith(q)?1e4:0)+s[2],-1-i,s[0],'no line recorded'])});
  res.sort((a,b)=>b[0]-a[0]); out.innerHTML=res.slice(0,8).map(r=>`<button data-act="t3pick" data-k="${r[1]}">${esc(r[2])}<small>${r[3]}</small></button>`).join('')||'<button disabled>No one by that name</button>'};
ACT.t3pick=el=>{$('#t3res').innerHTML=''; $('#t3q').blur(); t3Open(+el.dataset.k)};
ACT.t3key=()=>Sheet.open({title:'Reading the chart',render(el){const N=T3.N, cnt=c=>N.filter(n=>n[3]===c).length, sw=c=>`<span style="display:inline-block;width:22px;height:12px;border-radius:2px;vertical-align:-1px;margin-right:6px;background:rgb(${c.map(v=>Math.round(v*255)).join(',')})"></span>`;
  el.innerHTML=`<div class="prose"><p>Adam is the first card on the left. Each step to the right is one generation. A person's children are stacked either into the distance or downward, turn and turn about, which is what keeps the chart compact.</p></div>
  <div class="li"><h3>${sw(T3COL.m)}Scripture, men ${sw(T3COL.f)}women <small>${cnt('b').toLocaleString()} people</small></h3><p>People whose descent the Bible states.</p></div>
  <div class="li"><h3>${sw(T3COL.g)}Line not given <small>${N.filter(n=>n[2]===1&&n[3]==='b').length}</small></h3><p>The tribe or nation is known but the exact line is not. Joined straight to the tribe's founder with a dim connector.</p></div>
  <div class="li"><h3>${sw(T3COL.t)}Ancient tradition <small>${cnt('t')}</small></h3><p>Jubilees, Josephus, the Talmud, the early church and Islamic genealogy.</p></div>
  <div class="li"><h3>${sw(T3COL.l)}Medieval legend <small>${cnt('l')}</small></h3><p>Pedigrees that tied the kings of Wessex, the Irish, Armenians, Georgians and Ethiopians to Noah and Solomon.</p></div>
  <div class="li"><h3>${sw(T3COL.h)}Recorded history <small>${cnt('h')}</small></h3><p>Documented people who appear only because a legendary pedigree leads to them, down to the present British royal family.</p></div>
  <div class="li"><h3>${sw(T3COL.x)}Modern invention <small>${cnt('x')}</small></h3><p>Claims with no ancient source, labeled for what they are.</p></div>
  <div class="li"><h3>${sw(T3COL.s)}No line recorded <small>${T3.S.length.toLocaleString()}</small></h3><p>People the Bible names without a father or tribe, set on a separate wall of small cards.</p></div>
  <div class="li"><h3>${sw(T3COL.sel)}A lit line</h3><p>The path from a chosen person back to Adam.</p></div>
  <p class="note">One finger turns the chart. Two fingers zoom and slide. The arrows move through the generations. A few cards carry a painting as a portrait.</p>
  <p class="sub">Biblical people and family links: Theographic Bible Metadata by Robert Rouse and contributors, CC BY-SA 4.0, with Easton's Bible Dictionary (1897). Tradition, legend and history cards were added for this app. Paintings: public domain, Wikimedia Commons.</p>`}});
