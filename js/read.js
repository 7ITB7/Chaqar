'use strict';
const R={s:Object.assign({b:'GEN',c:1,tr:'KJV',alt:''},Store.get('pos',{})),marks:Store.get('marks',{})};
if(BI[R.s.b]==null||!TRI[R.s.tr]) R.s={b:'GEN',c:1,tr:'KJV',alt:''};
const mkey=(b,c,v)=>b+'.'+c+'.'+v;
const trFor=(b,pref)=>hasBook(pref,b)?pref:['KJV','WEB','DRC','BRE'].find(t=>hasBook(t,b));
const saveMarks=()=>Store.set('marks',R.marks);

async function renderRead(flashV){
  const s=R.s, el=$('#rd-text'), tr=trFor(s.b,s.tr);
  $('#rd-book').textContent=bname(s.b)+' '+s.c; $('#rd-tr').textContent=s.tr+(s.alt?' + '+s.alt:'');
  if(!el.firstChild) el.innerHTML='<p class="load">Opening…</p>';
  const d=await J(`t/${tr}/${s.b}.json`);
  if(!d){el.innerHTML=navigator.onLine?'<p class="load">Could not load this book. Check your connection and try again.</p>':`<p class="load">You are offline and ${esc(TRI[tr][0])} is not saved on this device yet.</p><div class="rd-nav"><button class="btn" data-act="offline">Save books for offline</button></div>`;return}
  if(s.c>d.length) s.c=d.length; if(s.c<1) s.c=1;
  $('#rd-book').textContent=bname(s.b)+' '+s.c;
  const ch=d[s.c-1]||[]; let alt=null;
  if(s.alt&&s.alt!==tr&&hasBook(s.alt,s.b)){const a=await J(`t/${s.alt}/${s.b}.json`); alt=a&&a[s.c-1]}
  const lc=lcls(tr), old=oldActive(tr); if(old) await oldWords();
  let h=`<h1 class="rub">${esc(bname(s.b))}</h1><div class="chap">${s.b==='PSA'?'Psalm':'Chapter'} ${s.c} · ${esc(TRI[tr][0])}</div>`+await ctxLine(s.b);
  if(tr!==s.tr) h+=`<p class="note">${esc(TRI[s.tr][0])} does not include ${esc(bname(s.b))}. Showing the ${esc(TRI[tr][0])}.</p>`;
  if(s.b==='PSA'&&LXXNUM[tr]) h+=`<p class="note">Greek and Latin Bibles number the Psalms differently. From Psalm 10 to 147 this is usually one behind the Hebrew and English number.</p>`;
  else if(HEBNUM[tr]&&HM&&HM[s.b]) h+=`<p class="note">This text uses Hebrew verse numbers, which differ from English Bibles in places.</p>`;
  let any=false;
  ch.forEach((t,i)=>{const a=alt&&alt[i]; if(!t&&!a) return; any=true; const v=i+1, m=R.marks[mkey(s.b,s.c,v)]||{};
    h+=`<p class="vs ${lc} ${m.h?'hl'+m.h:''}" data-act="verse" data-v="${v}"><sup>${v}</sup>${old?markOld(t,s.b,s.c,v):esc(t)}${m.bm?'<i class="bm">❧</i>':''}${m.n?'<i class="nt">✎</i>':''}${a?`<span class="alt ${lcls(s.alt)}">${esc(a)}</span>`:''}</p>`});
  if(!any) h+='<p class="load">This translation has no text for this chapter.</p>';
  h+=`<div class="rd-nav"><button class="btn" data-act="chap" data-d="-1">‹ Previous</button><button class="btn" data-act="chap" data-d="1">Next ›</button></div>`;
  if(BI[s.b]<66) h+=`<div class="rd-nav" style="margin-top:10px"><button class="btn" data-act="mapchap">◍ Places in this chapter</button></div>`;
  h+=`<p class="note" style="margin-top:22px">Tap any verse to compare translations, see the Hebrew or Greek word by word, follow cross-references, or add a note.</p>`;
  el.innerHTML=h; Store.set('pos',s);
  const view=$('#v-read');
  if(flashV){const p=$(`.vs[data-v="${flashV}"]`,el); if(p){p.scrollIntoView({block:'center'}); p.classList.add('flash')}} else view.scrollTop=0;
}
function goRef(b,c,v){R.s.b=b; R.s.c=c||1; Sheet.close(); go('read'); renderRead(v||0)}
VIEW.read=()=>{};

ACT.chap=async el=>{const s=R.s, d=+el.dataset.d, bi=BI[s.b];
  if(d<0){ if(s.c>1) s.c--; else if(bi>0){s.b=IDS[bi-1]; s.c=999} else return }
  else { const x=await J(`t/${trFor(s.b,s.tr)}/${s.b}.json`), n=x?x.length:nch(s.b); if(s.c<n) s.c++; else if(bi<IDS.length-1){s.b=IDS[bi+1]; s.c=1} else return }
  renderRead()};
