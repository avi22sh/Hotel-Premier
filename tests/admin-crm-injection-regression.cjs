const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function element(tag){return {tag,children:[],textContent:'',attrs:{},append(...items){this.children.push(...items);},replaceChildren(){this.children=[];},setAttribute(k,v){this.attrs[k]=v;},addEventListener(){},set innerHTML(value){throw Error('CRM must use literal DOM rendering');}};}
const hostile='<img src=x onerror=alert(1)>',container=element('div');
const c={window:{HOTEL_VAULT:{getCRMStats:()=>({totalGuests:1,totalBookings:1,totalReviews:1,totalEnquiries:0}),getBookings:()=>[{guestName:hostile,guestPhone:hostile,roomType:hostile,estimatedTotal:{valueOf:'bad'}}],getReviews:()=>[{name:hostile,comment:hostile,tags:[hostile],rating:-100}]}},console,document:{readyState:'loading',addEventListener(){},createElement:element}};
vm.createContext(c);vm.runInContext(fs.readFileSync('admin.js','utf8')+';window.Admin=HotelPremierAdmin;',c);
const admin=Object.create(c.window.Admin.prototype);admin.renderCRMManager(container);
const nodes=[];function walk(e){nodes.push(e);e.children.forEach(walk);}walk(container);
assert.equal(nodes.filter(e=>e.tag==='img').length,0);assert.ok(nodes.some(e=>e.textContent===hostile));assert.ok(nodes.some(e=>e.textContent==='Not rated'));assert.ok(nodes.some(e=>e.textContent==='—'));
console.log('PASS: imported CRM fields stay literal, malformed totals/ratings are bounded and mobile-card labels are generated safely');
