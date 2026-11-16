'use strict';
/* The Tree: every person in the Bible with a known line, grown as one tree in a garden.
   Data: Theographic Bible Metadata (CC BY-SA 4.0) plus tradition and legend branches added for this app. */
const T3={D:null,N:[],S:[],pos:null,ready:false,sel:null,path:null,scr:false,cam:{th:.6,ph:1.25,d:120,t:[0,40,0]},run:false,q:''};
const T3C={b:0xf2c14e,t:0x6fb7ff,l:0xb98cff,h:0xdfe6ee,x:0xff5a4d}, T3BARK={b:[.36,.25,.15],t:[.32,.42,.55],l:[.45,.36,.58],h:[.62,.64,.68],x:[.62,.26,.22]};
const T3LAB={b:['Scripture','g'],t:['Ancient tradition','b'],l:['Medieval legend','b'],h:['Recorded history',''],x:['Modern invention','r']};
VIEW.tree=async()=>{ const el=$('#tree3d'); if(!T3.D){ $('#tree-msg').textContent='Growing the tree…'; const d=await J('tree3d.json'); if(!d){$('#tree-msg').textContent='Could not load the tree.';return} T3.D=d; try{t3Build()}catch(e){$('#tree-msg').textContent='This browser could not start the 3D view. It needs WebGL.'; console.error(e); return} $('#tree-msg').textContent=''; t3UI() } t3Resize(); if(!T3.run){T3.run=true; requestAnimationFrame(t3Frame)} };

