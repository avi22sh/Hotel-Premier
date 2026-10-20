const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('royal.css','utf8');
assert.match(html, /name="viewport"[^>]*width=device-width, initial-scale=1\.0, minimum-scale=1\.0, viewport-fit=cover/);
assert.match(css, /#section-dine #menu-search-input \{ font-size:16px !important;/);
assert.match(css, /touch-action:manipulation/);
assert.match(html, /Toggle larger text/);
console.log('PASS: fixed viewport scale, mobile form zoom prevention, text-size setting retained');
