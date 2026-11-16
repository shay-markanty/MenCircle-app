'use strict';
const BUILD="8b389d4b48e8a314";
const BASE=new URL('./',self.location.href);
const PREFIX='men-circle:'+BASE.href+':';
const CACHE=PREFIX+BUILD;
const INDEX=new URL('index.html',BASE).href;
const FILES=["./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"].map(f=>new URL(f,BASE).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})));
  const saved=await cache.match(INDEX,{ignoreVary:true});
  if(!saved||!(await saved.text()).includes('data-circle-build="'+BUILD+'"'))throw new Error('The cached HTML does not match this build.');
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('message',event=>{
  if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());
  if(event.data?.type==='GET_VERSION')event.ports?.[0]?.postMessage({version:BUILD});
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);url.hash='';url.search='';
  // Repair pages and release metadata always go to the network, even offline.
  // Root and index navigation always share the same verified cached HTML.
  const entry=url.href===BASE.href||url.href===INDEX;
  if(!entry&&!FILES.includes(url.href))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const saved=await cache.match(entry?INDEX:url.href,{ignoreVary:true});
    return saved||fetch(event.request);
  })());
});
