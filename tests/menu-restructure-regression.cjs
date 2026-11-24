const assert=require('node:assert/strict'),fs=require('node:fs');
const {loadMenu}=require('../tools/menu-runtime.cjs');
(async()=>{
 const {app,window:w}=await loadMenu(),items=app.menuData,get=id=>items.find(d=>d.id===id);
 const before=JSON.parse(fs.readFileSync('tests/fixtures/menu-business-before-22-98.json','utf8'));
 // Owner requested the ice-cream Lassi preparation and price on 2026-11-25.
 for(const old of before){const now=get(old.id);assert.ok(now,'Preserved ID '+old.id);for(const key of ['price','description','descriptionHi','descriptionMr'])if(old.id!=='cb-1')assert.equal(now[key],old[key],old.id+' preserves '+key);}
 assert.equal(new Set(items.map(d=>d.id)).size,items.length);
 const visible=items.filter(d=>!d.notAvailable&&!d.groupedUnder),names=visible.map(d=>d.name.toLowerCase().replace(/[^a-z0-9]/g,''));
 assert.equal(new Set(names).size,names.length,'No duplicate visible item names');
 assert.equal(get('tt-chana-koliwada').price,null);assert.ok(get('tt-chana-roast-group').variants.some(v=>v.id==='tt-chana-koliwada'));
 assert.equal(get('ic-27').notAvailable,true);assert.equal(get('ic-27').groupedUnder,'ic-11');
 for(const id of ['ic-12','ic-28'])assert.equal(get(id).groupedUnder,'ic-paneer-starters-group');
 assert.equal(get('ic-29').groupedUnder,'ic-veg-starters-group');
 for(const [id,count]of [['vs-2',3],['fa-7',4],['fa-8',4],['rb-8',4]])assert.equal(get(id).variants.length,count);
 assert.deepEqual(Array.from(get('vs-2').variants,v=>v.name),['Shev Bhaji','Shev Latpat','Doodh Shev Bhaji']);
 assert.deepEqual(Array.from(get('rb-8').variants,v=>v.price),[240,null,245,null]);
 assert.ok(!get('fa-6').groupedUnder);assert.ok(!get('fa-7').groupedUnder);assert.ok(!get('fa-8').groupedUnder);assert.ok(get('fa-papad-group').notAvailable);
 for(const id of ['vs-shev-latpat','vs-doodh-shev','rb-9','rb-7'])assert.ok(get(id).groupedUnder);
 const subs=w.HOTEL_PREMIER_SUB_CATEGORIES;
 assert.ok(subs['tandoor-classics'].find(s=>s.id==='paneer-tikka').dishIds.includes('tc-10'));
 assert.ok(!subs['tandoor-classics'].some(s=>s.dishIds?.includes('tc-1')),'Platter stays at the top level');
 assert.ok(!subs['tandoor-classics'].find(s=>s.id==='veg-kebabs').dishIds.includes('tc-15'));
 assert.equal(get('tc-15').categoryId,'tasty-tidbits');
 for(const id of ['kf-7','kf-8']){assert.equal(get(id).categoryId,'vegetable-specialties');assert.ok(subs['vegetable-specialties'].find(s=>s.id==='kofta-curries').dishIds.includes(id));}
 assert.equal(get('ff-ice-cream-group').categoryId,'mithai-magic');
 for(const d of items){assert.ok(app.categories.some(c=>c.id===d.categoryId),'Every category is reachable: '+d.id);for(const v of d.variants||[])assert.ok(v.price===null||Number.isFinite(v.price),'Explicit variant price: '+d.id+'/'+v.name);}
 for(const id of ['ic-21','ic-13','vs-9','md-13','fd-3','vs-shev-latpat','vs-doodh-shev']){assert.equal(get(id).image,'');for(const d of items)for(const v of d.variants||[])if(v.name===get(id).name)assert.equal(v.image,'','Linked option cannot revive a wrong photo');}
 assert.deepEqual(Array.from(visible.filter(d=>['fa-7','fa-8','fa-6'].includes(d.id)),d=>d.id),['fa-7','fa-8','fa-6'],'Sindhi Papad is the third choice');
 app.currentLang='en';app.renderDishCard=d=>`<article data-test-dish="${d.id}"></article>`;
 for(const cat of app.categories){const ds=visible.filter(d=>d.categoryId===cat.id),html=app.renderOrganizedDishes(cat.id,ds);for(const d of ds)assert.equal(html.split(`data-test-dish="${d.id}"`).length-1,1,'Every visible item renders once: '+d.id);}
 const tandoor=app.renderOrganizedDishes('tandoor-classics',visible.filter(d=>d.categoryId==='tandoor-classics'));assert.ok(tandoor.startsWith('<article data-test-dish="tc-1"'));assert.doesNotMatch(tandoor,/menu-subsection/);
 for(const lang of ['hi','mr']){app.currentLang=lang;assert.ok(app.getMenuCollections().every(c=>/[\u0900-\u097f]/.test(c.name)));}
 console.log('PASS: preserved all existing IDs/prices/descriptions, grouped options, reachability, deduplication, placeholders and multilingual subsection rendering');
})().catch(error=>{console.error(error);process.exitCode=1;});
