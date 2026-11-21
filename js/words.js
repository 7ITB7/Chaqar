'use strict';
const W={tab:'issues',filter:'all',lang:'H',q:''};
VIEW.words=()=>{ if(!$('#words').firstChild) renderWords() };
function renderWords(){
  const el=$('#words');
  let h=`<h2 class="sec rub">Words</h2><p class="sub">Where translators disagree, what the Hebrew and Greek say, and where the manuscripts differ.</p>`+seg([['issues','Disputed passages'],['lex','Dictionary'],['ctx','First readers'],['old','1611 English'],['var','Manuscripts']],W.tab,'wtab')+'<div id="wbody"></div>';
  el.innerHTML=h; ({issues:wIssues,lex:wLex,ctx:wCtx,old:wOld,var:wVar})[W.tab]($('#wbody'));
  const on=$('#words .seg .on'); if(on) on.scrollIntoView({block:'nearest',inline:'center'});
}
ACT.wtab=el=>{W.tab=el.dataset.k; renderWords()};

/* ----- disputed passages ----- */
function wIssues(el){
  const f=W.filter, list=ISSUES.filter(i=>f==='all'||i.k===f);
  el.innerHTML=`<div class="chips" style="margin-bottom:14px">`+[['all','All '+ISSUES.length],['word',IK.word[0]],['text',IK.text[0]],['trad',IK.trad[0]]].map(x=>`<button class="chip ${x[0]===f?'on':''}" data-act="wfilter" data-k="${x[0]}">${x[1]}</button>`).join('')+'</div>'+
  list.map(i=>`<button class="card" data-act="issue" data-id="${i.id}"><span class="tag ${IK[i.k][1]}">${IK[i.k][0]}</span><h3 style="margin-top:6px">${esc(i.t)}</h3><p>${esc(i.x)}</p></button>`).join('');
}
ACT.wfilter=el=>{W.filter=el.dataset.k; wIssues($('#wbody'))};
ACT.issue=el=>openIssue(el.dataset.id);
function openIssue(id){const it=ISSUES.find(i=>i.id===id); if(!it) return;
  Sheet.open({title:it.t,full:true,render(el){
    let h=`<span class="tag ${IK[it.k][1]}">${IK[it.k][0]}</span><div class="prose" style="margin-top:12px">${it.body}</div>`;
    if(it.s.length) h+=`<div class="lbl" style="margin:16px 0 8px">The words</div><div class="chips" id="iss-w">`+it.s.map(s=>`<button class="chip" data-act="lex" data-s="${s}">${s}</button>`).join('')+'</div>';
    h+=`<div class="lbl" style="margin:20px 0 4px">See it in the text</div>`;
    it.refs.forEach((r,ri)=>{const q=dotRef(r); h+=`<div style="margin:12px 0 2px" class="row"><b style="font-family:var(--sans);font-size:13px;color:var(--gold)">${esc(dotStr(r))}</b><button class="btn sm" data-act="goref" data-ref="${r}" style="margin-left:auto">Open</button><button class="btn sm" data-act="vwords" data-ref="${r}">Word by word</button></div>`;
      for(const t of it.cmp){ if(hasBook(t,q.b)) h+=`<div class="cmp"><b>${t}</b><span class="${lcls(t)}" id="ic${ri}${t}">…</span></div>` }});
    el.innerHTML=h;
    it.refs.forEach((r,ri)=>{const q=dotRef(r); for(const t of it.cmp){ if(hasBook(t,q.b)) verseText(t,q.b,q.c,q.v).then(x=>{const s=$('#ic'+ri+t); if(s){s.textContent=x||'not in this text'; if(!x) s.parentNode.classList.add('none')}}) }});
    /* label the word chips once the dictionary is in */
    it.s.forEach(async s=>{const e=await lexEntry(s); const b=$(`#iss-w [data-s="${s}"]`); if(e&&b) b.innerHTML=`<span class="${s[0]==='H'?'heb':'grk'}" style="font-size:17px">${esc(e.l)}</span> ${esc(e.t)}`});
  }})}
ACT.vwords=el=>{const r=dotRef(el.dataset.ref); Sheet.push({title:refStr(r.b,r.c,r.v),tab:'words',b:r.b,c:r.c,v:r.v,render(e2){e2.innerHTML=seg([['compare','Compare'],['words','Words'],['setting','First readers'],['links','Links'],['note','Note']],this.tab,'vtab')+'<div id="vp"></div>'; ({compare:vCompare,words:vWords,setting:vSetting,links:vLinks,note:vNote})[this.tab]($('#vp',e2),r.b,r.c,r.v)}})};

