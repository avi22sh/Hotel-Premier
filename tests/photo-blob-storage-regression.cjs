const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const urls=new Map();let serial=0,revoked=0;
const c={window:{addEventListener(){},navigator:{storage:{estimate:async()=>({usage:0,quota:50e6}),persisted:async()=>false,persist:async()=>true}},dispatchEvent(){}},Blob,Event,
 URL:{createObjectURL:blob=>{const id='blob:fixture-'+(++serial);urls.set(id,blob);return id;},revokeObjectURL:id=>{urls.delete(id);revoked++;}},
 fetch:async value=>new Response(value.startsWith('blob:')?urls.get(value):Uint8Array.from([1,2,3]),{headers:{'content-type':'image/webp'}})};
vm.runInNewContext(fs.readFileSync('photo-storage.js','utf8'),c);
(async()=>{
 const api=c.window.HotelPhotoStorage;
 c.window.HOTEL_PREMIER_LEGACY_PHOTO_PATHS={'old photo.jpg':'assets/new-photo.jpg'};
 assert.equal(api.normalizePaths({image:'assets/OLD%20PHOTO.jpg?v=old'}).image,'assets/new-photo.jpg');
 const packed=await api.pack({image:'data:image/webp;base64,AQID',rawOriginalImage:'assets/original.jpg',variants:[{image:'data:image/png;base64,AQID',price:80}]});
 assert.ok(packed.image instanceof Blob);assert.ok(packed.variants[0].image instanceof Blob);assert.equal(packed.rawOriginalImage,'assets/original.jpg');
 const compact=api.compact(packed);assert.ok(!('image'in compact));assert.equal(compact.variants[0].price,80);
 const hydrated=api.hydrate(packed,'dish/1');assert.match(hydrated.image,/^blob:/);assert.equal(api.hydrate(packed,'dish/1').image,hydrated.image,'Repeated renders reuse URLs');
 assert.equal((await api.pack(hydrated)).image.size,3);
 await api.checkSpace(packed);
 c.window.navigator.storage.estimate=async()=>({usage:49e6,quota:50e6});await assert.rejects(api.checkSpace(packed),/Export a backup/);
 api.release('dish/1');assert.equal(urls.size,0);assert.equal(revoked,2);
 const storage=fs.readFileSync('storage.js','utf8');assert.doesNotMatch(storage,/fullLocalSave|compactOverrides|\[stored_in_indexeddb\]/);
 console.log('PASS: Blob packing, metadata-only cache, nested variants, URL reuse/release and quota protection');
})().catch(error=>{console.error(error);process.exitCode=1;});
