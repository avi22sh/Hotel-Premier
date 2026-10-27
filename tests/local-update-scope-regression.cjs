const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const calls=[];const c={console,BroadcastChannel:class{postMessage(value){calls.push(value.scope);}},window:{},document:{readyState:'loading',addEventListener(){},getElementById(){return null;}}};
vm.runInNewContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;',c);
const app=Object.create(c.window.App.prototype);Object.assign(app,{currentCategory:'morning-delights',loadMenuData:async()=>calls.push('read-menu'),renderRoomCarousels:async()=>calls.push('rooms'),initHeroCarousel:async()=>calls.push('hero'),renderSectionSlideshow:async()=>calls.push('collection'),renderCategoryCards:()=>calls.push('cards'),renderMenu:()=>calls.push('menu')});app.setupBroadcastChannel();
(async()=>{
 await app.broadcast.onmessage({data:{type:'MENU_UPDATED',scope:'rooms'}});assert.deepEqual(calls.splice(0),['rooms']);
 await app.broadcast.onmessage({data:{type:'MENU_UPDATED',scope:'slides'}});assert.deepEqual(calls.splice(0),['hero','collection']);
 await app.broadcast.onmessage({data:{type:'MENU_UPDATED',scope:'menu'}});assert.deepEqual(calls.splice(0),['read-menu','cards','menu','collection']);
 app.notifyMenuUpdate('rooms');assert.deepEqual(calls,['rooms']);
 console.log('PASS: room, banner and menu updates refresh their matching local-tab views without rebroadcasting reads');
})().catch(error=>{console.error(error);process.exitCode=1;});
