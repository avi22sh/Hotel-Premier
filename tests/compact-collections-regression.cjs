const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {loadMenu}=require('../tools/menu-runtime.cjs');
(async()=>{
 const {app,window:w}=await loadMenu(),get=id=>app.menuData.find(d=>d.id===id),visible=app.getVisibleMenuItems();
 for(const [cat,count]of [['tandoor-classics',3],['vegetable-specialties',5],['paneer-specialties',3],['mithai-magic',3]])assert.equal(visible.filter(d=>d.categoryId===cat).length,count,cat+' is compact');
 assert.equal(get('vs-15').groupedUnder,'kd-kofta-group');
 assert.equal(get('kd-kofta-group').variants.filter(v=>v.id==='vs-15').length,1);
 assert.ok(!get('vs-royal-gravies-group').variants.some(v=>v.id==='vs-15'));
 assert.ok(w.HOTEL_PREMIER_SUB_CATEGORIES['vegetable-specialties'].find(s=>s.id==='kofta-curries').dishIds.includes('vs-15'));
 for(const id of ['mc-5','mm-2'])assert.ok(!visible.some(d=>d.id===id),'Removed guest item '+id);
 const fries=get('tt-4');assert.equal(fries.name,'French Fries');assert.ok(!fries.groupedUnder);assert.deepEqual(Array.from(fries.variants,v=>v.price),[140,150]);assert.deepEqual(Array.from(fries.variants,v=>v.name),['French Fries Salted','French Fries Masala']);
 assert.ok(!get('upvas-fasting-group').variants.some(v=>/French Fries|Finger Chips/.test(v.name)),'Fries appear in a single guest card');
 assert.ok(get('tc-paneer-tikka-group').variants.some(v=>v.id==='tc-10'&&v.price===425));
 for(const id of ['tc-11','tc-15','tc-18']){assert.equal(get(id).categoryId,'tasty-tidbits');assert.equal(get(id).groupedUnder,'tt-fried-veg-group');}
 for(const id of ['tc-12','tc-13','tc-14','tc-16','tc-17'])assert.equal(get(id).groupedUnder,'tc-veg-starters-group');
 assert.equal(get('tc-9').categoryId,'tasty-tidbits');assert.ok(!get('tc-1').groupedUnder);
 for(const id of ['kf-7','kf-8'])assert.ok(get('kd-kofta-group').variants.some(v=>v.id===id));
 assert.equal(app.getMenuCollections().length,14);
 assert.ok(!app.getMenuCollections().some(c=>/Chilli|Butter|Kofte|Kofta/.test(c.name)),'Collections list high-level destinations only');
 app.categories.push({id:'owner-new',name:'Owner collection'});app.menuData.push({id:'owner-dish',categoryId:'owner-new',name:'Owner dish'});assert.ok(app.getMenuCollections().some(c=>c.id==='owner-new'),'New Admin collections remain reachable');
 // Test navigation against a locked-body release, sticky bars and a prior filtered search.
 let queued=[],scrolled=[],released=false,rendered=0,reduced=false;
 const fields={'menu-search-input':{value:'old search'},'clear-search-btn':{style:{}},'section-paneer-specialties':{getBoundingClientRect(){assert.ok(released);return {top:700};}},'menu-items-grid':{getBoundingClientRect:()=>({top:300})}};
 const c={console,clearTimeout(){},setTimeout:fn=>(queued.push(fn),queued.length),window:{pageYOffset:200,HotelOverlays:{sync(){released=true;}},matchMedia:()=>({matches:reduced}),scrollTo:options=>scrolled.push(options)},document:{readyState:'loading',addEventListener(){},getElementById:id=>fields[id]||null,querySelector:s=>({getBoundingClientRect:()=>({height:s==='.app-header'?100:70})})}};
 vm.runInNewContext(fs.readFileSync('app.js','utf8')+';window.App=HotelPremierApp;',c);
 const nav=Object.create(c.window.App.prototype);Object.assign(nav,{activeSection:'section-dine',currentCategory:'old-category',currentFilter:'under-150',searchQuery:'old search',isFavoritesFilterActive:true,menuData:[{id:'a'},{id:'b'}],closeMenuSectionDrawer(options){assert.equal(options.restoreFocus,false);},clearMenuFavoritesScope(){this.isFavoritesFilterActive=false;},renderQuickFilters(){},renderCategories(){},renderSectionSlideshow(){},renderMenu(){rendered++;}});
 nav.openCategorySection=()=>{throw Error('Collection navigation must never filter to a category');};nav.showAllDishesView=()=>{throw Error('Do not trigger a second competing page scroll');};
 nav.selectCategoryFromDrawer('paneer-specialties');assert.equal(nav.currentCategory,'all');assert.equal(nav.viewMode,'all');assert.equal(nav.searchQuery,'');assert.equal(nav.isFavoritesFilterActive,false);assert.equal(nav.menuData.length,2);assert.equal(rendered,1);queued.shift()();assert.equal(scrolled[0].top,714);assert.equal(scrolled[0].behavior,'smooth');
 reduced=true;nav.selectCategoryFromDrawer('paneer-specialties');queued.shift()();assert.equal(scrolled[1].behavior,'auto');
 const html=fs.readFileSync('index.html','utf8');assert.ok(!html.includes('id="drawer-quick-filter-chips"'));assert.ok(!html.includes('id="drawer-sections-search"'));
 const css=fs.readFileSync('theme-tokens.css','utf8');assert.match(css,/#menu-items-grid\s*>\s*\.category-section\s*\{[^}]*content-visibility:visible/,'Section navigation must measure real content, not off-screen placeholder heights');
 console.log('PASS: compact option families, salted/masala fries, preparation-based starters, short Collections, full-menu scrolling, sticky offsets and reduced motion');
})().catch(error=>{console.error(error);process.exitCode=1;});
