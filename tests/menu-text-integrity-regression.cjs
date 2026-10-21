const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync('data/menu-data.js','utf8'), context);
const menu = context.window.HOTEL_PREMIER_INITIAL_MENU;
for (const dish of menu) {
  for (const field of ['name','hindiName','marathiName','description','descriptionHi','descriptionMr','displayPriceRange']) {
    assert.ok(!/[àâ][¤¥‚€]/.test(dish[field] || ''), `${dish.id}: garbled ${field}`);
  }
}
for (const [category, sections] of Object.entries(context.window.HOTEL_PREMIER_SUB_CATEGORIES)) {
  for (const section of sections) for (const id of section.dishIds || []) {
    assert.equal(menu.find(dish => dish.id === id)?.categoryId, category, `${category}/${id}`);
  }
}
console.log('PASS: readable multilingual group labels and category-consistent filters');
