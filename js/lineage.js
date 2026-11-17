'use strict';
/* The family line, top to bottom: Adam to Jesus (Matthew 1 and Luke 3), then the apostles and the churches they began, century by century to today.
   Drawn as ordinary page elements on a board you drag and pinch, so the lettering stays sharp. */
const LK={s:['Scripture','#3d5bd9'],t:['Ancient tradition','#0c8f7f'],l:['Medieval legend','#8e44ad'],h:['Recorded history','#c27c0e'],x:['Modern theory','#e03131']};
const LIN={built:false,x:0,y:0,s:1,tilt:Store.get('lintilt',true),items:[],objs:[],srch:[],L:null,SUC:null,q:''};
const LROW=66, LCW=212, LCH=50, LSW=140, LSH=38, LSG=10, LMAX=3, LPITCH=184, LCOLW=168, LRB=100, LCELLH=84;
const lBadge=k=>`<span class="lk-b" style="background:${LK[k][1]}">${LK[k][0]}</span>`;
const lOrd=n=>n+(n%100>10&&n%100<14?'th':['th','st','nd','rd'][n%10]||'th');
const lCent=y=>y<=100?1:Math.ceil(y/100);
const lTag=k=>k==='s'||k==='h'?'':`<em class="tg2" style="background:${LK[k][1]}">${k==='x'?'theory':k==='l'?'legend':'tradition'}</em>`;
const lYr=y=>y<0?(-y)+' BC':'AD '+y;
function lReg(o){ if(o._id==null){o._id=LIN.objs.length; LIN.objs.push(o)} (o.c||[]).forEach(lReg); return o._id }

function linList(id){ /* full leader list with official numbering where there is one */
  const L=(LIN.SUC&&LIN.SUC[id])||[]; let n=0; const seen={};
  return L.map(([nm,y])=>{ let num=null; if(id==='rome'){ if(!/elect/i.test(nm)&&!(nm==='Benedict IX'&&seen[nm])) num=++n; seen[nm]=1 } return {nm,y,num,c:lCent(y)} }) }

VIEW.tree=async()=>{ const m=Store.get('treemode','lin'); $('#lin').style.display=m==='lin'?'':'none'; $('#t3wrap').style.display=m==='3d'?'':'none';
  if(m==='3d'){ T3VIEW(); return }
  if(!LIN.built){ LIN.SUC=await J('succession.json')||{}; linBuild(); linUI(); linHome(false); if(!Store.get('linhint')){toast('Drag to move · pinch to zoom · tap any card'); Store.set('linhint',1)} } else linApply() };
ACT.treemode=el=>{ Store.set('treemode',el.dataset.k); Sheet.close(); VIEW.tree() };

