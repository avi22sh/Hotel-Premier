const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = vm.createContext({ window: { HotelPhotoStorage:{pack:async value=>value,checkSpace:async()=>{},compact:value=>value,hydrate:value=>value,normalizePaths:value=>value} }, console: { warn() {} }, localStorage: {
  getItem() { return null; }, setItem() {}
} });
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'storage.js'), 'utf8'), context);
(async () => {
  const storage = context.window.HOTEL_STORAGE;
  await storage.initPromise;
  let tx;
  let request;
  let written;
  storage.db = { transaction(name,mode) {
    if(mode==='readonly')return {objectStore(){return {get(){const read={};queueMicrotask(()=>{read.result={id:'dish-1',price:120};read.onsuccess();});return read;}};}};
    tx = { objectStore() { return {
      get() { request = {}; return request; },
      put(value) { written = value; }
    }; } };
    return tx;
  } };
  let resolved = false;
  const saving = storage.saveDishOverride('dish-1', { image: 'photo.jpg' }).then(() => { resolved = true; });
  for(let i=0;i<20;i++) await Promise.resolve();
  request.result = { id: 'dish-1', price: 120 };
  request.onsuccess();
  for(let i=0;i<20;i++) await Promise.resolve();
  assert.equal(resolved, false, 'Save must wait for transaction commit');
  assert.equal(written.price, 120, 'Existing fields must survive');
  tx.oncomplete();
  await saving;
  assert.equal(resolved, true);
  context.localStorage.setItem = () => { throw Error('Quota'); };
  const failure = storage.saveDishOverride('dish-1', { image: 'large-photo' });
  for(let i=0;i<20;i++) await Promise.resolve();
  tx.onabort();
  await assert.rejects(failure, /interrupted/);
  storage.db = null;
  await assert.rejects(storage.saveDishOverride('dish-1', {}), /IndexedDB is unavailable/);
  context.localStorage.setItem = () => {};
  await assert.rejects(storage.saveDishOverride('dish-1', { image: 'offline.jpg' }),/IndexedDB is unavailable/);
  let lifecycle;
  storage.saveDishOverride=async(id,record)=>{lifecycle=record;};
  await storage.saveDishPhotoLifecycle('dish-1',{image:'raw.jpg',rawOriginalImage:'raw.jpg',enhancedMasterImage:'enhanced.jpg',enhancementStatus:'original'});
  assert.equal(lifecycle.image,'raw.jpg','Explicit original selection must not be replaced by enhanced master');
  assert.equal(lifecycle.enhancedMasterImage,'enhanced.jpg');
  console.log('PASS: transaction completion, merge preservation, failure reporting and fail-closed photo saves without IndexedDB');
})().catch(error => { console.error(error); process.exitCode = 1; });
