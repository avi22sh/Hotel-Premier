const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};vm.runInNewContext(fs.readFileSync('data/hotel-data.js','utf8'),c);
const info=c.window.HOTEL_PREMIER_HOTEL_DATA.hotelInfo;
assert.equal(info.petsPolicy,'Pets are not allowed.');assert.equal(info.primaryGuestMinimumAge,18);assert.equal(info.acceptedGuestIDs.length,4);
assert.equal(info.checkoutPolicy,'24 Hours Check-Out');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('royal.css','utf8');
assert.match(html,/guest-policy-panel/);assert.match(html,/booking-policy-note/);
assert.match(html,/8559568898096275433/);assert.doesNotMatch(html,/7988359765272654316/);
assert.doesNotMatch(css,/rgba\(139, 21, 56, 0\.22\)/);
function luminance(hex){const v=hex.match(/\w\w/g).map(s=>parseInt(s,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
for(const text of ['eee8de','bac3c5','dfc69a','aab6bb']) assert.ok((luminance(text)+.05)/(luminance('19232a')+.05)>=4.5);
assert.ok((luminance('dfc69a')+.05)/(luminance('18231f')+.05)>=4.5);
console.log('PASS: sourced guest policies, verified partner links and night palette text contrast');