function linBuild(){
  const H=[], P=[], items=LIN.items, add=(it,x,y,w,h,cls,inner,style)=>{const i=items.length; it.x=x+w/2; it.y=y+h/2; items.push(it); H.push(`<div class="lc ${cls}" data-act="lin" data-i="${i}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px${style||''}">${inner}</div>`); return i};
  const line=(d,cls)=>P.push(`<path d="${d}" class="${cls||''}"/>`);
  const txt=(x,y,t,cls,anchor)=>H.push(`<div class="lt ${cls||''}" style="left:${x}px;top:${y}px${anchor?';transform:translateX(-100%)':''}">${t}</div>`);
  const Y0=150, rowY=i=>Y0+i*LROW, ix={}; LG_SPINE.forEach((r,i)=>ix[r[0]]=i);
  txt(-260,18,'From Adam to Jesus','big'); txt(-260,64,'The line in Matthew 1 and Luke 3, one generation per row. Tap any card.','sub');
  /* the main line */
  line(`M0 ${rowY(0)+LCH/2} V${rowY(LG_SPINE.length-1)+LCH/2}`,'spine');
  LG_SPINE.forEach((r,i)=>{ const [id,name,sub,ref,note,flag]=r, y=rowY(i), cls='sp'+(flag?' f-'+flag:'')+(id==='jesus'?' jesus':'');
    add({t:'sp',i},-LCW/2,y,LCW,LCH,cls,`<b>${esc(name)}</b><small>${esc(sub||'generation '+(i+1))}</small>`);
    const sib=LG_SIDE[id]; if(!sib) return; sib.forEach(lReg);
    const nl=Math.min(LG_LEFT[id]||0,sib.length), left=sib.slice(0,nl), right=sib.slice(nl), cy=y+LCH/2;
    [[left,-1],[right,1]].forEach(([arr,dir])=>{ if(!arr.length) return; const show=arr.length>LMAX+1?arr.slice(0,LMAX):arr, more=arr.length-show.length; let x=LCW/2+28;
      const ends=[]; show.forEach(o=>{ const bx=dir>0?x:-x-LSW; add({t:'ob',o:o._id},bx,cy-LSH/2,LSW,LSH,'sd k-'+o.k,`<b>${esc(o.n)}</b>${o.d||o.k!=='s'?`<small>${lTag(o.k)}${esc(o.d||'')}</small>`:''}`); ends.push(x+LSW); x+=LSW+LSG });
      if(more){ const bx=dir>0?x:-x-76; add({t:'more',id,side:dir},bx,cy-LSH/2,76,LSH,'sd more',`<b>+${more}</b><small>more</small>`); ends.push(x+76) }
      const far=Math.max(...ends)-LSW/2; line(`M${dir*LCW/2} ${cy} H${dir*(far)}`,'side') }) });
  /* Luke's line, Nathan to Heli, on the left. It shares Shealtiel and Zerubbabel with Matthew's line */
  const pins=[[0,ix.solomon],[20,ix.shealtiel],[21,ix.zerubbabel],[39,ix.jacob2]], LX=-LCW/2-150, lukeY=k=>{ for(let p=0;p<pins.length-1;p++){const [a,ra]=pins[p],[b,rb]=pins[p+1]; if(k<=b) return rowY(ra)+(rowY(rb)-rowY(ra))*(k-a)/(b-a)} };
  txt(LX,rowY(ix.solomon)-58,'Luke 3 traces<br>a second line','luke-h'); line(`M${-LCW/2} ${rowY(ix.david)+LCH/2} C${LX} ${rowY(ix.david)+LCH/2} ${LX} ${rowY(ix.david)+LCH} ${LX} ${lukeY(0)+12}`,'luke');
  line(`M${LX} ${lukeY(0)+12} V${lukeY(39)+12}`,'luke');
  LG_LUKE.forEach(([nm,v],k)=>{ const y=lukeY(k); add({t:'lk',k},LX-62,y,124,24,'lk'+(k===20||k===21?' shared':''),`<b>${esc(nm)}</b>`) });
  [20,21].forEach(k=>line(`M${LX+62} ${lukeY(k)+12} H${-LCW/2}`,'luke dot'));
  line(`M${LX} ${lukeY(39)+24} C${LX} ${rowY(ix.joseph)+LCH/2} ${LX} ${rowY(ix.joseph)+LCH/2} ${-LCW/2} ${rowY(ix.joseph)+LCH/2}`,'luke');
  /* below Jesus: the apostles, then the churches century by century */
  const jy=rowY(ix.jesus)+LCH, hy=jy+210, NS=17, sx=s=>(s-8)*LPITCH, busY=hy-34, B0=hy+64+56, cY=c=>B0+(c-1)*LRB, left=sx(0)-LCOLW/2, right=sx(NS-1)+LCOLW/2;
  txt(0,jy+40,'From Jesus to today','big ctr'); txt(0,jy+86,'The apostles, then the churches that trace their leaders back to them.<br>Each row below is a century. Drag sideways to see every line.','sub ctr');
  line(`M0 ${jy} V${jy+30} M0 ${jy+130} V${busY} M${sx(0)} ${busY} H${sx(NS-1)}`,'spine');
  LG_APOS.forEach((a,i)=>{ const s=i<16?i:16, y=i<16?hy:hy+(i-16)*30-6, h=i<16?60:26; lReg(a); line(`M${sx(s)} ${busY} V${y}`,'spine'+(a.k==='x'?' x':''));
    add({t:'ob',o:a._id},sx(s)-LCOLW/2,y,LCOLW,h,'ap k-'+a.k+(i>=16?' mini':''),`<b>${esc(a.n)}</b>${i<16?`<small>${lTag(a.k)}${esc(a.from!=null?'from '+LG_APOS[a.from].n:a.d)}</small>`:''}`) });
  txt(sx(16)-LCOLW/2,hy-24,'Also of the Twelve','luke-h');
  for(let c=1;c<=21;c++){ const y=cY(c); P.unshift(`<rect x="${left-150}" y="${y-8}" width="${right-left+170}" height="${LRB}" class="${c===21?'today':c%2?'band':'band2'}"/>`);
    txt(left-22,y+28,c===21?'Today':lOrd(c)+'<br>century','cent'+(c===21?' tdy':''),1) }
  const COL={}; LG_COLS.forEach(col=>COL[col.id]=col);
  LG_COLS.forEach(col=>{ const x=sx(col.s), st=col.start||1, k=col.k||'h', isList=!!col.list, LL=isList?linList(col.list):null;
    /* the column's line */
    const y1=st===1?hy+60:cY(st), y2=cY(col.end)+(col.end===21?10:LCELLH/2); line(`M${x} ${y1} V${y2}`,'col k-'+k);
    if(col.from){ const f=COL[col.from[0]], fx=sx(f.s), fy=cY(col.from[1])+LCELLH/2; line(`M${fx} ${fy} C${(fx+x)/2} ${fy} ${x} ${fy-50} ${x} ${cY(st)}`,'col branch k-'+k); txt((fx+x)/2,fy-46,col.from[2],'yr') }
    if(col.from2){ const f=COL[col.from2[0]], fx=sx(f.s), fy=cY(col.from2[1])+LCELLH/2; line(`M${fx+LCOLW/2} ${fy} H${x-LCOLW/2}`,'col branch dot'); txt((fx+x)/2-30,fy-20,esc(col.from2[2]),'yr') }
    for(let c=st;c<=col.end;c++){ let cell=null;
      if(c===21&&col.today){ const t=col.today; add({t:'cell',col:col.id,c},x-LCOLW/2,cY(c),LCOLW,LCELLH,'cell tdy k-'+t[0],`<i>${esc(col.title)}</i><b>${esc(t[1])}</b><small>${lTag(t[0])}${esc(t[2])}</small>`); continue }
      if(isList){ const here=LL.filter(p=>p.c===c); if(!here.length) continue; const nb=here.filter(p=>col.notable.includes(p.nm)).map(p=>p.nm), names=(nb.length?nb:here.slice(0,2).map(p=>p.nm)).slice(0,3).join(' · ');
        cell=['h',here.length+' '+(here.length===1?col.unit.replace(/s$/,''):col.unit),names] }
      else if(col.c[c]) cell=col.c[c];
      if(!cell) continue;
      const first=c===st||(isList&&c===lCent(LL[0].y));
      add({t:'cell',col:col.id,c},x-LCOLW/2,cY(c),LCOLW,LCELLH,'cell k-'+cell[0],`${first?`<i>${esc(col.title)}</i>`:''}<b>${esc(cell[1])}</b><small>${lTag(cell[0])}${esc(cell[2]||'')}</small>`) } });
  /* place everything on a board that starts at 0,0 */
  let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9; items.forEach(it=>{mnx=Math.min(mnx,it.x-200); mxx=Math.max(mxx,it.x+200); mny=Math.min(mny,it.y-150); mxy=Math.max(mxy,it.y+120)}); mnx=Math.min(mnx,left-200); mny=Math.min(mny,0);
  const OX=-mnx, OY=-mny, W=mxx-mnx, Hh=mxy-mny; LIN.OX=OX; LIN.OY=OY; LIN.W=W; LIN.H=Hh; LIN.hy=hy+OY; LIN.cY=c=>cY(c)+OY; LIN.sx=s=>sx(s)+OX; LIN.rowY=i=>rowY(i)+OY;
  items.forEach(it=>{it.x+=OX; it.y+=OY});
  const board=$('#lin-board'); board.style.width=W+'px'; board.style.height=Hh+'px';
  board.innerHTML=`<svg width="${W}" height="${Hh}" viewBox="${mnx} ${mny} ${W} ${Hh}">${P.join('')}</svg><div class="lin-in" style="transform:translate(${OX}px,${OY}px)">${H.join('')}</div>`;
  /* search index */
  const S=LIN.srch; LG_SPINE.forEach((r,i)=>S.push([r[1],'Main line · '+r[2],items.findIndex(it=>it.t==='sp'&&it.i===i),null]));
  items.forEach((it,i)=>{ if(it.t==='ob'){ const walk=(o,path)=>{ S.push([o.n,LK[o.k][0]+(path?' · '+path:''),i,o._id]); (o.c||[]).forEach(c=>walk(c,o.n)) }; walk(LIN.objs[it.o],'') }
    if(it.t==='lk') S.push([LG_LUKE[it.k][0],'Luke 3:'+LG_LUKE[it.k][1],i,null]);
    if(it.t==='more') LG_SIDE[it.id].forEach(o=>{ if(!items.some(j=>j.t==='ob'&&j.o===o._id)){ const walk=(q,path)=>{S.push([q.n,LK[q.k][0]+(path?' · '+path:''),i,q._id]); (q.c||[]).forEach(c=>walk(c,q.n))}; walk(o,'') } }) });
  LG_COLS.forEach(col=>{ const cell=c=>items.findIndex(it=>it.t==='cell'&&it.col===col.id&&it.c===c);
    if(col.list) linList(col.list).forEach(p=>S.push([p.nm,col.title+' · '+(p.num?lOrd(p.num)+' · ':'')+lYr(p.y),cell(p.c===21?21:p.c),null]));
    Object.entries(col.c||{}).forEach(([c,v])=>S.push([v[1],col.title+' · '+lOrd(+c)+' century',cell(+c),null]));
    if(col.today) S.push([col.today[1],col.title+' · today',cell(21),null]) });
  LIN.built=true; linGestures() }

