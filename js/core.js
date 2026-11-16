'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BOOKS=META.books, IDS=BOOKS.map(b=>b[0]), BI={}; IDS.forEach((id,i)=>BI[id]=i);
const bname=id=>BOOKS[BI[id]][1], nch=id=>BOOKS[BI[id]][3];
const pack=(b,c,v)=>BI[b]*1e6+c*1e3+v;
const unpack=p=>({b:IDS[Math.floor(p/1e6)],c:Math.floor(p%1e6/1e3),v:p%1e3});
const refStr=(b,c,v)=>bname(b)+' '+c+(v?':'+v:'');

/* translations: name, date, language, note */
const TRI={
KJV:['King James Version','1611, in the 1769 text','en','Includes the Apocrypha'],
BSB:['Berean Standard Bible','2016–2023','en','Modern English, public domain'],
WEB:['World English Bible','2000–2020','en','Modern English, with the Deuterocanon'],
ASV:['American Standard Version','1901','en','Very literal. Prints the divine name as Jehovah'],
YLT:["Young's Literal Translation",'1862–1898','en','Keeps Hebrew and Greek tenses and word order'],
JPS:['JPS Tanakh','1917','en','Jewish translation of the Hebrew Bible. Hebrew verse numbers'],
DRC:['Douay-Rheims (Challoner)','1582–1610, revised 1752','en','Catholic. Translated from the Latin Vulgate'],
GNV:['Geneva Bible','1599','en','The Bible of Shakespeare and the Pilgrims'],
TYN:['Tyndale','1526–1534','en','First English from Greek and Hebrew, original spelling. Genesis, Gospels, Acts, Romans, 1 Corinthians, Hebrews, Revelation'],
WYC:['Wycliffe','c. 1395','en','Middle English, from the Latin Vulgate'],
BRE:["Brenton's Septuagint",'1851','en','English of the Greek Old Testament. Greek chapter numbers'],
WLC:['Hebrew · Leningrad Codex','AD 1008','he','Masoretic Hebrew text. Hebrew verse numbers'],
SP:['Hebrew · Samaritan Pentateuch','','he','The Samaritan version of the Torah'],
LXX:['Greek · Septuagint','3rd–1st century BC','el','Greek Old Testament. Greek chapter numbers'],
TR:['Greek · Textus Receptus','1550–1894','el','The Greek New Testament behind the KJV'],
VUL:['Latin · Clementine Vulgate','1592','la','The Latin Bible of the Western church']};
const TRO=['KJV','BSB','WEB','ASV','YLT','JPS','DRC','GNV','TYN','WYC','BRE','WLC','SP','LXX','TR','VUL'];
const hasBook=(tr,b)=>!!(META.tr[tr]&&META.tr[tr].includes(b));
const lcls=tr=>({he:'heb',el:'grk'}[TRI[tr][2]]||'');

/* data */
const _c=new Map();
function J(p){ if(!_c.has(p)) _c.set(p,fetch('data/'+p).then(r=>{if(!r.ok) throw 0; return r.json()}).catch(()=>{_c.delete(p);return null})); return _c.get(p); }
const HEBNUM={WLC:1,JPS:1}, LXXNUM={LXX:1,BRE:1,VUL:1,DRC:1,WYC:1};
let HM=null; J('hebmap.json').then(d=>HM=d||{});
/* map an English (KJV) reference to the numbering a translation uses */
function mapRef(tr,b,c,v){
  if(!HEBNUM[tr]&&!(LXXNUM[tr]&&b==='PSA')) return [c,v];
  const m=HM&&HM[b]&&HM[b][c+':'+v]; let hc=m?m[0]:c, hv=m?m[1]:v;
  if(LXXNUM[tr]){
    if(hc===10){hc=9;hv+=21} else if(hc>10&&hc<114) hc--; else if(hc===114) hc=113; else if(hc===115){hc=113;hv+=8}
    else if(hc===116){ if(hv>9){hc=115;hv-=9} else hc=114 } else if(hc>116&&hc<147) hc--; else if(hc===147){ if(hv>11){hv-=11} else hc=146 }
  }
  return [hc,hv];
}
async function chapter(tr,b,c){const d=await J(`t/${tr}/${b}.json`); return d&&d[c-1]||null}
/* text of an English-numbered verse in any translation */
async function verseText(tr,b,c,v){ if(!hasBook(tr,b)) return ''; if(!HM) await J('hebmap.json'); const [mc,mv]=mapRef(tr,b,c,v); const ch=await chapter(tr,b,mc); return ch&&ch[mv-1]||'' }

