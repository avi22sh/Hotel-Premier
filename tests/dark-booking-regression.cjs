const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'royal.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
assert.equal((html.match(/class="guest-details-panel"/g) || []).length, 2);
for (const name of ['booking-original-price', 'booking-final-price', 'booking-savings-note']) {
  assert.ok(app.includes(`class="${name}"`));
  assert.ok(css.includes(`.${name} {`));
}
assert.ok(css.includes('body.theme-dark #concierge-booking-modal .direct-booking-privilege-card'));
assert.ok(css.includes('body.theme-dark .modal-header { background:rgba(22, 32, 46, 0.90); }'));
assert.ok(css.includes('body.theme-dark .wizard-summary-card { background:rgba(20, 29, 42, 0.76);'));
assert.ok(css.includes('.wizard-summary-card .btn-tariff-book-wa { background:linear-gradient(135deg, #1E8449 0%, #166534 100%); color:#fff;'));
function luminance(hex) {
  const rgb = hex.match(/\w\w/g).map(x => parseInt(x, 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
for (const [fg, bg] of [['dfc69a', '1c2b31'], ['bac3c5', '1c2b31'], ['c0e5cf', '233c34'], ['23573e', 'e9f3ec']]) {
  assert.ok((luminance(fg) + .05) / (luminance(bg) + .05) >= 4.5 ||
    (luminance(bg) + .05) / (luminance(fg) + .05) >= 4.5, `${fg}/${bg} contrast`);
}
console.log('PASS: theme-aware guest panels, booking prices, promotion and savings contrast');
