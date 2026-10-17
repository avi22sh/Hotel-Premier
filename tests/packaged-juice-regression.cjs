const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={window:{},console,document:{readyState:'loading',addEventListener(){}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('data/menu-data.js','utf8'),context);
vm.runInContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;',context);
const app=Object.create(context.window.App.prototype);
app.currentLang='en';app.t=(key,fallback)=>fallback||key;
const juices=context.window.HOTEL_PREMIER_INITIAL_MENU.filter(item=>item.id.startsWith('cb-juice-'));
assert.equal(juices.length,4);
assert.equal(new Set(juices.map(item=>item.id)).size,4);
for(const juice of juices) {
  assert.equal(juice.price,80);
  assert.equal(juice.categoryId,'chilled-beverages');
  assert.equal(juice.image,'');
  assert.equal(juice.rating,undefined);
  assert.ok(juice.descriptionHi && juice.descriptionMr);
  assert.match(app.renderDishCard(juice),/₹80/);
}
const group=context.window.HOTEL_PREMIER_SUB_CATEGORIES['chilled-beverages'].find(item=>item.id==='packaged-fruit-juices');
assert.deepEqual(Array.from(group.dishIds).sort(),Array.from(juices,item=>item.id).sort());
const html=fs.readFileSync('index.html','utf8');
assert.doesNotMatch(html,/class="premier-menu-index"/);
assert.match(html,/Indo-Chinese and Pastas—served with refreshing beverages/);
console.log('PASS: four packaged juices at ₹80, accurate grouping, no invented images/ratings and cuisines in subtitle only');
