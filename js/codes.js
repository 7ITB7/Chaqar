'use strict';
const C={tab:'trace',tw:'',th:'אמת',tdate:'now',term:'תורה',scope:'GEN',min:2,max:500,busy:false,stop:false,res:null,gl:'he',gt:'',at:'ששך',ab:'PSA',ac:119};
VIEW.codes=()=>{ if(!$('#codes').firstChild) renderCodes() };
function renderCodes(){
  $('#codes').innerHTML=`<h2 class="sec rub">Codes</h2><p class="sub">Search the text, the land and the sky for hidden patterns. Each tool shows how often chance alone would produce the same thing.</p>`+seg([['trace','Trace a word'],['pat','Pattern lab'],['els','Letter-skip codes'],['gem','Number values'],['atb','Atbash cipher'],['acr','Acrostics']],C.tab,'ctab')+'<div id="cbody"></div>';
  ({trace:cTrace,pat:cPat,els:cEls,gem:cGem,atb:cAtb,acr:cAcr})[C.tab]($('#cbody'));
}
ACT.ctab=el=>{C.tab=el.dataset.k; renderCodes()};
const kbHeb=act=>'<div class="kb">'+[...HEB].map(l=>`<button data-act="${act}" data-l="${l}">${l}</button>`).join('')+`<button class="fn" data-act="${act}" data-l="DEL">⌫ delete</button></div>`;

/* ---------- equidistant letter sequences ---------- */
const SCOPES={GEN:['Genesis',['GEN']],TORAH:['Torah (5 books)',IDS.slice(0,5)],TANAKH:['Whole Hebrew Bible',IDS.slice(0,39)]};
const TXT={};
async function loadHeb(scope){
  if(TXT[scope]) return TXT[scope];
  const books=SCOPES[scope][1], parts=await Promise.all(books.map(b=>J(`heb/${b}.json`))); if(parts.some(p=>!p)) return null;
  let N=0; parts.forEach(p=>N+=p.s.length);
  const a=new Uint8Array(N), off=[], ref=[], freq=new Float64Array(22); let pos=0;
  parts.forEach((p,bi)=>{const s=hebLetters(p.s); for(let i=0;i<s.length;i++){const x=HEB.indexOf(s[i]); a[pos+i]=x; freq[x]++} for(let i=0;i<p.o.length;i++){off.push(pos+p.o[i]); ref.push([books[bi],p.r[i]])} pos+=s.length});
  for(let i=0;i<22;i++) freq[i]/=N;
  return TXT[scope]={a,off,ref,freq,N};
}
function posRef(T,p){let lo=0,hi=T.off.length-1; while(lo<hi){const m=(lo+hi+1)>>1; if(T.off[m]<=p) lo=m; else hi=m-1} const r=T.ref[lo]; return {b:r[0],c:Math.floor(r[1]/1000),v:r[1]%1000,n:p-T.off[lo]+1}}
async function elsRun(a,term,min,max,limit,onp){
  const N=a.length, Ln=term.length, f=term[0], pos=[], res=[]; let count=0;
  for(let i=0;i<N;i++) if(a[i]===f) pos.push(i);
  for(let d=min;d<=max;d++){
    for(let sg=1;sg>=-1;sg-=2){const k=d*sg, span=(Ln-1)*k;
      for(let j=0;j<pos.length;j++){const p=pos[j], e=p+span; if(e<0||e>=N) continue; let q=p+k,i=1; while(i<Ln&&a[q]===term[i]){i++;q+=k} if(i===Ln){count++; if(res.length<limit) res.push([p,k])}}}
    if((d&31)===0){onp&&onp((d-min)/(max-min+1)); await new Promise(r=>setTimeout(r)); if(C.stop) return null}
  }
  return {count,res};
}
function elsExpected(T,term,min,max){let p=1; for(const x of term) p*=T.freq[x]; let e=0; for(let d=min;d<=max;d++){const m=T.N-(term.length-1)*d; if(m>0) e+=2*m*p} return e}

