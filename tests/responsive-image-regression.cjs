const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window:{},console};
for (const file of ['data/menu-image-sizes.js','asset-pipeline.js']) vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
const manifest = context.window.HOTEL_PREMIER_IMAGE_SIZES;
assert.ok(Object.keys(manifest).length > 0);
for (const [source, sizes] of Object.entries(manifest)) {
  assert.ok(fs.existsSync(source),source);
  assert.equal(sizes.length,2);
  for (const entry of sizes) {
    assert.ok(entry.width > 0 && entry.height > 0);
    assert.ok(fs.existsSync(entry.src),entry.src);
  }
}
const pipeline = context.window.AssetPipeline;
const source = Object.keys(manifest)[0];
assert.match(pipeline.responsivePhotoAttributes(source,false,true),/72px, 80px/);
assert.match(pipeline.responsivePhotoAttributes(source,true),/92vw, 640px/);
assert.equal(pipeline.responsivePhotoAttributes('data:image/png;base64,new-owner-photo'), '');
assert.equal(pipeline.responsivePhotoAttributes(''), '');
console.log(`PASS: ${Object.keys(manifest).length} originals and responsive pairs exist; compact/detail sizing and new-upload fallback preserved`);
