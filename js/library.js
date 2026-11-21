'use strict';
const LB={tab:'ms',X:null,MS:null};
VIEW.lib=()=>{ if(!$('#lib').firstChild) renderLib() };
function renderLib(){
  $('#lib').innerHTML=`<h2 class="sec rub">Library</h2><p class="sub">The oldest Bibles and their art, the books left out, and the two great manuscript finds of the last century.</p>`+seg([['ms','Old Bibles and art'],['x','Lost books'],['dss','Dead Sea Scrolls'],['nh','Nag Hammadi']],LB.tab,'ltab')+'<div id="lbody"></div>';
  ({ms:lMs,x:lX,dss:lDss,nh:lNh})[LB.tab]($('#lbody'));
}
ACT.ltab=el=>{LB.tab=el.dataset.k; renderLib()};
const thumb=u=>u.replace(/\/\d+px-/,'/330px-');
const yr=y=>y<0?(-y)+' BC':'AD '+y;

async function lMs(el){
  el.innerHTML='<p class="load">Loading…</p>'; const d=LB.MS||(LB.MS=await J('manuscripts.json')); if(!d){el.innerHTML='<p class="load">Could not load.</p>';return}
  const list=d.slice().sort((a,b)=>a.y-b.y);
  el.innerHTML=`<p class="note">${list.length} manuscripts and printed Bibles in date order, about ${d.reduce((n,m)=>n+m.pics.length,0)} photographs. Tap one for its pages and where to see the whole book online.</p>`+list.map(m=>`<button class="ms" data-act="ms" data-id="${m.id}"><div class="th${m.pics[0]?'':' th0'}" style="${m.pics[0]?`background-image:url('${esc(thumb(m.pics[0].u))}'),var(--thph)`:''}"></div><div><div class="yr">${esc(m.d)}</div><h3>${esc(m.t)}</h3><p>${esc(m.b)}</p></div></button>`).join('');
}
ACT.ms=el=>{const m=LB.MS.find(x=>x.id===el.dataset.id); Sheet.open({title:m.t,full:true,render(e2){
  e2.innerHTML=`<div class="lbl" style="color:var(--red)">${esc(m.d)} · ${esc(m.k)}</div><div class="prose" style="margin-top:10px"><p>${esc(m.b)}</p></div><p class="sub">Held at: ${esc(m.w)}</p>
  <div class="row">${m.link?`<a class="btn pri sm" href="${esc(m.link)}" target="_blank" rel="noopener">${esc(m.linkname)} ↗</a>`:''}<a class="btn sm" href="https://en.wikipedia.org/wiki/${encodeURIComponent(m.wiki)}" target="_blank" rel="noopener">Background ↗</a></div>
  <div class="gal">${m.pics.map((p,i)=>`<button data-act="pic" data-id="${m.id}" data-i="${i}" style="background-image:url('${esc(thumb(p.u))}')" aria-label="${esc(p.c)}"></button>`).join('')}</div>
  <p class="note">Photos from Wikimedia Commons. Tap one to enlarge it and see its source and license.</p>`}})};
ACT.pic=el=>{const m=LB.MS.find(x=>x.id===el.dataset.id); Sheet.push({title:m.t,full:true,i:+el.dataset.i,render(e2){const p=m.pics[this.i];
  e2.innerHTML=`<div class="viewer"><img src="${esc(p.u)}" alt="${esc(p.c)}"></div><p class="def" style="font-size:15px">${esc(p.c)}</p><div class="row"><button class="btn sm" data-act="picn" data-d="-1">‹</button><span class="lbl">${this.i+1} of ${m.pics.length}</span><button class="btn sm" data-act="picn" data-d="1">›</button><a class="btn sm" href="${esc(p.p)}" target="_blank" rel="noopener" style="margin-left:auto">Full size, source, license ↗</a></div>`}})};
ACT.picn=el=>{const o=Sheet.top(), m=LB.MS.find(x=>x.t===o.title); o.i=(o.i+(+el.dataset.d)+m.pics.length)%m.pics.length; Sheet.redraw()};