function cEls(el){
  el.innerHTML=`<div class="prose" style="font-size:15.5px"><p>A "Bible code" is a word spelled by taking every <i>n</i>th letter of the Hebrew text. The famous example: start at the first ת in Genesis, count every 50th letter, and you get תורה, <b>Torah</b>.</p></div>
  <div class="lbl" style="margin:10px 0 6px">Word to look for (Hebrew letters)</div><div class="term heb" id="eterm">${esc(C.term)||'&nbsp;'}</div>${kbHeb('ekey')}
  <div class="chips" style="margin-bottom:14px">${ELSW.map(w=>`<button class="chip" data-act="eword" data-w="${w[0]}"><span class="heb">${w[0]}</span> ${w[1]}</button>`).join('')}</div>
  <div class="two"><div><label>Search in</label><select class="inp" data-chg="escope">${Object.keys(SCOPES).map(k=>`<option value="${k}" ${k===C.scope?'selected':''}>${SCOPES[k][0]}</option>`).join('')}</select></div>
  <div class="two"><div><label>Skip from</label><input class="inp" type="number" inputmode="numeric" id="emin" value="${C.min}" min="1"></div><div><label>to</label><input class="inp" type="number" inputmode="numeric" id="emax" value="${C.max}" min="1"></div></div></div>
  <div class="row" style="margin:12px 0"><button class="btn pri" data-act="erun" style="flex:1">Search the text</button><button class="btn" data-act="estop">Stop</button></div>
  <div class="prog"><i id="eprog"></i></div><div id="eres"></div>`;
  if(C.res) showEls();
}
ACT.ekey=el=>{const l=el.dataset.l; C.term=l==='DEL'?C.term.slice(0,-1):(C.term.length<12?C.term+l:C.term); $('#eterm').innerHTML=esc(C.term)||'&nbsp;'};
ACT.eword=el=>{C.term=el.dataset.w; $('#eterm').textContent=C.term};
ACT.escope=el=>{C.scope=el.value};
ACT.estop=()=>{C.stop=true};
ACT.erun=async()=>{
  if(C.busy) return; const term=[...hebLetters(C.term)].map(l=>HEB.indexOf(l));
  if(term.length<3){toast('Use at least 3 letters');return}
  C.min=Math.max(1,+$('#emin').value||2); C.max=Math.min(50000,Math.max(C.min,+$('#emax').value||500));
  const out=$('#eres'), pr=$('#eprog'); out.innerHTML='<p class="load">Loading the Hebrew text…</p>'; C.busy=true; C.stop=false;
  const T=await loadHeb(C.scope); if(!T){out.innerHTML='<p class="load">Could not load the Hebrew text.</p>';C.busy=false;return}
  out.innerHTML=`<p class="load">Searching ${T.N.toLocaleString()} letters…</p>`;
  const r=await elsRun(T.a,term,C.min,C.max,300,f=>{if(pr.isConnected) pr.style.width=(f*50)+'%'});
  if(!r){out.innerHTML='<p class="note">Stopped.</p>';pr.style.width='0';C.busy=false;return}
  /* control: the same letters in random order */
  const sh=T.a.slice(); for(let i=sh.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); const t=sh[i]; sh[i]=sh[j]; sh[j]=t}
  const ctl=await elsRun(sh,term,C.min,C.max,0,f=>{if(pr.isConnected) pr.style.width=(50+f*50)+'%'});
  C.busy=false; if(pr.isConnected) pr.style.width='100%';
  C.res={r,ctl:ctl?ctl.count:null,exp:elsExpected(T,term,C.min,C.max),scope:C.scope,term:C.term,min:C.min,max:C.max};
  if($('#eres')) showEls();
};
function showEls(){
  const x=C.res, T=TXT[x.scope], out=$('#eres'); if(!T||!out) return;
  const sd=Math.sqrt(Math.max(x.exp,1)), z=(x.r.count-x.exp)/sd;
  const verdict=Math.abs(z)<3?'That is what chance alone produces. The word is there, and it would be there in any text with these letters.':(z>0?'More than the simple estimate. Real language repeats words and letter patterns, so compare with the scrambled count before drawing conclusions.':'Fewer than the simple estimate.');
  out.innerHTML=`<div class="verdict"><span class="heb" style="font-size:22px">${esc(x.term)}</span> in ${esc(SCOPES[x.scope][0])}, skips ${x.min} to ${x.max}, both directions<br>
  Found: <b>${x.r.count.toLocaleString()}</b><br>Expected by chance: <b>${x.exp<10?x.exp.toFixed(1):Math.round(x.exp).toLocaleString()}</b>${x.ctl!=null?`<br>Same letters scrambled at random: <b>${x.ctl.toLocaleString()}</b>`:''}<br><span style="color:var(--dim)">${verdict}</span></div>
  ${x.r.res.length?`<div class="lbl">Results, shortest skips first${x.r.count>x.r.res.length?' (first '+x.r.res.length+')':''}</div>`:'<p class="note">No hits. Try a wider skip range or a larger text.</p>'}`+
  x.r.res.map((h,i)=>{const s=posRef(T,h[0]); return `<button class="hit" data-act="ematrix" data-i="${i}"><b>skip ${h[1]>0?'+':''}${h[1]}</b><span>starts ${esc(refStr(s.b,s.c,s.v))}, letter ${s.n}</span></button>`}).join('')+
  `<p class="note" style="margin-top:18px"><b>Read this before you believe a code.</b> In 1994 a paper in <i>Statistical Science</i> reported that names of famous rabbis sit near their dates in Genesis. In 1999 the same journal published a rebuttal showing the result depended on flexible choices of spellings, and that the same method "finds" things in <i>War and Peace</i>. Any long text contains millions of letter-skip words. The counts above let you see that for yourself.</p>
  <p class="note">This is the Leningrad Codex text (about ${T.N.toLocaleString()} letters). Printed codes use the Koren edition, which differs by a few hundred letters across the Torah, so long-skip codes from books will not all land in the same spot here.</p>`;
}
ACT.ematrix=el=>{const x=C.res, T=TXT[x.scope], h=x.r.res[+el.dataset.i], term=hebLetters(x.term), Ln=term.length, p=h[0], k=h[1], w=Math.abs(k);
  const idx=[]; for(let i=0;i<Ln;i++) idx.push(p+i*k); const lo=Math.min(...idx), hi=Math.max(...idx);
  const col=lo%w, r0=Math.floor(lo/w)-2, r1=Math.floor(hi/w)+2; let c0=Math.max(0,col-5), c1=Math.min(w-1,col+5); if(w<=11){c0=0;c1=w-1} else { if(c1-c0<10){ if(c0===0) c1=Math.min(w-1,10); else c0=Math.max(0,c1-10) } }
  const set=new Set(idx), s=posRef(T,p), e=posRef(T,idx[Ln-1]);
  Sheet.open({title:`${x.term} · skip ${k>0?'+':''}${k}`,full:true,render(el2){
    let g=`<div class="mx" style="grid-template-columns:repeat(${c1-c0+1},26px)">`;
    for(let r=r0;r<=r1;r++) for(let c=c0;c<=c1;c++){const q=r*w+c; g+=(q<0||q>=T.N)?'<span></span>':`<span class="${set.has(q)?'t':''}" data-act="ecell" data-p="${q}">${HEB[T.a[q]]}</span>`}
    el2.innerHTML=`<p class="sub">The text is laid out in rows of ${w.toLocaleString()} letters, right to left, so every ${w.toLocaleString()}th letter lines up in a column. ${w>11?'Showing the columns around the word.':''}</p>${g}</div>
    <p class="def">Starts at <b>${esc(refStr(s.b,s.c,s.v))}</b>, letter ${s.n}. Ends at <b>${esc(refStr(e.b,e.c,e.v))}</b>. ${k<0?'Reads backward through the text.':''}</p>
    <div class="row"><button class="btn sm" data-act="goref" data-ref="${s.b}.${s.c}.${s.v}">Open ${esc(refStr(s.b,s.c,s.v))}</button>${(e.b!==s.b||e.c!==s.c||e.v!==s.v)?`<button class="btn sm" data-act="goref" data-ref="${e.b}.${e.c}.${e.v}">Open ${esc(refStr(e.b,e.c,e.v))}</button>`:''}</div>
    <p class="note">Tap any letter to see which verse it belongs to. Verse numbers here are the Hebrew ones.</p>`}})};
