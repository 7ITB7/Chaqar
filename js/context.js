'use strict';
/* Meaning in context: who each book was written for, how a word was used era by era,
   and English words in the old translations whose meaning has changed since. */
const CTX={old:null,oldOn:Store.get('oldw',true),fam:{}};
const OLD_TR={KJV:1,GNV:1,TYN:1,DRC:1};
const bookCtx=async b=>{const d=await J('books.json'); return d&&d.books[b]?Object.assign({id:b},d.books[b]):null};
const eraOf=async k=>{const d=await J('books.json'); const e=d&&d.eras.find(x=>x[0]===k); return e||[k,k,'']};

/* ----- old English in the reader ----- */
async function oldWords(){ if(!CTX.old){const d=await J('kjvwords.json'); CTX.old=(d||[]).map((w,i)=>Object.assign(w,{i,rx:new RegExp('\\b('+w.f+')\\b','gi')}))} return CTX.old }
const oldActive=tr=>CTX.oldOn&&OLD_TR[tr];
/* escape a verse and wrap the changed words; needs oldWords() loaded first */
function markOld(t,b,c,v){
  if(!CTX.old||!t) return esc(t); const ref=b+'.'+c+'.'+v, hits=[];
  for(const w of CTX.old){ if(w.r&&!w.r.includes(ref)) continue; w.rx.lastIndex=0; let m;
    while((m=w.rx.exec(t))){const s=m.index,e=s+m[0].length; if(!hits.some(h=>s<h[1]&&e>h[0])) hits.push([s,e,w.i])} }
  if(!hits.length) return esc(t); hits.sort((a,b)=>a[0]-b[0]); let o='',p=0;
  for(const h of hits){o+=esc(t.slice(p,h[0]))+`<span class="oldw ${CTX.old[h[2]].k}" data-act="oldword" data-i="${h[2]}">${esc(t.slice(h[0],h[1]))}</span>`; p=h[1]}
  return o+esc(t.slice(p));
}
ACT.oldword=(el,ev)=>{ if(ev) ev.stopPropagation(); openOld(+el.dataset.i, el.textContent)};
function openOld(i,said){const w=CTX.old[i]; if(!w) return; const x=dotRef(w.x);
  const o={title:said||w.f.split('|')[0],render(el){
    el.innerHTML=`<span class="tag ${w.k==='shift'?'g':''}">${w.k==='shift'?'Meaning has changed':'No longer used'}</span>
    <div class="then"><div class="lbl">In 1611 it meant</div><p>${esc(w.m)}</p></div>`+
    (w.n?`<div class="now"><div class="lbl">Not what it means today</div><p>${esc(w.n)}</p></div>`:'')+
    `<div class="lbl" style="margin:18px 0 4px">Example</div><button class="ref" data-act="goref" data-ref="${w.x}"><b>${esc(refStr(x.b,x.c,x.v))}</b><span id="ow-x">…</span></button>
    <p class="note" style="margin-top:16px">English has moved on since the King James Version. These words are marked with a dotted line in the KJV, Geneva, Tyndale and Douay-Rheims. Words like "let" are only marked where they carry the old sense.</p>
    <div class="row" style="margin-top:12px"><button class="btn sm" data-act="oldlist">All ${CTX.old.length} words</button><button class="btn sm" data-act="oldtoggle">Stop marking them</button></div>`;
    verseText('KJV',x.b,x.c,x.v).then(t=>{const s=$('#ow-x'); if(s) s.innerHTML=markOld(t,x.b,x.c,x.v)});
  }}; Sheet.stack.length?Sheet.push(o):Sheet.open(o)}
ACT.oldtoggle=()=>{CTX.oldOn=!CTX.oldOn; Store.set('oldw',CTX.oldOn); toast(CTX.oldOn?'Marking words whose meaning has changed':'No longer marking old words'); Sheet.close(); if(curTab==='words'&&W.tab==='old') renderWords(); renderRead()};
ACT.oldlist=()=>{Sheet.close(); W.tab='old'; go('words'); renderWords()};

/* ----- the first readers of a book ----- */
ACT.bookctx=el=>openBookCtx(el.dataset.b);
async function openBookCtx(b){const k=await bookCtx(b); if(!k){toast('No setting on file for this book');return} const era=await eraOf(k.e); const d=await J('books.json');
  const same=Object.keys(d.books).filter(x=>x!==b&&d.books[x].e===k.e);
  const o={title:bname(b),full:true,render(el){
    el.innerHTML=ctxCard(k,era)+`<div class="row" style="margin-top:14px"><button class="btn pri sm" data-act="goref" data-ref="${b}.1.0">Read ${esc(bname(b))}</button><button class="btn sm" data-act="ctxtab">All books by era</button></div>`+
    (same.length?`<div class="lbl" style="margin:20px 0 8px">Written for the same world</div><div class="chips">`+same.map(x=>`<button class="chip" data-act="bookctx" data-b="${x}">${esc(bname(x))}</button>`).join('')+'</div>':'');
  }}; Sheet.stack.length?Sheet.push(o):Sheet.open(o)}
