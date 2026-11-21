/* Chaqar offline support.
   shell: the app itself, served from cache at once and refreshed in the background.
   data:  Bible texts, dictionary, interlinear. Static, so cache-first; kept for good.
   ext:   images and map tiles from other sites. Cache-first, trimmed to the newest MAX_EXT. */
const V='v2';
const SHELL='chaqar-shell-'+V, DATA='chaqar-data', EXT='chaqar-ext', MAX_EXT=900;
const SHELL_FILES=['./','index.html','app.css','manifest.json','meta.js','icon.svg','icon-180.png','icon-192.png','icon-512.png',
 'vendor/maplibre-gl.css','vendor/maplibre-gl.js','vendor/astronomy.js','vendor/three.js',
 'js/core.js','js/issues.js','js/catalog.js','js/history.js','js/read.js','js/words.js','js/context.js','js/map.js','js/codes.js','js/sky.js',
 'js/patterns.js','js/tree.js','js/tree3d.js','js/lineage-data.js','js/lineage.js','js/measure.js','js/library.js','js/offline.js',
 /* small data every tab needs */
 'data/hebmap.json','data/places.json','data/sky.json','data/succession.json','data/paintings.json','data/variants.json','data/manuscripts.json','data/tree3d.json','data/books.json','data/kjvwords.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(SHELL).then(c=>Promise.all(SHELL_FILES.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('chaqar-shell-')&&k!==SHELL).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

async function trim(){const c=await caches.open(EXT), ks=await c.keys(); for(let i=0;i<ks.length-MAX_EXT;i++) await c.delete(ks[i])}

self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url);
  if(u.origin===location.origin){
    const p=u.pathname;
    if(p.includes('/data/')&&!SHELL_FILES.some(f=>f.startsWith('data/')&&p.endsWith(f))){
      /* cache-first */
      e.respondWith(caches.open(DATA).then(async c=>{const hit=await c.match(req,{ignoreSearch:true}); if(hit) return hit;
        const r=await fetch(req); if(r.ok) c.put(req,r.clone()); return r}));
      return;
    }
    /* stale-while-revalidate for the app shell */
    e.respondWith(caches.open(SHELL).then(async c=>{
      const key=req.mode==='navigate'?'index.html':req;
      const hit=await c.match(key,{ignoreSearch:true});
      const net=fetch(req).then(r=>{if(r.ok) c.put(key,r.clone()); return r}).catch(()=>hit);
      if(hit){e.waitUntil(net.catch(()=>{})); return hit}
      return net;
    }));
    return;
  }
  /* other sites: images and map tiles */
  const dest=req.destination;
  if(dest==='image'||/tile|arcgisonline|amazonaws|wikimedia|wikipedia/.test(u.hostname+u.pathname)){
    e.respondWith(caches.open(EXT).then(async c=>{const hit=await c.match(req); if(hit) return hit;
      try{const r=await fetch(req); if(r.ok||r.type==='opaque'){c.put(req,r.clone()); e.waitUntil(trim())} return r}
      catch(err){return hit||Response.error()}}));
  }
});
