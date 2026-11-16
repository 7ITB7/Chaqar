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

  const cv=$('#tree3d'), rn=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:false}); rn.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); rn.outputEncoding=THREE.sRGBEncoding; rn.toneMapping=THREE.ACESFilmicToneMapping; rn.toneMappingExposure=1.05; rn.shadowMap.enabled=true; rn.shadowMap.type=THREE.PCFSoftShadowMap; T3.rn=rn;
  const sc=new THREE.Scene(); sc.fog=new THREE.Fog(0xdfe3c9,top*1.6,top*6.5); T3.sc=sc; T3.camO=new THREE.PerspectiveCamera(50,1,.1,3000);
  /* painted textures, made in the browser so nothing has to download */
  const tex=(w,h,draw,rep)=>{const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1])} t.anisotropy=4; return t};
  const skyT=tex(1024,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#3f7fc4'); gr.addColorStop(.34,'#8ebfe6'); gr.addColorStop(.5,'#f3e3b4'); gr.addColorStop(.56,'#e3dcb8'); gr.addColorStop(1,'#b9c9a0'); g.fillStyle=gr; g.fillRect(0,0,w,h);
    const sun=g.createRadialGradient(w*.62,h*.4,0,w*.62,h*.4,170); sun.addColorStop(0,'rgba(255,250,225,1)'); sun.addColorStop(.12,'rgba(255,240,190,.85)'); sun.addColorStop(1,'rgba(255,225,160,0)'); g.fillStyle=sun; g.fillRect(0,0,w,h);
    for(let i=0;i<70;i++){const x=rnd()*w, y=h*(.12+rnd()*.3), r=18+rnd()*46; for(let j=0;j<6;j++){const cg=g.createRadialGradient(x+(rnd()-.5)*r*2.4,y+(rnd()-.5)*r*.5,0,x+(rnd()-.5)*r*2.4,y+(rnd()-.5)*r*.5,r); cg.addColorStop(0,'rgba(255,255,250,.34)'); cg.addColorStop(1,'rgba(255,255,250,0)'); g.fillStyle=cg; g.fillRect(0,0,w,h)}}});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(1400,40,20),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,toneMapped:false})); sc.add(sky);
  try{const pm=new THREE.PMREMGenerator(rn), es=new THREE.Scene(); es.add(sky.clone()); sc.environment=pm.fromScene(es,.04).texture; pm.dispose()}catch(e){}
  sc.add(new THREE.HemisphereLight(0xfff1d0,0x41603a,.55)); const sun=new THREE.DirectionalLight(0xffe9b8,1.25); sun.position.set(90,150,60); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); const sh=sun.shadow.camera; sh.left=-75; sh.right=75; sh.top=110; sh.bottom=-60; sh.near=10; sh.far=420; sun.shadow.bias=-.0006; sun.shadow.normalBias=.05; sc.add(sun);
  /* the garden */
  const grassT=tex(256,256,(g,w,h)=>{g.fillStyle='#5f9a3e'; g.fillRect(0,0,w,h); for(let i=0;i<5200;i++){g.fillStyle=`hsla(${88+rnd()*34},${45+rnd()*25}%,${24+rnd()*26}%,.55)`; const x=rnd()*w, y=rnd()*h; g.fillRect(x,y,1+rnd()*1.5,2+rnd()*4)} for(let i=0;i<60;i++){g.fillStyle=['#fff6c8','#ffd0e0','#f7f3ff','#ffe27a'][i%4]; g.fillRect(rnd()*w,rnd()*h,2,2)}},[90,90]);
  const gnd=new THREE.Mesh(new THREE.CircleGeometry(900,96),new THREE.MeshStandardMaterial({map:grassT,roughness:1,metalness:0,envMapIntensity:.25})); gnd.rotation.x=-Math.PI/2; gnd.receiveShadow=true; sc.add(gnd);
  const water=new THREE.MeshStandardMaterial({color:0x3f8fc9,roughness:.07,metalness:.75,envMapIntensity:1.3}); [0,1,2,3].forEach(i=>{const a=i*Math.PI/2+.5, r=new THREE.Mesh(new THREE.PlaneGeometry(8,640),water); r.rotation.x=-Math.PI/2; r.rotation.z=-a; r.position.set(Math.sin(a)*384,.06,Math.cos(a)*384); sc.add(r)});
  const ring=new THREE.Mesh(new THREE.RingGeometry(58,65,96),water); ring.rotation.x=-Math.PI/2; ring.position.y=.07; sc.add(ring);
  const bank=new THREE.Mesh(new THREE.RingGeometry(56.6,66.4,96),new THREE.MeshStandardMaterial({color:0xcdbb8a,roughness:1})); bank.rotation.x=-Math.PI/2; bank.position.y=.04; sc.add(bank);
  const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), s3=new V(), p3=new V(), col=new THREE.Color(), e3=new THREE.Euler();
  /* forest and hills on the horizon */
  const NT=320, crown=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({roughness:.95,flatShading:true,envMapIntensity:.3}),NT*2), trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.16,.24,1,6),new THREE.MeshStandardMaterial({color:0x4a3524,roughness:1}),NT);
  for(let i=0;i<NT;i++){const a=rnd()*6.283, r=150+rnd()*520, s=6+rnd()*12, x=Math.cos(a)*r, z=Math.sin(a)*r; p3.set(x,s*.55,z); s3.set(s,s*1.1,s); m4.compose(p3,q,s3); trunks.setMatrixAt(i,m4);
    p3.set(x,s*1.25,z); s3.set(s*.62,s*.72,s*.62); e3.set(rnd(),rnd()*6,rnd()); q.setFromEuler(e3); m4.compose(p3,q,s3); crown.setMatrixAt(i*2,m4); crown.setColorAt(i*2,col.setHSL(.26+rnd()*.1,.5,.2+rnd()*.14));
    p3.set(x+s*.25,s*1.6,z-s*.2); s3.set(s*.42,s*.5,s*.42); m4.compose(p3,q,s3); crown.setMatrixAt(i*2+1,m4); crown.setColorAt(i*2+1,col.setHSL(.24+rnd()*.1,.5,.26+rnd()*.14)); q.identity()} sc.add(crown,trunks);
  const hill=new THREE.SphereGeometry(1,24,12), hm=new THREE.MeshStandardMaterial({color:0x6f9a5a,roughness:1,envMapIntensity:.2}); for(let i=0;i<14;i++){const a=i/14*6.283+rnd()*.3, r=820+rnd()*120, m=new THREE.Mesh(hill,hm); m.position.set(Math.cos(a)*r,-30,Math.sin(a)*r); m.scale.set(220+rnd()*160,90+rnd()*90,220+rnd()*160); sc.add(m)}

  /* bark: one tapered, textured tube per person, merged */
  const barkT=tex(256,512,(g,w,h)=>{g.fillStyle='#b8a089'; g.fillRect(0,0,w,h); for(let i=0;i<900;i++){const x=rnd()*w, y=rnd()*h, l=20+rnd()*110; g.strokeStyle=`rgba(${40+rnd()*50},${26+rnd()*36},${14+rnd()*24},${.25+rnd()*.45})`; g.lineWidth=.6+rnd()*2.6; g.beginPath(); g.moveTo(x,y); g.bezierCurveTo(x+(rnd()-.5)*10,y+l*.3,x+(rnd()-.5)*10,y+l*.7,x+(rnd()-.5)*8,y+l); g.stroke()} for(let i=0;i<260;i++){g.fillStyle=`rgba(235,225,200,${rnd()*.12})`; g.fillRect(rnd()*w,rnd()*h,2+rnd()*5,6+rnd()*26)}},[1,1]);
  const SEG=8, mk=()=>({p:[],c:[],u:[],i:[]}), bark={s:mk(),x:mk()}, a3=new V(), b3=new V(), u3=new V(), w3=new V(), t3=new V();
  const tube=(G,x0,y0,z0,r0,x1,y1,z1,r1,cl,v0)=>{a3.set(x0,y0,z0); b3.set(x1,y1,z1); const L=a3.distanceTo(b3); t3.subVectors(b3,a3).normalize(); u3.crossVectors(t3,Math.abs(t3.y)<.9?up:new V(1,0,0)).normalize(); w3.crossVectors(t3,u3); const o=G.p.length/3, R1=SEG+1;
    for(let e=0;e<2;e++){const P=e?b3:a3, r=e?r1:r0; for(let k=0;k<=SEG;k++){const an=k/SEG*6.283, cx=Math.cos(an)*r, cy=Math.sin(an)*r; G.p.push(P.x+u3.x*cx+w3.x*cy,P.y+u3.y*cx+w3.y*cy,P.z+u3.z*cx+w3.z*cy); G.c.push(cl[0],cl[1],cl[2]); G.u.push(k/SEG*Math.max(1,Math.round(r*3)),v0+(e?L*.22:0))}}
    for(let k=0;k<SEG;k++) G.i.push(o+k,o+k+1,o+R1+k, o+k+1,o+R1+k+1,o+R1+k)};
  tube(bark.s,0,-.6,0,rad[0]*2.1,0,3.2,0,rad[0],[1,.95,.88],0);
  /* roots */ for(let i=0;i<7;i++){const a=i/7*6.283+rnd(), L=3+rnd()*2.5; tube(bark.s,Math.cos(a)*rad[0]*.6,1.3,Math.sin(a)*rad[0]*.6,rad[0]*.5,Math.cos(a)*(rad[0]+L),-.3,Math.sin(a)*(rad[0]+L),.12,[1,.95,.88],0)}
  const TINT={b:[1,.95,.88],t:[.62,.8,1.15],l:[.95,.75,1.25],h:[1.3,1.32,1.38],x:[1.45,.6,.5]};
  for(let k=1;k<n;k++){const p=N[k][1], cat=N[k][3], inferred=N[k][2]===1, cl=cat==='b'?(inferred?[1.3,1.2,1.02]:TINT.b):TINT[cat]; tube(cat==='b'?bark.s:bark.x,pos[p*3],pos[p*3+1],pos[p*3+2],Math.min(rad[p],rad[k]*1.25),pos[k*3],pos[k*3+1],pos[k*3+2],rad[k]*.92,cl,depth[k]*.27)}
  const barkM=new THREE.MeshStandardMaterial({map:barkT,bumpMap:barkT,bumpScale:.06,vertexColors:true,roughness:.92,metalness:0,envMapIntensity:.35});
  const mesh=G=>{const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(G.p,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(G.c,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(G.u,2)); g.setIndex(G.i); g.computeVertexNormals(); const m=new THREE.Mesh(g,barkM); m.castShadow=true; m.receiveShadow=true; return m};
  T3.barkS=mesh(bark.s); T3.barkX=mesh(bark.x); sc.add(T3.barkS,T3.barkX);
  /* fruit: one per person */
  const fr=new THREE.InstancedMesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshStandardMaterial({roughness:.32,metalness:.05,envMapIntensity:.9}),n); T3.fs=new Float32Array(n);
  for(let k=0;k<n;k++){const s=Math.min(.6,.13+.045*Math.log2(1+N[k][5])+(N[k][3]!=='b'?.05:0)); T3.fs[k]=s; p3.set(pos[k*3],pos[k*3+1],pos[k*3+2]); s3.set(s,s,s); m4.compose(p3,q,s3); fr.setMatrixAt(k,m4); col.setHex(N[k][3]==='b'?(N[k][4]?0xff8fb0:0xf5b82e):T3C[N[k][3]]); fr.setColorAt(k,col)} fr.castShadow=true; T3.fruit=fr; sc.add(fr);
  /* leaves */
  const leafT=tex(128,192,(g,w,h)=>{g.clearRect(0,0,w,h); const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#9fd35a'); gr.addColorStop(1,'#3f8a2c'); g.fillStyle=gr; g.beginPath(); g.moveTo(w/2,4); g.bezierCurveTo(w*1.05,h*.3,w*.95,h*.75,w/2,h-4); g.bezierCurveTo(w*.05,h*.75,-w*.05,h*.3,w/2,4); g.fill(); g.strokeStyle='rgba(30,70,20,.55)'; g.lineWidth=2.5; g.beginPath(); g.moveTo(w/2,8); g.lineTo(w/2,h-6); g.stroke(); g.lineWidth=1; for(let i=1;i<7;i++){const y=h*i/7.5+10; g.beginPath(); g.moveTo(w/2,y); g.lineTo(w*.86,y-16); g.moveTo(w/2,y); g.lineTo(w*.14,y-16); g.stroke()}});
  const LN=[]; for(let k=0;k<n;k++) if(N[k][3]==='b'&&size[k]<=9) for(let j=0;j<(size[k]<=1?6:size[k]<=4?4:2);j++) LN.push(k);
  const lf=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1.5),new THREE.MeshStandardMaterial({map:leafT,alphaTest:.5,side:THREE.DoubleSide,roughness:.7,metalness:0,envMapIntensity:.4}),LN.length);
  LN.forEach((k,i)=>{p3.set(pos[k*3]+(rnd()-.5)*1.5,pos[k*3+1]+(rnd()-.35)*1.3,pos[k*3+2]+(rnd()-.5)*1.5); e3.set(rnd()*3,rnd()*6,rnd()*3); q.setFromEuler(e3); const s=.26+rnd()*.34; s3.set(s,s,s); m4.compose(p3,q,s3); lf.setMatrixAt(i,m4); lf.setColorAt(i,col.setHSL(.24+rnd()*.1,.5+rnd()*.3,.42+rnd()*.3))}); q.identity(); lf.castShadow=true; T3.leaves=lf; sc.add(lf);
  /* people with no recorded line: seeds scattered on the grass */
  const S=D.s, sn=S.length, sp=new Float32Array(sn*3), sm=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshStandardMaterial({roughness:.4,envMapIntensity:.7}),sn);
  for(let i=0;i<sn;i++){const a=i*2.39996, r=10+1.22*Math.sqrt(i+1), s=Math.min(.5,.14+.04*Math.log2(1+S[i][2])); sp[i*3]=Math.cos(a)*r; sp[i*3+1]=s*.8; sp[i*3+2]=Math.sin(a)*r; p3.set(sp[i*3],sp[i*3+1],sp[i*3+2]); s3.set(s,s,s); m4.compose(p3,q,s3); sm.setMatrixAt(i,m4); sm.setColorAt(i,col.setHex(S[i][1]?0xffb3c8:0xf6efd6))} sm.castShadow=true; T3.seedPos=sp; T3.seeds=sm; sc.add(sm);
  /* the gallery: paintings of the story, standing in a ring around the garden */
  T3.art=[]; J('paintings.json').then(A=>{ if(!A) return; const gold=new THREE.MeshStandardMaterial({color:0xc9a23c,roughness:.3,metalness:.9,envMapIntensity:1.2}), wood=new THREE.MeshStandardMaterial({color:0x3a2a1c,roughness:.9}), ld=new THREE.TextureLoader(); ld.setCrossOrigin('anonymous'); const RR=92;
    A.forEach((a,i)=>{const ang=-i/A.length*6.283+Math.PI*.5, asp=a.h/a.w, H=asp>1?27:Math.min(24,30*asp), W=H/asp, g=new THREE.Group(), cy=3.5+H/2;
      const fr=new THREE.Mesh(new THREE.BoxGeometry(W+2.2,H+2.2,.7),gold); fr.castShadow=true; const mat=new THREE.MeshBasicMaterial({color:0x2a2218,toneMapped:false}), pic=new THREE.Mesh(new THREE.PlaneGeometry(W,H),mat); pic.position.z=.37;
      const inner=new THREE.Mesh(new THREE.BoxGeometry(W+.7,H+.7,.5),wood); [-1,1].forEach(sd=>{const leg=new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,cy,8),wood); leg.position.set(sd*(W/2+.4),-cy/2-H/2+1.2,-.2); leg.castShadow=true; g.add(leg)});
      g.add(fr,inner,pic); g.position.set(Math.cos(ang)*RR,cy,Math.sin(ang)*RR); g.lookAt(0,cy,0); g.updateMatrixWorld(); { const nn=new V(0,0,1).transformDirection(g.matrixWorld); if(nn.x*g.position.x+nn.z*g.position.z>0) g.rotateY(Math.PI) } sc.add(g); T3.art.push({a,g,x:g.position.x,y:cy,z:g.position.z,H});
      ld.load(a.u,t=>{t.encoding=THREE.sRGBEncoding; t.anisotropy=4; mat.map=t; mat.color.setHex(0xffffff); mat.needsUpdate=true; T3.dirty=true},undefined,()=>{})}); T3.dirty=true});
  T3.N=N; T3.S=S; T3.cam.t=[0,top*.46,0]; T3.cam.d=top*1.25; T3.ready=true; t3Controls(cv);
}
function t3Resize(){ if(!T3.rn) return; const el=$('#v-tree'), w=el.clientWidth, h=el.clientHeight; if(!w||!h) return; T3.rn.setSize(w,h,false); T3.camO.aspect=w/h; T3.camO.updateProjectionMatrix(); T3.W=w; T3.H=h; T3.dirty=true }
window.addEventListener('resize',()=>{ if(curTab==='tree') t3Resize() });
function t3Frame(now){ if(curTab!=='tree'||!T3.ready){T3.run=false; return} requestAnimationFrame(t3Frame); const c=T3.cam;
  if(T3.fly){const f=T3.fly, t=Math.min(1,(now-f.t0)/f.dur), e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; for(let i=0;i<3;i++) c.t[i]=f.a[i]+(f.b[i]-f.a[i])*e; c.d=f.d0+(f.d1-f.d0)*e; if(t>=1) T3.fly=null; T3.dirty=true}
  if(T3.spin){c.th+=.0022; T3.dirty=true}
  if(T3.hold){c.t[1]=Math.max(0,Math.min(T3.top+4,c.t[1]+T3.hold*c.d*.012)); T3.dirty=true}
  if(!T3.dirty) return; T3.dirty=false; c.ph=Math.max(.12,Math.min(1.72,c.ph)); c.d=Math.max(2.5,Math.min(T3.top*3.2,c.d)); const o=T3.camO;
  o.position.set(c.t[0]+c.d*Math.sin(c.ph)*Math.sin(c.th),Math.max(.6,c.t[1]+c.d*Math.cos(c.ph)),c.t[2]+c.d*Math.sin(c.ph)*Math.cos(c.th)); o.lookAt(c.t[0],c.t[1],c.t[2]); if(T3.art) for(const A of T3.art) A.g.visible=(o.position.x*A.x+o.position.z*A.z)<(A.x*A.x+A.z*A.z)-40; T3.rn.render(T3.sc,o);
  if(!T3.lt||now-T3.lt>110){T3.lt=now; t3Labels()} else T3.dirty2=true; if(T3.dirty2&&now-T3.lt>100){T3.dirty2=false; t3Labels()} }
