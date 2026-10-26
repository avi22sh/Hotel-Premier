const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const fields={};let configured=false,unlocked=false,createCalls=0,verifyCalls=0,lockCallback,rendered='';
for(const id of ['admin-pin-input','admin-pin-confirm-input','admin-auth-status','admin-pin-confirm-row','admin-unlock-btn','admin-auth-view','admin-dashboard-view','admin-tab-content'])fields[id]={value:'',style:{},focus(){},replaceChildren(){this.cleared=true;}};
const lock={status:()=>({configured,unlocked,retryAfterMs:0}),isUnlocked:()=>unlocked,onLock(fn){lockCallback=fn;},async setPin(value){createCalls++;assert.equal(value,'482619');configured=unlocked=true;return true;},async verify(){verifyCalls++;return unlocked=true;}};
const c={window:{HotelLocalLock:lock,app:{showToast(){}}},document:{readyState:'loading',addEventListener(){},getElementById:id=>fields[id]||null,querySelectorAll:()=>[]},console};
vm.createContext(c);vm.runInContext(fs.readFileSync('admin.js','utf8')+';window.Admin=HotelPremierAdmin;',c);
const admin=Object.create(c.window.Admin.prototype);admin.switchTab=name=>{rendered=name;};
(async()=>{
 admin.configureAuthView();assert.equal(fields['admin-pin-confirm-row'].hidden,false);assert.equal(fields['admin-unlock-btn'].textContent,'Create local PIN');
 fields['admin-pin-input'].value='482619';fields['admin-pin-confirm-input'].value='wrong';await admin.verifyPin();assert.equal(createCalls,0);assert.match(fields['admin-auth-status'].textContent,/must match/);
 fields['admin-pin-confirm-input'].value='482619';await admin.verifyPin();assert.equal(createCalls,1);assert.equal(admin.isAuthenticated,true);assert.equal(rendered,'crm');assert.equal(fields['admin-pin-input'].value,'');
 unlocked=false;admin.lockAdminSession('Session expired');assert.equal(admin.isAuthenticated,false);assert.equal(fields['admin-dashboard-view'].style.display,'none');assert.equal(fields['admin-tab-content'].cleared,true);
 fields['admin-pin-input'].value='482619';await admin.verifyPin();assert.equal(verifyCalls,1);
 delete c.window.HotelLocalLock;await admin.verifyPin();assert.match(fields['admin-auth-status'].textContent,/unavailable/);assert.equal(admin.isAuthenticated,false);
 assert.match(fs.readFileSync('index.html','utf8'),/device-local lock, not server security/);
 console.log('PASS: first-run confirmation, no bypass, async unlock, cleared PIN fields, local-only notice and inactivity UI clearing');
})().catch(error=>{console.error(error);process.exitCode=1;});