/* ---- moving around ---- */
function linApply(){ const b=$('#lin-board'); b.style.transform=`translate(${LIN.x}px,${LIN.y}px) scale(${LIN.s})`; $('#lin-tilt').classList.toggle('tilt',!!LIN.tilt);
  const [,H]=linSize(), by=(H*.45-LIN.y)/LIN.s, b1=LIN.cY(1)-8; let t='';
  if(by>=b1){ const c=Math.min(21,Math.floor((by-b1)/LRB)+1); t=c===21?'Today':lOrd(c)+' century AD' } else if(by>LIN.hy-40) t='The apostles'; else { const g=Math.round((by-LIN.rowY(0)-LCH/2)/LROW)+1; if(g>=1&&g<=LG_SPINE.length) t='Generation '+g+' from Adam' }
  const hud=$('#lin-hud'); if(hud.textContent!==t){hud.textContent=t; hud.style.display=t?'':'none'} }
function linSize(){ const el=$('#lin'); return [el.clientWidth||innerWidth, el.clientHeight||innerHeight] }
function linFly(bx,by,s,dur){ const [W,H]=linSize(), a={x:LIN.x,y:LIN.y,s:LIN.s}, b={s, x:W/2-bx*s, y:H/2-by*s}; if(!dur){Object.assign(LIN,b); linApply(); return} const t0=performance.now();
  cancelAnimationFrame(LIN.raf); const step=now=>{ const t=Math.min(1,(now-t0)/dur), e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; LIN.s=a.s+(b.s-a.s)*e; LIN.x=a.x+(b.x-a.x)*e; LIN.y=a.y+(b.y-a.y)*e; linApply(); if(t<1) LIN.raf=requestAnimationFrame(step) }; LIN.raf=requestAnimationFrame(step) }
