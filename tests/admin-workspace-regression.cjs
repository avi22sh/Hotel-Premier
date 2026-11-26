const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let unlocked=true,failing=false,writes=[],roomDraft={r:{name:'Local room',updatedAt:30}};
const app={categories:[{id:'cat',name:'Category'}],menuData:[{id:'p',categoryId:'cat',name:'Parent',variants:[{id:'a',name:'Previous name',price:10,image:'old.jpg'}]},{id:'a',groupedUnder:'p',categoryId:'cat',name:'Previous name',price:10,image:'old.jpg'},{id:'hidden',groupedUnder:'p',categoryId:'cat',name:'Hidden special',notAvailable:true,description:'Searchable secret recipe',price:20}],saveMenuData(){},renderMenu(){},renderCategoryCards(){}};
const c={console,localStorage:{getItem:()=>JSON.stringify(roomDraft)},window:{admin:{isAuthenticated:true},HotelLocalLock:{isUnlocked:()=>unlocked},app,HotelDataValidation:require('../data-validation.js'),HOTEL_STORAGE:{async saveDishEdits(changes){if(failing)throw Error('Disk full');writes.push(changes);}},HOTEL_PREMIER_HOTEL_DATA:{roomCategories:[{id:'r',name:'Base room'}]},HOTEL_PREMIER_PUBLISHED_OVERRIDES:{publishedAt:20,roomDetails:{r:{name:'Published room',tariff:{single:{roomOnly:100}}}}},addEventListener(){},dispatchEvent(){}},CustomEvent:class{}};
vm.runInNewContext(fs.readFileSync('admin-workspace.js','utf8'),c);const api=c.window.HotelAdminWorkspace;
(async()=>{
 assert.equal(c.window.HOTEL_PREMIER_HOTEL_DATA.roomCategories[0].name,'Local room');
 roomDraft={r:{name:'Stale room',updatedAt:10}};api.applyRooms();assert.equal(c.window.HOTEL_PREMIER_HOTEL_DATA.roomCategories[0].name,'Published room');
 const title={},price={};c.document={getElementById:()=>({querySelector:selector=>selector==='.room-suite-title'?title:selector==='.tariff-val'?price:null,querySelectorAll:()=>[]}),querySelector:()=>null,querySelectorAll:()=>[]};api.syncRoomViews();assert.equal(title.textContent,'Published room');assert.equal(price.textContent,'₹100','Published room price reaches guest card');
 const all=api.entries(app),option=all.find(e=>e.index===0);assert.equal(all.filter(e=>e.value.name==='Previous name').length,1,'No duplicate source record beside its option');
 assert.ok(all.some(e=>api.matches(e,'secret recipe','all','all')),'Hidden source descriptions are searchable');assert.ok(all.some(e=>api.matches(e,'Previous','all','all')),'Options are searchable');
 await api.saveEntry(option,{name:'Renamed option',price:25,description:'Updated',image:''});
 assert.equal(writes.length,1);assert.equal(app.menuData[0].variants[0].name,'Renamed option');assert.equal(app.menuData[1].name,'Renamed option');assert.equal(app.menuData[1].image,'');
 failing=true;await assert.rejects(api.saveEntry(api.entries(app).find(e=>e.index===0),{name:'Failed',price:99}),/Disk full/);assert.equal(app.menuData[1].name,'Renamed option');failing=false;
 const hidden=api.entries(app).find(e=>e.value.id==='hidden');assert.ok(hidden.unlisted);await api.saveEntry(hidden,{name:'Restored',price:20,notAvailable:false});assert.ok(app.menuData[0].variants.some(v=>v.id==='hidden'&&v.hidden===false));
 unlocked=false;await assert.rejects(api.saveEntry(option,{name:'Locked',price:1}),/Unlock/);
 const room=api.roomPatch({id:'r',name:'Room',tariff:{single:{roomOnly:123}},guestRecords:['private'],token:'private'});assert.ok(!('guestRecords'in room));assert.ok(!('token'in room));assert.equal(room.tariff.single.roomOnly,123);
 const html=fs.readFileSync('index.html','utf8');assert.match(html,/id="menu-tools-dialog"/);assert.match(html,/class="menu-tools-dock"/);assert.ok(html.indexOf('id="menu-search-input"')>html.indexOf('id="menu-tools-dialog"'));
 console.log('PASS: grouped/hidden item search, stable-ID editing, atomic linked saves, failed-save preservation, hidden-option restoration, local lock checks and room-publication whitelist');
})().catch(e=>{console.error(e);process.exitCode=1});

