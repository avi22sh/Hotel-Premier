const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const handlers={},entries=new Map(),calls=[];let offline=false,skips=0,claims=0;
const key=v=>typeof v==='string'?new URL(v,'https://example.test/Hotel-Premier/').href:v.url;
const cache={async match(request){return entries.get(key(request))?.clone();},async put(request,response){entries.set(key(request),response);}};
const c={URL,Request,Response,console,Promise,caches:{open:async()=>cache,keys:async()=>['hotel-premier-old','other-app'],delete:async name=>calls.push(['delete',name])},
 fetch:async request=>{calls.push(['fetch',key(request)]);if(offline)throw Error('Offline');if(key(request).endsWith('admin.html'))return new Response('Missing',{status:404});return new Response('network');},
 self:{registration:{scope:'https://example.test/Hotel-Premier/'},location:{origin:'https://example.test'},clients:{matchAll:async()=>[],claim(){claims++;}},skipWaiting(){skips++;},addEventListener:(name,fn)=>handlers[name]=fn}};
vm.runInNewContext(fs.readFileSync('sw.js','utf8'),c);
(async()=>{
 let install;handlers.install({waitUntil:p=>install=p});await install;
 assert.ok(entries.has(key('index.html')));assert.ok(!entries.has(key('admin.html')));assert.equal(skips,0);
 let activation;handlers.activate({waitUntil:p=>activation=p});await activation;assert.equal(claims,0);assert.deepEqual(calls.filter(x=>x[0]==='delete'),[['delete','hotel-premier-old']]);
 const beforeDeletes=calls.filter(x=>x[0]==='delete').length;c.self.clients.matchAll=async()=>[{}];handlers.activate({waitUntil:p=>activation=p});await activation;assert.equal(calls.filter(x=>x[0]==='delete').length,beforeDeletes,'Open older tabs keep their offline shell');
 async function image(path){let result;const tasks=[];handlers.fetch({request:{url:key(path),method:'GET',destination:'image',headers:new Headers()},respondWith:p=>result=p,waitUntil:p=>tasks.push(p)});const response=await result;await Promise.all(tasks);return response;}
 entries.set(key('assets/original.jpg'),new Response('old'));assert.equal(await (await image('assets/original.jpg')).text(),'old');assert.equal(await entries.get(key('assets/original.jpg')).clone().text(),'network');
 const hashed='assets/menu-responsive/abcdef123456-480.webp';entries.set(key(hashed),new Response('immutable'));const before=calls.length;assert.equal(await(await image(hashed)).text(),'immutable');assert.equal(calls.length,before);
 offline=true;assert.ok((await image('assets/missing.jpg')).ok); // branded cached placeholder
 let intercepted=false;handlers.fetch({request:{url:key('guest-access'),method:'GET',cache:'no-store',headers:new Headers()},respondWith(){intercepted=true;}});assert.equal(intercepted,false);
 handlers.message({data:{type:'SKIP_WAITING'}});assert.equal(skips,1);
 const page=fs.readFileSync('index.html','utf8');assert.doesNotMatch(page,/refreshWhenIdle|skipWaiting|getRegistrations/);
 console.log('PASS: partial precache, original SWR, immutable cache-first, offline placeholder, no-store bypass and guest-controlled activation');
})().catch(error=>{console.error(error);process.exitCode=1;});