const Store={get(k,d){try{const v=localStorage.getItem('scr.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('scr.'+k,JSON.stringify(v))}catch(e){}}};

/* reference parsing */
const ALIAS={ps:'PSA',psalm:'PSA',psalms:'PSA',song:'SNG',sos:'SNG',songofsongs:'SNG',canticles:'SNG',rev:'REV',apocalypse:'REV',jn:'JHN',jhn:'JHN',mk:'MRK',mrk:'MRK',mt:'MAT',lk:'LUK',phil:'PHP',php:'PHP',phm:'PHM',jas:'JAS',jude:'JUD',judges:'JDG',ecclesiasticus:'SIR',wisdom:'WIS',qoheleth:'ECC',ezk:'EZK',nam:'NAM',jol:'JOL',sng:'SNG','1sam':'1SA','2sam':'2SA','1kgs':'1KI','2kgs':'2KI','1chr':'1CH','2chr':'2CH','1cor':'1CO','2cor':'2CO','1thess':'1TH','2thess':'2TH','1tim':'1TI','2tim':'2TI','1pet':'1PE','2pet':'2PE','1john':'1JN','2john':'2JN','3john':'3JN','1macc':'1MA','2macc':'2MA'};
function findBook(s){
  s=s.toLowerCase().replace(/\./g,'').trim().replace(/^(iii|ii|i)\s+/,(m,r)=>r.length+' ').replace(/^(first|second|third)\s+/,(m,r)=>({first:1,second:2,third:3}[r])+' ');
  const k=s.replace(/\s+/g,''); if(!k) return null;
  if(ALIAS[k]) return ALIAS[k];
  if(BI[k.toUpperCase()]!=null) return k.toUpperCase();
  const names=BOOKS.map(b=>b[1].toLowerCase().replace(/[^a-z0-9]/g,''));
  let i=names.indexOf(k); if(i<0) i=names.findIndex(n=>n.startsWith(k));
  return i<0?null:IDS[i];
}
function parseRef(q){
  const m=q.trim().match(/^((?:[1-4]|i{1,3}|first|second|third)?\s*[a-z][a-z .]*?)\s*(\d+)?(?:\s*[:.,]\s*(\d+))?(?:\s*[-–]\s*\d+)?$/i);
  if(!m) return null; const b=findBook(m[1]); if(!b) return null;
  return {b,c:Math.max(1,Math.min(+(m[2]||1),Math.max(nch(b),1))),v:+(m[3]||0)};
}
/* "GEN.1.1" or "GEN.1.1-3" */
function dotRef(r){const p=r.split('.'); const vv=(p[2]||'0').split('-'); return {b:p[0],c:+p[1],v:+vv[0],v2:+(vv[1]||0)}}
const dotStr=r=>{const x=dotRef(r); return refStr(x.b,x.c,x.v)+(x.v2?'–'+x.v2:'')};

/* toast, sheet, actions */
let _tt; function toast(t){const el=$('#toast'); el.textContent=t; el.classList.add('on'); clearTimeout(_tt); _tt=setTimeout(()=>el.classList.remove('on'),2400)}
const Sheet={stack:[],
  open(o){this.stack=[o];this.render()},
  push(o){this.stack.push(o);this.render()},
  back(){this.stack.pop(); this.stack.length?this.render():this.close()},
  close(){const t=this.stack[this.stack.length-1]; if(t&&t.onclose) t.onclose(); this.stack=[]; $('#sheet').classList.remove('on'); $('#sheet-bg').classList.remove('on')},
  top(){return this.stack[this.stack.length-1]},
  render(){const o=this.top(), sh=$('#sheet'), body=$('#sheet-body');
    $('#sheet-head').innerHTML=(this.stack.length>1?'<button data-act="sheetback" aria-label="Back">‹</button>':'')+`<h2>${esc(o.title||'')}</h2><button data-act="sheetclose" aria-label="Close">×</button>`;
    sh.classList.toggle('full',!!o.full); body.innerHTML=''; body.scrollTop=0; o.render(body); sh.classList.add('on'); $('#sheet-bg').classList.add('on')},
  redraw(){const o=this.top(); if(o){const body=$('#sheet-body'); body.innerHTML=''; o.render(body)}}
};
const ACT={
  sheetclose(){Sheet.close()}, sheetback(){Sheet.back()},
  tab(el){go(el.dataset.t)},
  theme(){const v=!document.documentElement.classList.contains('vellum'); document.documentElement.classList.toggle('vellum',v); Store.set('vellum',v); $('meta[name=theme-color]').content=v?'#f1e8d5':'#14110d'},
  fs(el){let f=Store.get('fs',19)+(+el.dataset.d)*1.5; f=Math.max(14,Math.min(30,f)); Store.set('fs',f); document.documentElement.style.setProperty('--fs',f+'px')},
  about(){openAbout()},
  ext(el){window.open(el.dataset.u,'_blank','noopener')}
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]'); if(!el) return; const f=ACT[el.dataset.act]; if(f){e.preventDefault(); f(el,e)}});
document.addEventListener('change',e=>{const el=e.target.closest('[data-chg]'); if(el&&ACT[el.dataset.chg]) ACT[el.dataset.chg](el,e)});
document.addEventListener('input',e=>{const el=e.target.closest('[data-inp]'); if(el&&ACT[el.dataset.inp]) ACT[el.dataset.inp](el,e)});
document.addEventListener('keydown',e=>{if(e.key==='Escape') Sheet.close(); if(e.key==='Enter'){const el=e.target.closest('[data-enter]'); if(el&&ACT[el.dataset.enter]){e.preventDefault();ACT[el.dataset.enter](el,e)}}});

const seg=(tabs,cur,act)=>'<div class="seg">'+tabs.map(t=>`<button data-act="${act}" data-k="${t[0]}" class="${t[0]===cur?'on':''}">${esc(t[1])}</button>`).join('')+'</div>';
const VIEW={};
let curTab='read';
function go(t){ if(t!=='map'&&typeof stopPlay==='function'&&typeof M!=='undefined'&&(M.playing||M.timer)) stopPlay(); else if(t!=='map'&&typeof hush==='function') hush(); curTab=t; $$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+t)); $$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t)); if(VIEW[t]) VIEW[t]()}
async function copyText(t){try{await navigator.clipboard.writeText(t); toast('Copied')}catch(e){toast('Could not copy on this browser')}}
/* Hebrew helpers shared by Codes and Words */
const HEB='אבגדהוזחטיכלמנסעפצקרשת', FIN={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
const hebLetters=s=>String(s).replace(/[ךםןףץ]/g,m=>FIN[m]).replace(/[^א-ת]/g,'');
const HV=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400];
const gemHeb=s=>{let t=0; for(const ch of hebLetters(s)) t+=HV[HEB.indexOf(ch)]; return t};
const GV={'α':1,'β':2,'γ':3,'δ':4,'ε':5,'ϛ':6,'ϝ':6,'ζ':7,'η':8,'θ':9,'ι':10,'κ':20,'λ':30,'μ':40,'ν':50,'ξ':60,'ο':70,'π':80,'ϙ':90,'ϟ':90,'ρ':100,'σ':200,'ς':200,'τ':300,'υ':400,'φ':500,'χ':600,'ψ':700,'ω':800,'ϡ':900};
const grkLetters=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^α-ωϛϝϙϟϡ]/g,'');
const gemGrk=s=>{let t=0; for(const ch of grkLetters(s)) t+=GV[ch]||0; return t};

