const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),vm=require('node:vm');
const {audit}=require('../tools/verify-image-assets.cjs');
assert.equal(audit().failures.length,0);
const root=fs.mkdtempSync(path.join(os.tmpdir(),'premier-asset-test-'));
fs.mkdirSync(path.join(root,'assets'));fs.mkdirSync(path.join(root,'data'));
fs.writeFileSync(path.join(root,'assets','actual.jpg'),'fixture');
fs.writeFileSync(path.join(root,'data','fixture.js'),`const items=['assets/ACTUAL.jpg','assets/missing.jpg'];`);
assert.deepEqual(audit(root).failures.map(item=>item.cause),['case-mismatch','missing']);
// Only this known test-created temporary directory is removed.
fs.rmSync(root,{recursive:true});
const csv=fs.readFileSync('reports/menu-image-renames.csv','utf8').trim().split(/\r?\n/).slice(1);
for(const row of csv){const values=[...row.matchAll(/"((?:[^"]|"")*)"/g)].map(m=>m[1].replaceAll('""','"'));assert.equal(values.length,3,row);assert.ok(fs.existsSync(values[1]),values[1]);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(values[1])).digest('hex'),values[2]);}
const c={window:{}};vm.runInNewContext(fs.readFileSync('data/menu-data.js','utf8'),c);
const fudge=c.window.HOTEL_PREMIER_INITIAL_MENU.find(d=>d.id==='mm-2');
assert.equal(fudge.image,'assets/brand-placeholder.svg','Fudge must never use a soup photo');
const shake=c.window.HOTEL_PREMIER_INITIAL_MENU.find(d=>d.id==='ms-4');
assert.equal(shake.image,'assets/brand-placeholder.svg');assert.ok(shake.variants.every(v=>v.image==='assets/brand-placeholder.svg'));
assert.doesNotMatch(fs.readFileSync('data/menu-data.js','utf8'),/images\.unsplash\.com/);
for(const file of ['index.html','app.js','admin.js','asset-pipeline.js'])for(const [tag]of fs.readFileSync(file,'utf8').matchAll(/<img\b(?:\s+(?:"[^"]*"|'[^']*'|[^'">])*)?>/g)) {
 assert.match(tag,/\swidth="[\d]+"/,file);assert.match(tag,/\sheight="[\d]+"/,file);
}
const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
assert.ok(manifest.icons.find(i=>i.purpose==='maskable').src!==manifest.icons.find(i=>i.purpose==='any').src);
console.log('PASS: exact-case failures detected; every old/new photo mapping preserves bytes; real placeholder and separate maskable icon');