function ctxCard(k,era){
  const row=(l,t,c)=>t?`<div class="ctxrow ${c||''}"><div class="lbl">${l}</div><p>${esc(t)}</p></div>`:'';
  return `<span class="tag g">${esc(era[1])}</span><span class="tag">${esc(k.l)}</span>`+
  row('Written',k.d)+row('By',k.by)+row('First readers',k.to)+row('Their world',k.w)+row('Where scholars differ',k.q,'q');
}
ACT.ctxtab=()=>{Sheet.close(); W.tab='ctx'; go('words'); renderWords()};
/* one line under the chapter heading */
async function ctxLine(b){const k=await bookCtx(b); if(!k) return ''; return `<button class="ctxline" data-act="bookctx" data-b="${b}"><span class="lbl">First readers</span><span class="t">${esc(k.to)} · ${esc(k.d)}</span><i>›</i></button>`}

/* verse panel: setting tab */
async function vSetting(el,b,c,v){
  el.innerHTML='<p class="load">Loading…</p>'; const k=await bookCtx(b);
  if(!k){el.innerHTML='<p class="note">No setting on file for this book yet. Settings cover the 66 books of the Protestant canon.</p>';return}
  const era=await eraOf(k.e); let h=ctxCard(k,era);
  await oldWords(); const t=await verseText('KJV',b,c,v), seen=new Set(), found=[];
  if(t){const ref=b+'.'+c+'.'+v; for(const w of CTX.old){ if(w.r&&!w.r.includes(ref)) continue; w.rx.lastIndex=0; const m=w.rx.exec(t); if(m&&!seen.has(w.i)){seen.add(w.i); found.push([w,m[0]])} }}
  if(found.length) h+=`<div class="lbl" style="margin:20px 0 6px">English that has changed in this verse (KJV)</div>`+found.map(([w,s])=>`<button class="li" data-act="oldword" data-i="${w.i}"><h3>${esc(s)}</h3><p>Meant: ${esc(w.m)}</p></button>`).join('');
  h+=`<p class="note" style="margin-top:18px">To see how any word in this verse was used across the eras, open the Words tab above and tap a word.</p>`;
  el.innerHTML=h;
}

/* ----- dictionary: a word through time ----- */
async function lexTime(e,box){
  const L=e.key[0], [u,d]=await Promise.all([J(`lex/u${L}.json`),J('books.json')]); if(!box.isConnected) return;
  const x=u&&u[e.key]; if(!x||!d){box.innerHTML='';return}
  const per={}; let tot=0; for(const [bi,n] of x.b){const k=d.books[IDS[bi]]; if(!k) continue; (per[k.e]=per[k.e]||{n:0,b:[]}).n+=n; per[k.e].b.push([bi,n]); tot+=n}
  const eras=d.eras.filter(r=>per[r[0]]), mx=Math.max(...eras.map(r=>per[r[0]].n));
  let h=`<div class="lbl" style="margin:20px 0 4px">Through time</div><p class="sub" style="margin:0 0 10px">All ${tot.toLocaleString()} uses, grouped by the world each book was first written for, with how the word-by-word English renders it there. Tap an era for its books.</p>`;
  h+=eras.map(r=>{const p=per[r[0]], g=(x.e[r[0]]||[]).map(a=>`${esc(a[0])} <b>${a[1]}</b>`).join(' · ');
    return `<details class="era"><summary><span class="en">${esc(r[1])}</span><i style="width:${Math.max(3,Math.round(p.n/mx*100))}%"></i><b>${p.n}</b></summary>${g?`<p class="gl">${g}</p>`:''}<div class="chips">`+
      p.b.sort((a,b)=>b[1]-a[1]).map(([bi,n])=>`<button class="chip" data-act="bookctx" data-b="${IDS[bi]}">${esc(BOOKS[bi][1])} ${n}</button>`).join('')+'</div></details>'}).join('');
  if(x.p&&x.p.length) h+=`<div class="lbl" style="margin:20px 0 4px">Heard alongside</div><p class="sub" style="margin:0 0 8px">Words that share a verse with it far more often than chance would give. They show what the first hearers linked it with.</p><div class="chips" id="lx-p">`+x.p.map(s=>`<button class="chip" data-act="lex" data-s="${s}">${s[0]}${+s.slice(1,5)}</button>`).join('')+'</div>';
  const fam=await family(e); if(fam.length) h+=`<div class="lbl" style="margin:20px 0 4px">Word family</div><p class="sub" style="margin:0 0 8px">The root it comes from (first), then words built from it or from the same root, as the dictionary traces them. A shared root often shows the picture behind the meaning.</p><div class="chips" id="lx-f">`+fam.map(s=>`<button class="chip" data-act="lex" data-s="${s}">${s[0]}${+s.slice(1,5)}</button>`).join('')+'</div>';
  box.innerHTML=h;
  for(const s of [...(x.p||[]),...fam]){lexEntry(s).then(z=>{ if(!z) return; for(const c of $$(`#lx-p [data-s="${s}"],#lx-f [data-s="${s}"]`)) c.innerHTML=`<span class="${s[0]==='H'?'heb':'grk'}" style="font-size:16px">${esc(z.l)}</span> ${esc(z.g)}`})}
}
async function family(e){const L=e.key[0], d=await loadLex(L); if(!d) return [];
  const nums=o=>{const r=[]; if(o) for(const m of o.matchAll(new RegExp('\\b'+L+'(\\d{1,4})\\b','g'))) if(!r.includes(+m[1])) r.push(+m[1]); return r};
  if(!CTX.fam[L]){const f={}; for(const k in d) for(const n of nums(d[k].o)) (f[n]=f[n]||[]).push(k); CTX.fam[L]=f}
  const keyOf=n=>{const b=L+String(n).padStart(4,'0'); return d[b]?b:(LEX.idx[L][b]||[]).slice().sort((x,y)=>(d[y].n||0)-(d[x].n||0))[0]};
  const base=k=>k.replace(/[A-Z]$/,''), mine=base(e.key), n=+e.key.slice(1,5), F=CTX.fam[L], out=[], add=k=>{if(k&&base(k)!==mine&&!out.some(x=>base(x)===base(k))) out.push(k)};
  const parents=nums(e.o); parents.forEach(p=>add(keyOf(p)));                    /* the root it comes from */
  (F[n]||[]).slice().sort((a,b)=>(d[b].n||0)-(d[a].n||0)).forEach(add);          /* words formed from it */
  parents.forEach(p=>(F[p]||[]).slice().sort((a,b)=>(d[b].n||0)-(d[a].n||0)).forEach(add)); /* built on the same root */
  return out.slice(0,14);
}