/* ----- dictionary ----- */
const LEX={H:null,G:null,idx:{}};
async function loadLex(L){ if(!LEX[L]){const d=await J(`lex/${L}.json`); if(!d) return null; LEX[L]=d; const ix={}; for(const k in d){const b=k.replace(/[A-Za-z]$/,''); (ix[b]=ix[b]||[]).push(k)} LEX.idx[L]=ix} return LEX[L] }
function normS(s){const m=String(s).toUpperCase().match(/^([HG])0*(\d+)([A-Z]?)$/); return m?m[1]+m[2].padStart(4,'0')+m[3]:null}
async function lexEntry(s){const k=normS(s); if(!k) return null; const d=await loadLex(k[0]); if(!d) return null;
  if(d[k]) return Object.assign({},d[k],{key:k}); const b=k.replace(/[A-Z]$/,''); const c=(LEX.idx[k[0]][b]||[]).slice().sort((x,y)=>(d[y].n||0)-(d[x].n||0))[0]; return c?Object.assign({},d[c],{key:c}):null}
ACT.lex=el=>openLex(el.dataset.s);
function openLex(s){ if(!s){toast('No dictionary number for this word');return}
  const o={title:'Dictionary',full:true,shown:30,render(el){
    if(!o.e){el.innerHTML='<p class="load">Opening the dictionary… (a few MB the first time)</p>'; lexEntry(s).then(e=>{o.e=e||{none:1}; if(Sheet.top()===o) Sheet.redraw()}); return}
    const e=o.e; if(e.none){el.innerHTML=`<p class="note">No entry found for ${esc(s)}.</p>`;return}
    const L=e.key[0], num=L+(+e.key.slice(1,5)); const mx=e.r&&e.r.length?e.r[0][1]:1;
    let h=`<div class="lex-h"><span class="${L==='H'?'heb':'grk'}">${esc(e.l)}</span><em>${esc(e.t)}</em></div><div class="lbl" style="margin-top:6px">${L==='H'?'Hebrew':'Greek'} · Strong's ${num}${e.n?' · used '+e.n.toLocaleString()+' times':''}</div>
    <p class="def"><b>${esc(e.g)}</b></p>`;
    if(e.s) h+=`<p class="def">${esc(e.s)}</p>`;
    if(e.o) h+=`<p class="def" style="color:var(--dim);font-size:14.5px">Origin: ${linkS(esc(e.o))}</p>`;
    if(e.d) h+=`<p class="def" style="font-size:14.5px">${e.d}</p>`;
    if(e.k) h+=`<p class="def" style="color:var(--dim);font-size:14.5px">King James renderings: ${esc(e.k)}</p>`;
    if(e.r&&e.r.length) h+=`<div class="lbl" style="margin:16px 0 8px">How it is translated here</div>`+e.r.map(r=>`<div class="bar"><span>${esc(r[0])}</span><i style="width:${Math.max(2,Math.round(r[1]/mx*40))}%"></i><b>${r[1]}</b></div>`).join('');
    h+=`<div id="lx-t"></div><div class="lbl" style="margin:18px 0 4px">Where it appears</div><div id="lx-c"><p class="load">Loading…</p></div>`;
    el.innerHTML=h; lexTime(e,$('#lx-t'));
    J(`lex/c${L}.json`).then(c=>{const box=$('#lx-c'); if(!box) return; const refs=c&&c[e.key]||[]; if(!refs.length){box.innerHTML='<p class="note">No occurrences on file.</p>';return}
      const show=refs.slice(0,o.shown); box.innerHTML=show.map((p,i)=>{const r=unpack(p); return `<button class="ref" data-act="goref" data-ref="${r.b}.${r.c}.${r.v}"><b>${esc(refStr(r.b,r.c,r.v))}</b><span id="lc${i}">…</span></button>`}).join('')+(refs.length>o.shown?`<button class="btn" data-act="lexmore" style="margin-top:12px;width:100%">Show more (${Math.min(refs.length,300)-o.shown} more${e.n>300?' of the first 300':''})</button>`:'');
      show.forEach((p,i)=>{const r=unpack(p); verseText('KJV',r.b,r.c,r.v).then(t=>{const x=$('#lc'+i); if(x) x.textContent=t})})});
  }}; (Sheet.stack.length?Sheet.push(o):Sheet.open(o)) }
const linkS=t=>t.replace(/\b([HG])(\d{1,4})\b/g,(m,l,n)=>`<a href="#" data-act="lex" data-s="${l}${n}">${m}</a>`);
ACT.lexmore=()=>{const o=Sheet.top(); o.shown+=60; const y=$('#sheet-body').scrollTop; Sheet.redraw(); setTimeout(()=>$('#sheet-body').scrollTop=y,60)};

