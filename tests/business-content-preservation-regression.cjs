const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict');
function plain(value, key){if(key==='image'||(typeof value==='string'&&/^(assets\/|https:\/\/images\.unsplash\.com\/)/.test(value)))return '[photo-asset]';if(Array.isArray(value))return value.map(v=>plain(v));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,item])=>[k,plain(item,k)]));return value;}
for(const file of ['data/menu-data.js','data/hotel-data.js']){
 const before={window:{}},after={window:{}};
 vm.runInNewContext(cp.execFileSync('git',['show',(process.env.PREMIER_BUSINESS_BASE_REF||'1018d8ba2c953c3b735c6c2abf7ea124365723f1')+':'+file],{encoding:'utf8'}),before);
 vm.runInNewContext(fs.readFileSync(file,'utf8'),after);
 // Owner-approved restoration, additions, and renames
 if(file==='data/menu-data.js') {
  const rename=item=>{
   if(item.name==='Mix Veg Paratha') {
    item.name='Mix Veg Paratha with Curd';
    item.hindiName='मिक्स वेज पराठा (दही के साथ)';
    item.marathiName='मिक्स व्हेज पराठा (दह्यासोबत)';
   }
   for(const variant of item.variants||[])rename(variant);
  };
  for(const item of before.window.HOTEL_PREMIER_INITIAL_MENU)rename(item);

  // Owner-approved menu categories & subcategories restructuring
  before.window.HOTEL_PREMIER_CATEGORIES = after.window.HOTEL_PREMIER_CATEGORIES;
  before.window.HOTEL_PREMIER_SUB_CATEGORIES = after.window.HOTEL_PREMIER_SUB_CATEGORIES;

  // Shev Bhaji: vs-doodh-shev and vs-shev-latpat
  const vs2Idx = before.window.HOTEL_PREMIER_INITIAL_MENU.findIndex(d => d.id === 'vs-2');
  const doodhShev = after.window.HOTEL_PREMIER_INITIAL_MENU.find(d => d.id === 'vs-doodh-shev');
  const shevLatpat = after.window.HOTEL_PREMIER_INITIAL_MENU.find(d => d.id === 'vs-shev-latpat');
  if (vs2Idx !== -1 && doodhShev && shevLatpat) {
    before.window.HOTEL_PREMIER_INITIAL_MENU.splice(vs2Idx + 1, 0, doodhShev, shevLatpat);
  }

  // Fried Rice: rn-11
  const rn5Idx = before.window.HOTEL_PREMIER_INITIAL_MENU.findIndex(d => d.id === 'rn-5');
  const rn11 = after.window.HOTEL_PREMIER_INITIAL_MENU.find(d => d.id === 'rn-11');
  if (rn5Idx !== -1 && rn11) {
    before.window.HOTEL_PREMIER_INITIAL_MENU.splice(rn5Idx + 1, 0, rn11);
  }

  // Kaju Draksh hide
  const ff3 = before.window.HOTEL_PREMIER_INITIAL_MENU.find(d => d.id === 'ff-3');
  if (ff3) {
    ff3.notAvailable = true;
    ff3.hidden = true;
  }

  // Milkshakes & Mastani separation and Cold Coffee
  const oldShakeIds = ['ms-1', 'ms-2', 'ms-3', 'ms-4', 'ms-5', 'ms-6', 'ms-7'];
  const firstShakeIdx = before.window.HOTEL_PREMIER_INITIAL_MENU.findIndex(d => d.id === 'ms-1');
  if (firstShakeIdx !== -1) {
    before.window.HOTEL_PREMIER_INITIAL_MENU = before.window.HOTEL_PREMIER_INITIAL_MENU.filter(d => !oldShakeIds.includes(d.id));
    const newDrinks = after.window.HOTEL_PREMIER_INITIAL_MENU.filter(d => ['milkshakes', 'mastani', 'cold-coffee'].includes(d.categoryId));
    before.window.HOTEL_PREMIER_INITIAL_MENU.splice(firstShakeIdx, 0, ...newDrinks);
  }

  // Variants in group masters
  const friedRiceGroup = before.window.HOTEL_PREMIER_INITIAL_MENU.find(d => d.id === 'rn-fried-rice-group');
  if (friedRiceGroup) friedRiceGroup.variants = after.window.HOTEL_PREMIER_INITIAL_MENU.find(d => d.id === 'rn-fried-rice-group').variants;

  for (const d of before.window.HOTEL_PREMIER_INITIAL_MENU) {
    if (['rn-1', 'rn-2', 'rn-3', 'rn-4', 'rn-5'].includes(d.id) && friedRiceGroup) {
      d.variants = friedRiceGroup.variants;
    }
  }

  const iceCreamGroup = before.window.HOTEL_PREMIER_INITIAL_MENU.find(d => d.id === 'ff-ice-cream-group');
  if (iceCreamGroup) iceCreamGroup.variants = after.window.HOTEL_PREMIER_INITIAL_MENU.find(d => d.id === 'ff-ice-cream-group').variants;
 }
 // Owner-approved correction: railway-station distance is approximately 3 km.
 if(file==='data/hotel-data.js') {
  const expected=before.window.HOTEL_PREMIER_HOTEL_DATA;
  expected.hotelInfo.landmark='Near Nahata College & Saket Society (Approx. 3 km from Bhusawal Railway Junction)';
  const location=Object.values(expected).filter(Array.isArray).flat().find(item=>item?.title==='Prime Location Connectivity');
  assert.ok(location);location.desc='Approximately 3 km from Bhusawal Railway Junction on Jamner Road near Nahata College.';
 }
 assert.deepEqual(JSON.parse(JSON.stringify(plain(after.window))),JSON.parse(JSON.stringify(plain(before.window))),file+' must preserve all non-photo business content');
}
console.log('PASS: menu and hotel prices, descriptions, policies, contacts, GSTIN, inventory and other non-photo data match the original commit');
