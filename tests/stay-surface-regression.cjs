const fs=require('node:fs'),assert=require('node:assert/strict');
const base=fs.readFileSync('styles.css','utf8'),theme=fs.readFileSync('theme-tokens.css','utf8'),html=fs.readFileSync('index.html','utf8');
function block(selector){const start=base.indexOf(selector+' {');assert.ok(start>=0,selector);return base.slice(start,base.indexOf('}',start));}
assert.match(block('.room-editorial-desc'),/color: var\(--muted/);
assert.match(block('.room-rate-breakdown'),/background: var\(--surface-secondary/);
assert.match(block('.hotel-atmosphere-gallery'),/background: var\(--surface/);
assert.match(block('.rate-occ'),/color: var\(--text/);
assert.match(theme,/-webkit-appearance:none; appearance:none/);
assert.match(theme,/input::-webkit-datetime-edit\s*\{[^}]*min-width:0/);
const fields=['restaurant-event-date','restaurant-event-time','calc-arrival-date','calc-arrival-time','booking-checkin-date','booking-checkin-time'];
for(const id of fields){const input=html.match(new RegExp('<input[^>]*id="'+id+'"[^>]*>'))?.[0];assert.ok(input,id);assert.match(input,/type="(?:date|time)"/,'Native picker and validation must remain available');}
assert.doesNotMatch(html.match(/<meta name="viewport"[^>]*>/)[0],/user-scalable=no|maximum-scale/);
console.log('PASS: Stay nested panels inherit theme tokens; native date/time controls reset intrinsic sizing while keeping pickers, validation and accessible zoom');