ACT.ecell=el=>{const T=TXT[C.res.scope], s=posRef(T,+el.dataset.p); toast(`${refStr(s.b,s.c,s.v)}, letter ${s.n}`)};

/* ---------- gematria / isopsephy ---------- */
const GEMX=[['he','יהוה','YHWH'],['he','משיח','Messiah'],['he','נחש','serpent'],['he','חי','life'],['he','נרון קסר','Nero Caesar'],['he','נרו קסר','Nero Caesar, Latin spelling'],['el','Ιησους','Jesus'],['el','θηριον','beast'],['he','בראשית ברא אלהים את השמים ואת הארץ','Genesis 1:1']];
function cGem(el){
  const val=C.gl==='he'?gemHeb(C.gt):gemGrk(C.gt);
  el.innerHTML=`<div class="prose" style="font-size:15.5px"><p>Hebrew and Greek had no separate digits. Letters were the numbers, so every word also has a total. Ancient readers used this (Revelation 13:18 tells the reader to "count the number").</p></div>
  <div class="row" style="margin:10px 0"><button class="chip ${C.gl==='he'?'on':''}" data-act="glang" data-k="he">Hebrew</button><button class="chip ${C.gl==='el'?'on':''}" data-act="glang" data-k="el">Greek</button></div>
  <div class="term ${C.gl==='he'?'heb':'grk'}" id="gterm">${esc(C.gt)||'&nbsp;'}</div>
  ${C.gl==='he'?'<div class="kb">'+[...HEB].map(l=>`<button data-act="gkey" data-l="${l}">${l}</button>`).join('')+'<button data-act="gkey" data-l=" ">␣</button><button class="fn" data-act="gkey" data-l="DEL">⌫ delete</button></div>':'<div class="kb ltr">'+[...'αβγδεζηθικλμνξοπρστυφχψω'].map(l=>`<button data-act="gkey" data-l="${l}">${l}</button>`).join('')+'<button data-act="gkey" data-l=" ">␣</button><button class="fn" data-act="gkey" data-l="DEL">⌫ delete</button></div>'}
  <div style="text-align:center;margin:14px 0"><div class="lbl">Total</div><div class="big" id="gval">${val}</div></div>
  <div class="row"><button class="btn" data-act="gsame" style="flex:1">Bible words with the same total</button><button class="btn" data-act="gclear">Clear</button></div><div id="gres"></div>
  <div class="lbl" style="margin:20px 0 8px">Well-known examples</div><div class="chips">${GEMX.map((x,i)=>`<button class="chip" data-act="gex" data-i="${i}">${esc(x[2])}</button>`).join('')}</div>
  <p class="note" style="margin-top:18px">Values: Hebrew א=1 to ת=400, final letters counted as their normal form. Greek α=1 to ω=800. With 8,600 Hebrew dictionary words and totals mostly under 1,000, every number is shared by many words, so a match by itself proves nothing. A match plus a context that points to it (as in Revelation 13) is what ancient writers intended.</p>`;
}
ACT.glang=el=>{C.gl=el.dataset.k; C.gt=''; cGem($('#cbody'))};
ACT.gkey=el=>{const l=el.dataset.l; C.gt=l==='DEL'?C.gt.slice(0,-1):C.gt+l; $('#gterm').innerHTML=esc(C.gt)||'&nbsp;'; $('#gval').textContent=C.gl==='he'?gemHeb(C.gt):gemGrk(C.gt); $('#gres').innerHTML=''};
ACT.gclear=()=>{C.gt=''; cGem($('#cbody'))};
ACT.gex=el=>{const x=GEMX[+el.dataset.i]; C.gl=x[0]; C.gt=x[1]; cGem($('#cbody'))};
ACT.gsame=async()=>{const out=$('#gres'), he=C.gl==='he', val=he?gemHeb(C.gt):gemGrk(C.gt); if(!val){toast('Enter a word first');return}
  out.innerHTML='<p class="load">Opening the dictionary…</p>'; const d=await loadLex(he?'H':'G'); if(!d){out.innerHTML='<p class="load">Could not load.</p>';return}
  const seen=new Set(), res=[]; for(const k in d){const e=d[k]; if(!e.n) continue; const w=he?hebLetters(e.l):grkLetters(e.l); if(seen.has(w)) continue; if((he?gemHeb(w):gemGrk(w))===val){seen.add(w); res.push([e.n,k,e])}}
  res.sort((a,b)=>b[0]-a[0]);
  out.innerHTML=`<p class="note" style="margin-top:14px">${res.length} dictionary word${res.length===1?'':'s'} total ${val}.</p>`+res.slice(0,50).map(r=>`<button class="li" data-act="lex" data-s="${r[1]}"><h3><span class="${he?'heb':'grk'}" style="font-size:21px">${esc(r[2].l)}</span> &nbsp;${esc(r[2].t)}</h3><p>${esc(r[2].g)} · used ${r[0].toLocaleString()} times</p></button>`).join('')};