function wLex(el){
  el.innerHTML=`<div class="row" style="margin-bottom:10px"><button class="chip ${W.lang==='H'?'on':''}" data-act="wlang" data-k="H">Hebrew · Old Testament</button><button class="chip ${W.lang==='G'?'on':''}" data-act="wlang" data-k="G">Greek · New Testament</button></div>
  <input class="inp" id="lq" value="${esc(W.q)}" placeholder="English word, Strong's number, or sound: love, 2617, agape" data-enter="lexsearch" enterkeyhint="search">
  <div class="row" style="margin:10px 0"><button class="btn pri sm" data-act="lexsearch">Look up</button></div><div id="lres"><p class="note">Every Hebrew and Greek word in the Bible, with its meaning, how often it is used, how it gets translated, and every verse it appears in. You can also reach an entry by tapping any verse in the reader and choosing Words.</p></div>`;
  if(W.q) lexSearch();
}
ACT.wlang=el=>{W.lang=el.dataset.k; W.q=$('#lq').value; wLex($('#wbody'))};
ACT.lexsearch=()=>{W.q=$('#lq').value; lexSearch()};
const plain=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,'');
async function lexSearch(){
  const out=$('#lres'), q=plain(W.q).trim(); if(!q) return;
  out.innerHTML='<p class="load">Opening the dictionary… (a few MB the first time)</p>';
  const d=await loadLex(W.lang); if(!d){out.innerHTML='<p class="load">Could not load the dictionary.</p>';return}
  const num=q.match(/^[hg]?\s*(\d{1,4})$/); const res=[];
  for(const k in d){const e=d[k]; let sc=0;
    if(num){ if(+k.slice(1,5)===+num[1]) sc=1000 }
    else { const g=plain(e.g), t=plain(e.t).replace(/ /g,''), kj=plain(e.k);
      if(g===q) sc=900; else if(g.split(/[ ]+/).includes(q)) sc=600; else if(g.startsWith(q)) sc=450; else if(t===q.replace(/ /g,'')) sc=800; else if(t.startsWith(q.replace(/ /g,''))&&q.length>2) sc=300; else if((' '+kj+' ').includes(' '+q+' ')) sc=200; else if(g.includes(q)&&q.length>3) sc=120;
      if(sc) sc+=Math.log((e.n||0)+1)*12 }
    if(sc) res.push([sc,k,e]) }
  res.sort((a,b)=>b[0]-a[0]);
  out.innerHTML=res.length?res.slice(0,60).map(r=>`<button class="li" data-act="lex" data-s="${r[1]}"><h3><span class="${W.lang==='H'?'heb':'grk'}" style="font-size:21px">${esc(r[2].l)}</span> &nbsp;${esc(r[2].t)} <small>${r[1][0]}${+r[1].slice(1,5)}</small></h3><p>${esc(r[2].g)}${r[2].n?' · used '+r[2].n.toLocaleString()+' times':''}</p></button>`).join(''):'<p class="note">Nothing found. Try the other language, a simpler English word, or a Strong\'s number.</p>';
}

/* ----- manuscripts differ ----- */
async function wVar(el){
  el.innerHTML='<p class="load">Loading…</p>';
  const d=await J('variants.json'); if(!d){el.innerHTML='<p class="load">Could not load.</p>';return}
  const runs=[]; for(const x of d.whole){const l=runs[runs.length-1]; if(l&&l.b===x[0]&&l.c===x[1]&&l.v2===x[2]-1) l.v2=x[2]; else runs.push({b:x[0],c:x[1],v:x[2],v2:x[2]})}
  const byB={}; d.big.forEach(x=>{(byB[x[0]]=byB[x[0]]||[]).push(x)});
  let h=`<div class="prose"><p>The King James New Testament was translated from the <b>Textus Receptus</b>, a Greek text printed in the 1500s from a few late manuscripts. Modern translations use much older manuscripts found since, such as Codex Sinaiticus and Codex Vaticanus. The two Greek texts agree on the great majority of words.</p><p>This list is computed from word-by-word manuscript data for all 138,000 Greek words. It is not a list someone picked.</p></div>
  <div class="lbl" style="margin:16px 0 4px">Whole verses in the Textus Receptus that the oldest manuscripts lack</div>`+
  runs.map(r=>{const b=IDS[r.b]; return `<button class="ref" data-act="vwords" data-ref="${b}.${r.c}.${r.v}"><b>${esc(refStr(b,r.c,r.v))}${r.v2>r.v?'–'+r.v2:''}</b><span id="vr${r.b}_${r.c}_${r.v}">…</span></button>`}).join('')+
  `<div class="lbl" style="margin:22px 0 8px">Other verses with four or more words different</div><div class="chips">`+Object.keys(byB).map(b=>`<button class="chip" data-act="varbook" data-b="${b}">${esc(BOOKS[b][1])} ${byB[b].length}</button>`).join('')+'</div><div id="varlist"></div>';
  el.innerHTML=h; W.byB=byB;
  runs.forEach(r=>{const b=IDS[r.b]; verseText('KJV',b,r.c,r.v).then(t=>{const s=$(`#vr${r.b}_${r.c}_${r.v}`); if(s) s.textContent=t+(r.v2>r.v?' …':'')})});
}
ACT.varbook=el=>{const b=+el.dataset.b, list=W.byB[b]||[]; $$('#wbody .chip').forEach(c=>c.classList.toggle('on',c===el));
  $('#varlist').innerHTML=`<p class="note" style="margin-top:14px">Red count: words only in the Textus Receptus. Blue count: words only in the older text. Tap a verse to see which words.</p>`+list.map(x=>`<button class="hit" data-act="vwords" data-ref="${IDS[b]}.${x[1]}.${x[2]}"><b>${esc(IDS[b])} ${x[1]}:${x[2]}</b><span><span style="color:var(--red)">${x[3]} TR only</span> · <span style="color:var(--blue)">${x[4]} not in TR</span></span></button>`).join('')};
