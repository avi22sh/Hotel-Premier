const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const saved=new Map();let overrides={dish:{name:'Edited name',description:'Edited description',image:'',price:95}};
const c={console,window:{HOTEL_PREMIER_INITIAL_MENU:[{id:'dish',name:'Old name',description:'Old description',image:'assets/old.jpg',price:80}],HOTEL_PREMIER_PHOTOS:{dish:'assets/old.jpg'},HOTEL_PREMIER_CATEGORIES:[],HOTEL_STORAGE:{getAllDishOverrides:async()=>overrides}},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)}};
vm.runInNewContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;',c);
(async()=>{
 const app=Object.create(c.window.App.prototype);await app.loadMenuData();assert.equal(app.menuData[0].name,'Edited name');assert.equal(app.menuData[0].description,'Edited description');assert.equal(app.menuData[0].image,'','Explicit removal must beat the published baseline');
 app.storageKeyOverrides='overrides';app.notifyMenuUpdate=()=>{};app.saveMenuData();const cache=JSON.parse(saved.get('overrides'));assert.equal(cache.dish.description,'Edited description');assert.equal(cache.dish.name,'Edited name');assert.equal(cache.dish.image,'');
 const reload=Object.create(c.window.App.prototype);overrides=cache;await reload.loadMenuData();assert.equal(reload.menuData[0].image,'');assert.equal(reload.menuData[0].description,'Edited description');
 console.log('PASS: item name, description, price and intentional image removal survive save/reload without old-photo fallback');
})().catch(error=>{console.error(error);process.exitCode=1;});