ACT.mapchap=()=>{mapOpenBook(R.s.b,R.s.c)};
ACT.goref=el=>{const r=dotRef(el.dataset.ref); goRef(r.b,r.c,r.v)};

/* book + chapter picker */
ACT.pickbook=()=>Sheet.open({title:'Go to',render(el){
  const grp=[['ot','Old Testament'],['nt','New Testament'],['dc','Deuterocanon · Apocrypha']];
  el.innerHTML=`<input class="inp" placeholder="Type a reference: John 3:16" data-enter="jump" enterkeyhint="go" style="margin-bottom:14px">`+grp.map(g=>`<div class="lbl" style="margin:4px 0 8px">${g[1]}</div><div class="grid">`+BOOKS.filter(b=>b[2]===g[0]).map(b=>`<button data-act="pb" data-b="${b[0]}" class="${b[0]===R.s.b?'on':''}">${esc(b[1])}</button>`).join('')+'</div>').join('')}});
ACT.jump=el=>{const r=parseRef(el.value); if(r) goRef(r.b,r.c,r.v); else toast('Could not read that reference')};
ACT.pb=el=>{const b=el.dataset.b, n=nch(b); if(n<=1){goRef(b,1);return}
  Sheet.push({title:bname(b),render(e2){let h='<div class="grid num">'; for(let i=1;i<=n;i++) h+=`<button data-act="pc" data-b="${b}" data-c="${i}" class="${b===R.s.b&&i===R.s.c?'on':''}">${i}</button>`; e2.innerHTML=h+'</div>'}})};
ACT.pc=el=>goRef(el.dataset.b,+el.dataset.c);

/* translation picker */
ACT.picktr=()=>Sheet.open({title:'Translation',mode:'main',render(el){const o=this, cur=o.mode==='main'?R.s.tr:R.s.alt;
  el.innerHTML=seg([['main','Main text'],['alt','Second text underneath']],o.mode,'trmode')+(o.mode==='alt'?`<button class="trrow ${!cur?'on':''}" data-act="settr" data-tr=""><b>—</b><span>None</span></button>`:'')+
  TRO.map(t=>`<button class="trrow ${t===cur?'on':''}" data-act="settr" data-tr="${t}" ${hasBook(t,R.s.b)?'':'disabled'}><b>${t}</b><span>${esc(TRI[t][0])}<small>${esc([TRI[t][1],TRI[t][3]].filter(Boolean).join(' · '))}${hasBook(t,R.s.b)?'':' · not in this book'}</small></span></button>`).join('')}});
ACT.trmode=el=>{Sheet.top().mode=el.dataset.k; Sheet.redraw()};
ACT.settr=el=>{const o=Sheet.top(); if(o&&o.mode==='alt') R.s.alt=el.dataset.tr; else if(el.dataset.tr) R.s.tr=el.dataset.tr; Sheet.close(); go('read'); renderRead()};

/* verse panel */
ACT.verse=el=>openVerse(R.s.b,R.s.c,+el.dataset.v);
function openVerse(b,c,v,tab){Sheet.open({title:refStr(b,c,v),tab:tab||'compare',b,c,v,render(el){
  el.innerHTML=seg([['compare','Compare'],['words','Words'],['setting','First readers'],['links','Links'],['note','Note']],this.tab,'vtab')+'<div id="vp"></div>';
  ({compare:vCompare,words:vWords,setting:vSetting,links:vLinks,note:vNote})[this.tab]($('#vp',el),b,c,v)}})}
ACT.vtab=el=>{Sheet.top().tab=el.dataset.k; Sheet.redraw()};

