const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{constructor(){this.children=[];this.events={};this.style={};this.isConnected=true;this.html='';}set innerHTML(value){this.html=value;}get innerHTML(){return this.html;}replaceChildren(...children){this.children=children;this.html='';}append(...children){this.children.push(...children);}setAttribute(name,value){this[name]=value;}addEventListener(name,fn){this.events[name]=fn;}}
let unlocked=true;const fields={},pending=[];
const c={window:{HotelLocalLock:{isUnlocked:()=>unlocked},app:{categories:[],menuData:[],showToast(){},getSectionDishes:()=>[]}},console,document:{readyState:'loading',addEventListener(){},createElement:()=>new Element(),getElementById:id=>fields[id]||null,querySelectorAll:()=>[]}};
vm.createContext(c);for(const file of ['data/hotel-data.js','admin.js'])vm.runInContext(fs.readFileSync(file,'utf8')+(file==='admin.js'?';window.Admin=HotelPremierAdmin;':''),c);
c.window.HOTEL_PREMIER_HOTEL_DATA.roomCategories=c.window.HOTEL_PREMIER_HOTEL_DATA.roomCategories.slice(0,1);
c.window.HOTEL_STORAGE={getRoomGallery:()=>new Promise((resolve,reject)=>pending.push({resolve,reject})),getSectionSlides:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))};
const admin=Object.create(c.window.Admin.prototype);admin.isAuthenticated=true;admin.getBulkDeals=()=>[];
(async()=>{
 const container=new Element();fields['admin-tab-content']=container;admin.currentTab='rooms';
 const old=admin.renderRoomsManager(container);assert.equal(container.children[0].role,'status');
 admin.switchTab('content');container.innerHTML='New content tab';pending.shift().resolve([]);await old;assert.equal(container.innerHTML,'New content tab');
 admin.currentTab='rooms';const older=admin.renderRoomsManager(container),newer=admin.renderRoomsManager(container);
 pending.pop().resolve(['new.jpg']);await newer;const fresh=container.innerHTML;assert.match(fresh,/new.jpg/);pending.shift().resolve(['old.jpg']);await older;assert.equal(container.innerHTML,fresh);
 const locking=admin.renderRoomsManager(container);unlocked=false;admin.lockAdminSession('Expired');unlocked=true;admin.isAuthenticated=true;admin.currentTab='rooms';container.innerHTML='Fresh unlocked view';pending.shift().resolve([]);await locking;assert.equal(container.innerHTML,'Fresh unlocked view','An old session cannot render after a new unlock');
 const failing=admin.renderRoomsManager(container);pending.shift().reject(Error('Read failed'));await failing;assert.equal(container.children[0].role,'alert');assert.equal(container.children[1].textContent,'Retry');
 admin.currentTab='slides';const child=new Element(),hero=admin.renderHeroSlidesCMS(child);child.isConnected=false;child.innerHTML='Detached';pending.shift().resolve([]);await hero;assert.equal(child.innerHTML,'Detached');
 const editor=admin.openEditSlideModal('hero','restaurant_hero',0);admin.adminViewGeneration++;const body=new Element();fields['image-modal-body']=body;body.innerHTML='New editor';pending.shift().resolve([{title:'Old banner',image:'old.jpg'}]);await editor;assert.equal(body.innerHTML,'New editor');
 let errorMessage;c.window.app.showToast=message=>errorMessage=message;const unreadable=admin.openEditSlideModal('hero','restaurant_hero',0);pending.shift().reject(Error('Read failed'));await unreadable;assert.match(errorMessage,/could not be loaded/);assert.equal(body.innerHTML,'New editor');
 console.log('PASS: stale tab/session reads, overlapping room loads, detached slide views, retry states and delayed photo editor opening');
})().catch(error=>{console.error(error);process.exitCode=1;});
