// Owner-editable live data: validate safety and reachability, not historical order/counts.
const assert=require('node:assert/strict');
const {loadMenu}=require('../tools/menu-runtime.cjs');
const {validate}=require('../data-validation.js');
(async()=>{
 const {app,window:w}=await loadMenu();validate(w.HOTEL_PREMIER_PUBLISHED_OVERRIDES);
 const ids=new Set(app.menuData.map(d=>d.id)),categories=new Set(app.categories.map(c=>c.id));assert.equal(ids.size,app.menuData.length);
 for(const dish of app.menuData){
  assert.ok(categories.has(dish.categoryId),'Reachable category for '+dish.id);
  if(dish.groupedUnder)assert.ok(ids.has(dish.groupedUnder),'Existing parent for '+dish.id);
  if(dish.price!==undefined&&dish.price!==null)assert.ok(Number.isFinite(dish.price)&&dish.price>=0,'Valid price '+dish.id);
  for(const v of dish.variants||[]){assert.ok(v.name?.trim());if(v.price!==null&&v.price!==undefined)assert.ok(Number.isFinite(v.price)&&v.price>=0,'Valid option price '+dish.id);}
 }
 assert.ok(app.getVisibleMenuItems().length>0,'Guest menu is not empty');
 assert.doesNotMatch(JSON.stringify(w.HOTEL_PREMIER_PUBLISHED_OVERRIDES),/blob:|data:image|pinHash|guestRecords|hotel_premier_gh_token/);
 console.log('PASS: current owner publication has safe public data, valid prices, unique IDs and reachable categories/parents; editable ordering is allowed');
})().catch(e=>{console.error(e);process.exitCode=1});
