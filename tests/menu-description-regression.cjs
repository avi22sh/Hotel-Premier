const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {}, document: { readyState: 'loading', addEventListener() {} }, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync('data/menu-data.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('app.js', 'utf8') + ';window.App=HotelPremierApp;', context);
const menu = context.window.HOTEL_PREMIER_INITIAL_MENU;
const dish = id => menu.find(item => item.id === id);
for (const [id, expected] of [
  ['md-1', /Four/], ['ic-21', /vegetable dumplings/], ['ic-24', /corn/],
  ['ic-25', /potato/], ['ic-26', /soyabean/], ['tc-9', /wrapped/],
  ['tc-10', /4 pieces of each/], ['fd-3', /spinach/],
  ['ps-11', /urad papad/], ['vs-1', /Three contrasting gravies/],
  ['sb-16', /Nine breads/], ['rn-9', /cashews/], ['rn-6', /noodles/]
]) assert.match(dish(id).description, expected, id);
assert.equal(dish('ic-11').description, dish('ic-27').description);
const app = Object.create(context.window.App.prototype);
app.currentLang = 'en';
app.t = (key, fallback) => fallback || key;
for (const [id, category] of [['md-mix-veg-paratha', 'morning-delights'], ['tc-paneer-achari-tikka', 'tandoor-classics'], ['fa-curd', 'fresh-addons']]) {
  const item = dish(id);
  assert.equal(item.categoryId, category);
  assert.ok(item.price === null || (Number.isFinite(item.price) && item.price >= 0));
  assert.match(app.renderDishCard({...item, price:null}), /Price on request/);
  assert.doesNotMatch(app.renderDishCard(item), /₹null|₹0/);
  assert.ok(context.window.HOTEL_PREMIER_SUB_CATEGORIES[category].some(section => section.dishIds?.includes(id)));
}
assert.match(dish('vs-11').description, /Fenugreek leaves.*crisp fried garlic/);
for (const lang of ['en', 'hi', 'mr']) {
  app.currentLang = lang;
  assert.equal(app.getDishDescription(dish('ic-21')), dish('ic-21').description);
}
for (const item of menu) assert.ok(item.description && !/<\/?\w/.test(item.description));
console.log('PASS: source-matched dish descriptions, platter quantities and safe language fallback');