function vCompare(el,b,c,v){
  for(const t of TRO){ if(!hasBook(t,b)) continue;
    const row=document.createElement('div'); row.className='cmp'; row.innerHTML=`<b>${t}</b><span class="${lcls(t)}">…</span>`; el.appendChild(row);
    verseText(t,b,c,v).then(x=>{row.lastChild.textContent=x||'not in this text'; if(!x) row.classList.add('none')}) }
  const n=document.createElement('p'); n.className='note'; n.textContent='Hebrew, Greek and Latin Bibles number some chapters and verses differently. Lines are matched to the English verse where the numbering is known; in a few books (Jeremiah in the Greek especially) a line can be off.'; el.appendChild(n);
}
async function vWords(el,b,c,v){
  if(BI[b]>65){el.innerHTML='<p class="note">Word-by-word data covers the 66 books of the Hebrew Bible and New Testament.</p>';return}
  el.innerHTML='<p class="load">Loading the original text…</p>';
  const d=await J(`il/${b}.json`), ws=d&&d[c-1]&&d[c-1][v-1];
  if(!ws||!ws.length){el.innerHTML='<p class="note">No word-by-word data for this verse.</p>';return}
  const ot=BI[b]<39; let flags=false;
  let h=`<div class="il ${ot?'rtl':''}">`+ws.map(w=>{const f=w[4]; let cl='',u=''; if(f===1){cl='f1';u='<u>TR only</u>'} else if(f===2){cl='f2';u='<u>not in TR</u>'} else if(f==='Q'){cl='fq';u='<u>read aloud</u>'} else if(f==='X'){cl='fq';u='<u>restored</u>'} if(f) flags=true;
    return `<button class="w ${cl}" data-act="lex" data-s="${esc(w[3])}"><span class="${ot?'heb':'grk'}">${esc(w[0])}</span><em>${esc(w[1])}</em><span class="gl">${esc(w[2])}</span>${u}</button>`}).join('')+'</div>';
  h+=`<p class="note">${ot?'Hebrew reads right to left. ':''}Tap a word for its dictionary entry and every place it is used.</p>`;
  if(flags&&!ot) h+=`<p class="note"><b style="color:var(--red)">TR only</b>: in the Textus Receptus (the Greek behind the KJV) but not in the oldest manuscripts used by modern editions. <b style="color:var(--blue)">Not in TR</b>: the reverse.</p>`;
  if(flags&&ot) h+=`<p class="note"><b style="color:var(--gold)">Read aloud</b>: the scribes' margin reading (qere), which differs from what is written in the text.</p>`;
  if(ot){const g=ws.reduce((t,w)=>t+gemHeb(w[0]),0); h+=`<p class="note">Letter value of this verse (gematria): <b>${g}</b></p>`}
  el.innerHTML=h;
}
async function vLinks(el,b,c,v){
  el.innerHTML='<p class="load">Loading…</p>';
  const [x,P]=await Promise.all([BI[b]<66?J(`xr/${b}.json`):null,J('places.json')]);
  const list=x&&x[c+':'+v]||[], pk=pack(b,c,v); let h='';
  const pl=[]; (P||[]).forEach((p,i)=>{if(p.v.includes(pk)) pl.push(i)});
  if(pl.length) h+=`<div class="lbl" style="margin-bottom:8px">Places in this verse</div><div class="chips" style="margin-bottom:18px">`+pl.map(i=>`<button class="chip" data-act="mapplace" data-i="${i}">◍ ${esc(P[i].n)}</button>`).join('')+'</div>';
  h+=`<div class="lbl">Cross-references</div>`;
  if(!list.length) h+='<p class="note">No cross-references on file for this verse.</p>';
  h+=list.map((r,i)=>`<button class="ref" data-act="goref" data-ref="${r}"><b>${esc(dotStr(r))}</b><span id="xr${i}">…</span></button>`).join('');
  el.innerHTML=h;
  list.forEach((r,i)=>{const q=dotRef(r); verseText('KJV',q.b,q.c,q.v).then(t=>{const s=$('#xr'+i); if(s) s.textContent=t})});
}
function vNote(el,b,c,v){
  const k=mkey(b,c,v), m=R.marks[k]||{}; const cols=['transparent','#d3ad55','#e05a36','#86a9de','#74b59b'];
  el.innerHTML=`<div class="lbl" style="margin-bottom:8px">Highlight</div><div class="row" style="margin-bottom:16px">`+cols.map((cl,i)=>`<button class="sw ${(m.h||0)===i?'on':''}" style="background:${cl}" data-act="hl" data-h="${i}" aria-label="Highlight ${i}">${i?'':'×'}</button>`).join('')+
  `</div><div class="row" style="margin-bottom:16px"><button class="btn ${m.bm?'pri':''}" data-act="bm">❧ ${m.bm?'Bookmarked':'Bookmark'}</button><button class="btn" data-act="copyv">Copy verse</button></div>
  <div class="lbl" style="margin-bottom:8px">Your note</div><textarea class="inp" data-inp="noteinp" placeholder="Write what you notice. Saved on this device only.">${esc(m.n||'')}</textarea>`;
}
function mark(fn){const o=Sheet.top(), k=mkey(o.b,o.c,o.v), m=R.marks[k]||{}; fn(m); m.t=Date.now(); if(!m.h&&!m.bm&&!m.n) delete R.marks[k]; else R.marks[k]=m; saveMarks();
  const p=$(`#rd-text .vs[data-v="${o.v}"]`); if(p&&o.b===R.s.b&&o.c===R.s.c){p.className=p.className.replace(/\bhl\d\b/g,'').trim()+(m.h?' hl'+m.h:'')}}
