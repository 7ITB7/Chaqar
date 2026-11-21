'use strict';
/* Offline: register the service worker and let the reader save whole packs ahead of time. */
const OFF={busy:null};
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  const first=!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(()=>{});
  /* first visit: what loaded before the worker took over was not kept, so keep it now */
  if(first&&'caches' in window) navigator.serviceWorker.ready.then(async()=>{const c=await caches.open('chaqar-data');
    for(const p of _c.keys()){const u=new URL('data/'+p,location.href).href; if(!await c.match(u)) try{const r=await fetch(u); if(r.ok) await c.put(u,r)}catch(e){}}});
}
addEventListener('offline',()=>toast('Offline. Saved books and anything you have opened still work.'));
addEventListener('online',()=>toast('Back online'));

const TR_SIZE={KJV:9.7,WEB:9.8,BSB:7.7,LXX:6.8,WLC:5.3,WYC:4.9,DRC:4.7,YLT:4.2,GNV:4.2,ASV:4.2,VUL:4.1,BRE:4.0,JPS:3.2,TR:1.6,TYN:1.2,SP:0.7};
function packFiles(id){
  if(id==='lex') return ['lex/H.json','lex/G.json','lex/cH.json','lex/cG.json','lex/uH.json','lex/uG.json'];
  if(id==='il') return IDS.slice(0,66).map(b=>`il/${b}.json`);
  return IDS.filter(b=>hasBook(id,b)).map(b=>`t/${id}/${b}.json`);
}
const packName=id=>id==='lex'?'Hebrew and Greek dictionary':id==='il'?'Word-by-word Hebrew and Greek':(TRI[id]?TRI[id][0]:id);
const packMB=id=>id==='lex'?11:id==='il'?22:(TR_SIZE[id]||5);
async function packState(id){ if(!('caches' in window)) return 0; const c=await caches.open('chaqar-data'), fs=packFiles(id); let n=0;
  for(const f of fs) if(await c.match(new URL('data/'+f,location.href).href,{ignoreSearch:true})) n++; return fs.length?n/fs.length:0 }
async function savePack(id){
  if(OFF.busy){toast('Already saving '+packName(OFF.busy));return}
  const c=await caches.open('chaqar-data'), fs=packFiles(id); OFF.busy=id; let done=0, fail=0;
  const bar=()=>{const b=$(`#off-${id}`); if(b) b.innerHTML=`<i style="width:${Math.round(done/fs.length*100)}%"></i>`};
  for(let i=0;i<fs.length;i+=4){
    await Promise.all(fs.slice(i,i+4).map(async f=>{const u=new URL('data/'+f,location.href).href;
      try{ if(!await c.match(u,{ignoreSearch:true})){const r=await fetch(u,{cache:'reload'}); if(!r.ok) throw 0; await c.put(u,r)} }catch(e){fail++} done++; bar()}));
  }
  OFF.busy=null; toast(fail?`Saved with ${fail} files missing. Try again when the connection is better.`:packName(id)+' saved for offline');
  if(Sheet.top()&&Sheet.top().offline) Sheet.redraw();
}
async function dropPack(id){const c=await caches.open('chaqar-data'); for(const f of packFiles(id)) await c.delete(new URL('data/'+f,location.href).href,{ignoreSearch:true}); toast('Removed'); Sheet.redraw()}
ACT.offsave=el=>savePack(el.dataset.k);
ACT.offdrop=el=>dropPack(el.dataset.k);
ACT.offline=()=>{const o={title:'Use without internet',offline:true,full:true,render(el){
  if(!('caches' in window)||!('serviceWorker' in navigator)){el.innerHTML='<p class="note">This browser cannot store the app for offline use.</p>';return}
  const packs=[R.s.tr,...['KJV','BSB','WEB'].filter(t=>t!==R.s.tr),'lex','il'];
  el.innerHTML=`<p class="sub" style="margin-top:0">The app itself is kept on this device once you have opened it. Every chapter, dictionary entry and picture you open is kept too. To read anywhere, save whole packs here before you go.</p><div id="off-list">`+
    packs.map(id=>`<div class="offrow"><div><b>${esc(packName(id))}</b><small id="offs-${id}">about ${packMB(id)} MB · checking…</small><div class="offbar" id="off-${id}"></div></div><span id="offb-${id}"></span></div>`).join('')+
    `</div><p class="note" style="margin-top:16px">Map imagery is kept for the areas you have looked at, up to about 900 tiles and pictures. The 3D Tree, Sky and Measure tabs work fully offline once opened.</p>`;
  packs.forEach(async id=>{const s=await packState(id), sm=$('#offs-'+id), bt=$('#offb-'+id); if(!sm) return;
    const full=s>=0.999; sm.textContent=`about ${packMB(id)} MB · `+(OFF.busy===id?'saving…':full?'saved':s>0?Math.round(s*100)+'% kept from reading':'not saved');
    const b=$('#off-'+id); if(b) b.innerHTML=`<i style="width:${Math.round(s*100)}%"></i>`;
    bt.innerHTML=full?`<button class="btn sm" data-act="offdrop" data-k="${id}">Remove</button>`:`<button class="btn pri sm" data-act="offsave" data-k="${id}">Save</button>`});
}}; Sheet.open(o)};
