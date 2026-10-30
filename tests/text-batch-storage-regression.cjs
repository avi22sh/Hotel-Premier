const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let records={child:{id:'child',name:'Before',image:'photo.jpg',price:140,updatedAt:50,fieldUpdatedAt:{image:40}},group:{id:'group',variants:[{name:'Before',price:140}],updatedAt:50}},fail=false;
const c={window:{HotelPhotoStorage:{pack:async v=>v,checkSpace:async()=>{},compact:v=>v}},console:{warn(){}},localStorage:{getItem:()=>null,setItem(){}},Date:class extends Date{static now(){return 100;}}};
vm.runInNewContext(fs.readFileSync('storage.js','utf8'),c);
(async()=>{
 const storage=c.window.HOTEL_STORAGE;await storage.initPromise;
 storage.db={transaction(){const pending={},tx={error:Error('Quota'),objectStore:()=>({get(id){const r={};queueMicrotask(()=>{r.result=records[id];r.onsuccess();});return r;},put(record){pending[record.id]=record;}})};setImmediate(()=>{if(fail)tx.onabort();else{Object.assign(records,pending);tx.oncomplete();}});return tx;}};
 const changes={child:{name:'After',description:'Fresh'},group:{variants:[{name:'After',price:140}]}};
 fail=true;await assert.rejects(storage.saveDishTextEdits(changes),/Quota/);assert.equal(records.child.name,'Before');assert.equal(records.group.variants[0].name,'Before');
 fail=false;await storage.saveDishTextEdits(changes);assert.equal(records.child.name,'After');assert.equal(records.group.variants[0].name,'After');assert.equal(records.child.price,140);assert.equal(records.child.image,'photo.jpg');assert.equal(records.child.fieldUpdatedAt.image,40);assert.equal(records.child.fieldUpdatedAt.name,100);
 await assert.rejects(storage.saveDishTextEdits({child:{price:5}}),/Invalid/);
 console.log('PASS: linked text changes commit atomically, preserve image edit times and prices, and reject unrelated fields');
})().catch(e=>{console.error(e);process.exitCode=1;});
