const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const listeners = {};
const c = { URL, URLSearchParams, TextEncoder, Date, console, window: { addEventListener: (name, fn) => { listeners[name] = fn; } }, document: { addEventListener() {} } };
vm.createContext(c); vm.runInContext(fs.readFileSync('guest-network.js', 'utf8'), c);
const api = c.window.HotelGuestNetwork, base = 'https://avi22sh.github.io/Hotel-Premier/';
assert.equal(api.resolve({href:base+'?dish=fixture-only'}),'section-dine');
assert.equal(api.configured(), false); assert.equal(api.getRooms().length, 0);
for (const [suffix, section] of [['', 'home'], ['?entry=reception#home', 'home'], ['?entry=restaurant#dine', 'dine'], ['?entry=room&room=fixture#concierge', 'concierge'], ['?src=Room%20fixture', 'concierge'], ['?table=fixture', 'dine'], ['?entry=restaurant#stay', 'stay'], ['#menu', 'dine'], ['?room=fixture#contact', 'contact'], ['?src=arbitrary', 'home']]) {
  assert.equal(api.resolve({ href: base + suffix }), 'section-' + section, suffix);
}
const rooms = api.validateRooms({ rooms: [{ id: 'test-only', label: 'Fixture room', category: 'Fixture category', verified: true }] });
assert.throws(() => api.validateRooms({ rooms: [{ id: 'test', label: '<script>', category: 'A', verified: true }] }));
assert.throws(() => api.validateRooms({ rooms: [{ id: 'test', label: 'A', category: 'A', verified: false }] }));
assert.throws(() => api.validateRooms({ rooms: [...rooms, ...rooms] }));
const url = new URL(api.destination(base + '?phone=secret&name=private&room=old#stay', 'room', 'test-only', rooms));
assert.equal(url.hash, '#concierge'); assert.equal(url.search, '?entry=room&room=test-only');
assert.equal(new URL(api.destination(base, 'restaurant')).hash, '#menu');
assert.equal(new URL(api.destination(base, 'reception')).hash, '#home');
assert.throws(() => api.destination(base, 'room', 'not-verified'));
assert.throws(() => api.destination('http://example.com', 'reception'));
assert.throws(() => api.destination('https://user:secret@example.com', 'restaurant'));
const network = { ssid: 'Fixture;Guest\\A', security: 'WPA', password: 'fixture:password;', hidden: false, allowCopy: true };
assert.equal(api.wifiPayload(network), 'WIFI:T:WPA;S:Fixture\\;Guest\\\\A;P:fixture\\:password\\;;H:false;;');
assert.throws(() => api.wifiPayload({ ...network, security: 'WPA3' }));
assert.throws(() => api.wifiPayload({ ...network, password: 'short' }));
assert.throws(() => api.wifiPayload({ ...network, ssid: '界'.repeat(12) }));
assert.equal(api.wifiPayload({ ...network, security: 'nopass', password: '' }), 'WIFI:T:nopass;S:Fixture\\;Guest\\\\A;P:;H:false;;');
assert.throws(() => api.validateAccess({ status: 'draft', networks: [network] }));
assert.throws(() => api.validateAccess({ status: 'active', verifiedAt: 'invalid', networks: [network] }));
const source = fs.readFileSync('guest-network.js', 'utf8');
assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|qrserver|api\.qr/);
assert.match(source, /cache: 'no-store'/); assert.match(source, /credentials: 'omit'/); assert.match(source, /referrerPolicy: 'no-referrer'/);
assert.match(source, /dialog\.replaceChildren\(\)/); assert.match(source, /document\.hidden\) closeWifi/);
assert.match(fs.readFileSync('sw.js', 'utf8'), /req\.cache === 'no-store'/);
const admin = fs.readFileSync('admin.js', 'utf8');
const studio = admin.slice(admin.indexOf('  renderQRStudio('), admin.indexOf('  downloadQRImage()'));
assert.doesNotMatch(studio, /Room 101|Room 201|Room 301|api\.qrserver/);
assert.match(studio, /getRooms/); assert.match(studio, /destination\(/);
console.log('PASS: three QR destinations, verified-only room mappings, disabled Wi-Fi, payload escaping, no-store policy and private data stripping');
// Exercise inactive UI behaviour without production guest records or fabricated mappings.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.events = {}; this.open = false; this.textContent = ''; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute() {}
  addEventListener(name, listener) { this.events[name] = listener; }
  showModal() { this.open = true; }
  close() { this.open = false; this.events.close?.(); }
}
c.document.body = new Element('body');
c.document.createElement = tag => new Element(tag);
c.document.getElementById = id => c.document.body.children.find(el => el.id === id);
let networkCalls = 0; c.fetch = () => { networkCalls++; throw Error('Unexpected network access'); };
(async () => {
  await api.showWifi('restaurant');
  const dialog = c.document.getElementById('guest-wifi-dialog');
  assert.equal(dialog.open, true);
  assert.match(dialog.children.at(-1).children[0].textContent, /not available here yet/);
  assert.equal(networkCalls, 0, 'Unconfigured UI must never make a request');
  api.closeWifi(); assert.equal(dialog.open, false); assert.equal(dialog.children.length, 0);
  await api.showWifi('room', 'unknown'); assert.equal(dialog.open, true);
  assert.match(dialog.children.at(-1).children[0].textContent, /not available here yet/);
  c.document.hidden = true; listeners.pagehide(); assert.equal(dialog.open, false); assert.equal(dialog.children.length, 0);
  console.log('PASS: inactive restaurant/unknown-room dialog, safe close/reopen, cleared contents and zero credential requests');
})().catch(error => { console.error(error); process.exitCode = 1; });
