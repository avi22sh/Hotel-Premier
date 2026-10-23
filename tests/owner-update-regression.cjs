const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map();let fail=false;
const c={window:{},console,URL,URLSearchParams,localStorage:{getItem:k=>storage.get(k)||null,setItem(k,v){if(fail)throw Error('Storage full');storage.set(k,v);}},document:{readyState:'loading',addEventListener(){}}};
vm.createContext(c);
for(const file of ['data/menu-data.js','menu-structure.js','app.js','admin.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
vm.runInContext('window.App=HotelPremierApp;window.Admin=HotelPremierAdmin;',c);
const app=Object.create(c.window.App.prototype);app.menuData=JSON.parse(JSON.stringify(c.window.HOTEL_PREMIER_INITIAL_MENU));app.categories=JSON.parse(JSON.stringify(c.window.HOTEL_PREMIER_CATEGORIES));
app.renderMenu=()=>{};app.renderMenuSectionDrawer=()=>{};app.notifyMenuUpdate=()=>{};app.showToast=()=>{};
c.window.app=app;
const manager=c.window.HotelMenuStructure;
const next={version:1,categories:JSON.parse(JSON.stringify(app.categories)),subcategories:JSON.parse(JSON.stringify(c.window.HOTEL_PREMIER_SUB_CATEGORIES)),items:{},order:app.menuData.map(d=>d.id)};
assert.throws(()=>manager.saveDraft(next,app),/Sign in/);
c.window.admin={isAuthenticated:true};
next.categories.push({id:'new-section',name:'Owner section'});next.subcategories['new-section']=[{id:'all',name:'All items'},{id:'new-sub',name:'Owner sub-section',dishIds:['new-item']}];
next.items['new-item']={name:'Owner dish',categoryId:'new-section',price:null,image:'',description:'Freshly prepared'};next.order.unshift('new-item');
manager.saveDraft(next,app);assert.equal(app.menuData[0].name,'Owner dish');assert.equal(app.categories.at(-1).id,'new-section');
next.items['new-item'].name='Renamed owner dish';next.categories.reverse();next.subcategories['new-section'].reverse();manager.saveDraft(next,app);assert.equal(app.menuData[0].name,'Renamed owner dish');assert.equal(app.categories[0].id,'new-section');
const base=app.menuData.find(d=>d.id!=='new-item');next.items[base.id]={categoryId:'new-section'};manager.saveDraft(next,app);assert.equal(app.menuData.find(d=>d.id===base.id).categoryId,'new-section');
next.items['new-item']={_deleted:true};manager.saveDraft(next,app);assert.ok(!app.menuData.some(d=>d.id==='new-item'));
const reloaded={menuData:JSON.parse(JSON.stringify(c.window.HOTEL_PREMIER_INITIAL_MENU)),categories:[]};manager.apply(reloaded);assert.ok(!reloaded.menuData.some(d=>d.id==='new-item'));assert.equal(reloaded.categories[0].id,'new-section');
const before=JSON.stringify(app.menuData);fail=true;assert.throws(()=>manager.saveDraft(next,app),/Storage full/);assert.equal(JSON.stringify(app.menuData),before);fail=false;
assert.throws(()=>manager.validate({...next,items:{bad:{name:'<img src=x>',categoryId:'new-section'}}}),/plain text/);
app.favorites=[];
const group={id:'group',name:'Options',categoryId:'new-section',variants:[{name:'Option A',price:80,image:'a.jpg'},{name:'Option B',price:90,image:'b.jpg'}]};app.menuData=[group];app.favorites=[app.favoriteKey(group,group.variants[1])];
assert.equal(app.getFavoriteItems().length,1);assert.equal(app.getFavoriteItems()[0].name,'Option B');assert.equal(app.getFavoriteItems()[0]._sourceVariantIndex,1);
group.variants.reverse();assert.equal(app.getFavoriteItems()[0].name,'Option B');assert.equal(app.getFavoriteItems()[0]._sourceVariantIndex,0);
const qrFields={'qr-table-select':{value:'restaurant'},'qr-standee-label':{},'qr-canvas-holder':{replaceChildren(){},querySelector(){return {}; }},'qr-target-url':{value:'https://avi22sh.github.io/Hotel-Premier/?section=stay#stay'}};
c.document.getElementById=id=>qrFields[id];c.window.location={href:'https://avi22sh.github.io/Hotel-Premier/#admin'};
let qrUrl;c.window.QRCode=class{constructor(host,options){qrUrl=options.text;}};c.window.QRCode.CorrectLevel={H:1};c.QRCode=c.window.QRCode;
c.window.addEventListener=()=>{};vm.runInContext(fs.readFileSync('guest-network.js','utf8'),c);
const originalRenderQR=c.window.HotelGuestNetwork.renderQR;c.window.HotelGuestNetwork={...c.window.HotelGuestNetwork,renderQR(host,url){qrUrl=url;}};
const admin=Object.create(c.window.Admin.prototype);admin.generateTableQR();const url=new URL(qrUrl);assert.equal(url.hash,'#dine');assert.equal(url.searchParams.get('entry'),'restaurant');assert.equal(url.searchParams.get('section'),null);assert.equal(url.searchParams.get('src'),null);
const html=fs.readFileSync('index.html','utf8');assert.match(html,/Birthday Parties/);assert.match(html,/Other Special Events/);assert.match(html,/Restaurant space only/);assert.doesNotMatch(html,/Smart LED TV|Pets and unmarried couples are not allowed/);assert.equal(html,fs.readFileSync('404.html','utf8'));
// Exercise the actual editor controls against an isolated test DOM, never production guest data.
class Element {
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.events={};this.textContent='';this._value='';this.dataset={};this.open=false;}
  append(...children){this.children.push(...children);} replaceChildren(...children){this.children=children;}
  addEventListener(type,fn){this.events[type]=fn;}setAttribute(name,value){this[name]=value;}
  querySelectorAll(){return walk(this).filter(n=>n!==this&&n.tagName==='DETAILS'&&n.open&&n.dataset.menuKey);}
  closest(){return this.scrollParent || null;}
  set value(value){this._value=String(value);}get value(){return this.tagName==='SELECT'&&!this.children.some(n=>n.value===this._value)?'':this._value;}
}
c.document.createElement=tag=>new Element(tag);c.crypto=require('node:crypto').webcrypto;let answer='';c.prompt=()=>answer;c.confirm=()=>true;
const walk=n=>[n,...n.children.flatMap(walk)];
const host=new Element('div');host.scrollParent={scrollTop:410};app.menuData=[];app.categories=[];
manager.saveDraft({version:1,categories:[{id:'a',name:'Alpha'},{id:'b',name:'Beta'}],subcategories:{a:[{id:'all',name:'All items'}],b:[{id:'all',name:'All items'}]},items:{},order:[]},app);
const click=label=>{const b=walk(host).find(n=>n.tagName==='BUTTON'&&n.textContent===label);assert.ok(b,label);b.events.click();};
const openSection=name=>{const section=walk(host).find(n=>n.tagName==='DETAILS'&&n.children[0]?.textContent===name);assert.ok(section,name);section.open=true;section.events.toggle?.();};
manager.render(host);host.children[0].open=true;answer='Gamma';click('Add section');assert.equal(app.categories.at(-1).name,'Gamma');
openSection('Gamma');answer='New sub-section';click('Add sub-section');
assert.equal(c.window.HOTEL_PREMIER_SUB_CATEGORIES[app.categories.at(-1).id][1].name,'New sub-section');
openSection('Gamma');answer='New item';click('Add item');assert.equal(app.menuData.at(-1).name,'New item');
openSection('Gamma');const itemEditor=walk(host).find(n=>n.tagName==='DETAILS'&&n.children[0]?.textContent==='New item');itemEditor.open=true;const nameField=walk(host).find(n=>n.tagName==='LABEL'&&n.children[0]?.textContent==='Item name');nameField.children[1].value='Edited item';click('Save item & options');assert.equal(app.menuData.at(-1).name,'Edited item');
assert.equal(walk(host).find(n=>n.tagName==='DETAILS'&&n.children[0]?.textContent==='Edited item').open,true,'Saving must retain the open item even after renaming');
assert.equal(walk(host).find(n=>n.tagName==='DETAILS'&&n.children[0]?.textContent==='Gamma').open,true);
assert.equal(host.children[0].open,true);assert.equal(host.scrollParent.scrollTop,410);
openSection('Gamma');answer='Extra option';click('Add option');assert.equal(app.menuData.at(-1).variants[0].name,'Extra option');
openSection('Gamma');click('Delete option');assert.equal(app.menuData.at(-1).variants.length,0);
openSection('Gamma');click('Delete item');assert.equal(app.menuData.length,0);
openSection('Gamma');click('Delete sub-section');assert.equal(c.window.HOTEL_PREMIER_SUB_CATEGORIES[app.categories.at(-1).id].length,1);
openSection('Gamma');click('Delete section');assert.equal(app.categories.length,2);
console.log('PASS: authenticated menu CRUD, sequencing, reload, storage failure, individual favourites, QR routing and restaurant-only events');
