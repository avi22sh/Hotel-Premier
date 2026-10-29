const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const c={window:{},console,document:{readyState:'loading',addEventListener(){}},localStorage:{getItem:()=>null,setItem(){throw Error('Publication load must not write local edits');}}};vm.createContext(c);
for(const file of ['data/menu-data.js','data/menu-photos.js','data/published-overrides.js','menu-structure.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8')+(file==='app.js'?';window.App=HotelPremierApp;':''),c);
(async()=>{
 const o=c.window.HOTEL_PREMIER_PUBLISHED_OVERRIDES;assert.deepEqual(Object.keys(o).sort(),['dishes','editorial','layout','roomGalleries','sectionSlides','version'].sort());
 assert.doesNotMatch(JSON.stringify(o),/blob:|data:image|pinHash|guestRecords|cloudAiApiKey|_activeVariant/);
 const photos=[...new Set(JSON.stringify(o).match(/assets\/menu-uploads\/published-[a-f0-9]{24}\.webp/g)||[])];assert.ok(photos.length>0);
 for(const path of photos){assert.ok(fs.existsSync(path),path);assert.ok(path.includes(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex').slice(0,24)));}
 const app=Object.create(c.window.App.prototype);await app.loadMenuData();
 const deleted=Object.entries(o.layout.items).filter(([,p])=>p._deleted).map(([id])=>id);
 for(const id of deleted){assert.ok(!app.menuData.some(d=>d.id===id));const original=c.window.HOTEL_PREMIER_INITIAL_MENU.find(d=>d.id===id);if(original?.groupedUnder){const group=app.menuData.find(d=>d.id===original.groupedUnder);assert.ok(!group?.variants?.some(v=>v.name===original.name),'Deleted child must not survive as an ordering option');}}
 for(const child of app.menuData.filter(d=>d.groupedUnder&&d.image?.includes('/published-'))){const group=app.menuData.find(d=>d.id===child.groupedUnder);const v=group?.variants?.find(v=>v.name===child.name);if(v)assert.equal(v.image,child.image,'Grouped options must use the saved child photo');}
 for(const d of app.menuData.filter(d=>d.categoryId==='frozen-fantasies')){assert.doesNotMatch(d.image||'',/finger-chips|soup|dal-tadka/);for(const v of d.variants||[])assert.doesNotMatch(v.image||'',/finger-chips|soup|dal-tadka/);}
 console.log('PASS: clean guest loads owner photos, digest assets, grouped-image sync, deleted options and public-only publication');
})().catch(e=>{console.error(e);process.exitCode=1;});
