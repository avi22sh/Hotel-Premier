const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.open=false;this.textContent='';}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
 setAttribute(){}
 addEventListener(type,fn){this.events[type]=fn;}
 showModal(){this.open=true;}
 close(){this.open=false;this.events.close?.();}
}
const requests=[],body=new Element('body');
const context={URL,URLSearchParams,TextEncoder,AbortSignal,window:{addEventListener(){}},document:{body,addEventListener(){},createElement:tag=>new Element(tag),getElementById:id=>body.children.find(e=>e.id===id)},fetch:(url,options)=>new Promise(resolve=>requests.push({url:String(url),options,resolve}))};
vm.createContext(context);
const source=fs.readFileSync('guest-network.js','utf8').replace("apiBase: ''","apiBase: 'https://fixture.invalid/access/'");
vm.runInContext(source,context);const api=context.window.HotelGuestNetwork;
const flatten=node=>[node.textContent,...node.children.map(flatten)].join(' ');
function answer(index,ssid,noStore=true){requests[index].resolve({ok:true,headers:{get:key=>key==='content-type'?'application/json':noStore?'no-store':''},json:async()=>({status:'active',verifiedAt:'2026-10-28T00:00:00Z',networks:[{ssid,security:'WPA',password:'fixture-only',hidden:false,allowCopy:true}]})});}
(async()=>{
 const opening=api.showWifi('lobby');const dialog=body.children[0],select=dialog.children[3].children[0];
 assert.match(requests[0].url,/location=lobby$/);assert.equal(requests[0].options.cache,'no-store');
 select.value='floor-3';const changing=select.events.change();assert.match(requests[1].url,/location=floor-3$/);
 answer(1,'Fixture third floor');await changing;assert.match(flatten(dialog),/Fixture third floor/);
 answer(0,'Outdated lobby fixture');await opening;assert.doesNotMatch(flatten(dialog),/Outdated lobby fixture/);
 select.value='accounts';await select.events.change();assert.equal(requests.length,2);assert.doesNotMatch(flatten(dialog),/Fixture third floor/);
 select.value='floor-1';const pending=select.events.change();api.closeWifi();answer(2,'Closed dialog fixture');await pending;assert.equal(dialog.children.length,0);
 const badCache=api.showWifi('restaurant');answer(3,'Uncached-policy failure fixture',false);await badCache;assert.doesNotMatch(flatten(dialog),/Uncached-policy failure fixture/);assert.match(flatten(dialog),/not available here yet/);
 console.log('PASS: area-specific requests, invalid-area rejection, stale-response/close protection and no-store enforcement');
})().catch(error=>{console.error(error);process.exitCode=1;});
