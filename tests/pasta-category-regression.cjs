const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const c={window:{}};
vm.runInNewContext(fs.readFileSync('data/menu-data.js','utf8'),c);
const categories=c.window.HOTEL_PREMIER_CATEGORIES;
const menu=c.window.HOTEL_PREMIER_INITIAL_MENU;
assert.equal(categories.filter(x=>x.id==='indo-chinese').length,1);
assert.equal(categories.filter(x=>x.id==='pasta-section').length,1);
assert.deepEqual(Array.from(menu.filter(x=>x.categoryId==='pasta-section'),x=>[x.id,x.price]),[['ic-30',200],['tt-11',190]]);
for(const id of ['ic-30','tt-11']) assert.equal(menu.filter(x=>x.id===id).length,1);
for(const category of ['tasty-tidbits','indo-chinese','pasta-section']) {
  for(const sub of c.window.HOTEL_PREMIER_SUB_CATEGORIES[category]) {
    for(const id of sub.dishIds||[]) assert.equal(menu.find(dish=>dish.id===id)?.categoryId,category);
  }
}
assert.doesNotMatch(fs.readFileSync('app.js','utf8'),/'italian-pasta'/);
console.log('PASS: Indo-Chinese retained, pasta category unique, prices preserved and subcategory membership consistent');
