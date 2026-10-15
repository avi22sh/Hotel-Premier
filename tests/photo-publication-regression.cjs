const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window:{}, console, document:{readyState:'loading',addEventListener(){},createElement(){return {setAttribute(){}};}}};
vm.createContext(context);
for (const file of ['data/menu-photos.js','asset-pipeline.js','app.js']) {
  vm.runInContext(fs.readFileSync(file,'utf8') + (file === 'app.js' ? ';window.App = HotelPremierApp;' : ''),context);
}
(async()=>{
  const photos = context.window.HOTEL_PREMIER_PHOTOS;
  assert.equal(Object.keys(photos).length,218);
  assert.equal(Object.values(photos).filter(v=>v==='').length,30);
  assert.equal(Object.values(photos).filter(v=>v.startsWith('assets/menu-uploads/')).length,16);
  for (const src of Object.values(photos)) {
    if (src) { assert.ok(src.startsWith('assets/')); assert.ok(fs.existsSync(src),src); }
  }
  const pipeline=context.window.AssetPipeline;
  let placeholder;
  const wrapper={classList:{add(c){assert.equal(c,'no-photo');}},querySelector(){return placeholder;},appendChild(node){placeholder=node;}};
  const image={src:'missing.jpg',onerror:()=>{},parentElement:wrapper};
  pipeline.handleImageError(image);
  assert.equal(image.src,'missing.jpg');
  assert.equal(image.hidden,true);
  assert.equal(image.onerror,null);
  assert.equal(placeholder.textContent,'Photo coming soon');
  pipeline.handleImageError(image);
  const dish={id:'test',name:'Test dish',image:'missing.jpg'};
  for (const html of [pipeline.renderDishMedia(dish),pipeline.renderDetailMedia(dish)]) {
    assert.doesNotMatch(html,/unsplash|parentElement.innerHTML/);
    assert.match(html,/handleImageError/);
  }
  context.window.HOTEL_PREMIER_INITIAL_MENU=[{id:'md-7',image:'old.jpg'},{id:'hh-1',image:'old.jpg'}];
  context.window.HOTEL_STORAGE={getAllDishOverrides:async()=>({})};
  const app=Object.create(context.window.App.prototype);
  app.saveMenuData=()=>{};
  await app.loadMenuData();
  assert.equal(app.menuData[0].image,photos['md-7']);
  assert.equal(app.menuData[1].image,'');
  context.window.HOTEL_STORAGE.getAllDishOverrides=async()=>({'md-7':{image:'new-owner-upload.jpg'}});
  await app.loadMenuData();
  assert.equal(app.menuData[0].image,'new-owner-upload.jpg');
  console.log('PASS: 218 photo mappings, 16 original uploads, 30 empty slots, missing-image safety and local edit precedence');
})().catch(error=>{console.error(error);process.exitCode=1;});
