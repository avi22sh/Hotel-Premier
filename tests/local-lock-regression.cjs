const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
let now=1000000,blocked=false,serial=0;
const data=new Map([['hp_vault_master_pin','legacy-fixture'],['hp_admin_pin_hash','legacy-fixture-hash'],['hp_crm_guests','preserve-guests'],['hotel_premier_user_overrides_v1','preserve-photos']]);
const timers=new Map();
class Clock extends Date { static now(){return now;} }
const context={window:{crypto:webcrypto,addEventListener(){}},document:{addEventListener(){}},Date:Clock,console,Uint8Array,TextEncoder,
 localStorage:{getItem:k=>data.get(k)||null,setItem(k,v){if(blocked)throw Error('Storage unavailable');data.set(k,v);},removeItem:k=>data.delete(k)},
 setTimeout(fn){timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id)};
vm.createContext(context);vm.runInContext(fs.readFileSync('local-lock.js','utf8'),context);
(async()=>{
 const lock=context.window.HotelLocalLock;
 assert.equal(lock.status().configured,false,'Legacy plaintext/hash must not grant access');
 await assert.rejects(lock.verify('123456'),/Create a local PIN/);
 await assert.rejects(lock.setPin('1234'),/6 to 64 digits/);
 await assert.rejects(lock.setPin('abcdef'),/6 to 64 digits/);
 await lock.setPin('482619');
 let record=JSON.parse(data.get('hp_local_lock_v1'));
 assert.equal(record.algorithm,'PBKDF2-SHA-256');assert.ok(record.iterations>=210000);assert.equal(record.salt.length,32);assert.equal(record.hash.length,64);assert.ok(!data.get('hp_local_lock_v1').includes('482619'));
 assert.equal(data.has('hp_vault_master_pin'),false);assert.equal(data.has('hp_admin_pin_hash'),false);
 assert.equal(data.get('hp_crm_guests'),'preserve-guests');assert.equal(data.get('hotel_premier_user_overrides_v1'),'preserve-photos');
 const salt=record.salt;await lock.setPin('482619');assert.notEqual(JSON.parse(data.get('hp_local_lock_v1')).salt,salt,'Each PIN write needs a fresh salt');
 let lockedReason='';lock.onLock(reason=>{lockedReason=reason;});lock.lock();
 await assert.rejects(lock.setPin('763824'),/Unlock this device/);
 assert.equal(await lock.verify('999999'),false);assert.equal(await lock.verify('999999'),false);assert.equal(await lock.verify('999999'),false);
 const first=lock.status().retryAfterMs;assert.equal(first,1000);
 await assert.rejects(lock.verify('482619'),/Too many attempts/);
 now+=1001;assert.equal(await lock.verify('999999'),false);assert.equal(lock.status().retryAfterMs,2000);
 now+=2001;assert.equal(await lock.verify('482619'),true);assert.equal(lock.status().retryAfterMs,0);
 now+=lock.idleMs-1;lock.touch();now+=lock.idleMs+1;assert.equal(lock.isUnlocked(),false);assert.match(lockedReason,/15 minutes/);
 assert.equal(await lock.verify('482619'),true);
 const before=data.get('hp_local_lock_v1');blocked=true;await assert.rejects(lock.setPin('763824'),/Storage unavailable/);assert.equal(data.get('hp_local_lock_v1'),before);blocked=false;
 lock.lock();context.window.crypto=null;await assert.rejects(lock.verify('482619'),/WebCrypto/);assert.equal(lock.isUnlocked(),false);
 for(const file of ['admin.js','storage.js','vault.js']){
  const source=fs.readFileSync(file,'utf8');assert.doesNotMatch(source,/defaultPin|ALLOWED_MASTER_HASHES|DEFAULT_HASH|['"]admin123['"]|['"]9325['"]/);
 }
 console.log('PASS: PBKDF2, random salts, no default bypass, exponential delays, inactivity lock, storage failure and WebCrypto fail-closed');
})().catch(error=>{console.error(error);process.exitCode=1;});