/* ---------- atbash ---------- */
const atbash=s=>[...String(s).replace(/[ךםןףץ]/g,m=>FIN[m])].map(ch=>{const i=HEB.indexOf(ch); return i<0?ch:HEB[21-i]}).join('');
function cAtb(el){
  el.innerHTML=`<div class="prose" style="font-size:15.5px"><p>Atbash swaps the first Hebrew letter with the last, the second with the second-to-last, and so on (א↔ת, ב↔ש). This one is real and inside the Bible: Jeremiah uses it.</p></div>
  <div class="lbl" style="margin:10px 0 6px">Hebrew word</div><div class="term heb" id="aterm">${esc(C.at)||'&nbsp;'}</div>
  <div class="kb">${[...HEB].map(l=>`<button data-act="akey" data-l="${l}">${l}</button>`).join('')}<button data-act="akey" data-l=" ">␣</button><button class="fn" data-act="akey" data-l="DEL">⌫ delete</button></div>
  <div style="text-align:center;margin:14px 0"><div class="lbl">Atbash gives</div><div class="big heb" id="aout">${esc(atbash(C.at))||'&nbsp;'}</div></div>
  <div class="lbl" style="margin:16px 0 4px">In the text</div>
  <button class="li" data-act="aex" data-w="ששך"><h3><span class="heb">ששך</span> Sheshach → <span class="heb">בבל</span> Babel</h3><p>Jeremiah 25:26 and 51:41. "The king of Sheshach" is the king of Babylon.</p></button>
  <button class="li" data-act="aex" data-w="לב קמי"><h3><span class="heb">לב קמי</span> Leb-kamai → <span class="heb">כשדים</span> Chaldeans</h3><p>Jeremiah 51:1. The KJV translates the code words literally: "the midst of them that rise up against me."</p></button>
  <div class="row" style="margin-top:14px"><button class="btn sm" data-act="goref" data-ref="JER.25.26">Open Jeremiah 25:26</button><button class="btn sm" data-act="goref" data-ref="JER.51.1">Open Jeremiah 51:1</button></div>`;
}
ACT.akey=el=>{const l=el.dataset.l; C.at=l==='DEL'?C.at.slice(0,-1):C.at+l; $('#aterm').innerHTML=esc(C.at)||'&nbsp;'; $('#aout').innerHTML=esc(atbash(C.at))||'&nbsp;'};
ACT.aex=el=>{C.at=el.dataset.w; cAtb($('#cbody'))};

