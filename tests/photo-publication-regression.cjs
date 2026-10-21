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
  assert.ok(Object.keys(photos).length >= 218, 'Published photo coverage must not shrink');
  // Eleven previously empty dishes now have approved, published photos.
  assert.equal(photos['cb-packaged-fruit-juice-group'], '');
  assert.equal(Object.entries(photos).filter(([id,v])=>v==='' && id!=='cb-packaged-fruit-juice-group').length,19);
  assert.ok(Object.values(photos).filter(v=>v.startsWith('assets/menu-uploads/')).length >= 16);
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
  assert.equal(app.menuData[1].image,photos['hh-1']);
  context.window.HOTEL_STORAGE.getAllDishOverrides=async()=>({'md-7':{image:'new-owner-upload.jpg'}});
  await app.loadMenuData();
  assert.equal(app.menuData[0].image,'new-owner-upload.jpg');
  console.log('PASS: published photo integrity, empty slots, missing-image safety and local upload precedence');
})().catch(error=>{console.error(error);process.exitCode=1;});
