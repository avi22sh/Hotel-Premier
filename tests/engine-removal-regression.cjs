const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{},console};vm.runInNewContext(fs.readFileSync('asset-pipeline.js','utf8'),c);
for(const name of ['processAutomaticStudioEnhancement','processAdaptiveDishImage','processIsolatedAsset','callCloudAIEnhancer','enhanceFoodTo4K'])assert.equal(c.window.AssetPipeline[name],undefined,name);
assert.equal(fs.existsSync('photo-enhance-worker.js'),false);
for(const file of ['photo-workflow.js','admin.js','sw.js','tools/build-public-dist.cjs'])assert.doesNotMatch(fs.readFileSync(file,'utf8'),/processAutomaticStudioEnhancement|batchCalibrateAllDishes|photo-enhance-worker\.js/);
const photo=c.window.AssetPipeline.renderDetailMedia({id:'a',name:'Real dish',image:'assets/real.webp'});
assert.match(photo,/assets\/real.webp/);assert.doesNotMatch(photo,/unsplash|pollinations|replicate|openai/i);
console.log('PASS: generation, enhancement, batch processing and cloud adapters removed; real-photo rendering retained');
