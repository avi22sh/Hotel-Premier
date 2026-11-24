const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {loadMenu}=require('../tools/menu-runtime.cjs');
(async()=>{
 const {app}=await loadMenu(),get=id=>app.menuData.find(d=>d.id===id),visible=app.getVisibleMenuItems();
 // Compare against the original authoritative base, not generated implementation values.
 const base={window:{}};vm.runInNewContext(fs.readFileSync('data/menu-data.js','utf8'),base);
 const initial=id=>base.window.HOTEL_PREMIER_INITIAL_MENU.find(d=>d.id===id);
 const shakes=get('cb-milkshakes-group');
 const water=get('cb-5');assert.deepEqual(Array.from(water.variants,v=>v.price),[10,20]);
 assert.match(water.variants[0].name,/500 ml/);assert.match(water.variants[1].name,/1 Ltr/);
 assert.equal(visible.filter(d=>d.id==='cb-5').length,1,'Water sizes share one compact card');
 assert.deepEqual(Array.from(shakes.variants,v=>v.price),[150,160,160,170]);assert.equal(shakes.variants.length,4);
 for(const v of shakes.variants){const old=initial(v.id);assert.equal(v.price,old.price);assert.equal(v.description,old.description);assert.equal(v.descriptionHi,old.descriptionHi);assert.equal(v.descriptionMr,old.descriptionMr);assert.doesNotMatch(v.name,/with ice cream/i);assert.match(v.description,/ice cream/i);}
 for(const id of ['ms-vanilla','ms-chocolate','ms-mango','ms-dryfruit','ms-cold-coffee'])assert.ok(get(id).notAvailable);
 assert.equal(get('ms-7').name,'Cold Coffee');assert.equal(get('ms-7').price,130);assert.equal(get('ms-7').description,initial('ms-7').description);
 const lassi=initial('cb-1').variants.find(v=>/ice cream/i.test(v.name));
 for(const field of ['price','description'])assert.equal(get('cb-1')[field],lassi[field]);
 assert.match(get('cb-1').descriptionHi,/आइसक्रीम/);assert.match(get('cb-1').descriptionMr,/आईस्क्रीम/);
 assert.doesNotMatch(get('cb-1').descriptionHi,/सादा/);assert.doesNotMatch(get('cb-1').descriptionMr,/साधी/);
 assert.equal(get('cb-1').variants.length,0);
 assert.deepEqual(Array.from(get('cb-mastani-group').variants,v=>v.price),[180,180]);
 for(const v of get('cb-mastani-group').variants)assert.match(v.description,/ice cream/i);
 assert.equal(get('cb-mocktails-group').variants.length,4);assert.ok(get('mc-5').notAvailable);assert.ok(get('mm-2').notAvailable);
 assert.equal(visible.filter(d=>d.categoryId==='chilled-beverages').length,11);
 assert.deepEqual(Array.from(visible.filter(d=>d.categoryId==='chilled-beverages').slice(0,4),d=>d.id),['cb-milkshakes-group','cb-mastani-group','ms-7','cb-mocktails-group']);
 for(const id of ['mocktails','mastani','milkshakes','cold-coffee']){assert.ok(!app.categories.some(c=>c.id===id));assert.ok(!app.menuData.some(d=>d.categoryId===id));}
 assert.ok(app.getMenuCollections().some(c=>c.id==='chilled-beverages'));
 const servings=visible.flatMap(d=>d.variants?.length?d.variants.filter(v=>!v.hidden):[d]);
 for(const name of ['Vanilla Milkshake','Chocolate Milkshake','Mango Milkshake','Dryfruit Milkshake','Cold Coffee','Special Punjabi Lassi'])assert.equal(servings.filter(v=>v.name===name).length,1,name+' has one preparation');
 console.log('PASS: single ice-cream beverage preparations, exact premium prices/descriptions in three languages, compact beverage section, menu order and removed items');
})().catch(e=>{console.error(e);process.exitCode=1});
