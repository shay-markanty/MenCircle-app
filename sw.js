'use strict';
const CACHE='men-circle-d6328476b681435a';
const BASE=new URL('./',self.location.href);
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"].map(f=>new URL(f,BASE).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('men-circle-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);url.hash='';url.search='';
  if(!FILES.includes(url.href))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const saved=await cache.match(url.href);
    return saved||fetch(event.request);
  })());
});
