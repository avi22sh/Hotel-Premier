const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{},document:{getElementById:()=>null}};vm.runInNewContext(fs.readFileSync('menu-tools.js','utf8'),c);
const app={currentLang:'en',categories:[{id:'breakfast',name:'Breakfast'}],getVisibleMenuItems:()=>[{id:'parathas',categoryId:'breakfast',name:'Stuffed Parathas',variants:[{name:'Hidden',hidden:true},{name:'Mix Veg Paratha with Curd',hindiName:'मिक्स वेज पराठा',price:140,description:'Vegetables and curd'},{name:'Paneer Paratha',price:null}]}]};
const api=c.window.HotelMenuTools;const matches=api.findMatches(app,'mix veg paratha');assert.equal(matches.length,1);assert.equal(matches[0].dishId,'parathas');assert.equal(matches[0].variantIndex,1);assert.equal(matches[0].price,140);
assert.equal(api.findMatches(app,'hidden').length,0);assert.equal(api.findMatches(app,'paneer')[0].price,null);assert.equal(api.findMatches(app,'').length,0);
app.currentLang='hi';assert.equal(api.findMatches(app,'मिक्स')[0].name,'मिक्स वेज पराठा');assert.equal(api.findMatches(app,'<script>').length,0);
console.log('PASS: quick search opens exact variant identities, excludes hidden options, preserves prices and searches Hindi safely');