function t3Build(){
  const D=T3.D, N=D.n, n=N.length, kids=Array.from({length:n},()=>[]), size=new Float32Array(n).fill(1), sizeB=new Float32Array(n), h=new Uint16Array(n), depth=new Uint16Array(n);
  for(let k=0;k<n;k++){ if(N[k][1]>=0){kids[N[k][1]].push(k); depth[k]=depth[N[k][1]]+1} sizeB[k]=N[k][3]==='b'?1:0 }
  for(let k=n-1;k>0;k--){const p=N[k][1]; size[p]+=size[k]; sizeB[p]+=sizeB[k]; h[p]=Math.max(h[p],h[k]+1)}
  T3.kids=kids; T3.depth=depth; T3.size=size;
  /* seeded random so the tree is the same every visit */
  let sd=7; const rnd=()=>{sd=(sd*16807)%2147483647; return sd/2147483647};
  const pos=new Float32Array(n*3), dir=new Float32Array(n*3), rad=new Float32Array(n), V=THREE.Vector3, up=new V(0,1,0);
  pos[1]=3.2; dir[1]=1; const R=k=>Math.min(2.2,Math.max(.035,.05*Math.pow(size[k],.46))); rad[0]=R(0);
  const order=[0];
  for(let qi=0;qi<order.length;qi++){const k=order[qi], C=kids[k].slice().sort((a,b)=>(sizeB[b]*1000+h[b])-(sizeB[a]*1000+h[a])), d=new V(dir[k*3],dir[k*3+1],dir[k*3+2]), p=new V(pos[k*3],pos[k*3+1],pos[k*3+2]);
    /* a frame around the branch direction */
    const ax=Math.abs(d.y)<.95?new V().crossVectors(d,up).normalize():new V(1,0,0), ay=new V().crossVectors(d,ax).normalize(), base=rnd()*6.283, main=C[0];
    C.forEach((c,j)=>{let tilt, len; const leaf=size[c]<=1;
      if(j===0&&(size[c]>2||C.length===1)){tilt=(4+rnd()*9)*Math.PI/180; len=.82+rnd()*.2}
      else {const rel=Math.min(1,size[c]/Math.max(1,size[main])); tilt=(leaf?58+rnd()*24:36+30*(1-rel)+rnd()*8)*Math.PI/180; len=leaf?.7+rnd()*.5:Math.min(5.2,1.3+.85*Math.log2(1+size[c]))}
      const az=base+j*2.39996, v=new V().copy(d).multiplyScalar(Math.cos(tilt)).addScaledVector(ax,Math.sin(tilt)*Math.cos(az)).addScaledVector(ay,Math.sin(tilt)*Math.sin(az));
      v.addScaledVector(up,j===0?.1:.2).normalize(); if(v.y<-.15){v.y=-.15; v.normalize()}
      dir[c*3]=v.x; dir[c*3+1]=v.y; dir[c*3+2]=v.z; pos[c*3]=p.x+v.x*len; pos[c*3+1]=p.y+v.y*len; pos[c*3+2]=p.z+v.z*len; rad[c]=Math.min(R(c),rad[k]*.97); order.push(c)})}
  T3.pos=pos; let top=0, wide=0; for(let k=0;k<n;k++){top=Math.max(top,pos[k*3+1]); wide=Math.max(wide,Math.hypot(pos[k*3],pos[k*3+2]))} T3.top=top; T3.wide=wide;

  const cv=$('#tree3d'), rn=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true}); rn.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); T3.rn=rn;
  const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xe9e4c6,top*1.2,top*4.2); T3.sc=sc; T3.camO=new THREE.PerspectiveCamera(50,1,.1,2000);
  sc.add(new THREE.HemisphereLight(0xfff4d6,0x3c5a34,.95)); const sun=new THREE.DirectionalLight(0xfff0c8,.9); sun.position.set(60,120,40); sc.add(sun);
  /* the garden */
  const gnd=new THREE.Mesh(new THREE.CircleGeometry(520,72),new THREE.MeshLambertMaterial({color:0x5e9a4a})); gnd.rotation.x=-Math.PI/2; sc.add(gnd);
  const lawn=new THREE.Mesh(new THREE.CircleGeometry(58,64),new THREE.MeshLambertMaterial({color:0x79b55a})); lawn.rotation.x=-Math.PI/2; lawn.position.y=.02; sc.add(lawn);
  const water=new THREE.MeshLambertMaterial({color:0x4fa8d8,emissive:0x12405c}); [0,1,2,3].forEach(i=>{const a=i*Math.PI/2+.5, r=new THREE.Mesh(new THREE.PlaneGeometry(7,460),water); r.rotation.x=-Math.PI/2; r.rotation.z=-a; r.position.set(Math.sin(a)*290,.05,Math.cos(a)*290); sc.add(r)});
  const spring=new THREE.Mesh(new THREE.CircleGeometry(62,48,0,6.283),water); spring.rotation.x=-Math.PI/2; spring.position.y=.03; spring.scale.set(1,1,1); const ring=new THREE.Mesh(new THREE.RingGeometry(58,64,64),water); ring.rotation.x=-Math.PI/2; ring.position.y=.04; sc.add(ring);
  const cone=new THREE.ConeGeometry(1,2.4,7), far=new THREE.InstancedMesh(cone,new THREE.MeshLambertMaterial({color:0x3f7f3c}),260), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), s3=new V(), p3=new V();
  for(let i=0;i<260;i++){const a=rnd()*6.283, r=95+rnd()*360, s=4+rnd()*9; p3.set(Math.cos(a)*r,s*1.2,Math.sin(a)*r); s3.set(s,s,s); m4.compose(p3,q,s3); far.setMatrixAt(i,m4); far.setColorAt(i,new THREE.Color().setHSL(.28+rnd()*.08,.45,.26+rnd()*.14))} sc.add(far);

  /* bark: one tapered tube per person, merged */
  const SEG=6, mk=()=>({p:[],c:[],i:[]}), bark={s:mk(),x:mk()}, a3=new V(), b3=new V(), u3=new V(), w3=new V(), t3=new V();
  const tube=(G,x0,y0,z0,r0,x1,y1,z1,r1,col)=>{a3.set(x0,y0,z0); b3.set(x1,y1,z1); t3.subVectors(b3,a3).normalize(); u3.crossVectors(t3,Math.abs(t3.y)<.9?up:new V(1,0,0)).normalize(); w3.crossVectors(t3,u3); const o=G.p.length/3;
    for(let e=0;e<2;e++){const P=e?b3:a3, r=e?r1:r0; for(let s=0;s<SEG;s++){const an=s/SEG*6.283, cx=Math.cos(an)*r, cy=Math.sin(an)*r; G.p.push(P.x+u3.x*cx+w3.x*cy,P.y+u3.y*cx+w3.y*cy,P.z+u3.z*cx+w3.z*cy); const sh=.82+.36*((s%2)?.4:1)*(e?1:.9); G.c.push(col[0]*sh,col[1]*sh,col[2]*sh)}}
    for(let s=0;s<SEG;s++){const s2=(s+1)%SEG; G.i.push(o+s,o+s2,o+SEG+s, o+s2,o+SEG+s2,o+SEG+s)}};
  tube(bark.s,0,-.4,0,rad[0]*1.9,0,3.2,0,rad[0],T3BARK.b);
  for(let k=1;k<n;k++){const p=N[k][1], cat=N[k][3], inferred=N[k][2]===1, col=cat==='b'?(inferred?[.5,.42,.3]:T3BARK.b):T3BARK[cat]; tube(cat==='b'?bark.s:bark.x,pos[p*3],pos[p*3+1],pos[p*3+2],Math.min(rad[p],rad[k]*1.25),pos[k*3],pos[k*3+1],pos[k*3+2],rad[k]*.92,col)}
  const mesh=G=>{const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(G.p,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(G.c,3)); g.setIndex(G.i); g.computeVertexNormals(); return new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}))};
  T3.barkS=mesh(bark.s); T3.barkX=mesh(bark.x); sc.add(T3.barkS,T3.barkX);
  /* fruit: one per person */
  const fr=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshLambertMaterial({}),n), col=new THREE.Color(); T3.fs=new Float32Array(n);
  for(let k=0;k<n;k++){const s=Math.min(.6,.13+.045*Math.log2(1+N[k][5])+(N[k][3]!=='b'?.05:0)); T3.fs[k]=s; p3.set(pos[k*3],pos[k*3+1],pos[k*3+2]); s3.set(s,s,s); m4.compose(p3,q,s3); fr.setMatrixAt(k,m4); col.setHex(N[k][3]==='b'?(N[k][4]?0xff9db5:T3C.b):T3C[N[k][3]]); fr.setColorAt(k,col)} T3.fruit=fr; sc.add(fr);
  /* leaves on the outer twigs */
  const LN=[]; for(let k=0;k<n;k++) if(size[k]<=4&&N[k][3]==='b') for(let j=0;j<(size[k]<=1?4:2);j++) LN.push(k);
  const lf=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1.5),new THREE.MeshLambertMaterial({side:THREE.DoubleSide}),LN.length), e3=new THREE.Euler();
  LN.forEach((k,i)=>{p3.set(pos[k*3]+(rnd()-.5)*1.1,pos[k*3+1]+(rnd()-.3)*1,pos[k*3+2]+(rnd()-.5)*1.1); e3.set(rnd()*3,rnd()*6,rnd()*3); q.setFromEuler(e3); const s=.35+rnd()*.4; s3.set(s,s,s); m4.compose(p3,q,s3); lf.setMatrixAt(i,m4); lf.setColorAt(i,col.setHSL(.25+rnd()*.1,.55,.3+rnd()*.2))}); q.identity(); T3.leaves=lf; sc.add(lf);
  /* people with no recorded line: seeds scattered on the grass */
  const S=D.s, sn=S.length, sp=new Float32Array(sn*3), sm=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshLambertMaterial({}),sn);
  for(let i=0;i<sn;i++){const a=i*2.39996, r=10+1.22*Math.sqrt(i+1)*1.0, s=Math.min(.5,.14+.04*Math.log2(1+S[i][2])); sp[i*3]=Math.cos(a)*r; sp[i*3+1]=s*.8; sp[i*3+2]=Math.sin(a)*r; p3.set(sp[i*3],sp[i*3+1],sp[i*3+2]); s3.set(s,s,s); m4.compose(p3,q,s3); sm.setMatrixAt(i,m4); sm.setColorAt(i,col.setHex(S[i][1]?0xffc2d1:0xf4eeda))} T3.seedPos=sp; T3.seeds=sm; sc.add(sm);
  T3.N=N; T3.S=S; T3.cam.t=[0,top*.46,0]; T3.cam.d=top*1.25; T3.ready=true; t3Controls(cv);
}
function t3Resize(){ if(!T3.rn) return; const el=$('#v-tree'), w=el.clientWidth, h=el.clientHeight; if(!w||!h) return; T3.rn.setSize(w,h,false); T3.camO.aspect=w/h; T3.camO.updateProjectionMatrix(); T3.W=w; T3.H=h; T3.dirty=true }
window.addEventListener('resize',()=>{ if(curTab==='tree') t3Resize() });
function t3Frame(now){ if(curTab!=='tree'||!T3.ready){T3.run=false; return} requestAnimationFrame(t3Frame); const c=T3.cam;
  if(T3.fly){const f=T3.fly, t=Math.min(1,(now-f.t0)/f.dur), e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; for(let i=0;i<3;i++) c.t[i]=f.a[i]+(f.b[i]-f.a[i])*e; c.d=f.d0+(f.d1-f.d0)*e; if(t>=1) T3.fly=null; T3.dirty=true}
  if(T3.spin){c.th+=.0022; T3.dirty=true}
  if(T3.hold){c.t[1]=Math.max(0,Math.min(T3.top+4,c.t[1]+T3.hold*c.d*.012)); T3.dirty=true}
  if(!T3.dirty) return; T3.dirty=false; c.ph=Math.max(.12,Math.min(1.72,c.ph)); c.d=Math.max(2.5,Math.min(T3.top*3.2,c.d)); const o=T3.camO;
  o.position.set(c.t[0]+c.d*Math.sin(c.ph)*Math.sin(c.th),Math.max(.6,c.t[1]+c.d*Math.cos(c.ph)),c.t[2]+c.d*Math.sin(c.ph)*Math.cos(c.th)); o.lookAt(c.t[0],c.t[1],c.t[2]); T3.rn.render(T3.sc,o);
  if(!T3.lt||now-T3.lt>110){T3.lt=now; t3Labels()} else T3.dirty2=true; if(T3.dirty2&&now-T3.lt>100){T3.dirty2=false; t3Labels()} }