/* lost books */
async function loadX(){return LB.X||(LB.X=await J('x/index.json'))}
async function lX(el){
  el.innerHTML='<p class="load">Loading…</p>'; const X=await loadX(); if(!X){el.innerHTML='<p class="load">Could not load.</p>';return}
  el.innerHTML=`<p class="note">${X.length} complete texts you can read here. ${DEUT_NOTE}</p><div class="row" style="margin-bottom:8px"><button class="btn sm" data-act="goref" data-ref="TOB.1.1">Open the Deuterocanon (Tobit 1)</button></div>`+XGROUPS.map(g=>`<h3 class="sec" style="font-size:20px">${g[1]}</h3><p class="sub" style="margin-bottom:4px">${g[2]}</p>`+X.filter(x=>x.g===g[0]).map(x=>`<button class="li" data-act="xt" data-id="${x.id}"><div class="lbl">${esc(x.d)}</div><h3>${esc(x.t)}</h3><p>${esc(x.b)}</p></button>`).join('')).join('');
}
ACT.xt=el=>openText(el.dataset.id);
async function openText(id){const X=await loadX(), meta=X.find(x=>x.id===id); if(!meta) return;
  const o={title:meta.t,full:true,ci:Store.get('x.'+id,0),d:null,render(el){
    if(!o.d){el.innerHTML='<p class="load">Opening…</p>'; J('x/'+id+'.json').then(d=>{o.d=d||{c:[]}; if(Sheet.top()===o) Sheet.redraw()}); return}
    const cs=o.d.c; if(!cs.length){el.innerHTML='<p class="load">Could not load this text.</p>';return}
    if(o.ci>=cs.length) o.ci=0; const ch=cs[o.ci];
    el.innerHTML=`<div class="lbl" style="color:var(--red)">${esc(meta.d)}</div><p class="sub" style="margin:6px 0 4px">${esc(meta.b)}</p><p class="sub">Translation: ${esc(meta.cr)}</p>`+
    (cs.length>1?`<select class="inp" data-chg="xsel">${cs.map((c,i)=>`<option value="${i}" ${i===o.ci?'selected':''}>${esc(c.h||('Part '+(i+1)))}</option>`).join('')}</select>`:'')+
    `<div class="xt">${ch.h?`<h3>${esc(ch.h)}</h3>`:''}${ch.v.map((t,i)=>`<p class="vs" style="cursor:default">${ch.v.length>1?`<sup>${i+1}</sup>`:''}${esc(t)}</p>`).join('')}</div>`+
    (cs.length>1?`<div class="rd-nav"><button class="btn" data-act="xnav" data-d="-1" ${o.ci?'':'disabled'}>‹ Previous</button><button class="btn" data-act="xnav" data-d="1" ${o.ci<cs.length-1?'':'disabled'}>Next ›</button></div>`:'')}};
  o.id=id; (Sheet.stack.length?Sheet.push(o):Sheet.open(o)) }
ACT.xsel=el=>{const o=Sheet.top(); o.ci=+el.value; Store.set('x.'+o.id,o.ci); Sheet.redraw(); $('#sheet-body').scrollTop=0};
ACT.xnav=el=>{const o=Sheet.top(); o.ci+=+el.dataset.d; Store.set('x.'+o.id,o.ci); Sheet.redraw(); $('#sheet-body').scrollTop=0};

const facts=a=>'<div class="card" style="cursor:default">'+a.map(f=>`<p style="color:var(--ink);margin:0 0 6px">· ${esc(f)}</p>`).join('')+'</div>';
const links=a=>a.map(l=>`<a class="card" href="${esc(l[1])}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><h3>${esc(l[0])} ↗</h3><p>${esc(l[2])}</p></a>`).join('');
function lDss(el){
  const groups=[...new Set(DSS.map(d=>d.g))];
  el.innerHTML=facts(DSS_FACTS)+`<p class="note">Modern English translations of the scrolls are under copyright, so the scrolls are described here and linked to the official photographs. Books that were found at Qumran and have public-domain translations (1 Enoch, Jubilees, Tobit, Psalm 151) open inside this app.</p>`+links(DSS_LINKS)+
  groups.map(g=>`<h3 class="sec" style="font-size:20px">${esc(g)}</h3>`+DSS.filter(d=>d.g===g).map(d=>`<div class="li"><div class="lbl">${esc(d.s)} · ${esc(d.d)}</div><h3>${esc(d.n)}</h3><p>${esc(d.b)}</p><div class="row" style="margin-top:8px">${d.u?`<a class="btn sm" href="${esc(d.u)}" target="_blank" rel="noopener">View the scroll ↗</a>`:''}${d.iss?`<button class="btn sm" data-act="issue" data-id="${d.iss}">What it changed</button>`:''}${d.x?`<button class="btn sm" data-act="xt" data-id="${d.x}">Read it here</button>`:''}${d.rd?`<button class="btn sm" data-act="goref" data-ref="${d.rd[0]}.${d.rd[1]}.1">Read it here</button>`:''}</div></div>`).join('')).join('');
}
function lNh(el){
  el.innerHTML=facts(NH_FACTS)+`<p class="note">${NH_NOTE}</p><div class="row" style="margin-bottom:12px"><button class="btn sm" data-act="xt" data-id="gmary">Gospel of Mary</button><button class="btn sm" data-act="xt" data-id="gjudas">Gospel of Judas</button></div>`+links(NH_LINKS)+
  NH.map(c=>`<h3 class="sec" style="font-size:20px">Codex ${c[0]}${c[1]?' · '+esc(c[1]):''}</h3>`+c[2].map((t,i)=>`<div class="li"><h3>${i+1}. ${esc(t[0])}${t[2]?'<small>in this app</small>':''}</h3><p>${esc(t[1])}</p><div class="row" style="margin-top:8px">${t[2]?`<button class="btn sm pri" data-act="xt" data-id="${t[2]}">Read it here</button>`:`<a class="btn sm" href="https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(t[0]+' Nag Hammadi')}" target="_blank" rel="noopener">About this text ↗</a>`}</div></div>`).join('')).join('');
}