function linHome(anim){ const [W]=linSize(), s=Math.min(1.05,W/560), y=64-(LIN.OY+4)*s, x=W/2-LIN.OX*s; if(!anim){Object.assign(LIN,{s,x,y}); linApply(); return} const [,H]=linSize(); linFly((W/2-x)/s,(H/2-y)/s,s,700) }
function linZoom(f,cx,cy){ const [W,H]=linSize(); cx=cx==null?W/2:cx; cy=cy==null?H/2:cy; const s=Math.max(.12,Math.min(2.4,LIN.s*f)), k=s/LIN.s; LIN.x=cx-(cx-LIN.x)*k; LIN.y=cy-(cy-LIN.y)*k; LIN.s=s; linApply() }
function linGestures(){
  const el=$('#lin'), pts=new Map(); let last=null, moved=0, pinch=null;
  el.addEventListener('pointerdown',e=>{ if(e.target.closest('.lin-ui')) return; pts.set(e.pointerId,[e.clientX,e.clientY]); if(pts.size===1){last=[e.clientX,e.clientY]; moved=0} if(pts.size===2){const [a,b]=[...pts.values()]; pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),s:LIN.s}} cancelAnimationFrame(LIN.raf) });
  el.addEventListener('pointermove',e=>{ if(!pts.has(e.pointerId)) return; pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===2&&pinch){ const [a,b]=[...pts.values()], r=el.getBoundingClientRect(), d=Math.hypot(a[0]-b[0],a[1]-b[1]); linZoom(pinch.s*d/pinch.d/LIN.s,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top); moved=99; return }
    if(last){ const dx=e.clientX-last[0], dy=e.clientY-last[1]; moved+=Math.abs(dx)+Math.abs(dy); if(moved>6){ if(!el.hasPointerCapture(e.pointerId)) try{el.setPointerCapture(e.pointerId)}catch(_){} LIN.x+=dx; LIN.y+=dy*(LIN.tilt?1.12:1); linApply() } last=[e.clientX,e.clientY] } });
  const up=e=>{ pts.delete(e.pointerId); if(pts.size<2) pinch=null; if(!pts.size) last=null; else last=[...pts.values()][0] };
  el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
  el.addEventListener('click',e=>{ if(moved>6&&!e.target.closest('.lin-ui')){ e.stopPropagation(); e.preventDefault(); moved=0 } },true);
  el.addEventListener('wheel',e=>{ e.preventDefault(); const r=el.getBoundingClientRect(); if(e.ctrlKey||Math.abs(e.deltaY)>Math.abs(e.deltaX)&&!e.shiftKey&&e.deltaMode===0&&Math.abs(e.deltaY)>=50) linZoom(Math.exp(-e.deltaY*(e.ctrlKey?.01:.0018)),e.clientX-r.left,e.clientY-r.top); else {LIN.x-=e.deltaX; LIN.y-=e.deltaY; linApply()} },{passive:false});
  addEventListener('resize',()=>{ if(curTab==='tree') linApply() }) }