function t3Project(x,y,z,out){const v=T3.v||(T3.v=new THREE.Vector3()); v.set(x,y,z).project(T3.camO); out[0]=(v.x+1)/2*T3.W; out[1]=(1-v.y)/2*T3.H; out[2]=v.z; return v.z<1&&v.z>-1}
function t3Labels(){const box=$('#tree-labels'); if(!box) return; const N=T3.N, pos=T3.pos, o=[0,0,0], cp=T3.camO.position, cand=[], path=T3.path?new Set(T3.path):null, lim=T3.cam.d*2.4;
  const consider=(name,x,y,z,vc,key,boost,cat)=>{const d=Math.hypot(x-cp.x,y-cp.y,z-cp.z); if(d>lim&&!boost) return; if(!t3Project(x,y,z,o)) return; if(o[0]<-20||o[0]>T3.W+20||o[1]<46||o[1]>T3.H-150) return; cand.push([boost+(vc+4)/(d*d+4),o[0],o[1],name,key,cat])};
  for(let k=0;k<N.length;k++){ if(T3.scr&&N[k][3]!=='b') continue; consider(N[k][0],pos[k*3],pos[k*3+1],pos[k*3+2],N[k][5]+(N[k][3]!=='b'?12:0),k,(k===T3.sel?1e6:0)+(path&&path.has(k)?1e3:0),N[k][3])}
  if(cp.y<T3.top*.5) for(let i=0;i<T3.S.length;i++) consider(T3.S[i][0],T3.seedPos[i*3],T3.seedPos[i*3+1],T3.seedPos[i*3+2],T3.S[i][2],-1-i,(-1-i===T3.sel?1e6:0),'s');
  cand.sort((a,b)=>b[0]-a[0]); const used=new Set(), out=[]; for(const c of cand){ if(out.length>=36) break; const gx=Math.floor(c[1]/92), gy=Math.floor(c[2]/20), k=gx*1000+gy; if(used.has(k)||used.has(k+1000)||used.has(k-1000)) continue; used.add(k); out.push(c)}
  box.innerHTML=out.map(c=>`<span class="${c[4]===T3.sel?'sel':''} c${c[5]}" style="left:${c[1].toFixed(0)}px;top:${c[2].toFixed(0)}px">${esc(c[3].replace(/ \(.*/,''))}</span>`).join('') }

