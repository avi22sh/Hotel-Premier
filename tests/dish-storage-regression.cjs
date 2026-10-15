const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = vm.createContext({ window: {}, console: { warn() {} }, localStorage: {
  getItem() { return null; }, setItem() {}
} });
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'storage.js'), 'utf8'), context);
(async () => {
  const storage = context.window.HOTEL_STORAGE;
  await storage.initPromise;
  let tx;
  let request;
  let written;
  storage.db = { transaction() {
    tx = { objectStore() { return {
      get() { request = {}; return request; },
      put(value) { written = value; }
    }; } };
    return tx;
  } };
  let resolved = false;
  const saving = storage.saveDishOverride('dish-1', { image: 'photo.jpg' }).then(() => { resolved = true; });
  await Promise.resolve();
  request.result = { id: 'dish-1', price: 120 };
  request.onsuccess();
  await Promise.resolve();
  assert.equal(resolved, false, 'Save must wait for transaction commit');
  assert.equal(written.price, 120, 'Existing fields must survive');
  tx.oncomplete();
  await saving;
  assert.equal(resolved, true);
  context.localStorage.setItem = () => { throw Error('Quota'); };
  const failure = storage.saveDishOverride('dish-1', { image: 'large-photo' });
  await Promise.resolve();
  tx.onabort();
  await assert.rejects(failure, /Unable to save the complete photo/);
  storage.db = null;
  await assert.rejects(storage.saveDishOverride('dish-1', {}), /Unable to save/);
  context.localStorage.setItem = () => {};
  await storage.saveDishOverride('dish-1', { image: 'offline.jpg' });
  console.log('PASS: transaction completion, merge preservation, failure reporting and local fallback');
})().catch(error => { console.error(error); process.exitCode = 1; });