/* ---------- acrostics ---------- */
async function cAcr(el){
  el.innerHTML=`<div class="prose" style="font-size:15.5px"><p>Some poems are built on the alphabet: each verse or stanza starts with the next Hebrew letter. Translation hides it completely. These are real, deliberate patterns.</p></div>
  <div class="chips" style="margin:10px 0 14px">${ACRO.map((a,i)=>`<button class="chip ${a[0]===C.ab&&a[1]===C.ac?'on':''}" data-act="acr" data-i="${i}">${esc(bname(a[0]).replace('Psalms','Psalm'))} ${a[1]}</button>`).join('')}</div><div id="acrbody"><p class="load">Loading…</p></div>`;
  const ch=await chapter('WLC',C.ab,C.ac), box=$('#acrbody'); if(!box) return; if(!ch){box.innerHTML='<p class="load">Could not load.</p>';return}
  const a=ACRO.find(x=>x[0]===C.ab&&x[1]===C.ac);
  box.innerHTML=`<p class="note">${a?esc(a[2])+'. ':''}First letter and first words of each verse. Hebrew verse numbers.</p>`+ch.map((t,i)=>{const w=t.split(/\s+/).slice(0,3).join(' '), l=hebLetters(t)[0]||''; return t?`<div class="acr"><sup>${i+1}</sup><b class="heb">${l}</b><span class="heb">${esc(w)}</span></div>`:''}).join('')+
  `<div class="row" style="margin-top:14px"><button class="btn sm" data-act="goref" data-ref="${C.ab}.${C.ac}.1">Open in the reader</button></div>
  <p class="note" style="margin-top:14px">Also worth knowing: the name of God never appears in Esther, but at four turning points (1:20, 5:4, 5:13, 7:7) the first or last letters of four words in a row spell יהוה. Some medieval manuscripts write those letters larger. Whether the author intended it is debated.</p>`;
}
ACT.acr=el=>{const a=ACRO[+el.dataset.i]; C.ab=a[0]; C.ac=a[1]; cAcr($('#cbody'))};

/* ---------- trace a word across the land and the sky ---------- */
/* Sefer Yetzirah: twelve "simple" letters for the twelve signs, seven "double" letters for the seven wandering stars, three "mothers" */
const SY12={'ה':'Ari','ו':'Tau','ז':'Gem','ח':'Cnc','ט':'Leo','י':'Vir','ל':'Lib','נ':'Sco','ס':'Sgr','ע':'Cap','צ':'Aqr','ק':'Psc'};
const SY7={'ב':'Saturn','ג':'Jupiter','ד':'Mars','כ':'Sun','פ':'Venus','ר':'Mercury','ת':'Moon'};
function cTrace(el){
  el.innerHTML=`<h3 class="sec" style="font-size:21px">Across the land</h3><p class="sub">Type any word. Every verse that uses it is followed through the Bible in order, and each place named in those verses becomes a point. The line that results is the word's path over the land.</p>
  <input class="inp" id="tw" value="${esc(C.tw)}" placeholder="covenant, glory, wilderness, angel…" data-enter="twrun" enterkeyhint="search">
  <div class="chips" style="margin:10px 0">${['covenant','glory','altar','angel of the Lord','wilderness','famine','dream','blood','king','light'].map(w=>`<button class="chip" data-act="twpick" data-w="${w}">${w}</button>`).join('')}</div>
  <button class="btn pri" data-act="twrun" style="width:100%">Trace it on the map</button><div id="twres"></div>
  <h3 class="sec" style="font-size:21px;margin-top:30px">Across the sky</h3><p class="sub">An ancient Hebrew book, the Sefer Yetzirah, assigns twelve letters to the twelve signs of the Mazzaroth and seven letters to the sun, moon and five visible planets. By that key, every Hebrew word is also a path across the heavens, and because the planets move, the figure is different on every date.</p>
  <div class="term heb" id="thterm">${esc(C.th)||'&nbsp;'}</div>${kbHeb('thkey')}
  <div class="chips" style="margin-bottom:10px">${ELSW.map(w=>`<button class="chip" data-act="thword" data-w="${w[0]}"><span class="heb">${w[0]}</span> ${w[1]}</button>`).join('')}</div>
  <div class="row" style="margin-bottom:8px"><input class="inp" id="then" placeholder="Or find the Hebrew for an English word" data-enter="thfind" style="flex:1"><button class="btn" data-act="thfind">Find</button></div><div id="thfound" class="chips" style="margin-bottom:10px"></div>
  <div class="row" style="margin-bottom:10px"><span class="lbl">Sky of</span>${[['now','today'],['birth','my birth date'],['sky','the Sky tab date']].map(x=>`<button class="chip ${C.tdate===x[0]?'on':''}" data-act="thdate" data-k="${x[0]}">${x[1]}</button>`).join('')}</div>
  <canvas id="thc" style="display:block;width:100%;max-width:520px;margin:0 auto"></canvas><div id="thcap"></div>
  <p class="note" style="margin-top:16px">What these tools show is real: the verses, the places and the positions are all exact. Whether a shape is a message is yours to weigh. The Sefer Yetzirah was written centuries after the Bible (somewhere between AD 200 and 600), and its letter key exists in more than one version; this one follows the short version.</p>`;
  drawWheel();
}
ACT.twpick=el=>{C.tw=el.dataset.w; $('#tw').value=C.tw; ACT.twrun()};
ACT.thkey=el=>{C.ths=null; const l=el.dataset.l; C.th=l==='DEL'?C.th.slice(0,-1):(C.th.length<14?C.th+l:C.th); $('#thterm').innerHTML=esc(C.th)||'&nbsp;'; drawWheel()};
ACT.thword=el=>{C.ths=null; C.th=el.dataset.w; $('#thterm').textContent=C.th; drawWheel()};
ACT.thdate=el=>{ if(el.dataset.k==='birth'&&!Store.get('birth',{}).d){toast('Enter your birth date in Sky → Your Mazzaroth first');return} C.tdate=el.dataset.k; $$('[data-act=thdate]').forEach(b=>b.classList.toggle('on',b===el)); drawWheel()};
ACT.thfind=async()=>{const q=plain($('#then').value).trim(), out=$('#thfound'); if(!q) return; out.innerHTML='<span class="lbl">Opening the dictionary…</span>'; const d=await loadLex('H'); if(!d){out.textContent='Could not load.';return}
  const res=[]; for(const k in d){const e=d[k], g=plain(e.g); let sc=g===q?900:g.split(' ').includes(q)?600:g.startsWith(q)?400:0; if(sc&&e.n) res.push([sc+Math.log(e.n+1)*12,k,e])} res.sort((a,b)=>b[0]-a[0]);
  out.innerHTML=res.length?res.slice(0,8).map(r=>`<button class="chip" data-act="thword2" data-w="${esc(r[2].l.replace(/[^א-ת]/g,''))}" data-s="${r[1]}"><span class="heb">${esc(r[2].l.replace(/[^א-ת]/g,''))}</span> ${esc(r[2].g)}</button>`).join(''):'<span class="lbl">No Hebrew word found for that.</span>'};
