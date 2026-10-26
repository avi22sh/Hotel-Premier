const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const fields = {};
let locked = true;
const context = { window:{}, console, document:{
  readyState:'loading', addEventListener(){}, getElementById:id=>fields[id] || null,
  querySelector:()=>null,
  body:{classList:{remove(name){if(name==='modal-open') locked=false;}}}
}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;', context);
const app = Object.create(context.window.App.prototype);
assert.equal(app.hotelToday(new Date('2026-10-22T19:00:00Z')), '2026-10-23');
assert.equal(app.hotelToday(new Date('2026-10-22T18:29:00Z')), '2026-10-22');
assert.equal(app.formatArrivalTime('00:15'), '12:15 AM IST');
assert.equal(app.formatArrivalTime('12:00'), '12:00 PM IST');
assert.equal(app.formatArrivalTime('19:45'), '7:45 PM IST');
for (const invalid of ['', '24:00', '12:60', 'Morning Arrival']) assert.equal(app.formatArrivalTime(invalid), '');
let active = true;
const modal = { id:'test-modal', style:{display:'flex'}, classList:{remove(){active=false;}} };
app.dismissGuestOverlay(modal);
assert.equal(active, false); assert.equal(modal.style.display,'none'); assert.equal(locked,false);
for(const [id,value] of Object.entries({'booking-room-type':'ac-deluxe-queen','booking-nights':'2','booking-rooms-count':'1','booking-guests-count':'2','booking-meal-plan':'CP'})) fields[id]={value};
assert.equal(app.updateBookingEstimate().grossEstimate, 5400, 'Two guests must use double occupancy, not the single CP rate');
fields['booking-guests-count'].value='1';
assert.equal(app.updateBookingEstimate().grossEstimate, 4600);
fields['booking-guests-count'].value='3'; fields['booking-rooms-count'].value='2';
assert.equal(app.updateBookingEstimate().grossEstimate, 10000, 'Three guests in two rooms: one single and one double');
const html=fs.readFileSync('index.html','utf8');
assert.match(html, /type="time" id="booking-checkin-time"/);
assert.doesNotMatch(html, /4\+ Nights<\/option>|12:00 PM \(Standard\)/);
assert.match(html, /footer-brand-m">M<span class="footer-brand-birds"/);
assert.equal(html,require('./public-build-helper.cjs').fallbackHTML(), 'Fallback document must match published entry');
console.log('PASS: IST midnight, exact arrival times, overlay dismissal, occupancy-aware estimates and matching fallback');
