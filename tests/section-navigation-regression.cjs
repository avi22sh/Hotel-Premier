const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const order=['section-home','section-stay','section-tariffs','section-dine','section-celebrate','section-explore','guest-feedback-section','section-contact'];
const names=['Hotel','Stay','Tariff','Menu','Group & Events','Explore','Review','Contact'];
let time=1000,blocked=false,focused=false,lang='en',calls=[];const listeners={},elements={},windowListeners={};
class Element{
 constructor(id='',token=''){this.id=id;this.token=token;this.nodeType=1;this.isConnected=true;this.attrs={};this.events={};this.textContent='';this.scrollWidth=100;this.clientWidth=100;}
 addEventListener(type,fn){this.events[type]=fn;}
 setAttribute(key,value){this.attrs[key]=value;}
 closest(selector){if(selector==='.section-wrapper,#guest-feedback-section')return this.root;return this.token&&selector.split(',').includes(this.token)?this:null;}
 contains(target){return target===this;}
 scrollIntoView(options){this.scrolled=options;}
}
const track=new Element();track.clientWidth=600;
for(const id of ['section-previous','section-next','section-navigation-status'])elements[id]=new Element(id);
for(let i=0;i<order.length;i++){const tab=new Element();tab.textContent='🏨 '+names[i];elements['tab-nav-'+['home','stay','tariffs','dine','celebrate','explore','reviews','contact'][i]]=tab;}
const window={innerWidth:390,scrollY:0,location:{hash:'#home'},addEventListener(type,fn){windowListeners[type]=fn;},HotelGuestLanguage:{text:s=>lang==='mr'?({'Previous section':'मागील विभाग','Next section':'पुढील विभाग'}[s]||s):s},app:{activeSection:order[0],switchSection(id){calls.push(id);this.activeSection=id;}}};
const document={readyState:'complete',getElementById:id=>elements[id],querySelector:selector=>selector==='.hotel-nav-inner'?track:blocked?{}:null,activeElement:{matches:()=>focused},addEventListener(type,fn){(listeners[type]||=[]).push(fn);}};
const context={window,document,Date:{now:()=>time},requestAnimationFrame:fn=>fn(),getComputedStyle:e=>({overflowX:e.overflow||'visible'})};vm.createContext(context);vm.runInContext(fs.readFileSync('section-navigation.js','utf8'),context);
const nav=window.HotelSectionNavigation;
function at(index){window.app.activeSection=order[index];nav.sync(order[index]);calls=[];blocked=false;focused=false;window.location.hash='#home';window.scrollY=0;}
function target(token=''){const e=new Element('',token);e.root=new Element(window.app.activeSection);e.parentElement=e.root;return e;}
function fire(type,event){for(const fn of listeners[type]||[])fn(event);}
function begin(e,x=220,y=200){fire('touchstart',{target:e,touches:[{clientX:x,clientY:y}]});}
function end(e,x=100,y=205,elapsed=150){time+=elapsed;const event={target:e,touches:[],changedTouches:[{clientX:x,clientY:y}],cancelable:true,preventDefault(){this.prevented=true;}};fire('touchend',event);return event;}
assert.equal(elements['section-previous'].disabled,true);assert.equal(elements['section-next'].disabled,false);
elements['section-next'].events.click();assert.deepEqual(calls,['section-stay']);assert.equal(elements['section-navigation-status'].textContent,'Stay');assert.equal(elements['section-previous'].attrs['aria-label'],'Previous section: Hotel');
at(7);assert.equal(elements['section-next'].disabled,true);assert.equal(nav.move(1),false);assert.equal(nav.move(-1),true);assert.equal(window.app.activeSection,'guest-feedback-section');
at(0);let e=target();begin(e);assert.equal(end(e).prevented,true);assert.equal(window.app.activeSection,'section-stay');
const click={target:e,detail:1,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};fire('click',click);assert.equal(click.prevented,true);assert.equal(click.stopped,true);
e=target();begin(e,120);end(e,250);assert.equal(window.app.activeSection,'section-home');
at(0);e=target();begin(e,120);assert.equal(end(e,250).prevented,undefined);assert.equal(calls.length,0,'No wrapping past Home');
for(const token of ['button','a','input','select','textarea','summary','label','form','.dish-card-variant-chips','.room-carousel-container','#restaurant-hero-carousel','#section-slideshow-container','.atmosphere-card','img']){at(0);e=target(token);begin(e);end(e);assert.equal(calls.length,0,'Protected gesture: '+token);}
for(const mode of ['overlay','admin','focus']){at(0);blocked=mode==='overlay';focused=mode==='focus';window.location.hash=mode==='admin'?'#admin':'#home';e=target();begin(e);end(e);assert.equal(calls.length,0,mode);}
at(0);e=target();e.parentElement=new Element();e.parentElement.overflow='auto';e.parentElement.scrollWidth=400;e.parentElement.clientWidth=200;e.parentElement.parentElement=e.root;begin(e);end(e);assert.equal(calls.length,0,'Horizontal scrollers own their gesture');
for(const [x,y,elapsed] of [[190,205,100],[100,350,100],[100,275,100],[100,205,900]]){at(0);e=target();begin(e);assert.equal(end(e,x,y,elapsed).prevented,undefined);assert.equal(calls.length,0,'Small, vertical, diagonal or slow movement');}
at(0);e=target();begin(e);window.scrollY=40;end(e);assert.equal(calls.length,0,'Vertical page movement cancels section navigation');
at(0);e=target();begin(e,10);end(e,200);assert.equal(calls.length,0,'Browser edge gestures remain available');
for(const mode of ['multitouch','cancel','removed','changedSection']){at(0);e=target();begin(e);if(mode==='multitouch')fire('touchmove',{touches:[{},{}]});if(mode==='cancel')fire('touchcancel',{});if(mode==='removed')e.isConnected=false;if(mode==='changedSection')window.app.activeSection='section-dine';end(e);assert.equal(calls.length,0,mode);}
at(1);lang='mr';nav.sync();assert.equal(elements['section-next'].attrs['aria-label'],'पुढील विभाग: Tariff');
track.clientWidth=287;windowListeners.resize();assert.equal(elements['tab-nav-stay'].scrolled.inline,'center');assert.equal(window.app.activeSection,'section-stay','Resizing must keep the selected section');
const app=fs.readFileSync('app.js','utf8');assert.match(app,/HotelSectionNavigation\?\.sync\(sectionId\)/);assert.match(app,/HotelSectionNavigation\?\.sync\(this.activeSection\)/);
console.log('PASS: section button order/boundaries, guarded swipes, ghost-click suppression, protected galleries/forms/Admin, cancellation, native edge gestures and localized labels');