ACT.thword2=el=>{C.th=el.dataset.w; C.ths=el.dataset.s; $('#thterm').textContent=C.th; drawWheel()};
function traceJd(){ if(C.tdate==='sky') return SK.jd; if(C.tdate==='birth'){const b=Store.get('birth',{}); if(b.d){const [y,m,d]=b.d.split('-').map(Number), [h,mi]=(b.t||'12:00').split(':').map(Number); return new Date(y,m-1,d,h||0,mi||0).getTime()/86400000+2440587.5}} return Date.now()/86400000+2440587.5}
async function drawWheel(){
  const cv=$('#thc'); if(!cv) return; const D=await skyData(); if(!D||!$('#thc')) return;
  const W=Math.min(cv.parentNode.clientWidth,520), dpr=Math.min(window.devicePixelRatio||1,2); cv.width=cv.height=W*dpr; cv.style.height=W+'px'; const g=cv.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0);
  const cx=W/2, cy=W/2, R=W/2-34, jd=traceJd(), t=astroT(jd), rad=Math.PI/180, er=Astronomy.Rotation_EQJ_ECL().rot;
  const lonOf=v=>{const x=er[0][0]*v[0]+er[1][0]*v[1]+er[2][0]*v[2], y=er[0][1]*v[0]+er[1][1]*v[1]+er[2][1]*v[2]; return (Math.atan2(y,x)/rad+360)%360};
  const XY=(lon,r)=>[cx-Math.sin(lon*rad)*r, cy-Math.cos(lon*rad)*r];   /* 0° at top, running anticlockwise like the sky */
  const zl={}; TWELVE.forEach(z=>zl[z[0]]=lonOf(D.cen[z[0]]));
  const bl={Sun:Astronomy.SunPosition(t).elon,Moon:Astronomy.EclipticGeoMoon(t).lon}; ['Mercury','Venus','Mars','Jupiter','Saturn'].forEach(b=>bl[b]=Astronomy.Ecliptic(Astronomy.GeoVector(b,t,true)).elon);
  g.clearRect(0,0,W,W); g.strokeStyle='#d3ad55'; g.lineWidth=1.5; g.beginPath(); g.arc(cx,cy,R,0,7); g.stroke(); g.strokeStyle='rgba(211,173,85,.25)'; g.beginPath(); g.arc(cx,cy,R*.62,0,7); g.stroke();
  g.textAlign='center'; g.textBaseline='middle'; const ink=getComputedStyle(document.documentElement).getPropertyValue('--ink')||'#ece2cc', dimc=getComputedStyle(document.documentElement).getPropertyValue('--dim')||'#a59a82';
  TWELVE.forEach(z=>{const p=XY(zl[z[0]],R), q=XY(zl[z[0]],R+19); g.fillStyle='#d3ad55'; g.beginPath(); g.arc(p[0],p[1],3.5,0,7); g.fill(); g.fillStyle=ink; g.font='15px "Times New Roman",serif'; g.fillText(z[1],q[0],q[1]-5); g.fillStyle=dimc; g.font='9px system-ui,sans-serif'; g.fillText(z[6]+' '+z[2],q[0],q[1]+8)});
  BODIES.forEach(b=>{const p=XY(bl[b[0]],R*.62); g.fillStyle=b[3]; g.beginPath(); g.arc(p[0],p[1],b[0]==='Sun'?6:4,0,7); g.fill(); const q=XY(bl[b[0]],R*.62-15); g.fillStyle=dimc; g.font='9px system-ui,sans-serif'; g.fillText(b[0],q[0],q[1])});
  /* the word's path */
  const letters=[...hebLetters(C.th)], pts=[], legend=[];
  letters.forEach(l=>{ if(SY12[l]){const z=signOf(SY12[l]); pts.push(XY(zl[z[0]],R)); legend.push(`<span class="heb">${l}</span> ${z[2]} (${z[3].replace(/.*\(|\)/g,'')})`)} else if(SY7[l]){pts.push(XY(bl[SY7[l]],R*.62)); const b=BODIES.find(q=>q[0]===SY7[l]); legend.push(`<span class="heb">${l}</span> ${b[0]}`)} else {pts.push([cx,cy]); legend.push(`<span class="heb">${l}</span> ${({'א':'air','מ':'water','ש':'fire'})[l]}, center`)}});
  if(pts.length>1){g.strokeStyle='#e05a36'; g.lineWidth=2.6; g.lineJoin='round'; g.shadowColor='#e05a36'; g.shadowBlur=10; g.beginPath(); pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.stroke(); g.shadowBlur=0}
  pts.forEach((p,i)=>{g.fillStyle=i===0?'#fff':'#e05a36'; g.beginPath(); g.arc(p[0],p[1],i===0?5:3.5,0,7); g.fill()});
  g.fillStyle='#e05a36'; g.beginPath(); g.arc(cx,cy,2.5,0,7); g.fill();
  const c=calJd(jd), cap=$('#thcap'), closed=pts.length>2&&Math.hypot(pts[0][0]-pts[pts.length-1][0],pts[0][1]-pts[pts.length-1][1])<6;
  if(cap) cap.innerHTML=letters.length?`<p class="def" style="text-align:center"><span class="heb" style="font-size:26px;color:var(--gold)">${esc(C.th)}</span><br><span style="font-family:var(--sans);font-size:13px;color:var(--dim)">Letter value ${gemHeb(C.th)} · sky of ${c.d} ${MON[c.m-1]} ${yLabel(c.y)}${closed?' · the path returns to where it began':''}</span></p><p class="sub" style="text-align:center">Read from the white dot: ${legend.join(' → ')}</p>${C.ths?`<div class="row" style="justify-content:center"><button class="btn sm" data-act="thland" data-s="${C.ths}">Trace this Hebrew word on the land</button><button class="btn sm" data-act="lex" data-s="${C.ths}">Dictionary entry</button></div>`:''}`:'<p class="note">Enter a Hebrew word above.</p>';
}