function t3Project(x,y,z,out){const v=T3.v||(T3.v=new THREE.Vector3()); v.set(x,y,z).project(T3.camO); out[0]=(v.x+1)/2*T3.W; out[1]=(1-v.y)/2*T3.H; out[2]=v.z; return v.z<1&&v.z>-1}
function t3Labels(){const box=$('#tree-labels'); if(!box) return; const N=T3.N, pos=T3.pos, o=[0,0,0], cp=T3.camO.position, cand=[], path=T3.path?new Set(T3.path):null, lim=T3.cam.d*2.4;
  const consider=(name,x,y,z,vc,key,boost,cat)=>{const d=Math.hypot(x-cp.x,y-cp.y,z-cp.z); if(d>lim&&!boost) return; if(!t3Project(x,y,z,o)) return; if(o[0]<-20||o[0]>T3.W+20||o[1]<46||o[1]>T3.H-150) return; cand.push([boost+(vc+4)/(d*d+4),o[0],o[1],name,key,cat])};
  for(let k=0;k<N.length;k++){ if(T3.scr&&N[k][3]!=='b') continue; consider(N[k][0],pos[k*3],pos[k*3+1],pos[k*3+2],N[k][5]+(N[k][3]!=='b'?12:0),k,(k===T3.sel?1e6:0)+(path&&path.has(k)?1e3:0),N[k][3])}
  if(cp.y<T3.top*.5) for(let i=0;i<T3.S.length;i++) consider(T3.S[i][0],T3.seedPos[i*3],T3.seedPos[i*3+1],T3.seedPos[i*3+2],T3.S[i][2],-1-i,(-1-i===T3.sel?1e6:0),'s');
  (T3.art||[]).forEach(A=>{const d=Math.hypot(A.x-cp.x,A.y-cp.y,A.z-cp.z); if(d<150&&t3Project(A.x,A.y+A.H/2+2.5,A.z,o)&&o[0]>0&&o[0]<T3.W&&o[1]>46&&o[1]<T3.H-150) cand.push([5e5/d,o[0],o[1],A.a.t,'art','a'])});
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
  if(best!=null){t3Open(best); return} let ba=null, bd2=70*70; (T3.art||[]).forEach((A,i)=>{ if(!t3Project(A.x,A.y,A.z,o)) return; const d=(o[0]-x)**2+(o[1]-y)**2; if(d<bd2){bd2=d; ba=i}}); if(ba!=null) t3Art(ba) }
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
  $('#tree-bar').innerHTML=`<div class="map-eras">${[['Whole tree',-1],['Adam',0],['Noah','Noah'],['Abraham','Abraham'],['Moses','Moses'],['David','David'],['Jesus','Jesus Christ'],['The seeds',-2],['The paintings',-3]].map(x=>`<button data-act="t3jump" data-k="${x[1]}">${x[0]}</button>`).join('')}</div>
  <div class="ctl"><button data-act="t3spin" aria-label="Turn slowly">⟳</button><button data-hold="1" aria-label="Climb">▲</button><button data-hold="-1" aria-label="Descend">▼</button><button data-act="t3scr" style="width:auto;padding:0 12px;border-radius:21px;font-size:12.5px" class="${T3.scr?'go':''}">Scripture only</button>${T3.path?'<button data-act="t3clear" style="width:auto;padding:0 12px;border-radius:21px;font-size:12.5px">Clear line</button>':''}<span style="flex:1"></span><button data-act="t3key" aria-label="Key">?</button></div>`;
  $$('#tree-bar [data-hold]').forEach(b=>{const on=e=>{e.preventDefault(); T3.hold=+b.dataset.hold; T3.dirty=true}, off=()=>{T3.hold=0}; b.addEventListener('pointerdown',on); b.addEventListener('pointerup',off); b.addEventListener('pointerleave',off); b.addEventListener('pointercancel',off)}) }