function t3Controls(cv){const pts=new Map(); let moved=0, t0=0, lastD=0, lastM=null;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId); pts.set(e.pointerId,[e.clientX,e.clientY]); if(pts.size===1){moved=0; t0=performance.now()} lastD=0; lastM=null; T3.spin=false; T3.fly=null});
  cv.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId); if(!p) return; const dx=e.clientX-p[0], dy=e.clientY-p[1]; pts.set(e.pointerId,[e.clientX,e.clientY]); const c=T3.cam;
    if(pts.size===1){moved+=Math.abs(dx)+Math.abs(dy); c.th-=dx*.006; c.ph-=dy*.005; T3.dirty=true}
    else if(pts.size===2){const a=[...pts.values()], d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]), m=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]; if(lastD){c.d*=lastD/d; const k=c.d*.0016, mx=m[0]-lastM[0], my=m[1]-lastM[1]; c.t[0]-=(Math.cos(c.th)*mx)*k; c.t[2]+=(Math.sin(c.th)*mx)*k; c.t[1]=Math.max(0,c.t[1]+my*k)} lastD=d; lastM=m; moved+=9; T3.dirty=true}});
  const end=e=>{const had=pts.has(e.pointerId); pts.delete(e.pointerId); lastD=0; lastM=null; if(had&&pts.size===0&&moved<9&&performance.now()-t0<450) t3Pick(e)}; cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId)});
  cv.addEventListener('wheel',e=>{e.preventDefault(); T3.cam.d*=e.deltaY>0?1.1:.9; T3.dirty=true},{passive:false}) }
