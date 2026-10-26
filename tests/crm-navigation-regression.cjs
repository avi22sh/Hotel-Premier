const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const source = fs.readFileSync('admin.js', 'utf8');
const button = html.match(/<button[^>]*class="admin-back-btn"[^>]*>/)?.[0];
assert.ok(button);
assert.match(button, /aria-label="Back to app"/);
assert.match(button, /window.admin.closeAdminModal\(\)/);
assert.match(css, /#admin-dashboard-view\s*\{[^}]*flex-direction:\s*column/);
assert.match(css, /#admin-tab-content\s*\{[^}]*overflow-x:\s*auto/);
const method = source.match(/closeAdminModal\(\)\s*\{([\s\S]*?)\n  \}/)[1];
let closed = false;
const context={
  window: {},
  document: { readyState:'loading',addEventListener(){},getElementById(id) {
    assert.equal(id, 'admin-modal-backdrop');
    return {classList:{remove(value){assert.equal(value,'active'); closed=true;}}};
  }}
};
vm.runInNewContext(source+';window.Admin=HotelPremierAdmin;',context);
const admin=Object.create(context.window.Admin.prototype);
admin.closeAdminModal();
assert.equal(closed, true);
assert.equal(admin.adminSessionGeneration,1,'Closing must invalidate pending renders');
assert.doesNotMatch(method, /localStorage|indexedDB|reload|location/);
console.log('PASS: accessible Back button closes CRM without reloading or clearing saved photos; stacked navigation and contained table overflow');
