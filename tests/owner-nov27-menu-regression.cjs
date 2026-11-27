const assert=require('node:assert/strict'),{loadMenu}=require('../tools/menu-runtime.cjs');
(async()=>{
 const {app}=await loadMenu(undefined,'tests/fixtures/menu-release-22.114.js');const find=id=>app.menuData.find(d=>d.id===id);
 for(const id of ['mc-5','mm-2','ms-2','mm-7'])assert.ok(!find(id),'Removed item is absent from the menu and Admin catalogue');
 const ice=find('ff-ice-cream-group');assert.equal(ice.variants.length,5);
 for(const v of ice.variants){const expected=/Vanilla/.test(v.name)?[40,65]:[50,80];assert.deepEqual(Array.from(v.portionOptions,p=>p.price),expected);assert.deepEqual(Array.from(v.portionOptions,p=>p.name),['1 Scoop','2 Scoops']);assert.equal(app.getSelectedDishPortion(ice,v).price,expected[0]);app.detailPortionSelections=new Map([[ice.id+'::'+(v.id||v.name),1]]);assert.equal(app.getSelectedDishPortion(ice,v).price,expected[1]);app.detailPortionSelections.clear();}
 const sweets=find('mm-traditional-group');for(const v of sweets.variants)assert.deepEqual(Array.from(v.portionOptions,p=>p.price),v.id==='mm-3'?[30,55]:[35,60]);
 for(const id of ['tc-5','kf-1','ps-3']){const child=find(id);assert.ok(child.tags.includes('sweet'));const parent=find(child.groupedUnder);assert.ok(parent.variants.find(v=>v.id===id||v.name===child.name).tags.includes('sweet'));}
 assert.equal(find('tt-chana-roast-group').variants.find(v=>v.id==='tt-chana-koliwada').price,170);assert.equal(find('rb-8').variants.find(v=>v.id==='rb-butter-khichadi').price,250);assert.equal(find('rb-8').variants.find(v=>v.id==='rb-butter-khichadi-tadka').price,255);
 assert.match(find('rb-8').variants.find(v=>v.id==='rb-butter-khichadi').image,/published-3f26b9e31df894bdb7cf590a/,'Uploaded butter khichadi photo retained');
 console.log('PASS: reviewed owner edits/photos, removed dishes, Sweet tags and all confirmed scoop/piece prices');
})().catch(error=>{console.error(error);process.exitCode=1;});
