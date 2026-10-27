const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const fields={'apply-dish-photo-btn':{disabled:false},'image-preview-element':{src:'old.jpg'}};let uploads=[],released=[],writes=0,resolveSave,fail=false,closed=0;
const c={AbortController,DOMException,CustomEvent:class{},clearTimeout(){},console,window:{dispatchEvent(){},HotelLocalLock:{isUnlocked:()=>true},HotelDialogs:{confirm:async()=>true},HotelPhotoWorkflow:{ingest:()=>new Promise(resolve=>uploads.push(resolve)),release:value=>released.push(value)},app:{menuData:[{id:'dish',name:'Dish',image:'old.jpg'}],saveMenuData(){},renderCategoryCards(){},renderMenu(){},currentCategory:'all',showToast(){}}},document:{readyState:'loading',addEventListener(){},getElementById:id=>fields[id]||null}};
vm.runInNewContext(fs.readFileSync('admin.js','utf8')+';window.Admin=HotelPremierAdmin;',c);const admin=Object.create(c.window.Admin.prototype);admin.isAuthenticated=true;admin.activeImageDishId='dish';admin.tempImageSource='old.jpg';admin.filterAdminDishes=()=>{};
const tick=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
(async()=>{
 const uploading=admin.handleImageFileUpload({files:[{}]});assert.equal(admin.photoUploadPending,true);assert.equal(await admin.saveReplacedImage(),false);admin.closeImageModal();uploads.shift()({originalUrl:'raw.jpg',workingUrl:'late.jpg'});await uploading;assert.notEqual(admin.tempImageSource,'late.jpg');assert.ok(released.includes('late.jpg'));
 Object.assign(admin,{activeImageDishId:'dish',tempImageSource:'preview.jpg',rawOriginalSource:'raw.jpg',photoUploadPending:false,previewRequestId:3});
 c.window.HOTEL_STORAGE={saveDishOverride:async(id,payload)=>{writes++;if(fail)throw Error('Quota');await new Promise(resolve=>resolveSave=resolve);return {...payload};}};
 admin.closeImageModal=()=>{closed++;};
 const saving=admin.saveReplacedImage();await tick();assert.equal(await admin.saveReplacedImage(),false);assert.equal(writes,1);assert.equal(c.window.app.menuData[0].image,'old.jpg');admin.tempImageSource='newer-preview.jpg';admin.previewRequestId++;resolveSave();assert.equal(await saving,true);assert.equal(c.window.app.menuData[0].image,'preview.jpg');assert.equal(closed,0,'Do not close a newer preview');
 fail=true;assert.equal(await admin.saveReplacedImage(),false);assert.equal(c.window.app.menuData[0].image,'preview.jpg');
 await admin.deleteDishPhoto('dish');assert.equal(c.window.app.menuData[0].image,'preview.jpg','A failed deletion must preserve the visible photo');
 fail=false;const deleting=admin.deleteDishPhoto('dish');await tick();assert.equal(c.window.app.menuData[0].image,'preview.jpg');resolveSave();await deleting;assert.equal(c.window.app.menuData[0].image,'','Blank is an intentional durable deletion');
 console.log('PASS: cancelled upload cleanup, commit-before-display, duplicate-save guard, snapshot safety, failed-save preservation and transactional deletion');
})().catch(error=>{console.error(error);process.exitCode=1;});