ACT.t3spin=()=>{T3.spin=!T3.spin; T3.dirty=true};
ACT.t3scr=()=>{T3.scr=!T3.scr; T3.barkX.visible=!T3.scr; const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), p=new THREE.Vector3(), s=new THREE.Vector3(); for(let k=0;k<T3.N.length;k++){ if(T3.N[k][3]==='b') continue; const z=T3.scr?0.0001:T3.fs[k]; p.set(T3.pos[k*3],T3.pos[k*3+1],T3.pos[k*3+2]); s.set(z,z,z); m4.compose(p,q,s); T3.fruit.setMatrixAt(k,m4)} T3.fruit.instanceMatrix.needsUpdate=true; T3.dirty=true; t3UI(); toast(T3.scr?'Showing only what the Bible states':'Tradition and legend branches shown')};
ACT.t3clear=()=>t3SetPath(null);
ACT.t3jump=el=>{const k=el.dataset.k, c=T3.cam; if(k==='-1'){T3.fly={a:c.t.slice(),b:[0,T3.top*.46,0],d0:c.d,d1:T3.top*1.25,t0:performance.now(),dur:1200}; return} if(k==='-3'){t3Gallery(); return} if(k==='-2'){c.ph=1.05; T3.fly={a:c.t.slice(),b:[0,1,0],d0:c.d,d1:62,t0:performance.now(),dur:1200}; return}
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

function t3ArtFly(i){const A=T3.art[i], c=T3.cam, r=Math.hypot(A.x,A.z); c.th=Math.atan2(-A.x,-A.z); c.ph=1.5; T3.fly={a:c.t.slice(),b:[A.x,A.y,A.z],d0:c.d,d1:Math.max(30,A.H*1.55),t0:performance.now(),dur:1400}; T3.spin=false; T3.dirty=true}
function t3Art(i){const A=T3.art[i].a; t3ArtFly(i); Sheet.open({title:A.t,render(el){el.innerHTML=`<div class="lbl" style="color:var(--red)">${esc(A.a)} · ${esc(A.y)}</div><div class="viewer" style="margin:12px 0"><img src="${esc(A.u)}" alt="${esc(A.t)}"></div><div class="row"><button class="btn sm pri" data-act="goref" data-ref="${A.r}">Read ${esc(dotStr(A.r))}</button><button class="btn sm" data-act="t3artn" data-i="${(i+1)%T3.art.length}">Next painting ›</button><a class="btn sm" href="${esc(A.p)}" target="_blank" rel="noopener">Source and license ↗</a></div><p class="note">Public-domain painting from Wikimedia Commons. The twenty paintings stand in story order around the garden, from Creation to Revelation.</p>`}})}
ACT.t3artn=el=>t3Art(+el.dataset.i);
function t3Gallery(){ if(!T3.art.length){toast('The paintings are still loading');return} Sheet.open({title:'The paintings',render(el){el.innerHTML='<p class="sub">Twenty public-domain paintings stand in a ring around the garden, in the order of the story.</p>'+T3.art.map((A,i)=>`<button class="ms" data-act="t3artn" data-i="${i}"><div class="th" style="background-image:url('${esc(A.a.u.replace(/\/\d+px-/,'/330px-'))}')"></div><div><div class="yr">${esc(dotStr(A.a.r))}</div><h3>${esc(A.a.t)}</h3><p>${esc(A.a.a)}, ${esc(A.a.y)}</p></div></button>`).join('')}})}
