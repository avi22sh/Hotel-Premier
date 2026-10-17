const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const c = {window:{}};
vm.runInNewContext(fs.readFileSync('data/hotel-data.js','utf8'),c);
const rooms = c.window.HOTEL_PREMIER_HOTEL_DATA.roomCategories;
assert.deepEqual(Array.from(rooms,r=>r.id),['ac-super-deluxe','ac-deluxe-queen','ac-deluxe-twin']);
assert.deepEqual(Array.from(rooms,r=>r.areaSqFt),[172,144,144]);
assert.deepEqual(Array.from(rooms,r=>r.name),['Premier Royale King','Premier Signature Queen','Premier Companion Twin']);
assert.equal(rooms[0].balconyViews.length,2);
assert.deepEqual(Array.from(rooms,r=>r.maxExtraBeds),[3,1,2]);
for (const room of rooms) {
  assert.match(room.description,/2 premix teas/);
  assert.match(room.description,/2 packaged mineral water bottles/);
  assert.match(room.description,/complimentary welcome snacks basket/);
  assert.match(room.description,/toiletries/);
  if(room.id!=='ac-super-deluxe')assert.ok(!room.images.some(p=>p.includes('balcony')));
}
assert.deepEqual(Array.from(rooms,r=>r.tariff.single.roomOnly),[2400,2100,2100]);
assert.deepEqual(Array.from(rooms,r=>r.tariff.double.withBreakfast),[3000,2700,2700]);
const html = fs.readFileSync('index.html','utf8');
assert.match(html,/The Premier Way to Stay/);
assert.doesNotMatch(html,/Call Room Service \/ Front Desk/);
assert.doesNotMatch(html,/240 sq\.ft|280 sq\.ft|King Size Luxury Bed • Front Facing/);
assert.match(html,/CP includes breakfast from a fixed menu; conditions apply/);
assert.match(fs.readFileSync('app.js','utf8'),/CP — Breakfast from a fixed menu; conditions apply/);
console.log('PASS: branded room names, corrected areas, two distinct balcony outlooks, welcome amenities, CP terms, stable IDs and tariffs');
