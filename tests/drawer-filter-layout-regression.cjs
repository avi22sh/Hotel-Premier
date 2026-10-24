const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function chip(group){const active=new Set();return {pressed:'',classList:{remove:k=>active.delete(k),add:k=>active.add(k),toggle(k,on){if(on)active.add(k);else active.delete(k);},contains:k=>active.has(k)},getAttribute:()=>`filterDrawerByGroup('${group}')`,setAttribute(k,v){this.pressed=v;}};}
function row(id,title){return {style:{display:'flex'},getAttribute:()=>id,querySelector:s=>({innerText:s.includes('title')?title:''})};}
const chips=['all','breakfast','beverages'].map(chip),rows=[row('morning-delights','Morning Delights'),row('chilled-beverages','Chilled Drinks')];
const search={value:'old'},clear={style:{display:'block'}};
const document={readyState:'loading',addEventListener(){},getElementById:id=>id==='drawer-sections-search'?search:id==='drawer-clear-search-btn'?clear:null,querySelectorAll:s=>s.includes('quick-filter')?chips:rows};
const c={window:{},document,console};vm.createContext(c);vm.runInContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;',c);
const app=Object.create(c.window.App.prototype);
app.filterDrawerByGroup('beverages');assert.equal(search.value,'');assert.equal(clear.style.display,'none');assert.equal(rows[0].style.display,'none');assert.equal(rows[1].style.display,'','CSS grid must remain in control');assert.equal(chips[2].pressed,'true');
app.filterDrawerSections('morning');assert.equal(chips[0].pressed,'true');assert.equal(chips[2].pressed,'false');assert.equal(rows[0].style.display,'');assert.equal(rows[1].style.display,'none');
app.filterDrawerSections('');assert.ok(rows.every(r=>r.style.display===''));
app.filterDrawerByGroup('all');assert.ok(rows.every(r=>r.style.display===''));
assert.match(fs.readFileSync('app.js','utf8'),/sectionId !== 'section-dine'\) this\.closeMenuSectionDrawer\(\{ restoreFocus:false \}\)/);
console.log('PASS: drawer filtering retains grid layout, clears stale state and closes on non-dining routes');
