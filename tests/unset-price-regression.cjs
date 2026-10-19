const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {}, console, document: { readyState: 'loading', addEventListener() {} } };
vm.createContext(context);
for (const file of ['data/menu-data.js', 'app.js', 'admin.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context);
}
vm.runInContext('window.App = HotelPremierApp; window.Admin = HotelPremierAdmin;', context);
(async () => {
  const app = Object.create(context.window.App.prototype);
  app.menuData = context.window.HOTEL_PREMIER_INITIAL_MENU;
  app.currentLang = 'en'; app.t = (key, fallback) => fallback || key;
  app.saveMenuData = () => {}; app.renderMenu = () => {}; app.showToast = () => {};
  context.window.app = app;
  const saved = [];
  context.window.HOTEL_STORAGE = { async saveDishOverride(id, value) { saved.push({ id, ...value }); } };
  const admin = Object.create(context.window.Admin.prototype);
  const item = app.menuData.find(d => d.id === 'fa-curd');
  await admin.updatePrice(item.id, '80');
  assert.equal(item.price, 80);
  assert.match(app.renderDishCard(item), /₹80/);
  await admin.updatePrice(item.id, '');
  assert.equal(item.price, null);
  assert.match(app.renderDishCard(item), /Price on request/);
  const count = saved.length;
  for (const value of ['-1', 'invalid', 'Infinity']) await admin.updatePrice(item.id, value);
  assert.equal(saved.length, count);
  assert.equal(item.price, null);
  await admin.updatePrice(item.id, '0');
  assert.equal(item.price, 0);
  assert.match(app.renderDishCard(item), /₹0/);
  console.log('PASS: CRM price entry, clearing, persistence payload and invalid-price rejection');
})().catch(error => { console.error(error); process.exitCode = 1; });
