const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict');
function plain(value){if(typeof value==='string'&&/^(assets\/|https:\/\/images\.unsplash\.com\/)/.test(value))return '[photo-asset]';if(Array.isArray(value))return value.map(plain);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,plain(item)]));return value;}
for(const file of ['data/menu-data.js','data/hotel-data.js']){
 const before={window:{}},after={window:{}};
 vm.runInNewContext(cp.execFileSync('git',['show',(process.env.PREMIER_BUSINESS_BASE_REF||'b154ef4')+':'+file],{encoding:'utf8'}),before);
 vm.runInNewContext(fs.readFileSync(file,'utf8'),after);
 assert.deepEqual(JSON.parse(JSON.stringify(plain(after.window))),JSON.parse(JSON.stringify(plain(before.window))),file+' must preserve all non-photo business content');
}
console.log('PASS: menu and hotel prices, descriptions, policies, contacts, GSTIN, inventory and other non-photo data match the original commit');
