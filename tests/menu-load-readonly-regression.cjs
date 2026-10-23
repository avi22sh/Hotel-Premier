const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let writes=0,notifications=0;
const c={window:{HOTEL_PREMIER_INITIAL_MENU:[{id:'fixture',name:'Fixture dish',price:80,image:''}],HOTEL_PREMIER_CATEGORIES:[{id:'test',name:'Test'}],HOTEL_STORAGE:{async getAllDishOverrides(){return {fixture:{price:95,image:'data:image/png;base64,fixture'}};}}},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null;},setItem(){writes++;throw Error('Quota');}},console};
vm.createContext(c);vm.runInContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;',c);
(async()=>{const app=Object.create(c.window.App.prototype);app.notifyMenuUpdate=()=>notifications++;app.saveMenuData=()=>{writes++;notifications++;};
await app.loadMenuData();assert.equal(app.menuData[0].price,95);assert.equal(app.menuData[0].image,'data:image/png;base64,fixture');
await app.loadMenuData();assert.equal(writes,0);assert.equal(notifications,0,'Loading or receiving an update must never rebroadcast another update');
console.log('PASS: menu load preserves existing edits without cache writes, quota errors or update rebroadcast loops');
})().catch(error=>{console.error(error);process.exitCode=1;});