/* land: every verse with the word, every place in those verses */
let _vp=null;
async function versePlaces(){ if(_vp) return _vp; const P=await J('places.json'); if(!P) return null; const m=new Map(); P.forEach((p,i)=>p.v.forEach(v=>{const a=m.get(v); a?a.push(i):m.set(v,[i])})); return _vp={P,m} }
ACT.twrun=async()=>{const q=$('#tw').value.trim(), out=$('#twres'); C.tw=q; if(q.length<2){toast('Type a word first');return}
  out.innerHTML='<p class="load">Reading the whole Bible…</p>'; const [all,vp]=await Promise.all([J('t/KJV/_all.json'),versePlaces()]); if(!all||!vp){out.innerHTML='<p class="load">Could not load.</p>';return}
  const rx=new RegExp('\\b'+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+')+'\\b','i'), refs=[];
  for(let bi=0;bi<66;bi++){const d=all[IDS[bi]]; if(!d) continue; for(let c=0;c<d.length;c++) for(let v=0;v<d[c].length;v++) if(d[c][v]&&rx.test(d[c][v])) refs.push(bi*1e6+(c+1)*1e3+v+1)}
  showTrace('"'+q+'"',refs,vp)};
ACT.thland=async el=>{const s=el.dataset.s, e=await lexEntry(s), c=await J('lex/cH.json'), vp=await versePlaces(); if(!e||!c||!vp) return; go('codes'); showTrace(hebLetters(e.l)+' ('+e.g+')',c[e.key]||[],vp,e.n>300)};
function showTrace(title,refs,vp,capped){
  const seq=[], counts=new Map(); let withP=0; refs.forEach(r=>{const a=vp.m.get(r); if(!a) return; withP++; a.forEach(i=>{seq.push([i,r]); counts.set(i,(counts.get(i)||0)+1)})});
  const out=$('#twres'); const T={t:title,seq,counts,n:refs.length,withP,capped}; C.trace=T;
  if(!refs.length){ if(out) out.innerHTML='<p class="note">That word does not appear in the King James text. Try another form of it.</p>'; return}
  if(counts.size<2){ if(out) out.innerHTML=`<p class="note">${refs.length.toLocaleString()} verses use it, but fewer than two of them name a place, so there is no path to draw.</p>`; return}
  T.find=traceFindings(T,vp.P);
  if(out) out.innerHTML=`<div class="verdict" style="margin-top:14px"><b>${refs.length.toLocaleString()}</b> verses${capped?' (first 300)':''} · <b>${withP}</b> name a place · <b>${counts.size}</b> different places<br><span style="color:var(--dim)">${T.find.map(f=>f.short).join(' ')}</span></div><button class="btn pri" data-act="twmap" style="width:100%">See the path on the map</button><div id="twfml"></div>`;
  firstLast(refs);
}
ACT.twmap=()=>mapOpenTrace(C.trace);
function traceFindings(T,P){
  const F=[], ids=[...T.counts.keys()], r=Math.PI/180;
  /* centre of gravity */
  let la=0,lo=0,w=0; T.counts.forEach((n,i)=>{la+=P[i].la*n; lo+=P[i].lo*n; w+=n}); la/=w; lo/=w; let near=null; P.forEach((p,i)=>{const d=gcDist([la,lo],[p.la,p.lo]); if(!near||d<near[0]) near=[d,i]});
  F.push({k:'center',la,lo,short:`Its center of gravity falls ${Math.round(near[0]/1609.344)} mi from ${P[near[1]].n}.`,long:`Weigh every place by how often the word occurs there and the balance point lies ${Math.round(near[0]/1609.344)} miles from ${P[near[1]].n}.`});
  /* best three-in-a-line, tested against random sets of places */
  const SITE=i=>!['region','special','people group','natural area','body of water','river','valley','road','wadi','mountain range','district in settlement'].includes(P[i].t), pool=P.map((p,i)=>i).filter(SITE);
  const uniq=[], seen=new Set(); ids.filter(SITE).sort((a,b)=>T.counts.get(b)-T.counts.get(a)).forEach(i=>{const k=P[i].la.toFixed(2)+','+P[i].lo.toFixed(2); if(!seen.has(k)&&uniq.length<36){seen.add(k); uniq.push(i)}});
  const best=set=>{const m=set.reduce((s,i)=>s+P[i].la,0)/set.length, kx=Math.cos(m*r)*111.32, xy=set.map(i=>[P[i].lo*kx,P[i].la*110.57]); let b=[1,0,0,0]; for(let i=0;i<xy.length;i++) for(let j=i+1;j<xy.length;j++){const dx=xy[j][0]-xy[i][0], dy=xy[j][1]-xy[i][1], L=Math.hypot(dx,dy); if(L<40) continue; for(let k=0;k<xy.length;k++){ if(k===i||k===j) continue; const t=((xy[k][0]-xy[i][0])*dx+(xy[k][1]-xy[i][1])*dy)/(L*L); if(t<.15||t>.85) continue; const off=Math.abs((xy[k][0]-xy[i][0])*dy-(xy[k][1]-xy[i][1])*dx)/L/L; if(off<b[0]) b=[off,set[i],set[k],set[j],L]}} return b};
  if(uniq.length>=3){const b=best(uniq); if(b[0]<1){let hits=0; const N=160; for(let s=0;s<N;s++){const pick=[], sn=new Set(); while(pick.length<uniq.length){const i=pool[Math.floor(Math.random()*pool.length)], k=P[i].la.toFixed(2)+','+P[i].lo.toFixed(2); if(!sn.has(k)){sn.add(k); pick.push(i)}} if(best(pick)[0]<=b[0]) hits++}
      const rar=hits===0?`fewer than 1 in ${N}`:`about 1 in ${Math.max(1,Math.round(N/hits))}`, miss=Math.round(b[0]*b[4]/1.609*5280);
      F.push({k:'line',a:b[1],m:b[2],c:b[3],short:`${P[b[1]].n}, ${P[b[2]].n} and ${P[b[3]].n} fall on one straight line.`,long:`${P[b[1]].n}, ${P[b[2]].n} and ${P[b[3]].n} lie on a straight line ${Math.round(b[4]/1.609)} miles long; the middle one is off it by ${miss<5280?miss.toLocaleString()+' feet':(miss/5280).toFixed(1)+' miles'}. Regions are left out; only towns, mountains and other fixed sites count. Random sets of ${uniq.length} Bible sites do as well ${rar} times.`})}}
  /* first to last */
  const a=P[T.seq[0][0]], z=P[T.seq[T.seq.length-1][0]]; if(a!==z&&gcDist([a.la,a.lo],[z.la,z.lo])>5000){const br=bearing([a.la,a.lo],[z.la,z.lo]), sol=Math.asin(Math.sin(23.7*r)/Math.cos(a.la*r))/r, tg=[[0,'due north'],[90,'due east, the equinox sunrise'],[180,'due south'],[270,'due west, the equinox sunset'],[90-sol,'the midsummer sunrise'],[90+sol,'the midwinter sunrise'],[270+sol,'the midsummer sunset'],[270-sol,'the midwinter sunset']]; let hit=null; tg.forEach(x=>{const d=Math.abs(((br-x[0]+540)%360)-180); if(d<2.5&&(!hit||d<hit[0])) hit=[d,x[1]]});
    F.push({k:'span',short:`First to last it runs ${a.n} to ${z.n}.`,long:`Its first place in the Bible is ${a.n} and its last is ${z.n}: a bearing of ${Math.round(br)}°, ${Math.round(gcDist([a.la,a.lo],[z.la,z.lo])/1609.344).toLocaleString()} miles.${hit?' That points within '+hit[0].toFixed(1)+'° of '+hit[1]+'. About one random bearing in nine lands that close to one of these eight directions.':''}`})}
  return F;
}

/* first, middle and last appearance of the traced word */
function firstLast(refs){const box=$('#twfml'); if(!box||refs.length<2) return; const pick=[['First',refs[0]],['Middle',refs[Math.floor((refs.length-1)/2)]],['Last',refs[refs.length-1]]];
  box.innerHTML='<div class="lbl" style="margin:18px 0 2px">First, middle and last</div>'+pick.map((p,i)=>{const r=unpack(p[1]); return `<button class="ref" data-act="goref" data-ref="${r.b}.${r.c}.${r.v}"><b>${p[0]} · ${esc(refStr(r.b,r.c,r.v))}</b><span id="fml${i}">…</span></button>`}).join('');
  pick.forEach((p,i)=>{const r=unpack(p[1]); verseText('KJV',r.b,r.c,r.v).then(t=>{const e=$('#fml'+i); if(e) e.textContent=t})})}