function t3Pick(e){const r=$('#tree3d').getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top, o=[0,0,0]; let best=null, bd=30*30; const tryP=(px,py,pz,key)=>{ if(!t3Project(px,py,pz,o)) return; const d=(o[0]-x)**2+(o[1]-y)**2; if(d<bd){bd=d; best=key}};
  for(let k=0;k<T3.N.length;k++){ if(T3.scr&&T3.N[k][3]!=='b') continue; tryP(T3.pos[k*3],T3.pos[k*3+1],T3.pos[k*3+2],k)} for(let i=0;i<T3.S.length;i++) tryP(T3.seedPos[i*3],T3.seedPos[i*3+1],T3.seedPos[i*3+2],-1-i);
  if(best!=null) t3Open(best) }
const t3P=k=>k>=0?[T3.pos[k*3],T3.pos[k*3+1],T3.pos[k*3+2]]:[T3.seedPos[(-1-k)*3],T3.seedPos[(-1-k)*3+1],T3.seedPos[(-1-k)*3+2]];
function t3Fly(k,dist){const c=T3.cam; T3.fly={a:c.t.slice(),b:t3P(k),d0:c.d,d1:dist||Math.min(c.d,9),t0:performance.now(),dur:1100}; T3.dirty=true}
function t3Line(k){const out=[]; while(k>=0){out.unshift(k); k=T3.N[k][1]} return out}
function t3SetPath(k){ if(T3.pathMesh){T3.sc.remove(T3.pathMesh); T3.pathMesh.geometry.dispose(); T3.pathMesh=null} T3.path=k==null?null:t3Line(k); if(T3.path&&T3.path.length>1){const pts=[new THREE.Vector3(0,0,0)].concat(T3.path.map(i=>new THREE.Vector3(...t3P(i)))); T3.pathMesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'catmullrom',.1),pts.length*3,.13,6,false),new THREE.MeshBasicMaterial({color:0xff4fd8,depthTest:false,transparent:true,opacity:.9})); T3.pathMesh.renderOrder=5; T3.sc.add(T3.pathMesh)} T3.dirty=true; t3UI()}
function t3Open(k){T3.sel=k; T3.dirty=true; const seed=k<0, r=seed?T3.S[-1-k]:T3.N[k];
  Sheet.open({title:r[0],render(el){ let h='';
    if(seed){h=`<span class="tag">No line recorded</span><p class="def" style="margin:10px 0">${r[4]?esc(r[4]):'The Bible names this person without giving a father or tribe, so they lie as a seed on the grass.'}</p>${r[6]?`<p class="note">${esc(r[6])}</p>`:''}<p class="sub">${r[2]} verse${r[2]===1?'':'s'}${r[5]?' · Married: '+esc(r[5]):''}</p><div class="row">${r[3]?`<button class="btn sm" data-act="goref" data-ref="${r[3]}">Read ${esc(dotStr(r[3]))}</button>`:''}</div>`}
    else {const cat=r[3], L=T3LAB[cat], ln=t3Line(k), par=r[1]>=0?T3.N[r[1]]:null, kids=T3.kids[k], yr=y=>y?(+y<0?(-y)+' BC':'AD '+y):'';
      h=`<span class="tag ${L[1]}">${L[0]}</span>${r[2]===1?'<span class="tag">Line not given</span>':''}${r[4]?'<span class="tag">Woman</span>':''}<div class="lbl" style="margin-top:10px">${ln.length-1} generation${ln.length===2?'':'s'} from Adam on this tree${r[9]?' · also called '+esc(r[9].split(',').slice(0,6).map(w=>w.trim().charAt(0)+w.trim().slice(1).toLowerCase()).join(', ')):''}</div>
      ${r[10]?`<p class="def" style="margin:10px 0">${esc(r[10])}</p>`:''}${r[11]?`<p class="note">${esc(r[11])}</p>`:''}
      ${r[2]===1?`<p class="note">The Bible gives this person's tribe or nation but not the line of descent, so the branch is joined directly to ${esc(par[0])}. Some of these placements were made automatically from a dictionary description and can be wrong.</p>`:''}
      <p class="sub">${cat==='b'?r[5]+' verse'+(r[5]===1?'':'s'):''}${r[7]?' · born '+yr(r[7]):''}${r[8]?' · died '+yr(r[8]):''}${r[12]?' · Mother: '+esc(r[12]):''}${r[13]?' · Married: '+esc(r[13]):''}</p>
      <div class="row" style="margin:8px 0"><button class="btn sm pri" data-act="t3trace" data-k="${k}">Light the line to Adam</button>${r[6]?`<button class="btn sm" data-act="goref" data-ref="${r[6]}">Read ${esc(dotStr(r[6]))}</button>`:''}</div>
      ${par?`<div class="lbl" style="margin-top:12px">${r[2]===2?'Formed from':r[2]===1?'Joined to':'Parent'}</div><div class="chips" style="margin-top:6px"><button class="chip" data-act="t3go" data-k="${r[1]}">${esc(par[0])}</button></div>`:''}
      ${kids.length?`<div class="lbl" style="margin-top:12px">Branches from here (${kids.length})</div><div class="chips" style="margin-top:6px">${kids.slice(0,60).map(c=>`<button class="chip" data-act="t3go" data-k="${c}">${esc(T3.N[c][0])}</button>`).join('')}</div>`:''}
      ${r[7]&&cat==='b'?'<p class="note" style="margin-top:14px">Years follow the traditional chronology used by the source dataset. Early dates are disputed.</p>':''}`}
    el.innerHTML=h}}); t3Fly(k) }
ACT.t3go=el=>{const k=+el.dataset.k; t3Open(k)};
ACT.t3trace=el=>{const k=+el.dataset.k; Sheet.close(); t3SetPath(k); const ln=T3.path, c=T3.cam, ys=ln.map(i=>T3.pos[i*3+1]), mid=(Math.min(...ys)+Math.max(...ys))/2; T3.fly={a:c.t.slice(),b:[0,mid,0],d0:c.d,d1:Math.max(14,(Math.max(...ys)-Math.min(...ys))*1.15),t0:performance.now(),dur:1300}; toast(`${ln.length-1} generations from Adam`)};
function t3UI(){
  $('#tree-top').innerHTML=`<input class="inp" id="t3q" placeholder="Find anyone: Ruth, Caleb, Woden…" data-inp="t3find" value="${esc(T3.q)}" autocomplete="off"><div id="t3res"></div>`;
  $('#tree-bar').innerHTML=`<div class="map-eras">${[['Whole tree',-1],['Adam',0],['Noah','Noah'],['Abraham','Abraham'],['Moses','Moses'],['David','David'],['Jesus','Jesus Christ'],['The seeds',-2]].map(x=>`<button data-act="t3jump" data-k="${x[1]}">${x[0]}</button>`).join('')}</div>
  <div class="ctl"><button data-act="t3spin" aria-label="Turn slowly">⟳</button><button data-hold="1" aria-label="Climb">▲</button><button data-hold="-1" aria-label="Descend">▼</button><button data-act="t3scr" style="width:auto;padding:0 12px;border-radius:21px;font-size:12.5px" class="${T3.scr?'go':''}">Scripture only</button>${T3.path?'<button data-act="t3clear" style="width:auto;padding:0 12px;border-radius:21px;font-size:12.5px">Clear line</button>':''}<span style="flex:1"></span><button data-act="t3key" aria-label="Key">?</button></div>`;
  $$('#tree-bar [data-hold]').forEach(b=>{const on=e=>{e.preventDefault(); T3.hold=+b.dataset.hold; T3.dirty=true}, off=()=>{T3.hold=0}; b.addEventListener('pointerdown',on); b.addEventListener('pointerup',off); b.addEventListener('pointerleave',off); b.addEventListener('pointercancel',off)}) }
ACT.t3spin=()=>{T3.spin=!T3.spin; T3.dirty=true};
ACT.t3scr=()=>{T3.scr=!T3.scr; T3.barkX.visible=!T3.scr; const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), p=new THREE.Vector3(), s=new THREE.Vector3(); for(let k=0;k<T3.N.length;k++){ if(T3.N[k][3]==='b') continue; const z=T3.scr?0.0001:T3.fs[k]; p.set(T3.pos[k*3],T3.pos[k*3+1],T3.pos[k*3+2]); s.set(z,z,z); m4.compose(p,q,s); T3.fruit.setMatrixAt(k,m4)} T3.fruit.instanceMatrix.needsUpdate=true; T3.dirty=true; t3UI(); toast(T3.scr?'Showing only what the Bible states':'Tradition and legend branches shown')};
ACT.t3clear=()=>t3SetPath(null);
ACT.t3jump=el=>{const k=el.dataset.k, c=T3.cam; if(k==='-1'){T3.fly={a:c.t.slice(),b:[0,T3.top*.46,0],d0:c.d,d1:T3.top*1.25,t0:performance.now(),dur:1200}; return} if(k==='-2'){c.ph=1.05; T3.fly={a:c.t.slice(),b:[0,1,0],d0:c.d,d1:62,t0:performance.now(),dur:1200}; return}
  const i=k==='0'?0:T3.N.findIndex(n=>n[0]===k); if(i>=0){T3.sel=i; t3Fly(i,k==='0'?16:11)}};
ACT.t3find=el=>{T3.q=el.value; const q=el.value.trim().toLowerCase(), out=$('#t3res'); if(q.length<2){out.innerHTML='';return} const res=[]; T3.N.forEach((n,k)=>{ if(n[0].toLowerCase().includes(q)) res.push([n[0].toLowerCase().startsWith(q)?1e4+n[5]:n[5],k,n[0],T3LAB[n[3]][0]])}); T3.S.forEach((s,i)=>{ if(s[0].toLowerCase().includes(q)) res.push([(s[0].toLowerCase().startsWith(q)?1e4:0)+s[2],-1-i,s[0],'seed'])});
  res.sort((a,b)=>b[0]-a[0]); out.innerHTML=res.slice(0,8).map(r=>`<button data-act="t3pick" data-k="${r[1]}">${esc(r[2])}<small>${r[3]}</small></button>`).join('')||'<button disabled>No one by that name</button>'};
ACT.t3pick=el=>{$('#t3res').innerHTML=''; $('#t3q').blur(); t3Open(+el.dataset.k)};
ACT.t3key=()=>Sheet.open({title:'Reading the tree',render(el){const N=T3.N, cnt=c=>N.filter(n=>n[3]===c).length; el.innerHTML=`<div class="prose"><p>Adam is the trunk. Every person is a fruit, and every branch runs from parent to child. Fruit is larger the more verses mention that person.</p></div>
  <div class="li"><h3><span style="color:#f2c14e">●</span> Scripture <small>${cnt('b').toLocaleString()} people</small></h3><p>People whose descent the Bible states. Women are shown in rose. Paler bark marks ${N.filter(n=>n[2]===1&&n[3]==='b').length} people whose tribe or nation is known but whose exact line is not.</p></div>
  <div class="li"><h3><span style="color:#6fb7ff">●</span> Ancient tradition <small>${cnt('t')}</small></h3><p>Jubilees, Josephus, the Talmud, the early church and Islamic genealogy.</p></div>
  <div class="li"><h3><span style="color:#b98cff">●</span> Medieval legend <small>${cnt('l')}</small></h3><p>Pedigrees that tied the kings of Wessex, the Irish, Armenians, Georgians and Ethiopians to Noah and Solomon.</p></div>
  <div class="li"><h3><span style="color:#dfe6ee">●</span> Recorded history <small>${cnt('h')}</small></h3><p>Real, documented people who appear here only because a legendary pedigree leads to them, such as the line from Alfred the Great to the present British royal family.</p></div>
  <div class="li"><h3><span style="color:#ff5a4d">●</span> Modern invention <small>${cnt('x')}</small></h3><p>Claims with no ancient source, included because people ask about them, and labeled for what they are.</p></div>
  <div class="li"><h3><span style="color:#f4eeda">●</span> Seeds on the grass <small>${T3.S.length.toLocaleString()}</small></h3><p>People the Bible names without a father or tribe. They cannot be placed on a branch.</p></div>
  <p class="note">One finger turns the tree. Two fingers zoom and slide. The arrows climb and descend. "Scripture only" hides everything that is not stated in the Bible.</p>
  <p class="sub">Biblical people and family links: Theographic Bible Metadata by Robert Rouse and contributors, CC BY-SA 4.0, with Easton's Bible Dictionary (1897). Tradition, legend and history branches were added for this app.</p>`}});
