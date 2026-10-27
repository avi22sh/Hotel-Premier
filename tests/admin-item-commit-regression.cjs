const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const item={id:'custom',name:'Custom item',price:80,tags:[],isSoldOut:false};let saved;
const c={console,window:{HotelLocalLock:{isUnlocked:()=>true},HotelDialogs:{confirm:async()=>true},HOTEL_STORAGE:{saveDishOverride:async()=>{throw Error('Quota');}},app:{menuData:[item],showToast(){},saveMenuData(){},renderMenu(){},renderCategoryCards(){}}},document:{readyState:'loading',addEventListener(){},getElementById(){return null;}}};
vm.runInNewContext(fs.readFileSync('admin.js','utf8')+';window.Admin=HotelPremierAdmin;',c);const admin=Object.create(c.window.Admin.prototype);admin.isAuthenticated=true;admin.filterAdminDishes=()=>{};
(async()=>{
 await admin.updatePrice('custom','150');assert.equal(item.price,80);
 await admin.toggleDishTag('custom','sweet');assert.deepEqual(item.tags,[]);
 await admin.toggleAvailability('custom',false);assert.equal(item.isSoldOut,false);
 c.window.HotelMenuStructure={snapshot:()=>({items:{custom:{name:item.name}},order:['custom']}),saveDraft(){throw Error('Quota');}};
 await admin.deleteDish('custom');assert.equal(c.window.app.menuData.length,1);
 c.window.HotelMenuStructure.saveDraft=next=>{saved=next;c.window.app.menuData=[];};await admin.deleteDish('custom');assert.equal(saved.items.custom._deleted,true);assert.equal(saved.order.length,0);
 console.log('PASS: failed price/tag/status/deletion writes retain saved values; custom item deletion stores a tombstone');
})().catch(error=>{console.error(error);process.exitCode=1;});
