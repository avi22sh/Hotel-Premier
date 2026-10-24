const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const elements={}, timers=[];
let focused='', locked=false;
const opener={isConnected:true,focus(){focused='opener';}};
function modal(id){
  const classes=new Set();
  return elements[id]={id,style:{},classList:{contains:k=>classes.has(k),add:k=>classes.add(k),remove:(...keys)=>keys.forEach(k=>classes.delete(k))},querySelector:()=>({focus(){focused='close';}})};
}
const drawer=modal('menu-sections-drawer-modal');
const profile=modal('guest-profile-modal');
const route=modal('route-options-modal');
elements['drawer-sections-search']={value:'old',focus(){focused='search';}};
const doc={readyState:'loading',addEventListener(){},activeElement:opener,
  body:{style:{overflow:'auto'},classList:{add(){locked=true;},remove(){locked=false;}}},
  getElementById:id=>elements[id],querySelectorAll:()=>[],querySelector:()=>Object.values(elements).find(e=>e.classList?.contains('active'))};
const c={window:{},document:doc,console,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){}};
vm.createContext(c);vm.runInContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;',c);
const app=Object.create(c.window.App.prototype); app.renderMenuSectionDrawer=()=>{};app.applyGuestProfileToAllForms=()=>{};
let resetCount=0;
const filterGroup=app.filterDrawerByGroup;
app.filterDrawerByGroup=function(group){assert.equal(group,'all');resetCount++;return filterGroup.call(this,group);};
app.openMenuSectionDrawer();assert.equal(doc.body.style.overflow,'hidden');
assert.equal(resetCount,1,'Opening must reset the previous group filter');
app.dismissGuestOverlay(drawer); // The Escape/backdrop path must use drawer-specific cleanup.
assert.equal(doc.body.style.overflow,'auto');assert.equal(focused,'opener');
timers[0]();assert.equal(focused,'opener','A closed drawer must not steal focus after its timer fires');
app.openGuestProfileModal();assert.equal(locked,true);assert.equal(focused,'close');
app.dismissGuestOverlay(profile);assert.equal(locked,false);assert.equal(focused,'opener');
app.openGuestDialog(route);assert.equal(locked,true);
app.dismissGuestOverlay(route);assert.equal(locked,false);assert.equal(route.style.display,'none');
const html=fs.readFileSync('index.html','utf8');
assert.match(html,/aria-labelledby="guest-profile-title"/);assert.match(html,/aria-labelledby="route-options-modal-title"/);
assert.equal(html,fs.readFileSync('404.html','utf8'));
console.log('PASS: drawer Escape scroll restoration, stale focus guard, profile and route dialog lifecycle');
