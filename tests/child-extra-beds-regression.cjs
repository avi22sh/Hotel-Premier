const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const fields = {
  'booking-room-type': {value:'ac-super-deluxe'},
  'booking-nights': {value:'1'},
  'booking-rooms-count': {value:'1'},
  'booking-meal-plan': {value:'RO'},
  'booking-extra-beds': {value:'0'},
  'booking-child-extra-beds': {value:'2'}
};
const context = {window:{}, console, document:{readyState:'loading',addEventListener(){},getElementById(id){return fields[id] || null;}}};
vm.createContext(context);
for (const file of ['data/hotel-data.js','app.js']) {
  vm.runInContext(fs.readFileSync(file,'utf8') + (file==='app.js' ? ';window.App=HotelPremierApp;' : ''),context);
}
const app = Object.create(context.window.App.prototype);
let result = app.updateBookingEstimate();
assert.equal(result.childExtraBeds,2);
assert.equal(result.grossEstimate,2400,'Complimentary child beds must add no charge');
fields['booking-extra-beds'].value='3';
result=app.updateBookingEstimate();
assert.equal(result.extraBeds,1,'Paid and free beds share capacity');
assert.equal(result.grossEstimate,2700);
fields['booking-room-type'].value='ac-deluxe-queen';
result=app.updateBookingEstimate();
assert.equal(result.childExtraBeds,1);
assert.equal(result.extraBeds,0);
fields['booking-room-type'].value='ac-deluxe-twin';
fields['booking-child-extra-beds'].value='2';
fields['booking-meal-plan'].value='CP';
result=app.updateBookingEstimate();
assert.equal(result.childExtraBeds,2);
assert.equal(result.grossEstimate,2300,'CP must not charge for complimentary child beds');
assert.match(fs.readFileSync('index.html','utf8'),/Children Aged 5–10 Inclusive/);
console.log('PASS: complimentary child beds, paid/free shared limits and Royale/Queen/Twin capacity');
