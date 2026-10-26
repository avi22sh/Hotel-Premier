const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const saved=new Map();let backup;
const original=new Blob(['original camera pixels'],{type:'image/jpeg'}),optimized=new Blob(['optimized pixels'],{type:'image/webp'}),working=URL.createObjectURL(optimized);
const database=()=>{
 const stores=new Map(['dish_overrides','room_galleries','section_slides','hotel_settings'].map(name=>[name,new Map()]));
 return {transaction(name,mode){const records=stores.get(name),tx={};tx.objectStore=()=>({
  get(id){const request={};queueMicrotask(()=>{request.result=records.get(id);request.onsuccess();});return request;},
  getAll(){const request={};queueMicrotask(()=>{request.result=[...records.values()];request.onsuccess();});return request;},
  put(value){queueMicrotask(()=>{records.set(value.id||value.key,value);tx.oncomplete?.();});}
 });return tx;}};
};
const c={Blob,fetch,crypto:crypto.webcrypto,Event,console:{warn(){}},window:{addEventListener(){},dispatchEvent(){},HotelPhotoWorkflow:{getOriginal:source=>source===working?original:null},navigator:{storage:{estimate:async()=>({quota:1e9,usage:0}),persisted:async()=>true}}},
 URL:{createObjectURL:blob=>{if(blob.type==='application/json')backup=blob;return URL.createObjectURL(blob);},revokeObjectURL:URL.revokeObjectURL},
 FileReader:class{async readAsDataURL(blob){this.result='data:'+blob.type+';base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');this.onload();}},
 localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value),key:index=>[...saved.keys()][index],get length(){return saved.size;}},
 document:{createElement:()=>({click(){}}),body:{appendChild(){},removeChild(){}}}};
vm.createContext(c);for(const file of ['photo-storage.js','data-validation.js','storage.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
(async()=>{
 const storage=c.window.HOTEL_STORAGE;await storage.initPromise;storage.db=database();
 await storage.saveRoomGallery('ac-super-deluxe',[working]);
 await storage.saveSectionSlides('restaurant_hero',[{title:'Fixture banner',image:working}]);
 assert.equal(saved.size,0,'Room/banner photo bytes must not go into localStorage');
 await storage.exportFullBackup();const payload=JSON.parse(await backup.text());
 assert.match(Object.values(payload.originalPhotoArchives.room_galleries['ac-super-deluxe'])[0],/^data:image\/jpeg;base64,/);
 assert.match(payload.roomGalleries['ac-super-deluxe'][0],/^data:image\/webp;base64,/);
 storage.db=database();await storage.importFullBackup(payload);
 const [restored]=await storage.getRoomGallery('ac-super-deluxe');
 assert.equal(await(await fetch(restored)).text(),'optimized pixels');
 const recovered=await storage.originalForPhoto('room_galleries','ac-super-deluxe',restored);
 assert.equal(await(await fetch(recovered)).text(),'original camera pixels');
 const [slide]=await storage.getSectionSlides('restaurant_hero');
 const recoveredBanner=await storage.originalForPhoto('section_slides','restaurant_hero',slide.image);
 assert.equal(await(await fetch(recoveredBanner)).text(),'original camera pixels');
 await assert.rejects(storage.importFullBackup({originalPhotoArchives:{unsafe:{}}}),/Nothing has been restored/);
 URL.revokeObjectURL(working);c.window.HotelPhotoStorage.release('');
 console.log('PASS: room/banner Blob originals survive full backup, fresh-store restore and original-photo lookup without localStorage image bytes');
})().catch(error=>{console.error(error);process.exitCode=1;});