ACT.hl=el=>{mark(m=>m.h=+el.dataset.h); Sheet.redraw()};
ACT.bm=()=>{mark(m=>m.bm=!m.bm); Sheet.redraw()};
ACT.noteinp=el=>mark(m=>m.n=el.value.trim()?el.value:'');
ACT.copyv=async()=>{const o=Sheet.top(), tr=trFor(o.b,R.s.tr); const t=await verseText(tr,o.b,o.c,o.v); copyText(`${refStr(o.b,o.c,o.v)} (${tr})\n${t}`)};

/* search */
ACT.search=()=>Sheet.open({title:'Search',full:true,q:'',render(el){const tr=['KJV','BSB','WEB'].includes(R.s.tr)?R.s.tr:'KJV'; this.tr=this.tr||tr;
  el.innerHTML=`<input class="inp" id="sq" value="${esc(this.q)}" placeholder="A word, a phrase, or John 3:16" data-enter="dosearch" enterkeyhint="search">
  <div class="row" style="margin:10px 0">${['KJV','BSB','WEB'].map(t=>`<button class="chip ${t===this.tr?'on':''}" data-act="stre" data-tr="${t}">${t}</button>`).join('')}<button class="btn pri sm" data-act="dosearch" style="margin-left:auto">Search</button></div><div id="sres"><p class="note">Put a phrase in "quotes" to match it exactly. Otherwise every word must appear in the verse.</p></div>`;
  if(this.q) doSearch()}});
ACT.stre=el=>{const o=Sheet.top(); o.q=$('#sq').value; o.tr=el.dataset.tr; Sheet.redraw()};
ACT.dosearch=()=>{Sheet.top().q=$('#sq').value; doSearch()};
async function doSearch(){
  const o=Sheet.top(), q=o.q.trim(), out=$('#sres'); if(!q) return;
  const r=parseRef(q); if(r&&/\d/.test(q)){goRef(r.b,r.c,r.v);return}
  out.innerHTML='<p class="load">Searching the whole Bible…</p>';
  const all=await J(`t/${o.tr}/_all.json`); if(!all){out.innerHTML='<p class="load">Could not load the search text.</p>';return}
  let terms; const ph=q.match(/^"(.+)"$/); terms=ph?[ph[1].toLowerCase()]:q.toLowerCase().split(/\s+/).filter(Boolean);
  const res=[]; let n=0; const perB={};
  for(const b of IDS){const d=all[b]; if(!d) continue; for(let c=0;c<d.length;c++){const ch=d[c]; for(let v=0;v<ch.length;v++){const t=ch[v]; if(!t) continue; const lt=t.toLowerCase(); let ok=true; for(const w of terms){ if(lt.indexOf(w)<0){ok=false;break} } if(ok){n++; perB[b]=(perB[b]||0)+1; if(res.length<250) res.push([b,c+1,v+1,t])}}}}
  const rx=new RegExp('('+terms.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gi');
  const top=Object.entries(perB).sort((a,b)=>b[1]-a[1]).slice(0,6).map(e=>`${bname(e[0])} ${e[1]}`).join(' · ');
  out.innerHTML=`<p class="note"><b>${n.toLocaleString()}</b> verse${n===1?'':'s'} in the ${o.tr}${n>250?'. Showing the first 250':''}.${top?'<br>Most in: '+esc(top):''}</p>`+res.map(x=>`<button class="ref" data-act="goref" data-ref="${x[0]}.${x[1]}.${x[2]}"><b>${esc(refStr(x[0],x[1],x[2]))}</b><span>${esc(x[3]).replace(rx,'<mark>$1</mark>')}</span></button>`).join('');
}

/* notebook */
ACT.notebook=()=>Sheet.open({title:'Notebook',full:true,render(el){
  const ks=Object.keys(R.marks).sort((a,b)=>{const x=dotRef(a),y=dotRef(b); return pack(x.b,x.c,x.v)-pack(y.b,y.c,y.v)});
  if(!ks.length){el.innerHTML='<p class="note">Nothing saved yet. Tap any verse, choose Note, and highlight it, bookmark it or write on it. Everything stays on this device.</p>';return}
  el.innerHTML=`<div class="row" style="margin-bottom:12px"><button class="btn sm" data-act="nbcopy">Copy everything as text</button></div>`+ks.map(k=>{const m=R.marks[k]; return `<button class="ref ${m.h?'hl'+m.h:''}" data-act="goref" data-ref="${k}"><b>${m.bm?'❧ ':''}${esc(dotStr(k))}</b>${m.n?`<span>${esc(m.n)}</span>`:''}</button>`}).join('')}});
ACT.nbcopy=async()=>{let out=''; for(const k of Object.keys(R.marks)){const m=R.marks[k], r=dotRef(k); const t=await verseText(trFor(r.b,R.s.tr),r.b,r.c,r.v); out+=`${dotStr(k)}${m.bm?' [bookmark]':''}${m.h?' [highlight]':''}\n${t}\n${m.n?'Note: '+m.n+'\n':''}\n`} copyText(out)};