function openAbout(){Sheet.open({title:'About Chaqar',render(el){el.innerHTML=`<div class="prose">
<p><b>Chaqar</b> (<span class="heb">חקר</span>) is the Hebrew verb for searching a matter out to the bottom. "It is the glory of God to conceal a thing: but the honour of kings is to search out a matter" (Proverbs 25:2).</p>
<p>A study tool that puts the texts, the places, the original words and the manuscripts side by side. Everything here is public domain or openly licensed. Nothing you write (notes, highlights, bookmarks) leaves this device.</p>
<p><b>What it does not do:</b> it does not tell you what to believe. Where translators or manuscripts disagree, it shows you the evidence and the main readings.</p></div>
<h3 class="sec" style="font-size:19px">Sources and credits</h3><div class="sub">
Bible translations: public-domain texts via scrollmapper/bible_databases and eBible.org (World English Bible, Brenton Septuagint). Berean Standard Bible, public domain.<br><br>
Word-by-word Hebrew and Greek, lexicon glosses and manuscript variant marks: STEPBible Data (TAHOT, TAGNT, TBESH, TBESG) by Tyndale House, Cambridge, CC BY 4.0, www.STEPBible.org. Strong's definitions: public domain, via Open Scriptures. Greek definitions: Abbott-Smith (1922).<br><br>
Cross-references and place coordinates: OpenBible.info, CC BY 4.0.<br><br>
Apocrypha, pseudepigrapha and early church texts: R. H. Charles (1913), the Ante-Nicene Fathers (1885–96) and other public-domain editions via scrollmapper. Gospels of Thomas, Mary, Philip, Judas and Truth: translated by Mark M. Mattison, dedicated to the public domain (gospels.net).<br><br>
Images: Wikimedia Commons. Tap any image for its file page, author and license.<br><br>
Satellite imagery: Esri World Imagery (Esri, Maxar, Earthstar Geographics). Terrain: Mapzen terrain tiles on AWS. Map engine: MapLibre GL.<br><br>Sky: positions from Astronomy Engine by Don Cross (MIT). Star catalog and constellation figures from d3-celestial by Olaf Frohn (BSD).<br><br>The Tree: people and family links from Theographic Bible Metadata by Robert Rouse and contributors, CC BY-SA 4.0. 3D engine: three.js (MIT).</div>`}})}

function boot(){
  if(Store.get('vellum',false)){document.documentElement.classList.add('vellum'); $('meta[name=theme-color]').content='#f1e8d5'}
  document.documentElement.style.setProperty('--fs',Store.get('fs',19)+'px');
  renderRead();
}