/* ----- Words tab: first readers, era by era ----- */
async function wCtx(el){
  el.innerHTML='<p class="load">Loading…</p>'; const d=await J('books.json'); if(!d){el.innerHTML='<p class="load">Could not load.</p>';return}
  let h=`<div class="prose"><p>A word means what it meant to the people it was first said to. Each book below was written for a particular people, in a particular world. Read it as they would have heard it first.</p></div>`;
  for(const r of d.eras){const bs=Object.keys(d.books).filter(b=>d.books[b].e===r[0]).sort((a,b)=>d.books[a].y-d.books[b].y||BI[a]-BI[b]);
    h+=`<div class="eraH"><h3>${esc(r[1])}</h3><p>${esc(r[2])}</p></div>`+bs.map(b=>{const k=d.books[b]; return `<button class="li ctxli" data-act="bookctx" data-b="${b}"><h3>${esc(bname(b))} <small>${esc(k.d)}</small></h3><p>${esc(k.to)}</p></button>`}).join('')}
  el.innerHTML=h+'<p class="note" style="margin-top:18px">Dates are approximate. Where most critical scholars date a book differently from the traditional view, its card says so.</p>';
}
/* ----- Words tab: 1611 English ----- */
async function wOld(el){
  el.innerHTML='<p class="load">Loading…</p>'; const L=await oldWords(); const f=W.oldf||'all';
  el.innerHTML=`<div class="prose"><p>The King James Version was made in 1611. Since then, some of its English has dropped out of use, and some has quietly changed meaning. "Prevent" meant <i>go before</i>. "Conversation" meant <i>way of life</i>. Readers today can take the opposite sense without knowing it.</p></div>
  <div class="row" style="margin:6px 0 12px"><button class="chip ${CTX.oldOn?'on':''}" data-act="oldtoggle">${CTX.oldOn?'✓ Marked in the reader':'Not marked in the reader'}</button></div>
  <div class="chips" style="margin-bottom:12px">`+[['all','All '+L.length],['shift','Meaning changed'],['old','Dropped out']].map(x=>`<button class="chip ${x[0]===f?'on':''}" data-act="oldf" data-k="${x[0]}">${x[1]}</button>`).join('')+'</div>'+
  L.filter(w=>f==='all'||w.k===f).slice().sort((a,b)=>a.f.localeCompare(b.f)).map(w=>`<button class="li ctxli" data-act="oldword" data-i="${w.i}"><h3>${esc(w.f.split('|')[0])} <small>${esc(dotStr(w.x))}</small></h3><p><b>Then:</b> ${esc(w.m)}${w.n?`<br><span style="color:var(--dim)">Not: ${esc(w.n)}</span>`:''}</p></button>`).join('');
}
ACT.oldf=el=>{W.oldf=el.dataset.k; wOld($('#wbody'))};