/* ---- controls ---- */
const LJUMP=[['Adam',()=>linHome(true)],['Noah','noah'],['Abraham','abraham'],['David','david'],['Exile','jeconiah'],['Jesus','jesus'],['Apostles',()=>{const [W]=linSize(); linFly(LIN.sx(4),LIN.hy+60,Math.min(.9,W/900),800)}],['Today',()=>{const [W]=linSize(); linFly(LIN.sx(2)+(W<700?0:LPITCH),LIN.cY(21)-120,Math.min(.85,W/700),900)}],['Whole tree',()=>{const [W,H]=linSize(); const s=Math.min(W/LIN.W,(H-300)/LIN.H)*.97; linFly(LIN.W/2,LIN.H/2+40/s,s,900)}]];
function linGoItem(i,s){ const it=LIN.items[i]; if(!it) return; const [W,H]=linSize(), ss=s||Math.max(LIN.s,Math.min(1.05,W/560)); linFly(it.x,it.y+H*.15/ss,ss,800); if(0) linFly(it.x,it.y,s||Math.max(LIN.s,Math.min(1.05,W/560)),800); const el=$(`#lin-board [data-i="${i}"]`); if(el){el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash')} }
function linUI(){
  $('#lin-top').innerHTML=`<div id="lin-hud"></div><input class="inp" id="linq" placeholder="Find anyone: Ruth, Nimrod, Athanasius…" data-inp="linfind" autocomplete="off"><div id="linres"></div>`;
  $('#lin-bar').innerHTML=`<div class="jumps">${LJUMP.map((j,i)=>`<button data-act="linjump" data-k="${i}">${j[0]}</button>`).join('')}</div>
  <div class="ctl"><button data-act="linz" data-f="0.8" aria-label="Zoom out">−</button><button data-act="linz" data-f="1.25" aria-label="Zoom in">+</button><button data-act="lintilt" class="wide${LIN.tilt?' on':''}">${LIN.tilt?'3D tilt':'Flat'}</button><span style="flex:1"></span><button data-act="treemode" data-k="3d" class="wide">Everyone · 3D</button><button data-act="linkey" aria-label="Key">?</button></div>` }
ACT.linjump=el=>{ const j=LJUMP[+el.dataset.k][1]; if(typeof j==='function') j(); else linGoItem(LIN.items.findIndex(it=>it.t==='sp'&&LG_SPINE[it.i][0]===j)) };
ACT.linz=el=>linZoom(+el.dataset.f);
ACT.lintilt=()=>{ LIN.tilt=!LIN.tilt; Store.set('lintilt',LIN.tilt); linApply(); linUI() };
ACT.linfind=el=>{ const q=el.value.trim().toLowerCase(), out=$('#linres'); if(q.length<2){out.innerHTML='';return}
  const r=LIN.srch.map((s,i)=>[s[0].toLowerCase().startsWith(q)?2:s[0].toLowerCase().includes(q)?1:0,i]).filter(x=>x[0]).sort((a,b)=>b[0]-a[0]).slice(0,8);
  out.innerHTML=r.map(([_,i])=>`<button data-act="linpick" data-k="${i}">${esc(LIN.srch[i][0])}<small>${esc(LIN.srch[i][1])}</small></button>`).join('')||'<button disabled>No one by that name</button>' };
ACT.linpick=el=>{ const s=LIN.srch[+el.dataset.k]; $('#linres').innerHTML=''; $('#linq').value=''; $('#linq').blur(); linGoItem(s[2]); setTimeout(()=>{ if(s[3]!=null) Sheet.open(linObjSheet(LIN.objs[s[3]])); else linOpen(s[2]) },850) };
ACT.lin=el=>linOpen(+el.dataset.i);
ACT.linobj=el=>Sheet.push(linObjSheet(LIN.objs[+el.dataset.o]));
ACT.linfull=el=>Sheet.push(linColSheet(el.dataset.k));

/* ---- what opens when you tap ---- */
const lVerse=r=>r?`<button class="btn sm" data-act="goref" data-ref="${r}" style="margin-top:10px">Read ${esc(dotStr(r))}</button>`:'';
const lKids=(arr,h)=>arr&&arr.length?`<h3 class="sec" style="font-size:18px;margin-top:18px">${h}</h3>`+arr.map(o=>`<button class="ref" data-act="linobj" data-o="${lReg(o)}"><b>${esc(o.n)} ${o.k!=='s'?lBadge(o.k):''}</b><span>${esc(o.d||'')}${o.c&&o.c.length?' · '+o.c.length+' below':''}</span></button>`).join(''):'';
function linObjSheet(o){ return {title:o.n,render(el){ el.innerHTML=`<div class="prose">${lBadge(o.k)}${o.d?`<p class="sub" style="margin-top:8px">${esc(o.d)}</p>`:''}${o.t?`<p>${esc(o.t)}</p>`:''}${o.k==='x'?'<p class="note">This is a modern theory, not a historical record.</p>':o.k==='l'?'<p class="note">A legend, first written down long after the events.</p>':''}${lVerse(o.r)}${lKids(o.c,'Their line')}</div>` }} }
function linOpen(i){ const it=LIN.items[i]; if(!it) return;
  if(it.t==='sp'){ const [id,name,sub,ref,note,flag]=LG_SPINE[it.i], prev=LG_SPINE[it.i-1], next=LG_SPINE[it.i+1];
    Sheet.open({title:name,render(el){ el.innerHTML=`<div class="prose">${lBadge('s')} <span class="lk-b" style="background:#5a6577">Generation ${it.i+1}</span>${flag==='w'?' <span class="lk-b" style="background:#d6336c">One of Matthew\'s five women</span>':''}
      <p class="sub" style="margin-top:8px">${esc(sub)}</p>${note?`<p>${esc(note)}</p>`:''}${prev?`<p class="note">Child of ${esc(prev[1].split(' & ')[0])}${next?' · parent of '+esc(next[1].split(' & ')[0]):''}</p>`:''}${lVerse(ref)}${lKids(LG_SIDE[id],id==='adam'?'Beside Adam':'Brothers, sisters and family')}</div>` }}); return }
  if(it.t==='more'){ const id=it.id, row=LG_SPINE.find(r=>r[0]===id); Sheet.open({title:'Family of '+row[1],render(el){ el.innerHTML='<div class="prose">'+lKids(LG_SIDE[id],'Everyone beside '+esc(row[1]))+'</div>' }}); return }
  if(it.t==='ob'){ Sheet.open(linObjSheet(LIN.objs[it.o])); return }
  if(it.t==='lk'){ const [nm,v]=LG_LUKE[it.k]; Sheet.open({title:nm,render(el){ el.innerHTML=`<div class="prose">${lBadge('s')}<p style="margin-top:8px">${it.k===0?'Nathan, a son of David and Bathsheba (2 Samuel 5:14). Luke traces Jesus\'s line through him instead of Solomon.':it.k===20||it.k===21?'One of the two names Luke shares with Matthew\'s line. Whether they are the same people is debated.':it.k===39?'Luke calls Joseph "the son of Heli." Matthew says Jacob. If Luke gives Mary\'s line, Heli is Mary\'s father, and later tradition calls him Joachim.':'Named only in Luke\'s genealogy. Nothing else is known of this person.'}</p><p class="note">${it.k+1} of 40 names from Nathan to Heli in Luke 3:23–31. Matthew has 27 generations over the same span.</p>${lVerse('LUK.3.'+v)}</div>` }}); return }
  if(it.t==='cell') Sheet.open(linCellSheet(it.col,it.c)) }
function linCellSheet(id,c){ const col=LG_COLS.find(x=>x.id===id);
  return {title:col.title+' · '+(c===21?'today':lOrd(c)+' century'),render(el){ let h='<div class="prose">';
    if(c===21&&col.today){ const t=col.today; h+=`${lBadge(t[0])}<h3 class="sec" style="font-size:22px;margin-top:10px">${esc(t[1])}</h3><p class="sub">${esc(t[2])}</p>${t[3]?`<p>${esc(t[3])}</p>`:''}<p class="note">Current office-holders checked November 2026.</p>` }
    const cell=col.c&&col.c[c]; if(cell){ h+=`${lBadge(cell[0])}<h3 class="sec" style="font-size:20px;margin-top:10px">${esc(cell[1])}</h3>${cell[2]?`<p class="sub">${esc(cell[2])}</p>`:''}${cell[3]?`<p>${esc(cell[3])}</p>`:''}` }
    if(col.list){ const L=linList(col.list).filter(p=>p.c===c); if(col.notes[c]) h+=`<p>${esc(col.notes[c])}</p>`; h+=`<h3 class="sec" style="font-size:18px;margin-top:14px">${L.length} ${L.length===1?col.unit.replace(/s$/,''):col.unit} began in ${c===21?'this century':'the '+lOrd(c)+' century'}</h3>`+lRows(L,col) }
    h+=`<button class="btn sm pri" data-act="linfull" data-k="${id}" style="margin-top:14px">The whole line of ${esc(col.title)}</button></div>`; el.innerHTML=h }} }
const lRows=(L,col)=>'<div class="lin-list">'+L.map(p=>`<div><span>${p.num?lOrd(p.num):''}</span><b class="${col.notable.includes(p.nm)?'nb':''}">${esc(p.nm)}</b><i>${p.y}</i></div>`).join('')+'</div>';
function linColSheet(id){ const col=LG_COLS.find(x=>x.id===id); return {title:col.title,render(el){ let h=`<div class="prose">${lBadge(col.k||'h')}`;
  if(col.list){ const L=linList(col.list); h+=`<p style="margin-top:8px">${id==='rome'?'All 267 popes in the official count, from Peter to Leo XIV, with the year each began. Pope-elect Stephen (752) is shown but not numbered; Benedict IX held the office three times and is counted once.':'Every archbishop from Augustine, with the year each began. Some lists differ by a few names; the Church of England counts Sarah Mullally as the 106th.'} The earliest dates are traditional.</p>`+lRows(L,col) }
  else { for(let c=1;c<=21;c++){ const v=col.c[c]; if(v) h+=`<div class="lin-step"><span>${lOrd(c)} c.</span><div>${lBadge(v[0])}<b>${esc(v[1])}</b>${v[2]?`<small>${esc(v[2])}</small>`:''}${v[3]?`<p>${esc(v[3])}</p>`:''}</div></div>` }
    if(col.today) h+=`<div class="lin-step tdy"><span>Today</span><div><b>${esc(col.today[1])}</b><small>${esc(col.today[2])}</small>${col.today[3]?`<p>${esc(col.today[3])}</p>`:''}</div></div>`;
    h+='<p class="note">These are selected milestones, not a complete list of leaders.</p>' }
  el.innerHTML=h+'</div>' }} }
ACT.linkey=()=>Sheet.open({title:'How to read the tree',render(el){ el.innerHTML=`<div class="prose"><p>Every card has a coloured edge that tells you where the information comes from:</p>
  ${Object.values(LK).map(([n,c])=>`<p style="margin:6px 0"><span class="lk-b" style="background:${c}">${n}</span> ${{'Scripture':'stated in the Bible','Ancient tradition':'early writers outside the Bible, such as Jubilees, Hegesippus or Eusebius','Medieval legend':'stories first written down centuries later','Recorded history':'historical records of real people and offices','Modern theory':'claims from the last 200 years without an ancient source. Shown so you can see them, not because they are likely true.'}[n]}</p>`).join('')}
  <p><span class="lk-b" style="background:#d6336c">Pink</span> marks the five women Matthew names. Faded cards with dashed edges are kings Matthew leaves out, and Cainan, who appears only in Luke.</p>
  <p>The thin column on the left is Luke's version of the line, from Nathan to Heli. It meets Matthew's at Shealtiel and Zerubbabel.</p>
  <p>Below Jesus, each column is a church that traces its leaders to an apostle. Rome and Canterbury show every leader; the others show selected milestones. Present-day leaders were checked in November 2026.</p>
  <p class="note">Family data: Theographic Bible Metadata (CC BY-SA 4.0). Leader lists: Wikidata. Dates before about AD 200 are traditional.</p></div>` }});
