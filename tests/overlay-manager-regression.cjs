const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const handlers={},scroll=[];let active=[];
const doc={readyState:'complete',activeElement:null,documentElement:{style:{setProperty(){}}},body:{style:{position:'',top:'',left:'',width:'',overflow:'auto'}},querySelectorAll:()=>active,addEventListener:(name,fn)=>handlers[name]=fn};
doc.documentElement.style.scrollBehavior='smooth';
function element(id){const attrs=new Set();const e={id,tagName:'DIV',isConnected:true,inert:false,tabIndex:0,setAttribute:name=>attrs.add(name),removeAttribute:name=>attrs.delete(name),toggleAttribute:(name,on)=>on?attrs.add(name):attrs.delete(name),contains:target=>target===e||e.fields.includes(target),querySelector:()=>e.fields[0],querySelectorAll:()=>e.fields,focus(){doc.activeElement=e;},fields:[],attrs};e.fields=[1,2].map(()=>({getClientRects:()=>[{}],closest:()=>null,focus(){doc.activeElement=this;},scrollIntoView(){}}));return e;}
const c={window:{scrollY:380,scrollX:0,innerHeight:800,scrollTo:(x,y)=>{assert.equal(doc.documentElement.style.scrollBehavior,'auto','Closing must bypass global smooth scrolling');scroll.push([x,y]);},addEventListener(){},app:{dismissGuestOverlay:el=>{active=active.filter(x=>x!==el);}}},document:doc,MutationObserver:class{observe(){}},console};
vm.runInNewContext(fs.readFileSync('overlay-manager.js','utf8'),c);
const api=c.window.HotelOverlays,first=element('first'),child=element('child'),opener={isConnected:true,focus(){doc.activeElement=this;}};
doc.activeElement=opener;active=[first];api.sync();assert.equal(api.count,1);assert.equal(doc.body.style.position,'fixed');assert.equal(doc.body.style.top,'-380px');
active.push(child);api.sync();assert.equal(api.count,2);assert.ok(first.attrs.has('data-overlay-suspended'));assert.equal(first.inert,true);assert.equal(doc.activeElement,child.fields[0]);
doc.activeElement=child.fields[1];let prevented=false;handlers.keydown({key:'Tab',preventDefault(){prevented=true;}});assert.ok(prevented);assert.equal(doc.activeElement,child.fields[0]);
handlers.keydown({key:'Escape',preventDefault(){},stopImmediatePropagation(){}});api.sync();assert.equal(api.count,1);assert.equal(first.inert,false);assert.equal(doc.body.style.position,'fixed');
active=[];api.sync();assert.equal(api.count,0);assert.equal(doc.body.style.position,'');assert.equal(doc.body.style.overflow,'auto');assert.deepEqual(scroll,[[0,380]]);assert.equal(doc.activeElement,opener);
api.release(first);assert.equal(scroll.length,1,'Repeated releases must not jump the page');
assert.equal(doc.documentElement.style.scrollBehavior,'smooth','Normal navigation motion is restored after closing');
console.log('PASS: counted fixed-body lock, suspended parent, focus trap, Escape, nested close and exact scroll restoration');
